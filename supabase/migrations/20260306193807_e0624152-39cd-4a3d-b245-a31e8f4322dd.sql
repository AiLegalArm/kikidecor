
CREATE TABLE public.lookbook_looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text,
  description text,
  description_en text,
  season text DEFAULT 'SS25',
  image_url text NOT NULL,
  product_ids uuid[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lookbook_looks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published looks"
  ON public.lookbook_looks FOR SELECT
  USING (is_published = true);

CREATE POLICY "Allow all modifications on lookbook_looks"
  ON public.lookbook_looks FOR ALL
  USING (true) WITH CHECK (true);
