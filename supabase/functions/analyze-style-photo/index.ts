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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch catalog
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
                    body_type: { type: "string", description: "Body type description (e.g. hourglass, rectangle, athletic)" },
                    height_estimate: { type: "string", description: "Estimated height range" },
                    silhouette: { type: "string", description: "Overall silhouette description" },
                    current_style: { type: "string", description: "Detected style preference" },
                    dominant_colors: { type: "array", items: { type: "string" }, description: "Dominant colors in current outfit" },
                    current_clothing: { type: "string", description: "Description of clothing currently worn" },
                    style_notes: { type: "string", description: "Professional notes about what styles would suit best" },
                  },
                  required: ["body_type", "current_style", "dominant_colors", "current_clothing", "style_notes"],
                },
                outfits: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string", description: "Why this outfit suits this person specifically" },
                      product_ids: { type: "array", items: { type: "string" } },
                      styling_tips: { type: "string", description: "Personalized styling advice" },
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
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    // Enrich outfits with full product data
    const enrichedOutfits = (parsed.outfits || []).map((outfit: any) => ({
      ...outfit,
      products: (outfit.product_ids || [])
        .map((pid: string) => products?.find((p: any) => p.id === pid))
        .filter(Boolean),
    }));

    return new Response(JSON.stringify({
      analysis: parsed.analysis,
      outfits: enrichedOutfits,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-style-photo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
