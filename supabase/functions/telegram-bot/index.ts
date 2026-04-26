// Telegram bot webhook: accepts updates from Telegram and executes admin commands.
// Uses TELEGRAM_BOT_TOKEN secret. Admins are recognized via telegram_admins.chat_id.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function tg(method: string, body: unknown) {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function reply(chatId: number, text: string) {
  return tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });
}

async function isLinkedAdmin(chatId: number): Promise<boolean> {
  const { data } = await supabase
    .from("telegram_admins")
    .select("id, is_active")
    .eq("chat_id", chatId)
    .eq("is_active", true)
    .maybeSingle();
  return !!data;
}

async function logAction(action: string, details: Record<string, unknown> = {}) {
  await supabase.from("admin_actions").insert({
    action,
    source: "telegram",
    entity_type: "generator",
    details,
  });
}

async function handleStatus(chatId: number) {
  const { data: latest } = await supabase
    .from("generator_runs")
    .select("id, generator_type, status, created_at, started_at, completed_at, error_message")
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: leadsToday } = await supabase
    .from("event_leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());

  const lines: string[] = ["📊 <b>Статус системы</b>"];
  lines.push(`Новых лидов за 24ч: <b>${leadsToday ?? 0}</b>`);
  lines.push("");
  lines.push("<b>Последние запуски генератора:</b>");
  if (!latest || latest.length === 0) {
    lines.push("<i>пока нет запусков</i>");
  } else {
    for (const r of latest) {
      const emoji = r.status === "completed" ? "✅" : r.status === "failed" ? "❌" : r.status === "running" ? "⚙️" : "⏳";
      lines.push(`${emoji} ${r.generator_type} — ${r.status}`);
    }
  }
  await reply(chatId, lines.join("\n"));
}

async function startGenerator(chatId: number, type: string) {
  const { data, error } = await supabase
    .from("generator_runs")
    .insert({
      generator_type: type,
      status: "queued",
      source: "telegram",
      telegram_chat_id: chatId,
      input_data: {},
    })
    .select("id")
    .single();
  if (error) {
    await reply(chatId, `❌ Ошибка: ${error.message}`);
    return;
  }
  await logAction("generator_start", { run_id: data.id, generator_type: type });
  await reply(chatId, `▶️ Запуск генератора <b>${type}</b> поставлен в очередь.\nID: <code>${data.id}</code>`);
}

async function stopGenerators(chatId: number) {
  const { data, error } = await supabase
    .from("generator_runs")
    .update({ status: "failed", error_message: "Stopped via Telegram", completed_at: new Date().toISOString() })
    .in("status", ["queued", "running"])
    .select("id");
  if (error) {
    await reply(chatId, `❌ Ошибка: ${error.message}`);
    return;
  }
  await logAction("generator_stop", { stopped_count: data?.length ?? 0 });
  await reply(chatId, `⏹ Остановлено запусков: <b>${data?.length ?? 0}</b>`);
}

async function restartGenerators(chatId: number) {
  await stopGenerators(chatId);
  await reply(chatId, "🔄 Перезапуск: используйте /start_gen <тип> чтобы запустить новый.");
  await logAction("generator_restart", {});
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function handleLeads(chatId: number, limit = 10) {
  const { data, error } = await supabase
    .from("event_leads")
    .select("id, name, phone, event_type, event_date, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    await reply(chatId, `❌ Ошибка: ${error.message}`);
    return;
  }
  if (!data || data.length === 0) {
    await reply(chatId, "Лидов пока нет.");
    return;
  }
  const lines = [`📋 <b>Последние ${data.length} лидов</b>\n`];
  for (const l of data) {
    const status = l.status === "new" ? "🆕" : l.status === "contacted" ? "📞" : l.status === "won" ? "✅" : l.status === "lost" ? "❌" : "•";
    lines.push(`${status} <b>${escapeHtml(l.name || "—")}</b> — ${escapeHtml(l.event_type || "")}`);
    lines.push(`   📞 ${escapeHtml(l.phone || "—")}${l.event_date ? ` · 📅 ${l.event_date}` : ""}`);
    lines.push(`   <i>${fmtDate(l.created_at)}</i>\n`);
  }
  await reply(chatId, lines.join("\n"));
}

async function handleToday(chatId: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [{ count: leadsToday }, { data: leads }, { count: weekLeads }] = await Promise.all([
    supabase.from("event_leads").select("id", { count: "exact", head: true })
      .gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
    supabase.from("event_leads").select("name, phone, event_type, created_at")
      .gte("created_at", start.toISOString()).lte("created_at", end.toISOString())
      .order("created_at", { ascending: false }).limit(20),
    supabase.from("event_leads").select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()),
  ]);

  const lines: string[] = ["📅 <b>Сегодня</b>", ""];
  lines.push(`Лидов сегодня: <b>${leadsToday ?? 0}</b>`);
  lines.push(`За 7 дней: <b>${weekLeads ?? 0}</b>`);
  if (leads && leads.length > 0) {
    lines.push("", "<b>Заявки за день:</b>");
    for (const l of leads) {
      lines.push(`• ${escapeHtml(l.name || "—")} — ${escapeHtml(l.event_type || "")} (${escapeHtml(l.phone || "—")})`);
    }
  }
  await reply(chatId, lines.join("\n"));
}

async function handlePublish(chatId: number, slug: string) {
  if (!slug) {
    await reply(chatId, "Использование: /publish &lt;slug-работы&gt;");
    return;
  }
  const { data: work, error } = await supabase
    .from("works")
    .select("id, slug, title, status")
    .eq("slug", slug.trim())
    .maybeSingle();
  if (error || !work) {
    await reply(chatId, `❌ Работа со slug <code>${escapeHtml(slug)}</code> не найдена.`);
    return;
  }
  if (work.status === "published") {
    await reply(chatId, `ℹ️ Работа «${escapeHtml(work.title)}» уже опубликована.`);
    return;
  }
  const { error: upErr } = await supabase
    .from("works")
    .update({ status: "published" })
    .eq("id", work.id);
  if (upErr) {
    await reply(chatId, `❌ Ошибка публикации: ${upErr.message}`);
    return;
  }
  await logAction("work_published", { work_id: work.id, slug: work.slug });
  await reply(chatId, `✅ Опубликовано: <b>${escapeHtml(work.title)}</b>\nhttps://kiki-shop.online/portfolio/${work.slug}`);
}

async function handleLink(chatId: number, code: string, username?: string) {
  const now = new Date().toISOString();
  const { data: row, error } = await supabase
    .from("telegram_admins")
    .select("id, link_code_expires_at, user_id")
    .eq("link_code", code.trim())
    .maybeSingle();

  if (error || !row) {
    await reply(chatId, "❌ Неверный код привязки.");
    return;
  }
  if (row.link_code_expires_at && row.link_code_expires_at < now) {
    await reply(chatId, "⏱ Код истёк. Сгенерируйте новый в админ-панели.");
    return;
  }

  const { error: upErr } = await supabase
    .from("telegram_admins")
    .update({
      chat_id: chatId,
      username: username ?? null,
      is_active: true,
      linked_at: now,
      link_code: null,
      link_code_expires_at: null,
    })
    .eq("id", row.id);

  if (upErr) {
    await reply(chatId, `❌ Ошибка привязки: ${upErr.message}`);
    return;
  }
  await logAction("telegram_admin_linked", { chat_id: chatId, username });
  await reply(chatId, "✅ Аккаунт привязан! Теперь вы будете получать уведомления и можете использовать команды.\n\n/help — список команд");
}

const HELP_TEXT = `🤖 <b>Ki Ki Decor — Admin Bot</b>

<b>Команды:</b>
/leads — последние 10 лидов
/today — сводка за сегодня
/publish &lt;slug&gt; — опубликовать работу
/status — статус системы
/start_gen &lt;тип&gt; — запустить генератор (decor|facade|video|moodboard)
/stop_gen — остановить все запуски
/restart_gen — перезапустить
/link &lt;код&gt; — привязать аккаунт (код из админ-панели)
/help — эта справка`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const update = await req.json();
    const msg = update.message;
    if (!msg || !msg.text) return new Response("ok", { headers: corsHeaders });

    const chatId: number = msg.chat.id;
    const text: string = msg.text.trim();
    const username: string | undefined = msg.from?.username;

    // /start (Telegram standard) → show help
    if (text === "/start" || text === "/help") {
      await reply(chatId, HELP_TEXT);
      return new Response("ok", { headers: corsHeaders });
    }

    // /link <code> — does NOT require prior linkage
    if (text.startsWith("/link")) {
      const code = text.split(/\s+/)[1];
      if (!code) {
        await reply(chatId, "Использование: /link &lt;код&gt;");
        return new Response("ok", { headers: corsHeaders });
      }
      await handleLink(chatId, code, username);
      return new Response("ok", { headers: corsHeaders });
    }

    // All other commands require admin linkage
    const linked = await isLinkedAdmin(chatId);
    if (!linked) {
      await reply(chatId, "🔒 Доступ только для администраторов. Используйте /link &lt;код&gt; для привязки.");
      return new Response("ok", { headers: corsHeaders });
    }

    if (text === "/status") {
      await handleStatus(chatId);
    } else if (text === "/leads") {
      await handleLeads(chatId);
    } else if (text === "/today") {
      await handleToday(chatId);
    } else if (text.startsWith("/publish")) {
      const slug = text.split(/\s+/)[1] || "";
      await handlePublish(chatId, slug);
    } else if (text.startsWith("/start_gen")) {
      const type = text.split(/\s+/)[1] || "decor";
      await startGenerator(chatId, type);
    } else if (text === "/stop_gen") {
      await stopGenerators(chatId);
    } else if (text === "/restart_gen") {
      await restartGenerators(chatId);
    } else {
      await reply(chatId, "Неизвестная команда. /help — список команд.");
    }

    return new Response("ok", { headers: corsHeaders });
  } catch (e) {
    console.error("[telegram-bot]", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});