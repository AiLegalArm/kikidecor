/**
 * virtual-tryon/index.ts  (v3 — Lovable AI Gateway)
 * Virtual fashion try-on using AI image generation.
 * Model: gemini-2.5-flash-image (IMAGE_GEN) for photorealistic rendering.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS, AI_MODELS, requireApiKey, aiImageGen,
  extractGatewayImage, parseDataUri, fetchImageAsBase64,
  okResponse, handleError, GeminiError, errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return errorResponse("INVALID_INPUT", "Invalid JSON body", 400);
    }

    const { userPhotoUrl, productImageUrl, productName, lang } = body;
    if (!userPhotoUrl) return errorResponse("INVALID_INPUT", "userPhotoUrl is required", 400);
    if (!productImageUrl) return errorResponse("INVALID_INPUT", "productImageUrl is required", 400);

    try { new URL(userPhotoUrl); new URL(productImageUrl); } catch {
      return errorResponse("INVALID_IMAGE", "Photo URLs must be valid", 400);
    }

    const isRu = lang === "ru";
    const API_KEY = requireApiKey();
    console.log(`[virtual-tryon] model=${AI_MODELS.IMAGE_GEN} | product="${productName}"`);

    // Fetch both images as base64
    let userImage: { data: string; mimeType: string };
    let productImage: { data: string; mimeType: string };
    try {
      [userImage, productImage] = await Promise.all([
        fetchImageAsBase64(userPhotoUrl),
        fetchImageAsBase64(productImageUrl),
      ]);
    } catch (e: any) {
      if (e instanceof GeminiError) throw e;
      throw new GeminiError("INVALID_IMAGE", `Failed to load images: ${e?.message}`);
    }

    const userDataUri = `data:${userImage.mimeType};base64,${userImage.data}`;
    const productDataUri = `data:${productImage.mimeType};base64,${productImage.data}`;

    const prompt = `Virtual fashion try-on task. Take the person from the first image and dress them in the clothing item "${productName || "the product"}" shown in the second image.

CRITICAL REQUIREMENTS:
- Keep the person's face, pose, body proportions, and background IDENTICAL to the first image
- Replace ONLY their clothing with the product from the second image
- Match clothing color, texture, pattern, and fabric exactly
- Apply realistic fit based on the person's body proportions
- Natural lighting and shadows consistent with the original photo
- Result must look like a real photograph, NOT a composite or collage
- Output ONLY the final composed image, no text`;

    const data = await aiImageGen({
      apiKey: API_KEY,
      model: AI_MODELS.IMAGE_GEN,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: userDataUri } },
          { type: "image_url", image_url: { url: productDataUri } },
        ],
      }],
      timeoutMs: 60_000,
    });

    const imageUrl = extractGatewayImage(data);
    if (!imageUrl) {
      console.error("[virtual-tryon] No image in response");
      throw new GeminiError("INVALID_MODEL_RESPONSE",
        isRu ? "AI не смог создать примерку для этих изображений" : "AI could not generate a try-on"
      );
    }

    // Try to upload to storage
    try {
      const parsed = parseDataUri(imageUrl);
      if (parsed) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const binaryStr = atob(parsed.data);
        const binaryData = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) binaryData[i] = binaryStr.charCodeAt(i);

        const fileName = `tryon-${Date.now()}.png`;
        const { error: uploadErr } = await supabase.storage
          .from("venue-photos")
          .upload(fileName, binaryData, { contentType: parsed.mimeType });

        if (uploadErr) {
          console.warn("[virtual-tryon] Upload failed, returning data URI:", uploadErr.message);
          return okResponse({ resultUrl: imageUrl });
        }

        const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(fileName);
        console.log("[virtual-tryon] ✅ Stored:", urlData.publicUrl);
        return okResponse({ resultUrl: urlData.publicUrl });
      }
    } catch {
      // Non-critical, fall through
    }

    return okResponse({ resultUrl: imageUrl });

  } catch (e) {
    return handleError("virtual-tryon", e);
  }
});
