"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ContentAvailabilityProvider } from "@/contexts/ContentAvailabilityContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import SkipLink from "@/components/SkipLink";
import { MotionConfig, LazyMotion } from "framer-motion";
import type { AvailabilityCounts, PublicProfile } from "@/lib/profile-defaults";

const loadMotionFeatures = () =>
  import("framer-motion").then((mod) => mod.domMax);

interface ProvidersProps {
  children: React.ReactNode;
  initialProfile?: PublicProfile | null;
  initialAvailability?: AvailabilityCounts;
}

export default function Providers({
  children,
  initialProfile,
  initialAvailability,
}: ProvidersProps) {
  return (
    <LazyMotion features={loadMotionFeatures}>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider initialProfile={initialProfile}>
              <ContentAvailabilityProvider
                initialAvailability={initialAvailability}
              >
                <TooltipProvider>
                  <SkipLink />
                  <Sonner richColors closeButton />
                  {children}
                </TooltipProvider>
              </ContentAvailabilityProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
