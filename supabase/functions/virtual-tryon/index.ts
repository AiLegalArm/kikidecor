/**
 * virtual-tryon/index.ts  (v2)
 *
 * Models:
 *   Image generation → gemini-2.0-flash-preview-image-generation
 *   (gemini-2.5-flash does NOT support IMAGE output modality)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS,
  requireApiKey,
  IMAGE_GEN_MODEL,
  geminiNative,
  fetchImageAsBase64,
  extractNativeImage,
  okResponse,
  handleError,
  GeminiError,
  errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); }
    catch { return errorResponse("INVALID_INPUT", "Invalid JSON body", 400); }

    const { userPhotoUrl, productImageUrl, productName, lang } = body;
    if (!userPhotoUrl) return errorResponse("INVALID_INPUT", "userPhotoUrl is required", 400);
    if (!productImageUrl) return errorResponse("INVALID_INPUT", "productImageUrl is required", 400);

    try { new URL(userPhotoUrl); new URL(productImageUrl); }
    catch { return errorResponse("INVALID_IMAGE", "Photo URLs must be valid", 400); }

    const isRu = lang === "ru";
    console.log(`[virtual-tryon] model=${IMAGE_GEN_MODEL} | product="${productName}"`);

    const GEMINI_API_KEY = requireApiKey();

    // Fetch both images
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

    const prompt = `Virtual fashion try-on. Take the person from the first image and dress them in the clothing item from the second image (${productName || "the product"}).

Requirements:
- Keep the person's face, pose, body proportions, and background IDENTICAL
- Replace their clothing with the product shown in the second image
- Match clothing color, texture, pattern, and realistic fit
- Apply natural lighting and shadows
- Result must look like a real photograph, not a composit
- Output only the final composed image`;

    const data = await geminiNative({
      apiKey: GEMINI_API_KEY,
      model: IMAGE_GEN_MODEL,
      parts: [
        { text: prompt },
        { inlineData: { mimeType: userImage.mimeType, data: userImage.data } },
        { inlineData: { mimeType: productImage.mimeType, data: productImage.data } },
      ],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      timeoutMs: 50_000,
    });

    const imagePart = extractNativeImage(data);
    if (!imagePart) {
      console.error("[virtual-tryon] No image in response:", JSON.stringify(data).slice(0, 300));
      throw new GeminiError("INVALID_MODEL_RESPONSE",
        isRu ? "AI не смог создать примерку для этих изображений" : "AI could not generate a try-on"
      );
    }

    const generatedImage = `data:${imagePart.mimeType};base64,${imagePart.data}`;

    // Upload to storage (non-critical)
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const binaryStr = atob(imagePart.data);
      const binaryData = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) binaryData[i] = binaryStr.charCodeAt(i);

      const fileName = `tryon-${Date.now()}.png`;
      const { error: uploadErr } = await supabase.storage
        .from("venue-photos")
        .upload(fileName, binaryData, { contentType: imagePart.mimeType });

      if (uploadErr) {
        console.warn("[virtual-tryon] Storage upload failed, returning base64:", uploadErr.message);
        return okResponse({ resultUrl: generatedImage });
      }
      const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(fileName);
      console.log("[virtual-tryon] ✅ Stored:", urlData.publicUrl);
      return okResponse({ resultUrl: urlData.publicUrl });
    } catch {
      return okResponse({ resultUrl: generatedImage });
    }

  } catch (e) {
    return handleError("virtual-tryon", e);
  }
});
