"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profile"> & { [key: string]: any };

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultProfile: Profile = {
  id: "default",
  name: "Essa Ahmed",
  username: "essaahmed",
  title: "Workflow Automation, Supply Chain S&OP & Analytics",
  bio: "Bridging supply chain operations, end-to-end process automation, and decision analytics—turning complex operational data into self-running workflows and clear forecasts.",
  email: "essaahmedsiddiqui@gmail.com",
  avatar_url: "/placeholder.svg",
  github_url: "https://github.com/DevEssaAhmed",
  linkedin_url: "https://www.linkedin.com/in/essa-ahmed",
  website_url: "https://essaahmed.dev",
  location: "Karachi, Pakistan",
  skills: ["Python", "SQL", "dbt", "Power BI", "Snowflake", "Airflow", "S&OP Modeling", "Next.js"],
  stats: {},
  about_markdown: null,
  about_content_jsonb: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as any;

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profile")
        .select("id,name,username,title,bio,email,avatar_url,github_url,linkedin_url,website_url,location,skills,stats,created_at,updated_at,about_markdown,about_content_jsonb")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const raw = data && data.length > 0 ? (data[0] as Profile) : defaultProfile;
      const profileData: Profile = {
        ...raw,
        title:
          !raw.title || raw.title === "BI Analyst"
            ? defaultProfile.title
            : raw.title,
        stats:
          raw.stats && typeof raw.stats === "object" && !Array.isArray(raw.stats)
            ? raw.stats
            : defaultProfile.stats,
      };
      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(defaultProfile);
      setError("Using default profile data. Please check your database connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (updates: any) => {
    try {
      setError(null);
      if (!profile) {
        const profileData = {
          name: updates.name || "New User",
          username: updates.username || "user",
          ...updates,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from("profile").insert([profileData]).select().single();
        if (error) throw error;
        setProfile(data as Profile);
      } else {
        const { data, error } = await supabase
          .from("profile")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", profile.id)
          .select()
          .single();
        if (error) throw error;
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  };

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export default ProfileContext;


