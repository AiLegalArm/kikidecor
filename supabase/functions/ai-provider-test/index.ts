import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { aiChat, getAIConfig, invalidateAIConfigCache, CORS_HEADERS } from "../_shared/gemini.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    const sb = createClient(url, service);
    const { data: roleRow } = await sb.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ ok: false, error: "forbidden" }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

    invalidateAIConfigCache();
    const cfg = await getAIConfig();

    const t0 = Date.now();
    const data = await aiChat({
      apiKey: cfg.apiKey,
      model: cfg.models.fast,
      messages: [{ role: "user", content: "Reply with the single word: pong" }],
      timeoutMs: 20_000,
      maxRetries: 0,
    });
    const latencyMs = Date.now() - t0;
    const preview = (data?.choices?.[0]?.message?.content ?? "").slice(0, 60);

    return new Response(JSON.stringify({ ok: true, provider: cfg.provider, model: cfg.models.fast, latencyMs, preview }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});