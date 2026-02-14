import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("projects")
    .select("id,title,description,image_url")
    .order("created_at", { ascending: false });

  const projects = data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Projects</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Card key={project.id}>
              {project.image_url && (
                <OptimizedImage src={project.image_url} alt={project.title} className="w-full h-48 object-cover rounded-t-lg" />
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description || "No description"}</p>
                <Link className="text-sm font-medium text-primary" href={`/projects/${project.id}`}>View project</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

