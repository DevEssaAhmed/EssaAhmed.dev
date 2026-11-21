"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, CheckCircle, Pause } from "lucide-react";
import OptimizedFooter from "@/components/OptimizedFooter";
import ArticlesSubNav from "@/components/ArticlesSubNav";
import { formatDateUTC } from "@/lib/date";

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
  const featuredSeries = series.filter((s) => s.featured);
  const hasFeatured = featuredSeries.length > 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      case "on-hold":
        return <Pause className="w-4 h-4 text-tertiary" />;
      default:
        return <Clock className="w-4 h-4 text-primary" />;
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
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between transition-colors duration-200">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-6 py-12 md:py-16 flex-1">
        <div className="pb-8 border-b border-outline-variant/30 mb-10">
          <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-2">
            01 / SERIES
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            Article Series
          </h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl leading-relaxed">
            Dive deep into comprehensive article series. Follow structured learning paths and master complex topics step by step.
          </p>
          <ArticlesSubNav className="mt-8 mb-0 justify-start" />
        </div>

        {hasFeatured && (
          <section className="mb-14">
            <div className="pb-4 border-b border-outline-variant/25 mb-6">
              <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-1.5">
                02 / FEATURED SERIES
              </span>
              <h2 className="font-display text-2xl font-bold text-on-surface tracking-tight">
                Featured Series
              </h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-7">
              {featuredSeries.map((seriesItem) => (
                <Link key={seriesItem.id} href={`/articles/series/${seriesItem.slug}`} className="block group">
                  <Card className="rounded-2xl card-elevated card-interactive border cursor-pointer h-full flex flex-col justify-between overflow-hidden">
                    {(seriesItem.featured_image_url || seriesItem.image_url) && (
                      <div className="relative overflow-hidden">
                        <OptimizedImage
                          src={seriesItem.featured_image_url || seriesItem.image_url || "/placeholder.svg"}
                          alt={seriesItem.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2 text-xs font-code text-on-surface-variant">
                        <div>
                          {formatDateUTC(seriesItem.created_at, { year: "numeric", month: "long" })}
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/30 bg-surface-container px-2.5 py-1 text-xs font-code text-on-surface-variant">
                          {getStatusIcon(seriesItem.status)}
                          <span>{getStatusText(seriesItem.status)}</span>
                        </div>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors text-xl font-display font-bold text-on-surface">
                        {seriesItem.title}
                      </CardTitle>
                      <CardDescription className="text-on-surface-variant">
                        {seriesItem.description || `A comprehensive series about ${seriesItem.title.toLowerCase()}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/25">
                        <div className="text-xs font-code text-on-surface-variant">
                          {seriesItem.article_count} {seriesItem.article_count === 1 ? "article" : "articles"}
                        </div>
                        <Button size="sm" variant="ghost" className="group-hover:text-primary text-on-surface-variant">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="pb-4 border-b border-outline-variant/25 mb-6">
            <span className="font-code text-xs uppercase tracking-[0.14em] text-outline block mb-1.5">
              {hasFeatured ? "03 / ALL SERIES" : "02 / ALL SERIES"}
            </span>
            <h2 className="font-display text-2xl font-bold text-on-surface tracking-tight">
              All Series
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.filter((s) => !s.featured).map((seriesItem) => (
              <Link key={seriesItem.id} href={`/articles/series/${seriesItem.slug}`} className="block group">
                <Card className="rounded-2xl card-elevated card-interactive border cursor-pointer h-full flex flex-col justify-between overflow-hidden">
                  {(seriesItem.featured_image_url || seriesItem.image_url) && (
                    <div className="relative overflow-hidden">
                      <OptimizedImage
                        src={seriesItem.featured_image_url || seriesItem.image_url || "/placeholder.svg"}
                        alt={seriesItem.title}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-3 text-xs font-code text-on-surface-variant mb-2">
                      <span>{formatDateUTC(seriesItem.created_at, { year: "numeric", month: "long" })}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-code">
                        {getStatusIcon(seriesItem.status)} {getStatusText(seriesItem.status)}
                      </span>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors font-display text-lg font-bold text-on-surface line-clamp-1">
                      {seriesItem.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-on-surface-variant">
                      {seriesItem.description?.slice(0, 100)}
                      {seriesItem.description && seriesItem.description.length > 100 && "..."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/25">
                      <div className="text-xs font-code text-on-surface-variant">
                        {seriesItem.article_count} {seriesItem.article_count === 1 ? "article" : "articles"}
                      </div>
                      <Button size="sm" variant="ghost" className="group-hover:text-primary text-on-surface-variant">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <OptimizedFooter />
    </div>
  );
};

export default SeriesPage;
