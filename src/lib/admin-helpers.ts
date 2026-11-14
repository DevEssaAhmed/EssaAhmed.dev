export const THREE_PILLARS = [
  "Workflow Automation",
  "Supply Chain & Demand Planning",
  "Analytics & Decision Systems",
] as const;

export type PillarType = (typeof THREE_PILLARS)[number];

export interface ContentHealthWarning {
  id: string;
  severity: "warning" | "info";
  domain: "blogs" | "projects" | "travel" | "diary" | "taxonomy";
  title: string;
  description: string;
  editHref?: string;
  targetTab?: string;
}

export interface ContentHealthKPIs {
  blogs: {
    total: number;
    published: number;
    drafts: number;
    unlisted: number;
    external: number;
    onsite: number;
  };
  projects: {
    total: number;
    featured: number;
    byPillar: Record<PillarType, number>;
    totalViews: number;
    totalLikes: number;
  };
  travel: {
    total: number;
    published: number;
    drafts: number;
    totalSlides: number;
    countriesCount: number;
  };
  diary: {
    total: number;
    published: number;
    drafts: number;
  };
}

export interface ContentHealthReport {
  kpis: ContentHealthKPIs;
  warnings: ContentHealthWarning[];
  healthScore: number;
}

export interface ExternalMetaResult {
  isExternal: boolean;
  externalUrl: string;
  platform: string | null;
}

function defaultExtractExternalMeta(post: any): ExternalMetaResult {
  if (!post) {
    return { isExternal: false, externalUrl: "", platform: null };
  }
  if (post.is_external && post.external_url) {
    const rawPlat = post.platform && post.platform !== "On Site" ? post.platform : null;
    return {
      isExternal: true,
      externalUrl: String(post.external_url),
      platform: rawPlat,
    };
  }
  if (typeof post.video_type === "string" && post.video_type.startsWith("external:")) {
    const rawMeta = post.video_type.slice("external:".length);
    const [platformPart] = rawMeta.split("|");
    const externalUrl = String(post.video_url || "");
    const cleanPlat = platformPart && platformPart !== "On Site" ? platformPart : null;
    return {
      isExternal: Boolean(externalUrl),
      externalUrl,
      platform: cleanPlat,
    };
  }
  return { isExternal: false, externalUrl: "", platform: null };
}

function defaultIsPublicTravel(value: any): boolean {
  if (typeof value !== "object" || value === null) return false;
  const cityName = typeof value.city_name === "string" ? value.city_name.trim() : "";
  const countryName = typeof value.country_name === "string" ? value.country_name.trim() : "";
  const lat = Number(value.lat);
  const lng = Number(value.lng);
  const slides = Array.isArray(value.story_slides) ? value.story_slides : [];
  const hasCover = typeof value.cover_image_url === "string" && value.cover_image_url.trim().length > 0;
  const hasSlideImage = slides.some(
    (s: any) => s && typeof s.image_url === "string" && s.image_url.trim().length > 0
  );

  return (
    value.is_published === true &&
    cityName.length > 0 &&
    countryName.length > 0 &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0) &&
    (hasCover || hasSlideImage)
  );
}

/**
 * Fallback keyword heuristic to classify a project into one of the three core pillars
 * when no explicit category mapping is found.
 */
export function inferProjectPillarFromText(project: {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
}): PillarType {
  const text = `${project?.title || ""} ${project?.description || ""} ${(
    Array.isArray(project?.tags) ? project.tags : []
  ).join(" ")}`.toLowerCase();

  if (
    text.includes("supply chain") ||
    text.includes("demand") ||
    text.includes("s&op") ||
    text.includes("inventory") ||
    text.includes("procurement") ||
    text.includes("vendor") ||
    text.includes("logistics")
  ) {
    return "Supply Chain & Demand Planning";
  }

  if (
    text.includes("workflow") ||
    text.includes("automation") ||
    text.includes("pipeline") ||
    text.includes("etl") ||
    text.includes("airflow") ||
    text.includes("webhook") ||
    text.includes("n8n") ||
    text.includes("zapier")
  ) {
    return "Workflow Automation";
  }

  return "Analytics & Decision Systems";
}

/**
 * Resolves a project's domain pillar, preferring its persisted category name
 * (via joined `categories` or `categoryMap`) before falling back to text heuristics.
 */
export function resolveProjectPillar(
  project: any,
  categoryMap?: Map<string, string>
): PillarType {
  const rawCategoryName =
    project?.categories?.name ||
    (project?.category_id && categoryMap?.get(project.category_id)) ||
    project?.category_name ||
    "";
  const normalized = String(rawCategoryName).trim().toLowerCase();

  if (normalized) {
    const exactMatch = THREE_PILLARS.find((p) => p.toLowerCase() === normalized);
    if (exactMatch) return exactMatch;

    if (
      normalized.includes("automation") ||
      normalized.includes("data pipeline") ||
      normalized.includes("pipeline") ||
      normalized.includes("workflow")
    ) {
      return "Workflow Automation";
    }
    if (
      normalized.includes("supply chain") ||
      normalized.includes("demand planning") ||
      normalized.includes("s&op")
    ) {
      return "Supply Chain & Demand Planning";
    }
    if (
      normalized.includes("business intelligence") ||
      normalized.includes("analytics") ||
      normalized.includes("decision")
    ) {
      return "Analytics & Decision Systems";
    }
  }

  return inferProjectPillarFromText(project || {});
}

/**
 * Computes portfolio KPIs, content readiness warnings, and an overall health score
 * across all managed CMS collections.
 */
export function computeContentHealthReport(params: {
  blogPosts: any[];
  projects: any[];
  travelHighlights: any[];
  diaryEntries: any[];
  categoryMap?: Map<string, string>;
  orphanTagsCount?: number;
  orphanCategoriesCount?: number;
  extractExternalMeta?: (post: any) => ExternalMetaResult;
  isPublicTravel?: (city: any) => boolean;
}): ContentHealthReport {
  const {
    blogPosts = [],
    projects = [],
    travelHighlights = [],
    diaryEntries = [],
    categoryMap,
    orphanTagsCount = 0,
    orphanCategoriesCount = 0,
    extractExternalMeta = defaultExtractExternalMeta,
    isPublicTravel = defaultIsPublicTravel,
  } = params;

  const warnings: ContentHealthWarning[] = [];

  // Blogs KPIs & Audit
  let publishedBlogs = 0;
  let draftBlogs = 0;
  let unlistedBlogs = 0;
  let externalBlogs = 0;
  let onsiteBlogs = 0;

  for (const post of blogPosts) {
    const meta = extractExternalMeta(post);
    if (meta.isExternal) {
      externalBlogs += 1;
    } else {
      onsiteBlogs += 1;
    }

    const isPublished = Boolean(post.published) && !post.unlisted;
    const isUnlisted = Boolean(post.published) && Boolean(post.unlisted);

    if (isPublished) publishedBlogs += 1;
    else if (isUnlisted) unlistedBlogs += 1;
    else draftBlogs += 1;

    if (post.published) {
      if (!post.image_url || !String(post.image_url).trim()) {
        warnings.push({
          id: `blog-cover-${post.id}`,
          severity: "warning",
          domain: "blogs",
          title: `Missing cover image: ${post.title || "Untitled Article"}`,
          description: "Published articles without a cover image render fallback placeholders in social previews.",
          editHref: `/admin/blog/edit/${post.id}`,
        });
      }
      if (!post.excerpt || !String(post.excerpt).trim()) {
        warnings.push({
          id: `blog-excerpt-${post.id}`,
          severity: "info",
          domain: "blogs",
          title: `Missing excerpt: ${post.title || "Untitled Article"}`,
          description: "Add a short excerpt for cleaner article cards and OpenGraph meta descriptions.",
          editHref: `/admin/blog/edit/${post.id}`,
        });
      }
    }

    if (post.is_external && !meta.externalUrl) {
      warnings.push({
        id: `blog-external-url-${post.id}`,
        severity: "warning",
        domain: "blogs",
        title: `Missing external URL: ${post.title || "Untitled Article"}`,
        description: "Article is flagged as external but has no destination URL.",
        editHref: `/admin/blog/edit/${post.id}`,
      });
    }
  }

  // Projects KPIs & Audit
  const byPillar: Record<PillarType, number> = {
    "Workflow Automation": 0,
    "Supply Chain & Demand Planning": 0,
    "Analytics & Decision Systems": 0,
  };
  let featuredProjects = 0;
  let totalViews = 0;
  let totalLikes = 0;

  for (const proj of projects) {
    const pillar = resolveProjectPillar(proj, categoryMap);
    byPillar[pillar] += 1;
    if (proj.featured) featuredProjects += 1;
    totalViews += Number(proj.views || 0);
    totalLikes += Number(proj.likes || 0);

    if (!proj.image_url || !String(proj.image_url).trim()) {
      warnings.push({
        id: `project-cover-${proj.id}`,
        severity: "warning",
        domain: "projects",
        title: `Missing cover image: ${proj.title || "Untitled Project"}`,
        description: "Projects without a cover image display a placeholder thumbnail on the portfolio grid.",
        editHref: `/admin/project/edit/${proj.id}`,
      });
    }

    const descLength = String(proj.description || "").trim().length;
    if (descLength < 20) {
      warnings.push({
        id: `project-desc-${proj.id}`,
        severity: "warning",
        domain: "projects",
        title: `Short executive summary: ${proj.title || "Untitled Project"}`,
        description: "Project summary is under 20 characters. Expand it for clearer card & SEO copy.",
        editHref: `/admin/project/edit/${proj.id}`,
      });
    }

    if (!Array.isArray(proj.tags) || proj.tags.length === 0) {
      warnings.push({
        id: `project-tags-${proj.id}`,
        severity: "info",
        domain: "projects",
        title: `No tech tags assigned: ${proj.title || "Untitled Project"}`,
        description: "Assign technology tags so visitors can filter and discover this case study.",
        editHref: `/admin/project/edit/${proj.id}`,
      });
    }
  }

  // Travel KPIs & Audit
  let publishedTravel = 0;
  let draftTravel = 0;
  let totalSlides = 0;
  const countries = new Set<string>();

  for (const city of travelHighlights) {
    const slides = Array.isArray(city.story_slides) ? city.story_slides : [];
    totalSlides += slides.length;
    if (city.country_name) countries.add(String(city.country_name).trim().toLowerCase());

    if (city.is_published) {
      publishedTravel += 1;
      if (!isPublicTravel(city)) {
        warnings.push({
          id: `travel-incomplete-${city.id}`,
          severity: "warning",
          domain: "travel",
          title: `Incomplete published city: ${city.city_name || "Untitled City"}`,
          description: "Published travel highlights require valid map coordinates, country, and a cover or story photo.",
          editHref: `/admin/travel/edit/${city.id}`,
        });
      }
      if (slides.length === 0) {
        warnings.push({
          id: `travel-slides-${city.id}`,
          severity: "info",
          domain: "travel",
          title: `No story slides: ${city.city_name || "Untitled City"}`,
          description: "Add at least one 9:16 vertical story slide to power the travel story viewer.",
          editHref: `/admin/travel/edit/${city.id}`,
        });
      }
    } else {
      draftTravel += 1;
    }
  }

  // Diary KPIs
  let publishedDiary = 0;
  let draftDiary = 0;
  for (const entry of diaryEntries) {
    if (entry.is_published) publishedDiary += 1;
    else draftDiary += 1;
  }

  // Taxonomy Maintenance Audit
  if (orphanTagsCount > 0 || orphanCategoriesCount > 0) {
    warnings.push({
      id: "taxonomy-orphans",
      severity: "info",
      domain: "taxonomy",
      title: "Unused taxonomy items detected",
      description: `${orphanTagsCount} unused tag(s) and ${orphanCategoriesCount} unused category(ies) can be cleaned up.`,
      targetTab: "settings",
    });
  }

  const healthScore = Math.max(0, Math.min(100, Math.round(100 - warnings.length * 5)));

  return {
    kpis: {
      blogs: {
        total: blogPosts.length,
        published: publishedBlogs,
        drafts: draftBlogs,
        unlisted: unlistedBlogs,
        external: externalBlogs,
        onsite: onsiteBlogs,
      },
      projects: {
        total: projects.length,
        featured: featuredProjects,
        byPillar,
        totalViews,
        totalLikes,
      },
      travel: {
        total: travelHighlights.length,
        published: publishedTravel,
        drafts: draftTravel,
        totalSlides,
        countriesCount: countries.size,
      },
      diary: {
        total: diaryEntries.length,
        published: publishedDiary,
        drafts: draftDiary,
      },
    },
    warnings,
    healthScore,
  };
}

export type ArticleSortOption = "newest" | "oldest" | "title" | "views" | "reading_time";

export function filterAndSortArticles(
  posts: any[],
  options: {
    sourceFilter?: "all" | "onsite" | "external";
    statusFilter?: "all" | "published" | "draft" | "unlisted";
    categoryFilter?: string;
    searchQuery?: string;
    sortBy?: ArticleSortOption;
    extractExternalMeta?: (post: any) => ExternalMetaResult;
  }
): any[] {
  const {
    sourceFilter = "all",
    statusFilter = "all",
    categoryFilter = "all",
    searchQuery = "",
    sortBy = "newest",
    extractExternalMeta = defaultExtractExternalMeta,
  } = options;

  const q = searchQuery.trim().toLowerCase();

  const filtered = posts.filter((post) => {
    const meta = extractExternalMeta(post);
    if (sourceFilter === "onsite" && meta.isExternal) return false;
    if (sourceFilter === "external" && !meta.isExternal) return false;

    const isPublished = Boolean(post.published) && !post.unlisted;
    const isUnlisted = Boolean(post.published) && Boolean(post.unlisted);
    const isDraft = !post.published;

    if (statusFilter === "published" && !isPublished) return false;
    if (statusFilter === "unlisted" && !isUnlisted) return false;
    if (statusFilter === "draft" && !isDraft) return false;

    if (categoryFilter !== "all") {
      if (categoryFilter === "uncategorized") {
        if (post.category_id) return false;
      } else if (post.category_id !== categoryFilter) {
        return false;
      }
    }

    if (q) {
      const titleMatch = String(post.title || "").toLowerCase().includes(q);
      const excerptMatch = String(post.excerpt || "").toLowerCase().includes(q);
      const slugMatch = String(post.slug || "").toLowerCase().includes(q);
      const platformMatch = String(meta.platform || "").toLowerCase().includes(q);
      if (!titleMatch && !excerptMatch && !slugMatch && !platformMatch) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      case "title":
        return String(a.title || "").localeCompare(String(b.title || ""));
      case "views":
        return Number(b.views || 0) - Number(a.views || 0);
      case "reading_time":
        return Number(b.reading_time || 0) - Number(a.reading_time || 0);
      case "newest":
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });
}

export type ProjectSortOption = "newest" | "oldest" | "title" | "views" | "likes";

export function filterAndSortProjects(
  projects: any[],
  options: {
    pillarFilter?: string;
    featuredOnly?: boolean;
    searchQuery?: string;
    sortBy?: ProjectSortOption;
    categoryMap?: Map<string, string>;
  }
): any[] {
  const {
    pillarFilter = "all",
    featuredOnly = false,
    searchQuery = "",
    sortBy = "newest",
    categoryMap,
  } = options;

  const q = searchQuery.trim().toLowerCase();

  const filtered = projects.filter((p) => {
    const pillar = resolveProjectPillar(p, categoryMap);
    if (pillarFilter !== "all" && pillar !== pillarFilter) return false;
    if (featuredOnly && !p.featured) return false;

    if (q) {
      const titleMatch = String(p.title || "").toLowerCase().includes(q);
      const descMatch = String(p.description || "").toLowerCase().includes(q);
      const tagMatch = Array.isArray(p.tags)
        ? p.tags.some((t: string) => String(t || "").toLowerCase().includes(q))
        : false;
      const pillarMatch = pillar.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !tagMatch && !pillarMatch) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      case "title":
        return String(a.title || "").localeCompare(String(b.title || ""));
      case "views":
        return Number(b.views || 0) - Number(a.views || 0);
      case "likes":
        return Number(b.likes || 0) - Number(a.likes || 0);
      case "newest":
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });
}

export type TravelSortOption = "year_desc" | "city_asc" | "slides_desc";

export function filterAndSortTravel<T extends { city_name: string; country_name: string; subtitle?: string; is_published?: boolean; year?: number; story_slides?: any[] }>(
  highlights: T[],
  options: {
    statusFilter?: "all" | "published" | "draft";
    searchQuery?: string;
    sortBy?: TravelSortOption;
  }
): T[] {
  const { statusFilter = "all", searchQuery = "", sortBy = "year_desc" } = options;
  const q = searchQuery.trim().toLowerCase();

  const filtered = highlights.filter((c) => {
    const isPublished = c.is_published === true;
    if (statusFilter === "published" && !isPublished) return false;
    if (statusFilter === "draft" && isPublished) return false;

    if (q) {
      const matches =
        String(c.city_name || "").toLowerCase().includes(q) ||
        String(c.country_name || "").toLowerCase().includes(q) ||
        String(c.subtitle || "").toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "city_asc":
        return String(a.city_name || "").localeCompare(String(b.city_name || ""));
      case "slides_desc":
        return (b.story_slides?.length || 0) - (a.story_slides?.length || 0);
      case "year_desc":
      default:
        return Number(b.year || 0) - Number(a.year || 0);
    }
  });
}

export type DiarySortOption = "date_desc" | "date_asc" | "title";

export function filterAndSortDiary(
  entries: any[],
  options: {
    selectedYear?: string;
    statusFilter?: "all" | "published" | "draft";
    topicFilter?: string;
    searchQuery?: string;
    sortBy?: DiarySortOption;
  }
): any[] {
  const {
    selectedYear = "All",
    statusFilter = "all",
    topicFilter = "all",
    searchQuery = "",
    sortBy = "date_desc",
  } = options;
  const q = searchQuery.trim().toLowerCase();

  const filtered = entries.filter((entry) => {
    if (selectedYear !== "All") {
      const dateStr = String(entry.entry_date || "");
      const yearMatch = dateStr.slice(0, 4);
      if (yearMatch !== selectedYear) return false;
    }

    const isPublished = Boolean(entry.is_published);
    if (statusFilter === "published" && !isPublished) return false;
    if (statusFilter === "draft" && isPublished) return false;

    if (topicFilter !== "all") {
      if (String(entry.topic_tag || "") !== topicFilter) return false;
    }

    if (q) {
      const titleMatch = String(entry.title || "").toLowerCase().includes(q);
      const excerptMatch = String(entry.excerpt || "").toLowerCase().includes(q);
      const contentMatch = String(entry.content || "").toLowerCase().includes(q);
      const topicMatch = String(entry.topic_tag || "").toLowerCase().includes(q);
      if (!titleMatch && !excerptMatch && !contentMatch && !topicMatch) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.entry_date || 0).getTime() - new Date(b.entry_date || 0).getTime();
      case "title":
        return String(a.title || "").localeCompare(String(b.title || ""));
      case "date_desc":
      default:
        return new Date(b.entry_date || 0).getTime() - new Date(a.entry_date || 0).getTime();
    }
  });
}

export interface RecentActivityItem {
  id: string;
  domain: "blogs" | "projects" | "travel" | "diary";
  title: string;
  statusLabel: string;
  statusTone: "published" | "draft" | "unlisted" | "featured";
  dateStr: string;
  editHref: string;
  viewHref?: string;
}

/**
 * Builds a unified chronological feed of recent content across all CMS domains.
 */
export function buildRecentActivityFeed(params: {
  blogPosts: any[];
  projects: any[];
  travelHighlights: any[];
  diaryEntries: any[];
  limit?: number;
}): RecentActivityItem[] {
  const { blogPosts, projects, travelHighlights, diaryEntries, limit = 8 } = params;
  const items: Array<RecentActivityItem & { timestamp: number }> = [];

  for (const post of blogPosts) {
    const isPub = Boolean(post.published) && !post.unlisted;
    const isUnlisted = Boolean(post.published) && Boolean(post.unlisted);
    const dateStr = post.updated_at || post.created_at || "";
    items.push({
      id: `blog-${post.id}`,
      domain: "blogs",
      title: post.title || "Untitled Article",
      statusLabel: isPub ? "Published" : isUnlisted ? "Unlisted" : "Draft",
      statusTone: isPub ? "published" : isUnlisted ? "unlisted" : "draft",
      dateStr,
      editHref: `/admin/blog/edit/${post.id}`,
      viewHref: post.slug && post.published ? `/articles/${post.slug}` : undefined,
      timestamp: new Date(dateStr || 0).getTime(),
    });
  }

  for (const proj of projects) {
    const dateStr = proj.updated_at || proj.created_at || "";
    items.push({
      id: `project-${proj.id}`,
      domain: "projects",
      title: proj.title || "Untitled Project",
      statusLabel: proj.featured ? "Featured" : "Standard",
      statusTone: proj.featured ? "featured" : "published",
      dateStr,
      editHref: `/admin/project/edit/${proj.id}`,
      viewHref: `/projects/${proj.id}`,
      timestamp: new Date(dateStr || 0).getTime(),
    });
  }

  for (const city of travelHighlights) {
    const dateStr = (city as any).updated_at || (city as any).created_at || `${city.year || 2025}-01-01`;
    items.push({
      id: `travel-${city.id}`,
      domain: "travel",
      title: `${city.city_name || "City"}${city.country_name ? `, ${city.country_name}` : ""}`,
      statusLabel: city.is_published ? "Published" : "Draft",
      statusTone: city.is_published ? "published" : "draft",
      dateStr,
      editHref: `/admin/travel/edit/${city.id}`,
      timestamp: new Date(dateStr || 0).getTime(),
    });
  }

  for (const entry of diaryEntries) {
    const dateStr = entry.updated_at || entry.entry_date || entry.created_at || "";
    items.push({
      id: `diary-${entry.id}`,
      domain: "diary",
      title: entry.title || "Untitled Entry",
      statusLabel: entry.is_published ? "Published" : "Draft",
      statusTone: entry.is_published ? "published" : "draft",
      dateStr,
      editHref: `/admin/diary/edit/${entry.id}`,
      viewHref: entry.is_published ? "/diary" : undefined,
      timestamp: new Date(dateStr || 0).getTime(),
    });
  }

  return items
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map(({ timestamp: _ts, ...rest }) => rest);
}
