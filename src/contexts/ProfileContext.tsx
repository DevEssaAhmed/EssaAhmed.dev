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
  name: "Alex Chen",
  username: "alexchen",
  title: "Full Stack Developer",
  bio: "Passionate developer specializing in web applications, data science, and modern technologies. Welcome to my portfolio!",
  email: "alex@example.com",
  avatar_url: "/placeholder.svg",
  github_url: "https://github.com/alexchen",
  linkedin_url: "https://linkedin.com/in/alexchen",
  website_url: null,
  location: "San Francisco, CA",
  skills: ["JavaScript", "React", "Node.js", "Python", "TypeScript", "Vue.js"],
  stats: {
    projectsLed: { label: "Projects Led", value: "15+" },
    hoursAnalyzed: { label: "Hours Analyzed", value: "500+" },
    clientsServed: { label: "Clients Served", value: "50+" },
  },
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
    if (profile && profile.id !== "default") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profile")
        .select("id,name,username,title,bio,email,avatar_url,github_url,linkedin_url,website_url,location,skills,stats,created_at,updated_at,about_markdown,about_content_jsonb")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const profileData = data && data.length > 0 ? (data[0] as Profile) : defaultProfile;
      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(defaultProfile);
      setError("Using default profile data. Please check your database connection.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

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


