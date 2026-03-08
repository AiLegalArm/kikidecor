import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ADMIN_EMAIL = "info@kikidecor.ru";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, phone, eventType, date, guests, message, subject, source, location } = body;

    // ── 1. Admin notification email ──
    let adminSubject: string;
    let adminBody: string;

    if (source === "booking" || source === "catalog_request" || source === "ai_consultation") {
      adminSubject = `🎉 Новая заявка на декор от ${name}`;
      adminBody = `
Новая заявка на декор мероприятия!

Имя: ${name}
Email: ${email}
Телефон: ${phone || "—"}
Тип мероприятия: ${eventType}
Дата: ${date || "—"}
Гостей: ${guests || "—"}
Локация: ${location || "—"}

Сообщение:
${message || "—"}

---
Источник: Форма заявки (booking)
      `.trim();
    } else {
      adminSubject = `📩 Новое сообщение с сайта от ${name}`;
      adminBody = `
Новое сообщение через форму обратной связи!

Имя: ${name}
Email: ${email}
Тема: ${subject || "—"}

Сообщение:
${message || "—"}

---
Источник: Контактная форма (contact)
      `.trim();
    }

    console.log(`New ${source} lead from ${name} (${email})`);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // Send admin notification
    if (RESEND_API_KEY) {
      const adminEmailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Ki Ki Decor <noreply@kikidecor.ru>",
          to: [ADMIN_EMAIL],
          reply_to: email,
          subject: adminSubject,
          text: adminBody,
        }),
      });

      if (!adminEmailRes.ok) {
        console.error(`Admin email error [${adminEmailRes.status}]: ${await adminEmailRes.text()}`);
      } else {
        console.log("Admin email sent via Resend");
      }

      // ── 2. Client confirmation email ──
      if (source === "booking" && email) {
        const clientSubject = "✨ Ваша заявка принята — Ki Ki Decor";
        const clientBody = `
Здравствуйте, ${name}!

Спасибо за вашу заявку на оформление мероприятия!

Детали вашей заявки:
• Тип мероприятия: ${eventType}
• Дата: ${date || "уточняется"}
• Количество гостей: ${guests || "уточняется"}
• Локация: ${location || "уточняется"}

Мы свяжемся с вами в течение 24 часов для обсуждения деталей и подготовки индивидуального предложения.

Если у вас есть вопросы, вы можете ответить на это письмо или связаться с нами:
📞 Телефон: +7 (XXX) XXX-XX-XX
📧 Email: info@kikidecor.ru

С теплом,
Команда Ki Ki Decor
        `.trim();

        const clientEmailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Ki Ki Decor <noreply@kikidecor.ru>",
            to: [email],
            subject: clientSubject,
            text: clientBody,
          }),
        });

        if (!clientEmailRes.ok) {
          console.error(`Client email error [${clientEmailRes.status}]: ${await clientEmailRes.text()}`);
        } else {
          console.log("Client confirmation email sent");
        }
      }
    } else {
      console.log("RESEND_API_KEY not configured — emails logged but not sent.");
    }

    // ── 3. WhatsApp notification to admin ──
    const WHATSAPP_API_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN");
    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const WHATSAPP_ADMIN_PHONE = Deno.env.get("WHATSAPP_ADMIN_PHONE");

    if (WHATSAPP_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_ADMIN_PHONE) {
      const waMessage = source === "booking"
        ? `🎉 *Новая заявка*\n\n👤 ${name}\n📞 ${phone || "—"}\n📧 ${email}\n🎪 ${eventType}\n📅 ${date || "—"}\n👥 ${guests || "—"} гостей\n📍 ${location || "—"}`
        : `📩 *Новое сообщение*\n\n👤 ${name}\n📧 ${email}\n\n${message || "—"}`;

      try {
        const waRes = await fetch(
          `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${WHATSAPP_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: WHATSAPP_ADMIN_PHONE,
              type: "text",
              text: { body: waMessage },
            }),
          }
        );

        if (!waRes.ok) {
          console.error(`WhatsApp API error [${waRes.status}]: ${await waRes.text()}`);
        } else {
          console.log("WhatsApp notification sent");
        }
      } catch (waErr) {
        console.error("WhatsApp send failed:", waErr);
      }
    } else {
      console.log("WhatsApp not configured — skipping.");
    }

    // ── 4. Telegram notification ──
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const tgMessage = source === "booking"
        ? `🎉 <b>Новая заявка на декор</b>\n\n👤 ${name}\n📞 ${phone || "—"}\n📧 ${email}\n🎪 ${eventType}\n📅 ${date || "—"}\n👥 ${guests || "—"} гостей\n📍 ${location || "—"}\n\n💬 ${message || "—"}`
        : `📩 <b>Новое сообщение с сайта</b>\n\n👤 ${name}\n📧 ${email}\n📝 ${subject || "—"}\n\n💬 ${message || "—"}`;

      const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
      const inlineKeyboard: { text: string; url: string }[][] = [];

      if (cleanPhone) {
        inlineKeyboard.push([
          { text: "📞 Позвонить", url: `tel:+${cleanPhone}` },
          { text: "💬 WhatsApp", url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Здравствуйте, ${name}! Спасибо за заявку на ${eventType}. Давайте обсудим детали! — Ki Ki Decor`)}` },
        ]);
      }
      if (email) {
        inlineKeyboard.push([
          { text: "✉️ Написать email", url: `mailto:${email}` },
        ]);
      }

      try {
        const tgRes = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: tgMessage,
              parse_mode: "HTML",
              reply_markup: inlineKeyboard.length > 0
                ? { inline_keyboard: inlineKeyboard }
                : undefined,
            }),
          }
        );

        if (!tgRes.ok) {
          console.error(`Telegram API error [${tgRes.status}]: ${await tgRes.text()}`);
        } else {
          console.log("Telegram notification sent");
        }
      } catch (tgErr) {
        console.error("Telegram send failed:", tgErr);
      }
    } else {
      console.log("Telegram not configured — skipping.");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Lead processed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing lead:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
