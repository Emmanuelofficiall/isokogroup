
DROP POLICY "System can insert commissions" ON public.commissions;
CREATE POLICY "Sellers can insert own commissions" ON public.commissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
