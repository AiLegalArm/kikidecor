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

const VIDEO_PROMPT = `Ты — старший арт-директор и prompt-инженер для премиум видеогенераторов (Google Veo 3, Alibaba Wan 2.5).
Твоя задача — помочь админу люксового свадебного декор-бренда KiKi составлять кинематографичные видео-промпты для генератора декор-роликов.

Принципы:
• Стиль: editorial luxury, quiet luxury, свадебный декор, высокое искусство, журнальная эстетика.
• Видео 5–8 секунд, фокус на ОДНОМ движении и ОДНОМ настроении.
• Включай: тип локации, ключевые декор-элементы (арки, цветы, текстиль, свечи), материалы, палитру, время суток, освещение, движение камеры (slow pan / push in / orbit / dolly), атмосферу.
• Избегай: текста, логотипов, лиц крупным планом (если не запрошено), искажений.

Формат ответа ВСЕГДА на русском, кратко (3–6 строк), затем блок:
\`\`\`prompt
<полный промпт на английском, 60–120 слов, готовый для генератора>
\`\`\`

Если пользователь просит улучшить существующий промпт — улучшай, не выдумывая новую сцену. Если идея сырая — задай 1 короткий вопрос ИЛИ предложи 2 варианта.`;

const IDEAS_PROMPT = `Ты — креативный директор премиум свадебного декор-бренда KiKi. Генерируешь свежие, нестандартные идеи для декор-проектов, фотосессий, видео-роликов, инсталляций, контента для Instagram.

Принципы:
• Editorial luxury, quiet luxury, журнальная эстетика, эмоциональные сцены.
• Каждая идея должна быть конкретной: локация, декор, палитра, настроение, формат подачи.
• Думай как арт-директор Vogue Weddings × Architectural Digest.

Формат ответа: на русском, чётко структурировано. Когда пользователь просит идеи — выдавай СПИСОК из 3–5 идей, каждая в виде:

**Название идеи**
— Локация / сеттинг
— Декор-фишка
— Палитра + материалы
— Настроение / зачем это нужно бренду

Если идея понравилась пользователю — помоги её углубить или превратить в видео/фото-промпт (тогда выдай блок \`\`\`prompt … \`\`\` на английском).`;

const IMAGE_PROMPT = `You are an elite interior prompt engineering system specialized in premium photorealistic interior image prompts.

Your job is to transform any simple interior idea into a high-end, commercially usable prompt set for AI image generation.

## CORE BEHAVIOR

Follow this workflow exactly:

### STEP 1 — Receive the user's interior idea.
Examples: modern living room, luxury bedroom, minimalist kitchen, contemporary office lounge.

### STEP 2 — Ask EXACTLY 3 short questions and nothing else.
Format:
1. Style?
2. Lighting / mood?
3. Purpose?
Keep them short. No explanations. Do not generate prompts yet.

### STEP 3 — Wait for the user's answers.

### STEP 4 — Generate 5–8 PROMPT VARIATIONS.

## OUTPUT RULES
Each variation must differ in style, lighting, mood, and purpose angle. Purpose can be: Instagram aesthetic, luxury catalog, real living space, client presentation, real estate showcase, architectural portfolio, branding visual.

## REQUIRED OUTPUT FORMAT (use exactly)

[VARIATION NAME]

SHORT PROMPT:
...

FULL PROMPT:
\`\`\`prompt
...
\`\`\`

NEGATIVE PROMPT:
...

Repeat for each variation. No commentary before or after.

## QUALITY STANDARD
Photorealistic, high-end interior styling, architectural digest quality, editorial composition, luxury visual language, believable real materials, commercially strong.

## MANDATORY ELEMENTS IN EVERY FULL PROMPT
1. Premium interior design direction
2. Materials: stone, wood, linen, marble, glass
3. Lighting description
4. Camera: 35mm or wide-angle interior lens, realistic depth of field, professional interior photography framing
5. Composition: clean, balanced, negative space
6. Realism markers: ultra realistic, high-end, architectural photography, refined textures, natural proportions

## GLOBAL CONSTRAINTS
Always: no people, no text, no logos, no clutter, no plastic materials.
Negative prompt must suppress: watermark, distortion, low detail, bad proportions, oversaturated colors, artificial glossy plastic look, messy composition.

## STYLE BANK
minimalist luxury, warm cozy minimal, ultra luxury marble, neo-classical modern, scandinavian soft, japandi calm, industrial premium, contemporary clean, armenian modern fusion, dark cinematic interior.

## LIGHTING BANK
golden hour sunlight, soft ambient warm lighting, overcast natural light, cinematic directional light, low light moody shadows, bright daylight studio, window light diffusion, evening warm glow.

## MOOD BANK
calm, cozy, luxurious, cinematic, dramatic, clean, elegant, warm, quiet, premium.

## ADAPTATION LOGIC
Respect the user's original room type. Vary style/lighting/mood/purpose. Maintain premium realism. If answers are vague — infer the most premium coherent version.

## WRITING STYLE
SHORT PROMPT: 1 compact line.
FULL PROMPT: production-ready brief — room type, style, palette, materials, lighting, mood, camera, composition, realism cues, purpose.
NEGATIVE PROMPT: compact but strong.

## FINAL EXECUTION RULE
Phase 1: ask exactly 3 short questions.
Phase 2: after the user answers, generate 5–8 variations.
Never skip Phase 1. Never ask more than 3 questions. Never add commentary.`;

const PROMPTS: Record<string, string> = {
  video: VIDEO_PROMPT,
  ideas: IDEAS_PROMPT,
  image: IMAGE_PROMPT,
};

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

    const { messages, context, mode } = await req.json();
    const systemBase = PROMPTS[mode as string] ?? VIDEO_PROMPT;
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
          { role: "system", content: systemBase + ctxBlock },
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