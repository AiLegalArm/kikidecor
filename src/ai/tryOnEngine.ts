/**
 * Virtual Try-On Engine
 * AI-powered fashion try-on rendering.
 */
import { invokeAI, type AIResponse } from "./aiClient";

export interface TryOnInput {
  userPhotoUrl: string;
  productImageUrl: string;
  productName?: string;
  lang?: string;
}

export interface TryOnResult {
  resultUrl: string;
}

export async function runTryOn(input: TryOnInput): Promise<AIResponse<TryOnResult>> {
  return invokeAI<TryOnResult>("virtual-tryon", input);
}
