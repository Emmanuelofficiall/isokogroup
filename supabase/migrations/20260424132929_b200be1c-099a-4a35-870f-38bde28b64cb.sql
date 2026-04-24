ALTER TABLE public.seller_applications
ADD COLUMN IF NOT EXISTS rejection_reason text;