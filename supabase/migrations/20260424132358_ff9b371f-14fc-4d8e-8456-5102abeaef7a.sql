-- Add email column to seller_applications (used by BecomeSeller form)
ALTER TABLE public.seller_applications
ADD COLUMN IF NOT EXISTS email text;