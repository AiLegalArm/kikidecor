/**
 * Venue Analyzer Engine
 * AI-powered venue analysis for decoration planning.
 */
import { invokeAI, type AIResponse } from "./aiClient";

export interface VenueAnalysisInput {
  imageUrl: string;
  eventType?: string;
  guestCount?: number;
  colorPalette?: string;
}

export interface VenueAnalysis {
  venue_type: string;
  estimated_area_sqm: number;
  estimated_capacity?: number;
  ceiling_height_m?: number;
  architectural_features?: Array<{
    feature: string;
    location: string;
    decor_potential: "high" | "medium" | "low";
    suggestion?: string;
  }>;
  existing_elements?: Array<{
    element: string;
    count?: number;
    condition?: string;
    keep_or_remove?: "keep" | "remove" | "modify";
  }>;
  decoration_zones: Array<{
    zone_name: string;
    zone_type: "focal_point" | "accent" | "ambient" | "functional";
    description: string;
    priority: "must_have" | "recommended" | "optional";
    estimated_budget_range?: string;
    suggested_elements?: string[];
  }>;
  lighting_analysis: {
    natural_light: "abundant" | "moderate" | "limited" | "none";
    existing_fixtures: string;
    recommendations: string;
    lighting_plan?: string[];
  };
  color_scheme_recommendation: {
    primary_colors: string[];
    accent_colors: string[];
    avoid_colors?: string[];
    reasoning: string;
  };
  layout_suggestions?: Array<{
    area: string;
    suggestion: string;
    reasoning?: string;
  }>;
  theme_compatibility?: Array<{
    theme: string;
    compatibility: "excellent" | "good" | "moderate" | "poor";
    notes?: string;
  }>;
  overall_recommendation: string;
  estimated_total_budget?: string;
}

export interface VenueAnalysisResult {
  analysis: VenueAnalysis | null;
  raw?: string;
}

export async function runVenueAnalysis(input: VenueAnalysisInput): Promise<AIResponse<VenueAnalysisResult>> {
  return invokeAI<VenueAnalysisResult>("analyze-venue", input);
}
