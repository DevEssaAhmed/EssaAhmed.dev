import { OptimizedImage } from "@/components/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Github, Heart, MessageCircle, Eye } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
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
  const navigate = useNavigate();

  const handleProjectClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/projects/${id}`);
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demoUrl) {
      window.open(demoUrl, '_blank');
    }
  };

  const handleTagClick = (e: React.MouseEvent | React.KeyboardEvent, tag: string) => {
    e.stopPropagation();
    // Navigate to the tag detail page
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    navigate(`/tags/${encodeURIComponent(tagSlug)}`);
  };

  const handleCodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (githubUrl) {
      window.open(githubUrl, '_blank');
    }
  };

  return (
    <Card 
      className="group overflow-hidden bg-card shadow-card hover:shadow-glow transition-all duration-300 aspect-square relative cursor-pointer card-focus"
      onClick={handleProjectClick}
      tabIndex={0}
      role="article"
      aria-label={`${title} project. ${getMarkdownExcerpt(description, 120)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/projects/${id}`);
        }
      }}
    >
      <div className="relative h-full">
        <OptimizedImage
          src={image}
          alt={`${title} project thumbnail`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          width="443"
          height="443"
        />
        
        {/* Instagram-style overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-white/90 mb-4 line-clamp-3">{getMarkdownExcerpt(description, 120)}</p>
            
            {/* Instagram-style engagement metrics */}
            <div className="flex justify-center gap-6 mb-4" role="group" aria-label="Project engagement metrics">
              <div className="flex items-center gap-1" aria-label={`${likes} likes`}>
                <Heart className="w-5 h-5 fill-white" aria-hidden="true" />
                <span className="text-sm font-medium">{likes}</span>
              </div>
              <div className="flex items-center gap-1" aria-label={`${comments} comments`}>
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">{comments}</span>
              </div>
              <div className="flex items-center gap-1" aria-label={`${views} views`}>
                <Eye className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">{views}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-2" role="group" aria-label="Project actions">
              {githubUrl && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={handleCodeClick}
                  aria-label={`View ${title} source code on GitHub`}
                >
                  <Github className="w-4 h-4 mr-2" aria-hidden="true" />
                  Code
                </Button>
              )}
              {demoUrl && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={handleDemoClick}
                  aria-label={`View ${title} live demo`}
                >
                  <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                  Demo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom info bar - always visible */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4" aria-label="Project metadata">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm" aria-label={`Category: ${category}`}>
              {category}
            </Badge>
            <div className="flex gap-2" role="list" aria-label="Project tags">
              {tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs bg-white/10 text-white border-white/30 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-white"
                  onClick={(e) => handleTagClick(e, tag)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTagClick(e, tag);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Filter by ${tag} tag`}
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


