
-- Add ID document URL column to seller_applications
ALTER TABLE public.seller_applications
ADD COLUMN IF NOT EXISTS id_document_url text;

-- Create private storage bucket for ID documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can upload/view/update their own ID documents (folder = user_id)
CREATE POLICY "Users can view own ID documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own ID documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own ID documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'id-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all ID documents for review
CREATE POLICY "Admins can view all ID documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-documents'
  AND public.is_admin()
);
