CREATE POLICY "book content read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'book-content');
CREATE POLICY "book content admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-content' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "book content admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'book-content' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "book content admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'book-content' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "voice notes own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'voice-notes' AND owner = auth.uid());
CREATE POLICY "voice notes own insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'voice-notes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "voice notes own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'voice-notes' AND owner = auth.uid());
