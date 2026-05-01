
-- ============== PACKAGES ==============
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  package_type TEXT NOT NULL DEFAULT 'box',
  length_cm NUMERIC NOT NULL DEFAULT 0,
  width_cm NUMERIC NOT NULL DEFAULT 0,
  height_cm NUMERIC NOT NULL DEFAULT 0,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  barcode TEXT NOT NULL DEFAULT ('PKG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX packages_barcode_idx ON public.packages(barcode);
CREATE INDEX packages_order_idx ON public.packages(order_id);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View packages for own orders or admin"
  ON public.packages FOR SELECT
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = packages.order_id
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

CREATE POLICY "Seller or admin insert packages"
  ON public.packages FOR INSERT
  WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = packages.order_id AND o.seller_id = auth.uid()
    )
  );

CREATE POLICY "Seller or admin update packages"
  ON public.packages FOR UPDATE
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = packages.order_id AND o.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admin delete packages"
  ON public.packages FOR DELETE USING (is_admin());

CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== SHIPMENTS ==============
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  tracking_number TEXT NOT NULL DEFAULT ('TRK-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  courier TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  shipping_address TEXT,
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  estimated_delivery DATE,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX shipments_tracking_idx ON public.shipments(tracking_number);
CREATE INDEX shipments_order_idx ON public.shipments(order_id);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view shipment by tracking number"
  ON public.shipments FOR SELECT USING (true);

CREATE POLICY "Seller or admin insert shipments"
  ON public.shipments FOR INSERT
  WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = shipments.order_id AND o.seller_id = auth.uid()
    )
  );

CREATE POLICY "Seller or admin update shipments"
  ON public.shipments FOR UPDATE
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = shipments.order_id AND o.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admin delete shipments"
  ON public.shipments FOR DELETE USING (is_admin());

CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== TRACKING LOGS ==============
CREATE TABLE public.tracking_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tracking_logs_shipment_idx ON public.tracking_logs(shipment_id);

ALTER TABLE public.tracking_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tracking logs"
  ON public.tracking_logs FOR SELECT USING (true);

CREATE POLICY "Seller or admin insert tracking logs"
  ON public.tracking_logs FOR INSERT
  WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.shipments s
      JOIN public.orders o ON o.id = s.order_id
      WHERE s.id = tracking_logs.shipment_id AND o.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admin delete tracking logs"
  ON public.tracking_logs FOR DELETE USING (is_admin());

-- ============== AUTO TRACKING LOG TRIGGER ==============
CREATE OR REPLACE FUNCTION public.log_shipment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.tracking_logs (shipment_id, status, note, created_by)
    VALUES (NEW.id, NEW.status, 'Status updated', auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER shipments_log_status
  AFTER INSERT OR UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.log_shipment_status_change();

-- Realtime
ALTER TABLE public.shipments REPLICA IDENTITY FULL;
ALTER TABLE public.tracking_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_logs;
