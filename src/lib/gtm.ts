import { sanitizeAnalyticsUrl } from "@/lib/analytics-url.js";

export const GTM_ID = "GTM-N5VQ53PG";

declare global {
  interface Window {
    gtmDidInit?: boolean;
    gtmStartQueued?: boolean;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * Create the GTM queue and queue its bootstrap event exactly once.
 * Page views may arrive before the GTM script is downloaded; dataLayer
 * preserves those events for processing when the script eventually loads.
 */
export const ensureDataLayer = () => {
  if (typeof window === "undefined") return undefined;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtmStartQueued) {
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });
    window.gtmStartQueued = true;
  }

  return window.dataLayer;
};

export const pageview = (pathname: string, search = "") => {
  if (typeof window === "undefined") return;

  const dataLayer = ensureDataLayer();
  dataLayer?.push({
    event: "pageview",
    page: sanitizeAnalyticsUrl(pathname, search),
  });
};
