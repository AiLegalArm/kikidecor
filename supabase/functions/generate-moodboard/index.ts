/**
 * generate-moodboard/index.ts
 *
 * Dedicated moodboard image generation for KiKi Decor.
 * Generates 4-6 moodboard images from text description + optional venue photo.
 *
 * Models:
 *   Text  → gemini-2.5-flash  (prompt enrichment)
 *   Image → gemini-2.0-flash-preview-image-generation
 *
 * Input:
 *   { theme, style, colorPalette, eventType, venuePhotoUrl?, imageCount? }
 *
 * Output:
 *   { images: string[], prompts: string[], count: number }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
    CORS_HEADERS,
    requireApiKey,
    getTextModel,
    IMAGE_GEN_MODEL,
    geminiChat,
    geminiNative,
    fetchImageAsBase64,
    extractToolCall,
    extractNativeImage,
    okResponse,
    handleError,
    GeminiError,
    errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

    try {
        // ── 1. Parse ───────────────────────────────────────────────────────────
        let body: any;
        try { body = await req.json(); }
        catch { return errorResponse("INVALID_INPUT", "Invalid JSON body", 400); }

        const {
            theme,
            style = "Elegant luxury",
            colorPalette = "white, gold, blush",
            eventType = "event",
            venuePhotoUrl,
            imageCount = 4,
        } = body;

        if (!theme) return errorResponse("INVALID_INPUT", "theme is required", 400);

        const count = Math.min(Math.max(Number(imageCount) || 4, 1), 6);
        const GEMINI_API_KEY = requireApiKey();
        const textModel = getTextModel();

        console.log(`[generate-moodboard] theme="${theme}" | count=${count} | text=${textModel} | img=${IMAGE_GEN_MODEL}`);

        // ── 2. Optional: fetch venue photo ─────────────────────────────────────
        let venueImgBase64: string | null = null;
        let venueImgMime = "image/jpeg";
        if (venuePhotoUrl) {
            try {
                const img = await fetchImageAsBase64(venuePhotoUrl);
                venueImgBase64 = img.data;
                venueImgMime = img.mimeType;
                console.log("[generate-moodboard] Venue photo loaded");
            } catch (e) {
                console.warn("[generate-moodboard] Could not load venue photo:", e);
            }
        }

        // ── 3. Generate image prompts with gemini-2.5-flash ────────────────────
        const systemPrompt = `You are a luxury event design director. Generate exactly ${count} specific, vivid image generation prompts for a moodboard.

Each prompt must describe ONE specific decoration detail or scene element for:
- Theme: "${theme}"
- Style: ${style}
- Event: ${eventType}
- Colors: ${colorPalette}
${venueImgBase64 ? "- A venue photo is attached — tailor prompts to work in this specific space" : ""}

Rules:
- Each prompt: 2-4 sentences, English only
- Focus on: textures, materials, lighting, arrangement, atmosphere
- Style: "professional event decoration photography, editorial, luxury, photorealistic"
- No people, no text, no watermarks
- Vary the subjects: florals, table setting, lighting, backdrop, entrance, ceiling, details`;

        const userMsg: any[] = [
            { type: "text", text: `Generate ${count} moodboard image prompts for the decoration concept.` },
        ];
        if (venueImgBase64) {
            userMsg.push({ type: "image_url", image_url: { url: `data:${venueImgMime};base64,${venueImgBase64}` } });
        }

        const chatData = await geminiChat({
            apiKey: GEMINI_API_KEY,
            model: textModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMsg },
            ],
            tools: [{
                type: "function",
                function: {
                    name: "generate_prompts",
                    description: "Return moodboard image prompts",
                    parameters: {
                        type: "object",
                        properties: {
                            prompts: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        label: { type: "string", description: "Short label like 'Table centerpiece', 'Floral arch', etc." },
                                        prompt: { type: "string", description: "Full image generation prompt" },
                                    },
                                    required: ["label", "prompt"],
                                },
                                description: `Exactly ${count} prompts`,
                            },
                        },
                        required: ["prompts"],
                    },
                },
            }],
            tool_choice: { type: "function", function: { name: "generate_prompts" } },
            timeoutMs: 25_000,
        });

        const parsed = extractToolCall<{ prompts: { label: string; prompt: string }[] }>(chatData);
        if (!parsed?.prompts?.length) {
            throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not generate moodboard prompts");
        }

        const promptList = parsed.prompts.slice(0, count);
        console.log(`[generate-moodboard] ${promptList.length} prompts ready — generating images...`);

        // ── 4. Generate images in parallel ─────────────────────────────────────
        const imagePromises = promptList.map(async ({ label, prompt }, idx) => {
            try {
                const parts: any[] = [{ text: prompt }];

                // First image: inject venue photo as visual context if available
                if (idx === 0 && venueImgBase64) {
                    parts.push({ inlineData: { mimeType: venueImgMime, data: venueImgBase64 } });
                }

                const data = await geminiNative({
                    apiKey: GEMINI_API_KEY,
                    model: IMAGE_GEN_MODEL,
                    parts,
                    generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
                    timeoutMs: 50_000,
                });

                const img = extractNativeImage(data);
                if (!img) { console.warn(`[generate-moodboard] No image for "${label}"`); return null; }
                return {
                    label,
                    url: `data:${img.mimeType};base64,${img.data}`,
                };
            } catch (e) {
                console.warn(`[generate-moodboard] Image ${idx} (${label}) failed:`, e instanceof Error ? e.message : e);
                return null;
            }
        });

        const results = (await Promise.all(imagePromises)).filter(Boolean) as { label: string; url: string }[];

        console.log(`[generate-moodboard] ✅ ${results.length}/${promptList.length} images generated`);
        return okResponse({
            images: results.map(r => r!.url),
            labels: results.map(r => r!.label),
            prompts: promptList.map(p => p.prompt),
            count: results.length,
            model: IMAGE_GEN_MODEL,
            textModel,
        });

    } catch (e) {
        return handleError("generate-moodboard", e);
    }
});
