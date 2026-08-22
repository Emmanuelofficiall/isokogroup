-- Public thumbnails are readable by everyone; only admins may upload/manage them.
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Thumbnails public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Admins upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'thumbnails' AND is_admin());

CREATE POLICY "Admins update thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'thumbnails' AND is_admin());

CREATE POLICY "Admins delete thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'thumbnails' AND is_admin());
