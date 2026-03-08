/**
 * Centralized AI Client for KiKi Platform
 * All AI calls go through this service layer.
 */
import { supabase } from "@/integrations/supabase/client";

export interface AIResponse<T> {
  data: T | null;
  error: string | null;
  errorCode?: string;
}

/**
 * Invoke an AI edge function with typed response.
 * Handles error extraction, rate limiting, and payment errors.
 */
export async function invokeAI<T = any>(
  functionName: string,
  body: Record<string, any>
): Promise<AIResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, { body });

    if (error) {
      console.error(`[AI:${functionName}] Invoke error:`, error.message);
      return { data: null, error: error.message, errorCode: "INVOKE_ERROR" };
    }

    // Handle structured error responses from edge functions
    if (data?.success === false || data?.error) {
      const errMsg = data.message || data.error || "Unknown AI error";
      const errCode = data.error || "UNKNOWN";
      console.error(`[AI:${functionName}] Error:`, errCode, errMsg);
      return { data: null, error: errMsg, errorCode: errCode };
    }

    return { data: data as T, error: null };
  } catch (e: any) {
    console.error(`[AI:${functionName}] Exception:`, e);
    return { data: null, error: e?.message || "Network error", errorCode: "NETWORK_ERROR" };
  }
}

/**
 * Check if an AI error is a rate limit error.
 */
export function isRateLimitError(response: AIResponse<any>): boolean {
  return response.errorCode === "RATE_LIMIT";
}

/**
 * Check if an AI error is a payment error.
 */
export function isPaymentError(response: AIResponse<any>): boolean {
  return response.errorCode === "PAYMENT_REQUIRED";
}

/**
 * Get a user-friendly error message.
 */
export function getAIErrorMessage(response: AIResponse<any>, lang: string = "ru"): string {
  const isRu = lang === "ru";
  switch (response.errorCode) {
    case "RATE_LIMIT":
      return isRu ? "Слишком много запросов. Подождите немного." : "Too many requests. Please wait.";
    case "PAYMENT_REQUIRED":
      return isRu ? "AI-сервис временно недоступен." : "AI service temporarily unavailable.";
    case "TIMEOUT":
      return isRu ? "Запрос занял слишком долго. Попробуйте ещё раз." : "Request timed out. Try again.";
    case "INVALID_IMAGE":
      return isRu ? "Не удалось обработать изображение." : "Could not process the image.";
    case "MISSING_API_KEY":
      return isRu ? "AI-сервис не настроен." : "AI service not configured.";
    default:
      return response.error || (isRu ? "Произошла ошибка" : "An error occurred");
  }
}
