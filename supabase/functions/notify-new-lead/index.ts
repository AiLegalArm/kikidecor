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
    const { name, email, phone, eventType, date, guests, budget, message, subject, source } = body;

    let emailSubject: string;
    let emailBody: string;

    if (source === "booking") {
      emailSubject = `🎉 Новая заявка на декор от ${name}`;
      emailBody = `
Новая заявка на декор мероприятия!

Имя: ${name}
Email: ${email}
Телефон: ${phone || "—"}
Тип мероприятия: ${eventType}
Дата: ${date || "—"}
Гостей: ${guests || "—"}
Бюджет: ${budget || "—"}

Сообщение:
${message || "—"}

---
Источник: Форма заявки (booking)
      `.trim();
    } else {
      emailSubject = `📩 Новое сообщение с сайта от ${name}`;
      emailBody = `
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

    // Log the lead for monitoring
    console.log(`New ${source} lead from ${name} (${email})`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Body: ${emailBody}`);

    // Check if Resend API key is configured for actual email sending
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Ki Ki Decor <noreply@kikidecor.ru>",
          to: [ADMIN_EMAIL],
          reply_to: email,
          subject: emailSubject,
          text: emailBody,
        }),
      });

      if (!emailResponse.ok) {
        const errData = await emailResponse.text();
        console.error(`Resend API error [${emailResponse.status}]: ${errData}`);
        throw new Error(`Email sending failed: ${emailResponse.status}`);
      }

      console.log("Email sent successfully via Resend");
    } else {
      console.log("RESEND_API_KEY not configured — email logged but not sent. Lead is saved in database.");
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
