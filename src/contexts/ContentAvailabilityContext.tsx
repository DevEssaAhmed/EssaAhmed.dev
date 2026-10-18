"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContentAvailability {
  hasProjects: boolean;
  hasArticles: boolean;
  projectsCount: number;
  articlesCount: number;
  loading: boolean;
  refreshAvailability: () => Promise<void>;
}

const defaultAvailability: ContentAvailability = {
  hasProjects: true,
  hasArticles: false,
  projectsCount: 5,
  articlesCount: 0,
  loading: true,
  refreshAvailability: async () => {},
};

const ContentAvailabilityContext = createContext<ContentAvailability>(defaultAvailability);

export function ContentAvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState({
    projectsCount: 5,
    articlesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const refreshAvailability = useCallback(async () => {
    try {
      const [projectsRes, blogsRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("published", true)
          .eq("unlisted", false),
      ]);

      setCounts((prev) => ({
        projectsCount: projectsRes.error ? prev.projectsCount : (projectsRes.count ?? 0),
        articlesCount: blogsRes.error ? prev.articlesCount : (blogsRes.count ?? 0),
      }));
    } catch {
      // Keep current counts on transient network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  const value: ContentAvailability = {
    hasProjects: counts.projectsCount > 0,
    hasArticles: counts.articlesCount > 0,
    projectsCount: counts.projectsCount,
    articlesCount: counts.articlesCount,
    loading,
    refreshAvailability,
  };

  return (
    <ContentAvailabilityContext.Provider value={value}>
      {children}
    </ContentAvailabilityContext.Provider>
  );
}

export function useContentAvailability() {
  return useContext(ContentAvailabilityContext);
}
