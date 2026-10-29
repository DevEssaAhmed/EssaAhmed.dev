"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import type { Profile } from "@/lib/profile-utils";
import { ContentAvailabilityProvider } from "@/contexts/ContentAvailabilityContext";
import type { ContentAvailabilitySnapshot } from "@/types/content-availability";
import { DEFAULT_CONTENT_AVAILABILITY } from "@/types/content-availability";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import SkipLink from "@/components/SkipLink";
import PageTransition from "@/components/PageTransition";
import { MotionConfig } from "framer-motion";

export default function Providers({
  children,
  initialAvailability = DEFAULT_CONTENT_AVAILABILITY,
  initialProfile,
}: {
  children: React.ReactNode;
  initialAvailability?: ContentAvailabilitySnapshot;
  initialProfile?: Profile | null;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider initialProfile={initialProfile}>
            <ContentAvailabilityProvider initialAvailability={initialAvailability}>
              <TooltipProvider>
                <SkipLink />
                <Toaster />
                <Sonner />
                <PageTransition>{children}</PageTransition>
              </TooltipProvider>
            </ContentAvailabilityProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
