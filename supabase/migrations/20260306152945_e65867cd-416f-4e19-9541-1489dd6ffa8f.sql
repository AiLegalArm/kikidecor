
CREATE TABLE public.instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_id text NOT NULL UNIQUE,
  media_type text NOT NULL DEFAULT 'IMAGE',
  media_url text NOT NULL,
  thumbnail_url text,
  caption text,
  permalink text NOT NULL,
  like_count integer DEFAULT 0,
  timestamp timestamptz NOT NULL,
  cached_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Public read access (gallery is public)
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view instagram posts"
  ON public.instagram_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Index for deduplication and ordering
CREATE INDEX idx_instagram_posts_instagram_id ON public.instagram_posts(instagram_id);
CREATE INDEX idx_instagram_posts_timestamp ON public.instagram_posts(timestamp DESC);
