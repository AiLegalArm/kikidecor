## Что сделаем

### 1. Удалить старый AI Видео (Gemini-кадры), оставить только AI Видео WAN

**Файлы к удалению:**
- `src/components/admin/AdminVideoGenerator.tsx`
- `supabase/functions/generate-decor-video/index.ts` (+ deploy delete)

**Правки:**
- `src/pages/Admin.tsx` — убрать таб «AI Видео» (старый), переименовать «AI Видео WAN» → «AI Видео». Иконка/route остаются, меняется только лейбл и компонент = `AdminWanVideo`.
- `src/components/admin/AdminWanVideo.tsx`, `WanHistory.tsx` — заголовки переименовать с «WAN» на «AI Видео» (DashScope как движок упоминаем только в подсказке).

### 2. Унификация AI-провайдера (Lovable Gateway по умолчанию + переключение)

Сейчас все edge-функции уже используют Lovable Gateway через `_shared/gemini.ts` (`requireApiKey` → `LOVABLE_API_KEY`). Исключение — `generate-decor-wan` (DashScope, отдельный провайдер видео, оставляем как есть).

**Новая абстракция в `supabase/functions/_shared/gemini.ts`:**
- Добавить функцию `getAIConfig()` — читает активную конфигурацию из таблицы `ai_provider_settings` (один singleton-row) и возвращает `{ provider, baseUrl, apiKeyEnvName, models }`.
- `provider = 'lovable'` (по умолчанию) → `LOVABLE_API_KEY` + `https://ai.gateway.lovable.dev/v1/chat/completions`.
- `provider = 'openai'` → `OPENAI_API_KEY` + `https://api.openai.com/v1/chat/completions`.
- `provider = 'gemini'` → `GEMINI_API_KEY` + `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`.
- `provider = 'anthropic'` → `ANTHROPIC_API_KEY` + Anthropic-совместимый прокси-вызов (с маппингом моделей).
- `requireApiKey()` и `aiText/aiImageGen/aiTool` будут динамически выбирать URL/ключ через `getAIConfig()`. Поведение для всех существующих функций (`agent-respond`, `analyze-venue`, `generate-decor-concept`, `generate-moodboard`, `event-planner-pipeline`, `refine-concept`, `generate-facade`) сохраняется без правок их кода.

### 3. БД: настройки провайдера

Миграция — таблица `ai_provider_settings`:
```
id (uuid pk, default gen_random_uuid)
provider text not null default 'lovable' check in ('lovable','openai','gemini','anthropic')
model_reasoning text, model_fast text, model_vision text, model_image text
is_active boolean default true
updated_at, updated_by
```
- Только одна активная строка (триггер).
- RLS: SELECT/UPDATE/INSERT — только `has_role(auth.uid(),'admin')`.
- API-ключи провайдеров (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`) хранятся как Supabase Secrets — **запрашиваются через `add_secret`** только когда админ выбирает соответствующего провайдера.

### 4. UI в админке: «AI Provider» (новый таб)

`src/components/admin/AdminAIProvider.tsx`:
- **Toggle Lovable Gateway** (Switch) — выкл = переключает на пользовательского провайдера.
- **Select** провайдера: Lovable / OpenAI / Google Gemini Direct / Anthropic.
- **Поля моделей** (4 input'а: reasoning / fast / vision / image) с дефолтами под выбранного провайдера и кнопкой «Сбросить».
- **Статус ключа**: бейдж «Ключ настроен / Не настроен» (читаем через edge-функцию `ai-provider-status`, без раскрытия значений).
- **Кнопка «Добавить/обновить ключ»** — выводит подсказку о том, что ключ нужно сохранить в Secrets (через диалог Lovable).
- **Кнопка «Тест соединения»** — вызывает `ai-provider-test` (короткий prompt, возвращает latency + ok/error).
- **Сохранить** → upsert в `ai_provider_settings`.

Добавить таб в `Admin.tsx` рядом с Concierge.

### 5. Edge-функции для управления

- `supabase/functions/ai-provider-status/index.ts` — GET, проверяет наличие нужного `*_API_KEY` в env, возвращает `{provider, hasKey}`. Только admin (verify role).
- `supabase/functions/ai-provider-test/index.ts` — POST, делает тестовый `aiText("ping")` через активную конфигурацию.

### Технические детали

- `agent-respond`, KB-поиск, концепты, мудборды, фасады — продолжают работать без изменений (используют `_shared/gemini.ts`).
- `generate-decor-wan` остаётся на DashScope (это видео-API, не chat-completions; не подменяется глобальным переключателем). Это явно указано в UI: «Видео-генерация работает на DashScope независимо».
- Мапинг моделей в `_shared/gemini.ts`: при провайдере OpenAI `REASONING→gpt-5`, `FAST→gpt-5-mini`, `VISION→gpt-5-mini`, `IMAGE_GEN→` — отключён (с понятной ошибкой), либо остаётся Lovable для image, чтобы не ломать `generate-facade`/`generate-moodboard`.
- Image-generation поддерживается надёжно только в Lovable Gateway и Gemini Direct → если выбран OpenAI/Anthropic, image-функции форсят fallback на Lovable (с уведомлением в логах) — иначе UI кнопок «Сгенерировать визуал» сломается.

### Файлы

**Удалить:** `AdminVideoGenerator.tsx`, `supabase/functions/generate-decor-video/`
**Создать:** `AdminAIProvider.tsx`, `ai-provider-status/`, `ai-provider-test/`, миграция `ai_provider_settings`
**Изменить:** `Admin.tsx`, `_shared/gemini.ts`, `AdminWanVideo.tsx`, `WanHistory.tsx`, `supabase/config.toml`
