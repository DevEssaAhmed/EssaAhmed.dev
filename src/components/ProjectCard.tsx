import { OptimizedImage } from "@/components/OptimizedImage";
import { ArrowRight, ExternalLink, Eye, Github, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { getMarkdownExcerpt } from "@/lib/markdownUtils";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  demoUrl?: string;
  githubUrl?: string;
  views: number;
  likes: number;
  comments: number;
}

/** Editorial case-study card (Executive Editorial design system). */
const ProjectCard = ({ id, title, description, image, tags = [], category, demoUrl, githubUrl, views, likes, comments }: ProjectCardProps) => {
  return (
    <article
      className="group relative flex flex-col h-full justify-between overflow-hidden rounded-2xl bg-surface-low border border-border hover:border-metric/40 shadow-xl transition-all duration-500 focus-within:ring-2 focus-within:ring-champagne/60 focus-within:border-champagne/40"
    >
      <Link
        href={`/projects/${id}`}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none"
        aria-label={`View case study: ${title}. ${getMarkdownExcerpt(description, 120)}`}
      />

      {/* Visual panel */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-lowest border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-champagne/5 via-transparent to-transparent pointer-events-none z-[1]" />
        <OptimizedImage
          src={image}
          alt={`${title} project thumbnail`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          width="800"
          height="500"
        />
      </div>

      {/* Editorial summary */}
      <div className="flex flex-1 flex-col justify-between p-6 lg:p-7">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-full bg-surface-high border border-border font-mono text-[11px] tracking-wider text-champagne"
              aria-label={`Category: ${category}`}
            >
              {category}
            </span>
            {(tags || []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded bg-surface-highest/80 border border-border/60 text-ink-soft font-mono text-[11px]"
                aria-label={`Tag: ${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="font-display text-xl font-bold text-white tracking-tight group-hover:text-champagne transition-colors mb-3 leading-snug line-clamp-2 min-h-[3.25rem]">
            {title}
          </h3>
          <p className="text-[14px] text-ink-soft leading-relaxed font-light line-clamp-3">
            {getMarkdownExcerpt(description, 140)}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div
            className="flex items-center gap-4 font-mono text-xs text-ink-muted"
            role="group"
            aria-label="Project engagement metrics"
          >
            <span className="flex items-center gap-1.5" aria-label={`${views} views`}>
              <Eye className="w-4 h-4 text-blue-200" aria-hidden="true" /> {views}
            </span>
            <span className="flex items-center gap-1.5" aria-label={`${likes} likes`}>
              <Heart className="w-4 h-4 text-metric" aria-hidden="true" /> {likes}
            </span>
            <span className="flex items-center gap-1.5" aria-label={`${comments} comments`}>
              <MessageCircle className="w-4 h-4" aria-hidden="true" /> {comments}
            </span>
          </div>

          <div className="relative z-20 flex items-center gap-3" role="group" aria-label="Project actions">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-ink-soft hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne transition-colors"
                aria-label={`View ${title} source code on GitHub`}
              >
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-ink-soft hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne transition-colors"
                aria-label={`View ${title} live demo`}
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
            <span className="inline-flex items-center gap-1.5 text-champagne group-hover:text-white text-sm font-medium transition-colors pointer-events-none">
              Explore
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
