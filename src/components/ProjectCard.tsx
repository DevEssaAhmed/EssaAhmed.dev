import { OptimizedImage } from "@/components/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Github, Heart, MessageCircle, Eye } from "lucide-react";
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

const ProjectCard = ({ id, title, description, image, tags, category, demoUrl, githubUrl, views, likes, comments }: ProjectCardProps) => {
  const handleDemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (demoUrl) {
      window.open(demoUrl, '_blank');
    }
  };

  const handleTagClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleCodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (githubUrl) {
      window.open(githubUrl, '_blank');
    }
  };

  return (
    <Card
      className="group overflow-hidden bg-card shadow-card hover:shadow-glow transition-all duration-300 relative cursor-pointer card-focus"
      tabIndex={0}
      role="article"
    >
      <div className="relative h-full">
        <Link
          href={`/projects/${id}`}
          className="absolute inset-0 z-20"
          aria-label={`${title} project. ${getMarkdownExcerpt(description, 120)}`}
        />
        <div className="aspect-[16/10] w-full overflow-hidden">
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

        {/* Hover overlay — dimming only */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 z-10" />

        {/* Hover-only content — description, metrics, action buttons */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 text-white text-center px-5 pointer-events-none">
          <p className="text-sm text-white/90 mb-4 line-clamp-3 max-w-[90%]">{getMarkdownExcerpt(description, 120)}</p>

          {/* Engagement metrics */}
          <div className="flex justify-center gap-5 mb-4" role="group" aria-label="Project engagement metrics">
            <div className="flex items-center gap-1" aria-label={`${likes} likes`}>
              <Heart className="w-4 h-4 fill-white" aria-hidden="true" />
              <span className="text-sm font-medium">{likes}</span>
            </div>
            <div className="flex items-center gap-1" aria-label={`${comments} comments`}>
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{comments}</span>
            </div>
            <div className="flex items-center gap-1" aria-label={`${views} views`}>
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{views}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-2 pointer-events-auto" role="group" aria-label="Project actions">
            {githubUrl && (
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                onClick={handleCodeClick}
                aria-label={`View ${title} source code on GitHub`}
              >
                <Github className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Code
              </Button>
            )}
            {demoUrl && (
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                onClick={handleDemoClick}
                aria-label={`View ${title} live demo`}
              >
                <ExternalLink className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Demo
              </Button>
            )}
          </div>
        </div>

        {/* Bottom info bar — always visible with title + category + tags */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-4 px-4 transition-all duration-300 z-30 pointer-events-none" aria-label="Project metadata">
          <h3 className="font-bold text-white text-base mb-2 line-clamp-1">{title}</h3>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs" aria-label={`Category: ${category}`}>
              {category}
            </Badge>
            <div className="flex gap-1.5" role="list" aria-label="Project tags">
              {tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[11px] bg-white/10 text-white/80 border-white/20 backdrop-blur-sm pointer-events-none"
                  aria-label={`Tag: ${tag}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;


