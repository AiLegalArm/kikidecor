/**
 * generate-decor-concept/index.ts  (v3)
 *
 * Flow:
 *   1. gemini-2.5-flash → structured concept via tool_call
 *   2. gemini-2.0-flash-preview-image-generation → 3 inspiration images in parallel
 *      - one per key concept keyword
 *      - if venuePhotoUrl provided → first image uses it as context
 *
 * Model used:
 *   Text/analysis : GEMINI_MODEL env  (default: gemini-2.5-flash)
 *   Image output  : gemini-2.0-flash-preview-image-generation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  CORS_HEADERS,
  requireApiKey,
  getTextModel,
  IMAGE_GEN_MODEL,
  geminiChat,
  geminiNative,
  geminiGenerateImage,
  fetchImageAsBase64,
  extractToolCall,
  extractNativeImage,
  okResponse,
  handleError,
  GeminiError,
  errorResponse,
} from "../_shared/gemini.ts";

// ─── Build image prompt from concept ────────────────────────────────────────

function buildImagePrompt(concept: any, keyword: string): string {
  const colors = (concept.colorPalette || []).slice(0, 3).join(", ");
  const style = concept.conceptName || "luxury event";
  return [
    `Luxury event decoration photography, professional editorial style.`,
    `Theme: "${style}".`,
    `Color palette: ${colors}.`,
    `Focus: ${keyword}.`,
    `Style: elegant, sophisticated, high-end wedding/event decor.`,
    `Lighting: warm golden ambient light.`,
    `No text, no watermarks, no people. Photorealistic.`,
  ].join(" ");
}

// ─── Server ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    // ── 1. Parse input ─────────────────────────────────────────────────────
    let body: any;
    try { body = await req.json(); }
    catch { return errorResponse("INVALID_INPUT", "Request body must be valid JSON", 400); }

    const { eventType, venueType, colorPalette, guestCount, decorStyle, venuePhotoUrl } = body;
    if (!eventType || !venueType || !colorPalette || !guestCount) {
      return errorResponse("INVALID_INPUT", "Required: eventType, venueType, colorPalette, guestCount", 400);
    }

    const GEMINI_API_KEY = requireApiKey();
    const textModel = getTextModel(); // gemini-2.5-flash
    console.log(`[generate-decor-concept] text=${textModel} | img=${IMAGE_GEN_MODEL} | hasPhoto=${!!venuePhotoUrl}`);

    // ── 2. Optional: fetch venue photo as base64 ───────────────────────────
    let venueImgBase64: string | null = null;
    let venueImgMime = "image/jpeg";
    if (venuePhotoUrl) {
      try {
        const img = await fetchImageAsBase64(venuePhotoUrl);
        venueImgBase64 = img.data;
        venueImgMime = img.mimeType;
      } catch (e) {
        console.warn("[generate-decor-concept] Could not load venue photo:", e);
      }
    }

    // ── 3. Build prompt ────────────────────────────────────────────────────
    const systemPrompt = `You are KiKi Decor Studio's creative director — a luxury event decoration company. Respond ONLY with the generate_concept tool call. All output text in Russian.

Event: ${eventType} | Venue: ${venueType} | Guests: ${guestCount} | Style: ${decorStyle || "Elegant luxury"} | Colors: ${colorPalette}
${venueImgBase64 ? "A venue photo is attached. Analyze the space and tailor every recommendation specifically to what you see." : ""}

Think like a creative director presenting a full mood board concept to an affluent client. Be specific about materials, textures, flowers, and placement.`;

    const userContent: any[] = [
      { type: "text", text: "Generate a complete luxury decoration concept." + (venueImgBase64 ? " Analyze the venue photo." : "") },
    ];

    // Attach venue photo via image_url (OpenAI-compat supports public URLs)
    if (venuePhotoUrl && !venueImgBase64) {
      userContent.push({ type: "image_url", image_url: { url: venuePhotoUrl } });
    }
    // If we have base64, attach as image_url data URI (more reliable than URL for private buckets)
    if (venueImgBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${venueImgMime};base64,${venueImgBase64}` },
      });
    }

    // ── 4. Generate concept with gemini-2.5-flash ─────────────────────────
    const chatData = await geminiChat({
      apiKey: GEMINI_API_KEY,
      model: textModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      tools: [{
        type: "function",
        function: {
          name: "generate_concept",
          description: "Return a structured luxury decoration concept",
          parameters: {
            type: "object",
            properties: {
              conceptName: { type: "string", description: "Красивое поэтичное название концепции (на русском)" },
              conceptDescription: { type: "string", description: "3-4 предложения об атмосфере, настроении и впечатлениях гостей" },
              colorPalette: { type: "array", items: { type: "string" }, description: "5 названий цветов на русском" },
              colorHexCodes: { type: "array", items: { type: "string" }, description: "5 HEX-кодов (#RRGGBB)" },
              decorElements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string", enum: ["focal", "table", "ambient", "entrance", "ceiling", "wall", "floor"] },
                  },
                  required: ["name", "description", "category"],
                },
                description: "6-10 декоративных элементов",
              },
              flowerArrangements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    flowers: { type: "array", items: { type: "string" } },
                    placement: { type: "string" },
                    style: { type: "string" },
                  },
                  required: ["name", "flowers", "placement", "style"],
                },
                description: "3-5 цветочных композиций",
              },
              lightingIdeas: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    element: { type: "string" },
                    placement: { type: "string" },
                    effect: { type: "string" },
                  },
                  required: ["element", "placement", "effect"],
                },
                description: "3-5 идей освещения",
              },
              backdropIdeas: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    purpose: { type: "string", enum: ["photo_zone", "stage_backdrop", "entrance", "head_table"] },
                  },
                  required: ["name", "description", "purpose"],
                },
                description: "2-4 идеи для фотозон и задников",
              },
              tableDecoration: {
                type: "object",
                properties: {
                  style: { type: "string" },
                  centerpiece: { type: "string" },
                  tableware: { type: "string" },
                  accents: { type: "string" },
                  runner: { type: "string" },
                },
                required: ["style", "centerpiece", "tableware", "accents"],
              },
              estimatedComplexity: { type: "string", enum: ["low", "medium", "high", "ultra"] },
              venueSpecificNotes: { type: "string", description: "Примечания к площадке (если фото предоставлено)" },
              inspirationKeywords: {
                type: "array",
                items: { type: "string" },
                description: "4 ключевых фразы на английском для генерации изображений (e.g. 'cascading flower wall', 'gold table centerpiece')",
              },
            },
            required: [
              "conceptName", "conceptDescription", "colorPalette", "colorHexCodes",
              "decorElements", "flowerArrangements", "lightingIdeas", "backdropIdeas",
              "tableDecoration", "estimatedComplexity", "inspirationKeywords",
            ],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "generate_concept" } },
      timeoutMs: 35_000,
    });

    const concept = extractToolCall(chatData);
    if (!concept?.conceptName || !concept?.decorElements) {
      console.error("[generate-decor-concept] Bad tool call:", JSON.stringify(chatData).slice(0, 300));
      throw new GeminiError("INVALID_MODEL_RESPONSE", "AI returned an unexpected format");
    }

    console.log(`[generate-decor-concept] ✅ Concept: "${concept.conceptName}" | generating images...`);

    // ── 5. Generate 3 inspiration images in parallel ───────────────────────
    const keywords: string[] = (concept.inspirationKeywords || []).slice(0, 3);

    const imagePromises = keywords.map(async (keyword: string, idx: number) => {
      const prompt = buildImagePrompt(concept, keyword);

      // First image: if venue photo available, use it as context
      if (idx === 0 && venueImgBase64) {
        try {
          const parts: any[] = [
            { text: `${prompt} The decoration is installed in this specific venue space. Visualize the complete decorated scene.` },
            { inlineData: { mimeType: venueImgMime, data: venueImgBase64 } },
          ];
          const data = await geminiNative({
            apiKey: GEMINI_API_KEY,
            model: IMAGE_GEN_MODEL,
            parts,
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
            timeoutMs: 45_000,
          });
          const img = extractNativeImage(data);
          return img ? `data:${img.mimeType};base64,${img.data}` : null;
        } catch (e) {
          console.warn(`[generate-decor-concept] Image 0 with venue context failed:`, e);
          // fall through to plain generation
        }
      }

      // Plain text-to-image
      const img = await geminiGenerateImage({
        apiKey: GEMINI_API_KEY,
        prompt,
        timeoutMs: 45_000,
      });
      return img ? `data:${img.mimeType};base64,${img.data}` : null;
    });

    const images = await Promise.all(imagePromises);
    concept.inspirationImages = images.filter(Boolean);

    console.log(`[generate-decor-concept] 🎨 Images: ${concept.inspirationImages.length}/${keywords.length}`);
    return okResponse(concept);

  } catch (e) {
    return handleError("generate-decor-concept", e);
  }
});
