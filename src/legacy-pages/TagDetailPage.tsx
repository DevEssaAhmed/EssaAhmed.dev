"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams, useNavigate } from '@/lib/router-compat';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Heart, Calendar, Clock, ArrowLeft, Tag, Search, BookOpen, Hash } from "lucide-react";
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
// Define the type for the data returned by your RPC function
interface RelatedTag {
  name: string;
  count: number;
}
// Define the type for the parameters passed to your RPC function
interface GetRelatedTagsParams {
  p_tag_name: string;
}


const tagToHref = (tag: string) => `/articles/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}`;

interface TagDetailPageProps {
  initialTagName?: string;
  initialBlogPosts?: BlogPost[];
  initialRelatedTags?: Tag[];
}

const TagDetailPage: React.FC<TagDetailPageProps> = ({
  initialTagName,
  initialBlogPosts,
  initialRelatedTags
}) => {
  const { tagSlug } = useParams<{ tagSlug: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts || []);
  const [loading, setLoading] = useState(!initialTagName);
  const [tagName, setTagName] = useState(initialTagName || '');
  const [relatedTags, setRelatedTags] = useState<Tag[]>(initialRelatedTags || []);


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
        setLoading(false);
        return;
      }

      const tagId = tagData.id;

      // Fetch blog posts using the join table
      const { data: blogPostTagData } = await supabase
        .from('blog_post_tags')
        .select('blog_posts(*)') // Select all columns from the linked blog_posts table
        .eq('tag_id', tagId);

      // Extracted blog posts
      const blogPostsWithTags = blogPostTagData?.map(item => item.blog_posts).filter(Boolean) || [];
      setBlogPosts(blogPostsWithTags.flat());

      await fetchRelatedTags(decodedTag);

    } catch (error) {
      console.error('Error fetching tag content:', error);
      toast.error('Failed to load content for this tag.');
    } finally {
      setLoading(false);
    }
  }, [tagSlug, setBlogPosts, setLoading, setTagName, fetchRelatedTags]);

  const filteredBlogPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (tagSlug && !initialTagName) {
      fetchTagContent();
    }
  }, [fetchTagContent, tagSlug, initialTagName]);
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
        description={`Explore ${blogPosts.length} articles tagged with "${tagName}"`}
        url={`/tags/${tagSlug}`}
      />
      <Navigation />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <Button asChild variant="ghost" className="mb-6 hover:shadow-soft transition-all duration-300">
              <Link href="/articles/tags">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Tags
              </Link>
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
                    {blogPosts.length} {blogPosts.length === 1 ? 'item' : 'items'} tagged
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
                      <Link key={tag.name} href={tagToHref(tag.name)}>
                        <Badge
                          variant="secondary"
                          className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                        >
                          #{tag.name} ({tag.count})
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="mt-8">
            {filteredBlogPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBlogPosts.map((post) => (
                  <Link key={post.id} href={`/articles/${post.slug}`} className="block">
                    <Card className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer flex flex-col h-full border-border/50">
                      {post.image_url && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <OptimizedImage
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags?.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant={tag.toLowerCase() === tagName.toLowerCase() ? "default" : "secondary"} className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
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
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="w-full relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 p-12 text-center shadow-sm mt-8">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
                    {searchTerm ? <Search className="w-10 h-10 text-primary" /> : <Tag className="w-10 h-10 text-primary" />}
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-3">No Articles Found</h3>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
                    {searchTerm
                      ? 'Try adjusting your search terms or filters.'
                      : <>There are currently no articles published with the <span className="text-foreground font-medium">#{tagName}</span> tag.</>}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button asChild className="bg-gradient-primary hover:shadow-glow transition-all duration-300 rounded-xl px-8 h-12">
                      <Link href="/articles">Read Latest Articles</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl px-8 h-12 hover:bg-muted transition-all duration-300">
                      <Link href="/articles/tags">Browse All Tags</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Tags */}
          {relatedTags.length > 0 && (
            <Card className="mt-12 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Related Tags</CardTitle>
                <CardDescription>Other tags commonly used with &quot;{tagName}&quot;</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {relatedTags.map((tag) => (
                    <Link key={tag.name} href={tagToHref(tag.name)}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag.name} ({tag.count})
                      </Badge>
                    </Link>
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


