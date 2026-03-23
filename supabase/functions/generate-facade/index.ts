/**
 * generate-facade/index.ts
 * AI facade/exterior decoration generator.
 * Takes a building photo + text description and generates decorated versions.
 * Uses IMAGE_GEN model for image editing with decoration overlay.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  CORS_HEADERS, AI_MODELS, requireApiKey, aiChat, aiImageGen,
  extractToolCall, extractGatewayImage, fetchImageAsBase64,
  okResponse, handleError, GeminiError, errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return errorResponse("INVALID_INPUT", "Request body must be valid JSON", 400);
    }

    const { description, imageUrl, style, colorPalette } = body;

    if (!description || description.trim().length < 5) {
      return errorResponse("INVALID_INPUT", "Описание должно содержать минимум 5 символов", 400);
    }

    const API_KEY = requireApiKey();
    console.log(`[generate-facade] Starting facade generation`);

    // Step 1: Generate decoration concept with REASONING model
    const contextParts: string[] = [];
    if (style) contextParts.push(`Style: ${style}`);
    if (colorPalette) contextParts.push(`Colors: ${colorPalette}`);

    const systemPrompt = `You are KiKi Decor Studio's creative director specializing in facade and exterior decoration for events. Respond ONLY with the generate_facade_concept tool call. All text in Russian.

Client's vision: "${description}"
${contextParts.length > 0 ? contextParts.join(" | ") : ""}
${imageUrl ? "A building/venue photo is attached. Analyze the architecture and suggest decorations that complement the existing structure." : "No photo provided — create a universal facade decoration concept."}

Think like a creative director planning exterior/facade decorations for a luxury event. Be specific about materials, lighting, floral installations, drapery, and architectural accents.`;

    const userContent: any[] = [
      { type: "text", text: `Generate a complete facade decoration concept: "${description}"` }
    ];

    if (imageUrl) {
      try {
        const img = await fetchImageAsBase64(imageUrl);
        userContent.push({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.data}` }
        });
      } catch (e) {
        console.warn("[generate-facade] Could not load photo:", e);
      }
    }

    const chatData = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.FAST,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      tools: [{
        type: "function",
        function: {
          name: "generate_facade_concept",
          description: "Return a structured facade decoration concept",
          parameters: {
            type: "object",
            properties: {
              conceptName: { type: "string", description: "Creative concept name (Russian)" },
              conceptDescription: { type: "string", description: "3-4 sentences about the facade decoration vision" },
              colorPalette: { type: "array", items: { type: "string" }, description: "4-5 color names in Russian" },
              colorHexCodes: { type: "array", items: { type: "string" }, description: "4-5 HEX codes" },
              facadeElements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    placement: { type: "string" },
                    category: { type: "string", enum: ["entrance", "walls", "windows", "roof", "columns", "garden", "lighting", "drapery"] },
                  },
                  required: ["name", "description", "placement", "category"],
                },
              },
              lightingPlan: {
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
              },
              floralInstallations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    flowers: { type: "array", items: { type: "string" } },
                    placement: { type: "string" },
                    scale: { type: "string" },
                  },
                  required: ["name", "flowers", "placement"],
                },
              },
              estimatedComplexity: { type: "string", enum: ["low", "medium", "high", "ultra"] },
              estimatedBudget: { type: "string" },
              architecturalNotes: { type: "string", description: "Notes about how decor fits the architecture" },
              imagePrompts: {
                type: "array",
                items: { type: "string" },
                description: "2-3 English prompts for generating facade decoration images",
              },
            },
            required: ["conceptName", "conceptDescription", "colorPalette", "colorHexCodes", "facadeElements", "lightingPlan", "imagePrompts"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "generate_facade_concept" } },
      timeoutMs: 50_000,
    });

    const concept = extractToolCall(chatData);
    if (!concept?.conceptName || !concept?.facadeElements) {
      throw new GeminiError("INVALID_MODEL_RESPONSE", "AI returned unexpected format");
    }

    console.log(`[generate-facade] ✅ Concept: "${concept.conceptName}" | generating images...`);

    // Step 2: Generate decorated facade images
    const prompts: string[] = (concept.imagePrompts || []).slice(0, imageUrl ? 2 : 3);
    const colors = (concept.colorPalette || []).slice(0, 3).join(", ");

    let uploadedImageDataUrl: string | null = null;
    if (imageUrl) {
      try {
        const img = await fetchImageAsBase64(imageUrl);
        uploadedImageDataUrl = `data:${img.mimeType};base64,${img.data}`;
      } catch (e) {
        console.warn("[generate-facade] Could not pre-fetch photo for editing:", e);
      }
    }

    const imagePromises = prompts.map(async (prompt: string, idx: number) => {
      if (uploadedImageDataUrl) {
        const variantNote = idx === 0
          ? "Create the most realistic primary version."
          : "Create a second subtle variation with the SAME building and only small decor differences.";

        try {
          const editData = await aiImageGen({
            apiKey: API_KEY,
            model: "google/gemini-3.1-flash-image-preview",
            messages: [{
              role: "user",
              content: [
                {
                  type: "text",
                  text: [
                    "IMAGE EDIT TASK.",
                    "Use the attached image as the fixed base photo.",
                    "Do NOT generate a new building.",
                    "Do NOT change camera angle, framing, architecture, windows, doors, roofline, facade materials, street context, or perspective.",
                    "Keep the original photo composition intact and recognizable.",
                    "Only add event decor overlays to this exact building.",
                    `Decor brief: ${prompt}`,
                    `Color palette: ${colors}`,
                    "Allowed edits only: flowers, entrance decor, drapery, lighting, ribbons, exterior styling details.",
                    "Forbidden: replacing the building, changing the facade design, inventing a different venue, changing the viewpoint, changing daylight/time dramatically.",
                    variantNote,
                    "Return a photorealistic edited version of THIS SAME uploaded building.",
                  ].join("\n"),
                },
                { type: "image_url", image_url: { url: uploadedImageDataUrl } },
              ],
            }],
            timeoutMs: 70_000,
          });

          const result = extractGatewayImage(editData);
          if (result) return result;
        } catch (e) {
          console.warn("[generate-facade] Image edit failed:", e);
          return null;
        }

        return null;
      }

      const fullPrompt = `Luxury event facade decoration, professional architectural photography. ${prompt}. Color palette: ${colors}. Elegant, sophisticated exterior decor. Warm ambient lighting. No text, no watermarks, no people. Photorealistic.`;

      try {
        const genData = await aiImageGen({
          apiKey: API_KEY,
          messages: [{ role: "user", content: fullPrompt }],
          timeoutMs: 55_000,
        });
        return extractGatewayImage(genData);
      } catch (e) {
        console.warn(`[generate-facade] Image generation failed:`, e);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);
    concept.generatedImages = images.filter(Boolean);

    if (uploadedImageDataUrl && concept.generatedImages.length === 0) {
      throw new GeminiError(
        "INVALID_MODEL_RESPONSE",
        "Не удалось применить декор поверх загруженного фото. Попробуйте другое фото фасада с более чётким ракурсом."
      );
    }

    console.log(`[generate-facade] 🏛️ Images: ${concept.generatedImages.length}/${prompts.length}`);
    return okResponse(concept);

  } catch (e) {
    return handleError("generate-facade", e);
  }
});
