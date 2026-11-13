"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useParams, useNavigate } from '@/lib/router-compat';
import Navigation from '@/components/Navigation';
import OptimizedFooter from "@/components/OptimizedFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Calendar, ArrowLeft, Tag, Search, Hash } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDateUTC } from '@/lib/date';
import { getTagHref, resolveTagByParam } from '@/lib/tag-slug';

interface Tag {
  name: string;
  slug?: string | null;
  count: number;
}

import type { Json } from '@/integrations/supabase/types';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published: boolean;
  unlisted: boolean;
  created_at: string;
  tags: string[];
  views?: number;
  likes?: number;
  image_url?: string;
  content?: string;
  content_jsonb?: Json;
}

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

  const fetchTagContent = React.useCallback(async () => {
    if (!tagSlug) return;

    setLoading(true);
    try {
      const { data: tagData, error: tagError } = await resolveTagByParam(supabase, tagSlug);

      if (tagError || !tagData) {
        console.error('Tag not found:', tagError?.message);
        setBlogPosts([]);
        setLoading(false);
        return;
      }

      setTagName(tagData.name);
      const tagId = tagData.id;

      // Fetch blog posts using the join table
      const { data: blogPostTagData } = await supabase
        .from('blog_post_tags')
        .select('blog_post_id, blog_posts!inner(id,title,slug,excerpt,image_url,tags,created_at,published,unlisted)')
        .eq('tag_id', tagId)
        .eq('blog_posts.published', true)
        .eq('blog_posts.unlisted', false);

      // Extracted blog posts
      const blogPostsWithTags = blogPostTagData?.map(item => item.blog_posts).filter(Boolean) || [];
      setBlogPosts(blogPostsWithTags.flat() as unknown as BlogPost[]);

      const publicPostIds = (blogPostTagData || []).map((item) => item.blog_post_id);
      if (publicPostIds.length > 0) {
        const { data: relatedTagLinks, error: relatedTagError } = await supabase
          .from('blog_post_tags')
          .select('tags(name, slug)')
          .in('blog_post_id', publicPostIds)
          .neq('tag_id', tagId);

        if (relatedTagError) throw relatedTagError;
        const map = (relatedTagLinks || []).reduce(
          (result: Map<string, Tag>, link: any) => {
            const relatedTag = Array.isArray(link.tags) ? link.tags[0] : link.tags;
            if (relatedTag?.name) {
              const existing = result.get(relatedTag.name);
              if (existing) existing.count += 1;
              else result.set(relatedTag.name, { name: relatedTag.name, slug: relatedTag.slug ?? null, count: 1 });
            }
            return result;
          },
          new Map<string, Tag>()
        );
        setRelatedTags(Array.from(map.values()).sort((a, b) => b.count - a.count));
      } else {
        setRelatedTags([]);
      }

    } catch (error) {
      console.error('Error fetching tag content:', error);
      toast.error('Failed to load content for this tag.');
    } finally {
      setLoading(false);
    }
  }, [tagSlug]);

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
      <div className="min-h-screen bg-surface text-on-surface">
        <Navigation />
        <main id="main-content" tabIndex={-1} className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant font-mono text-sm">Loading tag content...</p>
          </div>
        </main>
        <OptimizedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <Button asChild variant="ghost" className="mb-6 rounded-full border border-outline-variant/30 bg-surface-container text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-all duration-200 font-mono text-xs">
              <Link href="/articles/tags">
                <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
                Back to All Tags
              </Link>
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-surface-container border border-primary/30 flex items-center justify-center text-primary font-bold text-2xl shadow-sm">
                  <Hash className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl lg:text-5xl font-display font-bold text-on-surface">
                    #{tagName}
                  </h1>
                  <p className="text-sm font-mono text-on-surface-variant mt-1">
                    {blogPosts.length} {blogPosts.length === 1 ? 'item' : 'items'} tagged
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-outline w-4 h-4" />
                <Input
                  placeholder="Search within tagged content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-lg bg-surface-container border-outline-variant/30 text-on-surface placeholder:text-outline focus-visible:outline-none focus-visible:border-primary/60 font-mono text-sm"
                />
              </div>

              {/* Related Tags */}
              {relatedTags.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-outline mb-3">Related Tags</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {relatedTags.slice(0, 10).map((tag) => (
                      <Link key={tag.name} href={getTagHref(tag)}>
                        <Badge
                          variant="outline"
                          className="border border-outline-variant/30 bg-surface-container text-on-surface hover:border-primary/40 hover:text-primary cursor-pointer transition-colors font-mono text-xs"
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
                    <Card className="bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container/60 transition-all duration-300 cursor-pointer flex flex-col h-full rounded-2xl overflow-hidden group">
                      {post.image_url && (
                        <div className="aspect-video overflow-hidden">
                          <OptimizedImage
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags?.slice(0, 3).map((tag, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={`text-xs font-mono border ${
                                tag.toLowerCase() === tagName.toLowerCase()
                                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                                  : "bg-surface-container border-outline-variant/30 text-on-surface-variant"
                              }`}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2 text-on-surface group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-on-surface-variant text-sm mb-4 line-clamp-3 flex-grow font-sans">{post.excerpt}</p>

                        <div className="flex items-center gap-4 text-xs font-mono text-outline pt-4 border-t border-outline-variant/30">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary/70" />
                            {formatDateUTC(post.created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="w-full relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low p-12 text-center shadow-sm mt-8">
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 mb-6 rounded-2xl bg-surface-container border border-primary/30 flex items-center justify-center mx-auto">
                    {searchTerm ? <Search className="w-10 h-10 text-primary" /> : <Tag className="w-10 h-10 text-primary" />}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-on-surface mb-3">No Articles Found</h3>
                  <p className="text-base text-on-surface-variant max-w-lg mx-auto mb-8 font-sans">
                    {searchTerm
                      ? 'Try adjusting your search terms or filters.'
                      : <>There are currently no articles published with the <span className="text-on-surface font-medium">#{tagName}</span> tag.</>}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button asChild className="bg-on-surface text-surface hover:opacity-90 font-medium rounded-full px-8 h-12 transition-all duration-200">
                      <Link href="/articles">Read Latest Articles</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full px-8 h-12 border border-outline-variant/30 bg-surface-container text-on-surface hover:bg-surface-container-high transition-all duration-200">
                      <Link href="/articles/tags">Browse All Tags</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Tags */}
          {relatedTags.length > 0 && (
            <Card className="mt-12 bg-surface-container-low border border-outline-variant/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="font-display font-bold text-on-surface">Related Tags</CardTitle>
                <CardDescription className="text-on-surface-variant font-sans">Other tags commonly used with &quot;{tagName}&quot;</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {relatedTags.map((tag) => (
                    <Link key={tag.name} href={getTagHref(tag)}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer border border-outline-variant/30 bg-surface-container text-on-surface hover:border-primary/40 hover:text-primary transition-colors font-mono text-xs"
                      >
                        #{tag.name} ({tag.count})
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <OptimizedFooter />
    </div>
  );
};

export default TagDetailPage;
