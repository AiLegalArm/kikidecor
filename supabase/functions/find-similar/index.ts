/**
 * find-similar/index.ts  (v4 — 2-pass optimized)
 *
 * Architecture:
 *   Pass 1 — Vision: analyze image → extract attributes (NO catalog in prompt)
 *   Pass 2 — Rerank: send only candidate products to AI for scoring
 *
 * Retrieval strategy (ordered):
 *   1. pgvector semantic search via match_products (if embeddings exist)
 *   2. Keyword/category filtering fallback
 *   3. Full catalog fallback (small catalogs only)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS, AI_MODELS, requireApiKey, aiChat, extractToolCall,
  fetchImageAsBase64, okResponse, handleError, GeminiError, errorResponse,
} from "../_shared/gemini.ts";

const MAX_CANDIDATES_FOR_RERANK = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return errorResponse("INVALID_INPUT", "Request body must be valid JSON", 400);
    }

    const { photoUrl, lang } = body;
    if (!photoUrl) return errorResponse("INVALID_INPUT", "photoUrl is required", 400);
    try { new URL(photoUrl); } catch {
      return errorResponse("INVALID_IMAGE", "photoUrl must be a valid URL", 400);
    }

    const API_KEY = requireApiKey();
    const isRu = lang === "ru";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Fetch image ──────────────────────────────────────────────────────────
    let imageContent: any;
    try {
      const img = await fetchImageAsBase64(photoUrl);
      imageContent = { type: "image_url", image_url: { url: `data:${img.mimeType};base64,${img.data}` } };
    } catch {
      imageContent = { type: "image_url", image_url: { url: photoUrl } };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PASS 1 — Vision: Analyze image (NO catalog, fast & cheap)
    // ══════════════════════════════════════════════════════════════════════════
    console.log(`[find-similar] Pass 1: image analysis | model=${AI_MODELS.VISION}`);

    const analysisPrompt = isRu
      ? `Проанализируй фото одежды. Определи визуальные атрибуты. Используй ТОЛЬКО tool call.`
      : `Analyze the clothing photo. Identify visual attributes. Use ONLY the tool call.`;

    const analysisData = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.VISION,
      messages: [
        { role: "system", content: analysisPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: isRu ? "Определи атрибуты одежды на фото." : "Identify the clothing attributes." },
            imageContent,
          ],
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "detect_attributes",
          description: "Return detected clothing attributes from the image",
          parameters: {
            type: "object",
            properties: {
              clothing_type: { type: "string", description: "e.g. dress, blouse, skirt, pants, jacket" },
              color: { type: "string" },
              pattern: { type: "string", description: "e.g. solid, striped, floral, geometric" },
              texture: { type: "string", description: "e.g. silk, cotton, lace, knit, leather" },
              silhouette: { type: "string", description: "e.g. fitted, loose, A-line, straight" },
              length: { type: "string", description: "e.g. mini, midi, maxi, cropped" },
              style: { type: "string", description: "e.g. elegant, casual, romantic, boho, classic" },
              details: { type: "string", description: "notable details: ruffles, buttons, pockets, etc." },
              occasion: { type: "string", description: "e.g. evening, daily, office, party" },
              search_query: { type: "string", description: "A natural-language search query combining the key attributes for catalog search" },
            },
            required: ["clothing_type", "color", "silhouette", "style", "search_query"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "detect_attributes" } },
      timeoutMs: 25_000,
    });

    const detected = extractToolCall<any>(analysisData);
    if (!detected) throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse image analysis");

    console.log(`[find-similar] Detected: ${detected.clothing_type} | ${detected.color} | ${detected.style}`);

    // ══════════════════════════════════════════════════════════════════════════
    // CANDIDATE RETRIEVAL — try pgvector first, then text fallback
    // ══════════════════════════════════════════════════════════════════════════

    // Check if embeddings exist
    const { count: embeddingCount } = await supabase
      .from("product_embeddings")
      .select("id", { count: "exact", head: true })
      .not("embedding", "is", null);

    let candidateIds: string[] = [];

    if ((embeddingCount ?? 0) > 0) {
      // Strategy A: pgvector semantic search via feature_text similarity
      // We don't have an embedding endpoint, so we use the feature_text
      // to find products whose text features match the detected attributes
      console.log(`[find-similar] Strategy A: pgvector (${embeddingCount} embeddings available)`);

      // Use feature_text search as a proxy since we can't generate query embeddings
      const searchTerms = [
        detected.clothing_type,
        detected.color,
        detected.style,
        detected.silhouette,
        detected.texture,
      ].filter(Boolean).join(" ");

      const { data: embMatches } = await supabase
        .from("product_embeddings")
        .select("product_id, feature_text")
        .not("feature_text", "is", null);

      if (embMatches && embMatches.length > 0) {
        // Simple text-based scoring on feature_text
        const terms = searchTerms.toLowerCase().split(/\s+/);
        const scored = embMatches.map((em: any) => {
          const text = (em.feature_text || "").toLowerCase();
          const score = terms.reduce((s: number, t: string) => s + (text.includes(t) ? 1 : 0), 0);
          return { product_id: em.product_id, score };
        }).filter((x: any) => x.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, MAX_CANDIDATES_FOR_RERANK);

        candidateIds = scored.map((s: any) => s.product_id);
      }
    }

    // Strategy B: Direct product table filtering
    if (candidateIds.length === 0) {
      console.log(`[find-similar] Strategy B: category/keyword filter`);

      const { data: allProducts } = await supabase
        .from("products")
        .select("id, name, description, category, colors")
        .eq("is_published", true);

      if (allProducts && allProducts.length > 0) {
        // Score each product by attribute overlap
        const searchTerms = [
          detected.clothing_type, detected.color, detected.style,
          detected.silhouette, detected.texture, detected.pattern,
        ].filter(Boolean).map((t: string) => t.toLowerCase());

        const scored = allProducts.map((p: any) => {
          const haystack = [p.name, p.description, p.category, ...(p.colors || [])].join(" ").toLowerCase();
          const score = searchTerms.reduce((s, t) => s + (haystack.includes(t) ? 1 : 0), 0);
          return { id: p.id, score };
        }).sort((a, b) => b.score - a.score);

        // Take top candidates, but always include all if catalog is small
        candidateIds = allProducts.length <= MAX_CANDIDATES_FOR_RERANK
          ? allProducts.map((p: any) => p.id)
          : scored.slice(0, MAX_CANDIDATES_FOR_RERANK).map((s) => s.id);
      }
    }

    // Fetch full product data for candidates only
    const { data: candidateProducts, error: prodError } = await supabase
      .from("products")
      .select("id, name, name_en, description, description_en, price, category, colors, sizes, images, compare_at_price")
      .eq("is_published", true)
      .in("id", candidateIds.length > 0 ? candidateIds : ["00000000-0000-0000-0000-000000000000"]);

    if (prodError) throw prodError;

    if (!candidateProducts || candidateProducts.length === 0) {
      console.log("[find-similar] No candidate products found");
      return okResponse({ detected, similar_items: [] });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PASS 2 — Rerank: AI scores ONLY candidates (not full catalog)
    // ══════════════════════════════════════════════════════════════════════════

    const candidateCatalog = candidateProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      name_en: p.name_en,
      description: p.description?.slice(0, 80),
      description_en: p.description_en?.slice(0, 80),
      price: p.price,
      category: p.category,
      colors: p.colors,
    }));

    console.log(`[find-similar] Pass 2: reranking ${candidateCatalog.length} candidates | model=${AI_MODELS.FAST}`);

    const rerankPrompt = isRu
      ? `Ты — система ранжирования визуального поиска KiKi Showroom.

ОБНАРУЖЕННЫЕ АТРИБУТЫ ФОТО:
${JSON.stringify(detected, null, 2)}

КАНДИДАТЫ ДЛЯ РАНЖИРОВАНИЯ (${candidateCatalog.length} товаров):
${JSON.stringify(candidateCatalog)}

Задача: оцени каждый товар по сходству с обнаруженными атрибутами.
• Тип одежды: 30%  • Цвет/паттерн: 25%  • Силуэт/крой: 20%  • Стиль: 15%  • Детали: 10%

Верни ТОЛЬКО товары с similarity_score > 30. Используй tool call.`
      : `You are KiKi Showroom's visual search ranking system.

DETECTED PHOTO ATTRIBUTES:
${JSON.stringify(detected, null, 2)}

CANDIDATES FOR RANKING (${candidateCatalog.length} products):
${JSON.stringify(candidateCatalog)}

Task: score each product by similarity to detected attributes.
• Clothing type: 30%  • Color/pattern: 25%  • Silhouette/cut: 20%  • Style: 15%  • Details: 10%

Return ONLY products with similarity_score > 30. Use the tool call.`;

    const rerankData = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.FAST,
      messages: [
        { role: "system", content: rerankPrompt },
        { role: "user", content: isRu ? "Ранжируй товары по сходству." : "Rank products by similarity." },
      ],
      tools: [{
        type: "function",
        function: {
          name: "rank_similar",
          description: "Return ranked similar items from the candidate set",
          parameters: {
            type: "object",
            properties: {
              similar_items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    product_id: { type: "string" },
                    similarity_score: { type: "number" },
                    match_reason: { type: "string" },
                    matching_attributes: { type: "array", items: { type: "string" } },
                  },
                  required: ["product_id", "similarity_score", "match_reason"],
                },
              },
            },
            required: ["similar_items"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "rank_similar" } },
      timeoutMs: 25_000,
    });

    const ranked = extractToolCall<any>(rerankData);
    if (!ranked) throw new GeminiError("INVALID_MODEL_RESPONSE", "Could not parse reranking response");

    // Enrich with full product data
    const enriched = (ranked.similar_items || [])
      .map((item: any) => {
        const product = candidateProducts.find((p: any) => p.id === item.product_id);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.similarity_score - a.similarity_score);

    console.log(`[find-similar] ✅ 2-pass complete | matches=${enriched.length}`);
    return okResponse({ detected, similar_items: enriched });

  } catch (e) {
    return handleError("find-similar", e);
  }
});
