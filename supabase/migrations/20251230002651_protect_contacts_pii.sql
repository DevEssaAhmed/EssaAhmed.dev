-- Recovered from supabase_migrations.schema_migrations on the linked project.

-- Fix critical security: Protect contacts PII and hide profile email

-- 1. Drop overly permissive contacts SELECT policy
DROP POLICY IF EXISTS "Anyone can read contacts" ON public.contacts;

-- 2. Create policy so only authenticated users can read contacts
CREATE POLICY "Authenticated users can read contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (true);

-- 3. For profile, we'll handle email visibility in the app layer
-- (hiding specific columns via RLS is complex and would break existing queries)
