/**
 * AI Stylist Engine
 * Hybrid recommendation: preferences + optional photo analysis.
 */
import { invokeAI, type AIResponse } from "./aiClient";

export interface StylistInput {
  occasion: string;
  style: string;
  colors?: string;
  budget?: string;
  lang?: string;
  photoUrl?: string;
}

export interface StyleProfile {
  detected_body_type?: string;
  color_type?: string;
  style_direction?: string;
  key_notes?: string;
}

export interface OutfitRecommendation {
  title: string;
  description: string;
  product_ids: string[];
  products: any[];
  items_explanation?: Array<{
    product_id: string;
    slot: string;
    why: string;
  }>;
  styling_tips: string;
  total_price?: number;
  mood?: string;
  occasion_fit?: string;
}

export interface StylistResult {
  style_profile: StyleProfile | null;
  outfits: OutfitRecommendation[];
}

export async function runStylist(input: StylistInput): Promise<AIResponse<StylistResult>> {
  return invokeAI<StylistResult>("ai-stylist", input);
}
