import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 120;

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("blog_posts")
    .select("title,excerpt,content,tags,created_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 max-w-4xl mx-auto px-6 py-12">
        <p className="text-sm text-muted-foreground mb-3">{new Date(data.created_at).toLocaleDateString()}</p>
        <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
        <p className="text-muted-foreground mb-6">{data.excerpt}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {(data.tags || []).map((tag: string) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <MarkdownRenderer content={data.content || ""} className="prose prose-lg max-w-none" />
      </main>
      <Footer />
    </div>
  );
}

