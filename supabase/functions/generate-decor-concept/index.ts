import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { eventType, venueType, colorPalette, guestCount } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are KiKi Decor Studio's creative director. Generate a detailed decor concept for the following event.

Event type: ${eventType}
Venue type: ${venueType}
Desired color palette: ${colorPalette}
Guest count: ${guestCount}

Respond in Russian. Structure your response as JSON with these fields:
{
  "conceptName": "Название концепции (красивое, поэтичное)",
  "conceptDescription": "Описание концепции в 3-4 предложения — атмосфера, настроение, ощущения гостей",
  "colorPalette": ["цвет1", "цвет2", "цвет3", "цвет4", "цвет5"],
  "colorHexCodes": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "decorElements": [
    {"name": "Название элемента", "description": "Краткое описание и как используется"},
    ... (6-8 элементов)
  ],
  "tableDecor": "Описание сервировки стола",
  "lightingConcept": "Описание концепции освещения",
  "floralDesign": "Описание флористики",
  "estimatedComplexity": "low | medium | high | ultra",
  "inspirationKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Return ONLY valid JSON, no markdown, no extra text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
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
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown fences if any)
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const concept = JSON.parse(jsonStr);

    // Generate inspiration images
    const imagePromises = concept.inspirationKeywords.slice(0, 4).map(async (keyword: string, i: number) => {
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
              content: `Generate a beautiful, photorealistic event decor inspiration image: ${concept.conceptName}, ${keyword}. Style: luxury event decoration, ${concept.colorPalette.join(", ")} color palette. Professional event photography style, elegant and sophisticated.`,
            }],
            modalities: ["image", "text"],
          }),
        });

        if (!imgResponse.ok) return null;
        const imgData = await imgResponse.json();
        const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        return imageUrl || null;
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
