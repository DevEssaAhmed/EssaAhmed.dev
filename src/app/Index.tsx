"use client";

import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import SEO from "@/components/SEO";
import Link from "next/link";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import TabNavigation from "@/components/TabNavigation";
import Reveal from "@/components/ui/reveal";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
const DashboardHero = lazy(() => import("@/components/home/DashboardHero"));
const OptimizedContactForm = lazy(() => import("@/components/OptimizedContactForm"));

// Hook to detect mobile for reduced animations
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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

  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll();
  // Disable parallax on mobile for performance
  const y = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 1 : 0]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  // useEffect(() => {
  //   let mounted = true;
  //   const loadProjects = async () => {
  //     try {
  //       setProjectsLoading(true);
  //       const { data } = await supabase
  //         .from("projects")
  //         .select("id,title,image_url,created_at,likes,views,categories(name)")
  //         .eq("featured", true)
  //         .order("created_at", { ascending: false })
  //         .limit(6);
  //       if (mounted) {
  //         setFeaturedProjects(data || []);
  //       }
  //     } finally {
  //       if (mounted) {
  //         setProjectsLoading(false);
  //       }
  //     }
  //   };

  //   loadProjects();
  //   return () => { mounted = false; };
  // }, []);

  // const activeProject = useMemo(() => featuredProjects[0], [featuredProjects]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Simplified animations for mobile
  const floatingAnimation = isMobile
    ? undefined
    : {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1] as const,
      },
    };

  const pulseAnimation = isMobile
    ? undefined
    : {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1] as const,
      },
    };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Home" description="Design-forward portfolio and journal showcasing selected work, process, and thinking." url="/" />
      <Navigation />

      <main id="main-content" role="main" aria-label="Main content">

        {/* Designer-style Hero with intro + interactive dashboard visual */}
        <motion.section
          ref={heroRef}
          className="relative pt-28 pb-16 px-4 sm:px-6 overflow-hidden"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          style={{ y: springY, opacity }}
          aria-label="Hero section"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-hero-spotlight" />
          <div className="absolute inset-0 bg-grid-slate opacity-[0.15] mask-soft" />

          {/* Floating orbs - hidden on mobile for performance */}
          {!isMobile && (
            <>
              <motion.div
                className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20"
                animate={floatingAnimation}
              />
              <motion.div
                className="absolute top-40 right-20 w-24 h-24 bg-gradient-accent rounded-full blur-2xl opacity-15"
                animate={{
                  y: [0, -15, 0],
                  transition: {
                    duration: 4,
                    repeat: Infinity,
                    delay: 1,
                    ease: [0.4, 0, 0.6, 1] as const
                  }
                }}
              />
            </>
          )}

          <motion.div className="relative max-w-6xl mx-auto" variants={fadeInUp}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <motion.div className="lg:col-span-7" variants={fadeInUp}>
                <Reveal>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs text-muted-foreground mb-6 hover:translate-y-[-1px] transition-smooth"
                    whileHover={{ scale: 1.05, y: -2 }}
                    animate={pulseAnimation}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    Available for analytics roles & projects
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-3 h-3 ml-1" />
                    </motion.div>
                  </motion.div>
                </Reveal>
                <Reveal delay={60}>
                  <p className="text-sm text-muted-foreground mb-2">Hi, I&apos;m {profile?.name || "â€”"} â€” {profile?.title || "Analytics Engineer"}</p>
                </Reveal>
                <Reveal delay={60}>
                  <h1 className="text-5xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                    I engineer decision systems,
                    <motion.span
                      className="block bg-gradient-primary bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{ backgroundSize: '200% 200%' }}
                    >
                      focusing on data reliability and creating impact.
                    </motion.span>
                  </h1>
                </Reveal>
                <Reveal delay={120}>
                  <p className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-2xl">
                    From raw data to dashboards and decision systemsâ€”built with accuracy, automation, and scale in mind.
                  </p>
                </Reveal>
                <Reveal delay={240}>
                  <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <Button asChild className="bg-gradient-primary hover:shadow-glow transition-all duration-300 relative overflow-hidden">
                        <Link href="/projects">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                          />
                          <span className="relative z-10">View Case Studies</span>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="relative z-10"
                          >
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild variant="outline" className="border-border/50 hover:border-primary/50 transition-all duration-300">
                        <Link href="/about">Contact</Link>
                      </Button>
                    </motion.div>
                  </div>
                </Reveal>
                <Reveal delay={300}>
                  <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile ? (
                      <>
                        <span>Based in {profile.location || "â€”"}</span>
                        <span>â€¢</span>
                        {/* <span>{profile.title || ""}</span> */}
                        <span>{"Open to opportunities worldwide"}</span>

                      </>
                    ) : (
                      <Skeleton className="h-5 w-40" />
                    )}
                  </div>
                </Reveal>
              </motion.div>

              {/* Interactive dashboard visual */}
              <motion.div className="lg:col-span-5" variants={fadeInUp}>
                <Reveal delay={120}>
                  <motion.div
                    className="aspect-[4/3] rounded-2xl overflow-hidden border bg-card shadow-glow relative group"
                    whileHover={{ scale: 1.02, y: -5, rotateY: 5 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Floating badge */}
                    <motion.div
                      className="absolute top-4 left-4 z-10"
                      whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
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
                          Analytics Â· {new Date().getFullYear()}
                        </span>
                      </Badge>
                    </motion.div>

                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary opacity-0 rounded-2xl"
                      whileHover={{ opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* <Suspense fallback={<DashboardHeroSkeleton />}>
                  </Suspense> */}
                    <Suspense fallback={<Skeleton className="h-full w-full" />}><DashboardHero /></Suspense>
                  </motion.div>
                </Reveal>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* Tabbed navigation (projects / articles / about) */}
        <motion.section
          className="py-12 px-4 sm:px-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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



        {/* Contact Section */}
        <motion.section
          id="contact"
          className="py-16 px-4 sm:px-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          aria-labelledby="contact-heading"
        >
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="text-center mb-10">
                <h2 id="contact-heading" className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">Get In Touch</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Have a project in mind or want to collaborate? I&apos;d love to hear from you!</p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <Suspense fallback={<div className="rounded-xl border p-6"><Skeleton className="h-6 w-1/2 mb-4" /><Skeleton className="h-10 w-full mb-3" /><Skeleton className="h-10 w-full" /></div>}><OptimizedContactForm /></Suspense>
            </Reveal>
          </div>
        </motion.section>

      </main>

      <OptimizedFooter />
    </div>
  );
};

export default Index;






