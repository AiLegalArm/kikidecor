/**
 * find-similar/index.ts
 * Finds similar catalog items given a clothing photo.
 *
 * FIXES:
 * - Uses _shared/gemini.ts
 * - safeParseJson
 * - Structured errors
 * - URL validation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS,
  requireApiKey,
  geminiChat,
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
    try { body = await req.json(); } catch {
      return errorResponse("INVALID_INPUT", "Request body must be valid JSON", 400);
    }

    const { photoUrl, lang } = body;
    if (!photoUrl) return errorResponse("INVALID_INPUT", "photoUrl is required", 400);
    try { new URL(photoUrl); } catch {
      return errorResponse("INVALID_IMAGE", "photoUrl must be a valid URL", 400);
    }

    console.log(`[find-similar] Starting | lang=${lang}`);

    const GEMINI_API_KEY = requireApiKey();
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
      description: p.description, description_en: p.description_en,
      price: p.price, category: p.category, colors: p.colors,
    }));

    const isRu = lang === "ru";
    const systemPrompt = isRu
      ? `Ты — AI-система визуального поиска люксового бренда KiKi Showroom. Проанализируй фото одежды и найди похожие товары в каталоге.

Каталог: ${JSON.stringify(catalog)}

Задачи:
1. Определи тип одежды на фото (платье, блузка, юбка и т.д.)
2. Определи цвет, фактуру, силуэт, стиль
3. Найди похожие товары из каталога, ранжируя по степени сходства (0-100)
4. Объясни почему каждый товар похож

Используй ТОЛЬКО tool call.`
      : `You are KiKi Showroom's visual search AI. Analyze the clothing photo and find similar items in the catalog.

Catalog: ${JSON.stringify(catalog)}

Tasks:
1. Identify clothing type in the photo (dress, blouse, skirt, etc.)
2. Detect color, texture, silhouette, style
3. Find similar products from catalog, ranked by similarity score (0-100)
4. Explain why each product is similar

Use ONLY the tool call.`;

    const data = await geminiChat({
      apiKey: GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: isRu ? "Найди похожие товары из каталога." : "Find similar items from the catalog." },
            { type: "image_url", image_url: { url: photoUrl } },
          ],
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "find_similar",
          description: "Return detected clothing details and similar catalog items ranked by similarity",
          parameters: {
            type: "object",
            properties: {
              detected: {
                type: "object",
                properties: {
                  clothing_type: { type: "string" },
                  color: { type: "string" },
                  texture: { type: "string" },
                  silhouette: { type: "string" },
                  style: { type: "string" },
                  details: { type: "string" },
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
    });

    const parsed = extractToolCall(data);
    if (!parsed) {
      throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse AI visual search response");
    }

    const enriched = (parsed.similar_items || [])
      .map((item: any) => {
        const product = products?.find((p: any) => p.id === item.product_id);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.similarity_score - a.similarity_score);

    console.log(`[find-similar] ✅ Success | matches=${enriched.length}`);
    return okResponse({ detected: parsed.detected, similar_items: enriched });

  } catch (e) {
    return handleError("find-similar", e);
  }
});
