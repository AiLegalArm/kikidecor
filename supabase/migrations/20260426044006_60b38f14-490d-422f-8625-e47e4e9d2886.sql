
-- Generations table
CREATE TABLE public.wan_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'queued', -- queued | running | completed | failed
  user_prompt TEXT NOT NULL,
  compiled_prompt TEXT NOT NULL,
  preset_id TEXT,
  preset_name TEXT,
  first_frame_url TEXT,
  last_frame_url TEXT,
  last_frame_description TEXT,
  motion JSONB NOT NULL DEFAULT '{}'::jsonb,
  mood JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {resolution, aspectRatio, duration, cameraFixed}
  negative_prompt TEXT,
  style_strength INTEGER NOT NULL DEFAULT 60,
  video_url TEXT,
  thumbnail_url TEXT,
  error_message TEXT,
  duration_ms INTEGER
);

ALTER TABLE public.wan_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage wan_runs"
  ON public.wan_runs FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_wan_runs_updated_at
  BEFORE UPDATE ON public.wan_runs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_wan_runs_created ON public.wan_runs (created_at DESC);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('wan-frames', 'wan-frames', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('wan-videos', 'wan-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for both buckets
CREATE POLICY "Public read wan-frames"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wan-frames');

CREATE POLICY "Public read wan-videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wan-videos');

-- Admins write
CREATE POLICY "Admins write wan-frames"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wan-frames' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins write wan-videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wan-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update wan objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('wan-frames', 'wan-videos') AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete wan objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('wan-frames', 'wan-videos') AND has_role(auth.uid(), 'admin'::app_role));
