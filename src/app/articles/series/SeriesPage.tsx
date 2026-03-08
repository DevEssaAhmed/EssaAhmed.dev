"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Sparkles, Clock, CheckCircle, Pause } from "lucide-react";
import Footer from "@/components/Footer";
import ArticlesSubNav from "@/components/ArticlesSubNav";

interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  featured_image_url: string | null;
  article_count: number;
  featured: boolean;
  status: string;
  created_at: string;
}

type SeriesPageProps = {
  initialSeries?: Series[];
};

const SeriesPage = ({ initialSeries = [] }: SeriesPageProps) => {
  const series = initialSeries;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "on-hold":
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "on-hold":
        return "On Hold";
      default:
        return "Active";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Article Series
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Dive deep into comprehensive article series. Follow structured learning paths and master complex topics step by step.
            </p>
            <ArticlesSubNav />
          </div>

          {series.some((s) => s.featured) && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Featured Series</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {series.filter((s) => s.featured).map((seriesItem) => (
                  <Link key={seriesItem.id} href={`/articles/series/${seriesItem.slug}`} className="block">
                    <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 overflow-hidden">
                      {(seriesItem.featured_image_url || seriesItem.image_url) && (
                        <div className="relative overflow-hidden rounded-t-lg">
                          <OptimizedImage
                            src={seriesItem.featured_image_url || seriesItem.image_url || "/placeholder.svg"}
                            alt={seriesItem.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                          <div>
                            {new Date(seriesItem.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1">
                            {getStatusIcon(seriesItem.status)}
                            <span>{getStatusText(seriesItem.status)}</span>
                          </div>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors text-xl">
                          {seriesItem.title}
                        </CardTitle>
                        <CardDescription>
                          {seriesItem.description || `A comprehensive series about ${seriesItem.title.toLowerCase()}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {seriesItem.article_count} {seriesItem.article_count === 1 ? "article" : "articles"}
                          </div>
                          <Button size="sm" variant="ghost" className="group-hover:text-primary">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-6">All Series</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {series.filter((s) => !s.featured).map((seriesItem) => (
                <Link key={seriesItem.id} href={`/articles/series/${seriesItem.slug}`} className="block">
                  <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer h-full border hover:border-primary/30 overflow-hidden">
                    {(seriesItem.featured_image_url || seriesItem.image_url) && (
                      <div className="relative overflow-hidden rounded-t-lg">
                        <OptimizedImage
                          src={seriesItem.featured_image_url || seriesItem.image_url || "/placeholder.svg"}
                          alt={seriesItem.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground mb-2">
                        <span>{new Date(seriesItem.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
                        <span className="inline-flex items-center gap-1">{getStatusIcon(seriesItem.status)} {getStatusText(seriesItem.status)}</span>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {seriesItem.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {seriesItem.description?.slice(0, 100)}
                        {seriesItem.description && seriesItem.description.length > 100 && "..."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {seriesItem.article_count} {seriesItem.article_count === 1 ? "article" : "articles"}
                        </div>
                        <Button size="sm" variant="ghost" className="group-hover:text-primary">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SeriesPage;

