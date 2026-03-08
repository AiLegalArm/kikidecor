/**
 * analyze-venue/index.ts  (v3 — Lovable AI Gateway)
 * Vision analysis of event venues for decoration planning.
 * Model: gemini-2.5-pro (REASONING) for deep spatial analysis.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  CORS_HEADERS, AI_MODELS, requireApiKey, aiChat, extractToolCall,
  fetchImageAsBase64, okResponse, handleError, GeminiError, errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return errorResponse("INVALID_INPUT", "Invalid JSON body", 400);
    }

    const { imageUrl, eventType, guestCount, colorPalette } = body;
    if (!imageUrl) return errorResponse("INVALID_INPUT", "imageUrl is required", 400);
    try { new URL(imageUrl); } catch {
      return errorResponse("INVALID_IMAGE", "imageUrl must be a valid URL", 400);
    }

    const API_KEY = requireApiKey();
    console.log(`[analyze-venue] model=${AI_MODELS.REASONING} | event=${eventType}`);

    // Fetch image as base64 for reliable multimodal input
    let imageContent: any;
    try {
      const img = await fetchImageAsBase64(imageUrl);
      imageContent = { type: "image_url", image_url: { url: `data:${img.mimeType};base64,${img.data}` } };
    } catch {
      imageContent = { type: "image_url", image_url: { url: imageUrl } };
    }

    const systemPrompt = `You are an expert venue decorator and spatial analyst for KiKi Decor, a luxury decoration company. Analyze the venue photo with precision. Respond ONLY with the analyze_venue tool call. All text in Russian.

Context:
- Event: ${eventType || "Not specified"}
- Guests: ${guestCount || "Not specified"}
- Desired colors: ${colorPalette || "Not specified"}

Perform comprehensive analysis:
1. SPATIAL: venue type, dimensions, ceiling height, floor area
2. ARCHITECTURAL: columns, arches, windows, stairs, focal points
3. EXISTING ELEMENTS: furniture, fixtures, installations
4. LIGHTING: natural light sources, existing fixtures, recommendations
5. DECORATION ZONES: identify all possible decoration areas with priority
6. COLOR SCHEME: recommend palette based on venue colors and client preferences
7. LOGISTICS: access points, power availability, rigging options`;

    const data = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.REASONING,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Проанализируй площадку и дай детальные рекомендации по декору." },
            imageContent,
          ],
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "analyze_venue",
          description: "Return comprehensive venue analysis",
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
                    suggestion: { type: "string" },
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
                    keep_or_remove: { type: "string", enum: ["keep", "remove", "modify"] },
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
                    suggested_elements: { type: "array", items: { type: "string" } },
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
                  lighting_plan: { type: "array", items: { type: "string" } },
                },
                required: ["natural_light", "existing_fixtures", "recommendations"],
              },
              color_scheme_recommendation: {
                type: "object",
                properties: {
                  primary_colors: { type: "array", items: { type: "string" } },
                  accent_colors: { type: "array", items: { type: "string" } },
                  avoid_colors: { type: "array", items: { type: "string" } },
                  reasoning: { type: "string" },
                },
                required: ["primary_colors", "accent_colors", "reasoning"],
              },
              layout_suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    area: { type: "string" },
                    suggestion: { type: "string" },
                    reasoning: { type: "string" },
                  },
                  required: ["area", "suggestion"],
                },
              },
              theme_compatibility: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    theme: { type: "string" },
                    compatibility: { type: "string", enum: ["excellent", "good", "moderate", "poor"] },
                    notes: { type: "string" },
                  },
                  required: ["theme", "compatibility"],
                },
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
      timeoutMs: 50_000,
    });

    const analysis = extractToolCall(data);
    if (!analysis) {
      const rawContent = data?.choices?.[0]?.message?.content;
      console.warn("[analyze-venue] No tool call — returning raw");
      return okResponse({ analysis: null, raw: rawContent ?? null });
    }

    console.log(`[analyze-venue] ✅ venue_type="${analysis.venue_type}"`);
    return okResponse({ analysis });

  } catch (e) {
    return handleError("analyze-venue", e);
  }
});
