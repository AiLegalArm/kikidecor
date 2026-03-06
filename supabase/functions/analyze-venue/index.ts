import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, eventType, guestCount, colorPalette } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Image URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert venue decorator and event planner for KiKi Decor, a luxury decoration company. Analyze the uploaded venue photo and provide a structured analysis.

You MUST respond using the "analyze_venue" tool call. Do not respond with plain text.

Context:
- Event type: ${eventType || "Not specified"}
- Expected guests: ${guestCount || "Not specified"}
- Preferred color palette: ${colorPalette || "Not specified"}

Analyze the venue photo and identify:
1. Venue type (restaurant, banquet hall, outdoor, loft, etc.)
2. Estimated space dimensions and capacity
3. Key architectural features (walls, columns, windows, ceiling type)
4. Existing furniture and fixtures (tables, chairs, stage, bar area)
5. Decoration zones - specific areas where decor can be placed
6. Lighting conditions and opportunities
7. Recommended decoration approach based on the event type and space

Be specific about measurements (approximate), materials visible, and practical decoration suggestions. Think like a professional decorator visiting the venue for the first time.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please analyze this venue photo and provide a complete structured breakdown of the space, decoration zones, and recommendations.",
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_venue",
                description:
                  "Return a structured venue analysis with decoration recommendations.",
                parameters: {
                  type: "object",
                  properties: {
                    venue_type: {
                      type: "string",
                      description:
                        "Type of venue (e.g. banquet hall, restaurant, loft, outdoor terrace)",
                    },
                    estimated_area_sqm: {
                      type: "number",
                      description: "Estimated area in square meters",
                    },
                    estimated_capacity: {
                      type: "number",
                      description:
                        "Estimated guest capacity for the identified venue",
                    },
                    ceiling_height_m: {
                      type: "number",
                      description: "Estimated ceiling height in meters",
                    },
                    architectural_features: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          feature: {
                            type: "string",
                            description:
                              "Feature name (e.g. arched windows, exposed brick wall)",
                          },
                          location: {
                            type: "string",
                            description: "Where in the venue",
                          },
                          decor_potential: {
                            type: "string",
                            enum: ["high", "medium", "low"],
                          },
                        },
                        required: ["feature", "location", "decor_potential"],
                      },
                    },
                    existing_elements: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          element: {
                            type: "string",
                            description:
                              "Element name (e.g. round tables, bar counter, stage)",
                          },
                          count: {
                            type: "number",
                            description: "Approximate count",
                          },
                          condition: {
                            type: "string",
                            description:
                              "Condition/style note (e.g. modern white, rustic wood)",
                          },
                        },
                        required: ["element"],
                      },
                    },
                    decoration_zones: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          zone_name: {
                            type: "string",
                            description:
                              "Zone name (e.g. entrance arch, head table backdrop, ceiling)",
                          },
                          zone_type: {
                            type: "string",
                            enum: [
                              "focal_point",
                              "accent",
                              "ambient",
                              "functional",
                            ],
                          },
                          description: {
                            type: "string",
                            description:
                              "What decoration would work here and why",
                          },
                          priority: {
                            type: "string",
                            enum: ["must_have", "recommended", "optional"],
                          },
                          estimated_budget_range: {
                            type: "string",
                            description:
                              "Budget range in rubles (e.g. 5,000-15,000 ₽)",
                          },
                        },
                        required: [
                          "zone_name",
                          "zone_type",
                          "description",
                          "priority",
                        ],
                      },
                    },
                    lighting_analysis: {
                      type: "object",
                      properties: {
                        natural_light: {
                          type: "string",
                          enum: ["abundant", "moderate", "limited", "none"],
                        },
                        existing_fixtures: {
                          type: "string",
                          description: "Description of existing lighting",
                        },
                        recommendations: {
                          type: "string",
                          description: "Lighting decoration suggestions",
                        },
                      },
                      required: [
                        "natural_light",
                        "existing_fixtures",
                        "recommendations",
                      ],
                    },
                    color_scheme_recommendation: {
                      type: "object",
                      properties: {
                        primary_colors: {
                          type: "array",
                          items: { type: "string" },
                          description: "2-3 primary colors recommended",
                        },
                        accent_colors: {
                          type: "array",
                          items: { type: "string" },
                          description: "1-2 accent colors",
                        },
                        reasoning: {
                          type: "string",
                          description:
                            "Why these colors work with the venue",
                        },
                      },
                      required: [
                        "primary_colors",
                        "accent_colors",
                        "reasoning",
                      ],
                    },
                    overall_recommendation: {
                      type: "string",
                      description:
                        "2-3 sentence overall decoration strategy summary",
                    },
                    estimated_total_budget: {
                      type: "string",
                      description:
                        "Total estimated decoration budget range in rubles",
                    },
                  },
                  required: [
                    "venue_type",
                    "estimated_area_sqm",
                    "decoration_zones",
                    "lighting_analysis",
                    "color_scheme_recommendation",
                    "overall_recommendation",
                  ],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "analyze_venue" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов, попробуйте позже" }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Необходимо пополнить баланс AI" }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: if model responded with content instead of tool call
    const content = data.choices?.[0]?.message?.content;
    return new Response(
      JSON.stringify({ analysis: null, raw: content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("analyze-venue error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
