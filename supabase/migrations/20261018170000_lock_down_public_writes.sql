-- Restrict portfolio content and storage mutations to trusted administrators.
-- Public content reads remain governed by each table's SELECT policy.

CREATE OR REPLACE FUNCTION public.is_portfolio_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

REVOKE ALL ON FUNCTION public.is_portfolio_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_portfolio_admin() TO authenticated;

-- The admin maintenance screen is the only application caller of this RPC.
-- Keep it available to signed-in admins while preventing direct calls from
-- unauthenticated or non-admin users. The invoker runs under normal RLS, and
-- the empty search path requires all relations and helpers to be qualified.
CREATE OR REPLACE FUNCTION public.get_all_tags_with_counts()
RETURNS TABLE(name text, total_count bigint, article_count bigint, project_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH tag_counts AS (
    SELECT tag_id, count(blog_post_id) AS article_count, 0::bigint AS project_count
    FROM public.blog_post_tags
    GROUP BY tag_id
    UNION ALL
    SELECT tag_id, 0::bigint AS article_count, count(project_id) AS project_count
    FROM public.project_tags
    GROUP BY tag_id
  )
  SELECT
    t.name,
    sum(tc.article_count + tc.project_count)::bigint AS total_count,
    sum(tc.article_count)::bigint AS article_count,
    sum(tc.project_count)::bigint AS project_count
  FROM public.tags AS t
  JOIN tag_counts AS tc ON t.id = tc.tag_id
  WHERE (SELECT public.is_portfolio_admin())
  GROUP BY t.name
  ORDER BY total_count DESC;
$$;

REVOKE ALL ON FUNCTION public.get_all_tags_with_counts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_tags_with_counts() TO authenticated;

-- These functions are invoked by existing database triggers, not through the
-- Data API. Remove direct client execution and pin SECURITY DEFINER lookup paths.
ALTER FUNCTION public.auto_generate_tag_slug() SET search_path = '';
ALTER FUNCTION public.update_category_article_count() SET search_path = '';
ALTER FUNCTION public.update_series_article_count() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.set_diary_entries_updated_at() SET search_path = '';
ALTER FUNCTION public.get_related_tags(text) SET search_path = '';

REVOKE ALL ON FUNCTION public.auto_generate_tag_slug() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_category_article_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_series_article_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_diary_entries_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_related_tags(text) FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  target_table text;
  existing_policy record;
  target_policy_name text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'blog_post_tags',
    'blog_posts',
    'categories',
    'diary_entries',
    'profile',
    'project_tags',
    'projects',
    'seo_settings',
    'series',
    'site_settings',
    'tags',
    'travel_highlights'
  ]
  LOOP
    FOR existing_policy IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = target_table
        AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    LOOP
      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON public.%I',
        existing_policy.policyname,
        target_table
      );
    END LOOP;

    target_policy_name := 'Portfolio admins can manage ' || target_table;
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin())',
      target_policy_name,
      target_table
    );

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);
  END LOOP;

  -- Contact forms must accept public inserts. Reads and all other mutations
  -- are limited to admins because contact records contain personal details.
  FOR existing_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contacts'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.contacts',
      existing_policy.policyname
    );
  END LOOP;

  ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
END;
$$;

-- Public article access must stop at published rows. Admins still see drafts
-- through the administrator policy created above.
DROP POLICY IF EXISTS "Blog posts are publicly readable" ON public.blog_posts;
CREATE POLICY "Published blog posts are publicly readable"
  ON public.blog_posts
  FOR SELECT
  TO public
  USING (published = true);

-- Make the profile view obey the caller's privileges and the profile table's
-- RLS policies instead of using its owner's permissions.
CREATE OR REPLACE VIEW public.profile_settings
  WITH (security_invoker = true)
AS
  SELECT
    id,
    name,
    username,
    title,
    bio,
    location,
    avatar_url,
    email,
    github_url,
    linkedin_url,
    website_url,
    skills,
    stats,
    created_at,
    updated_at,
    about_markdown,
    about_content_jsonb
  FROM public.profile;

CREATE POLICY "Portfolio admins can manage contacts"
  ON public.contacts
  FOR ALL
  TO authenticated
  USING (public.is_portfolio_admin())
  WITH CHECK (public.is_portfolio_admin());

CREATE POLICY "Anyone can submit contact messages"
  ON public.contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Remove unused table privileges from API roles, then restore only the
-- operations the public site and signed-in admin interface need. RLS remains
-- the row-level authorization layer for every operation below.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE
  public.blog_post_tags,
  public.blog_posts,
  public.categories,
  public.contacts,
  public.diary_entries,
  public.profile,
  public.profile_settings,
  public.project_tags,
  public.projects,
  public.seo_settings,
  public.series,
  public.site_settings,
  public.tags,
  public.travel_highlights
FROM anon, authenticated;

GRANT SELECT ON TABLE
  public.blog_post_tags,
  public.blog_posts,
  public.categories,
  public.diary_entries,
  public.profile,
  public.profile_settings,
  public.project_tags,
  public.projects,
  public.seo_settings,
  public.series,
  public.site_settings,
  public.tags,
  public.travel_highlights
TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE
  public.blog_post_tags,
  public.blog_posts,
  public.categories,
  public.diary_entries,
  public.profile,
  public.project_tags,
  public.projects,
  public.seo_settings,
  public.series,
  public.site_settings,
  public.tags,
  public.travel_highlights
TO authenticated;

GRANT INSERT ON TABLE public.contacts TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.contacts TO authenticated;

-- The BlockNote editor stores non-image and non-video attachments in `files`
-- and reads them through public URLs. Create that bucket if it is missing.
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Keep the existing public-read policies for URL-backed assets. In particular,
-- `documents` is marked private but has a public object SELECT policy; changing
-- that access model requires switching document consumers to signed URLs.
DO $$
DECLARE
  target_bucket text;
BEGIN
  FOREACH target_bucket IN ARRAY ARRAY['avatars', 'documents', 'images', 'videos']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Allow uploads to ' || target_bucket);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Allow updates to ' || target_bucket);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Allow delete from ' || target_bucket);
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS "Public can read portfolio files" ON storage.objects;
CREATE POLICY "Public can read portfolio files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'files');

CREATE POLICY "Portfolio admins can manage portfolio uploads"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id IN ('avatars', 'documents', 'images', 'videos', 'files')
    AND public.is_portfolio_admin()
  )
  WITH CHECK (
    bucket_id IN ('avatars', 'documents', 'images', 'videos', 'files')
    AND public.is_portfolio_admin()
  );
