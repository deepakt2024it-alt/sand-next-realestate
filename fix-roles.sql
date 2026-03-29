DROP POLICY IF EXISTS "Anyone can insert buyer requirement" ON public.buyer_requirements;
CREATE POLICY "Anyone can insert buyer requirement" ON public.buyer_requirements FOR INSERT TO anon, authenticated WITH CHECK (true);
