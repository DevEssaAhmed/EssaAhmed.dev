"use client";
import { Folder, ArrowLeft, Pencil, Video, ExternalLink, Code2, Share2, Image, FileText } from "lucide-react";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { OptimizedImage } from "@/components/OptimizedImage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProjectTags } from "@/lib/tagUtils";
import { useAuth } from "@/contexts/AuthContext";

function tryConvertJsonToMarkdown(content: string): string {
  if (!content) return "";
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

const getImageBasename = (url?: string | null): string => {
  if (!url || typeof url !== "string") return "";
  return url.split("?")[0].split("#")[0].split("/").pop()?.trim().toLowerCase() || "";
};

function getProjectBodyMarkdown(project: any, uniqueImages: string[] = []): string {
  const longForm = project?.description_jsonb;
  if (Array.isArray(longForm) && longForm.length > 0) {
    let blocks = longForm;
    const firstBlock = blocks[0];
    if (firstBlock?.type === "image" && firstBlock?.props?.url) {
      const firstBasename = getImageBasename(firstBlock.props.url);
      const isDuplicate = uniqueImages.some(
        (img) => getImageBasename(img) === firstBasename
      );
      if (isDuplicate) {
        blocks = blocks.slice(1);
      }
    }
    return tryConvertJsonToMarkdown(JSON.stringify(blocks));
  }
  if (typeof longForm === "string" && longForm.trim()) {
    return tryConvertJsonToMarkdown(longForm);
  }
  return tryConvertJsonToMarkdown(project?.description || "");
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
};

const getVimeoEmbedUrl = (url: string) => {
  if (!url) return "";
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
};

type ProjectDetailPageProps = {
  initialProject?: any;
  initialProjectTags?: any[];
};

const ProjectDetailPage = ({
  initialProject,
  initialProjectTags,
}: ProjectDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState<any>(() => {
    if (!initialProject) return null;
    return initialProject;
  });
  const [projectTags, setProjectTags] = useState<any[]>(initialProjectTags ?? []);
  const [loading, setLoading] = useState(initialProject === undefined);

  const hasVideo = Boolean(
    project?.demo_video_url &&
      typeof project.demo_video_url === "string" &&
      project.demo_video_url.trim().length > 0
  );

  const [mediaView, setMediaView] = useState<"video" | "gallery">(
    hasVideo ? "video" : "gallery"
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Synchronize media view when project is loaded
  useEffect(() => {
    if (project?.demo_video_url && project.demo_video_url.trim()) {
      setMediaView("video");
    } else {
      setMediaView("gallery");
    }
  }, [project?.demo_video_url]);

  const fetchProject = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*, categories ( id, name, slug )")
        .eq("id", id)
        .single();
      if (error) throw error;
      if (data) {
        setProject(data);
        if (id) {
          const tags = await getProjectTags(id);
          setProjectTags(tags);
        }
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

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: project?.title,
        url: window.location.href,
      });
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Deduplicate all project images (combining image_url and additional_images)
  const uniqueImages = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    const addImage = (rawUrl?: string | null) => {
      if (!rawUrl || typeof rawUrl !== "string") return;
      const trimmed = rawUrl.trim();
      if (!trimmed || trimmed.includes("placeholder")) return;
      const basename = getImageBasename(trimmed) || trimmed;
      if (!seen.has(basename)) {
        seen.add(basename);
        list.push(trimmed);
      }
    };

    addImage(project?.image_url);
    if (Array.isArray(project?.additional_images)) {
      for (const img of project.additional_images) {
        addImage(img);
      }
    }
    return list;
  }, [project?.image_url, project?.additional_images]);

  const cleanedMarkdownBody = useMemo(() => {
    let raw = getProjectBodyMarkdown(project, uniqueImages);
    if (!raw) return "";

    // Remove leading markdown image if it duplicates any hero/gallery image
    const leadingImageMatch = raw.match(
      /^\s*(?:!\[[^\]]*\]\(([^)]+)\)|<img[^>]+src=["']([^"']+)["'][^>]*>)\s*/i
    );
    if (leadingImageMatch) {
      const matchedUrl = leadingImageMatch[1] || leadingImageMatch[2];
      const matchedBasename = getImageBasename(matchedUrl);
      const isDuplicate = uniqueImages.some(
        (img) => getImageBasename(img) === matchedBasename
      );
      if (isDuplicate) {
        raw = raw.slice(leadingImageMatch[0].length);
      }
    }
    return raw.trim();
  }, [project, uniqueImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between transition-colors duration-200">
        <Navigation />
        <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
          <div className="h-6 w-40 rounded-lg bg-surface-container animate-pulse" />
          <div className="h-12 w-3/4 rounded-xl bg-surface-container animate-pulse" />
          <div className="h-80 sm:h-96 w-full rounded-2xl bg-surface-container-low border border-outline-variant/30 animate-pulse" />
          <div className="h-64 w-full rounded-2xl bg-surface-container-low border border-outline-variant/30 animate-pulse" />
        </main>
        <OptimizedFooter />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between transition-colors duration-200">
        <Navigation />
        <main id="main-content" tabIndex={-1} className="max-w-md w-full mx-auto px-6 py-24 text-center">
          <div className="rounded-3xl bg-surface-container-low border border-outline-variant/30 p-8 shadow-xl space-y-4">
            <Folder aria-hidden="true" className="text-4xl text-primary h-9 w-9" />
            <h1 className="text-2xl font-display font-bold text-on-surface">
              Project Not Found
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              The requested project case study could not be found or may have been moved.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-on-surface text-surface text-xs font-semibold hover:opacity-90 transition-all"
            >
              <ArrowLeft aria-hidden="true" className="text-[16px] h-4 w-4" />
              <span>Back to Projects</span>
            </Link>
          </div>
        </main>
        <OptimizedFooter />
      </div>
    );
  }

  const currentImageUrl =
    uniqueImages[activeImageIndex] || project.image_url;

  const hasHeroVisual =
    Boolean(currentImageUrl && !String(currentImageUrl).includes("placeholder"));

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Top Breadcrumb & Authenticated Edit Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-code text-on-surface-variant hover:text-primary transition-colors group"
          >
            <ArrowLeft aria-hidden="true" className="text-[16px] group-hover:-translate-x-0.5 transition-transform h-4 w-4" />
            <span>Back to Projects</span>
          </Link>

          {isAdmin && (
            <Link
              href={`/admin/project/edit/${project.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs font-code text-primary hover:bg-primary/25 transition-colors"
            >
              <Pencil aria-hidden="true" className="text-[14px] h-3.5 w-3.5" />
              <span>Edit Project in CMS</span>
            </Link>
          )}
        </div>

        {/* Project Header */}
        <header className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            {project.categories?.name && (
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-code font-medium">
                {project.categories.name}
              </span>
            )}
            {project.featured && (
              <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/25 text-secondary text-xs font-code font-medium">
                ★ Featured Case Study
              </span>
            )}
            {project.created_at && (
              <span className="text-xs font-code text-outline">
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-on-surface tracking-tight leading-tight">
            {project.title}
          </h1>

          {/* Tags Row */}
          {projectTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {projectTags.map((tag: any) => (
                <span
                  key={tag.id || tag.name}
                  className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface-variant text-xs font-code"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons Strip */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {hasVideo && (
              <button
                type="button"
                onClick={() => {
                  setMediaView("video");
                  const el = document.getElementById("project-media");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-4 py-2.5 rounded-full border text-xs font-semibold inline-flex items-center gap-2 transition-all ${
                  mediaView === "video"
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-surface-container border-outline-variant/30 text-on-surface hover:text-primary hover:border-primary/40"
                }`}
              >
                <Video aria-hidden="true" className="text-[16px] h-4 w-4" />
                <span>Video Walkthrough</span>
              </button>
            )}

            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-on-surface text-surface text-xs font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <span>Live Demo / Dashboard</span>
                <ExternalLink aria-hidden="true" className="text-[16px] h-4 w-4" />
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-medium hover:bg-surface-container-high transition-all inline-flex items-center gap-1.5"
              >
                <Code2 aria-hidden="true" className="text-[16px] h-4 w-4" />
                <span>Source Code</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs font-medium transition-all inline-flex items-center gap-1.5"
            >
              <Share2 aria-hidden="true" className="text-[16px] h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Media Showcase: Video Walkthrough or Architecture Gallery */}
        {(hasVideo || hasHeroVisual) && (
          <section id="project-media" className="mb-10 space-y-4 scroll-mt-24">
            {/* If video exists, render sleek media mode tabs */}
            {hasVideo && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex p-1 rounded-full bg-surface-container-low border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setMediaView("video")}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      mediaView === "video"
                        ? "bg-on-surface text-surface shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <Video aria-hidden="true" className="text-[15px] h-[15px] w-[15px]" />
                    <span>Video Walkthrough</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaView("gallery")}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      mediaView === "gallery"
                        ? "bg-on-surface text-surface shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <Image aria-hidden="true" className="text-[15px] h-[15px] w-[15px]" />
                    <span>
                      Screenshots &amp; Architecture
                      {uniqueImages.length > 0 ? ` (${uniqueImages.length})` : ""}
                    </span>
                  </button>
                </div>

                {mediaView === "video" && project.demo_video_url && (
                  <a
                    href={project.demo_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-code text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink aria-hidden="true" className="text-[14px] h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Media Player or Screenshot Frame */}
            {hasVideo && mediaView === "video" ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-2xl">
                {project.demo_video_type === "youtube" ||
                project.demo_video_url.includes("youtube") ||
                project.demo_video_url.includes("youtu.be") ? (
                  <iframe
                    src={getYouTubeEmbedUrl(project.demo_video_url)}
                    title={`${project.title} Video Walkthrough`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  />
                ) : project.demo_video_type === "vimeo" ||
                  project.demo_video_url.includes("vimeo") ? (
                  <iframe
                    src={getVimeoEmbedUrl(project.demo_video_url)}
                    title={`${project.title} Video Walkthrough`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={project.demo_video_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : hasHeroVisual ? (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-2xl">
                  <OptimizedImage
                    src={currentImageUrl}
                    alt={project.title}
                    className="w-full max-h-[540px] object-contain mx-auto bg-surface-container-lowest"
                    priority
                    sizes="(max-width: 1024px) 100vw, 960px"
                  />
                </div>

                {/* Deduplicated Gallery Thumbnails - only shown if 2 or more distinct images */}
                {uniqueImages.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                    {uniqueImages.map((img, idx) => (
                      <button
                        key={img + idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIndex === idx
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-outline-variant/30 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <OptimizedImage
                          src={img}
                          alt={`${project.title} view ${idx + 1}`}
                          width={96}
                          height={64}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </section>
        )}

        {/* Case Study & Technical Analysis Body (Always rendered) */}
        <article className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 sm:p-10 shadow-xl">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/20">
            <FileText aria-hidden="true" className="text-primary text-xl h-5 w-5" />
            <h2 className="text-xs font-code uppercase tracking-wider text-on-surface-variant font-semibold">
              Case Study &amp; Technical Analysis
            </h2>
          </div>
          <MarkdownRenderer content={cleanedMarkdownBody} />
        </article>
      </main>

      <OptimizedFooter />
    </div>
  );
};

export default ProjectDetailPage;
