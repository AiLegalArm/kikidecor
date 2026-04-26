DROP POLICY IF EXISTS "Public can view work covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload work covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update work covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete work covers" ON storage.objects;
DROP POLICY IF EXISTS "Public can view work gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload work gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update work gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete work gallery" ON storage.objects;

CREATE POLICY "Public can view work covers" ON storage.objects FOR SELECT USING (bucket_id = 'work-covers');
CREATE POLICY "Admins can upload work covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update work covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete work covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view work gallery" ON storage.objects FOR SELECT USING (bucket_id = 'work-gallery');
CREATE POLICY "Admins can upload work gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'work-gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update work gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'work-gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete work gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'work-gallery' AND public.has_role(auth.uid(), 'admin'));