CREATE TABLE public.ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
  interaction_type text NOT NULL,
  input_data jsonb DEFAULT '{}'::jsonb,
  output_data jsonb DEFAULT '{}'::jsonb,
  selected_product_ids uuid[] DEFAULT '{}'::uuid[],
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ai interactions" ON public.ai_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view ai interactions" ON public.ai_interactions FOR SELECT USING (true);

CREATE INDEX idx_ai_interactions_session ON public.ai_interactions(session_id);
CREATE INDEX idx_ai_interactions_type ON public.ai_interactions(interaction_type);
CREATE INDEX idx_ai_interactions_created ON public.ai_interactions(created_at DESC);