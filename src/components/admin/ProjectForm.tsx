import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import MediaPreview from "@/components/MediaPreview";
import { getAllCategories } from "@/lib/tagUtils";

interface ProjectFormProps {
  project?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectForm = ({ project, onClose, onSuccess }: ProjectFormProps) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    image_url: "",
    additional_images: [] as string[],
    demo_url: "",
    demo_video_url: "",
    demo_video_type: "",
    github_url: "",
    featured: false,
  });

  useEffect(() => {
    loadCategories();
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        category_id: project.category_id || "",
        image_url: project.image_url || "",
        additional_images: project.additional_images || [],
        demo_url: project.demo_url || "",
        demo_video_url: project.demo_video_url || "",
        demo_video_type: project.demo_video_type || "",
        github_url: project.github_url || "",
        featured: project.featured || false,
      });
    }
  }, [project]);

  const loadCategories = async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories);
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, image_url: urls[0] }));
    }
  };

  const handleAdditionalImagesUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, additional_images: urls }));
  };

  const handleDemoVideoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        demo_video_url: urls[0],
        demo_video_type: 'file'
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    if (index === -1) {
      // Remove main image
      setFormData(prev => ({ ...prev, image_url: "" }));
    } else {
      // Remove from additional images
      setFormData(prev => ({
        ...prev,
        additional_images: prev.additional_images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleRemoveVideo = () => {
    setFormData(prev => ({ 
      ...prev, 
      demo_video_url: "",
      demo_video_type: "youtube"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      title: formData.title,
      description: formData.description,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      additional_images: formData.additional_images,
      demo_url: formData.demo_url || null,
      demo_video_url: formData.demo_video_url || null,
      demo_video_type: formData.demo_video_type,
      github_url: formData.github_url || null,
      featured: formData.featured,
    };

    try {
      if (project) {
        // Update existing project
        await supabase
          .from("projects")
          .update(projectData)
          .eq("id", project.id);
        toast({ title: "Project updated successfully" });
      } else {
        // Create new project
        await supabase
          .from("projects")
          .insert([projectData]);
        toast({ title: "Project created successfully" });
      }
      onSuccess();
    } catch (error: any) {
      toast({ 
        title: "Error saving project", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{project ? "Edit Project" : "Add New Project"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Media Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Media</h3>
              
              {/* Project Image Upload */}
              <FileUpload
                label="Project Image"
                uploadType="image"
                onUploadComplete={handleImageUpload}
                maxFiles={1}
                existingFiles={formData.image_url ? [formData.image_url] : []}
              />
              
              {/* Preview main image */}
              {formData.image_url && (
                <div>
                  <Label>Current Project Image</Label>
                  <MediaPreview 
                    files={[formData.image_url]} 
                    type="image" 
                    onRemove={() => handleRemoveImage(-1)}
                  />
                </div>
              )}

              {/* Additional Images */}
              <FileUpload
                label="Additional Images"
                uploadType="image"
                onUploadComplete={handleAdditionalImagesUpload}
                maxFiles={5}
                existingFiles={formData.additional_images}
              />
              
              {/* Preview additional images */}
              {formData.additional_images.length > 0 && (
                <div>
                  <Label>Additional Images</Label>
                  <MediaPreview 
                    files={formData.additional_images} 
                    type="image" 
                    onRemove={handleRemoveImage}
                  />
                </div>
              )}

              {/* Demo Video Upload */}
              <FileUpload
                label="Demo Video (Optional)"
                uploadType="video"
                onUploadComplete={handleDemoVideoUpload}
                maxFiles={1}
                existingFiles={formData.demo_video_url ? [formData.demo_video_url] : []}
              />
              
              {/* Preview demo video */}
              {formData.demo_video_url && (
                <div>
                  <Label>Demo Video</Label>
                  <MediaPreview 
                    files={[formData.demo_video_url]} 
                    type="video" 
                    onRemove={handleRemoveVideo}
                  />
                </div>
              )}

              {/* Fallback URL Input */}
              <div>
                <Label htmlFor="image_url">Image URL (Alternative)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="demo_url">Demo URL</Label>
              <Input
                id="demo_url"
                type="url"
                value={formData.demo_url}
                onChange={(e) => setFormData({...formData, demo_url: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({...formData, github_url: e.target.value})}
              />
            </div>


            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
              />
              <Label htmlFor="featured">Featured Project</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {project ? "Update" : "Create"} Project
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectForm;
