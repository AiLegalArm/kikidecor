// Re-chunk KB documents into kb_chunks. Lexical FTS — no external embeddings needed.
// Admin-only. Re-runs for a single document or for all published.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function chunk(text: string, maxLen = 700): string[] {
  const clean = text.replace(/\r/g, "").trim();
  if (!clean) return [];
  // Split by paragraphs first, then accumulate up to maxLen.
  const paras = clean.split(/\n{2,}/);
  const out: string[] = [];
  let buf = "";
  for (const p of paras) {
    if ((buf + "\n\n" + p).length > maxLen && buf) {
      out.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  // If a paragraph itself is too long, hard-split it
  const final: string[] = [];
  for (const c of out) {
    if (c.length <= maxLen * 1.4) { final.push(c); continue; }
    for (let i = 0; i < c.length; i += maxLen) final.push(c.slice(i, i + maxLen));
  }
  return final;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u, error: uerr } = await userClient.auth.getUser();
    if (uerr || !u.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: role } = await admin.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const documentId: string | undefined = body.documentId;

    let docsQ = admin.from("kb_documents").select("id, content, language, status");
    if (documentId) docsQ = docsQ.eq("id", documentId);
    else docsQ = docsQ.eq("status", "published");
    const { data: docs, error: derr } = await docsQ;
    if (derr) throw derr;

    let totalChunks = 0;
    for (const d of docs ?? []) {
      // Drop old chunks
      await admin.from("kb_chunks").delete().eq("document_id", d.id);
      const pieces = chunk(d.content || "");
      if (pieces.length === 0) continue;
      const rows = pieces.map((text, i) => ({
        document_id: d.id,
        chunk_index: i,
        chunk_text: text,
        token_count: Math.round(text.length / 4),
        language: d.language || "ru",
      }));
      const { error: insErr } = await admin.from("kb_chunks").insert(rows);
      if (insErr) throw insErr;
      totalChunks += rows.length;
      await admin.from("kb_documents").update({ embedded_at: new Date().toISOString() }).eq("id", d.id);
    }

    return new Response(JSON.stringify({ ok: true, documents: docs?.length ?? 0, chunks: totalChunks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[kb-rebuild]", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});