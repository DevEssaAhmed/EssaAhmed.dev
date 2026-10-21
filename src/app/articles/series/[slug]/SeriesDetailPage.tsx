"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, BookOpen, CheckCircle, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/OptimizedImage";

interface SeriesDetailPageProps {
  initialSeries?: any;
  initialArticles?: any[];
}

const SeriesDetailPage = ({ initialSeries, initialArticles }: SeriesDetailPageProps) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState<any>(initialSeries || null);
  const [articles, setArticles] = useState<any[]>(initialArticles || []);
  const [loading, setLoading] = useState(!initialSeries);

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
        .eq("unlisted", false)
        .order("series_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("Series not found");
      navigate("/articles/series");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (!initialSeries) {
      fetchSeriesAndArticles();
    }
  }, [fetchSeriesAndArticles, initialSeries]);

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
                <Card key={i} className="bg-surface-low border border-border">
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
            <Button asChild className="bg-champagne text-[#090c13] hover:bg-champagne/90 font-medium rounded-xl">
              <Link href="/articles/series">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Series
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
          <Button asChild variant="ghost" className="mb-8 text-muted-foreground hover:text-champagne transition-colors">
            <Link href="/articles/series">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Series
            </Link>
          </Button>

          <Card className="mb-10 overflow-hidden bg-surface-low border border-border">
            {series.cover_image && (
              <div className="h-64 w-full">
                <OptimizedImage src={series.cover_image} alt={series.title} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(series.status || "active")}
                <Badge variant="outline" className="border-border bg-surface-high text-xs font-mono text-muted-foreground">{getStatusText(series.status || "active")}</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-3">{series.title}</h1>
              {series.description && <p className="text-muted-foreground text-lg">{series.description}</p>}
            </CardContent>
          </Card>

          {articles.length === 0 ? (
            <div className="w-full relative overflow-hidden rounded-3xl border border-border bg-surface-low p-12 text-center shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-surface-high border border-border flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-champagne" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-3">Series Coming Soon</h3>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
                  I&apos;m currently outlining and writing articles for the <span className="text-foreground font-medium">{series.title}</span> series. Stay tuned for updates!
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button asChild className="bg-champagne text-[#090c13] hover:bg-champagne/90 font-medium transition-all duration-300 rounded-xl px-8 h-12">
                    <Link href="/articles">Read Latest Articles</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl px-8 h-12 border-border hover:border-champagne/40 hover:bg-surface-high text-foreground transition-all duration-300">
                    <Link href="/articles/series">View All Series</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="block">
                  <Card className="group cursor-pointer bg-surface-low border border-border hover:border-champagne/40 transition-all duration-300 hover:-translate-y-0.5">
                    <CardContent className="p-6">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-surface-high border border-border text-champagne flex items-center justify-center font-mono font-semibold shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="mb-2 line-clamp-2 font-display text-lg text-white group-hover:text-champagne transition-colors">{article.title}</CardTitle>
                          <CardDescription className="mb-3 line-clamp-2">{article.excerpt || "No excerpt available."}</CardDescription>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.read_time || 5} min</span>
                          </div>
                        </div>
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

export default SeriesDetailPage;

