"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ContentAvailabilityProvider } from "@/contexts/ContentAvailabilityContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import SkipLink from "@/components/SkipLink";
import PageTransition from "@/components/PageTransition";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <ContentAvailabilityProvider>
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
