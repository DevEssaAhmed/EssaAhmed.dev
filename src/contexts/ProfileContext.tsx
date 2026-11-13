"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_PUBLIC_PROFILE,
  FULL_PROFILE_COLUMNS,
  normalizePublicProfile,
  PUBLIC_PROFILE_COLUMNS,
  type PublicProfile,
} from "@/lib/profile-defaults";

type Profile = PublicProfile;

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  hasFullProfile: boolean;
  error: string | null;
  updateProfile: (updates: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFullProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: React.ReactNode;
  initialProfile?: Profile | null;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
  initialProfile,
}) => {
  const hasInitialProfile = initialProfile !== undefined;
  const [profile, setProfile] = useState<Profile | null>(() =>
    hasInitialProfile
      ? normalizePublicProfile(initialProfile)
      : DEFAULT_PUBLIC_PROFILE
  );
  const [loading, setLoading] = useState(!hasInitialProfile);
  const [hasFullProfile, setHasFullProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (includeAbout = false) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = includeAbout
        ? await supabase
            .from("profile")
            .select(FULL_PROFILE_COLUMNS)
            .order("updated_at", { ascending: false })
            .limit(1)
        : await supabase
            .from("profile")
            .select(PUBLIC_PROFILE_COLUMNS)
            .order("updated_at", { ascending: false })
            .limit(1);

      if (error) throw error;

      const raw =
        data && data.length > 0
          ? (data[0] as unknown as Profile)
          : DEFAULT_PUBLIC_PROFILE;
      setProfile(normalizePublicProfile(raw));
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile((prev) => prev || DEFAULT_PUBLIC_PROFILE);
      setError(
        "Using default profile data. Please check your database connection."
      );
    } finally {
      if (includeAbout) {
        setHasFullProfile(true);
      }
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
        const { data, error } = await supabase
          .from("profile")
          .insert([profileData])
          .select()
          .single();
        if (error) throw error;
        setProfile(data as Profile);
        setHasFullProfile(true);
      } else {
        const { data, error } = await supabase
          .from("profile")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", profile.id)
          .select()
          .single();
        if (error) throw error;
        setProfile(data as Profile);
        setHasFullProfile(true);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  };

  const refreshProfile = useCallback(async () => {
    await fetchProfile(false);
  }, [fetchProfile]);

  const refreshFullProfile = useCallback(async () => {
    await fetchProfile(true);
  }, [fetchProfile]);

  useEffect(() => {
    if (!hasInitialProfile) {
      fetchProfile(false);
    }
  }, [fetchProfile, hasInitialProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        hasFullProfile,
        error,
        updateProfile,
        refreshProfile,
        refreshFullProfile,
      }}
    >
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
