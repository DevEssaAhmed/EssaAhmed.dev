"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Folder, ArrowRight, BookOpen } from "lucide-react";
import Footer from "@/components/Footer";
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

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const CategoriesPage = ({ initialCategories = [] }: CategoriesPageProps) => {
  const categories = useMemo(() => initialCategories, [initialCategories]);

  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-border text-platinum text-xs font-mono mb-6">
              <Folder className="w-3.5 h-3.5 text-champagne" />
              <span>{categories.length} Categories</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-white mb-4">
              Categories
            </h1>
            <p className="text-lg text-ink-soft max-w-xl mx-auto mb-8 font-sans">
              Articles organized by topic, use case, and technical focus area.
            </p>
            <ArticlesSubNav />
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="show"
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={fadeUp}>
                <Link href={`/articles/categories/${category.slug}`} className="group block h-full">
                  <div className="relative h-full rounded-2xl border border-border bg-surface-low overflow-hidden hover:border-champagne/40 hover:bg-surface-container/60 transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-champagne/20 group-hover:bg-champagne/60 transition-colors" />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-surface-container border border-border flex items-center justify-center text-champagne">
                          <Folder className="w-5 h-5" />
                        </div>
                        {category.featured && (
                          <Badge className="bg-surface-container text-champagne border border-champagne/30 text-xs font-mono">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-lg font-display font-bold text-white mb-2 group-hover:text-champagne transition-colors">
                        {category.name}
                      </h2>
                      <p className="text-sm text-ink-soft leading-relaxed line-clamp-2 mb-5 font-sans">
                        {category.description || "Explore articles in this category."}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-ink-muted font-mono">
                          <BookOpen className="w-3.5 h-3.5 text-champagne/70" />
                          <span>{category.article_count || 0} article{category.article_count !== 1 ? "s" : ""}</span>
                        </div>
                        <span className="flex items-center gap-1 text-champagne font-mono text-xs opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200">
                          Explore <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {categories.length === 0 && (
            <div className="w-full relative overflow-hidden rounded-2xl border border-border bg-surface-low p-16 text-center mt-8">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 mb-5 rounded-2xl bg-surface-container border border-champagne/30 flex items-center justify-center mx-auto">
                  <Folder className="w-9 h-9 text-champagne" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">No Categories Yet</h3>
                <p className="text-ink-soft mb-6 font-sans">Categories will appear here once articles are organized.</p>
                <Link href="/articles" className="text-champagne font-mono text-xs hover:underline inline-flex items-center gap-1">
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

