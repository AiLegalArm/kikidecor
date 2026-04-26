-- Enable pgvector for KB embeddings
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ============ MESSAGING ============

CREATE TABLE public.messaging_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('telegram', 'instagram', 'facebook')),
  external_thread_id TEXT NOT NULL,
  external_user_id TEXT NOT NULL,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
  customer_display_name TEXT,
  customer_handle TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending_human', 'closed', 'spam')),
  ai_paused BOOLEAN NOT NULL DEFAULT false,
  assigned_to UUID,
  language TEXT,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_preview TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel, external_thread_id)
);

CREATE INDEX idx_messaging_conv_channel_status ON public.messaging_conversations (channel, status);
CREATE INDEX idx_messaging_conv_last_msg ON public.messaging_conversations (last_message_at DESC);
CREATE INDEX idx_messaging_conv_customer ON public.messaging_conversations (customer_id);

ALTER TABLE public.messaging_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage conversations"
ON public.messaging_conversations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_messaging_conv_updated
BEFORE UPDATE ON public.messaging_conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.messaging_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.messaging_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'agent', 'human', 'system')),
  content TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  external_message_id TEXT,
  ai_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messaging_msg_conv ON public.messaging_messages (conversation_id, created_at);

ALTER TABLE public.messaging_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage messages"
ON public.messaging_messages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ============ KNOWLEDGE BASE ============

CREATE TABLE public.kb_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('faq', 'service', 'policy', 'product', 'pricing', 'contact', 'process', 'other')),
  language TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'en')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  embedded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kb_docs_status_lang ON public.kb_documents (status, language);
CREATE INDEX idx_kb_docs_source ON public.kb_documents (source);

ALTER TABLE public.kb_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage kb_documents"
ON public.kb_documents FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_kb_docs_updated
BEFORE UPDATE ON public.kb_documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.kb_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.kb_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  token_count INTEGER,
  language TEXT NOT NULL DEFAULT 'ru',
  embedding extensions.vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kb_chunks_doc ON public.kb_chunks (document_id);
CREATE INDEX idx_kb_chunks_embedding ON public.kb_chunks USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.kb_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage kb_chunks"
ON public.kb_chunks FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- KB semantic search RPC (security definer, search_path includes extensions for vector ops)
CREATE OR REPLACE FUNCTION public.kb_match_chunks(
  query_embedding extensions.vector(768),
  match_count INT DEFAULT 5,
  filter_language TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.65
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  document_title TEXT,
  document_source TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, extensions
AS $$
  SELECT
    c.id AS chunk_id,
    c.document_id,
    c.chunk_text,
    1 - (c.embedding OPERATOR(extensions.<=>) query_embedding) AS similarity,
    d.title AS document_title,
    d.source AS document_source
  FROM public.kb_chunks c
  JOIN public.kb_documents d ON d.id = c.document_id
  WHERE
    d.status = 'published'
    AND (filter_language IS NULL OR c.language = filter_language)
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding OPERATOR(extensions.<=>) query_embedding) > similarity_threshold
  ORDER BY c.embedding OPERATOR(extensions.<=>) query_embedding ASC
  LIMIT match_count;
$$;


-- ============ AGENT POLICIES (singleton) ============

CREATE TABLE public.agent_policies (
  id INTEGER NOT NULL PRIMARY KEY CHECK (id = 1),
  allowed_topics TEXT[] NOT NULL DEFAULT ARRAY[
    'decor services','portfolio','ordering process','consultation',
    'date availability','price ranges','showroom products','contacts','logistics'
  ],
  blocked_topics TEXT[] NOT NULL DEFAULT ARRAY[
    'general knowledge','politics','medical advice','legal advice',
    'financial advice','homework help','code generation','small talk'
  ],
  tone_voice TEXT NOT NULL DEFAULT 'editorial, premium, calm, concise, no emoji spam',
  refusal_template_ru TEXT NOT NULL DEFAULT 'Я ассистент студии KiKi и помогаю только с вопросами о наших услугах декора и шоурума. Подсказать ближайшую свободную дату или показать примеры наших работ?',
  refusal_template_en TEXT NOT NULL DEFAULT 'I''m the KiKi studio assistant and help only with questions about our decor services and showroom. Would you like me to share available dates or show examples of our work?',
  handoff_template_ru TEXT NOT NULL DEFAULT 'Передаю менеджеру — он ответит вам в ближайшее время.',
  handoff_template_en TEXT NOT NULL DEFAULT 'Connecting you with our manager — they''ll reply shortly.',
  business_hours JSONB NOT NULL DEFAULT '{"timezone":"Europe/Moscow","mon_fri":[10,20],"sat":[11,18],"sun":null}'::jsonb,
  escalation_keywords TEXT[] NOT NULL DEFAULT ARRAY[
    'жалоба','претензия','refund','возврат','скидка','discount','юрист','lawyer',
    'manager','менеджер','оператор','human','человек','agent'
  ],
  confidence_threshold NUMERIC NOT NULL DEFAULT 0.55,
  max_repeated_clarifications INTEGER NOT NULL DEFAULT 3,
  qualification_questions JSONB NOT NULL DEFAULT '[
    {"key":"event_type","label_ru":"Тип события","label_en":"Event type","required":true},
    {"key":"event_date","label_ru":"Дата","label_en":"Date","required":true},
    {"key":"guests","label_ru":"Кол-во гостей","label_en":"Guests","required":false},
    {"key":"location","label_ru":"Локация","label_en":"Location","required":false},
    {"key":"contact","label_ru":"Контакт для связи","label_en":"Contact","required":true}
  ]'::jsonb,
  ai_globally_paused BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.agent_policies (id) VALUES (1);

ALTER TABLE public.agent_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage agent_policies"
ON public.agent_policies FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_agent_policies_updated
BEFORE UPDATE ON public.agent_policies
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============ CANNED REPLIES ============

CREATE TABLE public.agent_canned_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'en')),
  text TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, language)
);

ALTER TABLE public.agent_canned_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage canned_replies"
ON public.agent_canned_replies FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_canned_replies_updated
BEFORE UPDATE ON public.agent_canned_replies
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- Realtime for live inbox
ALTER PUBLICATION supabase_realtime ADD TABLE public.messaging_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messaging_messages;
ALTER TABLE public.messaging_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messaging_messages REPLICA IDENTITY FULL;