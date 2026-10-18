-- Captured from the applied Supabase migration with version 20250812053408.
ALTER TABLE public.projects
  ADD COLUMN description_jsonb jsonb;
