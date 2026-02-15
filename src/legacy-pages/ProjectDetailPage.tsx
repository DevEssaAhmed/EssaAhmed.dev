"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useNavigate } from "@/lib/router-compat";
import Navigation from "@/components/Navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ExternalLink, Github, Calendar, Eye, Heart, MessageSquare, Star, Share, Play, Image as ImageIcon, Maximize2, Folder, Tag, Code2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProjectTags } from '@/lib/tagUtils';
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Simple sync conversion from stored JSON blocks to markdown
function tryConvertJsonToMarkdown(content: string): string {
  try {
    const json = JSON.parse(content);
    if (!json || typeof json !== 'object') return content;
    // If it's BlockNote format (array of blocks), convert to basic markdown
    if (Array.isArray(json)) {
      return json.map((block: any) => {
        const text = Array.isArray(block.content) 
          ? block.content.map((c: any) => c.text || '').join('')
          : (typeof block.content === 'string' ? block.content : '');
        switch (block.type) {
          case 'heading': return `${'#'.repeat(block.props?.level || 1)} ${text}`;
          case 'bulletListItem': return `- ${text}`;
          case 'numberedListItem': return `1. ${text}`;
          case 'codeBlock': return `\`\`\`${block.props?.language || ''}\n${text}\n\`\`\``;
          case 'image': return `![${block.props?.caption || ''}](${block.props?.url || ''})`;
          default: return text;
        }
      }).join('\n\n');
    }
    return content;
  } catch {
    return content;
  }
}

type ProjectDetailPageProps = { initialProject?: any; initialProjectTags?: any[] };

const ProjectDetailPage = ({ initialProject, initialProjectTags }: ProjectDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(initialProject ?? null);
  const [projectTags, setProjectTags] = useState<any[]>(initialProjectTags ?? []);
  const [loading, setLoading] = useState(initialProject === undefined);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialProject === undefined && id) fetchProject(); }, [id, initialProject]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`*, categories ( id, name, slug )`)
        .eq("id", id)
        .single();
      if (error) throw error;
      if (data) {
        const md = data.description ? tryConvertJsonToMarkdown(data.description) : '';
        setProject({ ...data, description: md, originalDescription: data.description });
        if (id) {
          const tags = await getProjectTags(id);
          setProjectTags(tags);
        }
        await supabase.from("projects").update({ views: (data.views || 0) + 1 }).eq("id", data.id);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Project not found");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

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
    if (navigator.share) {
      navigator.share({ title: project.title, text: project.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-8">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-10 w-3/5 mb-4" />
            <Skeleton className="h-5 w-1/2 mb-6" />
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Project not found</h2>
            <Button asChild> <Link href="/projects"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const description = (project.description || '').replace(/[#*_`>\-\[\]]/g, '').slice(0, 160);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SEO
        title={(project as any).og_title || project.title}
        description={(project as any).og_description || description}
        image={(project as any).og_image || project.image_url || undefined}
        url={`/projects/${project.id}`}
        type="website"
      />
      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button asChild variant="ghost" className="mb-6 hover:shadow-soft transition-all duration-300">
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
            </Link>
          </Button>
          {(project.image_url || project.additional_images?.length > 0) && (
            <div className="mb-8">
              {project.additional_images?.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-glow">
                    <OptimizedImage src={selectedImageIndex === -1 ? project.image_url : project.additional_images[selectedImageIndex]} alt={project.title} className="w-full h-64 lg:h-96 object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {project.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-primary text-white shadow-soft"><Star className="w-3 h-3 mr-1" /> Featured</Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {project.image_url && (
                      <button onClick={() => setSelectedImageIndex(-1)} className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === -1 ? 'border-primary' : 'border-transparent'}`}>
                        <OptimizedImage src={project.image_url} alt="Main" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    )}
                    {project.additional_images.map((img: string, idx: number) => (
                      <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-primary' : 'border-transparent'}`}>
                        <OptimizedImage src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden shadow-glow">
                  <OptimizedImage src={project.image_url} alt={project.title} className="w-full h-64 lg:h-96 object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {project.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-primary text-white shadow-soft"><Star className="w-3 h-3 mr-1" /> Featured</Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(project.created_at).toLocaleDateString()}</div>
            <div className="flex items-center gap-1"><Eye className="w-4 h-4" />{(project.views || 0) + 1} views</div>
            <div className="flex items-center gap-1"><Heart className="w-4 h-4" />{project.likes || 0} likes</div>
            {project.comments > 0 && (<div className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{project.comments} comments</div>)}
          </div>

          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">{project.title}</h1>
            {project.categories && (
              <div className="flex items-center gap-2 mb-4">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary">{project.categories.name}</Badge>
              </div>
            )}
            {projectTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {projectTags.map((tag: any) => (
                  <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.name.toLowerCase().replace(/\s+/g, "-"))}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            {project.demo_url && (
              <Button onClick={() => window.open(project.demo_url, '_blank')} className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
              </Button>
            )}
            {project.github_url && (
              <Button onClick={() => window.open(project.github_url, '_blank')} variant="outline">
                <Github className="w-4 h-4 mr-2" /> Source Code
              </Button>
            )}
            <Button variant="outline" onClick={handleLike} className={isLiked ? 'text-red-500 border-red-500' : ''}>
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />{isLiked ? 'Liked' : 'Like'}
            </Button>
            <Button variant="outline" onClick={handleShare}><Share className="w-4 h-4 mr-2" /> Share</Button>
          </div>

          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              {project.demo_video_url && (<TabsTrigger value="demo">Demo Video</TabsTrigger>)}
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <MarkdownRenderer content={project.description || ''} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {project.demo_video_url && (
              <TabsContent value="demo" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      {project.demo_video_type === 'youtube' ? (
                        <iframe src={`https://www.youtube.com/embed/${project.demo_video_url.split('/').pop()}`} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                      ) : project.demo_video_type === 'vimeo' ? (
                        <iframe src={`https://player.vimeo.com/video/${project.demo_video_url.split('/').pop()}`} className="w-full h-full" allowFullScreen />
                      ) : (
                        <video src={project.demo_video_url} controls className="w-full h-full" />
                      )}
                    </div>
                  </CardContent>
                </Card>
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







