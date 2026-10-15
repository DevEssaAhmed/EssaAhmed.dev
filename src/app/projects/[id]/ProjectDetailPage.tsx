"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  Star,
  Share,
  Folder,
  Tag,
  Video,
  FileText,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProjectTags } from "@/lib/tagUtils";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Simple sync conversion from stored JSON blocks to markdown
function tryConvertJsonToMarkdown(content: string): string {
  try {
    const json = JSON.parse(content);
    if (!json || typeof json !== "object") return content;
    if (Array.isArray(json)) {
      return json
        .map((block: any) => {
          const text = Array.isArray(block.content)
            ? block.content.map((c: any) => c.text || "").join("")
            : typeof block.content === "string"
            ? block.content
            : "";
          switch (block.type) {
            case "heading":
              return `${"#".repeat(block.props?.level || 1)} ${text}`;
            case "bulletListItem":
              return `- ${text}`;
            case "numberedListItem":
              return `1. ${text}`;
            case "codeBlock":
              return `\`\`\`${block.props?.language || ""}\n${text}\n\`\`\``;
            case "image":
              return `![${block.props?.caption || ""}](${block.props?.url || ""})`;
            default:
              return text;
          }
        })
        .join("\n\n");
    }
    return content;
  } catch {
    return content;
  }
}

// Clean embed video link parsers
const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const getVimeoEmbedUrl = (url: string) => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
};

type ProjectDetailPageProps = {
  initialProject?: any;
  initialProjectTags?: any[];
};

const ProjectDetailPage = ({ initialProject, initialProjectTags }: ProjectDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(initialProject ?? null);
  const [projectTags, setProjectTags] = useState<any[]>(initialProjectTags ?? []);
  const [loading, setLoading] = useState(initialProject === undefined);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

  const fetchProject = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`*, categories ( id, name, slug )`)
        .eq("id", id)
        .single();
      if (error) throw error;
      if (data) {
        const md = data.description ? tryConvertJsonToMarkdown(data.description) : "";
        setProject({ ...data, description: md, originalDescription: data.description });
        if (id) {
          const tags = await getProjectTags(id);
          setProjectTags(tags);
        }
        await supabase
          .from("projects")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Project not found");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (initialProject === undefined && id) {
      fetchProject();
    }
  }, [id, initialProject, fetchProject]);

  const handleLike = async () => {
    if (!project) return;
    try {
      const newLikeCount = isLiked ? (project.likes || 0) - 1 : (project.likes || 0) + 1;
      await supabase.from("projects").update({ likes: newLikeCount }).eq("id", project.id);
      setProject({ ...project, likes: newLikeCount });
      setIsLiked(!isLiked);
      toast.success(isLiked ? "Like removed" : "Project liked!");
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({ title: project?.title, text: project?.description, url: window.location.href });
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Loading skeleton in Executive Editorial dark theme
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-canvas text-foreground">
        <Navigation />
        <div className="pt-24 lg:pt-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
            <Skeleton className="h-8 w-36 bg-surface-high rounded-xl mb-8" />
            <Skeleton className="h-80 sm:h-96 w-full rounded-2xl bg-surface-low border border-border mb-8" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-4 w-28 bg-surface-high" />
              <Skeleton className="h-4 w-20 bg-surface-high" />
              <Skeleton className="h-4 w-16 bg-surface-high" />
            </div>
            <Skeleton className="h-10 sm:h-12 w-3/4 bg-surface-high rounded-xl mb-4" />
            <Skeleton className="h-6 w-1/3 bg-surface-high rounded-xl mb-8" />
            <div className="h-96 w-full rounded-2xl bg-surface-low border border-border" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found state in Executive Editorial styling
  if (!project) {
    return (
      <div className="min-h-screen bg-surface-canvas text-foreground flex flex-col justify-between">
        <Navigation />
        <div className="pt-28 pb-16 flex items-center justify-center px-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-surface-low border border-border text-center shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-high border border-border flex items-center justify-center">
              <Folder className="w-8 h-8 text-champagne" aria-hidden="true" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Case Study Not Found</h2>
            <p className="text-sm text-ink-soft mb-6 font-light leading-relaxed">
              The requested analytics engineering project could not be located.
            </p>
            <Button asChild className="bg-champagne hover:bg-white text-[#090c13] font-semibold rounded-xl px-6 h-11 transition-all">
              <Link href="/projects">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Case Studies
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const plainTextDescription = (project.description || "").replace(/[#*_`>\-\[\]]/g, "").slice(0, 160);

  // Active showcase visual: either currently selected gallery image or main image
  const currentImageUrl =
    selectedImageIndex >= 0 && project.additional_images?.[selectedImageIndex]
      ? project.additional_images[selectedImageIndex]
      : project.image_url;

  return (
    <div className="min-h-screen bg-surface-canvas text-foreground selection:bg-champagne/20 selection:text-champagne relative">
      <Navigation />
      <SEO
        title={(project as any).og_title || project.title}
        description={(project as any).og_description || plainTextDescription}
        image={(project as any).og_image || project.image_url || undefined}
        url={`/projects/${project.id}`}
        type="website"
      />

      {/* Ambient background spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-spotlight pointer-events-none opacity-30"
        aria-hidden="true"
      />

      <div className="pt-24 lg:pt-28 relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 sm:py-12">
          {/* Back Navigation Breadcrumb */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono text-ink-muted hover:text-champagne transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-champagne" />
            <span>Back to All Case Studies</span>
          </Link>

          {/* Visual Showcase Panel */}
          {(project.image_url || project.additional_images?.length > 0) && (
            <div className="mb-10 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-surface-lowest shadow-2xl">
                <OptimizedImage
                  src={currentImageUrl || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-64 sm:h-96 lg:h-[480px] object-cover object-top"
                  loading="eager"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-canvas/90 via-transparent to-transparent pointer-events-none" />

                {project.featured && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-champagne text-[#090c13] font-mono text-xs font-semibold shadow-md">
                      <Star className="w-3.5 h-3.5 fill-current" /> Featured Case Study
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery Image Switcher */}
              {project.additional_images && project.additional_images.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-champagne-dim" aria-hidden="true" />
                    <span>Project Visuals &amp; Dashboard Telemetry</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {project.image_url && (
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex(-1)}
                        aria-label="View primary project image"
                        className={`relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImageIndex === -1
                            ? "border-champagne ring-2 ring-champagne/30"
                            : "border-border opacity-70 hover:opacity-100 hover:border-champagne/40"
                        }`}
                      >
                        <OptimizedImage
                          src={project.image_url}
                          alt="Primary project visual thumbnail"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    )}
                    {project.additional_images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        aria-label={`View gallery slide ${idx + 1}`}
                        className={`relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? "border-champagne ring-2 ring-champagne/30"
                            : "border-border opacity-70 hover:opacity-100 hover:border-champagne/40"
                        }`}
                      >
                        <OptimizedImage
                          src={img}
                          alt={`Gallery slide ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Header & Telemetry Strip */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-ink-muted mb-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-champagne-dim" aria-hidden="true" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-200" aria-hidden="true" />
                <span>{(project.views || 0) + 1} views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-metric" aria-hidden="true" />
                <span>{project.likes || 0} likes</span>
              </div>
              {project.comments > 0 && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-tertiary" aria-hidden="true" />
                  <span>{project.comments} comments</span>
                </div>
              )}
            </div>

            {/* Category Eyebrow */}
            {project.categories && (
              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-4 h-4 text-champagne-dim" aria-hidden="true" />
                <span className="px-3 py-1 rounded-full bg-surface-high border border-border font-mono text-xs text-champagne">
                  {project.categories.name}
                </span>
              </div>
            )}

            {/* Editorial Title */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              {project.title}
            </h1>

            {/* Tags Cloud */}
            {projectTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <Tag className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                {projectTags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-0.5 rounded-lg bg-surface-high/80 text-ink-soft font-mono text-xs border border-border"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {project.demo_url && (
              <Button
                onClick={() => window.open(project.demo_url, "_blank")}
                className="bg-champagne hover:bg-white text-[#090c13] font-semibold transition-all shadow-soft rounded-xl px-5 h-11"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Live Demo / Dashboard
              </Button>
            )}
            {project.github_url && (
              <Button
                onClick={() => window.open(project.github_url, "_blank")}
                variant="outline"
                className="bg-surface-high border border-border text-foreground hover:border-champagne/40 hover:text-champagne transition-all rounded-xl px-5 h-11"
              >
                <Github className="w-4 h-4 mr-2" /> Source Code
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleLike}
              className={`bg-surface-high border border-border transition-all rounded-xl px-4 h-11 ${
                isLiked
                  ? "text-red-400 border-red-500/40 bg-red-950/20"
                  : "text-ink-soft hover:text-white hover:border-border/80"
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "Liked" : "Like"}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="bg-surface-high border border-border text-ink-soft hover:text-white rounded-xl px-4 h-11 transition-all"
            >
              <Share className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>

          {/* Tabbed Content: Architectural Overview vs Demo Video */}
          <Tabs defaultValue="description" className="mb-14">
            <div className="flex items-center justify-start mb-6">
              <TabsList className="inline-flex p-1.5 rounded-xl bg-surface-high border border-border gap-1.5">
                <TabsTrigger
                  value="description"
                  className="font-mono text-xs px-4 py-2 rounded-lg data-[state=active]:bg-surface-lowest data-[state=active]:text-champagne data-[state=active]:shadow-sm text-ink-soft hover:text-white transition-all flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  Technical Analysis &amp; Brief
                </TabsTrigger>
                {project.demo_video_url && (
                  <TabsTrigger
                    value="demo"
                    className="font-mono text-xs px-4 py-2 rounded-lg data-[state=active]:bg-surface-lowest data-[state=active]:text-champagne data-[state=active]:shadow-sm text-ink-soft hover:text-white transition-all flex items-center gap-2"
                  >
                    <Video className="w-3.5 h-3.5" aria-hidden="true" />
                    Walkthrough Video
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Markdown Case Study Body */}
            <TabsContent value="description" className="mt-0">
              <div className="rounded-2xl border border-border bg-surface-low p-6 sm:p-8 lg:p-10 shadow-xl">
                <div className="prose prose-invert prose-lg max-w-none text-platinum/90 leading-relaxed font-sans prose-headings:font-display prose-headings:text-white prose-headings:font-bold prose-h2:text-2xl prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-3 prose-h3:text-xl prose-a:text-champagne hover:prose-a:underline prose-code:font-mono prose-code:text-champagne prose-code:bg-surface-high prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-lowest prose-pre:border prose-pre:border-border">
                  <MarkdownRenderer content={project.description || ""} />
                </div>
              </div>
            </TabsContent>

            {/* Video Walkthrough Embed */}
            {project.demo_video_url && (
              <TabsContent value="demo" className="mt-0">
                <div className="rounded-2xl border border-border bg-surface-low p-6 sm:p-8 shadow-xl">
                  <div className="aspect-video rounded-xl overflow-hidden bg-surface-lowest border border-border">
                    {project.demo_video_type === "youtube" ||
                    project.demo_video_url.includes("youtube") ||
                    project.demo_video_url.includes("youtu.be") ? (
                      <iframe
                        src={getYouTubeEmbedUrl(project.demo_video_url)}
                        title={`${project.title} Walkthrough Video`}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : project.demo_video_type === "vimeo" || project.demo_video_url.includes("vimeo") ? (
                      <iframe
                        src={getVimeoEmbedUrl(project.demo_video_url)}
                        title={`${project.title} Walkthrough Video`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video src={project.demo_video_url} controls className="w-full h-full" />
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
