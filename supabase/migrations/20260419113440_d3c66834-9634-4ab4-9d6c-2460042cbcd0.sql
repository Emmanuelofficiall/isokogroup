-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Logistics requests
CREATE TABLE public.logistics_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pickup TEXT NOT NULL,
  dropoff TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  preferred_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.logistics_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own logistics" ON public.logistics_requests FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users create logistics" ON public.logistics_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update logistics" ON public.logistics_requests FOR UPDATE USING (is_admin());

-- Packaging requests
CREATE TABLE public.packaging_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  pickup_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packaging_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own packaging" ON public.packaging_requests FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users create packaging" ON public.packaging_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update packaging" ON public.packaging_requests FOR UPDATE USING (is_admin());

-- Seller applications
CREATE TABLE public.seller_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own application" ON public.seller_applications FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users create application" ON public.seller_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update application" ON public.seller_applications FOR UPDATE USING (is_admin());

-- Auto profile creation trigger (safety, in case it isn't on auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();