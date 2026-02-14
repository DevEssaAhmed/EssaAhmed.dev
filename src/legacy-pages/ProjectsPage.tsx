"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ProjectCard from "@/components/ProjectCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type ProjectsPageProps = {
  initialProjects?: any[];
};

const ProjectsPage = ({ initialProjects }: ProjectsPageProps) => {
  const [projects, setProjects] = useState<any[]>(initialProjects ?? []);
  const [loading, setLoading] = useState(initialProjects === undefined);

  useEffect(() => {
    if (initialProjects === undefined) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*, categories(name), project_tags(tags(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const normalized = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image_url || "/placeholder.svg",
        tags: (p.project_tags || []).map((pt: any) => pt.tags?.name).filter(Boolean),
        category: p.categories?.name || "Uncategorized",
        demoUrl: p.demo_url,
        githubUrl: p.github_url,
        views: p.views || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
      }));
      setProjects(normalized);
    } catch (e) {
      setProjects([]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Projects" description="Browse all projects including analytics, dashboards, and data apps." url="/projects" />
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              My Projects
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of data analysis and machine learning projects showcasing various techniques and technologies
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="group overflow-hidden bg-card shadow-card aspect-square">
                  <div className="relative h-full">
                    <Skeleton className="absolute inset-0" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-24 rounded" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-14 rounded" />
                          <Skeleton className="h-5 w-16 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <ProjectCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
