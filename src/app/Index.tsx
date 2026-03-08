"use client";

import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import TabNavigation from "@/components/TabNavigation";
import Reveal from "@/components/ui/reveal";
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion";

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

  // Disable parallax on mobile — no spring math on the main thread
  const motionDisabled = Boolean(prefersReducedMotion);
  const y = useTransform(scrollYProgress, [0, 1], [0, isMobile || motionDisabled ? 0 : -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile || motionDisabled ? 1 : 0]);
  const springY = useSpring(y, { stiffness: isMobile || motionDisabled ? 0 : 100, damping: isMobile || motionDisabled ? 0 : 30 });

  const fadeInUp = {
    initial: { opacity: 0, y: isMobile ? 20 : 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: isMobile || motionDisabled ? 0.2 : 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: isMobile || motionDisabled ? 0 : 0.1
      }
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main id="main-content" role="main" aria-label="Main content">

        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          className="relative pt-36 pb-20 px-4 sm:px-6 overflow-hidden min-h-[90vh] flex items-center"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          style={{ y: isMobile ? 0 : springY, opacity: isMobile ? 1 : opacity }}
          aria-label="Hero section"
        >
          {/* Background elements */}
          <div className="absolute inset-0 bg-hero-spotlight" />
          {/* Grid hidden on mobile via CSS (.bg-grid-slate display:none at <768px) */}
          <div className="absolute inset-0 bg-grid-slate opacity-[0.15] mask-soft" />

          {/* Floating orbs — CSS-driven for zero JS overhead */}
          <div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-accent rounded-full blur-2xl opacity-15 animate-float-delay pointer-events-none"
            aria-hidden="true"
          />
          {/* Warm accent orb for color variety */}
          <div
            className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full blur-3xl opacity-10 animate-float-delay pointer-events-none"
            style={{ background: 'hsl(var(--warm-accent))' }}
            aria-hidden="true"
          />

          <motion.div className="relative max-w-6xl mx-auto" variants={fadeInUp}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <motion.div className="lg:col-span-7" variants={fadeInUp}>
                <Reveal>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs text-muted-foreground mb-6 hover:translate-y-[-1px] transition-smooth">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Available for analytics roles &amp; projects
                    <Sparkles className="w-3 h-3 ml-1 animate-spin-slow" />
                  </div>
                </Reveal>

                <Reveal delay={60}>
                  <p className="text-sm text-muted-foreground mb-2">
                    Hi, I'm {profile?.name || "—"} — {profile?.title || "Analytics Engineer"}
                  </p>
                </Reveal>

                <Reveal delay={60}>
                  {/*
                    FIXED: Was `text-5xl sm:text-4xl` — that's backwards (bigger at xs, smaller at sm).
                    Now correctly mobile-first: 3xl ? 4xl ? 5xl ? 6xl.
                  */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-jakarta)]">
                    I engineer decision systems,
                    <span
                      className="block bg-gradient-primary bg-clip-text text-transparent bg-gradient-animated"
                    >
                      focusing on data reliability and creating impact.
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={120}>
                  <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl">
                    From raw data to dashboards and decision systems—built with accuracy, automation, and scale in mind.
                  </p>
                </Reveal>

                <Reveal delay={240}>
                  <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                    {/* CTA buttons */}
                    <>
                      <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="relative">
                        <Button asChild className="bg-gradient-primary hover:shadow-glow transition-all duration-300 relative overflow-hidden">
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
                      <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                        <Button asChild variant="outline" className="border-border/50 hover:border-primary/50 transition-all duration-300">
                          <Link href="/about">Contact</Link>
                        </Button>
                      </motion.div>
                    </>
                  </div>
                </Reveal>

                <Reveal delay={300}>
                  <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile ? (
                      <>
                        <span>Based in {profile.location || "—"}</span>
                        <span>•</span>
                        <span>Open to opportunities worldwide</span>
                      </>
                    ) : (
                      <Skeleton className="h-5 w-40" />
                    )}
                  </div>
                </Reveal>
              </motion.div>

              {/*
                Dashboard visual
              */}
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
                          <Star className="w-3 h-3" />
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

        {/* Tabbed navigation */}
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

        {/* Contact Section */}
        <motion.section
          id="contact"
          className="py-20 px-4 sm:px-6"
          initial={{ opacity: 0, y: isMobile ? 20 : 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile || motionDisabled ? 0.2 : 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          aria-labelledby="contact-heading"
        >
          <div className="max-w-4xl mx-auto">
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
        </motion.section>

      </main>

      <OptimizedFooter />
    </div>
  );
};

export default Index;





