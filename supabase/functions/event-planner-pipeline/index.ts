import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  CORS_HEADERS,
  requireApiKey,
  getTextModel,
  geminiChat,
  extractToolCall,
  errorResponse,
  okResponse,
  handleError,
} from "../_shared/gemini.ts";

type ModuleName = "module_1" | "module_2" | "module_3" | "module_4" | "module_5" | "module_6";

const MODULE_ORDER: ModuleName[] = ["module_1", "module_2", "module_3", "module_4", "module_5", "module_6"];

const GLOBAL_SHAPE = {
  event_input: {},
  analysis: {},
  market_research: {},
  concept: {},
  decor: {},
  spatial_plan: {},
  program: {},
  timeline: [],
  team: [],
  vendors: [],
  budget: {},
  commercial: {},
  visuals: {},
};

const modulePrompt = (module: ModuleName) => {
  const prompts: Record<ModuleName, string> = {
    module_1: `You are Event Planning Orchestrator.

Your task is to read the event brief and normalize it into structured data.
You do NOT generate concept, decor, or budget.
You only analyze the input.

TASK
1 Extract main parameters
2 Identify constraints
3 Identify missing data
4 Create assumptions
5 Detect risks
6 Determine event scale

Return ONLY JSON via tool call.`,
    module_2: `You are Russian Event Market Analyst.
Evaluate feasibility and provide market benchmarks.

TASK
1 Evaluate budget realism
2 Identify conflicts
3 Provide Russian market price ranges
4 Determine feasible event level

Return ONLY JSON via tool call.`,
    module_3: `You are Creative Event Director.
Create a realistic event concept and decor system.

TASK
1 Generate concept
2 Define decor system
3 Create spatial zoning

Return ONLY JSON via tool call.`,
    module_4: `You are Event Production Director.
Design event program, timeline and team.

Return ONLY JSON via tool call.`,
    module_5: `You are Event Budget Planner.
Create vendor structure and cost estimate.

Return ONLY JSON via tool call.`,
    module_6: `You are Event Agency Proposal Writer and Visual Prompt Designer.

Return ONLY JSON via tool call.`,
  };

  return prompts[module];
};

const moduleTool = (module: ModuleName) => {
  const tools: Record<ModuleName, any> = {
    module_1: {
      type: "function",
      function: {
        name: "output",
        description: "Normalized analysis data",
        parameters: {
          type: "object",
          properties: {
            analysis: {
              type: "object",
              properties: {
                event_type: { type: "string" },
                event_goal: { type: "string" },
                location: { type: "object", properties: { city: { type: "string" }, region: { type: "string" } }, required: ["city", "region"] },
                venue: { type: "object", properties: { name: { type: "string" }, type: { type: "string" }, indoor_or_outdoor: { type: "string" } }, required: ["name", "type", "indoor_or_outdoor"] },
                guests: { type: "object", properties: { guest_count: { type: "number" }, audience_profile: { type: "string" }, vip: { type: "boolean" } }, required: ["guest_count", "audience_profile", "vip"] },
                style: { type: "object", properties: { event_style: { type: "string" }, mood: { type: "string" }, color_palette: { type: "array", items: { type: "string" } } }, required: ["event_style", "mood", "color_palette"] },
                budget: { type: "object", properties: { total_budget: { type: "number" }, currency: { type: "string" } }, required: ["total_budget", "currency"] },
                requirements: {
                  type: "object",
                  properties: {
                    stage: { type: "boolean" }, led_screen: { type: "boolean" }, photo_zone: { type: "boolean" }, branding: { type: "boolean" }, flowers: { type: "boolean" },
                    catering: { type: "string" }, bar: { type: "boolean" }, dj: { type: "boolean" }, live_band: { type: "boolean" },
                  },
                  required: ["stage", "led_screen", "photo_zone", "branding", "flowers", "catering", "bar", "dj", "live_band"],
                },
                constraints: { type: "array", items: { type: "string" } },
                missing_information: { type: "array", items: { type: "string" } },
                assumptions: { type: "array", items: { type: "string" } },
                risk_flags: { type: "array", items: { type: "string" } },
                event_scale: { type: "string", enum: ["small", "medium", "large"] },
              },
              required: ["event_type", "event_goal", "location", "venue", "guests", "style", "budget", "requirements", "constraints", "missing_information", "assumptions", "risk_flags", "event_scale"],
            },
          },
          required: ["analysis"],
        },
      },
    },
    module_2: {
      type: "function",
      function: {
        name: "output",
        description: "Market research output",
        parameters: {
          type: "object",
          properties: {
            market_research: {
              type: "object",
              properties: {
                budget_fit: {
                  type: "object",
                  properties: {
                    realistic: { type: "boolean" },
                    expected_market_cost: { type: "string" },
                    budget_gap: { type: "string" },
                    explanation: { type: "string" },
                  },
                  required: ["realistic", "expected_market_cost", "budget_gap", "explanation"],
                },
                price_ranges: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    venue: { type: "string" }, decor: { type: "string" }, floral: { type: "string" }, furniture: { type: "string" }, stage: { type: "string" },
                    sound: { type: "string" }, lighting: { type: "string" }, led_screens: { type: "string" }, photo_video: { type: "string" }, host: { type: "string" },
                    performers: { type: "string" }, dj: { type: "string" }, catering: { type: "string" }, bar: { type: "string" }, hostesses: { type: "string" },
                    security: { type: "string" }, printing: { type: "string" }, marketing: { type: "string" }, pr: { type: "string" },
                  },
                  required: ["venue", "decor", "floral", "furniture", "stage", "sound", "lighting", "led_screens", "photo_video", "host", "performers", "dj", "catering", "bar", "hostesses", "security", "printing", "marketing", "pr"],
                },
                critical_budget_areas: { type: "array", items: { type: "string" } },
                feasible_event_level: { type: "string", enum: ["basic", "optimal", "premium"] },
                strategic_notes: { type: "array", items: { type: "string" } },
              },
              required: ["budget_fit", "price_ranges", "critical_budget_areas", "feasible_event_level", "strategic_notes"],
            },
          },
          required: ["market_research"],
        },
      },
    },
    module_3: {
      type: "function",
      function: {
        name: "output",
        description: "Concept and decor output",
        parameters: {
          type: "object",
          properties: {
            concept: { type: "object", properties: { concept_name: { type: "string" }, concept_core: { type: "string" }, emotional_direction: { type: "string" }, guest_experience: { type: "string" }, visual_language: { type: "string" }, dress_code: { type: "string" } }, required: ["concept_name", "concept_core", "emotional_direction", "guest_experience", "visual_language", "dress_code"] },
            decor: { type: "object", properties: { entrance_zone: { type: "string" }, welcome_zone: { type: "string" }, stage_design: { type: "string" }, guest_area: { type: "string" }, table_styling: { type: "string" }, floral_design: { type: "string" }, lighting_design: { type: "string" }, photo_zone: { type: "string" }, branding: { type: "string" } }, required: ["entrance_zone", "welcome_zone", "stage_design", "guest_area", "table_styling", "floral_design", "lighting_design", "photo_zone", "branding"] },
            decor_priority: { type: "object", properties: { must_have: { type: "array", items: { type: "string" } }, optional: { type: "array", items: { type: "string" } }, premium_upgrades: { type: "array", items: { type: "string" } } }, required: ["must_have", "optional", "premium_upgrades"] },
            spatial_plan: { type: "object", properties: { zoning_logic: { type: "string" }, stage_location: { type: "string" }, guest_seating: { type: "string" }, photo_zone_location: { type: "string" }, bar_location: { type: "string" }, lounge_zones: { type: "string" } }, required: ["zoning_logic", "stage_location", "guest_seating", "photo_zone_location", "bar_location", "lounge_zones"] },
          },
          required: ["concept", "decor", "decor_priority", "spatial_plan"],
        },
      },
    },
    module_4: {
      type: "function",
      function: {
        name: "output",
        description: "Program, timeline and team output",
        parameters: {
          type: "object",
          properties: {
            program: {
              type: "object",
              properties: {
                pre_event: { type: "string" },
                guest_arrival: { type: "string" },
                official_opening: { type: "string" },
                main_program: { type: "string" },
                food_networking: { type: "string" },
                entertainment_block: { type: "string" },
                finale: { type: "string" },
                guest_exit: { type: "string" },
              },
              required: ["pre_event", "guest_arrival", "official_opening", "main_program", "food_networking", "entertainment_block", "finale", "guest_exit"],
            },
            timeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  start_time: { type: "string" },
                  end_time: { type: "string" },
                  activity: { type: "string" },
                  responsible_team: { type: "string" },
                  resources_required: { type: "string" },
                },
                required: ["start_time", "end_time", "activity", "responsible_team", "resources_required"],
              },
            },
            team: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  quantity: { type: "number" },
                  responsibility: { type: "string" },
                  event_phase: { type: "string" },
                  priority: { type: "string" },
                },
                required: ["role", "quantity", "responsibility", "event_phase", "priority"],
              },
            },
          },
          required: ["program", "timeline", "team"],
        },
      },
    },
    module_5: {
      type: "function",
      function: {
        name: "output",
        description: "Vendors and budget output",
        parameters: {
          type: "object",
          properties: {
            vendors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  purpose: { type: "string" },
                  vendor_level: { type: "string" },
                  estimated_cost_range: { type: "string" },
                  selection_notes: { type: "string" },
                },
                required: ["category", "purpose", "vendor_level", "estimated_cost_range", "selection_notes"],
              },
            },
            budget: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      budget_item: { type: "string" },
                      min_estimate: { type: "string" },
                      optimal_estimate: { type: "string" },
                      premium_estimate: { type: "string" },
                      confidence_level: { type: "string" },
                      notes: { type: "string" },
                    },
                    required: ["budget_item", "min_estimate", "optimal_estimate", "premium_estimate", "confidence_level", "notes"],
                  },
                },
                summary: {
                  type: "object",
                  properties: {
                    subtotal: { type: "string" },
                    contingency_reserve: { type: "string" },
                    total_estimate: { type: "string" },
                    fit_to_client_budget: { type: "boolean" },
                  },
                  required: ["subtotal", "contingency_reserve", "total_estimate", "fit_to_client_budget"],
                },
                optimization_options: { type: "array", items: { type: "string" } },
              },
              required: ["items", "summary", "optimization_options"],
            },
          },
          required: ["vendors", "budget"],
        },
      },
    },
    module_6: {
      type: "function",
      function: {
        name: "output",
        description: "Commercial and visuals output",
        parameters: {
          type: "object",
          properties: {
            commercial: {
              type: "object",
              properties: {
                executive_summary: { type: "string" },
                concept_pitch: { type: "string" },
                included_services: { type: "array", items: { type: "string" } },
                expected_result: { type: "string" },
                budget_frame: { type: "string" },
                implementation_stages: { type: "array", items: { type: "string" } },
                next_step: { type: "string" },
              },
              required: ["executive_summary", "concept_pitch", "included_services", "expected_result", "budget_frame", "implementation_stages", "next_step"],
            },
            visuals: {
              type: "object",
              properties: {
                moodboard: {
                  type: "object",
                  properties: {
                    palette: { type: "array", items: { type: "string" } },
                    textures: { type: "array", items: { type: "string" } },
                    furniture_style: { type: "string" },
                    floral_language: { type: "string" },
                    lighting_mood: { type: "string" },
                    visual_keywords: { type: "array", items: { type: "string" } },
                    avoid_list: { type: "array", items: { type: "string" } },
                  },
                  required: ["palette", "textures", "furniture_style", "floral_language", "lighting_mood", "visual_keywords", "avoid_list"],
                },
                render_prompt: { type: "string" },
                photo_prompts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      photo_zone: { type: "string" },
                      editing_prompt: { type: "string" },
                      negative_constraints: { type: "string" },
                      realism_notes: { type: "string" },
                    },
                    required: ["photo_zone", "editing_prompt", "negative_constraints", "realism_notes"],
                  },
                },
              },
              required: ["moodboard", "render_prompt", "photo_prompts"],
            },
          },
          required: ["commercial", "visuals"],
        },
      },
    },
  };

  return tools[module];
};

async function runModule(module: ModuleName, context: Record<string, unknown>, apiKey: string) {
  const inputText = JSON.stringify(context, null, 2);

  const data = await geminiChat({
    apiKey,
    model: getTextModel(),
    messages: [
      { role: "system", content: modulePrompt(module) },
      {
        role: "user",
        content: `Input JSON:\n${inputText}\n\nReturn strict JSON only via tool call named output.`,
      },
    ],
    tools: [moduleTool(module)],
    tool_choice: { type: "function", function: { name: "output" } },
    timeoutMs: 40_000,
  });

  const parsed = extractToolCall<Record<string, unknown>>(data);
  if (!parsed) throw new Error(`Invalid model output at ${module}`);
  return parsed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse("INVALID_INPUT", "Body must be valid JSON", 400);
    }

    const brief = (body?.brief || "").trim();
    const regenerateFrom = (body?.regenerate_from || "module_1") as ModuleName;
    const existingData = typeof body?.existing_data === "object" && body?.existing_data ? body.existing_data : {};

    if (!brief) return errorResponse("INVALID_INPUT", "brief is required", 400);
    if (!MODULE_ORDER.includes(regenerateFrom)) {
      return errorResponse("INVALID_INPUT", `regenerate_from must be one of ${MODULE_ORDER.join(", ")}`, 400);
    }

    const apiKey = requireApiKey();
    const startIndex = MODULE_ORDER.indexOf(regenerateFrom);

    const output: Record<string, unknown> = {
      ...GLOBAL_SHAPE,
      ...existingData,
      event_input: {
        ...(typeof existingData?.event_input === "object" && existingData?.event_input ? existingData.event_input : {}),
        brief,
      },
    };

    for (let i = startIndex; i < MODULE_ORDER.length; i += 1) {
      const module = MODULE_ORDER[i];
      const delta = await runModule(module, output, apiKey);
      Object.assign(output, delta);
    }

    return okResponse(output);
  } catch (err) {
    return handleError("event-planner-pipeline", err);
  }
});
