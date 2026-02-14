import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 120;

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const supabase = getSupabaseServer();

  const { data } = await supabase
    .from("projects")
    .select("title,description,image_url,tags,created_at")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 max-w-5xl mx-auto px-6 py-12">
        <p className="text-sm text-muted-foreground mb-3">{new Date(data.created_at).toLocaleDateString()}</p>
        <h1 className="text-4xl font-bold mb-6">{data.title}</h1>
        {data.image_url && <OptimizedImage src={data.image_url} alt={data.title} className="w-full h-80 object-cover rounded-lg mb-8" />}
        <div className="flex flex-wrap gap-2 mb-8">
          {(data.tags || []).map((tag: string) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <MarkdownRenderer content={data.description || ""} className="prose prose-lg max-w-none" />
      </main>
      <Footer />
    </div>
  );
}

