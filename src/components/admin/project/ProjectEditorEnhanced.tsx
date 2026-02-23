"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from "next/link";
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from '@/lib/router-compat';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  associateProjectTags,
  createOrGetCategory,
  getAllCategories,
  getProjectTags,
} from '@/lib/tagUtils';
import { useDebounce } from '@/hooks/use-debouncer';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Folder,
  Loader2,
  Plus,
  Save,
  Settings,
  Tag,
  Upload,
  X,
  Focus,
  Link as LinkIcon,
  Play,
} from 'lucide-react';

import BlockNoteEditorComponent, { BlockNoteContent, markdownToBlocks, blocksToMarkdown } from '@/components/editor/BlockNoteEditor';
import { BlockNoteEditor } from '@blocknote/core';
import AdminLayout from '@/components/admin/layout/AdminLayout';

import { PerformanceSkeleton } from '@/components/ui/performance-skeleton';
import { Switch } from '@/components/ui/switch';
import FileUpload from '@/components/FileUpload';

const ProjectEditorEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    additional_images: '',
    featured: false,
    category_id: '',
    category_name: '',
    demo_url: '',
    github_url: '',
    demo_video_url: '',
    demo_video_type: 'youtube' as 'youtube' | 'vimeo' | 'external' | 'file',
    og_title: '',
    og_description: '',
    og_image: '',
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // BlockNote editor
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const [contentLoading, setContentLoading] = useState(!!id);
  const [blockNoteContent, setBlockNoteContent] = useState<BlockNoteContent>([]);

  // Last save timestamp for display
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Debounced mirrors for autosave behavior
  const debouncedBlockNoteContent = useDebounce(blockNoteContent, 3000);
  const debouncedFormData = useDebounce(formData, 3000);
  const debouncedTags = useDebounce(selectedTags, 3000);

  // Stable ref to latest handleSave, used by the Ctrl+S listener to avoid stale closures
  const handleSaveRef = useRef<((isAutoSave?: boolean) => Promise<void>) | null>(null);

  // Stable callback for onEditorReady — must be at component scope (not inline) to avoid
  // creating a new function reference on every render, which would re-trigger the
  // useEffect inside BlockNoteEditorComponent and cause subtle focus-loss bugs.
  const onEditorReady = useCallback((editor: BlockNoteEditor) => {
    editorRef.current = editor;
  }, []);

  const fetchProject = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      const loadedFormData = {
        title: projectData.title || '',
        description: projectData.description || '',
        image_url: projectData.image_url || '',
        additional_images: Array.isArray(projectData.additional_images)
          ? projectData.additional_images.join(', ')
          : projectData.additional_images || '',
        featured: projectData.featured || false,
        category_id: projectData.category_id || '',
        category_name: '',
        demo_url: projectData.demo_url || '',
        github_url: projectData.github_url || '',
        demo_video_url: projectData.demo_video_url || '',
        demo_video_type: (projectData.demo_video_type as 'youtube' | 'vimeo' | 'external' | 'file') || 'youtube',
        og_title: projectData.og_title || '',
        og_description: projectData.og_description || '',
        og_image: projectData.og_image || '',
      };
      setFormData((prev) => ({ ...prev, ...loadedFormData }));

      // Load content - check if BlockNote format (array) or old Yoopta format (object)
      let contentToSet: BlockNoteContent = [];
      const contentJsonb = projectData.description_jsonb;
      const contentMd = projectData.description;

      if (contentJsonb && Array.isArray(contentJsonb) && contentJsonb.length > 0) {
        contentToSet = contentJsonb as BlockNoteContent;
      } else if (contentJsonb && typeof contentJsonb === 'object' && !Array.isArray(contentJsonb) && Object.keys(contentJsonb).length > 0) {
        if (contentMd && contentMd.trim()) {
          contentToSet = markdownToBlocks(contentMd) as BlockNoteContent;
        }
      } else if (contentMd && contentMd.trim()) {
        contentToSet = markdownToBlocks(contentMd) as BlockNoteContent;
      }

      if (contentToSet.length > 0) {
        setBlockNoteContent(contentToSet);
      }
      setContentLoading(false);

      const tags = await getProjectTags(id);
      const loadedTags = tags.map((t: any) => t.name as string);
      setSelectedTags(loadedTags);

      // Seed lastSaved so the first debounce tick doesn't trigger a spurious autosave
      setLastSaved({ formData: loadedFormData, content: contentToSet, tags: loadedTags });
    } catch (error: any) {
      toast({
        title: 'Error loading project',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/admin');
    } finally {
      setIsLoading(false);
      setContentLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllCategories();
        setCategories(all);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (id) fetchProject();
  }, [id, fetchProject]);

  // Save in both Markdown (description) and JSONB (content_jsonb).
  const handleSave = useCallback(
    async (isAutoSave = false) => {
      if (!debouncedFormData.title.trim()) return;
      if (isSaving) return;

      setIsSaving(true);
      try {
        const markdownString = editorRef.current ? await blocksToMarkdown(editorRef.current) : '';

        const additionalImagesArray = Array.isArray(debouncedFormData.additional_images)
          ? debouncedFormData.additional_images
          : debouncedFormData.additional_images
            ? debouncedFormData.additional_images.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

        const payload = {
          title: debouncedFormData.title,
          description: markdownString,
          description_jsonb: debouncedBlockNoteContent,
          image_url: debouncedFormData.image_url || null,
          additional_images: additionalImagesArray,
          featured: debouncedFormData.featured,
          category_id: debouncedFormData.category_id || null,
          demo_url: debouncedFormData.demo_url || null,
          github_url: debouncedFormData.github_url || null,
          demo_video_url: debouncedFormData.demo_video_url || null,
          demo_video_type: debouncedFormData.demo_video_url
            ? debouncedFormData.demo_video_type
            : 'youtube',
          og_title: debouncedFormData.og_title || debouncedFormData.title,
          og_description: debouncedFormData.og_description || '',
          og_image: debouncedFormData.og_image || debouncedFormData.image_url || null,
        };

        let projectId = id;
        if (id) {
          const { error } = await supabase
            .from('projects')
            .update(payload)
            .eq('id', id);
          if (error) throw error;
        } else {
          const { data: insertData, error } = await supabase
            .from('projects')
            .insert([payload])
            .select('id')
            .single();
          if (error) throw error;
          projectId = insertData?.id;
        }

        if (projectId) await associateProjectTags(projectId, debouncedTags);

        setLastSavedAt(new Date());

        if (!isAutoSave) {
          toast({
            title: `Project ${id ? 'updated' : 'created'} successfully`,
          });
          if (!id && projectId)
            navigate(`/admin/project/edit/${projectId}`, { replace: true });
        }
      } catch (err: any) {
        if (!isAutoSave)
          toast({
            title: 'Error saving project',
            description: err.message,
            variant: 'destructive',
          });
      } finally {
        setIsSaving(false);
      }
    },
    [
      id,
      editorRef,
      debouncedFormData,
      debouncedBlockNoteContent,
      debouncedTags,
      navigate,
      toast,
      // NOTE: isSaving intentionally excluded — including it makes useCallback recreate
      // `handleSave` every save cycle, which re-triggers the keyboard listener useEffect.
    ]
  );

  // Track last saved version (seeded by fetchProject to prevent spurious saves on load)
  const [lastSaved, setLastSaved] = useState<{
    formData: typeof formData;
    content: BlockNoteContent;
    tags: string[];
  } | null>(null);

  // Keep the ref always pointing at the latest handleSave
  useEffect(() => { handleSaveRef.current = handleSave; }, [handleSave]);

  // Ctrl/Cmd+S keyboard shortcut — uses a ref so the listener is never re-added
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current?.(false)?.catch(console.error);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

  }, []);

  // Autosave: fire when debounced state differs from lastSaved snapshot.
  // NOTE: isSaving and handleSave intentionally excluded from deps to prevent
  // infinite re-run loops when save toggles isSaving state.
  useEffect(() => {
    if (!id) return;
    if (!lastSaved) return;

    const hasChanges =
      JSON.stringify(debouncedFormData) !== JSON.stringify(lastSaved.formData) ||
      JSON.stringify(debouncedBlockNoteContent) !== JSON.stringify(lastSaved.content) ||
      JSON.stringify(debouncedTags) !== JSON.stringify(lastSaved.tags);

    if (hasChanges && debouncedFormData.title.trim()) {
      // Snapshot immediately to prevent double-fires during async save
      setLastSaved({
        formData: debouncedFormData,
        content: debouncedBlockNoteContent,
        tags: debouncedTags,
      });
      handleSaveRef.current?.(true)?.catch(console.error);
    }

  }, [id, debouncedFormData, debouncedBlockNoteContent, debouncedTags, lastSaved]);

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags((prev) => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCreateNewCategory = async () => {
    if (!formData.category_name.trim()) return;
    try {
      const newCategory = await createOrGetCategory(formData.category_name);
      if (newCategory) {
        if (!categories.some((c) => c.id === newCategory.id))
          setCategories((prev) => [...prev, newCategory]);
        setFormData((prev) => ({
          ...prev,
          category_id: newCategory.id,
          category_name: '',
        }));
        toast({ title: 'Category created successfully!' });
      }
    } catch (error) {
      toast({
        title: 'Error creating category',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, category_id: categoryId }));
  };

  const [urlInput, setUrlInput] = useState('');
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: `Image must be smaller than ${maxSizeMB}MB.`,
        variant: 'destructive',
      });
      return;
    }
    setIsUploading(true);
    try {
      const bucket = 'images';
      const fileName = `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        '_'
      )}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      if (!urlData?.publicUrl) throw new Error('Could not get public URL.');
      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      toast({ title: 'Image uploaded successfully!' });
    } catch (err) {
      toast({
        title: 'Upload Failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleAddImageUrl = () => {
    if (urlInput.trim()) {
      try {
        new URL(urlInput.trim());
        setFormData((prev) => ({ ...prev, image_url: urlInput.trim() }));
        setUrlInput('');
        toast({ title: 'Image URL added.' });
      } catch {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid image URL.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDemoVideoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      const u = urls[0];
      setFormData((prev) => ({
        ...prev,
        demo_video_url: u,
        demo_video_type:
          u.includes('youtube') || u.includes('vimeo')
            ? u.includes('youtube')
              ? 'youtube'
              : 'vimeo'
            : u.startsWith('http')
              ? 'external'
              : 'file',
      }));
    }
  };

  if (isLoading && id) {
    return (
      <AdminLayout
        title='Project Editor'
        subtitle='Loading...'
        fullWidthContent={focusMode}
      >
        <PerformanceSkeleton variant="editor" />
      </AdminLayout>
    );
  }

  const actions = (
    <div className='flex flex-wrap items-center gap-3'>
      <Button asChild variant='ghost' size='sm'>
        <Link href="/admin">
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back
        </Link>
      </Button>
      <div className='hidden md:flex items-center gap-2'>
        <div
          className={`w-2 h-2 rounded-full transition-colors ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}
        />
        <span className='text-xs text-muted-foreground'>
          {isSaving
            ? 'Saving…'
            : lastSavedAt
              ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : id
                ? 'Saved'
                : 'Ready'}
        </span>
      </div>
      <Button
        variant='outline'
        size='sm'
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings className='w-4 h-4 mr-2' />
        Settings
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => handleSave(false)}
        disabled={isSaving}
      >
        <Save className='w-4 h-4 mr-2' />
        Save
      </Button>
      <Button
        variant={focusMode ? 'default' : 'outline'}
        size='sm'
        onClick={() => setFocusMode((v) => !v)}
        className='hidden md:inline-flex'
      >
        <Focus className='w-4 h-4 mr-2' />
        {focusMode ? 'Exit Focus' : 'Focus'}
      </Button>
    </div>
  );

  return (
    <AdminLayout
      title='Project Editor'
      subtitle={id ? 'Editing project' : 'Create new project'}
      actions={actions}
      fullWidthContent={focusMode}
    >
      <div
        className={cn(
          'flex flex-col lg:flex-row gap-8 lg:gap-12 relative max-w-7xl mx-auto transition-all duration-500 ease-in-out',
          focusMode ? 'opacity-100 max-w-4xl' : ''
        )}
      >
        {/* Main Document Area */}
        <div className={cn(
          'flex-1 min-w-0 transition-all duration-500',
          focusMode ? 'mx-auto w-full' : ''
        )}>
          <div className={cn('space-y-8', focusMode ? 'py-12' : 'py-6')}>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder='Project Title'
              className='text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight border-none bg-transparent px-0 h-auto py-2 placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 leading-tight'
            />

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <BlockNoteEditorComponent
                initialContent={blockNoteContent}
                loading={contentLoading}
                onChange={setBlockNoteContent}
                onEditorReady={onEditorReady}
                placeholder="Press '/' for commands..."
                className="min-h-[60vh]"
              />
            </div>
          </div>
        </div>

        {/* Floating Sidebar */}
        <div
          className={cn(
            'w-full lg:w-[380px] shrink-0 space-y-6 transition-all duration-500',
            focusMode ? 'opacity-0 translate-x-8 pointer-events-none hidden' : 'opacity-100 translate-x-0 block'
          )}
        >
          <div className="sticky top-24 space-y-6 pb-24">
            <Card className='bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden'>
              <CardContent className='p-5 space-y-4'>
                <h3 className='text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2'>
                  <Folder className='w-3.5 h-3.5' /> Publishing
                </h3>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Featured
                  </span>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, featured: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className='bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden'>
              <CardContent className='p-6 space-y-6'>
                <h3 className='text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2'>
                  <Tag className='w-3.5 h-3.5' /> Category & Tags
                </h3>
                <div>
                  <Label>Select Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue placeholder='Choose a category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Or Create New</Label>
                  <div className='flex gap-2 mt-1'>
                    <Input
                      value={formData.category_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category_name: e.target.value,
                        }))
                      }
                      placeholder='New category name'
                    />
                    <Button
                      type='button'
                      size='sm'
                      onClick={handleCreateNewCategory}
                      disabled={!formData.category_name.trim()}
                    >
                      <Plus className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Technologies &amp; Tags</Label>
                  <div className='flex gap-2 mt-1'>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder='Add tag and press Enter'
                    />
                    <Button
                      type='button'
                      size='sm'
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      <Plus className='w-4 h-4' />
                    </Button>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-3'>
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {tag}
                        <button
                          type='button'
                          className='ml-1 rounded-full hover:bg-destructive/20 p-0.5'
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden'>
              <CardContent className='p-6 space-y-4'>
                <h3 className='text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2'>
                  <LinkIcon className='w-3.5 h-3.5' /> Links
                </h3>
                <div className='space-y-2'>
                  <div>
                    <Label>Live Demo URL</Label>
                    <Input
                      type='url'
                      placeholder='https://example.com'
                      value={formData.demo_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          demo_url: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>GitHub URL</Label>
                    <Input
                      type='url'
                      placeholder='https://github.com/your/repo'
                      value={formData.github_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          github_url: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden'>
              <CardContent className='p-6 space-y-4'>
                <h3 className='text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2'>
                  <Play className='w-3.5 h-3.5' /> Demo Video
                </h3>
                <FileUpload
                  label='Demo Video'
                  uploadType='video'
                  onUploadComplete={handleDemoVideoUpload}
                  maxFiles={1}
                  existingFiles={
                    formData.demo_video_url ? [formData.demo_video_url] : []
                  }
                  simultaneousMode={true}
                  urlInputPlaceholder='https://youtube.com/watch?v=... or direct video URL'
                />
              </CardContent>
            </Card>

            <Card className='bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden'>
              <CardContent className='p-6 space-y-6'>
                <h3 className='text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2'>
                  <Folder className='w-3.5 h-3.5' /> Media
                </h3>
                <div className='space-y-2'>
                  {formData.image_url ? (
                    <div className='relative group'>
                      <OptimizedImage
                        src={formData.image_url}
                        alt='Featured'
                        className='rounded-lg w-full object-cover aspect-video border bg-muted'
                        onError={(e: any) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://via.placeholder.com/300';
                        }}
                      />
                      <Button
                        variant='destructive'
                        size='icon'
                        className='absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image_url: '' }))
                        }
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <div className='border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors'>
                        <input
                          type='file'
                          id='image-upload'
                          className='hidden'
                          onChange={handleFileSelect}
                          accept='image/*'
                          disabled={isUploading}
                        />
                        <label
                          htmlFor='image-upload'
                          className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          {isUploading ? (
                            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                          ) : (
                            <Upload className='h-6 w-6 text-muted-foreground' />
                          )}
                          <p className='text-xs font-medium text-muted-foreground'>
                            {isUploading ? 'Uploading...' : 'Click to upload'}
                          </p>
                        </label>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Input
                          type='url'
                          placeholder='Or paste an image URL'
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleAddImageUrl()
                          }
                          disabled={isUploading}
                        />
                        <Button
                          onClick={handleAddImageUrl}
                          disabled={!urlInput.trim() || isUploading}
                        >
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className='border-t border-border pt-4'>
                  <Label>Additional Images</Label>
                  <div className='mt-1'>
                    <FileUpload
                      label='Additional Images'
                      uploadType='image'
                      multiple
                      maxFiles={10}
                      existingFiles={
                        formData.additional_images
                          ? formData.additional_images
                            .split(',')
                            .map((s: string) => s.trim())
                            .filter(Boolean)
                          : []
                      }
                      onUploadComplete={(urls) =>
                        setFormData((prev) => ({
                          ...prev,
                          additional_images: urls.join(', '),
                        }))
                      }
                      simultaneousMode={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden'>
              <CardContent className='p-6'>
                <h3 className='text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4'>SEO Overrides</h3>
                <div className='space-y-4'>
                  <div>
                    <Label>OG Title</Label>
                    <Input
                      value={formData.og_title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          og_title: e.target.value,
                        }))
                      }
                      placeholder='Custom title for social shares'
                    />
                  </div>
                  <div>
                    <Label>OG Description</Label>
                    <Textarea
                      value={formData.og_description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev) => ({
                          ...prev,
                          og_description: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder='Custom description for social shares'
                    />
                  </div>
                  <div>
                    <Label>OG Image URL</Label>
                    <Input
                      value={formData.og_image}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          og_image: e.target.value,
                        }))
                      }
                      placeholder='https://...'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProjectEditorEnhanced;



