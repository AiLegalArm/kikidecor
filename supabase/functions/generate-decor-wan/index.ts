// Decor Wan generator: builds a compiled prompt, kicks off video generation,
// and stores the result. Backends (priority order):
//   1. Alibaba Cloud DashScope Wan 2.2 (DASHSCOPE_API_KEY) — recommended
//   2. fal.ai Wan 2.2 (FAL_API_KEY)
//   3. Custom Wan-compatible endpoint (WAN_API_URL + WAN_API_KEY)
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
const DASHSCOPE_API_KEY = Deno.env.get("DASHSCOPE_API_KEY");
// International endpoint (Singapore). For mainland accounts switch host to dashscope.aliyuncs.com.
const DASHSCOPE_HOST = Deno.env.get("DASHSCOPE_HOST") || "https://dashscope-intl.aliyuncs.com";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

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
  model?: "wan2.2-plus" | "wan2.5-preview" | "veo-3.0" | "veo-3.0-fast";
  provider?: "dashscope" | "veo";
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

// ---------- BACKEND 2: fal.ai Wan 2.2 (image-to-video) ----------
// Used when FAL_API_KEY is set. Endpoint: https://fal.run/fal-ai/wan/v2.2-5b/image-to-video
// or text-to-video when no first frame is supplied.
async function generateViaFal(opts: {
  prompt: string; negative: string;
  aspectRatio: string; resolution: string; duration: number;
  firstFrameUrl: string | null; cameraFixed: boolean;
}): Promise<string> {
  const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
  if (!FAL_API_KEY) throw new Error("FAL_API_KEY missing");

  const useImage = !!opts.firstFrameUrl;
  const endpoint = useImage
    ? "https://fal.run/fal-ai/wan/v2.2-5b/image-to-video"
    : "https://fal.run/fal-ai/wan/v2.2-5b/text-to-video";

  const payload: Record<string, unknown> = {
    prompt: opts.prompt,
    negative_prompt: opts.negative || undefined,
    aspect_ratio: opts.aspectRatio,
    resolution: opts.resolution === "480p" ? "480p" : "720p",
    num_frames: opts.duration === 10 ? 161 : 81,
    enable_safety_checker: true,
  };
  if (useImage) payload.image_url = opts.firstFrameUrl;

  const r = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`fal.ai Wan ${r.status}: ${text.slice(0, 300)}`);
  }
  const data = await r.json();
  const url = data.video?.url || data.url || data.video_url;
  if (!url) throw new Error(`fal.ai: no video URL in response: ${JSON.stringify(data).slice(0, 200)}`);
  return url as string;
}

// ---------- BACKEND 3: Alibaba Cloud DashScope (Wan 2.2) ----------
// Async API: POST creates a task, then poll GET /tasks/{id} until SUCCEEDED/FAILED.
// Models: wan2.2-t2v-plus (text-to-video), wan2.2-i2v-plus (image-to-video, first frame).
async function generateViaDashScope(opts: {
  prompt: string; negative: string;
  aspectRatio: string; resolution: string; duration: number;
  firstFrameUrl: string | null;
  modelChoice: "wan2.2-plus" | "wan2.5-preview";
}): Promise<string> {
  const useImage = !!opts.firstFrameUrl;
  const modelMap: Record<string, { t2v: string; i2v: string }> = {
    "wan2.2-plus":    { t2v: "wan2.2-t2v-plus",     i2v: "wan2.2-i2v-plus" },
    "wan2.5-preview": { t2v: "wan2.5-t2v-preview",  i2v: "wan2.5-i2v-preview" },
  };
  const choice = modelMap[opts.modelChoice] ?? modelMap["wan2.2-plus"];
  const model = useImage ? choice.i2v : choice.t2v;

  // DashScope expects "size" as WxH. Map common aspect ratios at 720p/1080p.
  const sizeMap: Record<string, { "720p": string; "1080p": string; "480p": string }> = {
    "16:9": { "480p": "832*480",  "720p": "1280*720",  "1080p": "1920*1080" },
    "9:16": { "480p": "480*832",  "720p": "720*1280",  "1080p": "1080*1920" },
    "1:1":  { "480p": "624*624",  "720p": "960*960",   "1080p": "1440*1440" },
    "4:3":  { "480p": "624*468",  "720p": "960*720",   "1080p": "1440*1080" },
    "3:4":  { "480p": "468*624",  "720p": "720*960",   "1080p": "1080*1440" },
  };
  const res = (["480p","720p","1080p"].includes(opts.resolution) ? opts.resolution : "1080p") as "480p"|"720p"|"1080p";
  const ar = sizeMap[opts.aspectRatio] ? opts.aspectRatio : "16:9";
  const size = sizeMap[ar][res];

  const input: Record<string, unknown> = { prompt: opts.prompt };
  if (opts.negative) input.negative_prompt = opts.negative;
  if (useImage) input.img_url = opts.firstFrameUrl;

  const parameters: Record<string, unknown> = {
    size,
    duration: opts.duration === 10 ? 10 : 5,
    prompt_extend: true,
  };

  // Submit task
  const submit = await fetch(`${DASHSCOPE_HOST}/api/v1/services/aigc/video-generation/video-synthesis`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({ model, input, parameters }),
  });
  if (!submit.ok) {
    const text = await submit.text();
    throw new Error(`DashScope submit ${submit.status}: ${text.slice(0, 400)}`);
  }
  const submitData = await submit.json();
  const taskId = submitData?.output?.task_id;
  if (!taskId) throw new Error(`DashScope: no task_id in response: ${JSON.stringify(submitData).slice(0, 300)}`);

  // Poll up to ~10 minutes
  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    const poll = await fetch(`${DASHSCOPE_HOST}/api/v1/tasks/${taskId}`, {
      headers: { "Authorization": `Bearer ${DASHSCOPE_API_KEY}` },
    });
    if (!poll.ok) continue;
    const pd = await poll.json();
    const status = pd?.output?.task_status;
    if (status === "SUCCEEDED") {
      const url = pd?.output?.video_url;
      if (!url) throw new Error(`DashScope SUCCEEDED but no video_url: ${JSON.stringify(pd).slice(0, 300)}`);
      return url as string;
    }
    if (status === "FAILED" || status === "UNKNOWN") {
      throw new Error(`DashScope task ${status}: ${pd?.output?.message || JSON.stringify(pd).slice(0, 300)}`);
    }
    // PENDING / RUNNING → keep polling
  }
  throw new Error("DashScope task timed out after 10 minutes");
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
    if (DASHSCOPE_API_KEY) {
      videoUrl = await generateViaDashScope({
        prompt: finalPrompt,
        negative: body.negativePrompt || "",
        aspectRatio, resolution, duration,
        firstFrameUrl: body.firstFrameUrl || null,
        modelChoice: body.model || "wan2.2-plus",
      });
    } else if (WAN_API_URL && WAN_API_KEY) {
      videoUrl = await generateViaWanApi({
        prompt: finalPrompt,
        negative: body.negativePrompt || "",
        aspectRatio, resolution, duration,
        firstFrameUrl: body.firstFrameUrl || null,
        lastFrameUrl: body.lastFrameUrl || null,
        cameraFixed,
      });
    } else if (Deno.env.get("FAL_API_KEY")) {
      videoUrl = await generateViaFal({
        prompt: finalPrompt,
        negative: body.negativePrompt || "",
        aspectRatio, resolution, duration,
        firstFrameUrl: body.firstFrameUrl || null,
        cameraFixed,
      });
    } else {
      throw new Error(
        "Не настроен видео-бэкенд. Добавьте DASHSCOPE_API_KEY (Alibaba Cloud Wan 2.2, рекомендуется), FAL_API_KEY (fal.ai Wan 2.2) или WAN_API_URL + WAN_API_KEY для собственного эндпоинта.",
      );
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

    const backend = DASHSCOPE_API_KEY
      ? "dashscope-wan-2.2"
      : WAN_API_URL && WAN_API_KEY
        ? "wan-api"
        : Deno.env.get("FAL_API_KEY")
          ? "fal-wan-2.2"
          : "unconfigured";

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
        output: { ...(body.output ?? {}), backend, model: body.model || "wan2.2-plus" },
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
