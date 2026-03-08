/**
 * find-similar/index.ts  (v3 — Lovable AI Gateway)
 * Visual similarity search using Gemini Vision.
 * Model: gemini-2.5-flash (VISION) for fast image analysis.
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
    console.log(`[find-similar] model=${AI_MODELS.VISION} | lang=${lang}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, name_en, description, description_en, price, category, colors, sizes, images, compare_at_price")
      .eq("is_published", true);

    if (error) throw error;

    const catalog = (products || []).map((p: any) => ({
      id: p.id, name: p.name, name_en: p.name_en,
      description: p.description?.slice(0, 60), description_en: p.description_en?.slice(0, 60),
      price: p.price, category: p.category, colors: p.colors,
    }));

    // Fetch image as base64 for reliable vision input
    let imageContent: any;
    try {
      const img = await fetchImageAsBase64(photoUrl);
      imageContent = { type: "image_url", image_url: { url: `data:${img.mimeType};base64,${img.data}` } };
    } catch {
      imageContent = { type: "image_url", image_url: { url: photoUrl } };
    }

    const isRu = lang === "ru";
    const systemPrompt = isRu
      ? `Ты — AI-система визуального поиска KiKi Showroom. Проанализируй фото одежды и найди максимально похожие товары в каталоге.

КАТАЛОГ: ${JSON.stringify(catalog)}

АЛГОРИТМ АНАЛИЗА:
1. Определи тип одежды (платье, блузка, юбка, брюки и т.д.)
2. Извлеки визуальные атрибуты: цвет, фактура, силуэт, длина, стиль, декор
3. Сопоставь с каждым товаром каталога по множеству параметров
4. Присвой similarity_score (0-100) на основе совпадения атрибутов
5. Объясни причину сходства для каждого товара

КРИТЕРИИ СХОДСТВА (вес):
• Тип одежды: 30%
• Цвет/паттерн: 25%
• Силуэт/крой: 20%
• Стиль/настроение: 15%
• Детали/декор: 10%

Используй ТОЛЬКО tool call.`
      : `You are KiKi Showroom's visual search AI. Analyze the clothing photo and find similar catalog items.

CATALOG: ${JSON.stringify(catalog)}

ANALYSIS ALGORITHM:
1. Identify clothing type (dress, blouse, skirt, pants, etc.)
2. Extract visual attributes: color, texture, silhouette, length, style, decoration
3. Match against each catalog item on multiple parameters
4. Assign similarity_score (0-100) based on attribute matching
5. Explain match reasoning for each item

SIMILARITY CRITERIA (weight):
• Clothing type: 30%
• Color/pattern: 25%
• Silhouette/cut: 20%
• Style/mood: 15%
• Details/decoration: 10%

Use ONLY the tool call.`;

    const data = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.VISION,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: isRu ? "Найди похожие товары." : "Find similar items." },
            imageContent,
          ],
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "find_similar",
          description: "Return detected attributes and similar catalog items",
          parameters: {
            type: "object",
            properties: {
              detected: {
                type: "object",
                properties: {
                  clothing_type: { type: "string" },
                  color: { type: "string" },
                  pattern: { type: "string" },
                  texture: { type: "string" },
                  silhouette: { type: "string" },
                  length: { type: "string" },
                  style: { type: "string" },
                  details: { type: "string" },
                  occasion: { type: "string" },
                },
                required: ["clothing_type", "color", "silhouette", "style"],
              },
              similar_items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    product_id: { type: "string" },
                    similarity_score: { type: "number" },
                    match_reason: { type: "string" },
                    matching_attributes: { type: "array", items: { type: "string" } },
                  },
                  required: ["product_id", "similarity_score", "match_reason"],
                },
              },
            },
            required: ["detected", "similar_items"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "find_similar" } },
      timeoutMs: 40_000,
    });

    const parsed = extractToolCall(data);
    if (!parsed) throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse visual search response");

    const enriched = (parsed.similar_items || [])
      .map((item: any) => {
        const product = products?.find((p: any) => p.id === item.product_id);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.similarity_score - a.similarity_score);

    console.log(`[find-similar] ✅ matches=${enriched.length}`);
    return okResponse({ detected: parsed.detected, similar_items: enriched });

  } catch (e) {
    return handleError("find-similar", e);
  }
});
