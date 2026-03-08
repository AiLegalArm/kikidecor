import { supabase } from "@/integrations/supabase/client";

const getSessionId = (): string => {
  let id = sessionStorage.getItem("kiki_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("kiki_session", id);
  }
  return id;
};

export type AIInteractionType =
  | "stylist_preferences"
  | "stylist_photo"
  | "outfit_generator"
  | "find_similar"
  | "virtual_tryon"
  | "venue_analysis"
  | "decor_concept";

export async function trackAIInteraction({
  type,
  inputData,
  outputData,
  selectedProductIds,
  photoUrl,
}: {
  type: AIInteractionType;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  selectedProductIds?: string[];
  photoUrl?: string;
}) {
  try {
    const sessionId = getSessionId();

    await supabase.from("ai_interactions").insert({
      session_id: sessionId,
      interaction_type: type,
      input_data: inputData || {},
      output_data: outputData || {},
      selected_product_ids: selectedProductIds || [],
      photo_url: photoUrl || null,
    });
  } catch (e) {
    console.error("Failed to track AI interaction:", e);
  }
}

export function trackProductSelection(interactionId: string, productIds: string[]) {
  // Fire and forget
  supabase
    .from("ai_interactions" as any)
    .update({ selected_product_ids: productIds } as any)
    .eq("id", interactionId)
    .then(() => {});
}
