"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import {
  extractArticleExternalMeta,
  type ArticlePlatform,
} from "@/data/externalArticlesStore";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface ArticlesPageProps {
  initialArticles?: any[];
}

const PLATFORM_FILTERS: Array<"All" | ArticlePlatform> = [
  "All",
  "Medium",
  "dev.to",
  "freeCodeCamp",
  "Substack",
  "Hashnode",
];

export default function ArticlesPage({ initialArticles = [] }: ArticlesPageProps) {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");

  // Strictly use real published articles from Supabase (never inject fake sample articles on public site)
  const unifiedArticles = useMemo(() => {
    return (initialArticles || []).map((post: any) => {
      const extMeta = extractArticleExternalMeta(post);
      return {
        ...post,
        _isExternal: extMeta.isExternal && Boolean(extMeta.externalUrl),
        _externalUrl: extMeta.externalUrl || "",
        _platform: extMeta.platform as ArticlePlatform | null,
      };
    });
  }, [initialArticles]);

  const filteredArticles = useMemo(() => {
    return unifiedArticles.filter((article) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        article.title?.toLowerCase().includes(q) ||
        article.excerpt?.toLowerCase().includes(q);
      const matchesPlatform =
        selectedPlatform === "All" || article._platform === selectedPlatform;
      return matchesSearch && matchesPlatform;
    });
  }, [unifiedArticles, searchTerm, selectedPlatform]);

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 pt-12 pb-20">
        {/* SECTION 1: HERO & FILTER BAR */}
        <section className="pb-10 border-b border-outline-variant/20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-primary text-label-sm font-label-sm uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Technical Writing · Field Essays</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-on-surface mb-3">
                Articles &amp; External Writing
              </h1>
              <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl leading-relaxed">
                Deep dives on Python workflow automation, supply chain S&amp;OP demand forecasting, and executive BI architectures—published here and across Medium, dev.to &amp; Substack.
              </p>
            </div>

            {isAdmin && (
              <Link
                href="/admin/blog/new"
                className="px-4 py-2.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-code hover:bg-primary/25 transition-colors self-start md:self-end shrink-0"
              >
                + Write or Import Article →
              </Link>
            )}
          </div>

          {unifiedArticles.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    aria-label="Search articles"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search articles by topic, tool, or title..."
                    className="min-h-11 w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Platform Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
                  {PLATFORM_FILTERS.map((plat) => {
                    const active = selectedPlatform === plat;
                    return (
                      <button
                        key={plat}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedPlatform(plat)}
                        className="relative min-h-11 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center justify-center"
                      >
                        {active && (
                          <motion.span
                            layoutId="activeArticlePlatformPill"
                            className="absolute inset-0 bg-on-surface rounded-full -z-10 shadow-xs"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span
                          className={
                            active
                              ? "text-surface font-semibold"
                              : "text-on-surface-variant hover:text-on-surface"
                          }
                        >
                          {plat === "All" ? "All Platforms" : plat}
                        </span>
                        {!active && (
                          <span className="absolute inset-0 border border-outline-variant/30 rounded-full bg-surface-container-low hover:bg-surface-container-high -z-20 transition-colors" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: ARTICLES LIST */}
        <section className="pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPlatform + (searchTerm ? `_${searchTerm}` : "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {filteredArticles.length === 0 ? (
                <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-12 text-center">
                  <p className="text-on-surface font-headline-sm mb-2">
                    {unifiedArticles.length === 0
                      ? "No articles published yet"
                      : "No matching articles found"}
                  </p>
                  <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                    {unifiedArticles.length === 0
                      ? "New technical essays and external publications will appear here as soon as they are published."
                      : "Try adjusting your search query or clearing your platform filter."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => {
                    const isExternal = article._isExternal;
                    const platform = article._platform;
                    const href = isExternal
                      ? article._externalUrl
                      : `/articles/${encodeURIComponent(article.slug || article.id)}`;
                    const formattedDate = article.created_at
                      ? new Date(article.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Recent";

                    const badgeClass =
                      platform === "Medium"
                        ? "bg-secondary/10 border-secondary/30 text-secondary"
                        : platform === "dev.to"
                        ? "bg-tertiary-container/20 border-tertiary-container/40 text-tertiary"
                        : "bg-primary/10 border-primary/30 text-primary";

                    const cardContent = (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            {isExternal && platform ? (
                              <span
                                className={`px-2.5 py-1 rounded-full border text-label-sm font-label-sm font-semibold ${badgeClass}`}
                              >
                                {platform} ↗
                              </span>
                            ) : (
                              <span />
                            )}
                            {article.reading_time ? (
                              <span className="text-on-surface-variant text-label-sm font-code">
                                {article.reading_time} min read
                              </span>
                            ) : null}
                          </div>
                          <h2 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors leading-snug">
                            {article.title}
                          </h2>
                          <p className="text-on-surface-variant font-body-md text-body-md mt-3 leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-6 mt-4 border-t border-outline-variant/20 text-on-surface-variant text-label-sm font-code">
                          <span>{formattedDate}</span>
                          {isExternal ? (
                            <span className="material-symbols-outlined text-on-surface text-[16px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                              north_east
                            </span>
                          ) : (
                            <span className="text-primary font-label-sm font-medium flex items-center gap-1 group-hover:underline">
                              Read Article →
                            </span>
                          )}
                        </div>
                      </>
                    );

                    return isExternal ? (
                      <a
                        key={article.id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-outline-variant/70 transition-all group block"
                      >
                        {cardContent}
                      </a>
                    ) : (
                      <Link
                        key={article.id}
                        href={href}
                        className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-outline-variant/70 transition-all group block"
                      >
                        {cardContent}
                      </Link>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <OptimizedFooter />
    </div>
  );
}
