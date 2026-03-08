/**
 * Outfit Generator Engine
 * AI-powered complete outfit assembly from catalog.
 */
import { invokeAI, type AIResponse } from "./aiClient";

export interface OutfitGenInput {
  lang?: string;
  count?: number;
  occasion?: string;
  budget?: string;
  style?: string;
  weather?: string;
  gender?: string;
}

export interface OutfitItem {
  product_id: string;
  slot: "top" | "bottom" | "dress" | "shoes" | "accessories" | "outerwear";
  why?: string;
  product: any;
}

export interface GeneratedOutfit {
  title: string;
  occasion: string;
  mood?: string;
  season?: string;
  description: string;
  items: OutfitItem[];
  styling_tips: string;
  total_price?: number;
}

export interface OutfitGenResult {
  outfits: GeneratedOutfit[];
}

export async function runOutfitGenerator(input: OutfitGenInput): Promise<AIResponse<OutfitGenResult>> {
  return invokeAI<OutfitGenResult>("generate-outfits", input);
}
