-- Recovered from supabase_migrations.schema_migrations on the linked project.

-- Enable RLS on seo_settings table
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read SEO settings (needed for public pages)
CREATE POLICY "SEO settings are publicly readable"
ON public.seo_settings
FOR SELECT
USING (true);

-- Only authenticated users can modify SEO settings
CREATE POLICY "Authenticated users can manage SEO settings"
ON public.seo_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
