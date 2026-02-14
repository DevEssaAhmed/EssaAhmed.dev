"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, Heart, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { OptimizedImage } from "@/components/OptimizedImage";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  image_url: string;
  views: number;
  likes: number;
  reading_time: number;
  created_at: string;
};

type ArticleDetailPageEnhancedProps = { initialArticle?: Article | null };

const ArticleDetailPageEnhanced = ({ initialArticle }: ArticleDetailPageEnhancedProps) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(initialArticle ?? null);
  const [loading, setLoading] = useState(initialArticle === undefined);

  const fetchArticle = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">Article not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={article.title} description={article.excerpt} image={article.image_url} />
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Button variant="ghost" onClick={() => navigate("/articles")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>

          {article.image_url && (
            <OptimizedImage
              src={article.image_url}
              alt={article.title}
              className="w-full h-64 lg:h-96 object-cover rounded-lg mb-8"
            />
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(article.created_at).toLocaleDateString()}</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.reading_time || 5} min</div>
            <div className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.views || 0}</div>
            <div className="flex items-center gap-1"><Heart className="w-4 h-4" />{article.likes || 0}</div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-6">{article.title}</h1>

          <div className="flex flex-wrap gap-2 mb-8">
            {(article.tags || []).map((tag) => (
              <Badge key={tag} variant="secondary" onClick={() => navigate(`/tags/${tag.toLowerCase().replace(/\s+/g, "-")}`)} className="cursor-pointer">
                {tag}
              </Badge>
            ))}
          </div>

          <Card>
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
              <MarkdownRenderer content={article.content || ""} className="prose prose-lg max-w-none" />
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArticleDetailPageEnhanced;



