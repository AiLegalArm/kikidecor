
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS video_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('work-videos', 'work-videos', true, 104857600, ARRAY['video/mp4','video/webm','video/quicktime'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 104857600, allowed_mime_types = ARRAY['video/mp4','video/webm','video/quicktime'];

CREATE POLICY "Public can view work videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'work-videos');

CREATE POLICY "Admins can upload work videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'work-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update work videos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'work-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete work videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'work-videos' AND public.has_role(auth.uid(), 'admin'));
