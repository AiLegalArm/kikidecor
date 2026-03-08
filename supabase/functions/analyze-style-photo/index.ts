/**
 * analyze-style-photo/index.ts  (v3 — Lovable AI Gateway)
 * Analyzes user's photo and recommends outfits.
 * Model: gemini-2.5-pro (REASONING) for deep body/style analysis.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS, AI_MODELS, requireApiKey, aiChat, extractToolCall,
  fetchImageAsBase64, okResponse, handleError, GeminiError, errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return errorResponse("INVALID_INPUT", "Request body must be valid JSON", 400);
    }

    const { photoUrl, lang } = body;
    if (!photoUrl) return errorResponse("INVALID_INPUT", "photoUrl is required", 400);
    try { new URL(photoUrl); } catch {
      return errorResponse("INVALID_IMAGE", "photoUrl must be a valid URL", 400);
    }

    const API_KEY = requireApiKey();
    console.log(`[analyze-style-photo] model=${AI_MODELS.REASONING} | lang=${lang}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, name_en, description, description_en, price, category, colors, sizes, images, compare_at_price")
      .eq("is_published", true);

    if (error) throw error;

    const catalogSummary = (products || []).map((p: any) => ({
      id: p.id, name: p.name, name_en: p.name_en,
      price: p.price, category: p.category, colors: p.colors, sizes: p.sizes,
    }));

    // Fetch image as base64 for reliable vision
    let imageContent: any;
    try {
      const img = await fetchImageAsBase64(photoUrl);
      imageContent = { type: "image_url", image_url: { url: `data:${img.mimeType};base64,${img.data}` } };
    } catch {
      imageContent = { type: "image_url", image_url: { url: photoUrl } };
    }

    const isRu = lang === "ru";
    const systemPrompt = isRu
      ? `Ты — персональный AI-стилист KiKi Showroom с экспертизой в анализе типов фигур и цветотипов.

КАТАЛОГ: ${JSON.stringify(catalogSummary)}

ПОРЯДОК АНАЛИЗА:
1. Тип фигуры (песочные часы, груша, яблоко, прямоугольник, перевёрнутый треугольник)
2. Примерный рост и пропорции
3. Цветотип (весна, лето, осень, зима)
4. Текущий стиль одежды на фото
5. Доминирующие цвета в образе
6. Сильные стороны фигуры для акцентирования

На основе анализа подбери 2-3 идеальных образа из каталога с объяснением, ПОЧЕМУ именно эти вещи подходят данному типу фигуры и цветотипу.

Используй ТОЛЬКО tool call.`
      : `You are KiKi Showroom's personal AI stylist with expertise in body type and color analysis.

CATALOG: ${JSON.stringify(catalogSummary)}

ANALYSIS ORDER:
1. Body type (hourglass, pear, apple, rectangle, inverted triangle)
2. Estimated height and proportions
3. Color type (spring, summer, autumn, winter)
4. Current style on photo
5. Dominant colors in outfit
6. Figure strengths to accentuate

Based on analysis, create 2-3 perfect outfits from catalog with explanations WHY each item suits this body type and color type.

Use ONLY the tool call.`;

    const data = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.REASONING,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: isRu ? "Проанализируй моё фото и подбери образы." : "Analyze my photo and recommend outfits." },
            imageContent,
          ],
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "analyze_and_recommend",
          description: "Return body analysis and personalized outfit recommendations",
          parameters: {
            type: "object",
            properties: {
              analysis: {
                type: "object",
                properties: {
                  body_type: { type: "string" },
                  height_estimate: { type: "string" },
                  proportions: { type: "string" },
                  color_type: { type: "string" },
                  silhouette: { type: "string" },
                  current_style: { type: "string" },
                  dominant_colors: { type: "array", items: { type: "string" } },
                  current_clothing: { type: "string" },
                  figure_strengths: { type: "array", items: { type: "string" } },
                  style_notes: { type: "string" },
                },
                required: ["body_type", "color_type", "current_style", "dominant_colors", "style_notes"],
              },
              outfits: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    product_ids: { type: "array", items: { type: "string" } },
                    items_explanation: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          product_id: { type: "string" },
                          slot: { type: "string" },
                          why_fits_body: { type: "string" },
                          why_fits_style: { type: "string" },
                        },
                        required: ["product_id", "why_fits_body"],
                      },
                    },
                    styling_tips: { type: "string" },
                    total_price: { type: "number" },
                    mood: { type: "string" },
                  },
                  required: ["title", "description", "product_ids", "styling_tips"],
                },
              },
            },
            required: ["analysis", "outfits"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "analyze_and_recommend" } },
      timeoutMs: 50_000,
    });

    const parsed = extractToolCall(data);
    if (!parsed) throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse style analysis");

    const enrichedOutfits = (parsed.outfits || []).map((outfit: any) => ({
      ...outfit,
      products: (outfit.product_ids || [])
        .map((pid: string) => products?.find((p: any) => p.id === pid))
        .filter(Boolean),
    }));

    console.log(`[analyze-style-photo] ✅ outfits=${enrichedOutfits.length}`);
    return okResponse({ analysis: parsed.analysis, outfits: enrichedOutfits });

  } catch (e) {
    return handleError("analyze-style-photo", e);
  }
});
