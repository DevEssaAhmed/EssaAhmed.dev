-- Captured from the applied Supabase migration with version 20260901135426.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS unlisted boolean NOT NULL DEFAULT false;
