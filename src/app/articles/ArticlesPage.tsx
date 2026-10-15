"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, Heart, ArrowRight, FileText } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import ArticlesSubNav from "@/components/ArticlesSubNav";
import { motion } from "framer-motion";

type ArticlesPageProps = {
  initialArticles?: any[];
};

const ArticlesPage = ({ initialArticles = [] }: ArticlesPageProps) => {
  const [selectedTag, setSelectedTag] = useState("All");
  const articles = initialArticles;

  const allTags = useMemo(
    () => ["All", ...new Set(articles.flatMap((article: any) => article.tags || []))],
    [articles]
  );
  const filteredArticles =
    selectedTag === "All"
      ? articles
      : articles.filter((article: any) => article.tags?.includes(selectedTag));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="mb-10 pb-8 border-b border-border">
            <div className="eyebrow mb-3">Architecture Notes</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">Articles &amp; Insights</h1>
            <p className="text-sm sm:text-base text-ink-soft max-w-2xl font-light mb-8">Thoughts, tutorials, and insights about data science, analytics, and technology</p>
            <ArticlesSubNav />
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 mb-12">
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className={`transition-all duration-300 font-mono text-xs rounded-full px-4 py-2 ${
                  selectedTag === tag
                    ? "bg-champagne text-[#090c13] font-medium border-champagne hover:bg-champagne/90"
                    : "bg-surface-high border border-border text-muted-foreground hover:border-champagne/40 hover:text-foreground"
                }`}
              >
                {tag}
              </Button>
            ))}
          </div>

          {filteredArticles.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={{ show: { transition: { staggerChildren: 0.09 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              {filteredArticles.map((article) => (
                <motion.div
                  key={article.id}
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full"
                >
                  <Link href={`/articles/${article.slug}`} className="block h-full">
                    <Card className="group transition-all duration-300 cursor-pointer h-full flex flex-col justify-between hover:-translate-y-1 bg-surface-low border border-border hover:border-champagne/40 overflow-hidden">
                      <div>
                        <div className="relative overflow-hidden">
                          <OptimizedImage
                            src={article.image_url || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(article.created_at).toLocaleDateString()}
                            <Clock className="w-3.5 h-3.5 ml-2" />
                            {article.reading_time || 5} min read
                          </div>
                          <CardTitle className="group-hover:text-champagne transition-colors leading-snug font-display text-white text-lg min-h-[3rem] line-clamp-2">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-muted-foreground text-sm mt-1">
                            {article.excerpt}
                          </CardDescription>
                        </CardHeader>
                      </div>
                      <CardContent className="mt-auto pt-4 border-t border-border/40">
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {article.tags?.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs font-mono bg-surface-high text-muted-foreground border border-border/60"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                          <div className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.views || 0}</div>
                          <div className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{article.likes || 0}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="w-full relative overflow-hidden rounded-3xl border border-border bg-surface-low p-12 text-center shadow-sm my-8">
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-surface-high border border-border flex items-center justify-center">
                  <FileText className="w-10 h-10 text-champagne" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-3">No Articles Found</h3>
                <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-8">
                  {selectedTag === "All"
                    ? "I&apos;m currently writing new content. Check back soon for fresh articles."
                    : `There are currently no articles published under the "${selectedTag}" tag.`}
                </p>
                {selectedTag !== "All" && (
                  <Button
                    onClick={() => setSelectedTag("All")}
                    className="bg-champagne text-[#090c13] hover:bg-champagne/90 font-medium transition-all duration-300 rounded-xl px-8 h-12"
                  >
                    View All Articles
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:border-champagne/40 hover:bg-surface-high text-foreground transition-all duration-300 rounded-xl"
            >
              <Link href="/articles">
                Browse the archive
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

