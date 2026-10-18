-- Captured from the applied Supabase migration with version 20261017183308.

-- 1. Add External Article & 3-Pillar columns to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS is_external boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS platform text DEFAULT 'On Site',
  ADD COLUMN IF NOT EXISTS pillar text DEFAULT 'Analytics & Decision Systems';

-- 2. Add topic_tag column to diary_entries
ALTER TABLE public.diary_entries
  ADD COLUMN IF NOT EXISTS topic_tag text DEFAULT 'Engineering & Reflections';

-- 3. Create dedicated travel_highlights table for Instagram-style Travel Atlas
CREATE TABLE IF NOT EXISTS public.travel_highlights (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  city_name text NOT NULL,
  country_name text NOT NULL,
  country_code text NOT NULL DEFAULT 'SA',
  flag text NOT NULL DEFAULT '🌍',
  year integer NOT NULL DEFAULT 2025,
  month text NOT NULL DEFAULT 'Nov 2025',
  subtitle text,
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  cover_image_url text,
  instagram_highlight_url text,
  is_published boolean NOT NULL DEFAULT true,
  story_slides jsonb NOT NULL DEFAULT '[]'::jsonb,
  essay_title text,
  essay_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on travel_highlights
ALTER TABLE public.travel_highlights ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'travel_highlights' AND policyname = 'Public can view published travel highlights'
  ) THEN
    CREATE POLICY "Public can view published travel highlights"
      ON public.travel_highlights
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'travel_highlights' AND policyname = 'Authenticated users can manage travel highlights'
  ) THEN
    CREATE POLICY "Authenticated users can manage travel highlights"
      ON public.travel_highlights
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
