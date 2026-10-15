# TEST INFRASTRUCTURE: Executive Editorial Portfolio E2E Runner

## 1. Overview
This test infrastructure implements a comprehensive, 4-tier opaque-box End-to-End (E2E) automated verification framework for the Essa Ahmed Executive Editorial Analytics Engineering portfolio (`essaahmed.dev`). It validates theme consistency, Supabase cloud data synchronization, responsive layouts, boundary/corner conditions, cross-module integration, and end-to-end user journeys.

## 2. Architecture & Tier Breakdown

| Tier | Name | Focus | Test Count |
|------|------|-------|------------|
| **Tier 1** | Feature Coverage | Validates explicit requirements: R1 Theme & Layout Upgrade, R2 Supabase Sync, R3 Responsive & Build | 18 Tests (6 per requirement) |
| **Tier 2** | Boundary & Corner Cases | Empty/null tags, missing image fallback placeholders, invalid routes (404), invalid project UUIDs, 404 tag pages, error boundaries | 6 Tests |
| **Tier 3** | Cross-Feature Combinations | Multi-subsystem interactions: Theme + Navigation, live Supabase queries joined to ProjectCard contracts, filter pills + listings, gallery switchers, breadcrumbs | 5 Tests |
| **Tier 4** | Real-World Application Scenarios | Complete persona journeys: Executive Recruiter desktop case study review, Mobile Engineering Leader 375px viewport drawer experience, Knowledge Explorer reading/diary path, and resilient navigation recovery | 4 Tests |
| **Total** | Full Suite | Complete validation across all application requirements | **33 Tests** |

---

## 3. Directory Layout

```
tests/
└── e2e/
    ├── runner.js                      # Main entrypoint: CLI parser, tier filtering, reporter formatting
    ├── config.js                      # Environment and token configuration (loads .env, Supabase credentials, tokens)
    ├── helpers/
    │   ├── assertions.js              # Strict assertion helpers (assertOk, assertEqual, assertIncludes, etc.)
    │   ├── http-client.js             # HTTP/HTML fetching client with fallback/mock capabilities
    │   ├── supabase-test-client.js    # Direct Supabase API client for querying live PostgREST endpoints
    │   └── reporter.js                # Structured test reporter with terminal colors and markdown generator
    ├── tier1_features/
    │   ├── r1_theme_layout.test.js    # R1.1 to R1.6: Base obsidian (#07090e), CSS tokens, Tailwind hierarchy, dark canvas
    │   ├── r2_supabase_sync.test.js   # R2.1 to R2.6: Categories sync, tags sync, case study records, project_tags, CDN images
    │   └── r3_responsive_build.test.js# R3.1 to R3.6: TypeScript tsc --noEmit, types.ts, 64px header, drawer modal, WCAG
    ├── tier2_boundary/
    │   └── boundary_corner.test.js    # Boundary 2.1 to 2.6: Empty tags, missing image fallback, 404, notFound(), errors
    ├── tier3_cross_feature/
    │   └── cross_feature.test.js      # Cross 3.1 to 3.5: Theme + Nav, live joined Supabase data mapping, filters, gallery
    └── tier4_real_world/
        └── real_world_scenarios.test.js# Scenario 4.1 to 4.4: Recruiter desktop journey, Mobile Leader, Explorer, Recovery
```

---

## 4. How to Execute Tests

### Run Full Suite (All 4 Tiers)
```bash
npm test
# or
node tests/e2e/runner.js
```

### Run Full Suite with Markdown Report Generation
```bash
node tests/e2e/runner.js --report
```
Generates `TEST_EXECUTION_REPORT.md` at project root.

### Run Specific Tiers
```bash
node tests/e2e/runner.js --tier=1    # Feature Coverage (R1, R2, R3)
node tests/e2e/runner.js --tier=2    # Boundary & Corner Cases
node tests/e2e/runner.js --tier=3    # Cross-Feature Combinations
node tests/e2e/runner.js --tier=4    # Real-World Personas & User Journeys
```

---

## 5. Authoritative Expected Output & Verification Sources
1. **R1 Theme & Layout**:
   - Palette Tokens: Obsidian base (`#07090e`, `#05060a`, `#030407`), Champagne (`#f3e8d2`, `#c2b49c`), Platinum (`#e2e8f0`), Soft Sky (`#bfdbfe`), Metric (`#60A5FA`), Tertiary Emerald (`#34d399`).
   - Hairline borders: `rgba(255, 255, 255, 0.07)` (`--border: 220 14% 14%`).
   - Typography pairings: Plus Jakarta Sans (headings/display), Inter (prose/sans), JetBrains Mono (KPIs/monospaced chips).
2. **R2 Supabase Synchronization**:
   - Live cloud verification against `https://kexmzaaufxbzegurxuqz.supabase.co`.
   - Categories: "Business Intelligence", "Data Pipelines", "Automation".
   - Standardized tags: "Power BI", "Quality Assurance", "Manufacturing", "Operations", "Vendor Management", "ETL".
   - 5 Case Study Projects with active Supabase CDN storage image URLs.
3. **R3 Responsive & Build Verification**:
   - `npx tsc --noEmit` zero-error compilation.
   - Mobile navigation drawer semantics (`role="dialog"`, `aria-modal="true"`, `aria-label`).
   - Responsive breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).

---

## 6. Implementation Bugs & Notes for Builders
1. **ESLint Unescaped Entities (M4 & M5)**:
   - `src/app/articles/categories/[slug]/CategoryDetailPage.tsx`: unescaped single quotes on line 144.
   - `src/app/articles/series/[slug]/SeriesDetailPage.tsx`: unescaped single quotes on line 176.
   - `src/app/articles/[slug]/ArticleDetailPageEnhanced.tsx`: unescaped entity / `<img>` tag to convert to `<Image />`.
2. **Next.js Production Build (`npm run build`) in `src/app/about/page.tsx`**:
   - `about/page.tsx:16:11` queried `"profile_settings"` which is not in generated Supabase table types (table name in types is `"profile"` or `"site_settings"`).
