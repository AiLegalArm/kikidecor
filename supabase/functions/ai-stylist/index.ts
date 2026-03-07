/**
 * ai-stylist/index.ts
 * Recommends outfits based on occasion/style preferences (no photo).
 *
 * STATUS: Was working. Refactored to use _shared/gemini.ts for consistency.
 * FIXES:
 * - Uses shared layer (timeout, structured errors)
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
      return errorResponse("INVALID_INPUT", "Request body must be valid JSON", 400);
    }

    const { occasion, style, colors, budget, lang } = body;
    if (!occasion || !style) {
      return errorResponse("INVALID_INPUT", "occasion and style are required", 400);
    }

    console.log(`[ai-stylist] Starting | occasion=${occasion} | style=${style} | lang=${lang}`);

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

    const catalogSummary = (products || []).map((p: any) => ({
      id: p.id, name: p.name, name_en: p.name_en,
      price: p.price, category: p.category, colors: p.colors, sizes: p.sizes,
    }));

    const isRu = lang === "ru";
    const systemPrompt = isRu
      ? `Ты — AI-стилист люксового бренда KiKi Showroom. Подбираешь образы ТОЛЬКО из предоставленного каталога.

Каталог товаров: ${JSON.stringify(catalogSummary)}

Запрос клиента:
- Повод: ${occasion}
- Стиль: ${style}
- Цветовая гамма: ${colors || "любая"}
- Бюджет: ${budget || "не указан"}

Подбери 1-3 комплексных образа. Каждый образ — это комбинация реальных товаров из каталога (используй точные id). Дай профессиональные советы по стилю. Используй ТОЛЬКО tool call для ответа.`
      : `You are KiKi Showroom's luxury AI stylist. Recommend outfits ONLY from the provided catalog.

Product catalog: ${JSON.stringify(catalogSummary)}

Client request:
- Occasion: ${occasion}
- Style: ${style}
- Color palette: ${colors || "any"}
- Budget: ${budget || "not specified"}

Create 1-3 complete outfit recommendations using real product IDs from the catalog. Provide professional styling tips. Use ONLY the tool call to respond.`;

    const data = await geminiChat({
      apiKey: GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: isRu ? "Подбери мне образы по указанным параметрам." : "Find me outfits based on the given preferences." },
      ],
      tools: [{
        type: "function",
        function: {
          name: "recommend_outfits",
          description: "Return outfit recommendations from the catalog",
          parameters: {
            type: "object",
            properties: {
              outfits: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    product_ids: { type: "array", items: { type: "string" } },
                    styling_tips: { type: "string" },
                    total_price: { type: "number" },
                    mood: { type: "string" },
                  },
                  required: ["title", "description", "product_ids", "styling_tips"],
                },
              },
            },
            required: ["outfits"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "recommend_outfits" } },
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

    console.log(`[ai-stylist] ✅ Success | outfits=${enrichedOutfits.length}`);
    return okResponse({ outfits: enrichedOutfits });

  } catch (e) {
    return handleError("ai-stylist", e);
  }
});
