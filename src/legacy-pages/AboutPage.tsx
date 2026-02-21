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
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Profile not found.</p>
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <SEO
        title={`About ${fullName}`}
        description={bio.substring(0, 160) || `${fullName} — ${profile.title}`}
        image={avatar}
        url="/about"
        type="website"
      />

      <div className="pt-20">

        {/* ── Hero section ── */}
        <section className="relative py-16 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto">
            <motion.div
              className="flex flex-col lg:flex-row items-center gap-10"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {/* Avatar */}
              <motion.div variants={fadeUp} className="shrink-0 relative">
                <div className="w-36 h-36 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background overflow-hidden shadow-glow">
                  <OptimizedImage
                    src={avatar}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
              </motion.div>

              {/* Text */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Available for Analytics Roles
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-4xl lg:text-6xl font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent mb-3">
                  {fullName}
                </motion.h1>

                {profile.title && (
                  <motion.p variants={fadeUp} className="text-lg font-medium text-primary mb-4">{profile.title}</motion.p>
                )}

                {bio && (
                  <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mb-6 leading-relaxed">{bio}</motion.p>
                )}

                {/* Meta info */}
                <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-6">
                  {profile.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />{profile.location}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                </motion.div>

                {/* Social Links */}
                <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith("mailto") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 text-sm font-medium transition-all duration-200 ${link.color}`}
                      >
                        <Icon className="w-4 h-4" />
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

        {/* ── Main content split ── */}
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
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  My Story
                </h2>
                {aboutMarkdown ? (
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <MarkdownRenderer content={aboutMarkdown} />
                  </div>
                ) : bio ? (
                  <p className="text-muted-foreground leading-relaxed">{bio}</p>
                ) : (
                  <p className="text-muted-foreground italic">No about content yet.</p>
                )}

                <div className="mt-8 p-5 rounded-xl border border-primary/20 bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-2">
                    I keep a quiet public diary of ongoing experiments and reflections.
                  </p>
                  <Link href="/diary" className="text-sm font-semibold text-primary hover:underline">
                    Read the diary →
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
              <motion.div variants={fadeUp} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
                <h3 className="text-base font-semibold mb-4">Contact</h3>
                <div className="space-y-3">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-primary transition-colors truncate">{profile.email}</span>
                    </a>
                  )}
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0">
                        <Github className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">GitHub</span>
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Linkedin className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">LinkedIn</span>
                    </a>
                  )}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div variants={fadeUp}>
                <Button asChild className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 rounded-xl h-12">
                  <Link href="/#contact">Work With Me</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* ── Skills Cloud ── */}
          {skills.length > 0 && (
            <motion.div
              className="mt-14"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Skills & Technologies
              </h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm hover:bg-primary/20 cursor-default"
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
