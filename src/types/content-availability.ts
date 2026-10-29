export interface ContentAvailabilitySnapshot {
  hasProjects: boolean;
  hasArticles: boolean;
  hasTravel: boolean;
  projectsCount: number;
  articlesCount: number;
  travelCount: number;
}

export const DEFAULT_CONTENT_AVAILABILITY: ContentAvailabilitySnapshot = {
  hasProjects: true,
  hasArticles: false,
  hasTravel: false,
  projectsCount: 5,
  articlesCount: 0,
  travelCount: 0,
};
