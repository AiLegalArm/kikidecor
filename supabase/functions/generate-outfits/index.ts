/**
 * generate-outfits/index.ts
 * Generates complete outfit combinations from the catalog automatically.
 *
 * STATUS: Was working. Refactored to use _shared/gemini.ts.
 * FIXES:
 * - Shared layer (timeout, structured errors)
 * - Safe extractToolCall
 * - gemini-2.0-flash
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
      body = {};
    }

    const { lang, count } = body;
    console.log(`[generate-outfits] Starting | lang=${lang} | count=${count}`);

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
    if (!products?.length) {
      return okResponse({ outfits: [] });
    }

    const catalog = products.map((p: any) => ({
      id: p.id, name: p.name, name_en: p.name_en, price: p.price,
      category: p.category, colors: p.colors, sizes: p.sizes,
    }));

    const isRu = lang === "ru";
    const outfitCount = Math.min(Number(count) || 4, 6);

    const systemPrompt = isRu
      ? `Ты — AI-стилист люксового бренда KiKi Showroom. Из предоставленного каталога собери ${outfitCount} готовых образов.

Каталог: ${JSON.stringify(catalog)}

Правила:
- Каждый образ должен быть стилистически целостным
- Комбинируй товары по категориям: верх, низ, платья, обувь, аксессуары
- Указывай какой тип каждого элемента (top/bottom/dress/shoes/accessories)
- Образы должны быть разнообразными по стилю и случаю
- Используй ТОЛЬКО реальные id товаров из каталога
- Используй ТОЛЬКО tool call для ответа.`
      : `You are KiKi Showroom's luxury AI stylist. Build ${outfitCount} complete outfits from the provided catalog.

Catalog: ${JSON.stringify(catalog)}

Rules:
- Each outfit must be stylistically cohesive
- Combine products by category: top, bottom, dress, shoes, accessories
- Specify the slot type for each item (top/bottom/dress/shoes/accessories)
- Outfits should be diverse in style and occasion
- Use ONLY real product IDs from the catalog
- Use ONLY the tool call to respond.`;

    const data = await geminiChat({
      apiKey: GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: isRu ? "Собери готовые образы из каталога." : "Build complete outfits from the catalog." },
      ],
      tools: [{
        type: "function",
        function: {
          name: "build_outfits",
          description: "Return complete outfit combinations from catalog",
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
                    description: { type: "string" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          product_id: { type: "string" },
                          slot: { type: "string", enum: ["top", "bottom", "dress", "shoes", "accessories"] },
                        },
                        required: ["product_id", "slot"],
                      },
                    },
                    styling_tips: { type: "string" },
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
    });

    const parsed = extractToolCall(data);
    if (!parsed) {
      throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse AI outfits response");
    }

    const enriched = (parsed.outfits || []).map((outfit: any) => ({
      ...outfit,
      items: (outfit.items || []).map((item: any) => {
        const product = products.find((p: any) => p.id === item.product_id);
        return product ? { ...item, product } : null;
      }).filter(Boolean),
    }));

    console.log(`[generate-outfits] ✅ Success | outfits=${enriched.length}`);
    return okResponse({ outfits: enriched });

  } catch (e) {
    return handleError("generate-outfits", e);
  }
});
