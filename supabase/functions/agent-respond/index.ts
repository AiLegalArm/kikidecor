// KiKi Concierge: business-only AI agent.
// Pipeline: scope guard (flash-lite) → KB retrieval (FTS) → structured data tool-calls
// → main composer (flash-preview) → policy validator → persist & return.
//
// Two modes:
//   - mode="playground"    → does NOT persist a conversation; admin-only debug.
//   - mode="conversation"  → requires conversationId; appends customer + agent messages.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL_GUARD = "google/gemini-2.5-flash-lite";
const MODEL_MAIN = "google/gemini-3-flash-preview";

type ScopeClass = "business" | "off_topic" | "abusive" | "handoff_request" | "small_talk";

type Body = {
  mode: "playground" | "conversation";
  conversationId?: string;
  channel?: "telegram" | "instagram" | "facebook" | "playground";
  text: string;
  language?: "ru" | "en";
};

async function callGateway(payload: any) {
  const r = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (r.status === 429) throw new Error("RATE_LIMIT: AI gateway rate limit, try again shortly");
  if (r.status === 402) throw new Error("PAYMENT_REQUIRED: Add Lovable AI credits");
  if (!r.ok) throw new Error(`Gateway ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return await r.json();
}

function detectLang(text: string): "ru" | "en" {
  return /[а-яёА-ЯЁ]/.test(text) ? "ru" : "en";
}

function channelStyleHint(channel?: string) {
  switch (channel) {
    case "instagram":
      return "Channel: Instagram DM. Reply must be 1–2 short messages, max ~280 chars total, one CTA.";
    case "facebook":
      return "Channel: Facebook Messenger. Reply must be 2–3 short messages, trustworthy tone, may include link to website.";
    case "telegram":
      return "Channel: Telegram. Reply max ~600 chars, can use brief lists.";
    default:
      return "Channel: Playground. Reply max ~500 chars.";
  }
}

// ───────── Scope guard ─────────
async function classifyScope(text: string, escalationKeywords: string[]): Promise<{ scope: ScopeClass; confidence: number }> {
  const lower = text.toLowerCase();
  const hitKeyword = escalationKeywords.find((k) => lower.includes(k.toLowerCase()));
  if (hitKeyword) return { scope: "handoff_request", confidence: 0.95 };

  const res = await callGateway({
    model: MODEL_GUARD,
    messages: [
      {
        role: "system",
        content:
          "Classify a customer message for an event-decor + showroom business assistant. Output strict JSON only: " +
          '{"scope":"business|off_topic|abusive|handoff_request|small_talk","confidence":0.0-1.0}. ' +
          "business = anything about decor services, portfolio, ordering, consultations, dates, prices, showroom products, contacts. " +
          "off_topic = general knowledge, politics, medical/legal/financial advice, code help, etc. " +
          "small_talk = greetings only with no business question. " +
          "abusive = insults/threats. handoff_request = explicit ask for human, complaint, refund, dispute.",
      },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
    max_tokens: 60,
  });
  try {
    const obj = JSON.parse(res.choices?.[0]?.message?.content || "{}");
    return { scope: (obj.scope as ScopeClass) || "business", confidence: Number(obj.confidence) || 0.5 };
  } catch {
    return { scope: "business", confidence: 0.4 };
  }
}

// ───────── KB retrieval ─────────
async function retrieveKB(admin: any, query: string, language: string) {
  const { data, error } = await admin.rpc("kb_search_chunks", {
    query_text: query,
    match_count: 5,
    filter_language: language,
  });
  if (error) {
    console.warn("[agent-respond] kb_search_chunks error", error);
    return [];
  }
  return (data || []) as Array<{ chunk_id: string; document_id: string; chunk_text: string; rank: number; document_title: string; document_source: string }>;
}

// ───────── Structured business data ─────────
async function loadStructured(admin: any, language: string) {
  const [pkgRes, datesRes, worksRes] = await Promise.all([
    admin.from("packages").select("name,name_en,subtitle,subtitle_en,price_from,price_to,currency,features,features_en,is_active").eq("is_active", true).order("sort_order"),
    admin.from("blocked_dates").select("blocked_date,reason").gte("blocked_date", new Date().toISOString().slice(0, 10)).order("blocked_date").limit(40),
    admin.from("works").select("title,title_en,description,description_en,event_date,price_range,tags").eq("status", "published").order("sort_order").limit(8),
  ]);
  const packages = (pkgRes.data || []).map((p: any) => ({
    name: language === "en" ? (p.name_en || p.name) : p.name,
    subtitle: language === "en" ? (p.subtitle_en || p.subtitle) : p.subtitle,
    price: p.price_to ? `${p.price_from}–${p.price_to} ${p.currency}` : `from ${p.price_from} ${p.currency}`,
    features: language === "en" ? (p.features_en || p.features) : p.features,
  }));
  const blockedDates = (datesRes.data || []).map((d: any) => d.blocked_date);
  const works = (worksRes.data || []).map((w: any) => ({
    title: language === "en" ? (w.title_en || w.title) : w.title,
    summary: language === "en" ? (w.description_en || w.description) : w.description,
    date: w.event_date,
    price_range: w.price_range,
    tags: w.tags,
  }));
  return { packages, blockedDates, works };
}

// ───────── Build system prompt ─────────
function buildSystemPrompt(policies: any, language: string, channelHint: string, structured: any, kbChunks: any[]) {
  const refusal = language === "en" ? policies.refusal_template_en : policies.refusal_template_ru;
  const handoff = language === "en" ? policies.handoff_template_en : policies.handoff_template_ru;

  const kbBlock = kbChunks.length
    ? kbChunks.map((c, i) => `[#${i + 1}] (${c.document_source}) ${c.document_title}\n${c.chunk_text}`).join("\n\n")
    : "(no KB chunks matched)";

  return `You are KiKi Concierge — the official assistant of KiKi studio (event decor + showroom).

TONE: ${policies.tone_voice}
REPLY LANGUAGE: ${language === "en" ? "English" : "Russian"}.
${channelHint}

SCOPE — answer ONLY about:
${(policies.allowed_topics || []).map((t: string) => `- ${t}`).join("\n")}

NEVER answer about:
${(policies.blocked_topics || []).map((t: string) => `- ${t}`).join("\n")}

ANTI-HALLUCINATION RULES (critical):
- Use ONLY facts from APPROVED KNOWLEDGE and STRUCTURED DATA below.
- NEVER invent prices, dates, guarantees, discounts, deadlines.
- If the requested info is missing, reply briefly that you'll connect a manager and DO NOT guess.
- Date availability MUST be verified against BLOCKED DATES (treat blocked dates as unavailable; everything else is "likely available, manager will confirm").
- Prices MUST come from PACKAGES list. If user asks a custom estimate — say a manager will confirm.
- Do not mention being an AI/model.
- If the user asks anything outside scope, reply with this refusal verbatim and suggest 1 relevant decor topic:
  "${refusal}"
- If escalation is needed (complaint, refund, dispute, custom complex case, sensitive matter), reply with this handoff line and stop:
  "${handoff}"

STRUCTURED DATA (authoritative):
PACKAGES: ${JSON.stringify(structured.packages).slice(0, 3000)}
BLOCKED DATES (next 40, do not promise these): ${JSON.stringify(structured.blockedDates)}
RECENT WORKS: ${JSON.stringify(structured.works).slice(0, 2000)}

APPROVED KNOWLEDGE (cite these chunks if relevant, do not paste raw):
${kbBlock}

QUALIFICATION: when the user shows clear interest in booking, gently collect:
${(policies.qualification_questions || []).map((q: any) => `- ${language === "en" ? q.label_en : q.label_ru}${q.required ? " (required)" : ""}`).join("\n")}
Ask 1–2 questions per turn, never all at once. Once contact is collected, confirm and say a manager will follow up.

OUTPUT: a single concise reply, no markdown headings, no emoji spam. End with at most one short CTA question.`;
}

// ───────── Policy validator ─────────
const FORBIDDEN_PATTERNS = [
  /\bguarante\w*/i, /\bгарантир/i,
  /\bдефинитивн/i, /\bточ?но\s+будет/i,
  /\b(скидк[аи]|sale|discount)\s*(?:\d|%)/i,
  /\b(?:бесплатн\w+|free of charge)\b/i,
  /\b(?:обещ\w+|promise|promis\w+)\b/i,
];

// Detect invented contacts (phones / emails) — agent must never fabricate these.
const PHONE_RE = /(?:\+?\d[\d\-\s().]{7,}\d)/;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

function validatePolicy(reply: string, structured: any, kbChunks: any[]): { ok: boolean; reason?: string } {
  for (const re of FORBIDDEN_PATTERNS) if (re.test(reply)) return { ok: false, reason: "forbidden_phrase" };
  // Hallucinated date promise check
  for (const d of structured.blockedDates || []) {
    if (reply.includes(d)) return { ok: false, reason: "blocked_date_promised" };
  }
  // Contact fabrication: any phone/email in reply must appear in approved KB chunks.
  const kbText = (kbChunks || []).map((c: any) => c.chunk_text).join("\n");
  const phoneMatch = reply.match(PHONE_RE);
  if (phoneMatch && !kbText.includes(phoneMatch[0])) return { ok: false, reason: "invented_phone" };
  const emailMatch = reply.match(EMAIL_RE);
  if (emailMatch && !kbText.toLowerCase().includes(emailMatch[0].toLowerCase())) return { ok: false, reason: "invented_email" };
  return { ok: true };
}

// ───────── Main handler ─────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, { global: { headers: { Authorization: auth } } });
    const { data: u, error: uerr } = await userClient.auth.getUser();
    if (uerr || !u.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: role } = await admin.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = (await req.json()) as Body;
    if (!body.text?.trim()) {
      return new Response(JSON.stringify({ error: "text required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const language = body.language || detectLang(body.text);

    // Load policies
    const { data: policies } = await admin.from("agent_policies").select("*").eq("id", 1).maybeSingle();
    if (!policies) throw new Error("agent_policies not initialized");

    if (policies.ai_globally_paused) {
      const reply = language === "en"
        ? "Thanks for reaching out — our team will reply personally shortly."
        : "Спасибо за сообщение — наш менеджер свяжется с вами в ближайшее время.";
      return new Response(JSON.stringify({ reply, scope: "paused", retrievedChunks: [], escalate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Scope guard
    const { scope, confidence } = await classifyScope(body.text, policies.escalation_keywords || []);

    let escalate = false;
    if (scope === "handoff_request" || scope === "abusive") escalate = true;
    if (confidence < Number(policies.confidence_threshold || 0.55)) escalate = true;

    // Short-circuit: off_topic → strict refusal; abusive/handoff_request → handoff template.
    if (scope === "off_topic") {
      const refusal = language === "en" ? policies.refusal_template_en : policies.refusal_template_ru;
      const result = { reply: refusal, scope, confidence, retrievedChunks: [], escalate: false, policyPassed: true };
      await persistIfConversation(admin, body, result);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (scope === "abusive" || scope === "handoff_request") {
      const handoff = language === "en" ? policies.handoff_template_en : policies.handoff_template_ru;
      const result = { reply: handoff, scope, confidence, retrievedChunks: [], escalate: true, policyPassed: true };
      await persistIfConversation(admin, body, result);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. KB retrieval + structured data
    const [kbChunks, structured] = await Promise.all([
      retrieveKB(admin, body.text, language),
      loadStructured(admin, language),
    ]);

    // 3. Conversation history (if conversation mode)
    let history: Array<{ role: string; content: string }> = [];
    if (body.mode === "conversation" && body.conversationId) {
      const { data: msgs } = await admin
        .from("messaging_messages")
        .select("role, content")
        .eq("conversation_id", body.conversationId)
        .order("created_at", { ascending: false })
        .limit(20);
      history = (msgs || []).reverse().map((m: any) => ({
        role: m.role === "customer" ? "user" : (m.role === "human" || m.role === "agent" ? "assistant" : "system"),
        content: m.content,
      }));
    }

    // 4. Composer
    const systemPrompt = buildSystemPrompt(policies, language, channelStyleHint(body.channel), structured, kbChunks);
    const composeRes = await callGateway({
      model: MODEL_MAIN,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: body.text },
      ],
      max_tokens: 600,
      temperature: 0.5,
    });
    let reply = (composeRes.choices?.[0]?.message?.content || "").trim();
    if (!reply) {
      reply = language === "en" ? policies.handoff_template_en : policies.handoff_template_ru;
      escalate = true;
    }

    // 5. Policy validator
    const policyCheck = validatePolicy(reply, structured, kbChunks);
    if (!policyCheck.ok) {
      console.warn("[agent-respond] policy violation", policyCheck.reason, reply);
      reply = language === "en" ? policies.handoff_template_en : policies.handoff_template_ru;
      escalate = true;
    }

    // Detect explicit handoff phrasing in reply
    if (reply.includes(policies.handoff_template_ru) || reply.includes(policies.handoff_template_en)) {
      escalate = true;
    }

    const result = {
      reply,
      scope,
      confidence,
      retrievedChunks: kbChunks.map((c) => ({ id: c.chunk_id, title: c.document_title, source: c.document_source, rank: c.rank })),
      escalate,
      policyPassed: policyCheck.ok,
      model: MODEL_MAIN,
      language,
    };

    await persistIfConversation(admin, body, result);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[agent-respond]", e);
    const msg = (e as Error).message || "internal_error";
    const status = msg.startsWith("RATE_LIMIT") ? 429 : msg.startsWith("PAYMENT_REQUIRED") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function persistIfConversation(admin: any, body: Body, result: any) {
  if (body.mode !== "conversation" || !body.conversationId) return;
  await admin.from("messaging_messages").insert([
    { conversation_id: body.conversationId, role: "customer", content: body.text },
    {
      conversation_id: body.conversationId,
      role: "agent",
      content: result.reply,
      ai_metadata: {
        model: result.model,
        scope: result.scope,
        confidence: result.confidence,
        retrieved_chunks: result.retrievedChunks,
        policy_passed: result.policyPassed,
        escalated: result.escalate,
      },
    },
  ]);
  await admin.from("messaging_conversations").update({
    last_message_at: new Date().toISOString(),
    last_message_preview: result.reply.slice(0, 140),
    status: result.escalate ? "pending_human" : undefined,
    ai_paused: result.escalate ? true : undefined,
  }).eq("id", body.conversationId);
}