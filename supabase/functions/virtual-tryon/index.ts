import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userPhotoUrl, productImageUrl, productName, lang } = await req.json();
    if (!userPhotoUrl || !productImageUrl) throw new Error("userPhotoUrl and productImageUrl are required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isRu = lang === "ru";

    const prompt = `You are a virtual fashion try-on system. Take this photo of a person and digitally dress them in the clothing item shown in the second image (${productName || "the product"}). 

Rules:
- Keep the person's face, body proportions, pose, and background exactly the same
- Replace or overlay their current clothing with the product shown in the second image
- Match the clothing's color, texture, pattern, and fit realistically
- Ensure natural lighting and shadows on the new clothing
- The result should look like a realistic photo, not a collage
- Maintain the same photo quality and resolution`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: userPhotoUrl } },
              { type: "image_url", image_url: { url: productImageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
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
    const generatedImage = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error("No image generated");
    }

    // Upload result to storage to avoid passing huge base64 to client
    const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fileName = `tryon-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("venue-photos")
      .upload(fileName, binaryData, { contentType: "image/png" });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Fallback: return base64 directly
      return new Response(JSON.stringify({ resultUrl: generatedImage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(fileName);

    return new Response(JSON.stringify({ resultUrl: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("virtual-tryon error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
