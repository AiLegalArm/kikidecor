/**
 * Visual Search Engine
 * Image-based product similarity search.
 */
import { invokeAI, type AIResponse } from "./aiClient";

export interface VisualSearchInput {
  photoUrl: string;
  lang?: string;
}

export interface DetectedAttributes {
  clothing_type: string;
  color: string;
  pattern?: string;
  texture?: string;
  silhouette: string;
  length?: string;
  style: string;
  details?: string;
  occasion?: string;
}

export interface SimilarItem {
  product_id: string;
  similarity_score: number;
  match_reason: string;
  matching_attributes?: string[];
  product: any;
}

export interface VisualSearchResult {
  detected: DetectedAttributes;
  similar_items: SimilarItem[];
}

export async function runVisualSearch(input: VisualSearchInput): Promise<AIResponse<VisualSearchResult>> {
  return invokeAI<VisualSearchResult>("find-similar", input);
}
