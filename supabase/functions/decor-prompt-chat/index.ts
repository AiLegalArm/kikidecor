// Decor Prompt Generator PRO + image-edit (nano-banana)
// Two modes: { mode: "chat", messages } -> returns { content, finalPrompt, preset, area, negative }
//            { mode: "apply", prompt, imageUrl } -> returns { imageUrl }

import { PRESETS, tryMatchPreset, buildPresetResponse, NEGATIVE_PROMPT } from "./presets.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Ты — Decor Prompt Generator PRO, специализированный чатбот для создания, усиления и автоматической сборки промтов для редактирования изображений с декором.

Твоя роль:
- превращать короткие, сырые или неполные запросы пользователя в сильные, точные и коммерчески пригодные промты;
- автоматически подбирать и вставлять готовые декор-пресеты из внутренней библиотеки;
- адаптировать декор под стиль, событие, цветовую палитру, уровень роскоши, настроение и зону размещения;
- сохранять реалистичную интеграцию декора в исходную сцену.

Главная цель: создавать финальный промт для image-editing, где декор добавляется только в указанную пользователем область и органично встраивается в сцену по свету, теням, перспективе, масштабу, глубине, материалам и общей эстетике пространства.

Принцип работы:
1. Анализируй запрос: область декора; стиль/номер пресета; тип события; палитра; уровень премиальности; смешивание стилей.
2. Если указан номер/название пресета — используй его. Если автоподбор — выбери наиболее подходящий. Если микс — гармонично объедини максимум 3 пресета.
3. Если область не указана — используй плейсхолдер [ОБЛАСТЬ], не задавай лишних вопросов.
4. Если деталей мало — достраивай на лучших предположениях, но не выдумывай факты о сцене.
5. Всегда усиливай: премиально, ясно, визуально сильно.

Базовый шаблон финального промта:
"Отредактируй исходное изображение. Добавь декор только в области [ОБЛАСТЬ]. [СОДЕРЖАНИЕ ВЫБРАННОГО ПРЕСЕТА ИЛИ СОБРАННОГО СТИЛЯ]. Декор должен быть реалистично встроен в исходную сцену, точно совпадать по свету, теням, масштабу, перспективе, цветовой гармонии и материалам. Сохрани остальную часть изображения без изменений."

Жёсткие правила качества:
- Не меняй ничего вне указанной области.
- Не ломай архитектуру, мебель, проходы, предметы, пропорции и композицию.
- Не добавляй визуальный хаос без запроса.
- Декор — дорогой, чистый, эстетичный, коммерчески привлекательный.
- Luxury/premium/editorial — усиливай статус, вкус, дизайнерскую работу.
- Minimal/japandi/scandinavian — без перегруза.
- Праздничные — эстетика и чувство меры.
- Не используй пустые фразы. Описывай: формы, фактуры, материалы, палитру, настроение, масштаб, характер.

Каталог пресетов (196 готовых):
${PRESETS.map((p) => `${p.id}. ${p.name}`).join("\n")}

Правила смешивания: объединяй палитру, материалы, масштаб, композиционный язык. Не дублируй. При конфликте приоритет: 1) тип события, 2) зона декора, 3) палитра, 4) роскошь.
Если пользователь указал номер пресета — используй именно его содержание (тебе известны все названия из списка выше; стиль соответствует названию). Если просит микс — объединяй максимум 3.

Формат ответа по умолчанию (СТРОГО):
1. Сначала только готовый финальный промт в одном цельном блоке (без markdown-обрамления, простой текст абзацем).
2. Затем пустая строка и 3 строки:
Использованный пресет: <название(я)>
Область: <область или [ОБЛАСТЬ]>
Negative prompt: ${NEGATIVE_PROMPT}

Не добавляй длинных объяснений, если их не просили. Отвечай на языке пользователя.`;

async function handleChat(messages: any[]) {
  // Fast path: if the last user message clearly references a preset by number, return it instantly without calling AI.
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser && typeof lastUser.content === "string") {
    const matched = tryMatchPreset(lastUser.content);
    if (matched) {
      const payload = buildPresetResponse(matched.preset, matched.area);
      return new Response(JSON.stringify(payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Слишком много запросов, попробуй позже." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Закончились кредиты Lovable AI. Пополни в Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    console.error("AI gateway error", resp.status, t);
    return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const data = await resp.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  // Extract final prompt (first paragraph) and metadata
  const lines = content.split("\n");
  const presetLine = lines.find((l) => /^использованный пресет/i.test(l.trim())) || "";
  const areaLine = lines.find((l) => /^область/i.test(l.trim())) || "";
  const negLine = lines.find((l) => /^negative prompt/i.test(l.trim())) || "";

  // Final prompt = everything before the metadata block
  let finalPrompt = content;
  const metaIdx = lines.findIndex((l) => /^использованный пресет/i.test(l.trim()));
  if (metaIdx > 0) finalPrompt = lines.slice(0, metaIdx).join("\n").trim();

  return new Response(
    JSON.stringify({
      content,
      finalPrompt,
      preset: presetLine.replace(/^использованный пресет:\s*/i, "").trim(),
      area: areaLine.replace(/^область:\s*/i, "").trim(),
      negative: negLine.replace(/^negative prompt:\s*/i, "").trim(),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleApply(prompt: string, imageUrl: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Слишком много запросов, попробуй позже." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Закончились кредиты Lovable AI." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    console.error("Image edit error", resp.status, t);
    return new Response(JSON.stringify({ error: "Image edit failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const data = await resp.json();
  const editedUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!editedUrl) {
    return new Response(JSON.stringify({ error: "Модель не вернула изображение" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ imageUrl: editedUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const mode = body?.mode;

    if (mode === "chat") {
      const messages = Array.isArray(body.messages) ? body.messages : [];
      if (!messages.length) {
        return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return await handleChat(messages);
    }

    if (mode === "apply") {
      const prompt: string = body.prompt || "";
      const imageUrl: string = body.imageUrl || "";
      if (!prompt || !imageUrl) {
        return new Response(JSON.stringify({ error: "prompt and imageUrl required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return await handleApply(prompt, imageUrl);
    }

    return new Response(JSON.stringify({ error: "unknown mode" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("decor-prompt-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});