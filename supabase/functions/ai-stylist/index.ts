/**
 * ai-stylist/index.ts  (v3 — Lovable AI Gateway)
 * Hybrid AI recommendation: preferences + optional photo analysis.
 * Model: gemini-2.5-pro (REASONING) for deep style analysis.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS, AI_MODELS, requireApiKey, aiChat, extractToolCall,
  okResponse, handleError, GeminiError, errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return errorResponse("INVALID_INPUT", "Request body must be valid JSON", 400);
    }

    const { occasion, style, colors, budget, lang, photoUrl } = body;
    if (!occasion || !style) {
      return errorResponse("INVALID_INPUT", "occasion and style are required", 400);
    }

    const API_KEY = requireApiKey();
    console.log(`[ai-stylist] model=${AI_MODELS.REASONING} | occasion=${occasion} | hasPhoto=${!!photoUrl}`);

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
      description: p.description?.slice(0, 80),
    }));

    const isRu = lang === "ru";

    const systemPrompt = isRu
      ? `Ты — ведущий AI-стилист люксового бренда KiKi Showroom с 15-летним опытом в моде.

КАТАЛОГ ТОВАРОВ:
${JSON.stringify(catalogSummary)}

ЗАПРОС КЛИЕНТА:
• Повод: ${occasion}
• Стиль: ${style}
• Цветовая гамма: ${colors || "любая"}
• Бюджет: ${budget || "не указан"}
${photoUrl ? "• Фото клиента прилагается — учти пропорции, цветотип и текущий стиль при подборе." : ""}

ПРАВИЛА:
1. Подбери 2-3 полноценных образа из РЕАЛЬНЫХ товаров каталога (используй точные id)
2. Каждый образ = комбинация: верх + низ (или платье) + обувь + аксессуары
3. Объясни ПОЧЕМУ каждый элемент подходит клиенту
4. Дай конкретные советы по стилизации (как носить, с чем сочетать)
5. Учитывай сочетаемость цветов, пропорций, текстур
6. Используй ТОЛЬКО tool call для ответа.`

      : `You are KiKi Showroom's lead AI stylist with 15 years of luxury fashion experience.

PRODUCT CATALOG:
${JSON.stringify(catalogSummary)}

CLIENT REQUEST:
• Occasion: ${occasion}
• Style: ${style}
• Color palette: ${colors || "any"}
• Budget: ${budget || "not specified"}
${photoUrl ? "• Client photo attached — consider proportions, color type, and current style." : ""}

RULES:
1. Create 2-3 complete outfits from REAL catalog products (use exact IDs)
2. Each outfit = combination: top + bottom (or dress) + shoes + accessories
3. Explain WHY each item suits the client
4. Give specific styling tips
5. Consider color harmony, proportions, textures
6. Use ONLY the tool call to respond.`;

    const userContent: any[] = [
      { type: "text", text: isRu ? "Подбери мне образы по указанным параметрам." : "Find me outfits based on the given preferences." },
    ];
    if (photoUrl) {
      userContent.push({ type: "image_url", image_url: { url: photoUrl } });
    }

    const data = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.REASONING,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      tools: [{
        type: "function",
        function: {
          name: "recommend_outfits",
          description: "Return outfit recommendations with detailed explanations",
          parameters: {
            type: "object",
            properties: {
              style_profile: {
                type: "object",
                properties: {
                  detected_body_type: { type: "string" },
                  color_type: { type: "string" },
                  style_direction: { type: "string" },
                  key_notes: { type: "string" },
                },
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
                          slot: { type: "string", enum: ["top", "bottom", "dress", "shoes", "accessories", "outerwear"] },
                          why: { type: "string" },
                        },
                        required: ["product_id", "slot", "why"],
                      },
                    },
                    styling_tips: { type: "string" },
                    total_price: { type: "number" },
                    mood: { type: "string" },
                    occasion_fit: { type: "string" },
                  },
                  required: ["title", "description", "product_ids", "items_explanation", "styling_tips"],
                },
              },
            },
            required: ["outfits"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "recommend_outfits" } },
      timeoutMs: 50_000,
    });

    const parsed = extractToolCall(data);
    if (!parsed) {
      throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse AI stylist response");
    }

    const enrichedOutfits = (parsed.outfits || []).map((outfit: any) => ({
      ...outfit,
      products: (outfit.product_ids || [])
        .map((pid: string) => products?.find((p: any) => p.id === pid))
        .filter(Boolean),
    }));

    console.log(`[ai-stylist] ✅ outfits=${enrichedOutfits.length}`);
    return okResponse({
      style_profile: parsed.style_profile || null,
      outfits: enrichedOutfits,
    });

  } catch (e) {
    return handleError("ai-stylist", e);
  }
});
