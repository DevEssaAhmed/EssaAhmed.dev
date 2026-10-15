import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Heart, Clock, Calendar, FileText } from "lucide-react";

export interface ArticleItem {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string;
  image_url?: string | null;
  created_at: string;
  reading_time?: number;
  tags?: string[];
  views?: number;
  likes?: number;
}

export interface RecentArticlesProps {
  showAll?: boolean;
  initialArticles?: ArticleItem[];
  className?: string;
}

const formatPublishedDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const RecentArticles = memo(
  ({ showAll = false, initialArticles = [], className = "" }: RecentArticlesProps) => {
    const router = useRouter();
    const articles = initialArticles || [];
    const filteredArticles = articles.slice(0, showAll ? articles.length : 4);

    const handleCardKeyDown = (e: React.KeyboardEvent, href: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(href);
      }
    };

    return (
      <section
        className={`py-16 px-4 sm:px-6 md:px-8 bg-surface-canvas/60 rounded-3xl border border-border/60 ${className}`}
        aria-label="Recent Articles Section"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="mb-6 md:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-border text-champagne font-mono text-xs mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
                EDITORIAL DISPATCHES
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight mb-3">
                Recent Articles
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Insights, architectural patterns, and field notes on high-scale analytics systems.
              </p>
            </div>

            <Button
              asChild
              className="hidden md:inline-flex bg-surface-high hover:bg-champagne hover:text-[#07090e] text-platinum font-medium border border-border hover:border-champagne/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
            >
              <Link href="/articles">
                View All Articles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 ${
                  showAll ? "lg:grid-cols-3" : "lg:grid-cols-2"
                } gap-6 lg:gap-8`}
              >
                {filteredArticles.map((article: ArticleItem, index: number) => {
                  const articleUrl = `/articles/${article.slug}`;

                  return (
                    <article
                      key={article.id}
                      role="link"
                      tabIndex={0}
                      aria-label={`Read article: ${article.title}`}
                      onClick={() => router.push(articleUrl)}
                      onKeyDown={(e) => handleCardKeyDown(e, articleUrl)}
                      className="group relative flex flex-col justify-between bg-surface-low border border-border hover:border-champagne/40 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-lowest border-b border-border/60">
                        <OptimizedImage
                          src={article.image_url || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-low via-transparent to-transparent opacity-60" />
                      </div>

                      {/* Content Container */}
                      <div className="p-6 flex flex-col flex-grow">
                        {/* Meta strip */}
                        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground mb-3">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-champagne/80" />
                            {formatPublishedDate(article.created_at)}
                          </span>
                          <span className="text-border">•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-champagne/80" />
                            {article.reading_time || 5} min read
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-xl font-bold text-foreground group-hover:text-champagne transition-colors duration-200 line-clamp-2 mb-2 leading-snug">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed mb-6">
                            {article.excerpt}
                          </p>
                        )}

                        {/* Bottom Tags & Telemetry */}
                        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-4">
                          <div className="flex flex-wrap gap-1.5">
                            {article.tags?.slice(0, 3).map((tag: string) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-surface-high text-platinum/90 border-border hover:border-champagne/40 transition-colors"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground shrink-0">
                            <span className="inline-flex items-center gap-1" title="Views">
                              <Eye className="w-3.5 h-3.5 text-muted-foreground/80" />
                              {article.views || 0}
                            </span>
                            <span className="inline-flex items-center gap-1" title="Likes">
                              <Heart className="w-3.5 h-3.5 text-muted-foreground/80" />
                              {article.likes || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Mobile View All Button */}
              <div className="mt-10 flex justify-center md:hidden">
                <Button
                  asChild
                  className="w-full bg-surface-high hover:bg-champagne hover:text-[#07090e] text-platinum font-medium border border-border hover:border-champagne/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                >
                  <Link href="/articles">
                    View All Articles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full relative overflow-hidden rounded-3xl border border-border bg-surface-low p-12 text-center">
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-16 h-16 mb-5 rounded-2xl bg-champagne/10 border border-champagne/20 flex items-center justify-center text-champagne">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  No Articles Yet
                </h3>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  Technical case studies and telemetry reports are currently in review. Check back soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
);

RecentArticles.displayName = "RecentArticles";

export default RecentArticles;
