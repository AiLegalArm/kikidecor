/**
 * Decor Concept Generator Engine
 * AI-powered luxury decoration concept creation.
 */
import { invokeAI, type AIResponse } from "./aiClient";

export interface DecorConceptInput {
  eventType: string;
  venueType: string;
  colorPalette: string;
  guestCount: number;
  decorStyle?: string;
  venuePhotoUrl?: string;
}

export interface DecorElement {
  name: string;
  description: string;
  category: "focal" | "table" | "ambient" | "entrance" | "ceiling" | "wall" | "floor";
  estimated_cost?: string;
}

export interface FlowerArrangement {
  name: string;
  flowers: string[];
  placement: string;
  style: string;
}

export interface DecorConcept {
  conceptName: string;
  conceptDescription: string;
  colorPalette: string[];
  colorHexCodes: string[];
  decorElements: DecorElement[];
  flowerArrangements: FlowerArrangement[];
  lightingIdeas: Array<{ element: string; placement: string; effect: string }>;
  backdropIdeas: Array<{ name: string; description: string; purpose: string }>;
  tableDecoration: {
    style: string;
    centerpiece: string;
    tableware: string;
    accents: string;
    runner?: string;
  };
  estimatedComplexity: "low" | "medium" | "high" | "ultra";
  estimatedBudget?: string;
  venueSpecificNotes?: string;
  inspirationImages?: string[];
  inspirationKeywords?: string[];
}

export async function runDecorConceptGenerator(input: DecorConceptInput): Promise<AIResponse<DecorConcept>> {
  return invokeAI<DecorConcept>("generate-decor-concept", input);
}
