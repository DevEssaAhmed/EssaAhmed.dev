-- Migration: fix_travel_highlights_id_default
-- Ensure travel_highlights table has a safe text id default (gen_random_uuid()::text)
-- Preserves existing schema and provides deployed-migration repair path.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.travel_highlights
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
