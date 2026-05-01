-- Couriers / drivers registry
CREATE TABLE public.couriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  vehicle_type text NOT NULL DEFAULT 'van',
  vehicle_plate text,
  company text,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active couriers"
  ON public.couriers FOR SELECT
  USING (active = true OR is_admin());

CREATE POLICY "Admins manage couriers insert"
  ON public.couriers FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins manage couriers update"
  ON public.couriers FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins manage couriers delete"
  ON public.couriers FOR DELETE
  USING (is_admin());

CREATE TRIGGER couriers_updated_at
  BEFORE UPDATE ON public.couriers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Shipping rates lookup (zone + weight bracket)
CREATE TABLE public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone text NOT NULL,
  min_weight_kg numeric NOT NULL DEFAULT 0,
  max_weight_kg numeric NOT NULL DEFAULT 9999,
  base_cost integer NOT NULL DEFAULT 0,
  per_kg_cost integer NOT NULL DEFAULT 0,
  per_km_cost integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shipping rates"
  ON public.shipping_rates FOR SELECT
  USING (active = true OR is_admin());

CREATE POLICY "Admins manage shipping rates insert"
  ON public.shipping_rates FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins manage shipping rates update"
  ON public.shipping_rates FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins manage shipping rates delete"
  ON public.shipping_rates FOR DELETE
  USING (is_admin());

CREATE TRIGGER shipping_rates_updated_at
  BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add courier_id link on shipments (keep existing free-text courier for backwards compat)
ALTER TABLE public.shipments ADD COLUMN courier_id uuid;
ALTER TABLE public.shipments ADD COLUMN distance_km numeric DEFAULT 0;

-- Seed default rate brackets
INSERT INTO public.shipping_rates (zone, min_weight_kg, max_weight_kg, base_cost, per_kg_cost, per_km_cost) VALUES
  ('local', 0, 5, 2000, 200, 50),
  ('local', 5, 20, 3500, 150, 50),
  ('local', 20, 9999, 5000, 100, 50),
  ('regional', 0, 5, 4000, 300, 80),
  ('regional', 5, 20, 6000, 250, 80),
  ('regional', 20, 9999, 9000, 200, 80),
  ('national', 0, 5, 7000, 500, 120),
  ('national', 5, 20, 11000, 400, 120),
  ('national', 20, 9999, 17000, 300, 120);