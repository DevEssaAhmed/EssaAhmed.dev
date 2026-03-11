"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, Heart, ArrowLeft, Twitter, Linkedin, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { OptimizedImage } from "@/components/OptimizedImage";
import { calculateReadingTime, formatReadingTime } from "@/utils/readingTime";
import { useProfile } from "@/contexts/ProfileContext";
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
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-pink-500 origin-left z-[1001]"
      style={{ scaleX }}
    />
  );
};

const ArticleDetailPageEnhanced = ({ initialArticle }: ArticleDetailPageEnhancedProps) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
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
      setArticle(data as Article);
      await supabase.from("blog_posts").update({ views: (data.views || 0) + 1 }).eq("id", data.id);
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
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading article…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Article not found</h2>
            <Button asChild><Link href="/articles"><ArrowLeft className="w-4 h-4 mr-2" />Back to Articles</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgressBar />
      <SEO title={article.title} description={article.excerpt} image={article.image_url} url={`/articles/${article.slug}`} />
      <Navigation />

      <div className="pt-16">
        {/* Full-width Hero Image with gradient overlay */}
        {article.image_url && (
          <div className="relative w-full h-72 lg:h-[480px] overflow-hidden">
            <OptimizedImage
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            {/* Tags floating on the hero */}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
              {(article.tags || []).slice(0, 4).map((tag) => (
                <Link key={tag} href={`/articles/tags/${tag.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Badge className="bg-background/80 backdrop-blur-sm text-foreground border border-border/60 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* Back link */}
          <Button asChild variant="ghost" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/articles">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Link>
          </Button>

          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-5">
            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(article.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
            <div className="flex items-center gap-1.5 text-primary font-medium"><Clock className="w-4 h-4" />{readingTime}</div>
            <div className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{(article.views || 0).toLocaleString()} views</div>
            <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{article.likes || 0} likes</div>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-primary bg-clip-text text-transparent">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-muted-foreground leading-relaxed mb-10 border-l-4 border-primary/40 pl-5">
            {article.excerpt}
          </p>

          {/* Video Player */}
          {article.video_url && (
            <div className="mb-10 rounded-xl overflow-hidden border border-border/50 shadow-sm">
              <div className="aspect-video bg-muted">
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

          {/* Article Body */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <MarkdownRenderer content={article.content || ""} />
          </div>

          {/* Tags row */}
          {(article.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 pt-8 border-t border-border/50">
              <span className="text-sm text-muted-foreground mr-2 self-center">Filed under:</span>
              {(article.tags || []).map((tag) => (
                <Link key={tag} href={`/articles/tags/${tag.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-3 mb-14 pb-8 border-b border-border/50">
            <span className="text-sm text-muted-foreground font-medium">Share this article:</span>
            <Button size="sm" variant="outline" onClick={() => handleShare("twitter")} className="gap-2 rounded-full hover:bg-sky-500/10 hover:border-sky-500/50 hover:text-sky-500 transition-all">
              <Twitter className="w-3.5 h-3.5" />Twitter
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare("linkedin")} className="gap-2 rounded-full hover:bg-blue-600/10 hover:border-blue-600/50 hover:text-blue-600 transition-all">
              <Linkedin className="w-3.5 h-3.5" />LinkedIn
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare("copy")} className="gap-2 rounded-full hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all">
              <Link2 className="w-3.5 h-3.5" />Copy Link
            </Button>
          </div>

          {/* Author Card */}
          {profile && (
            <Card className="mb-14 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6 flex items-center gap-5">
                {profile.avatar_url && (
                  <img src={profile.avatar_url} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Written by</p>
                  <h3 className="font-bold text-lg">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                </div>
              </CardContent>
            </Card>
          )}


        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArticleDetailPageEnhanced;
