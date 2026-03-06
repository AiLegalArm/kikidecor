import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lang, count } = await req.json();
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
    if (!products?.length) {
      return new Response(JSON.stringify({ outfits: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const catalog = products.map((p: any) => ({
      id: p.id, name: p.name, name_en: p.name_en, price: p.price,
      category: p.category, colors: p.colors, sizes: p.sizes,
    }));

    const isRu = lang === "ru";
    const outfitCount = Math.min(count || 4, 6);

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
                      occasion: { type: "string", description: "What occasion this outfit is for" },
                      mood: { type: "string", description: "One-word mood (e.g. Refined, Playful, Bold, Casual)" },
                      description: { type: "string", description: "Why these pieces work together" },
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

    // Enrich with full product data
    const enriched = (parsed.outfits || []).map((outfit: any) => ({
      ...outfit,
      items: (outfit.items || []).map((item: any) => {
        const product = products.find((p: any) => p.id === item.product_id);
        return product ? { ...item, product } : null;
      }).filter(Boolean),
    }));

    return new Response(JSON.stringify({ outfits: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-outfits error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
