import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Eye, Heart, BookOpen, CheckCircle, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/OptimizedImage";

const SeriesDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeriesAndArticles = useCallback(async () => {
    if (!slug) return;

    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .select("*")
        .eq("slug", slug)
        .single();

      if (seriesError) throw seriesError;
      setSeries(seriesData);

      const { data: articlesData, error: articlesError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("series_id", seriesData.id)
        .eq("published", true)
        .order("series_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("Series not found");
      navigate("/series");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    fetchSeriesAndArticles();
  }, [fetchSeriesAndArticles]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "on-hold":
        return <Pause className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed Series";
      case "on-hold":
        return "Series On Hold";
      default:
        return "Active Series";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <Skeleton className="h-64 w-full rounded-2xl mb-6" />
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
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

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-6 py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Series Not Found</h1>
            <p className="text-muted-foreground mb-6">This series does not exist.</p>
            <Button onClick={() => navigate("/series")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Series
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
          <Button variant="ghost" onClick={() => navigate("/series")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Series
          </Button>

          <Card className="mb-10 overflow-hidden">
            {series.cover_image && (
              <div className="h-64 w-full">
                <OptimizedImage src={series.cover_image} alt={series.title} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(series.status || "active")}
                <Badge variant="outline">{getStatusText(series.status || "active")}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-3">{series.title}</h1>
              {series.description && <p className="text-muted-foreground text-lg">{series.description}</p>}
            </CardContent>
          </Card>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Articles Yet</h3>
              <p className="text-muted-foreground">
                Articles in the {series.title} series will appear here once they&apos;re published.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/articles/${article.slug}`)}>
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="mb-2 line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="mb-3 line-clamp-2">{article.excerpt || "No excerpt available."}</CardDescription>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.read_time || 5} min</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views || 0}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {article.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SeriesDetailPage;

