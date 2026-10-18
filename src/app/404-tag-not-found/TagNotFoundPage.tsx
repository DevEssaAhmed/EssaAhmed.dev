"use client";

import { useNavigate } from "@/lib/router-compat";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Search } from "lucide-react";

const TagNotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-container border border-champagne/30 flex items-center justify-center mx-auto mb-6">
              <Tag className="w-10 h-10 text-champagne" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              Tag Page Coming Soon
            </h1>

            <p className="text-lg text-ink-soft mb-8 max-w-2xl mx-auto font-sans">
              Tag-based filtering is currently under development. For now, you can explore articles through our categories and series.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="rounded-xl px-6 h-11 border border-border bg-surface-container text-platinum hover:bg-surface-high transition-all duration-200 font-mono text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-champagne" />
                Go Back
              </Button>

              <Button asChild className="bg-champagne text-surface-lowest hover:bg-champagne/90 font-medium rounded-xl px-6 h-11 transition-all duration-200">
                <Link href="/articles/categories">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Categories
                </Link>
              </Button>

              <Button asChild variant="outline" className="rounded-xl px-6 h-11 border border-border bg-surface-container text-platinum hover:bg-surface-high transition-all duration-200 font-mono text-xs">
                <Link href="/articles">View All Articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

    </div>
  );
};

export default TagNotFoundPage;
