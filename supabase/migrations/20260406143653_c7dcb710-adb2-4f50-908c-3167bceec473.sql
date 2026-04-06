
-- Allow inserting commissions
CREATE POLICY "System can insert commissions" ON public.commissions FOR INSERT TO authenticated WITH CHECK (true);

-- Allow admins to manage products
CREATE POLICY "Admins can update any product" ON public.products FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete any product" ON public.products FOR DELETE TO authenticated USING (is_admin());

-- Allow admins to manage orders
CREATE POLICY "Admins can update any order" ON public.orders FOR UPDATE TO authenticated USING (is_admin());
