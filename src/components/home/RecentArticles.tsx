import { OptimizedImage } from "@/components/OptimizedImage";
import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Heart, Clock, Calendar, FileText } from "lucide-react";

interface RecentArticlesProps {
  showAll?: boolean;
  initialArticles?: any[];
}

const formatPublishedDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const RecentArticles = memo(({ showAll = false, initialArticles = [] }: RecentArticlesProps) => {
  const router = useRouter();
  const articles = initialArticles;
  const filteredArticles = articles.slice(0, showAll ? articles.length : 4);

  const handleCardKeyDown = (e: React.KeyboardEvent, href: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <section className="py-20 px-6 bg-muted/20 rounded-[2rem] border border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 animate-fade-up">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Recent Articles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Insights, tutorials, and field notes about analytics systems and technology.
            </p>
          </div>

          <Button asChild className="hidden md:flex bg-gradient-primary hover:shadow-soft transition-all duration-300">
            <Link href="/articles">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {filteredArticles.length > 0 ? (
          <>
            <div className={`grid md:grid-cols-2 ${showAll ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-8 animate-fade-up delay-300`}>
              {filteredArticles.map((article: any, index: number) => (
                <Card
                  key={article.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/articles/${article.slug}`)}
                  onKeyDown={(e) => handleCardKeyDown(e, `/articles/${article.slug}`)}
                  className="group hover:shadow-soft transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm border-primary/20 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <OptimizedImage
                      src={article.image_url || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      {formatPublishedDate(article.created_at)}
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
                      {article.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.views || 0}</div>
                      <div className="flex items-center gap-1"><Heart className="w-4 h-4" />{article.likes || 0}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
          <div className="w-full relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 p-12 text-center shadow-sm mt-8 animate-fade-up">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-3">Recent Articles</h3>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-4">
                I&apos;m currently writing new content. Check back soon for fresh articles.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

RecentArticles.displayName = "RecentArticles";

export default RecentArticles;

