/**
 * _shared/gemini.ts  (v2)
 * Centralized Gemini AI service layer for KiKi Edge Functions.
 *
 * Model strategy:
 *   GEMINI_MODEL env  → used for text/analysis/tool_calls (default: gemini-2.5-flash)
 *   IMAGE_GEN_MODEL   → used for image generation        (gemini-2.0-flash-preview-image-generation)
 *
 * Notes:
 *   - gemini-2.5-flash supports: text generation, tool calls, multimodal vision (image input)
 *   - gemini-2.5-flash does NOT support image output (responseModalities IMAGE)
 *   - Only gemini-2.0-flash-preview-image-generation supports image output via native API
 *   - All functions use gemini-2.5-flash for thinking/analysis; image gen uses preview model
 */

// ─── Model constants ─────────────────────────────────────────────────────────

/** Read GEMINI_MODEL env or fall back to gemini-2.5-flash */
export function getTextModel(): string {
    return Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
}

/** Model that supports image output (responseModalities IMAGE) */
export const IMAGE_GEN_MODEL = "gemini-2.0-flash-preview-image-generation";

// ─── CORS ────────────────────────────────────────────────────────────────────

export const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Error codes ─────────────────────────────────────────────────────────────

export type GeminiErrorCode =
    | "MISSING_API_KEY"
    | "INVALID_INPUT"
    | "INVALID_IMAGE"
    | "TIMEOUT"
    | "RATE_LIMIT"
    | "PAYMENT_REQUIRED"
    | "INVALID_MODEL_RESPONSE"
    | "PROVIDER_REQUEST_FAILED"
    | "JSON_PARSE_FAILED";

export class GeminiError extends Error {
    constructor(public code: GeminiErrorCode, message: string) {
        super(message);
        this.name = "GeminiError";
    }
}

// ─── JSON helpers ────────────────────────────────────────────────────────────

/** Strip markdown fences and parse JSON safely. Returns null on failure. */
export function safeParseJson<T = any>(raw: string): T | null {
    try {
        const cleaned = raw
            .replace(/^```json\s*/gm, "")
            .replace(/^```\s*/gm, "")
            .trim();
        return JSON.parse(cleaned) as T;
    } catch {
        return null;
    }
}

/** Extract structured result from OpenAI-compatible tool_call response. */
export function extractToolCall<T = any>(data: any): T | null {
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
        return safeParseJson<T>(toolCall.function.arguments);
    }
    const content = data?.choices?.[0]?.message?.content;
    if (content) return safeParseJson<T>(content);
    return null;
}

/** Parse Google native Gemini text response from candidates. */
export function extractNativeText(data: any): string | null {
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find((p: any) => typeof p.text === "string");
    return textPart?.text ?? null;
}

/** Parse Google native Gemini inline image from candidates. */
export function extractNativeImage(data: any): { data: string; mimeType: string } | null {
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
    return imgPart?.inlineData ?? null;
}

// ─── Network ─────────────────────────────────────────────────────────────────

/** Fetch with AbortController timeout. */
export function fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs = 25_000
): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...init, signal: controller.signal }).finally(() =>
        clearTimeout(timer)
    );
}

// ─── Response helpers ─────────────────────────────────────────────────────────

export function errorResponse(code: GeminiErrorCode, message: string, status = 500): Response {
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

// ─── geminiChat — OpenAI-compat endpoint ─────────────────────────────────────
// Use for: text generation, tool calls, image ANALYSIS (vision input)
// Models: gemini-2.5-flash, gemini-2.0-flash, etc.

export interface GeminiChatOptions {
    apiKey: string;
    model?: string;       // defaults to getTextModel() = gemini-2.5-flash
    messages: any[];
    tools?: any[];
    tool_choice?: any;
    timeoutMs?: number;
}

export async function geminiChat(opts: GeminiChatOptions): Promise<any> {
    const model = opts.model ?? getTextModel();
    console.log(`[gemini:chat] model=${model} msgs=${opts.messages.length}`);

    let response: Response;
    try {
        response = await fetchWithTimeout(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
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
            opts.timeoutMs ?? 30_000
        );
    } catch (e: any) {
        if (e?.name === "AbortError") throw new GeminiError("TIMEOUT", "AI request timed out (30s)");
        throw new GeminiError("PROVIDER_REQUEST_FAILED", "Failed to reach Gemini API");
    }

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(`[gemini:chat] HTTP ${response.status}:`, body.slice(0, 300));
        if (response.status === 429) throw new GeminiError("RATE_LIMIT", "Rate limit exceeded.");
        if (response.status === 402) throw new GeminiError("PAYMENT_REQUIRED", "Gemini API payment required.");
        if (response.status === 400) throw new GeminiError("INVALID_INPUT", `Bad request: ${body.slice(0, 150)}`);
        throw new GeminiError("PROVIDER_REQUEST_FAILED", `Gemini API error ${response.status}`);
    }

    const data = await response.json();
    console.log(`[gemini:chat] ✅ OK | model=${model}`);
    return data;
}

// ─── geminiNative — Native generateContent endpoint ───────────────────────────
// Use for: IMAGE GENERATION (responseModalities IMAGE)
// Model must be: gemini-2.0-flash-preview-image-generation

export interface GeminiNativeOptions {
    apiKey: string;
    model: string;
    parts: any[];
    generationConfig?: any;
    timeoutMs?: number;
}

export async function geminiNative(opts: GeminiNativeOptions): Promise<any> {
    console.log(`[gemini:native] model=${opts.model}`);

    let response: Response;
    try {
        response = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${opts.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: opts.parts }],
                    ...(opts.generationConfig ? { generationConfig: opts.generationConfig } : {}),
                }),
            },
            opts.timeoutMs ?? 40_000
        );
    } catch (e: any) {
        if (e?.name === "AbortError") throw new GeminiError("TIMEOUT", "Native AI request timed out");
        throw new GeminiError("PROVIDER_REQUEST_FAILED", "Failed to reach Gemini native API");
    }

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(`[gemini:native] HTTP ${response.status}:`, body.slice(0, 300));
        if (response.status === 429) throw new GeminiError("RATE_LIMIT", "Rate limit exceeded.");
        if (response.status === 402) throw new GeminiError("PAYMENT_REQUIRED", "Payment required.");
        throw new GeminiError("PROVIDER_REQUEST_FAILED", `Native API error ${response.status}: ${body.slice(0, 100)}`);
    }

    const data = await response.json();
    console.log(`[gemini:native] ✅ OK | model=${opts.model}`);
    return data;
}

// ─── geminiAnalyzeImage — Vision analysis via native endpoint ────────────────
// Use gemini-2.5-flash to analyze uploaded image (inlineData)

export interface GeminiAnalyzeImageOptions {
    apiKey: string;
    imageBase64: string;
    imageMimeType: string;
    textPrompt: string;
    timeoutMs?: number;
}

export async function geminiAnalyzeImage(opts: GeminiAnalyzeImageOptions): Promise<string> {
    const model = getTextModel(); // gemini-2.5-flash
    console.log(`[gemini:analyze-image] model=${model}`);

    const data = await geminiNative({
        apiKey: opts.apiKey,
        model,
        parts: [
            { text: opts.textPrompt },
            { inlineData: { mimeType: opts.imageMimeType, data: opts.imageBase64 } },
        ],
        generationConfig: { responseModalities: ["TEXT"] },
        timeoutMs: opts.timeoutMs ?? 30_000,
    });

    const text = extractNativeText(data);
    if (!text) throw new GeminiError("INVALID_MODEL_RESPONSE", "No text in image analysis response");
    return text;
}

// ─── geminiGenerateImage — Text-to-image via native endpoint ─────────────────
// ONLY gemini-2.0-flash-preview-image-generation supports IMAGE output

export interface GeminiGenerateImageOptions {
    apiKey: string;
    prompt: string;
    contextImageBase64?: string;
    contextImageMimeType?: string;
    timeoutMs?: number;
}

export async function geminiGenerateImage(opts: GeminiGenerateImageOptions): Promise<{ data: string; mimeType: string } | null> {
    console.log(`[gemini:generate-image] model=${IMAGE_GEN_MODEL} | prompt="${opts.prompt.slice(0, 60)}..."`);

    const parts: any[] = [{ text: opts.prompt }];
    if (opts.contextImageBase64 && opts.contextImageMimeType) {
        parts.push({ inlineData: { mimeType: opts.contextImageMimeType, data: opts.contextImageBase64 } });
    }

    try {
        const data = await geminiNative({
            apiKey: opts.apiKey,
            model: IMAGE_GEN_MODEL,
            parts,
            generationConfig: {
                responseModalities: ["IMAGE", "TEXT"],
            },
            timeoutMs: opts.timeoutMs ?? 40_000,
        });

        const image = extractNativeImage(data);
        if (!image) {
            console.warn("[gemini:generate-image] No image in response — model may not support this prompt");
            return null;
        }
        return image;
    } catch (e) {
        // Image generation can fail non-critically (content policy etc) — return null
        console.warn("[gemini:generate-image] Failed (non-critical):", e instanceof Error ? e.message : String(e));
        return null;
    }
}

// ─── Image fetch utility ─────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
    console.log("[gemini] Fetching image:", url.slice(0, 60));
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
    if (buffer.byteLength > MAX_IMAGE_BYTES) throw new GeminiError("INVALID_IMAGE", "Image exceeds 10 MB limit");

    const bytes = new Uint8Array(buffer);
    const CHUNK = 8192;
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    console.log(`[gemini] Image encoded | ${buffer.byteLength} bytes | ${mimeType}`);
    return { data: btoa(binary), mimeType };
}

// ─── API key ─────────────────────────────────────────────────────────────────

export function requireApiKey(): string {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) {
        console.error("[gemini] GEMINI_API_KEY not set in Supabase secrets");
        throw new GeminiError("MISSING_API_KEY", "AI service is not configured");
    }
    return key;
}

// ─── Error handler ────────────────────────────────────────────────────────────

export function handleError(fn: string, e: unknown): Response {
    console.error(`[${fn}] Error:`, e instanceof Error ? e.message : String(e));

    if (e instanceof GeminiError) {
        const statusMap: Record<GeminiErrorCode, number> = {
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
