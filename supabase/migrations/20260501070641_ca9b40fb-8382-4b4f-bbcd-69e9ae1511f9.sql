ALTER TABLE public.logistics_requests
  ADD COLUMN full_name TEXT,
  ADD COLUMN phone TEXT;

ALTER TABLE public.packaging_requests
  ADD COLUMN full_name TEXT,
  ADD COLUMN phone TEXT;