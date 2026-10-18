"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import MarkdownRenderer from "@/components/MarkdownRenderer";
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

function getProjectBodyMarkdown(project: any): string {
  const longForm = project?.description_jsonb;
  if (Array.isArray(longForm) && longForm.length > 0) {
    return tryConvertJsonToMarkdown(JSON.stringify(longForm));
  }
  if (typeof longForm === "string" && longForm.trim()) {
    return tryConvertJsonToMarkdown(longForm);
  }
  return tryConvertJsonToMarkdown(project?.description || "");
}

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
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

const ProjectDetailPage = ({
  initialProject,
  initialProjectTags,
}: ProjectDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(() => {
    if (!initialProject) return null;
    return initialProject;
  });
  const [projectTags, setProjectTags] = useState<any[]>(initialProjectTags ?? []);
  const [loading, setLoading] = useState(initialProject === undefined);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<"description" | "demo">("description");

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

  // Increment view count once on client mount
  useEffect(() => {
    if (!project?.id) return;
    supabase
      .from("projects")
      .update({ views: (project.views || 0) + 1 })
      .eq("id", project.id)
      .then(() => {});
  }, [project?.id]);

  const handleLike = async () => {
    if (!project) return;
    try {
      const newLikeCount = isLiked
        ? Math.max(0, (project.likes || 0) - 1)
        : (project.likes || 0) + 1;
      await supabase
        .from("projects")
        .update({ likes: newLikeCount })
        .eq("id", project.id);
      setProject({ ...project, likes: newLikeCount });
      setIsLiked(!isLiked);
      toast.success(isLiked ? "Like removed" : "Project liked!");
    } catch {
      toast.error("Failed to update like");
    }
  };

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

  const cleanedMarkdownBody = useMemo(() => {
    const raw = getProjectBodyMarkdown(project);
    if (!raw) return "";
    // If the markdown starts with an image that is identical to project.image_url, avoid rendering it twice
    if (project?.image_url) {
      return raw.replace(
        new RegExp(
          `^\\s*!\\[[^\\]]*\\]\\(${project.image_url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)\\s*`
        ),
        ""
      );
    }
    return raw;
  }, [project?.description_jsonb, project?.description, project?.image_url]);

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
            <span className="material-symbols-outlined text-4xl text-primary">
              folder_off
            </span>
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
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              <span>Back to Projects</span>
            </Link>
          </div>
        </main>
        <OptimizedFooter />
      </div>
    );
  }

  const currentImageUrl =
    selectedImageIndex >= 0 && project.additional_images?.[selectedImageIndex]
      ? project.additional_images[selectedImageIndex]
      : project.image_url;

  const hasHeroVisual =
    currentImageUrl && !String(currentImageUrl).includes("placeholder");

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
            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to Projects</span>
          </Link>

          {user && (
            <Link
              href={`/admin/project/edit/${project.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs font-code text-primary hover:bg-primary/25 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
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
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-on-surface text-surface text-xs font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <span>Live Demo / Dashboard</span>
                <span className="material-symbols-outlined text-[16px]">
                  open_in_new
                </span>
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-medium hover:bg-surface-container-high transition-all inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">code</span>
                <span>Source Code</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleLike}
              className={`px-4 py-2.5 rounded-full border text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
                isLiked
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                  : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                favorite
              </span>
              <span>{project.likes || 0}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs font-medium transition-all inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Primary Visual Showcase & Gallery Thumbnails */}
        {hasHeroVisual && (
          <section className="mb-10 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-2xl">
              <img
                src={currentImageUrl}
                alt={project.title}
                className="w-full max-h-[540px] object-contain mx-auto bg-surface-container-lowest"
              />
            </div>

            {Array.isArray(project.additional_images) &&
              project.additional_images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {project.image_url && (
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(-1)}
                      className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === -1
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-outline-variant/30 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={project.image_url}
                        alt="Primary preview"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                  {project.additional_images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-outline-variant/30 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Gallery view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
          </section>
        )}

        {/* Optional Video Switcher if Project has a Demo Video */}
        {project.demo_video_url && (
          <div className="inline-flex p-1 rounded-full bg-surface-container-low border border-outline-variant/30 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={
                activeTab === "description"
                  ? "px-4 py-1.5 rounded-full bg-on-surface text-surface text-xs font-semibold transition-all"
                  : "px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface text-xs font-medium transition-colors"
              }
            >
              Case Study &amp; Documentation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("demo")}
              className={
                activeTab === "demo"
                  ? "px-4 py-1.5 rounded-full bg-on-surface text-surface text-xs font-semibold transition-all"
                  : "px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface text-xs font-medium transition-colors"
              }
            >
              Video Walkthrough
            </button>
          </div>
        )}

        {/* Case Study Body or Video Walkthrough */}
        {activeTab === "demo" && project.demo_video_url ? (
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 sm:p-8 shadow-xl">
            <div className="aspect-video rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30">
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
              ) : project.demo_video_type === "vimeo" ||
                project.demo_video_url.includes("vimeo") ? (
                <iframe
                  src={getVimeoEmbedUrl(project.demo_video_url)}
                  title={`${project.title} Walkthrough Video`}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video
                  src={project.demo_video_url}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>
          </section>
        ) : (
          <article className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 sm:p-10 shadow-xl">
            <MarkdownRenderer content={cleanedMarkdownBody} />
          </article>
        )}
      </main>

      <OptimizedFooter />
    </div>
  );
};

export default ProjectDetailPage;
