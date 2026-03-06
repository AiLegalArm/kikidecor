import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { occasion, style, colors, lang } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published products
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
      image: p.images?.[0] || null,
    }));

    const isRu = lang === "ru";

    const systemPrompt = isRu
      ? `Ты — AI-стилист бренда KiKi. Ты рекомендуешь образы из каталога бренда.
Тебе дан каталог товаров в JSON. На основе запроса пользователя (повод, стиль, цвета) подбери 1-3 образа.
Каждый образ — это комбинация товаров из каталога.
Ответь СТРОГО в JSON формате (без markdown):
{"outfits": [{"title": "Название образа", "description": "Описание почему подходит", "product_ids": ["id1","id2"], "styling_tips": "Советы по стилю"}]}`
      : `You are KiKi brand's AI stylist. You recommend outfits from the brand catalog.
You are given a product catalog in JSON. Based on user preferences (occasion, style, colors), suggest 1-3 outfits.
Each outfit is a combination of catalog products.
Respond STRICTLY in JSON format (no markdown):
{"outfits": [{"title": "Outfit name", "description": "Why it works", "product_ids": ["id1","id2"], "styling_tips": "Styling tips"}]}`;

    const userPrompt = isRu
      ? `Каталог: ${JSON.stringify(catalogSummary)}\n\nПовод: ${occasion}\nСтиль: ${style}\nЦвета: ${colors}`
      : `Catalog: ${JSON.stringify(catalogSummary)}\n\nOccasion: ${occasion}\nStyle: ${style}\nColors: ${colors}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";

    // Parse JSON from AI response (strip markdown fences if any)
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { outfits: [], raw: content };
    }

    // Enrich outfits with full product data
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
