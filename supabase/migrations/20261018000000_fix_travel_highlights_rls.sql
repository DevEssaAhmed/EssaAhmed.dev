-- Migration: fix_travel_highlights_rls
-- Restrict public read access to published travel highlights and limit write access to admin users.

-- Setup: set {"role":"admin"} in app_metadata for the trusted Supabase admin user.
-- Set this claim through the Supabase Dashboard or Admin API, never user_metadata.
CREATE OR REPLACE FUNCTION public.is_portfolio_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;
REVOKE ALL ON FUNCTION public.is_portfolio_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_portfolio_admin() TO authenticated;

-- Drop existing policies on public.travel_highlights.
DROP POLICY IF EXISTS "Public can view published travel highlights" ON public.travel_highlights;
DROP POLICY IF EXISTS "Authenticated users can manage travel highlights" ON public.travel_highlights;

-- Recreate secure policies.
-- Anonymous/public reads limited to published highlights
CREATE POLICY "Public can view published travel highlights"
  ON public.travel_highlights
  FOR SELECT
  USING (is_published = true);

-- Writes/management restricted strictly to users with trusted app_metadata role = 'admin'
CREATE POLICY "Authenticated users can manage travel highlights"
  ON public.travel_highlights
  FOR ALL
  TO authenticated
  USING (public.is_portfolio_admin())
  WITH CHECK (public.is_portfolio_admin());
