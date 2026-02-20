import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNavigate } from "@/lib/router-compat";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  User,
  Save,
  X,
  Plus,
  MapPin,
  Mail,
  Github,
  Linkedin,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";
import { useProfile } from "@/contexts/ProfileContext";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import BlockNoteEditorComponent, { BlockNoteContent, markdownToBlocks, blocksToMarkdown } from "@/components/editor/BlockNoteEditor";
import HeroStatsManager from "@/components/admin/HeroStatsManager";
import { supabase } from "@/integrations/supabase/client";
import { BlockNoteEditor } from "@blocknote/core";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  github_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileManagePage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { profile, loading, updateProfile } = useProfile();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", username: "", title: "", bio: "", location: "", email: "", github_url: "", linkedin_url: "", website_url: "" },
  });

  // BlockNote About content
  const [aboutContent, setAboutContent] = useState<BlockNoteContent>([]);
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const hydratedSignatureRef = useRef<string | null>(null);
  const [contentLoading, setContentLoading] = useState(true);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setValue("name", profile.name || "");
      setValue("username", profile.username || "");
      setValue("title", profile.title || "");
      setValue("bio", profile.bio || "");
      setValue("location", profile.location || "");
      setValue("email", profile.email || "");
      setValue("github_url", profile.github_url || "");
      setValue("linkedin_url", profile.linkedin_url || "");
      setValue("website_url", profile.website_url || "");
      setSkills(profile.skills || []);
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile, setValue]);

  // Hydrate editor content when profile changes
  useEffect(() => {
    if (!profile) return;

    const json = (profile as any).about_content_jsonb;
    const md = (profile as any).about_markdown as string | undefined;

    let contentToSet: BlockNoteContent = [{ id: '1', type: 'paragraph', props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' }, content: [], children: [] }];
    let signature = 'empty';

    // Check if content is BlockNote format (array)
    if (json && Array.isArray(json) && json.length > 0) {
      contentToSet = json as BlockNoteContent;
      signature = `json:${JSON.stringify(json)}`;
    }
    // Check if it's old Yoopta format (object with keys) - convert from markdown
    else if (json && typeof json === 'object' && !Array.isArray(json) && Object.keys(json).length > 0) {
      // Old Yoopta format - use markdown fallback
      if (md && md.trim()) {
        contentToSet = markdownToBlocks(md) as BlockNoteContent;
        signature = `md:${md}`;
      }
    }
    // Fallback to markdown
    else if (md && md.trim()) {
      contentToSet = markdownToBlocks(md) as BlockNoteContent;
      signature = `md:${md}`;
    }

    if (hydratedSignatureRef.current === signature) return;
    hydratedSignatureRef.current = signature;

    setAboutContent(contentToSet);
    setContentLoading(false);
  }, [profile]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const md = editorRef.current ? await blocksToMarkdown(editorRef.current) : '';
      const updateData: any = { ...data, skills, avatar_url: avatarUrl, about_markdown: md, about_content_jsonb: aboutContent };
      await updateProfile(updateData as any);
      toast.success("Profile updated successfully!");
      navigate("/admin");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally { setSaving(false); }
  };

  const addSkill = () => { if (newSkill.trim() && !skills.includes(newSkill.trim())) { setSkills([...skills, newSkill.trim()]); setNewSkill(""); } };
  const removeSkill = (skillToRemove: string) => { setSkills(skills.filter(skill => skill !== skillToRemove)); };

  const extractAvatarFileName = (url: string) => {
    const marker = '/storage/v1/object/public/avatars/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const fileName = url.substring(idx + marker.length);
    return fileName || null;
  };

  const handleAvatarUpload = (urls: string[]) => {
    if (urls.length === 0) return;
    const newUrl = urls[0];

    // Best-effort: delete old avatar file when replacing
    const oldUrl = avatarUrl;
    void (async () => {
      try {
        if (oldUrl && oldUrl !== newUrl && oldUrl.includes('/storage/v1/object/public/avatars/')) {
          const oldName = extractAvatarFileName(oldUrl);
          if (oldName) await supabase.storage.from('avatars').remove([oldName]);
        }
      } catch (e) {
        console.warn('Failed to delete previous avatar:', e);
      }
    })();

    setAvatarUrl(newUrl);
    toast.success("Avatar uploaded successfully!");
  };

  const handleRemoveAvatar = () => {
    const current = avatarUrl;
    if (!current) return;

    void (async () => {
      try {
        const fileName = extractAvatarFileName(current);
        if (fileName) await supabase.storage.from('avatars').remove([fileName]);
      } catch (e) {
        console.warn('Failed to delete avatar:', e);
      } finally {
        setAvatarUrl('');
        toast.success('Avatar removed');
      }
    })();
  };

  if (loading) {
    return (
      <AdminLayout title="Profile" subtitle="Loading...">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </AdminLayout>
    );
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" className="gap-2">
        <Link href="/admin"><ArrowLeft className="w-4 h-4" /> Back</Link>
      </Button>
      <Button type="submit" form="profile-form" disabled={saving}>{saving ? (<div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2" />) : (<Save className="w-4 h-4 mr-2" />)}{saving ? "Saving..." : "Save"}</Button>
    </div>
  );

  return (
    <AdminLayout title="Profile" subtitle="Update your personal information" actions={actions}>
      <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Section */}
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" /> Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar className="w-20 h-20 mx-auto sm:mx-0">
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
                  {watch("name")?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full">
                <FileUpload
                  label="Upload Avatar"
                  uploadType="avatar"
                  accept="image/*"
                  maxFiles={1}
                  maxSizeMB={5}
                  onUploadComplete={handleAvatarUpload}
                  existingFiles={avatarUrl ? [avatarUrl] : []}
                  showPreview={false}
                />
                <div className="mt-3">
                  <Button type="button" variant="outline" onClick={handleRemoveAvatar} disabled={!avatarUrl}>
                    Remove current avatar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Square image recommended • At least 256×256px • Max 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader><CardTitle>Basic Information</CardTitle><CardDescription>Your personal details and contact information</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="name">Full Name *</Label><Input id="name" {...register("name")} placeholder="Alex Chen" className="mt-2" />{errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}</div>
              <div><Label htmlFor="username">Username *</Label><Input id="username" {...register("username")} placeholder="alex_chen_data" className="mt-2" />{errors.username && <p className="text-destructive text-sm mt-1">{errors.username.message}</p>}</div>
              <div><Label htmlFor="title">Professional Title</Label><Input id="title" {...register("title")} placeholder="Senior Data Analyst" className="mt-2" /></div>
              <div><Label htmlFor="location"><MapPin className="w-4 h-4 inline mr-1" />Location</Label><Input id="location" {...register("location")} placeholder="San Francisco, CA" className="mt-2" /></div>
              <div className="md:col-span-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" {...register("bio")} placeholder="Tell visitors about yourself..." rows={4} className="mt-2" /></div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader><CardTitle>Contact & Social</CardTitle><CardDescription>Your contact details and social media profiles</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div><Label htmlFor="email"><Mail className="w-4 h-4 inline mr-1" />Email</Label><Input id="email" {...register("email")} type="email" placeholder="alex@example.com" className="mt-2" />{errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}</div>
            <div><Label htmlFor="website_url"><Globe className="w-4 h-4 inline mr-1" />Website</Label><Input id="website_url" {...register("website_url")} placeholder="https://yourwebsite.com" className="mt-2" />{errors.website_url && <p className="text-destructive text-sm mt-1">{errors.website_url.message}</p>}</div>
            <div><Label htmlFor="github_url"><Github className="w-4 h-4 inline mr-1" />GitHub</Label><Input id="github_url" {...register("github_url")} placeholder="https://github.com/username" className="mt-2" />{errors.github_url && <p className="text-destructive text-sm mt-1">{errors.github_url.message}</p>}</div>
            <div><Label htmlFor="linkedin_url"><Linkedin className="w-4 h-4 inline mr-1" />LinkedIn</Label><Input id="linkedin_url" {...register("linkedin_url")} placeholder="https://linkedin.com/in/username" className="mt-2" />{errors.linkedin_url && <p className="text-destructive text-sm mt-1">{errors.linkedin_url.message}</p>}</div>
          </CardContent>
        </Card>

        {/* About (BlockNote) */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader><CardTitle>About Page Content</CardTitle><CardDescription>Rich content displayed on your public About page</CardDescription></CardHeader>
          <CardContent>
            <BlockNoteEditorComponent
              initialContent={aboutContent}
              loading={contentLoading}
              onChange={setAboutContent}
              onEditorReady={(editor) => { editorRef.current = editor; }}
              placeholder="Tell your story... Use / to insert headings, lists, images, etc."
              className="border rounded-lg p-4"
            />
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader><CardTitle>Skills & Technologies</CardTitle><CardDescription>Add the skills and technologies you work with</CardDescription></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4"><Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="flex-1" /><Button type="button" onClick={addSkill} variant="outline" className="hover:shadow-soft transition-all duration-300"><Plus className="w-4 h-4" /></Button></div>
            <div className="flex flex-wrap gap-2">{skills.map((skill) => (<Badge key={skill} variant="secondary" className="px-3 py-1 cursor-pointer group hover:bg-destructive/10 transition-colors" onClick={() => removeSkill(skill)}>{skill}<X className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" /></Badge>))}</div>
          </CardContent>
        </Card>

        {/* Hero Stats */}
        <HeroStatsManager />

        {/* Save Button */}
        <div className="flex justify-end"><Button type="submit" disabled={saving} size="lg" className="bg-gradient-primary hover:shadow-soft transition-all duration-300">{saving ? (<div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2" />) : (<Save className="w-4 h-4 mr-2" />)}{saving ? "Saving..." : "Save Profile"}</Button></div>
      </form>
    </AdminLayout>
  );
};

export default ProfileManagePage;

