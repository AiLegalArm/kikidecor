// AI assistant that helps craft cinematic decor video prompts for Wan / Veo 3.
// Uses Lovable AI Gateway (google/gemini-2.5-flash). Streams a final ready-to-use
// English prompt + short Russian explanation back to the admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_PROMPT = `Ты — старший арт-директор и prompt-инженер для премиум видеогенераторов (Google Veo 3, Alibaba Wan 2.5).
Твоя задача — помочь админу люксового свадебного декор-бренда KiKi составлять кинематографичные видео-промпты для генератора декор-роликов.

Принципы:
• Стиль: editorial luxury, quiet luxury, свадебный декор, высокое искусство, журнальная эстетика.
• Видео 5–8 секунд, поэтому фокус на ОДНОМ движении и ОДНОМ настроении.
• Включай: тип помещения/локации, ключевые декор-элементы (арки, цветы, текстиль, свечи), материалы, цветовую палитру, время суток, освещение, движение камеры (slow pan / push in / orbit / dolly), атмосферу.
• Избегай: текста, логотипов, лиц крупным планом (если не запрошено), искажений.

Формат ответа ВСЕГДА на русском, кратко (3–6 строк), затем блок:
\`\`\`prompt
<полный промпт на английском, готовый вставить в генератор, 60–120 слов>
\`\`\`

Если пользователь просит улучшить существующий промпт — улучшай его, не выдумывая новую сцену. Если идея сырая — задай 1 короткий уточняющий вопрос ИЛИ предложи 2 варианта.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
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
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, context } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctxBlock = context
      ? `\n\nТекущие настройки формы (используй их, если уместно):\n${JSON.stringify(context).slice(0, 1500)}`
      : "";

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + ctxBlock },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `AI gateway ${resp.status}: ${t.slice(0, 300)}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});