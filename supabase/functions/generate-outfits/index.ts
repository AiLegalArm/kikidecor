/**
 * generate-outfits/index.ts  (v3 — Lovable AI Gateway)
 * Generates complete outfit combinations from catalog.
 * Model: gemini-3-flash-preview (FAST) for quick generation.
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
    try { body = await req.json(); } catch { body = {}; }

    const { lang, count, occasion, budget, style, weather, gender } = body;
    const API_KEY = requireApiKey();
    console.log(`[generate-outfits] model=${AI_MODELS.FAST} | lang=${lang} | count=${count}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, name_en, description, description_en, price, category, colors, sizes, images, compare_at_price")
      .eq("is_published", true);

    if (error) throw error;
    if (!products?.length) return okResponse({ outfits: [] });

    const catalog = products.map((p: any) => ({
      id: p.id, name: p.name, name_en: p.name_en, price: p.price,
      category: p.category, colors: p.colors, sizes: p.sizes,
    }));

    const isRu = lang === "ru";
    const outfitCount = Math.min(Number(count) || 4, 6);

    const contextLines = [
      occasion ? `• Повод: ${occasion}` : null,
      budget ? `• Бюджет: ${budget}` : null,
      style ? `• Стиль: ${style}` : null,
      weather ? `• Погода/сезон: ${weather}` : null,
      gender ? `• Пол: ${gender}` : null,
    ].filter(Boolean).join("\n");

    const systemPrompt = isRu
      ? `Ты — AI-стилист KiKi Showroom. Собери ${outfitCount} готовых образов из каталога.

КАТАЛОГ: ${JSON.stringify(catalog)}
${contextLines ? `\nКОНТЕКСТ:\n${contextLines}` : ""}

ПРАВИЛА:
1. Каждый образ — стилистически целостная комбинация
2. Структура: верх (top) + низ (bottom) ИЛИ платье (dress) + обувь (shoes) + аксессуары (accessories)
3. Образы должны быть РАЗНООБРАЗНЫМИ по стилю, настроению и случаю
4. Используй ТОЛЬКО реальные ID товаров из каталога
5. Указывай slot для каждого элемента
6. Дай стилистические советы для каждого образа
7. Рассчитай общую стоимость

Используй ТОЛЬКО tool call.`
      : `You are KiKi Showroom's AI stylist. Build ${outfitCount} complete outfits from the catalog.

CATALOG: ${JSON.stringify(catalog)}
${contextLines ? `\nCONTEXT:\n${contextLines}` : ""}

RULES:
1. Each outfit must be stylistically cohesive
2. Structure: top + bottom OR dress + shoes + accessories
3. Outfits must be DIVERSE in style, mood, and occasion
4. Use ONLY real product IDs from catalog
5. Specify slot for each item
6. Provide styling tips
7. Calculate total price

Use ONLY the tool call.`;

    const data = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.FAST,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: isRu ? "Собери образы." : "Build outfits." },
      ],
      tools: [{
        type: "function",
        function: {
          name: "build_outfits",
          description: "Return complete outfit combinations",
          parameters: {
            type: "object",
            properties: {
              outfits: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    occasion: { type: "string" },
                    mood: { type: "string" },
                    season: { type: "string" },
                    description: { type: "string" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          product_id: { type: "string" },
                          slot: { type: "string", enum: ["top", "bottom", "dress", "shoes", "accessories", "outerwear"] },
                          why: { type: "string" },
                        },
                        required: ["product_id", "slot"],
                      },
                    },
                    styling_tips: { type: "string" },
                    total_price: { type: "number" },
                  },
                  required: ["title", "occasion", "description", "items", "styling_tips"],
                },
              },
            },
            required: ["outfits"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "build_outfits" } },
      timeoutMs: 40_000,
    });

    const parsed = extractToolCall(data);
    if (!parsed) throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse outfits response");

    const enriched = (parsed.outfits || []).map((outfit: any) => ({
      ...outfit,
      items: (outfit.items || []).map((item: any) => {
        const product = products.find((p: any) => p.id === item.product_id);
        return product ? { ...item, product } : null;
      }).filter(Boolean),
    }));

    console.log(`[generate-outfits] ✅ outfits=${enriched.length}`);
    return okResponse({ outfits: enriched });

  } catch (e) {
    return handleError("generate-outfits", e);
  }
});
