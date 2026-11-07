"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Twitter, Linkedin, Link2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OptimizedFooter from "@/components/OptimizedFooter";
import { OptimizedImage } from "@/components/OptimizedImage";
import { calculateReadingTime, formatReadingTime } from "@/utils/readingTime";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useScroll, useSpring } from "framer-motion";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  image_url: string;
  video_url?: string;
  video_type?: string;
  views: number;
  likes: number;
  reading_time: number;
  created_at: string;
};

type ArticleDetailPageEnhancedProps = { initialArticle?: Article | null };

// Reading Progress Bar Component
const ReadingProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-on-surface to-secondary origin-left z-[1001]"
      style={{ scaleX }}
    />
  );
};

const ArticleDetailPageEnhanced = ({ initialArticle }: ArticleDetailPageEnhancedProps) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { isAdmin } = useAuth();
  const [article, setArticle] = useState<Article | null>(initialArticle ?? null);
  const [loading, setLoading] = useState(initialArticle === undefined);

  const fetchArticle = useCallback(async () => {
    if (!slug) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) throw error;
      if (!data) throw new Error("Article not found");
      setArticle((data as unknown) as Article);
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Article not found");
      navigate("/articles");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => { if (initialArticle === undefined) fetchArticle(); }, [fetchArticle, initialArticle]);

  const handleShare = (platform: "twitter" | "linkedin" | "copy") => {
    const url = window.location.href;
    const text = `${article?.title} — by ${profile?.name || "Essa Ahmed"}`;
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
    else if (platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
    else { navigator.clipboard.writeText(url); toast.success("Link copied!"); }
  };

  const readingTime = useMemo(() =>
    article ? formatReadingTime(article.reading_time || calculateReadingTime(article.content)) : "",
    [article]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between transition-colors duration-200">
        <Navigation />
        <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 py-20 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm">Loading article…</p>
          </div>
        </main>
        <OptimizedFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between transition-colors duration-200">
        <Navigation />
        <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 py-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto rounded-3xl bg-surface-container-low border border-outline-variant/30 p-8 shadow-xl space-y-4">
            <h2 className="text-2xl font-display font-bold text-on-surface">Article not found</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              The requested article could not be found or may have been moved.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/articles">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Link>
            </Button>
          </div>
        </main>
        <OptimizedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <ReadingProgressBar />
      <Navigation />

      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Top navigation bar: Back to Articles link & Admin Edit button */}
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 mb-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-code text-on-surface-variant hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Articles</span>
          </Link>
          {isAdmin && (
            <Link
              href={`/admin/blog/edit/${article.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs font-code text-primary hover:bg-primary/25 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Article</span>
            </Link>
          )}
        </div>

        {/* Header: metadata row, title, tags row, excerpt blockquote */}
        <header className="max-w-4xl mx-auto space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 text-xs font-code text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-outline" />
              <span>
                {new Date(article.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {readingTime && (
              <div className="flex items-center gap-1.5 text-secondary font-medium">
                <Clock className="w-4 h-4 text-secondary" />
                <span>{readingTime}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-on-surface tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Tags row (rendered whether or not article.image_url exists) */}
          {(article.tags || []).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(article.tags || []).map((tag) => (
                <Link
                  key={tag}
                  href={`/articles/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}`}
                >
                  <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors text-xs font-code cursor-pointer">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Excerpt blockquote */}
          {article.excerpt && (
            <blockquote className="text-lg sm:text-xl text-on-surface-variant leading-relaxed border-l-2 border-primary pl-5 font-light not-italic my-4">
              {article.excerpt}
            </blockquote>
          )}
        </header>

        {/* Video Player if present */}
        {article.video_url && (
          <div className="max-w-4xl mx-auto mb-10 rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-2xl">
            <div className="aspect-video bg-surface-container-lowest">
              {article.video_type === 'youtube' || article.video_url.includes('youtube') || article.video_url.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${article.video_url.includes('watch?v=') ? article.video_url.split('watch?v=')[1]?.split('&')[0] : article.video_url.split('/').pop()}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={article.title}
                />
              ) : article.video_type === 'vimeo' || article.video_url.includes('vimeo') ? (
                <iframe
                  src={`https://player.vimeo.com/video/${article.video_url.split('/').pop()}`}
                  className="w-full h-full"
                  allowFullScreen
                  title={article.title}
                />
              ) : (
                <video src={article.video_url} controls className="w-full h-full" />
              )}
            </div>
          </div>
        )}

        {/* Framed hero image */}
        {article.image_url && (
          <div className="max-w-4xl mx-auto mb-10 rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-2xl">
            <OptimizedImage
              src={article.image_url}
              alt={article.title}
              className="w-full max-h-[540px] object-cover mx-auto"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Article Body wrapped in article container without conflicting prose prose-lg classes */}
        <article className="max-w-4xl mx-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 sm:p-10 shadow-xl mb-10">
          <MarkdownRenderer content={article.content || ""} />
        </article>

        {/* Share Buttons */}
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3 mb-10 pb-8 border-b border-outline-variant/30">
          <span className="text-sm text-on-surface-variant font-medium">Share this article:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleShare("twitter")}
            className="min-h-11 gap-2 rounded-full border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all"
          >
            <Twitter className="w-3.5 h-3.5" />Twitter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleShare("linkedin")}
            className="min-h-11 gap-2 rounded-full border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all"
          >
            <Linkedin className="w-3.5 h-3.5" />LinkedIn
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleShare("copy")}
            className="min-h-11 gap-2 rounded-full border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all"
          >
            <Link2 className="w-3.5 h-3.5" />Copy Link
          </Button>
        </div>

        {/* Author Card */}
        {profile && (
          <div className="max-w-4xl mx-auto">
            <Card className="border border-outline-variant/30 bg-surface-container-low overflow-hidden">
              <CardContent className="p-6 flex items-center gap-5">
                {profile.avatar_url && (
                  <OptimizedImage
                    src={profile.avatar_url}
                    alt={profile.name || "Author"}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border border-primary/30 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-0.5">Written by</p>
                  <h3 className="font-display font-bold text-lg text-on-surface">{profile.name}</h3>
                  <p className="text-sm text-on-surface-variant line-clamp-2">{profile.bio}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <OptimizedFooter />
    </div>
  );
};

export default ArticleDetailPageEnhanced;
