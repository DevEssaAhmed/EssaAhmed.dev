-- Recovered from supabase_migrations.schema_migrations on the linked project.

-- First, let's ensure the foreign key relationship between projects and categories exists
ALTER TABLE projects 
ADD CONSTRAINT fk_projects_category 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Add some default categories for projects if none exist
INSERT INTO categories (name, slug, description, color, featured) 
VALUES 
  ('Web Development', 'web-development', 'Web applications and websites', '#3B82F6', true),
  ('Mobile Apps', 'mobile-apps', 'Mobile applications for iOS and Android', '#10B981', true),
  ('Data Science', 'data-science', 'Data analysis and machine learning projects', '#8B5CF6', true),
  ('UI/UX Design', 'ui-ux-design', 'User interface and experience design', '#F59E0B', false),
  ('DevOps', 'devops', 'Infrastructure and deployment automation', '#EF4444', false)
ON CONFLICT (slug) DO NOTHING;

-- Create a function to clean up project tags (we'll phase this out for projects)
CREATE OR REPLACE FUNCTION cleanup_project_tags_on_category_update()
RETURNS TRIGGER AS $$
BEGIN
  -- When a project gets a category_id, we can optionally clean up its tags
  -- For now, we'll keep both to allow gradual migration
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
