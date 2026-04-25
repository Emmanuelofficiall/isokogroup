-- Entertainment table for films and podcasts
CREATE TABLE public.entertainment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  creator TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('film', 'podcast')),
  category TEXT NOT NULL DEFAULT 'trending',
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  cover_url TEXT,
  media_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  trending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.entertainment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view entertainment"
  ON public.entertainment FOR SELECT USING (true);

CREATE POLICY "Admins insert entertainment"
  ON public.entertainment FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins update entertainment"
  ON public.entertainment FOR UPDATE USING (is_admin());

CREATE POLICY "Admins delete entertainment"
  ON public.entertainment FOR DELETE USING (is_admin());

CREATE TRIGGER update_entertainment_updated_at
  BEFORE UPDATE ON public.entertainment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets for books and entertainment
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('entertainment', 'entertainment', true)
ON CONFLICT (id) DO NOTHING;

-- Books bucket: public read, admin write
CREATE POLICY "Books public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'books');

CREATE POLICY "Admins upload books"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'books' AND is_admin());

CREATE POLICY "Admins update books"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'books' AND is_admin());

CREATE POLICY "Admins delete books"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'books' AND is_admin());

-- Entertainment bucket: public read, admin write
CREATE POLICY "Entertainment public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'entertainment');

CREATE POLICY "Admins upload entertainment"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'entertainment' AND is_admin());

CREATE POLICY "Admins update entertainment"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'entertainment' AND is_admin());

CREATE POLICY "Admins delete entertainment"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'entertainment' AND is_admin());