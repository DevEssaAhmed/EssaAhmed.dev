export const GTM_ID = "GTM-N5VQ53PG";

export const pageview = (url: string) => {
  if (typeof window === "undefined") return;

  window.dataLayer?.push({
    event: "pageview",
    page: url,
  });
};
