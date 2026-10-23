"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/OptimizedImage";

interface CategoryDetailPageProps {
  initialCategory?: any;
  initialArticles?: any[];
}

const CategoryDetailPage = ({ initialCategory, initialArticles }: CategoryDetailPageProps) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<any>(initialCategory || null);
  const [articles, setArticles] = useState<any[]>(initialArticles || []);
  const [loading, setLoading] = useState(!initialCategory);

  const fetchCategoryAndArticles = useCallback(async () => {
    if (!slug) return;

    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      const { data: articlesData, error: articlesError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("category_id", categoryData.id)
        .eq("published", true)
        .eq("unlisted", false)
        .order("created_at", { ascending: false });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Category not found");
      navigate("/articles/categories");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (!initialCategory) {
      fetchCategoryAndArticles();
    }
  }, [initialCategory, fetchCategoryAndArticles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-10">
              <Skeleton className="h-16 w-16 rounded-2xl mb-4 bg-surface-container" />
              <Skeleton className="h-10 w-72 mb-2 bg-surface-container" />
              <Skeleton className="h-5 w-40 bg-surface-container" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-surface-low border border-border rounded-2xl overflow-hidden">
                  <Skeleton className="h-48 w-full bg-surface-container" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2 bg-surface-container" />
                    <Skeleton className="h-4 w-full bg-surface-container" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-12 bg-surface-container" />
                      <Skeleton className="h-4 w-12 bg-surface-container" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <OptimizedFooter />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-surface">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container border border-champagne/30 flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-champagne" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-2">Category Not Found</h1>
            <p className="text-ink-soft mb-6 font-sans">This category does not exist.</p>
            <Button asChild variant="outline" className="rounded-xl px-6 h-11 border border-border bg-surface-container text-platinum hover:bg-surface-high font-mono text-xs">
              <Link href="/articles/categories">
                <ArrowLeft className="w-4 h-4 mr-2 text-champagne" /> Back to Categories
              </Link>
            </Button>
          </div>
        </div>
        <OptimizedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Button asChild variant="ghost" className="mb-8 rounded-xl border border-border bg-surface-container text-ink-soft hover:text-white hover:border-champagne/40 transition-all duration-200 font-mono text-xs">
            <Link href="/articles/categories">
              <ArrowLeft className="w-4 h-4 mr-2 text-champagne" /> Back to Categories
            </Link>
          </Button>

          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container border border-champagne/30 flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-champagne" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">{category.name}</h1>
            {category.description && <p className="text-ink-soft max-w-2xl mx-auto font-sans">{category.description}</p>}
          </div>

          {articles.length === 0 ? (
            <div className="w-full relative overflow-hidden rounded-2xl border border-border bg-surface-low p-12 text-center shadow-sm">
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-20 h-20 mb-6 rounded-2xl bg-surface-container border border-champagne/30 flex items-center justify-center mx-auto">
                  <Folder className="w-10 h-10 text-champagne" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">Coming Soon</h3>
                <p className="text-base text-ink-soft max-w-lg mx-auto mb-8 font-sans">
                  I&apos;m currently crafting new articles for <span className="text-white font-medium">{category.name}</span>. They&apos;ll appear here once they&apos;re full-polished and published.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button asChild className="bg-champagne text-surface-lowest hover:bg-champagne/90 font-medium rounded-xl px-8 h-12 transition-all duration-200">
                    <Link href="/articles">Read Latest Articles</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl px-8 h-12 border border-border bg-surface-container text-platinum hover:bg-surface-high transition-all duration-200">
                    <Link href="/articles/categories">View All Categories</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="block">
                  <Card className="group cursor-pointer hover:border-champagne/40 hover:bg-surface-container/60 transition-all duration-300 bg-surface-low border border-border rounded-2xl overflow-hidden flex flex-col h-full">
                    {article.image_url && (
                      <div className="h-48 overflow-hidden">
                        <OptimizedImage
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="font-display font-semibold text-lg text-white group-hover:text-champagne transition-colors line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="text-ink-soft text-sm font-sans line-clamp-3">{article.excerpt || "No excerpt available."}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow justify-end">
                      <div className="flex items-center gap-4 text-xs font-mono text-ink-muted mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-champagne/70" />
                          {new Date(article.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-champagne/70" />
                          {article.read_time || 5} min
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs font-mono text-champagne/80">Article</span>
                        <span className="text-xs font-medium text-champagne group-hover:translate-x-0.5 transition-transform">Read Article →</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <OptimizedFooter />
    </div>
  );
};

export default CategoryDetailPage;

