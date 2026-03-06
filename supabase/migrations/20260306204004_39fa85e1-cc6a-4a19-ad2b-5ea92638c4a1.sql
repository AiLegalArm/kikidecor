
-- Storage bucket for venue photos
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-photos', 'venue-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload and read venue photos
CREATE POLICY "Anyone can upload venue photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'venue-photos');

CREATE POLICY "Anyone can view venue photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'venue-photos');
