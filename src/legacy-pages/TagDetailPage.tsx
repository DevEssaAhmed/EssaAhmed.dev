import { OptimizedImage } from "@/components/OptimizedImage";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from '@/lib/router-compat';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, Filter, Calendar, Eye, Heart, Hash, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Tag {
  name: string;
  count: number;
}

import type { Json } from '@/integrations/supabase/types';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published: boolean;
  created_at: string;
  tags: string[];
  views?: number;
  likes?: number;
  image_url?: string;
  content: string;
  content_jsonb?: Json;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category_id?: string;
  tags: string[];
  created_at: string;
  views?: number;
  likes?: number;
  image_url?: string;
  demo_url?: string;
  github_url?: string;
}
// Define the type for the data returned by your RPC function
interface RelatedTag {
  name: string;
  count: number;
}
// Define the type for the parameters passed to your RPC function
interface GetRelatedTagsParams {
  p_tag_name: string;
}


const TagDetailPage: React.FC = () => {
  const { tagSlug } = useParams<{ tagSlug: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagName, setTagName] = useState('');
  const [relatedTags, setRelatedTags] = useState<Tag[]>([]);


  // const fetchTagContent = async () => {
  //   if (!tagSlug) return;
    
  //   setLoading(true);
  //   try {
  //     // Decode the tag name from slug
  //     const decodedTag = decodeURIComponent(tagSlug.replace(/-/g, ' '));
  //     setTagName(decodedTag);

  //     // Fetch blog posts with this tag
  //     const { data: blogData } = await supabase
  //       .from('blog_posts')
  //       .select('*')
  //       .contains('tags', [decodedTag])
  //       .eq('published', true)
  //       .order('created_at', { ascending: false });

  //     // Fetch projects with this tag
  //     const { data: projectData } = await supabase
  //       .from('projects')
  //       .select('*')
  //       .contains('tags', [decodedTag])
  //       .order('created_at', { ascending: false });

  //     setBlogPosts(blogData || []);
  //     setProjects(projectData || []);

  //     // Generate related tags based on content with the same tag
  //     await fetchRelatedTags(decodedTag);
      
  //   } catch (error) {
  //     console.error('Error fetching tag content:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const fetchRelatedTags = React.useCallback(async (currentTag: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_related_tags', { p_tag_name: currentTag });

    if (error) throw error;
    
    setRelatedTags(data || []);

  } catch (error) {
    console.error('Error fetching related tags:', error);
    toast.error('Failed to load related tags.');
  }
}, [setRelatedTags]);
const fetchTagContent = React.useCallback(async () => {
  if (!tagSlug) return;
  
  setLoading(true);
  try {
    const decodedTag = decodeURIComponent(tagSlug.replace(/-/g, ' '));
    setTagName(decodedTag);

    // First, get the ID of the current tag
    const { data: tagData, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', decodedTag)
      .single();

    if (tagError || !tagData) {
      console.error('Tag not found:', tagError?.message);
      setBlogPosts([]);
      setProjects([]);
      setLoading(false);
      return;
    }

    const tagId = tagData.id;

    // Fetch blog posts using the join table
    const { data: blogPostTagData } = await supabase
      .from('blog_post_tags')
      .select('blog_posts(*)') // Select all columns from the linked blog_posts table
      .eq('tag_id', tagId);
    
    // Extract the blog posts from the nested response
    const blogPostsWithTags = blogPostTagData?.map(item => item.blog_posts).filter(Boolean) || [];
    setBlogPosts(blogPostsWithTags.flat());

    // Fetch projects using the join table
    const { data: projectTagData } = await supabase
      .from('project_tags')
      .select('projects(*)') // Select all columns from the linked projects table
      .eq('tag_id', tagId);
      
    // Extract the projects from the nested response
    const projectsWithTags = projectTagData?.map(item => item.projects).filter(Boolean) || [];
    setProjects(projectsWithTags.flat());

    await fetchRelatedTags(decodedTag);
    
  } catch (error) {
    console.error('Error fetching tag content:', error);
    toast.error('Failed to load content for this tag.');
  } finally {
    setLoading(false);
  }
}, [tagSlug, setBlogPosts, setProjects, setLoading, setTagName, fetchRelatedTags]);
  const handleTagClick = (tag: string) => {
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    navigate(`/tags/${encodeURIComponent(tagSlug)}`);
  };

  const filteredBlogPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (tagSlug) {
      fetchTagContent();
    }
  }, [fetchTagContent, tagSlug]);
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tag content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`#${tagName} - Tag`}
        description={`Explore ${blogPosts.length + projects.length} articles and projects tagged with "${tagName}"`}
        url={`/tags/${tagSlug}`}
      />
      <Navigation />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/tags")}
              className="mb-6 hover:shadow-soft transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Tags
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-soft">
                  <Hash className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    #{tagName}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    {blogPosts.length + projects.length} {blogPosts.length + projects.length === 1 ? 'item' : 'items'} tagged
                  </p>
                </div>
              </div>
              
              {/* Search */}
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search within tagged content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Related Tags */}
              {relatedTags.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Tags</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {relatedTags.slice(0, 10).map((tag) => (
                      <Badge
                        key={tag.name}
                        variant="secondary"
                        className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                        onClick={() => handleTagClick(tag.name)}
                      >
                        #{tag.name} ({tag.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="all">All ({blogPosts.length + projects.length})</TabsTrigger>
            <TabsTrigger value="articles">Articles ({blogPosts.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* All Content */}
            <div className="grid gap-6">
              {/* Blog Posts */}
              {filteredBlogPosts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Articles</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBlogPosts.map((post) => (
                      <Card key={post.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={() => navigate(`/articles/${post.slug}`)}>
                        {post.image_url && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <OptimizedImage
                              src={post.image_url}
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                            {post.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.views}
                              </div>
                            )}
                            {post.likes && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likes}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {post.tags?.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags && post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Projects</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                        {project.image_url && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <OptimizedImage
                              src={project.image_url}
                              alt={project.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{project.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </div>
                            {project.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {project.views}
                              </div>
                            )}
                            {project.likes && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {project.likes}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {project.tags?.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags && project.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredBlogPosts.length === 0 && filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Content Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : `No content tagged with "${tagName}"`}
                  </p>
                  <Button 
                    onClick={() => navigate("/tags")}
                    variant="outline"
                    className="mt-4"
                  >
                    Browse All Tags
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="articles">
            {filteredBlogPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBlogPosts.map((post) => (
                  <Card key={post.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={() => navigate(`/articles/${post.slug}`)}>
                    {post.image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <OptimizedImage
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        {post.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views}
                          </div>
                        )}
                        {post.likes && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags && post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Articles Found</h3>
                <p className="text-muted-foreground">No articles are tagged with &quot;{tagName}&quot;</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects">
            {filteredProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                    {project.image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <OptimizedImage
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{project.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                        {project.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {project.views}
                          </div>
                        )}
                        {project.likes && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {project.likes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {project.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags && project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Projects Found</h3>
                <p className="text-muted-foreground">No projects are tagged with &quot;{tagName}&quot;</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Related Tags */}
        {relatedTags.length > 0 && (
          <Card className="mt-12 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Related Tags</CardTitle>
              <CardDescription>Other tags commonly used with &quot;{tagName}&quot;</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {relatedTags.map((tag) => (
                  <Badge
                    key={tag.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleTagClick(tag.name)}
                  >
                    {tag.name} ({tag.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TagDetailPage;


