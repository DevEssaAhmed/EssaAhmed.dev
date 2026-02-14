import React, { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Search, Hash, TrendingUp, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

interface TagInfo {
  name: string;
  slug: string;
  count: number;
  articleCount: number;
  projectCount: number;
  trending?: boolean;
}

const TagsPage = () => {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data: tagData, error: tagError } = await supabase.rpc("get_all_tags_with_counts");
        if (tagError) throw tagError;

        const tagInfoArray = (tagData || [])
          .map((tag: any) => ({
            name: tag.name,
            slug: tag.name.toLowerCase().replace(/\s+/g, "-"),
            count: tag.total_count,
            articleCount: tag.article_count,
            projectCount: tag.project_count,
            trending: tag.total_count >= 3,
          }))
          .sort((a: TagInfo, b: TagInfo) => b.count - a.count);

        setTags(tagInfoArray);
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast.error("Failed to load tags");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const trendingTags = filteredTags.filter((tag) => tag.trending).slice(0, 12);
  const popularTags = filteredTags.slice(0, 24);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i}><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader></Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Tags" description="Explore content by tags across articles and projects." />
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Tag className="w-8 h-8 text-primary" />
              <h1 className="text-4xl lg:text-5xl font-bold">All Tags</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore content by tags across articles and projects.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="trending">
            <TabsList className="mb-6">
              <TabsTrigger value="trending"><TrendingUp className="w-4 h-4 mr-1" /> Trending</TabsTrigger>
              <TabsTrigger value="popular"><Hash className="w-4 h-4 mr-1" /> Popular</TabsTrigger>
              <TabsTrigger value="all"><Tag className="w-4 h-4 mr-1" /> All</TabsTrigger>
            </TabsList>

            <TabsContent value="trending">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTags.map((tag) => (
                  <Card key={tag.slug} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/tags/${tag.slug}`)}>
                    <CardHeader>
                      <CardTitle className="text-base">#{tag.name}</CardTitle>
                      <CardDescription>{tag.count} total uses</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{tag.articleCount} articles • {tag.projectCount} projects</div>
                      <Badge>Hot</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular">
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Button key={tag.slug} variant="outline" onClick={() => navigate(`/tags/${tag.slug}`)}>
                    #{tag.name} <Badge className="ml-2" variant="secondary">{tag.count}</Badge>
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredTags.map((tag) => (
                  <Button key={tag.slug} variant="ghost" className="justify-between" onClick={() => navigate(`/tags/${tag.slug}`)}>
                    <span>#{tag.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TagsPage;

