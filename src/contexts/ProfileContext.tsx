"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeProfile, createDefaultProfile, type Profile } from "@/lib/profile-utils";

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{
  children: React.ReactNode;
  initialProfile?: Profile | null;
}> = ({ children, initialProfile }) => {
  const [profile, setProfile] = useState<Profile | null>(() =>
    initialProfile ? normalizeProfile(initialProfile) : null
  );
  const [loading, setLoading] = useState(!initialProfile);
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

      const raw = data && data.length > 0 ? (data[0] as Profile) : null;
      setProfile(normalizeProfile(raw));
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(createDefaultProfile());
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
        setProfile(normalizeProfile(data as Profile));
      } else {
        const { data, error } = await supabase
          .from("profile")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", profile.id)
          .select()
          .single();
        if (error) throw error;
        setProfile(normalizeProfile(data as Profile));
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

  // RootLayout supplies a server snapshot, so normal page loads avoid an
  // additional browser-side profile request. Keep explicit refresh available
  // for admin edits or recovery after a temporary data-source failure.
  useEffect(() => {
    if (!initialProfile) void fetchProfile();
  }, [fetchProfile, initialProfile]);

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
