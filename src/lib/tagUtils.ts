import { supabase } from '@/integrations/supabase/client';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  featured?: boolean;
}

// Generate slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Create or get existing tag from tags table
export const createOrGetTag = async (tagName: string): Promise<Tag | null> => {
  try {
    const slug = generateSlug(tagName);
    
    // First try to get existing tag
    const { data: existingTag, error: fetchError } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingTag && !fetchError) {
      return existingTag;
    }

    // If tag doesn't exist, create it
    const { data: newTag, error: createError } = await supabase
      .from('tags')
      .insert([{
        name: tagName.trim(),
        slug: slug,
        color: '#3B82F6'
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating tag:', createError);
      return null;
    }

    return newTag;
  } catch (error) {
    console.error('Error in createOrGetTag:', error);
    return null;
  }
};

// Create or get existing category
export const createOrGetCategory = async (categoryName: string): Promise<Category | null> => {
  try {
    const slug = generateSlug(categoryName);
    
    // First try to get existing category
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingCategory && !fetchError) {
      return existingCategory;
    }

    // If category doesn't exist, create it
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert([{
        name: categoryName.trim(),
        slug: slug
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating category:', createError);
      return null;
    }

    return newCategory;
  } catch (error) {
    console.error('Error in createOrGetCategory:', error);
    return null;
  }
};

// Associate tags with blog post using junction table
export const associateBlogPostTags = async (blogPostId: string, tagNames: string[]): Promise<boolean> => {
  try {
    // First, remove existing tag associations
    const { error: deleteError } = await supabase
      .from('blog_post_tags')
      .delete()
      .eq('blog_post_id', blogPostId);

    if (deleteError) {
      console.error('Error removing existing blog post tags:', deleteError);
      return false;
    }

    // If no tags to associate, return success
    if (!tagNames || tagNames.length === 0) {
      return true;
    }

    // Create or get tags and prepare junction data
    const tagAssociations = [];
    for (const tagName of tagNames) {
      const tag = await createOrGetTag(tagName);
      if (tag) {
        tagAssociations.push({
          blog_post_id: blogPostId,
          tag_id: tag.id
        });
      }
    }

    // Insert new tag associations
    if (tagAssociations.length > 0) {
      const { error: insertError } = await supabase
        .from('blog_post_tags')
        .insert(tagAssociations);

      if (insertError) {
        console.error('Error inserting blog post tags:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in associateBlogPostTags:', error);
    return false;
  }
};

// Associate tags with project using junction table
export const associateProjectTags = async (projectId: string, tagNames: string[]): Promise<boolean> => {
  try {
    // First, remove existing tag associations
    const { error: deleteError } = await supabase
      .from('project_tags')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      console.error('Error removing existing project tags:', deleteError);
      return false;
    }

    // If no tags to associate, return success
    if (!tagNames || tagNames.length === 0) {
      return true;
    }

    // Create or get tags and prepare junction data
    const tagAssociations = [];
    for (const tagName of tagNames) {
      const tag = await createOrGetTag(tagName);
      if (tag) {
        tagAssociations.push({
          project_id: projectId,
          tag_id: tag.id
        });
      }
    }

    // Insert new tag associations
    if (tagAssociations.length > 0) {
      const { error: insertError } = await supabase
        .from('project_tags')
        .insert(tagAssociations);

      if (insertError) {
        console.error('Error inserting project tags:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in associateProjectTags:', error);
    return false;
  }
};

// Get tags for blog post from junction table
export const getBlogPostTags = async (blogPostId: string): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_post_tags')
      .select(`
        tags (
          id,
          name,
          slug,
          description,
          color,
          created_at,
          updated_at
        )
      `)
      .eq('blog_post_id', blogPostId);

    if (error) {
      console.error('Error getting blog post tags:', error);
      return [];
    }

    if (!data) return [];

    return data.map((item: any) => item.tags).filter(Boolean);
  } catch (error) {
    console.error('Error in getBlogPostTags:', error);
    return [];
  }
};

// Get tags for project from junction table
export const getProjectTags = async (projectId: string): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('project_tags')
      .select(`
        tags (
          id,
          name,
          slug,
          description,
          color,
          created_at,
          updated_at
        )
      `)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error getting project tags:', error);
      return [];
    }

    if (!data) return [];

    return data.map((item: any) => item.tags).filter(Boolean);
  } catch (error) {
    console.error('Error in getProjectTags:', error);
    return [];
  }
};

// Get all tags from tags table
export const getAllTags = async (): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error getting all tags:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllTags:', error);
    return [];
  }
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error getting all categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return [];
  }
};

// Get blog posts by tag
export const getBlogPostsByTag = async (tagSlug: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_post_tags')
      .select(`
        blog_posts (
          id,
          title,
          slug,
          excerpt,
          image_url,
          created_at,
          published,
          reading_time,
          views,
          likes
        )
      `)
      .eq('tags.slug', tagSlug);

    if (error) {
      console.error('Error getting blog posts by tag:', error);
      return [];
    }

    return data?.map((item: any) => item.blog_posts).filter(Boolean) || [];
  } catch (error) {
    console.error('Error in getBlogPostsByTag:', error);
    return [];
  }
};

// Get projects by tag
export const getProjectsByTag = async (tagSlug: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('project_tags')
      .select(`
        projects (
          id,
          title,
          description,
          image_url,
          demo_url,
          github_url,
          created_at,
          featured,
          views,
          likes
        )
      `)
      .eq('tags.slug', tagSlug);

    if (error) {
      console.error('Error getting projects by tag:', error);
      return [];
    }

    return data?.map((item: any) => item.projects).filter(Boolean) || [];
  } catch (error) {
    console.error('Error in getProjectsByTag:', error);
    return [];
  }
};

// Get tag by slug
export const getTagBySlug = async (slug: string): Promise<Tag | null> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error getting tag by slug:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getTagBySlug:', error);
    return null;
  }
};