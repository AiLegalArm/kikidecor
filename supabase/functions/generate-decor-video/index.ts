import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  requireApiKey, aiImageGen, extractGatewayImage, fetchImageAsBase64,
  CORS_HEADERS, AI_MODELS, handleError, GeminiError,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const apiKey = requireApiKey();
    const { prompt, photoUrl, frameCount = 4, style = "elegant" } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      throw new GeminiError("INVALID_INPUT", "Введите описание декора (минимум 5 символов)");
    }

    const count = Math.min(Math.max(frameCount, 2), 6);

    const styleGuide: Record<string, string> = {
      elegant: "luxury elegant style, soft warm lighting, golden accents, refined floral arrangements, crystal chandeliers",
      modern: "modern contemporary style, clean geometric lines, minimalist design, dramatic lighting, bold accents",
      romantic: "romantic dreamy style, pastel colors, soft fabrics, candles, roses and peonies, fairy lights",
      classic: "classic traditional style, rich textures, deep colors, symmetrical arrangements, grand columns",
      boho: "bohemian style, natural materials, dried flowers, macrame, earth tones, organic textures",
    };

    const styleDesc = styleGuide[style] || styleGuide.elegant;

    // Build prompts for each frame — different angles/details of the same concept
    const angles = [
      "wide establishing shot showing the full venue decorated",
      "medium shot focusing on the centerpiece and table setting",
      "close-up detail shot of floral arrangements and decorative elements",
      "atmospheric shot capturing lighting, candles, and ambient mood",
      "overhead bird's-eye view of the decorated space layout",
      "entrance and welcome area decoration detail",
    ];

    let contextImage: { data: string; mimeType: string } | null = null;
    if (photoUrl) {
      try {
        contextImage = await fetchImageAsBase64(photoUrl);
      } catch (e) {
        console.warn("[video-gen] Could not fetch context image:", e);
      }
    }

    console.log(`[video-gen] Generating ${count} frames, style=${style}`);

    const frames: string[] = [];

    for (let i = 0; i < count; i++) {
      const angle = angles[i % angles.length];
      const framePrompt = contextImage
        ? `Based on this venue photo, create a photorealistic visualization of event decoration: ${prompt}. ${styleDesc}. Perspective: ${angle}. Keep the exact same architectural space and perspective from the reference photo, add only decorative elements. Ultra high quality, 4K, professional event photography.`
        : `Create a photorealistic visualization of event decoration: ${prompt}. ${styleDesc}. Perspective: ${angle}. Ultra high quality, 4K, professional event photography, stunning venue.`;

      const content: any[] = [{ type: "text", text: framePrompt }];
      if (contextImage) {
        content.push({
          type: "image_url",
          image_url: { url: `data:${contextImage.mimeType};base64,${contextImage.data}` },
        });
      }

      try {
        const data = await aiImageGen({
          apiKey,
          messages: [{ role: "user", content }],
          model: AI_MODELS.IMAGE_GEN,
          timeoutMs: 60_000,
          maxRetries: 1,
        });

        const imageUrl = extractGatewayImage(data);
        if (imageUrl) {
          frames.push(imageUrl);
          console.log(`[video-gen] Frame ${i + 1}/${count} ✅`);
        } else {
          console.warn(`[video-gen] Frame ${i + 1}/${count} — no image returned`);
        }
      } catch (e) {
        console.warn(`[video-gen] Frame ${i + 1}/${count} failed:`, e instanceof Error ? e.message : String(e));
      }

      // Small delay between generations to avoid rate limits
      if (i < count - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (frames.length === 0) {
      throw new GeminiError("INVALID_MODEL_RESPONSE", "Не удалось сгенерировать ни одного кадра");
    }

    return new Response(JSON.stringify({
      success: true,
      frames,
      prompt,
      style,
      frameCount: frames.length,
    }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return handleError("generate-decor-video", e);
  }
});
