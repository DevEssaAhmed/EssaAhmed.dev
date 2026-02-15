"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, Heart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/OptimizedImage";

type ArticlesPageProps = {
  initialArticles?: any[];
};

const ArticlesPage = ({ initialArticles }: ArticlesPageProps) => {
  const [articles, setArticles] = useState<any[]>(initialArticles ?? []);
  const [selectedTag, setSelectedTag] = useState("All");
  const [loading, setLoading] = useState(initialArticles === undefined);

  useEffect(() => {
    if (initialArticles === undefined) fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const allTags = ["All", ...new Set(articles.flatMap((article: any) => article.tags || []))];
  const filteredArticles = selectedTag === "All" ? articles : articles.filter((article: any) => article.tags?.includes(selectedTag));

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Articles" description="Thoughts, tutorials, and insights about data science, analytics, and technology" url="/articles" />
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">Articles & Insights</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Thoughts, tutorials, and insights about data science, analytics, and technology</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(tag)}
                className={`transition-all duration-300 ${selectedTag === tag ? "bg-gradient-primary shadow-soft scale-105" : "hover:bg-primary/5 hover:border-primary/30"}`}
              >
                {tag}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="h-48 w-full bg-muted rounded-t-lg" />
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="block">
                <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <OptimizedImage src={article.image_url || "/placeholder.svg"} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.created_at).toLocaleDateString()}
                      <Clock className="w-4 h-4 ml-2" />
                      {article.reading_time || 5} min read
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.views || 0}</div>
                      <div className="flex items-center gap-1"><Heart className="w-4 h-4" />{article.likes || 0}</div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-300">
              <Link href="/articles">
                View All Articles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArticlesPage;
