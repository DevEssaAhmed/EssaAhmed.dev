# Test and Development Infrastructure

## Current status

This document describes the commands and test behavior present in the repository today. It does not claim that the full test harness is browser-driven or that CI runs every test command.

The application is a Next.js App Router site using React, TypeScript, Tailwind CSS, and Supabase for Postgres-backed content, Auth, and Storage. Public pages read through a Supabase publishable/anon key and rely on the database's Row Level Security (RLS) policies. Server-rendered pages and route handlers live under `src/app`; shared logic is under `src/lib`; Supabase table definitions are under `src/integrations/supabase/types.ts`.

## Prerequisites and local setup

Use Node.js 20 and npm for parity with the committed GitHub Actions workflow. The application may support other recent Node versions, but Node 20 is the CI runtime.

From a fresh checkout:

```bash
git clone https://github.com/DevEssaAhmed/EssaAhmed.dev.git
cd EssaAhmed.dev
npm ci
```

Create a local environment file from the committed template.

**macOS/Linux**
```bash
cp .env.example .env.local
```

**Windows PowerShell**
```powershell
Copy-Item .env.example .env.local
```

Set these values in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The code also accepts the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` in place of `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Keep publishable/anon keys in the public-key variables only. Never put a service-role or Supabase secret key in a `NEXT_PUBLIC_*` variable or commit a real `.env.local` file.

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). A populated Supabase project is needed to see real project/article content. The root `README.md` also documents admin setup and deployment environment configuration.

## Database and security assumptions

- Supabase is an external dependency; `npm ci` does not create or seed a disposable test database.
- SQL migrations are incremental files under `supabase/migrations/`. Check the target project's migration history and each migration's prerequisites before applying SQL. The root README notes that a blank database may need its base project/article schema provisioned before the incremental migrations can be applied.
- Public-facing reads and writes are governed by Supabase grants and RLS. Do not weaken RLS to make tests pass.
- Admin authorization uses the trusted Supabase Auth `app_metadata.role = "admin"` claim; do not substitute user-editable metadata for that claim.
- The committed test harness uses the publishable/anon key and performs public reads. It is not an admin-policy or service-role security test.
- The integration/source-check harness expects a populated dataset with specific category/tag names and project case studies. It is not a portable fixture suite for an empty or unrelated Supabase project.

## Test commands

| Command | What it runs | External services required |
| --- | --- | --- |
| `npm run test:unit` | Node's built-in test runner for `tests/unit/*.test.js` | No Supabase connection required by the unit tests |
| `npm test` | `tests/e2e/runner.js`, a four-tier source-contract/integration harness | Yes: public Supabase API and referenced Storage assets |
| `node tests/e2e/runner.js --tier=1` | Feature, theme/layout, Supabase data, and responsive/build source checks | Supabase for the data tier |
| `node tests/e2e/runner.js --tier=2` | Boundary and fallback source checks | The harness may initialize Supabase for related checks |
| `node tests/e2e/runner.js --tier=3` | Cross-feature source/data contract checks | Yes: public Supabase API |
| `node tests/e2e/runner.js --tier=4` | Real-world scenario source/data contract checks | Yes: public Supabase API |
| `node tests/e2e/runner.js --report` | Runs all four tiers and writes `TEST_EXECUTION_REPORT.md` | Yes: public Supabase API |

The runner lives in `tests/e2e/runner.js`. Despite the directory name, it does not currently launch Playwright, Cypress, or another real browser engine. Responsive and navigation checks are largely source/markup assertions; Supabase checks query the live public API, and selected checks request public Storage assets. Do not interpret a passing run as proof of real browser interactions, viewport behavior, or production availability.

The runner reads `.env.local` first and then `.env`. It accepts these settings:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` — key used for public API reads.
- `TEST_BASE_URL` — optional base URL for HTTP route checks; defaults to `http://localhost:3000`.

Run only the unit tests when you need a local, service-independent regression check. Run `npm test` when the configured Supabase project and expected public data are available. The integration harness uses read-only public queries, but can fail because of network access, RLS/grants, missing test records, or unavailable image assets.

## Typecheck, lint, build, and CI

Run the same checks as the committed CI workflow from the repository root:

```bash
npm ci
npm run test:unit
npx tsc --noEmit
npm run lint
npm run build
```

The workflow in `.github/workflows/ci.yml` runs on pushes to `main` and pull requests targeting `main`. It uses Node 20, runs the unit tests, typecheck, lint, and production build, and supplies a Supabase URL/key fallback for build-time checks. **CI does not currently run `npm test` or the four-tier integration harness.** A green CI run therefore confirms the listed checks, not the full live-Supabase harness.

To smoke-test a production build locally, use two terminals.

Terminal 1:
```bash
npm run build
npm run start
```

Terminal 2:
```bash
TEST_BASE_URL=http://localhost:3000 npm test
```

In PowerShell, set the variable for the current session with `$env:TEST_BASE_URL = "http://localhost:3000"` before running `npm test`.

## Deployment checklist

1. Deploy from the intended branch using a host that supports the Next.js App Router; the root README documents Vercel as an example.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the hosting environment.
3. Configure the deployed origin and any local development origin in Supabase Auth URL/redirect settings.
4. Apply required SQL migrations to the intended Supabase project after checking its migration history; do not apply the same migration twice.
5. Confirm public reads work under the project's RLS policies, admin access is restricted to the trusted `app_metadata.role = "admin"` claim, and no secret key is exposed to browser code.
6. Verify the production build and key public routes after deployment. CI is not a deployment or production smoke-test workflow.

## Public-content visibility conventions

- **Articles discovered by public listings and the sitemap:** `published = true` and `unlisted = false`. The shared rule is implemented in `src/lib/public-content.js`.
- **Published unlisted articles:** the detail route permits direct-link access and marks the page `noindex`; these articles are omitted from public listings and the sitemap.
- **Projects:** the current `projects` schema has no draft/private visibility column. All project rows are intentionally returned by the public listing, detail route, and sitemap. Add a schema-level visibility field and update all three surfaces together if private/draft projects are introduced.
- **Article tag URLs:** only tags associated with at least one published, listed article belong in the sitemap. The article tag index uses the same visibility predicate.

These rules are explicit so a future visibility/schema change can update the sitemap and public routes together.
