/**
 * analyze-style-photo/index.ts
 * Analyzes user's photo and recommends outfits from KiKi catalog.
 *
 * FIXES:
 * - Uses _shared/gemini.ts
 * - safeParseJson on all JSON parsing (no more uncaught SyntaxError)
 * - Structured error responses
 * - Validates photoUrl
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

    console.log(`[analyze-style-photo] Starting | lang=${lang}`);

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
      ? `Ты — AI-стилист люксового бренда KiKi Showroom. Проанализируй фото человека и подбери образы из каталога.

Каталог товаров: ${JSON.stringify(catalogSummary)}

Задачи:
1. Определи пропорции тела (тип фигуры, рост, силуэт)
2. Определи текущий стиль одежды на фото
3. Определи доминирующие цвета в образе
4. Определи тип одежды, надетой сейчас
5. На основе анализа подбери 2-3 образа из каталога, которые подойдут этому человеку

Используй ТОЛЬКО tool call для ответа.`
      : `You are KiKi Showroom's luxury AI stylist. Analyze the person's photo and recommend outfits from the catalog.

Product catalog: ${JSON.stringify(catalogSummary)}

Tasks:
1. Detect body proportions (body type, height estimate, silhouette)
2. Detect current style preferences from the photo
3. Detect dominant colors in their current outfit
4. Detect clothing type currently worn
5. Based on analysis, recommend 2-3 outfits from the catalog that would suit this person

Use ONLY the tool call to respond.`;

    const data = await geminiChat({
      apiKey: GEMINI_API_KEY,
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: isRu ? "Проанализируй моё фото и подбери образы." : "Analyze my photo and recommend outfits." },
            { type: "image_url", image_url: { url: photoUrl } },
          ],
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "analyze_and_recommend",
          description: "Return body analysis and outfit recommendations",
          parameters: {
            type: "object",
            properties: {
              analysis: {
                type: "object",
                properties: {
                  body_type: { type: "string" },
                  height_estimate: { type: "string" },
                  silhouette: { type: "string" },
                  current_style: { type: "string" },
                  dominant_colors: { type: "array", items: { type: "string" } },
                  current_clothing: { type: "string" },
                  style_notes: { type: "string" },
                },
                required: ["body_type", "current_style", "dominant_colors", "current_clothing", "style_notes"],
              },
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
            required: ["analysis", "outfits"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "analyze_and_recommend" } },
    });

    const parsed = extractToolCall(data);
    if (!parsed) {
      throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse AI style analysis response");
    }

    const enrichedOutfits = (parsed.outfits || []).map((outfit: any) => ({
      ...outfit,
      products: (outfit.product_ids || [])
        .map((pid: string) => products?.find((p: any) => p.id === pid))
        .filter(Boolean),
    }));

    console.log(`[analyze-style-photo] ✅ Success | outfits=${enrichedOutfits.length}`);
    return okResponse({ analysis: parsed.analysis, outfits: enrichedOutfits });

  } catch (e) {
    return handleError("analyze-style-photo", e);
  }
});
