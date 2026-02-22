<div align="center">

# Essa Ahmed Portfolio & Publishing Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&style=for-the-badge)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)

A design-forward, high-performance personal portfolio and publishing platform. Built with modern web technologies to deliver a seamless reading experience and a powerful, Notion-style authoring environment.

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🚀 About the Project

**Essa Ahmed Portfolio** is a comprehensive personal branding and content management system. Engineered for high performance and rapid iteration, it merges a professional portfolio with a fully-fledged technical blog. 

The platform features a custom-built admin dashboard equipped with a rich-text BlockNote editor, providing a Notion-like authoring experience for managing articles, case studies, and taxonomy (categories, series, tags).

---

## ✨ Key Features

- **Public Showcase:** Beautifully crafted pages for Home, About, Projects, and Articles.
- **Advanced Content Taxonomy:** Robust categorization including Categories, Series, and Tags for technical writing.
- **Notion-Style Editor:** Integrated `BlockNote` editor for rich, block-based content creation.
- **Secure Admin Dashboard:** Protected routes for content curation, profile updates, and site maintenance.
- **Optimized Performance:** Next.js App Router architecture ensuring exceptional Core Web Vitals and SEO performance.
- **Premium UX/UI:** Fluid animations via Framer Motion, accessible components via Radix UI, and comprehensive responsive design.

---

## 🛠 Architecture & Tech Stack

This project leverages a modern, decoupled architecture focusing on developer experience and end-user performance.

### Core
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

### Backend & Data
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL & GoTrue)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) (Client-side state & caching)

### UI & Styling
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/) & [Mantine](https://mantine.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Editor & Content
- **Rich Text:** [BlockNote](https://www.blocknotejs.org/)
- **Markdown:** `react-markdown`, `remark-gfm`, `rehype-highlight`

---

## 📁 Project Structure

```text
nextjs-app/
├── src/
│   ├── app/               # Next.js App Router definitions and API routes
│   ├── components/        # Reusable UI components (buttons, dialogs, layout)
│   ├── contexts/          # React Context providers (Theme, Auth, Profile)
│   ├── hooks/             # Custom React hooks for business logic
│   ├── integrations/      # Third-party integrations (Supabase clients, generated types)
│   ├── legacy-pages/      # Transitional components supporting the App Router migration
│   └── lib/               # Utility functions, constants, and helpers
├── public/                # Static assets (images, fonts, favicons)
├── supabase/              # Supabase database migrations and configuration
└── tailwind.config.ts     # Tailwind CSS configuration and theme tokens
```

---

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.17.0 or higher)
- npm (v9 or higher)
- A [Supabase](https://supabase.com/) account and project.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/essa-ahmed-portfolio.git
   cd essa-ahmed-portfolio/nextjs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and populate it with your Supabase credentials. Ensure your Supabase project has the required schema applied.

   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to view the application.

---

## 💻 Development Workflow

The project includes several built-in scripts to streamline development:

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the local development server with Hot Module Replacement |
| `npm run build` | Creates an optimized production build |
| `npm run start` | Starts the Next.js production server |
| `npm run lint` | Runs ESLint and Prettier to ensure code quality |

---

## ☁️ Deployment

The application is thoroughly optimized for Vercel deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/essa-ahmed-portfolio&project-name=essa-ahmed-portfolio&repository-name=essa-ahmed-portfolio&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Public%20Supabase%20project%20credentials)

### Vercel Deployment Steps

1. Push your code to a GitHub repository.
2. Import the project into your Vercel dashboard.
3. Configure the **Environment Variables** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. **Important:** Add your Vercel deployment domain to the **Authentication -> URL Configuration** section in your Supabase dashboard to enable seamless logins.
5. Deploy!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  <i>Engineered with precision for performance, scale, and design aesthetic.</i>
</div>
