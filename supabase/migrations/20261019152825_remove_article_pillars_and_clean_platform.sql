-- Migration: 20261019152825_remove_article_pillars_and_clean_platform.sql
-- Removes pillar and on-site platform defaults from blog_posts,
-- clears them on internal articles, and adds text id default to travel_highlights.

-- 1. Remove column defaults that auto-assigned articles to pillars and 'On Site'
ALTER TABLE public.blog_posts
  ALTER COLUMN pillar DROP DEFAULT,
  ALTER COLUMN platform DROP DEFAULT;

-- 2. Clear out pillar and platform for existing internal/on-site articles
UPDATE public.blog_posts
SET pillar = NULL,
    platform = NULL
WHERE is_external = false OR external_url IS NULL OR external_url = '';

-- 3. Ensure travel_highlights table has a safe text id default
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.travel_highlights
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;