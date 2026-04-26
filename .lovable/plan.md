
# KiKi Concierge — Multi-Channel Business Messaging Agent

Премиум AI-консьерж, который ведёт входящие диалоги в Telegram, Instagram DM и Facebook Messenger строго в рамках бизнеса KiKi (decor + showroom). Отвечает 24/7, квалифицирует лиды, эскалирует сложные кейсы оператору. Никаких general-knowledge ответов.

---

## 1. Product concept

**Имя в админке:** KiKi Concierge.
**Роль:** не «чат-бот», а цифровой ассистент бренда — отвечает только о услугах, работах, процессе заказа, консультациях, наличии дат и ведёт к заявке. Тон — приглушённый, editorial, без эмодзи-спама, в тон существующему бренду (memory: `brand/visual-identity`, `style/visual-design-editorial`).

**Что меняется для бизнеса:**
- Все входящие из 3 каналов сходятся в одну ленту в `/admin`.
- Лиды из чатов автоматически попадают в существующий CRM-пайплайн (`event_leads` + `customer_profiles`, memory: `features/admin-dashboard`).
- Оператор видит проактивные подсказки и эскалации в Telegram.

---

## 2. System architecture

```text
 ┌────────────┐  ┌────────────┐  ┌────────────┐
 │ Telegram   │  │ Instagram  │  │ Facebook   │
 │ Bot API    │  │ DM (Graph) │  │ Messenger  │
 └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
       │ webhook/poll   │ webhook       │ webhook
       ▼                ▼               ▼
 ┌──────────────────────────────────────────────┐
 │       Edge: messaging-ingest (per channel)   │
 │   normalize → store → enqueue agent          │
 └────────────────────┬─────────────────────────┘
                      ▼
 ┌──────────────────────────────────────────────┐
 │       Edge: agent-respond                    │
 │  scope guard → KB retrieval → Lovable AI     │
 │  (Gemini, tool-calling) → policy check       │
 └────────────────────┬─────────────────────────┘
                      ▼
 ┌──────────────────────────────────────────────┐
 │       Edge: messaging-send (per channel)     │
 └────────────────────┬─────────────────────────┘
                      ▼
                  Customer
                      │
                      ▼ on escalation triggers
        Telegram admin notify + /admin Inbox UI
```

**Хранение:** Lovable Cloud (текущий backend). Realtime на таблице сообщений → лента в админке обновляется живьём.
**AI:** Lovable AI Gateway, модель по умолчанию `google/gemini-3-flash-preview` (быстро/дёшево), для сложных кейсов и резюме — `google/gemini-2.5-pro`. Embeddings для KB — Gemini text-embedding.
**Knowledge retrieval:** pgvector в существующем Postgres.

---

## 3. Messaging agent architecture

Слои отрабатываются последовательно в `agent-respond`:

1. **Channel adapter** — нормализует входящее в общий формат `{conversation_id, channel, customer, text, attachments}`.
2. **Scope guard (preflight)** — лёгкий Gemini-flash-lite классификатор: `business | small_talk | off_topic | abusive | handoff_request`. Управляет дальнейшим маршрутом.
3. **KB retrieval** — top-k чанков из knowledge base + структурированные данные из `packages`, `works`, `categories`, `blocked_dates` (через tool-calls).
4. **Composer** — Gemini с system prompt бренда + retrieved context + история диалога (последние 20 сообщений).
5. **Tool calling** — агент имеет ограниченный набор инструментов: `lookup_packages`, `lookup_works`, `check_date_availability`, `create_lead`, `request_human_handoff`, `suggest_consultation_slot`. Никаких free-form действий.
6. **Policy validator (postflight)** — проверка ответа: нет ли выдуманных цен, дат, гарантий, не вышли ли за scope. Если проверка не пройдена → ответ заменяется на безопасный шаблон + handoff.
7. **Channel-specific formatter** — длина, разметка, кнопки/quick replies под каждый канал.

---

## 4. Business-only response policy

**Allowed topics** (хранятся в `agent_policies.allowed_topics`):
услуги декора, портфолио/работы, процесс заказа, консультации, доступные даты, ценовые диапазоны (только из `packages`/калькулятора), showroom (товары/наличие), бронирование, контакты, доставка/логистика декора.

**Blocked / out-of-scope** (примеры, расширяется в админке):
общие знания, советы не по декору, политика, медицина, помощь с домашкой, генерация креатива не для KiKi, юр./фин. консультации.

**Refusal pattern (premium tone, не «я бот»):**
> «Я ассистент студии KiKi и помогаю только с вопросами о наших услугах декора и шоурума. Подсказать ближайшую свободную дату или показать примеры наших работ?»

**Anti-hallucination правила, зашитые в system prompt:**
- цены — только из `packages` или диапазона калькулятора;
- даты занятости — только через `check_date_availability`;
- если данных нет → «уточню у студии» + автоматический handoff;
- никаких обещаний скидок, гарантий, сроков, не подтверждённых KB.

---

## 5. Channel logic

| Аспект | Telegram (customer) | Instagram DM | Facebook Messenger |
|---|---|---|---|
| Auth/transport | Bot API через текущий Telegram connector | Meta Graph API + webhook | Meta Graph API + webhook |
| Длина ответа | до ~600 знаков, можно списки | 1–2 коротких сообщения, лаконично, 1 CTA | 2–3 сообщения, доверительный тон, ссылка на сайт |
| Quick replies | Inline keyboard (Каталог / Консультация / Даты) | Ice-breakers + быстрые ответы IG | Persistent menu + quick replies |
| Медиа | фото портфолио, ссылки на работы | приоритет фото из `works` | карусель работ (Generic template) |
| Lead capture | inline-форма по шагам | минимально: имя + дата, остальное на сайте | полная форма (event_type/date/guests) |
| Handoff текст | «Передаю менеджеру, ответит в течение X» | «Менеджер ответит в DM в течение X» | то же + «или напишите на сайте» |

**Важное ограничение Meta:** окно ответа Instagram/FB — 24 часа. После этого можно только Message Tag (например, `HUMAN_AGENT`). Агент это уважает: вне окна — не пишет, ставит в очередь оператору.

---

## 6. Admin controls (`/admin/concierge`)

Новая секция в существующей админке (memory: `features/admin-dashboard`). Mobile-first, на тех же tokens.

**Разделы:**
1. **Inbox** — все диалоги, фильтры по каналу/статусу/SLA, badge unread, realtime.
2. **Conversation view** — история, профиль клиента (связан с `customer_profiles`), кнопки: «Take over» (выключает AI), «Send template», «Convert to lead», «Close».
3. **Knowledge base** — CRUD FAQ/документов, тэги, статус published/draft, кнопка «Re-embed».
4. **Policies** — allowed topics, blocked topics, tone of voice presets, refusal templates, business hours, escalation triggers (slider по confidence, ключевые слова).
5. **Channels** — статус подключения каждого канала, токены, webhook URL, тестовое сообщение.
6. **Canned replies** — мультиязычные шаблоны (RU/EN, memory: `tech/internationalization`).
7. **Lead qualification** — конструктор вопросов (event_type/date/budget/guests), какие обязательны.
8. **Analytics** — кол-во диалогов, % auto-resolved, % escalated, conversion в лиды, ср. время ответа, по каналам.
9. **Audit log** — кто из админов взял диалог, что отредактировал в KB/политиках.

---

## 7. Human handoff logic

**Триггеры эскалации (настраиваются в Policies):**
- явный запрос: «человек/менеджер/оператор/manager/agent»;
- scope guard вернул `handoff_request | abusive | sensitive`;
- model confidence < threshold (через self-rating tool-call);
- 3+ повторных уточнений по одной теме;
- запрос на скидку/исключение по цене;
- слово «жалоба/претензия/refund»;
- сложный кастом (свадьба >N гостей, корпоратив, нестандартная локация);
- вне business hours + клиент явно ждёт человека.

**Flow:**
1. AI отправляет клиенту вежливое сообщение «передаю менеджеру».
2. Conversation помечается `assigned_to_human=true`, AI замолкает.
3. **Telegram-нотификация** админу через существующий `notify-new-lead` паттерн (memory: `tech/notifications-backend`): краткое summary (Gemini-flash), канал, ссылка на диалог в `/admin/concierge/c/{id}`.
4. Оператор открывает диалог в админке и отвечает — ответ уходит обратно через `messaging-send` в исходный канал.
5. Кнопка «Return to AI» — возвращает диалог боту.

---

## 8. Knowledge base

**Структура (новые таблицы):**
- `kb_documents` — title, source (`faq | service | policy | product | pricing | contact`), language, status, content (markdown), updated_at.
- `kb_chunks` — document_id, chunk_text, embedding (vector(768)), token_count.
- `agent_policies` — singleton с JSON: allowed_topics, blocked_topics, tone presets, refusal templates, escalation rules, business_hours, qualification_questions.
- `agent_canned_replies` — key, language, text.

**Retrieval:** при входящем сообщении — embed запроса → top-5 чанков по cosine similarity, фильтр по language. Структурные данные (packages/works/blocked_dates) подмешиваются tool-calls, не embeddings.

**Restrictions:**
- system prompt запрещает отвечать вне retrieved context + structured tools;
- если retrieval вернул 0 релевантных чанков с similarity > threshold → safe fallback + handoff;
- админ в любой момент видит, какие чанки использовал агент для конкретного ответа (debug-панель в conversation view).

---

## 9. Telegram separation (customer vs admin/operations)

Полное разделение на уровне ботов и таблиц:

| | **Customer bot** (новый) | **Admin bot** (текущий) |
|---|---|---|
| Назначение | диалоги с клиентами | уведомления о лидах/эскалации, команды для оператора |
| Token | новый bot token, отдельный connector/secret | текущий `TELEGRAM_BOT_TOKEN` |
| Кто пишет | публичные клиенты | только связанные админы (`telegram_admins`) |
| Таблицы | `messaging_conversations`, `messaging_messages` | `telegram_admins`, существующие нотификации |
| Команды | `/start`, `/services`, `/portfolio`, `/contact` | `/handoff <id>`, `/release <id>`, `/stats`, `/pause`, `/resume` |
| RLS | service-role only | service-role only, проверка `is_active=true` |

Customer bot **никогда** не получает админ-команды (whitelist по chat_id из `telegram_admins`). Admin bot **никогда** не пишет клиентам напрямую.

---

## 10. Mobile-friendly UX principles

- Inbox — single column на mobile, swipe-actions: take over / close / mark spam.
- Conversation view — sticky composer внизу, customer profile в bottom sheet (не sidebar).
- Все critical actions достижимы одной рукой (нижние 60% экрана).
- KB и Policies — accordion-формы, autosave, без модалок.
- Push-нотификации через тот же Telegram admin bot (нативные пуши не требуются).
- Темная тема и semantic tokens по существующей системе (memory: `style/color-tokens`).
- Разметка ответов — короткие сообщения, без длинных простыней даже в Telegram.

---

## 11. Security model

- **RLS:** все новые таблицы — `service_role`-only либо `has_role(auth.uid(), 'admin')` для чтения/редактирования. Клиентские сообщения в Postgres недоступны анонимам (memory: `tech/auth-security`).
- **Secrets:** токены ботов и Meta App secrets — только в Lovable Cloud secrets, никогда в коде/клиенте.
- **Webhook verification:** Meta — проверка `X-Hub-Signature-256` против App Secret; Telegram — secret token в URL webhook.
- **RBAC в админке:** просмотр Inbox — admin; редактирование KB/Policies — admin; audit log пишется в существующую `admin_actions`.
- **PII:** телефоны/email из чатов нормализуются и связываются с `customer_profiles`; в логах AI prompts — маскируются.
- **Rate limiting:** на `messaging-ingest` per channel+sender (защита от флуда), in-memory + БД-счётчик.
- **Safe fallback:** любая ошибка AI/сети → дружелюбный шаблон + handoff, никогда «error 500» клиенту.
- **Admin override:** кнопка «Pause AI globally» — все каналы переходят в режим «оператор ответит в течение X».
- **Scope hardening:** policy validator работает как второй LLM-проход на дешёвой модели, проверяет ответ против allowed/blocked topics — defense in depth против jailbreaks.

---

## 12. Risks and mistakes to avoid

1. **Meta App Review занимает 1–4 недели** для permissions `instagram_manage_messages`, `pages_messaging`. Закладываем заранее, MVP можно тестить в режиме разработчика с тестовыми пользователями.
2. **24-часовое окно Meta** — частая причина «не отправляется». Очередь и явный UX «вне окна».
3. **Hallucinated prices/dates** — самая опасная ошибка для бренда. Решается tool-calls + policy validator + жёсткий system prompt.
4. **Смешивание customer и admin Telegram** — две разные сущности, два разных бота, без исключений.
5. **Длинные AI-простыни в Instagram** — убивают premium-впечатление. Channel formatter режет жёстко.
6. **Auto-reply на жалобы** — мгновенный handoff, никаких AI-извинений.
7. **Realtime overload** — Inbox реалтайм только на conversation list, внутри диалога — на сообщения этого диалога; не подписываемся на всё подряд.
8. **Стоимость AI** — cache embeddings, scope guard на flash-lite, главный ответ на flash-preview, pro только для summary/handoff.
9. **Webhook не верифицируется** — открытая дверь для спуфинга. Verify обязательно.
10. **KB drift** — без процесса обновления KB агент начинает врать. UI должен показывать «устарело N дней назад».

---

## 13. Final implementation recommendation — поэтапно

Делаем 4 спринтами, каждый — отдельная итерация в Lovable.

**Sprint 1 — Foundation (без внешних каналов).**
- Миграции: `messaging_conversations`, `messaging_messages`, `kb_documents`, `kb_chunks` (pgvector), `agent_policies`, `agent_canned_replies`.
- Edge: `agent-respond` (scope guard + retrieval + Gemini + policy validator + tool-calls на packages/works/blocked_dates/create_lead).
- Edge: `kb-embed` (заливка/реиндексация KB).
- Админка `/admin/concierge`: Inbox (mock), Conversation view, KB CRUD, Policies, Canned replies, Playground для теста агента без каналов.

**Sprint 2 — Telegram customer bot.**
- Новый Telegram bot (отдельный токен), новая edge `telegram-customer-poll` или webhook.
- `messaging-send/telegram`, inline keyboards, lead capture flow.
- Telegram admin notifications + команды `/handoff`, `/release`, `/pause`.

**Sprint 3 — Instagram DM + Facebook Messenger.**
- Подключение Meta App, верификация webhook, обработка `messages`/`messaging_postbacks`.
- Channel formatters (длина, quick replies, generic template для FB).
- Уважение 24h-окна, очередь отложенных сообщений.

**Sprint 4 — Polish & analytics.**
- Analytics dashboard (auto-resolved %, conversion, SLA).
- Mobile UX-проход, swipe-actions, bottom sheets.
- Audit log, «Pause AI globally», health-checks каналов.

**После Sprint 1 у вас уже работающий AI-агент, которого можно тестить в Playground и проверить tone/scope/qualifying — без риска что-то отправится клиенту.** Это правильная страховка перед подключением живых каналов.

---

После одобрения начнём со Sprint 1. Готов сразу детализировать миграции и system prompt бренда KiKi на основе существующих memory (`brand/identity`, `features/service-packages`, `features/booking-logic`, `features/checkout-quote-flow`).
