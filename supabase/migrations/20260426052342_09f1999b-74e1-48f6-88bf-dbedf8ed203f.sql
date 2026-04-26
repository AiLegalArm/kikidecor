-- Add full-text search column to kb_chunks
ALTER TABLE public.kb_chunks
  ADD COLUMN IF NOT EXISTS search_tsv tsvector;

-- Populate based on language (Russian / English / simple fallback)
CREATE OR REPLACE FUNCTION public.kb_chunks_tsv_update()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_tsv :=
    CASE NEW.language
      WHEN 'ru' THEN to_tsvector('russian', coalesce(NEW.chunk_text, ''))
      WHEN 'en' THEN to_tsvector('english', coalesce(NEW.chunk_text, ''))
      ELSE to_tsvector('simple', coalesce(NEW.chunk_text, ''))
    END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_kb_chunks_tsv ON public.kb_chunks;
CREATE TRIGGER trg_kb_chunks_tsv
BEFORE INSERT OR UPDATE OF chunk_text, language ON public.kb_chunks
FOR EACH ROW EXECUTE FUNCTION public.kb_chunks_tsv_update();

CREATE INDEX IF NOT EXISTS idx_kb_chunks_tsv ON public.kb_chunks USING gin (search_tsv);

-- Drop old vector RPC, replace with FTS RPC
DROP FUNCTION IF EXISTS public.kb_match_chunks(extensions.vector, INT, TEXT, FLOAT);

CREATE OR REPLACE FUNCTION public.kb_search_chunks(
  query_text TEXT,
  match_count INT DEFAULT 5,
  filter_language TEXT DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  chunk_text TEXT,
  rank REAL,
  document_title TEXT,
  document_source TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ts_query tsquery;
  cfg regconfig;
BEGIN
  cfg := CASE filter_language
    WHEN 'en' THEN 'english'::regconfig
    WHEN 'ru' THEN 'russian'::regconfig
    ELSE 'russian'::regconfig
  END;

  -- websearch_to_tsquery is forgiving of natural-language input
  ts_query := websearch_to_tsquery(cfg, coalesce(query_text, ''));

  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.chunk_text,
    ts_rank(c.search_tsv, ts_query) AS rank,
    d.title,
    d.source
  FROM public.kb_chunks c
  JOIN public.kb_documents d ON d.id = c.document_id
  WHERE
    d.status = 'published'
    AND (filter_language IS NULL OR c.language = filter_language)
    AND c.search_tsv @@ ts_query
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;