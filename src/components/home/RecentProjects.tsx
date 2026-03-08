import { useMemo, useState, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Heart, ExternalLink, Github, FolderSearch } from "lucide-react";
import { getMarkdownExcerpt } from "@/lib/markdownUtils";
import { OptimizedImage } from "@/components/OptimizedImage";

interface RecentProjectsProps {
  showAll?: boolean;
  initialProjects?: any[];
  initialCategories?: string[];
}

const RecentProjects = memo(({ showAll = false, initialProjects = [], initialCategories = [] }: RecentProjectsProps) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const projects = initialProjects;
  const categories = useMemo(() => ["All", ...initialCategories], [initialCategories]);

  const handleCardKeyDown = (e: React.KeyboardEvent, href: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(href);
    }
  };

  const filteredProjects =
    selectedCategory === "All"
      ? projects.slice(0, showAll ? projects.length : 4)
      : projects
          .filter((project: any) => project.categories?.name === selectedCategory || project.category === selectedCategory)
          .slice(0, showAll ? projects.length : 4);

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
              {(project.image_url || project.image) && (
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <OptimizedImage
                    src={project.image_url || project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
                  {(project.tags || []).slice(0, 4).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="pointer-events-none">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {project.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {project.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.demo_url || project.demoUrl ? <ExternalLink className="w-3 h-3" /> : null}
                    {project.github_url || project.githubUrl ? <Github className="w-3 h-3" /> : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="w-full relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 p-12 text-center shadow-sm mt-8 animate-fade-up">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
              <FolderSearch className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-3">No Projects Found</h3>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
              {selectedCategory === "All"
                ? "I&apos;m currently working on some exciting new projects. Check back soon!"
                : `We couldn&apos;t find any projects in the "${selectedCategory}" category.`}
            </p>
            {selectedCategory !== "All" && (
              <Button onClick={() => setSelectedCategory("All")} className="bg-gradient-primary hover:shadow-glow transition-all duration-300 rounded-xl px-8 h-12">
                View All Projects
              </Button>
            )}
          </div>
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

