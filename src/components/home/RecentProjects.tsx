import { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Heart, ExternalLink, Github, FolderSearch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMarkdownExcerpt } from "@/lib/markdownUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/OptimizedImage";

interface RecentProjectsProps {
  showAll?: boolean;
}

const RecentProjects = memo(({ showAll = false }: RecentProjectsProps) => {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const handleTagInteraction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, href: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(href);
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("projects")
        .select("id,title,description,image_url,featured,views,likes,demo_url,github_url,created_at,categories(name),project_tags(tags(name))")
        .order("created_at", { ascending: false })
        .limit(showAll ? 50 : 6);

      if (data) {
        const projectsWithTags = data.map((project: any) => ({
          ...project,
          tags: (project.project_tags || []).map((pt: any) => pt.tags?.name).filter(Boolean),
        }));
        setProjects(projectsWithTags);

        const { data: categoriesData } = await supabase.from("categories").select("name").order("name");
        const categoryNames = categoriesData?.map((cat: any) => cat.name) || [];
        setCategories(["All", ...categoryNames]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects =
    selectedCategory === "All"
      ? projects.slice(0, showAll ? projects.length : 4)
      : projects
          .filter((project: any) => project.categories?.name === selectedCategory)
          .slice(0, showAll ? projects.length : 4);

  if (loading) {
    return (
      <section className="py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredProjects.map((project: any) => (
            <Card
              key={project.id}
              className="group cursor-pointer hover:shadow-glow transition-all duration-300"
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/projects/${project.id}`)}
              onKeyDown={(e) => handleCardKeyDown(e, `/projects/${project.id}`)}
            >
                {project.image_url && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <OptimizedImage
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    {project.featured && <Badge>Featured</Badge>}
                  </div>
                  <CardDescription className="line-clamp-3">
                    {getMarkdownExcerpt(project.description || "", 120)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(project.tags || []).slice(0, 4).map((tag: string) => {
                      const tagSlug = tag.toLowerCase().replace(/\s+/g, "-");
                      return (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tagSlug)}`}
                          onClick={handleTagInteraction}
                          onKeyDown={handleTagInteraction}
                        >
                          <Badge
                            variant="outline"
                            className="cursor-pointer"
                          >
                            #{tag}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {project.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {project.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.demo_url && <ExternalLink className="w-3 h-3" />}
                      {project.github_url && <Github className="w-3 h-3" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
          <div className="bg-muted/50 p-6 rounded-full mb-6">
            <FolderSearch className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground max-w-sm">
            We couldn&apos;t find any projects in this category. Try selecting another filter.
          </p>
          <Button variant="link" onClick={() => setSelectedCategory("All")} className="mt-4 text-primary">
            Show all projects
          </Button>
        </div>
      )}

      {!showAll && (
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/projects">
              View All Projects <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
});

RecentProjects.displayName = "RecentProjects";

export default RecentProjects;
