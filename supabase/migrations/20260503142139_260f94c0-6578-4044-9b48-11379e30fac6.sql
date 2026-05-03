
-- Add 'driver' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';

-- Add fields to logistics_requests
ALTER TABLE public.logistics_requests
  ADD COLUMN IF NOT EXISTS assigned_driver_id uuid,
  ADD COLUMN IF NOT EXISTS picked_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS proof_url text,
  ADD COLUMN IF NOT EXISTS driver_note text,
  ADD COLUMN IF NOT EXISTS estimated_price integer DEFAULT 0;

-- Add fields to packaging_requests
ALTER TABLE public.packaging_requests
  ADD COLUMN IF NOT EXISTS assigned_driver_id uuid,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS proof_url text,
  ADD COLUMN IF NOT EXISTS driver_note text;

-- Drivers can view/update their assigned logistics_requests
CREATE POLICY "Drivers view assigned logistics"
  ON public.logistics_requests FOR SELECT
  USING (assigned_driver_id = auth.uid());

CREATE POLICY "Drivers update assigned logistics"
  ON public.logistics_requests FOR UPDATE
  USING (assigned_driver_id = auth.uid());

CREATE POLICY "Drivers view assigned packaging"
  ON public.packaging_requests FOR SELECT
  USING (assigned_driver_id = auth.uid());

CREATE POLICY "Drivers update assigned packaging"
  ON public.packaging_requests FOR UPDATE
  USING (assigned_driver_id = auth.uid());

-- Storage bucket for proof of delivery
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Drivers upload proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'delivery-proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated view proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'delivery-proofs' AND auth.uid() IS NOT NULL);
