-- Recovered from supabase_migrations.schema_migrations on the linked project.

-- Fix search_path on all functions that don't have it set

-- 1. Fix update_category_article_count
CREATE OR REPLACE FUNCTION public.update_category_article_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.category_id IS NOT NULL AND NEW.published = true THEN
      UPDATE public.categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      IF OLD.category_id IS NOT NULL AND OLD.published = true THEN
        UPDATE public.categories SET article_count = GREATEST(article_count - 1, 0) WHERE id = OLD.category_id;
      END IF;
      IF NEW.category_id IS NOT NULL AND NEW.published = true THEN
        UPDATE public.categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
      END IF;
    END IF;
    IF OLD.published IS DISTINCT FROM NEW.published AND NEW.category_id IS NOT NULL THEN
      IF NEW.published = true THEN
        UPDATE public.categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
      ELSE
        UPDATE public.categories SET article_count = GREATEST(article_count - 1, 0) WHERE id = NEW.category_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.category_id IS NOT NULL AND OLD.published = true THEN
      UPDATE public.categories SET article_count = GREATEST(article_count - 1, 0) WHERE id = OLD.category_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- 2. Fix update_series_article_count
CREATE OR REPLACE FUNCTION public.update_series_article_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.series_id IS NOT NULL AND NEW.published = true THEN
      UPDATE public.series SET article_count = article_count + 1 WHERE id = NEW.series_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.series_id IS DISTINCT FROM NEW.series_id THEN
      IF OLD.series_id IS NOT NULL AND OLD.published = true THEN
        UPDATE public.series SET article_count = GREATEST(article_count - 1, 0) WHERE id = OLD.series_id;
      END IF;
      IF NEW.series_id IS NOT NULL AND NEW.published = true THEN
        UPDATE public.series SET article_count = article_count + 1 WHERE id = NEW.series_id;
      END IF;
    END IF;
    IF OLD.published IS DISTINCT FROM NEW.published AND NEW.series_id IS NOT NULL THEN
      IF NEW.published = true THEN
        UPDATE public.series SET article_count = article_count + 1 WHERE id = NEW.series_id;
      ELSE
        UPDATE public.series SET article_count = GREATEST(article_count - 1, 0) WHERE id = NEW.series_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.series_id IS NOT NULL AND OLD.published = true THEN
      UPDATE public.series SET article_count = GREATEST(article_count - 1, 0) WHERE id = OLD.series_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- 3. Fix generate_slug
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
BEGIN
  RETURN lower(regexp_replace(trim(input_text), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$function$;

-- 4. Fix auto_generate_tag_slug
CREATE OR REPLACE FUNCTION public.auto_generate_tag_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.name);
  END IF;
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$function$;

-- 5. Fix get_related_tags
CREATE OR REPLACE FUNCTION public.get_related_tags(p_tag_name text)
RETURNS TABLE(name text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  with project_and_blog_tags as (
    select distinct tag_id, project_id as id from public.project_tags
    union all
    select distinct tag_id, blog_post_id as id from public.blog_post_tags
  ),
  current_tag_items as (
    select id from project_and_blog_tags where tag_id = (select id from public.tags where name = p_tag_name)
  ),
  related_tag_ids as (
    select distinct tag_id
    from project_and_blog_tags
    where id in (select id from current_tag_items) and tag_id != (select id from public.tags where name = p_tag_name)
  )
  select public.tags.name, count(t.tag_id) as count
  from related_tag_ids as t
  join public.tags on public.tags.id = t.tag_id
  group by public.tags.name
  order by count desc
  limit 10;
$function$;

-- 6. Fix get_all_tags_with_counts
CREATE OR REPLACE FUNCTION public.get_all_tags_with_counts()
RETURNS TABLE(name text, total_count bigint, article_count bigint, project_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  with tag_counts as (
    select tag_id, count(blog_post_id) as article_count, 0::bigint as project_count
    from public.blog_post_tags
    group by tag_id
    union all
    select tag_id, 0::bigint as article_count, count(project_id) as project_count
    from public.project_tags
    group by tag_id
  )
  select 
    t.name, 
    sum(tc.article_count + tc.project_count) as total_count,
    sum(tc.article_count) as article_count,
    sum(tc.project_count) as project_count
  from public.tags t
  join tag_counts tc on t.id = tc.tag_id
  group by t.name
  order by total_count desc;
$function$;
