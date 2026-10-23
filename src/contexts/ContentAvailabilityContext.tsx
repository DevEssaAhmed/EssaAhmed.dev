"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isPublicTravelHighlight } from "@/data/travelVisibility";

export interface ContentAvailability {
  hasProjects: boolean;
  hasArticles: boolean;
  hasTravel: boolean;
  projectsCount: number;
  articlesCount: number;
  travelCount: number;
  loading: boolean;
  refreshAvailability: () => Promise<void>;
}

const defaultAvailability: ContentAvailability = {
  hasProjects: true,
  hasArticles: false,
  hasTravel: false,
  projectsCount: 5,
  articlesCount: 0,
  travelCount: 0,
  loading: true,
  refreshAvailability: async () => {},
};

const ContentAvailabilityContext = createContext<ContentAvailability>(defaultAvailability);

export function ContentAvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState({
    projectsCount: 5,
    articlesCount: 0,
    travelCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const refreshAvailability = useCallback(async () => {
    try {
      const [projectsRes, blogsRes, travelRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("published", true)
          .eq("unlisted", false),
        supabase
          .from("travel_highlights")
          .select("city_name,country_name,lat,lng,cover_image_url,story_slides,is_published")
          .eq("is_published", true),
      ]);

      setCounts((prev) => ({
        projectsCount: projectsRes.error ? prev.projectsCount : (projectsRes.count ?? 0),
        articlesCount: blogsRes.error ? prev.articlesCount : (blogsRes.count ?? 0),
        travelCount: travelRes.error
          ? prev.travelCount
          : (travelRes.data ?? []).filter(isPublicTravelHighlight).length,
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
    hasTravel: counts.travelCount > 0,
    projectsCount: counts.projectsCount,
    articlesCount: counts.articlesCount,
    travelCount: counts.travelCount,
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
