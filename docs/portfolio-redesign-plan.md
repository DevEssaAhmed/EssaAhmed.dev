# Portfolio Redesign Plan — "Signal Field"

**Status:** discovery complete; earlier Signal Field design rejected. Three new concept boards (Workshop, Journal, Data Studio) are under review. The visual choices below are provisional until a direction is selected. Light and dark themes plus blog archive/article designs are required for launch.  
**Working branch:** `codex/portfolio-redesign`  
**North star:** turn the site from a generic analytics dashboard into a memorable, credible case-study portfolio for an analytics engineer and decision-systems builder.

## 1. What we are building

The public experience will feel like an editorial record of real problem-solving rather than a UI kit demo. Its core promise is:

> **Essa Ahmed — Analytics Engineer & Decision Systems Builder.**
> I turn fragmented data into reliable decisions, products, and measurable outcomes.

The visual concept is named **Signal Field**:

- Warm porcelain canvas, near-black typography, deep navy structure, acid-lime as the primary signal, and a restrained burnt-orange counterpoint.
- An asymmetric editorial layout with real negative space, not a dashboard grid.
- One abstract “data topology” hero object that represents complexity becoming clarity. It is decorative, never the only way to understand the page.
- Case studies lead with the problem, role, constraint, approach, and visible result—not a technology badge pile.
- The same composition is designed intentionally at 320, 360, 390, and 412px; mobile is not a compressed desktop.

The current platform already has valuable foundations: Next.js App Router, Supabase-backed projects/articles, a profile/admin workflow, server page metadata, dynamic sitemap code, skip links, and a contact workflow. The redesign should retain those authoring capabilities while making the public surface more focused and much lighter.

## 2. Reference-site takeaways

The reference is useful for its content ambition: a clear personal narrative, compact navigation, writing taxonomy, talks, filters, theme choice, and a credible knowledge-hub feel. We will borrow those **product ideas**, not its visual identity.

We will specifically avoid its recognizable navy/purple/coral glow, rounded glass-card hero, and card-grid formula. Signal Field instead uses editorial typography, warm material color, case-study storytelling, and a data-topology signature object. The result should unmistakably belong to Essa.

## 3. Homepage information architecture

| Order | Section | Job |
| --- | --- | --- |
| 1 | Quiet utility nav | Name mark; Work, Approach, Writing, About; availability; concise contact CTA. |
| 2 | Hero / signal object | Ownable positioning, one primary CTA, one secondary CTA, meaningful proof—not rotating buzzwords. |
| 3 | Evidence strip | Selected scope, years, systems, or outcomes backed by real data only. |
| 4 | Selected case studies | Three strong stories with outcome-first thumbnails and a visible mobile action. |
| 5 | How I work | Small narrative of discovery → reliable data → decision/product impact. |
| 6 | Writing / field notes | Selected articles, not an exhaustive feed; routes readers to the full archive. |
| 7 | Credibility / now | Optional talks, collaborators, open-source, or a human "currently" note. |
| 8 | Conversion | A direct, low-friction contact route: email plus a short form or calendar only if the owner wants it. |

### Case-study page template

Every project page should use a repeatable evidence structure:

1. Headline, role, timeframe, context, and outcome.
2. The problem and constraints.
3. Decisions made and the system/process behind them.
4. Selected artefacts: diagrams, dashboard crops, code, or media with useful captions and alt text.
5. Results, methodology caveats, stack, and links.
6. Next case study and a human conversion CTA.

The existing CMS data model will be preserved initially. A later migration can add stable project slugs, outcome fields, role, duration, and case-study sections without disrupting current entries.

## 4. Visual system

### Signature design rules

- **Type:** a sharp sans-serif for navigation, UI, and data; an expressive editorial serif only for emphasis. Avoid using a display font everywhere.
- **Color:** use a small semantic palette. Accent is reserved for action, data signal, and a few key words—not every section title.
- **Surfaces:** paper-like background, fine rules, restrained grain, and image-led case studies. Avoid glass-card stacks and perpetual gradients.
- **Motion:** motion explains hierarchy or a system transformation. It never blocks reading and respects `prefers-reduced-motion`.
- **Photography/art:** use project artefacts and intentionally art-directed crops. Generated material remains concept-only until approved; it must not imply a real client result.

### 3D / dimensional experience

The hero gets a **progressive data-topology enhancement**:

1. All visitors receive semantic HTML, the headline, CTAs, and a lightweight static poster/SVG.
2. On capable desktop devices, after the LCP area is complete and the hero enters view, a small WebGL scene may replace/enhance the poster.
3. It will be skipped for reduced motion, data saver, narrow/mobile layouts, failed WebGL, and low-capability contexts.
4. It stops when off screen; it contains no essential copy or controls; the canvas is `aria-hidden`.

The first implementation should prefer layered SVG/CSS topology lines. Only introduce React Three Fiber if the interactive result earns its byte budget. There will be no generic spinning globe, fake stock chart, random values, or phone-only download of a hidden 3D bundle.

## 5. Mobile and accessibility contract

- Design and review at 320, 360, 390, 412, 768, 1024, and wide desktop widths.
- Use `svh`/safe-area-aware layout instead of fragile `100vh`; no horizontal overflow at 200% zoom.
- Keep all target sizes at least 44×44px and retain project actions that currently only appear on hover.
- Use CSS/container queries for layout rather than server/client viewport branching.
- Maintain a visible focus ring, logical heading order, skip link, keyboard-safe mobile drawer, sensible focus return, and no motion surprise.
- Supply concise text/data alternatives for charts, illustrations, and the 3D object. Target zero serious/critical axe issues.
- Ship both light and dark themes across all public pages, including the blog archive, article, category, tag, and series pages. Respect system preference, persist an explicit user choice, avoid a theme flash, and verify text, code, diagrams, focus states, and images in both themes.

## 6. SEO, discoverability, and social sharing

### P0 technical clean-up

- Choose the production hostname and make it a single `SITE_URL` environment configuration. Redirect every alternate domain to it.
- Replace the stale `public/robots.txt` and `public/sitemap.xml` references with one canonical Next metadata-route implementation. The current repository mixes `essaahmed.dev` and `essaahmed.vercel.app`.
- Include only public, canonical project/article URLs; exclude admin, login, maintenance, preview, drafts, and unlisted content. Decide explicitly whether Diary deserves indexing.
- Render important public profile and listing content server-side; fetch compact list-card projections rather than full article bodies.

### Public-page quality

- Unique title, description, canonical, Open Graph/Twitter image, and clear on-page H1 for every public route.
- Dynamic branded social cards for home, each case study, and each article—never the same generic asset everywhere.
- Truthful JSON-LD: `Person` / `ProfilePage`, `WebSite`, `WebPage` / `CollectionPage`, `Article`, `CreativeWork`, and `BreadcrumbList` where appropriate. No invented ratings, clients, or job claims.
- Index taxonomies only where their introductory content and inventory make them genuinely useful; noindex thin duplicates.
- Ensure the page source includes the key headline, case-study copy, and links without requiring a browser-side fetch.

## 7. Analytics, privacy, and conversion measurement

Analytics should show whether the portfolio creates the right conversations without collecting visitor messages or other PII.

- Select one source of truth: GA4 via GTM or a privacy-first alternative. IDs must come from environment configuration, not a hard-coded component or disconnected admin field.
- Add consent/cookie preferences when nonessential tracking is used; on decline, do not request nonessential analytics.
- Correct initialization so the first page view is reliable and every SPA navigation emits exactly once. Whitelist marketing parameters rather than forwarding the whole query string.
- Track a small event contract: `nav_click`, `cta_click`, `case_study_view`, `outbound_demo_click`, `outbound_github_click`, `resume_download`, `email_click`, `social_click`, `contact_form_start`, `contact_form_submit`, `contact_form_success`, and `contact_form_error`.
- Pass placement and content identifiers only—never raw email, message, form fields, IP address, or arbitrary query text.
- Add Web Vitals RUM beside conversion events so 3D/motion decisions are measured, not guessed.

The contact endpoint will become a server route/action with repeated server-side Zod validation, a honeypot, sensible rate limit/abuse protection, origin checks, least-privilege database access, and a documented retention/deletion policy. CMS-rendered raw HTML will be sanitized/allowlisted before launch.

## 8. Performance plan

The current public shell includes substantial client work, and the dashboard visual pulls charts, tilt, timers, motion, and randomized placeholder metrics even when it is visually hidden. The redesign will:

- Keep route/page data server-first; use small client islands only for filters, menu behavior, form state, and optional motion.
- Move admin/auth/editor dependencies out of the public critical path.
- Delete the fake/random live dashboard and replace it with authored, truthful visual material.
- Make the LCP visual explicit: intrinsic dimensions, a real `sizes` rule, `priority`, optimized AVIF/WebP where appropriate, and no lazy-loading of above-the-fold media.
- Lazy-load below-fold media and rich helpers; dynamically import any WebGL, syntax highlighting, editor, or heavyweight chart code.
- Use responsive images, careful font weights, visibility-aware animation, and a measured JS/image budget.

## 9. Delivery sequence

### Phase 0 — decision and baseline

1. Confirm the production hostname/DNS and tracking choice.
2. Inventory real projects, outcome evidence, CV/resume, links, availability wording, and any speaking/writing material.
3. Capture Lighthouse, Web Vitals, SEO crawl, bundle, and accessibility baselines.
4. Fix canonical/robots/sitemap/noindex/security fundamentals before a visual launch.

### Phase 1 — system and content shell

1. Establish Signal Field tokens, fonts, spacing, components, and responsive rules.
2. Build the mobile-first public shell and case-study template while retaining CMS data.
3. Server-render public profile/listing data and reduce public client payloads.
4. Produce approved project art direction and image treatment.

### Phase 2 — signature layer

1. Implement the hero poster/SVG and optional gated 3D enhancement.
2. Add minimal, purposeful scroll/micro-interactions with reduced-motion behavior.
3. Implement dynamic OG cards, structured data, and refined navigation/search/archive patterns.

### Phase 3 — measurement and release hardening

1. Implement consent-aware analytics and conversion event QA.
2. Harden contact and CMS-rendering security.
3. Validate previews, social cards, Search Console/Bing, redirects, sitemap, and noindex policy.
4. Run mobile device, keyboard/screen-reader, no-WebGL, slow-network, both light/dark theme, and production RUM checks.

## 10. Definition of done

- Public URLs resolve to exactly one HTTPS canonical hostname; sitemap and robots contain no stale Vercel-domain URL.
- Admin, preview, draft, unlisted, and maintenance routes are excluded from indexing.
- Every public page has unique metadata, canonical, social preview, and valid truthful schema.
- Primary content arrives in server HTML and remains understandable with JavaScript, motion, or WebGL unavailable.
- Mobile Lighthouse targets: ≥90 Performance and ≥95 Accessibility, Best Practices, and SEO on home, case-study, and article routes; production p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.
- Zero serious/critical automated accessibility violations; no hover-only essential controls; reduced-motion and no-WebGL users receive the same message and CTAs.
- Analytics consent, one-time page views, SPA navigation events, and conversion events are verified without PII.
- `eslint`, TypeScript, production build, metadata/sitemap tests, device E2E/axe tests, and Lighthouse CI all pass before release.

## 11. Approval gate

The next visual decision is between Workshop, Journal, and Data Studio, or a specific combination of their elements. Signal Field is not an approved direction. Keep this phase focused on reviewable samples; production implementation follows the user's selection. Verify positioning and outcome claims against real content before publishing.
