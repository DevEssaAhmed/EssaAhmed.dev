"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Folder, ArrowRight, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import ArticlesSubNav from "@/components/ArticlesSubNav";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  article_count: number;
  featured: boolean;
}

type CategoriesPageProps = {
  initialCategories?: Category[];
};

// Muted, on-theme gradient accents per index (all use primary/muted palette)
const CARD_ACCENTS = [
  "from-primary/20 to-violet-500/10",
  "from-sky-500/15 to-primary/10",
  "from-emerald-500/15 to-teal-500/5",
  "from-amber-500/15 to-orange-500/5",
  "from-rose-500/15 to-pink-500/5",
  "from-indigo-500/15 to-primary/10",
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const CategoriesPage = ({ initialCategories }: CategoriesPageProps) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(initialCategories === undefined);

  useEffect(() => {
    if (initialCategories !== undefined) return;
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("featured", { ascending: false })
          .order("article_count", { ascending: false });
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [initialCategories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 p-6">
                <Skeleton className="h-8 w-8 rounded-lg mb-4" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Categories | Articles" description="Explore articles organized by topics and technologies." />
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Folder className="w-3.5 h-3.5" />
              <span>{categories.length} Categories</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Categories
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Articles organized by topic — dive into a subject that interests you.
            </p>
            <ArticlesSubNav />
          </div>

          {/* Category Cards Grid */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="show"
          >
            {categories.map((category, index) => (
              <motion.div key={category.id} variants={fadeUp}>
                <Link
                  href={`/articles/categories/${category.slug}`}
                  className="group block h-full"
                >
                  <div className="relative h-full rounded-2xl border border-border/50 bg-card/50 overflow-hidden hover:border-primary/40 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">

                    {/* Gradient accent strip at top */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${CARD_ACCENTS[index % CARD_ACCENTS.length]} opacity-80`} />

                    {/* Content */}
                    <div className="p-6">
                      {/* Icon + featured badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${CARD_ACCENTS[index % CARD_ACCENTS.length]} flex items-center justify-center border border-border/40`}>
                          <Folder className="w-5 h-5 text-primary" />
                        </div>
                        {category.featured && (
                          <Badge className="bg-primary/10 text-primary border border-primary/20 font-medium">
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Name + description */}
                      <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5">
                        {category.description || "Explore articles in this category."}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{category.article_count || 0} article{category.article_count !== 1 ? "s" : ""}</span>
                        </div>
                        <span className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200">
                          Explore <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty state */}
          {categories.length === 0 && (
            <div className="w-full relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 p-16 text-center mt-8">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 mb-5 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
                  <Folder className="w-9 h-9 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No Categories Yet</h3>
                <p className="text-muted-foreground mb-6">Categories will appear here once articles are organized.</p>
                <Link href="/articles" className="text-primary font-medium hover:underline flex items-center gap-1">
                  Browse all articles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
