import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 120;

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const posts = data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Articles</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post: any) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt || "No excerpt"}</p>
                <Link className="text-sm font-medium text-primary" href={`/articles/${post.slug}`}>Read article</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

