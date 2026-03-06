
-- Add social commerce mapping columns to instagram_posts
ALTER TABLE public.instagram_posts 
  ADD COLUMN IF NOT EXISTS account TEXT NOT NULL DEFAULT 'decor',
  ADD COLUMN IF NOT EXISTS link_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS linked_product_ids UUID[] DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS linked_service_index INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS linked_portfolio_index INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS utm_clicks INTEGER DEFAULT 0;

-- Create instagram_clicks tracking table for conversion analytics
CREATE TABLE IF NOT EXISTS public.instagram_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_post_id UUID REFERENCES public.instagram_posts(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  click_type TEXT NOT NULL DEFAULT 'view',
  target_type TEXT,
  target_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert instagram clicks"
  ON public.instagram_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view instagram clicks"
  ON public.instagram_clicks FOR SELECT
  USING (true);

-- Allow admins to update instagram_posts (for linking)
CREATE POLICY "Allow all updates on instagram_posts"
  ON public.instagram_posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow inserts for sync
CREATE POLICY "Allow inserts on instagram_posts"
  ON public.instagram_posts FOR INSERT
  WITH CHECK (true);

-- Allow deletes for cleanup
CREATE POLICY "Allow deletes on instagram_posts"
  ON public.instagram_posts FOR DELETE
  USING (true);
