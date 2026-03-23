/**
 * _shared/gemini.ts  (v3 — Lovable AI Gateway)
 *
 * Multi-model AI service layer for KiKi Edge Functions.
 * All calls routed through Lovable AI Gateway.
 *
 * Model strategy:
 *   REASONING   → google/gemini-2.5-pro          (complex styling, venue analysis)
 *   FAST        → google/gemini-3-flash-preview   (search, outfit gen, quick tasks)
 *   IMAGE_GEN   → google/gemini-2.5-flash-image   (image generation, try-on)
 *   VISION      → google/gemini-2.5-flash         (vision analysis, cost-effective)
 */

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const AI_MODELS = {
  REASONING: "google/gemini-3.1-pro-preview",
  FAST: "google/gemini-3-flash-preview",
  IMAGE_GEN: "google/gemini-3.1-flash-image-preview",
  VISION: "google/gemini-2.5-flash",
} as const;

// ─── CORS ────────────────────────────────────────────────────────────────────

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Error handling ──────────────────────────────────────────────────────────

export type AIErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_INPUT"
  | "INVALID_IMAGE"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "PAYMENT_REQUIRED"
  | "INVALID_MODEL_RESPONSE"
  | "PROVIDER_REQUEST_FAILED"
  | "JSON_PARSE_FAILED";

/** @deprecated Use AIErrorCode. Kept for backward compatibility. */
export type GeminiErrorCode = AIErrorCode;

export class GeminiError extends Error {
  constructor(public code: AIErrorCode, message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

// ─── API key ─────────────────────────────────────────────────────────────────

export function requireApiKey(): string {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    console.error("[ai] LOVABLE_API_KEY not set");
    throw new GeminiError("MISSING_API_KEY", "AI service is not configured");
  }
  return key;
}

// ─── JSON helpers ────────────────────────────────────────────────────────────

export function safeParseJson<T = any>(raw: string): T | null {
  try {
    return JSON.parse(
      raw.replace(/^```json\s*/gm, "").replace(/^```\s*/gm, "").trim()
    ) as T;
  } catch {
    return null;
  }
}

export function extractToolCall<T = any>(data: any): T | null {
  const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) return safeParseJson<T>(toolCall.function.arguments);
  const content = data?.choices?.[0]?.message?.content;
  if (content) return safeParseJson<T>(content);
  return null;
}

/** Extract first image from Lovable Gateway image generation response */
export function extractGatewayImage(data: any): string | null {
  const images = data?.choices?.[0]?.message?.images;
  if (images?.[0]?.image_url?.url) return images[0].image_url.url;
  return null;
}

/** Parse base64 data and mimeType from a data URI */
export function parseDataUri(dataUri: string): { data: string; mimeType: string } | null {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

// ─── Network ─────────────────────────────────────────────────────────────────

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 30_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ─── Retry logic ─────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      const nonRetryable = e instanceof GeminiError &&
        ["INVALID_INPUT", "MISSING_API_KEY", "PAYMENT_REQUIRED", "INVALID_IMAGE"].includes(e.code);
      if (nonRetryable) throw e;
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        console.warn(`[ai:retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${Math.round(delay)}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// ─── Response helpers ────────────────────────────────────────────────────────

export function errorResponse(code: AIErrorCode, message: string, status = 500): Response {
  return new Response(
    JSON.stringify({ success: false, error: code, message }),
    { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

export function okResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// ─── aiChat — text/tool_call/vision via Lovable Gateway ──────────────────────

export interface AIChatOptions {
  apiKey: string;
  model?: string;
  messages: any[];
  tools?: any[];
  tool_choice?: any;
  timeoutMs?: number;
  maxRetries?: number;
}

export async function aiChat(opts: AIChatOptions): Promise<any> {
  const model = opts.model ?? AI_MODELS.FAST;
  console.log(`[ai:chat] model=${model} msgs=${opts.messages.length}`);

  return withRetry(async () => {
    let response: Response;
    try {
      response = await fetchWithTimeout(
        LOVABLE_GATEWAY,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${opts.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: opts.messages,
            ...(opts.tools ? { tools: opts.tools } : {}),
            ...(opts.tool_choice ? { tool_choice: opts.tool_choice } : {}),
          }),
        },
        opts.timeoutMs ?? 45_000
      );
    } catch (e: any) {
      if (e?.name === "AbortError") throw new GeminiError("TIMEOUT", "AI request timed out");
      throw new GeminiError("PROVIDER_REQUEST_FAILED", `Gateway unreachable: ${e?.message}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[ai:chat] HTTP ${response.status}:`, body.slice(0, 300));
      if (response.status === 429) throw new GeminiError("RATE_LIMIT", "Rate limit exceeded. Try again later.");
      if (response.status === 402) throw new GeminiError("PAYMENT_REQUIRED", "AI credits exhausted.");
      throw new GeminiError("PROVIDER_REQUEST_FAILED", `AI gateway error ${response.status}`);
    }

    const data = await response.json();
    console.log(`[ai:chat] ✅ model=${model}`);
    return data;
  }, opts.maxRetries ?? 2);
}

// ─── aiImageGen — image generation via Lovable Gateway ───────────────────────

export interface AIImageGenOptions {
  apiKey: string;
  messages: any[];
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export async function aiImageGen(opts: AIImageGenOptions): Promise<any> {
  const model = opts.model ?? AI_MODELS.IMAGE_GEN;
  console.log(`[ai:image-gen] model=${model}`);

  return withRetry(async () => {
    let response: Response;
    try {
      response = await fetchWithTimeout(
        LOVABLE_GATEWAY,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${opts.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: opts.messages,
            modalities: ["image", "text"],
          }),
        },
        opts.timeoutMs ?? 60_000
      );
    } catch (e: any) {
      if (e?.name === "AbortError") throw new GeminiError("TIMEOUT", "Image generation timed out");
      throw new GeminiError("PROVIDER_REQUEST_FAILED", `Gateway unreachable: ${e?.message}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[ai:image-gen] HTTP ${response.status}:`, body.slice(0, 300));
      if (response.status === 429) throw new GeminiError("RATE_LIMIT", "Rate limit exceeded");
      if (response.status === 402) throw new GeminiError("PAYMENT_REQUIRED", "AI credits exhausted");
      throw new GeminiError("PROVIDER_REQUEST_FAILED", `Image gen error ${response.status}`);
    }

    return await response.json();
  }, opts.maxRetries ?? 1);
}

// ─── Convenience: generate a single image from prompt ────────────────────────

export async function aiGenerateImage(opts: {
  apiKey: string;
  prompt: string;
  contextImageUrl?: string;
  timeoutMs?: number;
}): Promise<string | null> {
  const content: any[] = [{ type: "text", text: opts.prompt }];
  if (opts.contextImageUrl) {
    content.push({ type: "image_url", image_url: { url: opts.contextImageUrl } });
  }

  try {
    const data = await aiImageGen({
      apiKey: opts.apiKey,
      messages: [{ role: "user", content }],
      timeoutMs: opts.timeoutMs ?? 50_000,
    });
    return extractGatewayImage(data);
  } catch (e) {
    console.warn("[ai:generate-image] Failed:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

// ─── Image fetch utility ─────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  console.log("[ai] Fetching image:", url.slice(0, 60));
  let resp: Response;
  try {
    resp = await fetchWithTimeout(url, {}, 15_000);
  } catch (e: any) {
    throw new GeminiError("INVALID_IMAGE", `Cannot fetch image: ${e?.message}`);
  }

  if (!resp.ok) throw new GeminiError("INVALID_IMAGE", `Image fetch failed: HTTP ${resp.status}`);

  const contentType = resp.headers.get("content-type")?.split(";")[0]?.trim() ?? "image/jpeg";
  const mimeType = ALLOWED_MIME_TYPES.includes(contentType) ? contentType : "image/jpeg";

  const buffer = await resp.arrayBuffer();
  if (buffer.byteLength > MAX_IMAGE_BYTES) throw new GeminiError("INVALID_IMAGE", "Image exceeds 10 MB");

  const bytes = new Uint8Array(buffer);
  const CHUNK = 8192;
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return { data: btoa(binary), mimeType };
}

// ─── Error handler ───────────────────────────────────────────────────────────

export function handleError(fn: string, e: unknown): Response {
  console.error(`[${fn}] Error:`, e instanceof Error ? e.message : String(e));

  if (e instanceof GeminiError) {
    const statusMap: Record<AIErrorCode, number> = {
      MISSING_API_KEY: 503,
      INVALID_INPUT: 400,
      INVALID_IMAGE: 400,
      TIMEOUT: 504,
      RATE_LIMIT: 429,
      PAYMENT_REQUIRED: 402,
      INVALID_MODEL_RESPONSE: 502,
      PROVIDER_REQUEST_FAILED: 502,
      JSON_PARSE_FAILED: 502,
    };
    return errorResponse(e.code, e.message, statusMap[e.code] ?? 500);
  }

  return errorResponse("PROVIDER_REQUEST_FAILED", "An unexpected error occurred. Please try again.", 500);
}

// ─── Backward compatibility aliases ──────────────────────────────────────────
// These map old function names to new ones for any code not yet migrated.

/** @deprecated Use AI_MODELS.VISION */
export function getTextModel(): string { return AI_MODELS.VISION; }
/** @deprecated Use AI_MODELS.IMAGE_GEN */
export const IMAGE_GEN_MODEL = AI_MODELS.IMAGE_GEN;
/** @deprecated Use aiChat */
export const geminiChat = aiChat;
/** @deprecated Use extractGatewayImage */
export function extractNativeImage(data: any) { return null; }
/** @deprecated Use extractGatewayImage + parseDataUri */
export function extractNativeText(data: any): string | null {
  return data?.choices?.[0]?.message?.content ?? null;
}
