import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Eye, Heart, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/OptimizedImage";

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order("created_at", { ascending: false });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Category not found");
      navigate("/categories");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    fetchCategoryAndArticles();
  }, [fetchCategoryAndArticles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-10">
              <Skeleton className="h-16 w-16 rounded-2xl mb-4" />
              <Skeleton className="h-10 w-72 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-6 py-12 text-center">
            <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">This category does not exist.</p>
            <Button asChild>
              <Link href="/categories">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/categories">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
            </Link>
          </Button>

          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
            {category.description && <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Articles Yet</h3>
              <p className="text-muted-foreground">
                Articles in the {category.name} category will appear here once they&apos;re published.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="block">
                <Card className="group cursor-pointer hover:shadow-glow transition-all duration-300">
                  {article.image_url && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <OptimizedImage
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{article.excerpt || "No excerpt available."}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.read_time || 5} min
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views || 0}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {article.likes || 0}</span>
                      </div>
                      <Badge variant={article.published ? "default" : "secondary"}>
                        {article.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryDetailPage;

