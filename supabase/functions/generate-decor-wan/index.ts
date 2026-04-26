// Decor Wan generator: builds a compiled prompt, kicks off video generation,
// and stores the result. Two backends are supported:
//   1. External Wan-compatible API (used when WAN_API_URL + WAN_API_KEY secrets exist)
//   2. Lovable AI Gateway videogen (default fallback, no extra keys required)
// Generation runs in background (EdgeRuntime.waitUntil) so the request returns
// immediately with status="processing"; the client polls wan_runs for updates.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const WAN_API_URL = Deno.env.get("WAN_API_URL");
const WAN_API_KEY = Deno.env.get("WAN_API_KEY");

type Body = {
  userPrompt: string;
  presetId: string;
  presetName?: string;
  compiledPrompt: string;
  motion: Record<string, unknown>;
  mood: Record<string, unknown>;
  output: { resolution?: string; aspectRatio?: string; duration?: number; cameraFixed?: boolean };
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
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You describe interior decor photos for AI video generation. Respond with one concise sentence (max 35 words) capturing composition, mood, materials, and lighting. No preamble." },
          { role: "user", content: [
            { type: "text", text: "Describe this target ending frame:" },
            { type: "image_url", image_url: { url: imageUrl } },
          ]},
        ],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch { return null; }
}

// ---------- BACKEND 1: External Wan-compatible API ----------
// Expects an OpenAI-style endpoint that returns { url } or { video_url } or { id } for polling.
async function generateViaWanApi(opts: {
  prompt: string; negative: string;
  aspectRatio: string; resolution: string; duration: number;
  firstFrameUrl: string | null; lastFrameUrl: string | null; cameraFixed: boolean;
}): Promise<string> {
  const r = await fetch(WAN_API_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${WAN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: opts.prompt,
      negative_prompt: opts.negative || undefined,
      aspect_ratio: opts.aspectRatio,
      resolution: opts.resolution,
      duration: opts.duration,
      first_frame_url: opts.firstFrameUrl || undefined,
      last_frame_url: opts.lastFrameUrl || undefined,
      camera_fixed: opts.cameraFixed,
    }),
  });
  if (!r.ok) throw new Error(`Wan API ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const url = data.url || data.video_url || data.output?.[0] || data.data?.[0]?.url;
  if (!url) throw new Error(`Wan API: no video URL in response: ${JSON.stringify(data).slice(0, 200)}`);
  return url as string;
}

// ---------- BACKEND 2: Lovable AI Gateway videogen ----------
// Uses the videos endpoint of the Lovable AI Gateway with a supported model.
async function generateViaLovable(opts: {
  prompt: string;
  aspectRatio: string; resolution: string; duration: number;
  firstFrameUrl: string | null; cameraFixed: boolean;
}): Promise<string> {
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is missing — enable AI for this project");

  const payload: Record<string, unknown> = {
    model: "google/veo-3-fast",
    prompt: opts.prompt,
    duration: opts.duration === 10 ? 10 : 5,
    resolution: opts.resolution === "480p" ? "480p" : "1080p",
    aspect_ratio: opts.aspectRatio,
    camera_fixed: opts.cameraFixed,
  };
  if (opts.firstFrameUrl) payload.starting_frame = opts.firstFrameUrl;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/videos/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const text = await r.text();
    if (r.status === 429) throw new Error("Rate limit reached. Try again shortly.");
    if (r.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
    throw new Error(`Lovable videogen ${r.status}: ${text.slice(0, 300)}`);
  }
  const data = await r.json();
  const url = data.data?.[0]?.url || data.url || data.video_url;
  if (!url) throw new Error(`Lovable videogen: no URL in response: ${JSON.stringify(data).slice(0, 200)}`);
  return url as string;
}

// Download video and re-host in our public bucket so it survives provider URLs expiring.
async function rehost(admin: ReturnType<typeof createClient>, sourceUrl: string, runId: string): Promise<string> {
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) return sourceUrl;
    const blob = await res.arrayBuffer();
    const path = `runs/${runId}.mp4`;
    const { error } = await admin.storage.from("wan-videos").upload(path, blob, {
      contentType: "video/mp4", upsert: true,
    });
    if (error) return sourceUrl;
    const { data } = admin.storage.from("wan-videos").getPublicUrl(path);
    return data.publicUrl;
  } catch { return sourceUrl; }
}

async function runGeneration(
  admin: ReturnType<typeof createClient>,
  runId: string,
  finalPrompt: string,
  body: Body,
) {
  const started = Date.now();
  try {
    const out = body.output || {};
    const aspectRatio = (out.aspectRatio as string) || "16:9";
    const resolution = (out.resolution as string) || "1080p";
    const duration = Number(out.duration) === 10 ? 10 : 5;
    const cameraFixed = !!out.cameraFixed;

    let videoUrl: string;
    if (WAN_API_URL && WAN_API_KEY) {
      videoUrl = await generateViaWanApi({
        prompt: finalPrompt,
        negative: body.negativePrompt || "",
        aspectRatio, resolution, duration,
        firstFrameUrl: body.firstFrameUrl || null,
        lastFrameUrl: body.lastFrameUrl || null,
        cameraFixed,
      });
    } else {
      videoUrl = await generateViaLovable({
        prompt: finalPrompt,
        aspectRatio, resolution, duration,
        firstFrameUrl: body.firstFrameUrl || null,
        cameraFixed,
      });
    }

    const hosted = await rehost(admin, videoUrl, runId);
    await admin.from("wan_runs").update({
      status: "completed",
      video_url: hosted,
      duration_ms: Date.now() - started,
      error_message: null,
    }).eq("id", runId);
  } catch (e) {
    console.error("[generate-decor-wan] generation failed", e);
    await admin.from("wan_runs").update({
      status: "failed",
      error_message: (e as Error).message,
      duration_ms: Date.now() - started,
    }).eq("id", runId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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
        finalPrompt = finalPrompt.replace(
          /Last frame target:[^\n]*/,
          `Last frame target: ${lastFrameDescription}`,
        );
        if (!/Last frame target:/.test(finalPrompt)) {
          finalPrompt += `\nEnding frame should resemble: ${lastFrameDescription}`;
        }
      }
    }

    const backend = WAN_API_URL && WAN_API_KEY ? "wan-api" : "lovable-videogen";

    const { data: run, error: insErr } = await admin
      .from("wan_runs")
      .insert({
        user_id: userId,
        status: "processing",
        user_prompt: body.userPrompt,
        compiled_prompt: finalPrompt,
        preset_id: body.presetId,
        preset_name: body.presetName,
        first_frame_url: body.firstFrameUrl ?? null,
        last_frame_url: body.lastFrameUrl ?? null,
        last_frame_description: lastFrameDescription,
        motion: body.motion ?? {},
        mood: body.mood ?? {},
        output: { ...(body.output ?? {}), backend },
        negative_prompt: body.negativePrompt ?? null,
        style_strength: body.styleStrength ?? 60,
      })
      .select("id, compiled_prompt, last_frame_description")
      .single();

    if (insErr || !run) {
      return new Response(JSON.stringify({ error: insErr?.message || "insert failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Kick off generation in background; respond immediately so the client can poll.
    // @ts-ignore - EdgeRuntime is available in Supabase edge runtime
    EdgeRuntime.waitUntil(runGeneration(admin, run.id, finalPrompt, body));

    return new Response(JSON.stringify({
      ok: true,
      runId: run.id,
      backend,
      status: "processing",
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
