"use client";

import { useMemo } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Folder, ArrowRight, BookOpen } from "lucide-react";
import OptimizedFooter from "@/components/OptimizedFooter";
import ArticlesSubNav from "@/components/ArticlesSubNav";
import { m } from "framer-motion";

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

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const CategoriesPage = ({ initialCategories = [] }: CategoriesPageProps) => {
  const categories = useMemo(() => initialCategories, [initialCategories]);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between transition-colors duration-200">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-6 py-12 md:py-16 flex-1">
        <div className="pb-8 border-b border-outline-variant/30 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="font-code text-xs uppercase tracking-[0.14em] text-outline">
              01 / CATEGORIES
            </span>
            <span className="text-outline-variant" aria-hidden="true">
              ·
            </span>
            <span className="font-code text-xs text-primary">
              {categories.length} {categories.length === 1 ? "Category" : "Categories"}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            Categories
          </h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl leading-relaxed">
            Articles organized by topic, use case, and technical focus area.
          </p>
          <ArticlesSubNav className="mt-8 mb-0 justify-start" />
        </div>

        <m.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="show"
        >
          {categories.map((category) => (
            <m.div key={category.id} variants={fadeUp}>
              <Link href={`/articles/categories/${category.slug}`} className="group block h-full">
                <div className="relative h-full rounded-2xl card-elevated card-interactive border overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 group-hover:bg-primary/60 transition-colors" />
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Folder className="w-5 h-5" />
                        </div>
                        {category.featured && (
                          <Badge className="bg-surface-container text-primary border border-primary/30 text-xs font-code">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-lg font-display font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-5">
                        {category.description || "Explore articles in this category."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-4 border-t border-outline-variant/25">
                      <div className="flex items-center gap-1.5 text-on-surface-variant font-code">
                        <BookOpen className="w-3.5 h-3.5 text-primary/70" />
                        <span>
                          {category.article_count || 0} article{category.article_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-primary font-code text-xs opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </m.div>
          ))}
        </m.div>

        {categories.length === 0 && (
          <div className="w-full relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low p-16 text-center mt-8">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 mb-5 rounded-2xl bg-surface-container border border-primary/30 flex items-center justify-center mx-auto">
                <Folder className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-on-surface mb-2">No Categories Yet</h3>
              <p className="text-on-surface-variant mb-6">
                Categories will appear here once articles are organized.
              </p>
              <Link
                href="/articles"
                className="text-primary font-code text-xs hover:underline inline-flex items-center gap-1"
              >
                Browse all articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
      <OptimizedFooter />
    </div>
  );
};

export default CategoriesPage;
