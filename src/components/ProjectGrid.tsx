import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import ProjectCard from "./ProjectCard";
import { supabase } from "@/integrations/supabase/client";

type Category = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  category_id: string | null;
  categories?: { name: string } | null;
  tags: string[];
};

type ProjectRow = Omit<Project, "tags"> & {
  project_tags?: { tags?: { name?: string | null } | null }[] | null;
};

const ProjectGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    void fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from("projects")
        .select("*, categories(name), project_tags(tags(name))")
        .order("created_at", { ascending: false });

      if (!data) {
        setProjects([]);
        return;
      }

      const rows = data as ProjectRow[];
      const projectsWithTags: Project[] = rows.map((project) => ({
        ...project,
        tags: (project.project_tags || [])
          .map((pt) => pt.tags?.name)
          .filter((name): name is string => Boolean(name)),
      }));

      setProjects(projectsWithTags);

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      const categoryNames = ((categoriesData || []) as Category[]).map((cat) => cat.name);
      setCategories(["All", ...categoryNames]);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return projects;
    return projects.filter((project) => project.categories?.name === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my data analysis projects showcasing various techniques from visualization to machine learning
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-up delay-200">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-gradient-primary shadow-soft scale-105"
                  : "hover:bg-primary/5 hover:border-primary/30"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up delay-300">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProjectCard
                id={project.id}
                title={project.title}
                description={project.description}
                image={project.image_url || "/placeholder.svg"}
                tags={project.tags}
                category={project.categories?.name || "Uncategorized"}
                demoUrl={project.demo_url || undefined}
                githubUrl={project.github_url || undefined}
                views={project.views || 0}
                likes={project.likes || 0}
                comments={project.comments || 0}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-up delay-500">
          <Button
            variant="outline"
            size="lg"
            className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
          >
            Load More Projects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectGrid;
