import { OptimizedImage } from "@/components/OptimizedImage";
import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Heart, Clock, Calendar, FileQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentArticlesProps {
  showAll?: boolean;
}

const RecentArticles = memo(({ showAll = false }: RecentArticlesProps) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedTag = "All";

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };
  useEffect(() => { fetchArticles(); }, []);

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
  const filteredArticles = selectedTag === "All" 
    ? articles.slice(0, showAll ? articles.length : 4)
    : articles.filter((article: any) => article.tags?.includes(selectedTag)).slice(0, showAll ? articles.length : 4);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="h-8 w-56 bg-muted rounded animate-pulse" />
              <div className="h-4 w-72 bg-muted/70 rounded mt-3 animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card/50 border-primary/10">
                <div className="h-40 w-full bg-muted rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-20" /></div>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 animate-fade-up">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Recent Articles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Insights, tutorials, and thoughts about data science and technology
            </p>
          </div>
          
          {/* DESKTOP BUTTON: Hidden on mobile, flex on md and up */}
          <Button asChild className="hidden md:flex bg-gradient-primary hover:shadow-soft transition-all duration-300">
            <Link href="/articles">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Dynamic Tag Filters */}
        {/* {tags.length > 1 && (
          <div className="flex flex-wrap justify-start md:justify-center gap-3 mb-12 animate-fade-up delay-200">
            {tags.slice(0, 6).map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(tag)}
                className={`transition-all duration-300 ${
                  selectedTag === tag
                    ? "bg-gradient-primary shadow-soft scale-105"
                    : "hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                {tag}
              </Button>
            ))}
          </div>
        )} */}

        {/* Conditional Rendering: Grid vs No Articles Found */}
        {filteredArticles.length > 0 ? (
          <>
            <div className={`grid md:grid-cols-2 ${showAll ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 animate-fade-up delay-300`}>
              {filteredArticles.map((article: any, index: number) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="block"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm border-primary/20">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <OptimizedImage
                      src={article.image_url || "/placeholder.svg"}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.created_at).toLocaleDateString()}
                      <Clock className="w-4 h-4 ml-2" />
                      {article.reading_time || 5} min read
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags?.slice(0, 3).map((tag: string) => {
                        const tagSlug = tag.toLowerCase().replace(/\s+/g, "-");
                        return (
                          <Link
                            key={tag}
                            href={`/tags/${encodeURIComponent(tagSlug)}`}
                            onClick={handleTagClick}
                          >
                            <Badge variant="secondary" className="text-xs cursor-pointer">
                              {tag}
                            </Badge>
                          </Link>
                        );
                      })}
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

            {/* MOBILE BUTTON: Visible only on mobile, placed after the grid */}
            <div className="mt-10 flex justify-center md:hidden">
                <Button asChild className="w-full bg-gradient-primary hover:shadow-soft transition-all duration-300">
                  <Link href="/articles">
                    View All Articles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <FileQuestion className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
        
          </div>
        )}
      </div>
    </section>
  );
});

RecentArticles.displayName = 'RecentArticles';

export default RecentArticles;


