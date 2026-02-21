"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, Heart, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Image from "next/image";

type Article = {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  image_url: string;
  views: number;
  likes: number;
  reading_time: number;
  created_at: string;
};

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArticle = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) {
        setArticle(data as Article);
      } else {
        setArticle({
          title: "Sample Article",
          content: "This is a sample article content...",
          excerpt: "Sample excerpt",
          tags: ["Demo", "Sample"],
          image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
          views: 100,
          likes: 10,
          reading_time: 5,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching article:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void fetchArticle();
  }, [fetchArticle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">Article not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>

          <div className="mb-8">
            <Image
              src={article.image_url || "/placeholder.svg"}
              alt={article.title}
              width={1200}
              height={768}
              unoptimized
              className="w-full h-64 lg:h-96 object-cover rounded-lg mb-8"
            />

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.reading_time} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {article.likes}
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
                <div className="whitespace-pre-wrap">{article.content}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;



