"use client";

import { memo } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { useProfile } from "@/contexts/ProfileContext";
import { useContentAvailability } from "@/contexts/ContentAvailabilityContext";

const OptimizedFooter = memo(() => {
  const { profile } = useProfile();
  const { hasProjects, hasArticles } = useContentAvailability();
  const currentYear = new Date().getFullYear();
  const displayName = profile?.name || "Essa Ahmed";
  const email = profile?.email || "essaahmedsiddiqui@gmail.com";
  const githubUrl = profile?.github_url || "https://github.com/DevEssaAhmed";
  const linkedinUrl = profile?.linkedin_url || "https://www.linkedin.com/in/essa-ahmed";

  return (
    <footer className="w-full max-w-[1080px] mx-auto border-t border-outline-variant/30 bg-transparent text-body-md font-body-md">
      <div className="flex flex-col md:flex-row justify-between items-center py-space-xl px-6 w-full max-w-[1080px] mx-auto text-on-surface-variant gap-space-md">
        {/* Left side: Brand identity & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <BrandMark size="sm" />
            <span className="text-headline-sm font-display font-bold text-on-surface">
              {displayName}
            </span>
          </div>
          <span className="hidden sm:inline text-outline">•</span>
          <span className="text-label-md font-label-md text-outline">
            © {currentYear} {displayName}. All rights reserved.
          </span>
        </div>

        {/* Right side: Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-label-md font-label-md">
          <a
            className="hover:text-on-surface transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            href={githubUrl}
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <a
            className="hover:text-on-surface transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            href={linkedinUrl}
            rel="noreferrer"
            target="_blank"
          >
            LinkedIn
          </a>
          <a
            className="hover:text-on-surface transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            href="https://x.com/DevEssaAhmed"
            rel="noreferrer"
            target="_blank"
          >
            Twitter
          </a>
          <a
            className="hover:text-on-surface transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            href={`mailto:${email}`}
          >
            Email
          </a>
          {hasProjects && (
            <Link
              className="hover:text-on-surface transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              href="/projects"
            >
              Projects
            </Link>
          )}
          {hasArticles && (
            <Link
              className="hover:text-on-surface transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              href="/articles"
            >
              Articles
            </Link>
          )}
          <a
            className="hover:text-on-surface transition-colors duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            href="/rss.xml"
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
});

OptimizedFooter.displayName = "OptimizedFooter";

export default OptimizedFooter;
