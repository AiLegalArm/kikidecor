// Decor Wan generator: builds a compiled prompt, optionally enriches with vision
// analysis of the Last Frame, persists the run, and returns the result.
// Video generation itself is performed in a follow-up step (external Wan endpoint
// or in-app videogen). The function is admin-gated via JWT verification.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

type Body = {
  userPrompt: string;
  presetId: string;
  presetName?: string;
  compiledPrompt: string;
  motion: Record<string, unknown>;
  mood: Record<string, unknown>;
  output: Record<string, unknown>;
  negativePrompt?: string;
  styleStrength?: number;
  firstFrameUrl?: string | null;
  lastFrameUrl?: string | null;
};

async function describeLastFrame(imageUrl: string): Promise<string | null> {
  if (!LOVABLE_API_KEY) return null;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You describe interior decor photos for AI video generation. Respond with one concise sentence (max 35 words) capturing composition, mood, materials, and lighting. No preamble.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this target ending frame:" },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const text: string | undefined = data.choices?.[0]?.message?.content;
    return text?.trim() || null;
  } catch (_) {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify admin via user JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body.userPrompt?.trim() || !body.compiledPrompt?.trim()) {
      return new Response(JSON.stringify({ error: "userPrompt and compiledPrompt are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional vision enrichment of last frame
    let lastFrameDescription: string | null = null;
    let finalPrompt = body.compiledPrompt;
    if (body.lastFrameUrl) {
      lastFrameDescription = await describeLastFrame(body.lastFrameUrl);
      if (lastFrameDescription) {
        const targetLine = `Last frame target: end the shot on a composition that resembles — ${lastFrameDescription}. Smoothly evolve toward this ending.`;
        if (finalPrompt.includes("Last frame target:")) {
          // Replace the placeholder line built on the client with the vision-enriched one
          finalPrompt = finalPrompt.replace(/Last frame target:[^\n]*/g, targetLine);
        } else {
          // Insert right after First-frame line, or before Style block, or at the start
          const lines = finalPrompt.split("\n");
          let insertAt = lines.findIndex((l) => l.startsWith("Style:"));
          if (insertAt === -1) insertAt = 1;
          lines.splice(insertAt, 0, targetLine);
          finalPrompt = lines.join("\n");
        }
      }
    }

    // Persist run as awaiting external video generation
    const { data: run, error: insErr } = await admin
      .from("wan_runs")
      .insert({
        user_id: userId,
        status: "awaiting_video",
        user_prompt: body.userPrompt,
        compiled_prompt: finalPrompt,
        preset_id: body.presetId,
        preset_name: body.presetName,
        first_frame_url: body.firstFrameUrl ?? null,
        last_frame_url: body.lastFrameUrl ?? null,
        last_frame_description: lastFrameDescription,
        motion: body.motion ?? {},
        mood: body.mood ?? {},
        output: body.output ?? {},
        negative_prompt: body.negativePrompt ?? null,
        style_strength: body.styleStrength ?? 60,
      })
      .select("id, compiled_prompt, last_frame_description")
      .single();

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      runId: run.id,
      compiledPrompt: run.compiled_prompt,
      lastFrameDescription: run.last_frame_description,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[generate-decor-wan]", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});