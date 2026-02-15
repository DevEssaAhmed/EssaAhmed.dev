import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useNavigate } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  TrendingUp,
  Calendar,
  Folder,
  PenTool,
  Settings,
  CalendarRange
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HeroStatsManager from "@/components/admin/HeroStatsManager";
import SEOSettings from "@/components/admin/SEOSettings";
import YearlyNotesManager from "@/components/admin/YearlyNotesManager";
import SeedProjects from "@/components/SeedProjects";
import { getMarkdownExcerpt } from "@/lib/markdownUtils";
import AdminLayout from "@/components/admin/layout/AdminLayout";

const AdminPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: projectsData } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      const { data: blogData } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      setProjects(projectsData || []);
      setBlogPosts(blogData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading data");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error deleting project");
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      setBlogPosts(blogPosts.filter((p) => p.id !== id));
      toast.success("Blog post deleted successfully");
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Error deleting blog post");
    }
  };

  const totalViews =
    projects.reduce((sum, p) => sum + (p.views || 0), 0) + blogPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes =
    projects.reduce((sum, p) => sum + (p.likes || 0), 0) + blogPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const publishedPosts = blogPosts.filter((p) => p.published).length;

  // Skeleton for content list items
  const ContentSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border border-border/50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Stats skeleton
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back, manage your content">
      {/* Analytics Cards - Notion Style */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
          <Card className="hover:shadow-md transition-all duration-200 border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-muted-foreground">All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {totalLikes.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-muted-foreground">All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Published Posts</p>
                  <p className="text-2xl font-semibold text-foreground">{publishedPosts}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs">
                <span className="text-muted-foreground">{blogPosts.length - publishedPosts} drafts</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-semibold text-foreground">{projects.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Folder className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs">
                <span className="text-muted-foreground">{projects.filter(p => p.featured).length} featured</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Tabs - Notion Style */}
      <Tabs defaultValue="projects" className="space-y-8">
        <TabsList className="h-auto p-1 bg-muted rounded-lg">
          <TabsTrigger value="projects" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2 font-medium">
            <Folder className="w-4 h-4 mr-2" /> Projects
          </TabsTrigger>
          <TabsTrigger value="blog" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2 font-medium">
            <PenTool className="w-4 h-4 mr-2" /> Blog Posts
          </TabsTrigger>
          <TabsTrigger value="yearly-notes" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2 font-medium">
            <CalendarRange className="w-4 h-4 mr-2" /> Diary
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2 font-medium">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Projects</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Manage your portfolio projects ({projects.length} total)
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                  <Link href="/admin/project/new">
                    <Plus className="w-4 h-4 mr-2" /> New Project
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <ContentSkeleton />
              ) : projects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Create your first project to showcase your work to potential clients and collaborators.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/admin/project/new">
                      <Plus className="w-4 h-4 mr-2" /> Create Your First Project
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors duration-150 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground truncate">{project.title}</h3>
                            {project.featured && (
                              <Badge variant="secondary" className="text-xs">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {getMarkdownExcerpt(project.description || "", 120)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {project.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {project.likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <Button asChild size="sm" variant="ghost" aria-label={`Edit ${project.title}`}>
                            <Link href={`/admin/project/edit/${project.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="hover:text-destructive"
                                aria-label={`Delete ${project.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{project.title}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProject(project.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Posts Tab - Now consistent with Projects tab */}
        <TabsContent value="blog">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Blog Posts</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Manage your blog posts ({blogPosts.length} total)
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                  <Link href="/admin/blog/new">
                    <Plus className="w-4 h-4 mr-2" /> New Post
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <ContentSkeleton />
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <PenTool className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No blog posts yet</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start sharing your thoughts and experiences with your audience.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/admin/blog/new">
                      <Plus className="w-4 h-4 mr-2" /> Write Your First Post
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {blogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors duration-150 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                            <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {post.excerpt || getMarkdownExcerpt(post.content || "", 120)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {post.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {post.likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <Button asChild size="sm" variant="ghost" aria-label={`Edit ${post.title}`}>
                            <Link href={`/admin/blog/edit/${post.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="hover:text-destructive"
                                aria-label={`Delete ${post.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{post.title}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBlogPost(post.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly-notes">
          <YearlyNotesManager />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <HeroStatsManager />
            <SEOSettings />
            <SeedProjects />
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminPage;


