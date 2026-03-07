/**
 * analyze-venue/index.ts  (v2)
 *
 * Models:
 *   Vision analysis → gemini-2.5-flash (via native API with inlineData)
 *   Passes venue image as base64 inlineData for reliability with private storage URLs.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  CORS_HEADERS,
  requireApiKey,
  getTextModel,
  geminiChat,
  fetchImageAsBase64,
  extractToolCall,
  okResponse,
  handleError,
  GeminiError,
  errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); }
    catch { return errorResponse("INVALID_INPUT", "Invalid JSON body", 400); }

    const { imageUrl, eventType, guestCount, colorPalette } = body;
    if (!imageUrl) return errorResponse("INVALID_INPUT", "imageUrl is required", 400);
    try { new URL(imageUrl); }
    catch { return errorResponse("INVALID_IMAGE", "imageUrl must be a valid URL", 400); }

    const GEMINI_API_KEY = requireApiKey();
    const textModel = getTextModel(); // gemini-2.5-flash
    console.log(`[analyze-venue] model=${textModel} | event=${eventType}`);

    // Fetch image as base64 for reliable multimodal input
    let imgBase64: string;
    let imgMime = "image/jpeg";
    try {
      const img = await fetchImageAsBase64(imageUrl);
      imgBase64 = img.data;
      imgMime = img.mimeType;
    } catch {
      // Fallback: pass URL directly if fetch fails
      imgBase64 = "";
    }

    const systemPrompt = `You are an expert venue decorator and event planner for KiKi Decor, a luxury decoration company. Analyze the venue photo and provide a structured analysis. Respond ONLY with the analyze_venue tool call. All text in Russian.

Context:
- Event: ${eventType || "Not specified"}
- Guests: ${guestCount || "Not specified"}
- Colors: ${colorPalette || "Not specified"}

Analyze: venue type, dimensions, architectural features, existing elements, decoration zones, lighting conditions, and recommended decoration approach for this specific space.`;

    const userContent: any[] = [
      { type: "text", text: "Проанализируй площадку и предоставь детальные рекомендации по декору." },
    ];

    if (imgBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${imgMime};base64,${imgBase64}` },
      });
    } else {
      userContent.push({ type: "image_url", image_url: { url: imageUrl } });
    }

    const data = await geminiChat({
      apiKey: GEMINI_API_KEY,
      model: textModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      tools: [{
        type: "function",
        function: {
          name: "analyze_venue",
          description: "Return a structured venue analysis",
          parameters: {
            type: "object",
            properties: {
              venue_type: { type: "string" },
              estimated_area_sqm: { type: "number" },
              estimated_capacity: { type: "number" },
              ceiling_height_m: { type: "number" },
              architectural_features: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    feature: { type: "string" },
                    location: { type: "string" },
                    decor_potential: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["feature", "location", "decor_potential"],
                },
              },
              existing_elements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    element: { type: "string" },
                    count: { type: "number" },
                    condition: { type: "string" },
                  },
                  required: ["element"],
                },
              },
              decoration_zones: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    zone_name: { type: "string" },
                    zone_type: { type: "string", enum: ["focal_point", "accent", "ambient", "functional"] },
                    description: { type: "string" },
                    priority: { type: "string", enum: ["must_have", "recommended", "optional"] },
                    estimated_budget_range: { type: "string" },
                  },
                  required: ["zone_name", "zone_type", "description", "priority"],
                },
              },
              lighting_analysis: {
                type: "object",
                properties: {
                  natural_light: { type: "string", enum: ["abundant", "moderate", "limited", "none"] },
                  existing_fixtures: { type: "string" },
                  recommendations: { type: "string" },
                },
                required: ["natural_light", "existing_fixtures", "recommendations"],
              },
              color_scheme_recommendation: {
                type: "object",
                properties: {
                  primary_colors: { type: "array", items: { type: "string" } },
                  accent_colors: { type: "array", items: { type: "string" } },
                  reasoning: { type: "string" },
                },
                required: ["primary_colors", "accent_colors", "reasoning"],
              },
              overall_recommendation: { type: "string" },
              estimated_total_budget: { type: "string" },
            },
            required: [
              "venue_type", "estimated_area_sqm", "decoration_zones",
              "lighting_analysis", "color_scheme_recommendation", "overall_recommendation",
            ],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "analyze_venue" } },
      timeoutMs: 35_000,
    });

    const analysis = extractToolCall(data);
    if (!analysis) {
      const rawContent = data?.choices?.[0]?.message?.content;
      console.warn("[analyze-venue] No tool call — returning raw content");
      return okResponse({ analysis: null, raw: rawContent ?? null });
    }

    console.log(`[analyze-venue] ✅ venue_type="${analysis.venue_type}"`);
    return okResponse({ analysis });

  } catch (e) {
    return handleError("analyze-venue", e);
  }
});
