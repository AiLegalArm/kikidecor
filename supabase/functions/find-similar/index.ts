import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { photoUrl, lang } = await req.json();
    if (!photoUrl) throw new Error("photoUrl is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
                    details: { type: "string", description: "Notable design details (patterns, embellishments, neckline, etc.)" },
                  },
                  required: ["clothing_type", "color", "silhouette", "style"],
                },
                similar_items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      product_id: { type: "string" },
                      similarity_score: { type: "number", description: "0-100 similarity score" },
                      match_reason: { type: "string", description: "Why this item is similar" },
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
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: isRu ? "Слишком много запросов." : "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: isRu ? "Необходимо пополнить баланс." : "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    let parsed: any;
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      parsed = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "{}";
      parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    }

    // Enrich with full product data, sort by score desc
    const enriched = (parsed.similar_items || [])
      .map((item: any) => {
        const product = products?.find((p: any) => p.id === item.product_id);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.similarity_score - a.similarity_score);

    return new Response(JSON.stringify({
      detected: parsed.detected,
      similar_items: enriched,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("find-similar error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
