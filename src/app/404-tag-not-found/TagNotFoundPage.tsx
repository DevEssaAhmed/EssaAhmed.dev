"use client";

import { useNavigate } from "@/lib/router-compat";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Search } from "lucide-react";

const TagNotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
      <Navigation />
      <div className="pt-20 flex-1 flex items-center">
        <div className="max-w-4xl mx-auto px-6 py-20 w-full">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-center mx-auto mb-6 text-primary">
              <Tag className="w-10 h-10" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-display font-bold text-on-surface mb-4">
              Tag Page Coming Soon
            </h1>

            <p className="text-lg text-on-surface-variant mb-8 max-w-2xl mx-auto font-sans leading-relaxed">
              Tag-based filtering is currently under development. For now, you can explore articles through our categories and series.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="rounded-xl px-6 h-11 border border-outline-variant/40 bg-surface-container text-on-surface hover:bg-surface-container-high transition-all duration-200 font-mono text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
                Go Back
              </Button>

              <Button
                asChild
                className="bg-on-surface text-surface hover:opacity-90 font-medium rounded-xl px-6 h-11 transition-all duration-200"
              >
                <Link href="/articles/categories">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Categories
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-xl px-6 h-11 border border-outline-variant/40 bg-surface-container text-on-surface hover:bg-surface-container-high transition-all duration-200 font-mono text-xs"
              >
                <Link href="/articles">View All Articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <OptimizedFooter />
    </div>
  );
};

export default TagNotFoundPage;
