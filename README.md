<h1 align="center">Essa Ahmed Portfolio</h1>

<p align="center">
  Design-forward portfolio and publishing platform built with Next.js App Router, React 19, and Supabase.
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&style=for-the-badge" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white&style=for-the-badge" alt="TypeScript" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge" alt="Supabase" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge" alt="Tailwind CSS" /></a>
</p>

<p align="center">
  <a href="https://vercel.com/new">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
  </a>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/<your-username>/<your-repo>&project-name=essa-ahmed-portfolio&repository-name=essa-ahmed-portfolio&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Public%20Supabase%20project%20credentials">
    <img src="https://img.shields.io/badge/One--Click-Portfolio%20Deploy-000000?logo=vercel&logoColor=white&style=for-the-badge" alt="One Click Deploy" />
  </a>
</p>

<p align="center">
  <a href="#overview">Overview</a> |
  <a href="#features">Features</a> |
  <a href="#app-router-status">App Router Status</a> |
  <a href="#quick-start">Quick Start</a> |
  <a href="#deployment">Deployment</a>
</p>

> Update `<your-username>/<your-repo>` in the one-click deploy URL after pushing this project to GitHub.

## Overview

Essa Ahmed Portfolio is a full personal brand site that combines:
- Portfolio showcase (projects and case-study style details)
- Technical writing and content taxonomy (articles, categories, series, tags)
- Admin dashboard for managing profile, blog posts, and projects

The project is optimized for fast iteration and production deployment on Vercel.

## Features

| Area | What It Includes |
|---|---|
| Public Site | Home, about, project pages, article pages, taxonomy pages |
| Admin CMS | Login, profile management, post/project create and edit, maintenance |
| UX Layer | Theming, toasts, loading states, responsive UI, keyboard skip link |
| Data/Auth | Supabase client integration with auth-protected admin routes |
| Content | Markdown/rich content rendering and BlockNote editor support |
| SEO | Metadata, sitemap, robots, and social preview assets |

## App Router Status

The app has been migrated from the old `src/pages` approach to Next.js App Router routes in `src/app`.

Current architecture:
- Route files are defined in `src/app/**/page.tsx`
- Shared providers are centralized in `src/app/providers.tsx`
- Many route pages currently render components from `src/legacy-pages` during migration

This gives App Router benefits now while keeping migration risk low.

## Route Map

Public routes:
- `/`
- `/about`
- `/projects`
- `/projects/[id]`
- `/articles`
- `/articles/[slug]`
- `/categories`
- `/categories/[slug]`
- `/series`
- `/series/[slug]`
- `/tags`
- `/tags/[tagSlug]`
- `/404-tag-not-found`

Admin routes:
- `/admin/login`
- `/admin`
- `/admin/profile`
- `/admin/blog/new`
- `/admin/blog/edit/[id]`
- `/admin/project/new`
- `/admin/project/edit/[id]`
- `/admin/maintenance`

## Tech Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + Radix UI + Mantine + custom UI system
- Supabase (`@supabase/supabase-js`) for backend/auth integration
- TanStack Query for client data strategy
- Framer Motion for animation
- BlockNote for rich content editing

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 3. Start local development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev    # start development server
npm run build  # build production bundle
npm run start  # run production server
npm run lint   # run lint checks
```

## Deployment

### Vercel (recommended)

1. Import this repo into Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy and verify auth callback URLs in Supabase

### Pre-deploy checklist

- Supabase auth redirect URLs include your Vercel domain
- Public routes render correctly
- Admin login and CRUD actions are working in preview

## Project Structure

```text
src/
  app/                  # Next.js App Router route files
  legacy-pages/         # Transitional route content used by app router pages
  components/           # UI and feature components
  contexts/             # Theme/Auth/Profile context providers
  integrations/         # Supabase client and generated types
  hooks/                # Shared hooks
  lib/                  # Utilities and helpers
```

## License

MIT
