// Sends a message from operator/agent back to the customer through the right channel.
// Currently supports Telegram (customer bot). IG/FB will be added in Sprint 3.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CUSTOMER_BOT_TOKEN = Deno.env.get("TELEGRAM_CUSTOMER_BOT_TOKEN");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function sendTelegram(chatId: string, text: string) {
  if (!CUSTOMER_BOT_TOKEN) throw new Error("TELEGRAM_CUSTOMER_BOT_TOKEN not configured");
  const r = await fetch(`https://api.telegram.org/bot${CUSTOMER_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const data = await r.json();
  if (!r.ok || !data.ok) throw new Error(`Telegram send failed: ${JSON.stringify(data)}`);
  return data.result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // --- AuthN/AuthZ: require signed-in admin ---
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u, error: ue } = await userClient.auth.getUser();
    if (ue || !u.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversationId, text } = await req.json();
    if (!conversationId || !text) {
      return new Response(JSON.stringify({ error: "conversationId and text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: conv, error } = await supabase
      .from("messaging_conversations")
      .select("channel, external_thread_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (error || !conv) throw new Error("Conversation not found");

    if (conv.channel === "telegram") {
      const result = await sendTelegram(conv.external_thread_id, text);
      await supabase.from("messaging_conversations")
        .update({ last_message_at: new Date().toISOString(), last_message_preview: text.slice(0, 200) })
        .eq("id", conversationId);
      return new Response(JSON.stringify({ ok: true, message_id: result?.message_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Channel ${conv.channel} not yet supported` }), {
      status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[concierge-send]", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});