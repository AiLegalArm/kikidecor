/**
 * refine-concept/index.ts
 * AI chat for iteratively refining a generated decoration concept.
 * Receives the current concept + conversation history + user message,
 * returns an updated concept with AI explanation.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  CORS_HEADERS, AI_MODELS, requireApiKey, aiChat,
  extractToolCall, okResponse, handleError, GeminiError, errorResponse,
} from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return errorResponse("INVALID_INPUT", "Request body must be valid JSON", 400);
    }

    const { concept, message, chatHistory } = body;

    if (!concept || !message?.trim()) {
      return errorResponse("INVALID_INPUT", "Required: concept object and message string", 400);
    }

    const API_KEY = requireApiKey();
    console.log(`[refine-concept] Refining "${concept.conceptName}" with: "${message.slice(0, 80)}..."`);

    const systemPrompt = `You are KiKi Decor Studio's creative director. A client has a generated decoration concept and wants to refine it through conversation.

Current concept:
- Name: ${concept.conceptName}
- Description: ${concept.conceptDescription}
- Colors: ${(concept.colorPalette || []).join(", ")}
- Complexity: ${concept.estimatedComplexity || "medium"}
- Elements: ${(concept.decorElements || concept.facadeElements || []).map((e: any) => e.name).join(", ")}

RULES:
1. Respond in Russian
2. If the client asks to CHANGE something in the concept, call the update_concept tool with the updated fields
3. If the client asks a QUESTION or wants advice, respond with text only (no tool call)
4. Only include fields that changed in the update — unchanged fields should be omitted
5. Be specific, creative, and professional`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add chat history
    if (chatHistory?.length) {
      for (const msg of chatHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: message });

    const chatData = await aiChat({
      apiKey: API_KEY,
      model: AI_MODELS.FAST,
      messages,
      tools: [{
        type: "function",
        function: {
          name: "update_concept",
          description: "Update specific fields of the decoration concept based on client feedback",
          parameters: {
            type: "object",
            properties: {
              explanation: { type: "string", description: "Brief explanation of what was changed and why (Russian)" },
              updates: {
                type: "object",
                description: "Only the fields that changed",
                properties: {
                  conceptName: { type: "string" },
                  conceptDescription: { type: "string" },
                  colorPalette: { type: "array", items: { type: "string" } },
                  colorHexCodes: { type: "array", items: { type: "string" } },
                  decorElements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        category: { type: "string" },
                      },
                      required: ["name", "description", "category"],
                    },
                  },
                  flowerArrangements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        flowers: { type: "array", items: { type: "string" } },
                        placement: { type: "string" },
                        style: { type: "string" },
                      },
                      required: ["name", "flowers", "placement", "style"],
                    },
                  },
                  lightingIdeas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        element: { type: "string" },
                        placement: { type: "string" },
                        effect: { type: "string" },
                      },
                      required: ["element", "placement", "effect"],
                    },
                  },
                  backdropIdeas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        purpose: { type: "string" },
                      },
                      required: ["name", "description", "purpose"],
                    },
                  },
                  tableDecoration: {
                    type: "object",
                    properties: {
                      style: { type: "string" },
                      centerpiece: { type: "string" },
                      tableware: { type: "string" },
                      accents: { type: "string" },
                      runner: { type: "string" },
                    },
                  },
                  estimatedComplexity: { type: "string", enum: ["low", "medium", "high", "ultra"] },
                  venueSpecificNotes: { type: "string" },
                  // Facade-specific
                  facadeElements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        placement: { type: "string" },
                        category: { type: "string" },
                      },
                      required: ["name", "description", "placement", "category"],
                    },
                  },
                  lightingPlan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        element: { type: "string" },
                        placement: { type: "string" },
                        effect: { type: "string" },
                      },
                      required: ["element", "placement", "effect"],
                    },
                  },
                  floralInstallations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        flowers: { type: "array", items: { type: "string" } },
                        placement: { type: "string" },
                        scale: { type: "string" },
                      },
                      required: ["name", "flowers", "placement"],
                    },
                  },
                  architecturalNotes: { type: "string" },
                },
              },
            },
            required: ["explanation", "updates"],
          },
        },
      }],
      timeoutMs: 30_000,
    });

    // Check if tool call or text response
    const toolResult = extractToolCall(chatData);
    const textContent = chatData?.choices?.[0]?.message?.content;

    if (toolResult?.updates) {
      // Merge updates into concept
      const updatedConcept = { ...concept, ...toolResult.updates };
      return okResponse({
        type: "update",
        explanation: toolResult.explanation,
        updatedConcept,
      });
    }

    // Text-only response (advice, answer)
    return okResponse({
      type: "message",
      message: textContent || "Не удалось получить ответ от AI.",
    });

  } catch (e) {
    return handleError("refine-concept", e);
  }
});
