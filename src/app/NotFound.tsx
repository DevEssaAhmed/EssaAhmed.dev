"use client";

import { useLocation, useNavigate } from "@/lib/router-compat";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, BookOpen, Folders } from "lucide-react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", href: "/", icon: Home, description: "Back to the start" },
    { label: "Articles", href: "/articles", icon: BookOpen, description: "Explore writing" },
    { label: "Projects", href: "/projects", icon: Folders, description: "Browse case studies" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      <div className="pt-20 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-lg text-center">

          {/* Animated 404 glyph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6 relative"
          >
            <div className="text-[120px] font-display font-extrabold leading-none text-champagne select-none tracking-tight">
              404
            </div>
            {/* Decorative subtle glow behind the number */}
            <div className="absolute inset-0 bg-champagne/10 rounded-full blur-3xl -z-10 scale-75" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            <h1 className="text-2xl font-display font-bold text-white mb-3">Page Not Found</h1>
            <p className="text-ink-soft mb-3 leading-relaxed font-sans">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-ink-muted bg-surface-container border border-border rounded-lg px-3 py-1.5 mb-8 font-mono">
              <span className="text-ink-soft">Path:</span>
              <code className="text-champagne">{location.pathname}</code>
            </div>
          </motion.div>

          {/* Quick navigation cards */}
          <motion.div
            className="grid grid-cols-3 gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          >
            {navLinks.map(({ label, href, icon: Icon, description }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-surface-low hover:border-champagne/40 hover:bg-surface-container transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-border flex items-center justify-center group-hover:border-champagne/30 transition-colors">
                  <Icon className="w-5 h-5 text-champagne" />
                </div>
                <div>
                  <div className="text-sm font-display font-semibold text-white">{label}</div>
                  <div className="text-xs text-ink-muted font-sans">{description}</div>
                </div>
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-ink-soft hover:text-white gap-2 font-mono text-xs rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 text-champagne" />
              Go back
            </Button>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default NotFound;
