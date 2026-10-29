"use client";

import React, { createContext, useContext } from "react";
import type { ContentAvailabilitySnapshot } from "@/types/content-availability";
import { DEFAULT_CONTENT_AVAILABILITY } from "@/types/content-availability";

export interface ContentAvailability extends ContentAvailabilitySnapshot {
  loading: boolean;
}

const defaultAvailability: ContentAvailability = {
  ...DEFAULT_CONTENT_AVAILABILITY,
  loading: false,
};

const ContentAvailabilityContext = createContext<ContentAvailability>(defaultAvailability);

export function ContentAvailabilityProvider({
  children,
  initialAvailability = DEFAULT_CONTENT_AVAILABILITY,
}: {
  children: React.ReactNode;
  initialAvailability?: ContentAvailabilitySnapshot;
}) {
  const value: ContentAvailability = { ...initialAvailability, loading: false };
  return (
    <ContentAvailabilityContext.Provider value={value}>
      {children}
    </ContentAvailabilityContext.Provider>
  );
}

export function useContentAvailability() {
  return useContext(ContentAvailabilityContext);
}
