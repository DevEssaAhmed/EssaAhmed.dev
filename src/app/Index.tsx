"use client";

import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Users, FolderOpen, Globe, Linkedin, Github, Mail } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import TabNavigation from "@/components/TabNavigation";
import Reveal from "@/components/ui/reveal";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";

import dynamic from "next/dynamic";

const DashboardHero = dynamic(() => import("@/components/home/DashboardHero"), {
  loading: () => <Skeleton className="h-full w-full" />
});
const OptimizedContactForm = dynamic(() => import("@/components/OptimizedContactForm"), {
  loading: () => (
    <div className="rounded-xl border p-6">
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="h-10 w-full mb-3" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
});

// Breakpoint matches the `lg` Tailwind breakpoint (1024px) used to show the dashboard
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

/* Rotating role titles for the hero */
const ROLES = [
  "Analytics Engineer",
  "Data Storyteller",
  "Dashboard Architect",
  "Decision Systems Builder",
];

interface IndexProps {
  initialProjects?: any[];
  initialProjectCategories?: string[];
  initialArticles?: any[];
}

const Index = ({ initialProjects, initialProjectCategories, initialArticles }: IndexProps) => {
  const { profile } = useProfile();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll();
  const motionDisabled = Boolean(prefersReducedMotion);

  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, isMobile || motionDisabled ? 1 : 0]);

  /* Role rotator state */
  const [roleIndex, setRoleIndex] = useState(0);
  useEffect(() => {
    if (motionDisabled) return;
    const id = setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 3000);
    return () => clearInterval(id);
  }, [motionDisabled]);

  const fadeInUp = {
    initial: { opacity: 0, y: isMobile ? 16 : 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: isMobile || motionDisabled ? 0.2 : 0.5, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: isMobile || motionDisabled ? 0 : 0.08
      }
    }
  };

  /* Social proof counts — derived from profile or sensible defaults */
  const stats = useMemo(() => {
    const profileStats = profile?.stats;
    const parsed = profileStats
      ? typeof profileStats === "string"
        ? JSON.parse(profileStats)
        : profileStats
      : null;

    return [
      {
        icon: FolderOpen,
        value: parsed?.projectsLed?.value || "15+",
        label: "Projects Led",
      },
      {
        icon: TrendingUp,
        value: parsed?.hoursAnalyzed?.value || "500+",
        label: "Hours Analyzed",
      },
      {
        icon: Users,
        value: parsed?.clientsServed?.value || "50+",
        label: "Clients Served",
      },
    ];
  }, [profile?.stats]);


  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main id="main-content" role="main" aria-label="Main content">

        {/* ══════════════════════ HERO ══════════════════════ */}
        <motion.section
          ref={heroRef}
          className="relative pt-28 sm:pt-32 pb-20 px-4 sm:px-6 overflow-hidden min-h-[90vh] flex items-center"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          style={{ opacity: isMobile ? 1 : opacity }}
          aria-label="Hero section"
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-hero-spotlight" />
          <div className="absolute inset-0 bg-grid-slate opacity-[0.15] mask-soft" />

          {/* Floating orbs — CSS-only animations */}
          <div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-accent rounded-full blur-2xl opacity-15 animate-float-delay pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full blur-3xl opacity-10 animate-float-delay pointer-events-none"
            style={{ background: 'hsl(var(--warm-accent))' }}
            aria-hidden="true"
          />

          <motion.div className="relative max-w-6xl mx-auto w-full" variants={fadeInUp}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* ─── Left copy ─── */}
              <motion.div className="lg:col-span-7" variants={fadeInUp}>
                <Reveal>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs text-muted-foreground mb-6 hover:translate-y-[-1px] transition-smooth backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Available for analytics roles &amp; projects
                    <Sparkles className="w-3 h-3 ml-1 animate-spin-slow" />
                  </div>
                </Reveal>

                {/* Rotating role subtitle */}
                <Reveal delay={60}>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 h-6">
                    <span>Hi, I'm {profile?.name || "—"} —</span>
                    <span className="relative inline-block w-48 h-5 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={roleIndex}
                          className="absolute left-0 text-primary font-medium"
                          initial={{ y: 14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -14, opacity: 0 }}
                          transition={{ duration: motionDisabled ? 0 : 0.3 }}
                        >
                          {ROLES[roleIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={60}>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-jakarta)]">
                    I engineer decision systems,
                    <span className="block bg-gradient-primary bg-clip-text text-transparent bg-gradient-animated mt-1">
                      focusing on data reliability and creating impact.
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={120}>
                  <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    From raw data to dashboards and decision systems—built with accuracy, automation, and scale in mind.
                  </p>
                </Reveal>

                {/* CTA buttons */}
                <Reveal delay={200}>
                  <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center gap-3">
                    <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="relative">
                      <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 relative overflow-hidden rounded-xl px-6">
                        <Link href="/projects">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                          />
                          <span className="relative z-10">View Case Studies</span>
                          <ArrowRight className="w-4 h-4 ml-2 relative z-10" />
                        </Link>
                      </Button>
                    </motion.div>

                    <span className="hidden sm:inline text-xs text-muted-foreground/50 font-medium">or</span>

                    <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-xl px-6 border-border/50 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group"
                      >
                        <Link href="/about">
                          <span className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300 rounded-xl" />
                          <span className="relative z-10">Contact</span>
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </Reveal>

                {/* Social proof strip */}
                <Reveal delay={300}>
                  <div className="mt-10 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-border/30 pt-6">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="flex items-center gap-2.5 group">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground leading-tight">{stat.value}</div>
                            <div className="text-[11px] text-muted-foreground leading-tight">{stat.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Reveal>
              </motion.div>

              {/* ─── Right dashboard visual ─── */}
              <motion.div className="lg:col-span-5 hidden md:block" variants={fadeInUp}>
                <Reveal delay={120}>
                  <motion.div
                    className="aspect-[4/3] rounded-2xl overflow-hidden border bg-card shadow-glow relative group"
                    initial={{ rotateY: -4, rotateX: 2 }}
                    whileHover={{ scale: 1.02, y: -5, rotateY: 0, rotateX: 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 15 }}
                    style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
                  >
                    {/* Floating badge */}
                    <motion.div
                      className="absolute top-4 left-4 z-10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge className="bg-gradient-primary text-white shadow-soft relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                        <span className="relative z-10 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Analytics · {new Date().getFullYear()}
                        </span>
                      </Badge>
                    </motion.div>

                    {/* Hover glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary opacity-0 rounded-2xl"
                      whileHover={{ opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <Suspense fallback={<Skeleton className="h-full w-full" />}>
                      <DashboardHero />
                    </Suspense>
                  </motion.div>
                </Reveal>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* Section divider */}
        <div className="section-divider" />

        {/* ══════════════════════ TABS ══════════════════════ */}
        <motion.section
          className="py-20 px-4 sm:px-6 bg-surface-1"
          initial={{ opacity: 0, y: isMobile ? 20 : 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile || motionDisabled ? 0.2 : 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          aria-label="Featured content sections"
        >
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-4">
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                  Featured Work
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Selected projects, articles, and a bit about me.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <TabNavigation
                className="py-8"
                initialProjects={initialProjects}
                initialProjectCategories={initialProjectCategories}
                initialArticles={initialArticles}
              />
            </Reveal>
          </div>
        </motion.section>

        {/* Section divider */}
        <div className="section-divider" />

        {/* ══════════════════════ CONTACT ══════════════════════ */}
        <motion.section
          id="contact"
          className="py-20 px-4 sm:px-6"
          initial={{ opacity: 0, y: isMobile ? 20 : 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile || motionDisabled ? 0.2 : 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          aria-labelledby="contact-heading"
        >
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <div className="text-center mb-10">
                <h2 id="contact-heading" className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                  Get In Touch
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Have a project in mind or want to collaborate? I&apos;d love to hear from you!
                </p>
              </div>
            </Reveal>

            {/* Split layout: info sidebar + form */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Info sidebar */}
              <Reveal delay={60}>
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-card">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Let&apos;s Build Something Together</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      Whether it&apos;s a data pipeline, an analytics dashboard, or a full decision system — I&apos;m here to help turn your data into impact.
                    </p>

                    {/* Quick links */}
                    <div className="space-y-3">
                      {profile?.email && (
                        <a
                          href={`mailto:${profile.email}`}
                          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                            <Mail className="w-4 h-4 text-primary" />
                          </div>
                          {profile.email}
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                            <Linkedin className="w-4 h-4 text-primary" />
                          </div>
                          LinkedIn
                        </a>
                      )}
                      {profile?.github_url && (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                            <Github className="w-4 h-4 text-primary" />
                          </div>
                          GitHub
                        </a>
                      )}
                      {profile?.location && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-primary" />
                          </div>
                          {profile.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Contact form */}
              <div className="lg:col-span-3">
                <Reveal delay={120}>
                  <Suspense fallback={
                    <div className="rounded-xl border p-6">
                      <Skeleton className="h-6 w-1/2 mb-4" />
                      <Skeleton className="h-10 w-full mb-3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  }>
                    <OptimizedContactForm />
                  </Suspense>
                </Reveal>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      <OptimizedFooter />
    </div>
  );
};

export default Index;
