-- Recovered from supabase_migrations.schema_migrations on the linked project.


-- Add composite indexes for optimizing common query patterns on mobile
-- These indexes cover the most frequent queries and improve response times

-- Composite index for projects list query (featured + created_at ordering)
CREATE INDEX IF NOT EXISTS idx_projects_featured_created_at 
ON public.projects (featured DESC, created_at DESC);

-- Composite index for blog posts with published filter and date ordering
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created_at 
ON public.blog_posts (published, created_at DESC);

-- Composite index for projects with category filtering and date ordering  
CREATE INDEX IF NOT EXISTS idx_projects_category_created_at 
ON public.projects (category_id, created_at DESC);

-- Composite index for blog posts with category filtering and date ordering
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_created_at 
ON public.blog_posts (category_id, created_at DESC);

-- Composite index for series with status and featured sorting
CREATE INDEX IF NOT EXISTS idx_series_status_featured 
ON public.series (status, featured DESC, created_at DESC);

-- Add partial index for only published blog posts (very common query)
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_only
ON public.blog_posts (created_at DESC) 
WHERE published = true;

-- Add partial index for featured projects (common on homepage)
CREATE INDEX IF NOT EXISTS idx_projects_featured_only
ON public.projects (created_at DESC) 
WHERE featured = true;

