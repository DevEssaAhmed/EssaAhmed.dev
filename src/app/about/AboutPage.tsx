"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, MapPin, Globe, Calendar, BookOpen, Code, Database, BarChart3, ExternalLink } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import SEO from "@/components/SEO";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

type AboutPageProps = { initialProfile?: any };

const AboutPage = ({ initialProfile }: AboutPageProps) => {
  const { profile: contextProfile, loading: contextLoading } = useProfile();
  const profile = initialProfile || contextProfile;
  const loading = initialProfile === undefined ? contextLoading : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-champagne/20 border-t-champagne rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <p className="text-ink-soft">Profile not found.</p>
        </div>
      </div>
    );
  }

  const fullName = profile.name || "Profile";
  const bio = profile.bio || "";
  const skills: string[] = Array.isArray(profile.skills) ? (profile.skills as string[]) : [];
  const avatar = profile.avatar_url || "/placeholder.svg";
  const aboutMarkdown: string | undefined = (profile as any).about_markdown;

  const socialLinks = [
    ...(profile.github_url ? [{ label: "GitHub", href: profile.github_url, icon: Github, color: "hover:bg-gray-500/10 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-500/30" }] : []),
    ...(profile.linkedin_url ? [{ label: "LinkedIn", href: profile.linkedin_url, icon: Linkedin, color: "hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30" }] : []),
    ...(profile.website_url ? [{ label: "Website", href: profile.website_url, icon: Globe, color: "hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30" }] : []),
    ...(profile.email ? [{ label: "Email", href: `mailto:${profile.email}`, icon: Mail, color: "hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30" }] : []),
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      <SEO
        title={`About ${fullName}`}
        description={bio.substring(0, 160) || `${fullName} — ${profile.title}`}
        image={avatar}
        url="/about"
        type="website"
      />

      <div className="pt-20">

        {/* Hero section */}
        <section className="relative py-16 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(243,232,210,0.05),rgba(255,255,255,0))] pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              className="flex flex-col lg:flex-row items-center gap-10"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {/* Avatar */}
              <motion.div variants={fadeUp} className="shrink-0 relative">
                <div className="w-36 h-36 rounded-full ring-2 ring-champagne/30 ring-offset-4 ring-offset-surface overflow-hidden shadow-sm">
                  <OptimizedImage
                    src={avatar}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-tertiary rounded-full border-4 border-surface" />
              </motion.div>

              {/* Text */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container border border-border text-platinum text-xs font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  Available for Analytics Roles
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-4xl lg:text-6xl font-display font-bold tracking-tight text-white mb-3">
                  {fullName}
                </motion.h1>

                {profile.title && (
                  <motion.p variants={fadeUp} className="text-lg font-medium text-champagne mb-4">{profile.title}</motion.p>
                )}

                {bio && (
                  <motion.p variants={fadeUp} className="text-lg text-ink-soft max-w-xl mb-6 leading-relaxed font-sans">{bio}</motion.p>
                )}

                {/* Meta info */}
                <motion.div variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-mono text-ink-muted mb-6">
                  {profile.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-champagne" />{profile.location}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-champagne" />
                    Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                </motion.div>

                {/* Social Links */}
                <motion.div variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start gap-2">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith("mailto") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface-container text-sm font-mono text-platinum hover:border-champagne/40 hover:text-champagne transition-all duration-200"
                      >
                        <Icon className="w-4 h-4 text-champagne" />
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main content split */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Story - main column */}
            <motion.div
              className="lg:col-span-2"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-border bg-surface-low p-8">
                <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-champagne" />
                  My Story
                </h2>
                {aboutMarkdown ? (
                  <div className="prose prose-lg max-w-none prose-invert">
                    <MarkdownRenderer content={aboutMarkdown} />
                  </div>
                ) : bio ? (
                  <p className="text-ink-soft leading-relaxed font-sans">{bio}</p>
                ) : (
                  <p className="text-ink-muted italic font-sans">No about content yet.</p>
                )}

                <div className="mt-8 p-5 rounded-xl border border-border bg-surface-container">
                  <p className="text-sm text-ink-soft mb-2 font-sans">
                    I keep a quiet public diary of ongoing experiments and reflections.
                  </p>
                  <Link href="/diary" className="text-sm font-semibold text-champagne hover:underline">
                    Read the diary {"->"}
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="space-y-6"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {/* Contact info card */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-surface-low p-6">
                <h3 className="text-base font-display font-semibold text-white mb-4">Contact</h3>
                <div className="space-y-3 font-mono text-sm">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 hover:text-champagne transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-surface-container border border-border flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-champagne" />
                      </div>
                      <span className="text-ink-soft group-hover:text-champagne transition-colors truncate">{profile.email}</span>
                    </a>
                  )}
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-champagne transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-surface-container border border-border flex items-center justify-center shrink-0">
                        <Github className="w-4 h-4 text-champagne" />
                      </div>
                      <span className="text-ink-soft group-hover:text-champagne transition-colors">GitHub</span>
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-champagne transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-surface-container border border-border flex items-center justify-center shrink-0">
                        <Linkedin className="w-4 h-4 text-champagne" />
                      </div>
                      <span className="text-ink-soft group-hover:text-champagne transition-colors">LinkedIn</span>
                    </a>
                  )}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div variants={fadeUp}>
                <Button asChild className="w-full bg-champagne text-surface-lowest hover:bg-champagne/90 font-medium transition-all duration-200 rounded-xl h-12 shadow-sm">
                  <Link href="/#contact">Work With Me</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Skills Cloud */}
          {skills.length > 0 && (
            <motion.div
              className="mt-14"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
                <Code className="w-5 h-5 text-champagne" />
                Skills & Technologies
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="px-3.5 py-1.5 rounded-full border border-border bg-surface-container text-platinum text-xs font-mono transition-all hover:border-champagne/40 hover:text-champagne cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
