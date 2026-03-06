import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { eventType, venueType, colorPalette, guestCount, decorStyle, venuePhotoUrl } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are KiKi Decor Studio's creative director — a luxury event decoration company. You must respond ONLY using the generate_concept tool call.

Generate a detailed, creative decor concept based on the provided inputs${venuePhotoUrl ? " and venue photo" : ""}.

Context:
- Event type: ${eventType}
- Venue type: ${venueType}
- Color palette preference: ${colorPalette}
- Guest count: ${guestCount}
- Decor style: ${decorStyle || "Elegant luxury"}

${venuePhotoUrl ? "Analyze the venue photo carefully. Consider the actual space, architecture, existing elements, and lighting when creating the concept. Make specific recommendations that work with THIS venue." : ""}

Think like a creative director presenting a mood board to a high-end client. Be specific about materials, textures, flowers, and placement. All text must be in Russian.`;

    const userContent: any[] = [
      {
        type: "text",
        text: "Please generate a complete decoration concept for this event" + (venuePhotoUrl ? " based on the venue photo provided." : "."),
      },
    ];

    if (venuePhotoUrl) {
      userContent.push({
        type: "image_url",
        image_url: { url: venuePhotoUrl },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_concept",
            description: "Return a structured decoration concept",
            parameters: {
              type: "object",
              properties: {
                conceptName: { type: "string", description: "Красивое поэтичное название концепции (на русском)" },
                conceptDescription: { type: "string", description: "3-4 предложения об атмосфере, настроении и впечатлениях гостей" },
                colorPalette: { type: "array", items: { type: "string" }, description: "5 названий цветов палитры" },
                colorHexCodes: { type: "array", items: { type: "string" }, description: "5 hex-кодов цветов (#RRGGBB)" },
                decorElements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Название элемента декора" },
                      description: { type: "string", description: "Описание и как используется" },
                      category: { type: "string", enum: ["focal", "table", "ambient", "entrance", "ceiling", "wall", "floor"] },
                    },
                    required: ["name", "description", "category"],
                  },
                  description: "6-10 элементов декора",
                },
                flowerArrangements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Название композиции" },
                      flowers: { type: "array", items: { type: "string" }, description: "Виды цветов" },
                      placement: { type: "string", description: "Где размещается" },
                      style: { type: "string", description: "Стиль аранжировки (каскадный, компактный, свободный)" },
                    },
                    required: ["name", "flowers", "placement", "style"],
                  },
                  description: "3-5 цветочных композиций",
                },
                lightingIdeas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      element: { type: "string", description: "Тип освещения" },
                      placement: { type: "string", description: "Расположение" },
                      effect: { type: "string", description: "Эффект и атмосфера" },
                    },
                    required: ["element", "placement", "effect"],
                  },
                  description: "3-5 идей освещения",
                },
                backdropIdeas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Название задника/фотозоны" },
                      description: { type: "string", description: "Описание: материалы, размер, элементы" },
                      purpose: { type: "string", enum: ["photo_zone", "stage_backdrop", "entrance", "head_table"] },
                    },
                    required: ["name", "description", "purpose"],
                  },
                  description: "2-4 идеи для задников и фотозон",
                },
                tableDecoration: {
                  type: "object",
                  properties: {
                    style: { type: "string", description: "Общий стиль сервировки" },
                    centerpiece: { type: "string", description: "Центральная композиция на столе" },
                    tableware: { type: "string", description: "Посуда, приборы, текстиль" },
                    accents: { type: "string", description: "Акценты: свечи, карточки, подставки" },
                    runner: { type: "string", description: "Дорожка/скатерть" },
                  },
                  required: ["style", "centerpiece", "tableware", "accents"],
                },
                estimatedComplexity: { type: "string", enum: ["low", "medium", "high", "ultra"] },
                venueSpecificNotes: { type: "string", description: "Заметки по конкретной площадке (если фото предоставлено)" },
                inspirationKeywords: {
                  type: "array",
                  items: { type: "string" },
                  description: "5 ключевых слов для генерации вдохновляющих изображений (на английском)",
                },
              },
              required: [
                "conceptName", "conceptDescription", "colorPalette", "colorHexCodes",
                "decorElements", "flowerArrangements", "lightingIdeas", "backdropIdeas",
                "tableDecoration", "estimatedComplexity", "inspirationKeywords",
              ],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_concept" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов. Подождите немного." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Недостаточно средств для AI-генерации." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let concept: any;
    if (toolCall?.function?.arguments) {
      concept = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing content as JSON
      const content = data.choices?.[0]?.message?.content || "";
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      concept = JSON.parse(jsonStr);
    }

    // Generate 4 inspiration images in parallel
    const imagePromises = (concept.inspirationKeywords || []).slice(0, 4).map(async (keyword: string, i: number) => {
      try {
        const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{
              role: "user",
              content: `Generate a beautiful, photorealistic luxury event decor inspiration image: ${concept.conceptName}, ${keyword}. Colors: ${concept.colorPalette?.join(", ")}. Style: high-end editorial event photography, elegant sophisticated decoration.`,
            }],
            modalities: ["image", "text"],
          }),
        });

        if (!imgResponse.ok) return null;
        const imgData = await imgResponse.json();
        return imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
      } catch (err) {
        console.warn(`Image generation ${i} failed:`, err);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);
    concept.inspirationImages = images.filter(Boolean);

    return new Response(JSON.stringify(concept), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-decor-concept error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
