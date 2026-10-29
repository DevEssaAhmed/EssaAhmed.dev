/**
 * Public discovery rule for articles: only published articles that are not
 * marked unlisted belong in listings, category/series/tag pages, and the sitemap.
 *
 * Published unlisted articles remain accessible by direct URL; their detail route
 * applies noindex metadata. That is intentionally distinct from public discovery.
 */
export const PUBLIC_LISTED_ARTICLE_FILTERS = Object.freeze({
  published: true,
  unlisted: false,
});

/**
 * @typedef {{ published?: boolean | null, unlisted?: boolean | null }} ArticleVisibility
 */

/**
 * @param {ArticleVisibility | null | undefined} article
 */
export function isPublicListedArticle(article) {
  return (
    article?.published === PUBLIC_LISTED_ARTICLE_FILTERS.published &&
    article?.unlisted === PUBLIC_LISTED_ARTICLE_FILTERS.unlisted
  );
}
