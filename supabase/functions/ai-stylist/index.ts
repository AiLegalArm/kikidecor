import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { occasion, style, colors, budget, lang } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, name_en, description, description_en, price, category, colors, sizes, images, compare_at_price")
      .eq("is_published", true);

    if (error) throw error;

    const catalogSummary = (products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      name_en: p.name_en,
      price: p.price,
      category: p.category,
      colors: p.colors,
      sizes: p.sizes,
    }));

    const isRu = lang === "ru";

    const systemPrompt = isRu
      ? `Ты — AI-стилист люксового бренда KiKi Showroom. Подбираешь образы ТОЛЬКО из предоставленного каталога.

Каталог товаров: ${JSON.stringify(catalogSummary)}

Запрос клиента:
- Повод: ${occasion}
- Стиль: ${style}
- Цветовая гамма: ${colors}
- Бюджет: ${budget || "не указан"}

Подбери 1-3 комплексных образа. Каждый образ — это комбинация реальных товаров из каталога (используй точные id). Дай профессиональные советы по стилю. Используй ТОЛЬКО tool call для ответа.`
      : `You are KiKi Showroom's luxury AI stylist. Recommend outfits ONLY from the provided catalog.

Product catalog: ${JSON.stringify(catalogSummary)}

Client request:
- Occasion: ${occasion}
- Style: ${style}
- Color palette: ${colors}
- Budget: ${budget || "not specified"}

Create 1-3 complete outfit recommendations using real product IDs from the catalog. Provide professional styling tips. Use ONLY the tool call to respond.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
                      title: { type: "string", description: "Outfit name" },
                      description: { type: "string", description: "Why this outfit works for the occasion" },
                      product_ids: { type: "array", items: { type: "string" }, description: "Product IDs from catalog" },
                      styling_tips: { type: "string", description: "Professional styling advice" },
                      total_price: { type: "number", description: "Total outfit price" },
                      mood: { type: "string", description: "One-word mood descriptor (e.g. Refined, Playful, Bold)" },
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
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: isRu ? "Слишком много запросов. Подождите." : "Rate limit exceeded." }), {
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
      // Fallback
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    // Enrich with full product data
    const enrichedOutfits = (parsed.outfits || []).map((outfit: any) => ({
      ...outfit,
      products: (outfit.product_ids || [])
        .map((pid: string) => products?.find((p: any) => p.id === pid))
        .filter(Boolean),
    }));

    return new Response(JSON.stringify({ outfits: enrichedOutfits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-stylist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
