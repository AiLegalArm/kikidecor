// Webhook for the CUSTOMER-facing Telegram bot (separate from the admin bot).
// Receives updates → upserts conversation → calls agent-respond → sends reply back.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CUSTOMER_BOT_TOKEN = Deno.env.get("TELEGRAM_CUSTOMER_BOT_TOKEN");
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_CUSTOMER_WEBHOOK_SECRET");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function sendTelegram(chatId: number, text: string) {
  if (!CUSTOMER_BOT_TOKEN) throw new Error("TELEGRAM_CUSTOMER_BOT_TOKEN not configured");
  await fetch(`https://api.telegram.org/bot${CUSTOMER_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Verify Telegram secret token
  if (WEBHOOK_SECRET) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== WEBHOOK_SECRET) {
      return new Response("forbidden", { status: 403, headers: corsHeaders });
    }
  }

  try {
    const update = await req.json();
    const msg = update.message;
    if (!msg?.text) return new Response("ok", { headers: corsHeaders });

    const chatId: number = msg.chat.id;
    const externalThreadId = String(chatId);
    const userId = String(msg.from?.id ?? chatId);
    const displayName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") || null;
    const handle = msg.from?.username ? "@" + msg.from.username : null;
    const text: string = msg.text.trim();

    // Upsert conversation
    const { data: existing } = await supabase
      .from("messaging_conversations")
      .select("id, ai_paused, status")
      .eq("channel", "telegram")
      .eq("external_thread_id", externalThreadId)
      .maybeSingle();

    let conversationId: string;
    if (existing) {
      conversationId = existing.id;
      await supabase.from("messaging_conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: text.slice(0, 200),
          unread_count: 1, // simple bump; will reset on view
          customer_display_name: displayName,
          customer_handle: handle,
        })
        .eq("id", conversationId);
    } else {
      const { data: created, error } = await supabase
        .from("messaging_conversations")
        .insert({
          channel: "telegram",
          external_thread_id: externalThreadId,
          external_user_id: userId,
          customer_display_name: displayName,
          customer_handle: handle,
          last_message_preview: text.slice(0, 200),
          unread_count: 1,
        })
        .select("id, ai_paused")
        .single();
      if (error) throw error;
      conversationId = created.id;
    }

    // Persist customer message
    await supabase.from("messaging_messages").insert({
      conversation_id: conversationId,
      role: "customer",
      content: text,
      external_message_id: String(msg.message_id),
    });

    // Handle /start specially
    if (text === "/start") {
      const greeting = "Здравствуйте! 👋 Я ассистент студии KiKi. Помогу подобрать оформление для вашего события, рассказать о пакетах и проверить свободные даты. Чем могу помочь?";
      await sendTelegram(chatId, greeting);
      await supabase.from("messaging_messages").insert({
        conversation_id: conversationId, role: "agent", content: greeting,
      });
      return new Response("ok", { headers: corsHeaders });
    }

    // Skip agent if paused (operator handling)
    const { data: convNow } = await supabase
      .from("messaging_conversations")
      .select("ai_paused")
      .eq("id", conversationId)
      .maybeSingle();
    if (convNow?.ai_paused) {
      return new Response("ok", { headers: corsHeaders });
    }

    // Call agent
    const agentRes = await fetch(`${SUPABASE_URL}/functions/v1/agent-respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        mode: "conversation",
        conversationId,
        channel: "telegram",
        text,
      }),
    });
    const agentData = await agentRes.json().catch(() => ({}));
    const reply = agentData?.reply || agentData?.text || "Уточню у студии и вернусь с ответом.";
    await sendTelegram(chatId, reply);

    return new Response("ok", { headers: corsHeaders });
  } catch (e: any) {
    console.error("[concierge-telegram-webhook]", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});