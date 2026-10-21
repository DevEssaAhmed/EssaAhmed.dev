"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Folder,
  Loader2,
  Plus,
  Save,
  Tag,
  X,
  Focus,
  Globe,
  Play,
  Github,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Eye,
  Layers,
  Sparkles,
  AlignLeft,
} from 'lucide-react';

import BlockNoteEditorComponent, {
  BlockNoteContent,
  markdownToBlocks,
} from '@/components/editor/BlockNoteEditor';
import { BlockNoteEditor } from '@blocknote/core';
import { PerformanceSkeleton } from '@/components/ui/performance-skeleton';
import FileUpload from '@/components/FileUpload';

const DOMAIN_PILLARS = [
  'Workflow Automation',
  'Supply Chain & Demand Planning',
  'Analytics & Decision Systems',
] as const;

const VIDEO_TYPES = ['youtube', 'vimeo', 'loom'] as const;

const ProjectEditorEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [showGalleryManager, setShowGalleryManager] = useState(false);
  const [showSeoOverrides, setShowSeoOverrides] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Project Form State
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
    demo_video_type: 'youtube' as 'youtube' | 'vimeo' | 'loom' | 'external' | 'file',
    og_title: '',
    og_description: '',
    og_image: '',
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // BlockNote editor
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const [contentLoading, setContentLoading] = useState(!!id);
  const [blockNoteContent, setBlockNoteContent] = useState<BlockNoteContent>([]);

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Debounced mirrors for autosave
  const debouncedBlockNoteContent = useDebounce(blockNoteContent, 3000);
  const debouncedFormData = useDebounce(formData, 3000);
  const debouncedTags = useDebounce(selectedTags, 3000);

  const [lastSaved, setLastSaved] = useState<{
    formData: typeof formData;
    content: BlockNoteContent;
    tags: string[];
  } | null>(null);

  const onEditorReady = useCallback((editor: BlockNoteEditor) => {
    editorRef.current = editor;
  }, []);

  // Fetch Project on load
  const fetchProject = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      // Extract additional images
      const additionalImagesStr = Array.isArray(projectData.additional_images)
        ? projectData.additional_images.join(', ')
        : projectData.additional_images || '';

      const loadedFormData = {
        title: projectData.title || '',
        description: projectData.og_description || (projectData.description ? projectData.description.slice(0, 240) : ''),
        image_url: projectData.image_url || '',
        additional_images: additionalImagesStr,
        featured: Boolean(projectData.featured),
        category_id: projectData.category_id || '',
        category_name: '',
        demo_url: projectData.demo_url || '',
        github_url: projectData.github_url || '',
        demo_video_url: projectData.demo_video_url || '',
        demo_video_type:
          (projectData.demo_video_type as 'youtube' | 'vimeo' | 'loom' | 'external' | 'file') ||
          'youtube',
        og_title: projectData.og_title || '',
        og_description: projectData.og_description || '',
        og_image: projectData.og_image || '',
      };
      setFormData(loadedFormData);

      // Load BlockNote content
      let contentToSet: BlockNoteContent = [];
      const contentJsonb = projectData.description_jsonb;
      const contentMd = projectData.description;

      if (contentJsonb && Array.isArray(contentJsonb) && contentJsonb.length > 0) {
        contentToSet = contentJsonb as BlockNoteContent;
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

      setLastSaved({
        formData: loadedFormData,
        content: contentToSet,
        tags: loadedTags,
      });
    } catch (error: any) {
      toast({
        title: 'Error loading project',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/admin?tab=projects');
    } finally {
      setIsLoading(false);
      setContentLoading(false);
    }
  }, [id, navigate, toast]);

  // Load all categories on mount
  useEffect(() => {
    (async () => {
      try {
        const all = await getAllCategories();
        setCategories(all || []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (id) void fetchProject();
  }, [id, fetchProject]);

  // Save Project Handler
  const handleSave = useCallback(
    async (isAutoSave = false) => {
      const currentForm = isAutoSave ? debouncedFormData : formData;
      const currentContent = isAutoSave ? debouncedBlockNoteContent : blockNoteContent;
      const currentTags = isAutoSave ? debouncedTags : selectedTags;

      if (!currentForm.title.trim()) return;
      setIsSaving(true);

      try {
        const additionalImagesArray = Array.isArray(currentForm.additional_images)
          ? currentForm.additional_images
          : currentForm.additional_images
          ? currentForm.additional_images
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];

        const payload: any = {
          title: currentForm.title.trim(),
          description: currentForm.description.trim() || currentForm.og_description.trim() || '',
          description_jsonb: currentContent as any,
          image_url: currentForm.image_url || null,
          additional_images: additionalImagesArray,
          featured: currentForm.featured,
          category_id: currentForm.category_id || null,
          demo_url: currentForm.demo_url.trim() || null,
          github_url: currentForm.github_url.trim() || null,
          demo_video_url: currentForm.demo_video_url.trim() || null,
          demo_video_type: currentForm.demo_video_url ? currentForm.demo_video_type : 'youtube',
          og_title: currentForm.og_title || currentForm.title,
          og_description: currentForm.og_description || currentForm.description || '',
          og_image: currentForm.og_image || currentForm.image_url || null,
        };

        let projectId = id;
        if (id) {
          const { error } = await supabase.from('projects').update(payload).eq('id', id);
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

        if (projectId) {
          await associateProjectTags(projectId, currentTags);
        }

        setLastSavedAt(new Date());

        setLastSaved({
          formData: currentForm,
          content: currentContent,
          tags: currentTags,
        });

        if (!isAutoSave) {
          toast({
            title: `Project ${id ? 'updated' : 'created'} successfully!`,
            description: currentForm.featured ? 'Saved as Featured Case Study.' : 'Project changes saved.',
          });
          if (!id && projectId) {
            navigate(`/admin/project/edit/${projectId}`, { replace: true });
          }
        }
      } catch (err: any) {
        console.error('Save project error:', err);
        if (!isAutoSave) {
          toast({
            title: 'Error saving project',
            description: err.message,
            variant: 'destructive',
          });
        }
      } finally {
        setIsSaving(false);
      }
    },
    [
      id,
      formData,
      blockNoteContent,
      selectedTags,
      debouncedFormData,
      debouncedBlockNoteContent,
      debouncedTags,
      navigate,
      toast,
    ]
  );

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // Keyboard shortcut: Ctrl/Cmd + S
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

  // Autosave when debounced values change
  useEffect(() => {
    if (!id || !lastSaved) return;

    const hasChanges =
      JSON.stringify(debouncedFormData) !== JSON.stringify(lastSaved.formData) ||
      JSON.stringify(debouncedBlockNoteContent) !== JSON.stringify(lastSaved.content) ||
      JSON.stringify(debouncedTags) !== JSON.stringify(lastSaved.tags);

    if (hasChanges && debouncedFormData.title.trim()) {
      setLastSaved({
        formData: debouncedFormData,
        content: debouncedBlockNoteContent,
        tags: debouncedTags,
      });
      handleSaveRef.current?.(true)?.catch(console.error);
    }
  }, [id, debouncedFormData, debouncedBlockNoteContent, debouncedTags, lastSaved]);

  // Tags handlers
  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !selectedTags.includes(val)) {
      setSelectedTags((prev) => [...prev, val]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Domain Pillar Selection
  const handleSelectPillar = async (pillarName: string) => {
    const matched = categories.find(
      (c) => c.name.toLowerCase() === pillarName.toLowerCase()
    );
    if (matched) {
      setFormData((prev) => ({ ...prev, category_id: matched.id }));
      return;
    }
    // Otherwise create or get category
    try {
      const created = await createOrGetCategory(pillarName);
      if (created) {
        setCategories((prev) => [...prev, created]);
        setFormData((prev) => ({ ...prev, category_id: created.id }));
        toast({ title: `Category set to ${pillarName}` });
      }
    } catch {
      toast({ title: 'Could not create category', variant: 'destructive' });
    }
  };

  const activeCategoryName = useMemo(() => {
    const cat = categories.find((c) => c.id === formData.category_id);
    return cat ? cat.name : '';
  }, [categories, formData.category_id]);

  // Gallery images array
  const galleryImagesList = useMemo(() => {
    if (!formData.additional_images) return [];
    return formData.additional_images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [formData.additional_images]);

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const updated = galleryImagesList.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({ ...prev, additional_images: updated.join(', ') }));
  };

  const handleAddGalleryImage = (urlToAdd: string) => {
    if (!urlToAdd.trim()) return;
    const updated = [...galleryImagesList, urlToAdd.trim()];
    setFormData((prev) => ({ ...prev, additional_images: updated.join(', ') }));
    setNewGalleryUrl('');
  };

  if (isLoading && id) {
    return (
      <div className="min-h-screen bg-[#f1f3f5] text-zinc-900 p-8">
        <PerformanceSkeleton variant="editor" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f5] text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900 antialiased font-sans">
      {/* 1. TOP STICKY ACTION BAR */}
      <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-xl border-b border-zinc-200/90 px-4 sm:px-6 flex items-center justify-between gap-3 text-zinc-900 shadow-2xs">
        {/* Left: Back to All Projects Database + Save Status */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/admin?tab=projects')}
            className="group inline-flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors px-2 py-1.5 rounded-md hover:bg-zinc-100 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to All Projects Database</span>
            <span className="sm:hidden">All Projects</span>
          </button>

          <div className="h-4 w-px bg-zinc-200 hidden sm:block shrink-0" />

          {/* Live Save Status Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700 shrink-0">
            <span
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isSaving ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              )}
            />
            <span className="truncate">
              {isSaving
                ? "Saving…"
                : lastSavedAt
                ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : id
                ? "Saved"
                : "Draft"}
            </span>
          </div>
        </div>

        {/* Right: View Project + Focus Mode + Save Project */}
        <div className="flex items-center gap-2 shrink-0">
          {id && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs font-mono text-zinc-700 hover:text-zinc-900 border border-zinc-300 hover:bg-zinc-100 hidden md:inline-flex"
            >
              <Link href={`/projects/${id}`} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                <span>View Case Study</span>
              </Link>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFocusMode((v) => !v)}
            className={cn(
              "h-8 px-2.5 text-xs font-mono border transition-all",
              focusMode
                ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                : "text-zinc-700 hover:text-zinc-900 border-zinc-300 hover:bg-zinc-100"
            )}
          >
            <Focus className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">{focusMode ? "Exit Focus" : "Focus Mode"}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={isSaving || !formData.title.trim()}
            className="h-8 px-4 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 shadow-xs transition-all font-sans"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>Save Project</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* 2. CENTERED DOCUMENT CONTAINER */}
      <main
        className={cn(
          "max-w-4xl mx-auto px-4 sm:px-8 py-8 transition-all duration-300",
          focusMode && "py-12"
        )}
      >
        {/* Cover Banner */}
        {formData.image_url ? (
          <div className="relative group w-full rounded-2xl overflow-hidden aspect-[21/8] max-h-64 mb-6 border border-zinc-200 bg-white shadow-2xs">
            <img
              src={formData.image_url}
              alt="Project Cover"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
              <span className="text-xs font-mono text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                Primary Case Study Cover
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCoverModal(true)}
                  className="h-7 text-xs bg-white text-zinc-900 hover:bg-zinc-100 border border-zinc-200 font-medium"
                >
                  Change Cover
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => setFormData((p) => ({ ...p, image_url: '' }))}
                  className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          !focusMode && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowCoverModal(true)}
                className="inline-flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-900 py-1.5 px-3 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>Add Cover Banner</span>
              </button>
            </div>
          )
        )}

        {/* Large Notion Editable Title */}
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
          placeholder="Case Study Title..."
          className="w-full bg-transparent border-none px-0 py-2 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:outline-none leading-tight tracking-tight"
        />

        {/* Short Executive Summary (`description`) */}
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="Executive summary: The core architectural challenge, operational methodology, and measurable business impact..."
          rows={2}
          className="w-full bg-transparent border-none px-0 py-1 text-base sm:text-lg text-zinc-700 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:outline-none resize-none leading-relaxed mt-1"
        />

        {/* 3. NOTION INLINE PAGE PROPERTIES TABLE */}
        <div
          className={cn(
            "border-y border-zinc-200 py-4 my-6 space-y-4 transition-all",
            focusMode && "hidden"
          )}
        >
          {/* Core Domain Pillar / Category */}
          <div className="flex flex-col sm:flex-row sm:items-start py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 pt-1">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Domain Pillar</span>
            </div>
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {DOMAIN_PILLARS.map((p) => {
                  const isActive = activeCategoryName.toLowerCase() === p.toLowerCase();
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPillar(p)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md font-mono transition-all border",
                        isActive
                          ? "bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Existing Categories Dropdown + Custom Category */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Select
                  value={formData.category_id || 'none'}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_id: val === 'none' ? '' : val,
                    }))
                  }
                >
                  <SelectTrigger className="w-48 h-8 bg-white border-zinc-300 text-xs text-zinc-900">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-lg">
                    <SelectItem value="none">Custom / None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1.5">
                  <Input
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="New category"
                    className="h-8 w-36 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!newCategoryInput.trim()}
                    onClick={async () => {
                      if (!newCategoryInput.trim()) return;
                      try {
                        const newCat = await createOrGetCategory(newCategoryInput.trim());
                        if (newCat) {
                          setCategories((prev) => [...prev, newCat]);
                          setFormData((prev) => ({ ...prev, category_id: newCat.id }));
                          setNewCategoryInput('');
                          toast({ title: 'Category added!' });
                        }
                      } catch {
                        toast({ title: 'Could not create category', variant: 'destructive' });
                      }
                    }}
                    className="h-8 px-2 text-xs border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Case Study Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Featured</span>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <Switch
                id="featured-toggle"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, featured: checked }))
                }
              />
              <Label htmlFor="featured-toggle" className="text-xs font-mono cursor-pointer text-zinc-800">
                Display as Highlighted Case Study on Home &amp; Portfolio
              </Label>
            </div>
          </div>

          {/* Live Demo URL & GitHub Repository URL */}
          <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>Live Demo</span>
            </div>
            <div className="flex-1">
              <Input
                type="url"
                value={formData.demo_url}
                onChange={(e) => setFormData((p) => ({ ...p, demo_url: e.target.value }))}
                placeholder="https://demo.example.com"
                className="h-8 bg-white border-zinc-300 text-xs font-mono text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
              <Github className="w-3.5 h-3.5 text-zinc-400" />
              <span>GitHub Repo</span>
            </div>
            <div className="flex-1">
              <Input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData((p) => ({ ...p, github_url: e.target.value }))}
                placeholder="https://github.com/essaahmed/repo"
                className="h-8 bg-white border-zinc-300 text-xs font-mono text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Video Walkthrough */}
          <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
              <Play className="w-3.5 h-3.5 text-zinc-400" />
              <span>Video Walkthrough</span>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-1 shrink-0">
                {VIDEO_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, demo_video_type: t }))}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md font-mono capitalize transition-all border",
                      formData.demo_video_type === t
                        ? "bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Input
                type="url"
                value={formData.demo_video_url}
                onChange={(e) => setFormData((p) => ({ ...p, demo_video_url: e.target.value }))}
                placeholder="https://loom.com/share/... or YouTube / Vimeo URL"
                className="h-8 flex-1 bg-white border-zinc-300 text-xs font-mono text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Tech Stack & Tags */}
          <div className="flex flex-col sm:flex-row sm:items-start py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 pt-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Tech Stack &amp; Tags</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="e.g. Next.js, Airflow, Supabase, Python..."
                  className="h-8 max-w-xs bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || selectedTags.includes(tagInput.trim())}
                  className="h-8 px-2.5 text-xs font-mono border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add</span>
                </Button>
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs font-mono"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-600 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Gallery Images */}
          <div className="pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setShowGalleryManager(!showGalleryManager)}
              className="flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors py-1"
            >
              {showGalleryManager ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>
                Additional Gallery Images ({galleryImagesList.length})
              </span>
            </button>

            {showGalleryManager && (
              <div className="mt-3 pl-4 sm:pl-6 border-l border-zinc-200 space-y-4 pt-1">
                {galleryImagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {galleryImagesList.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-zinc-200 aspect-video bg-zinc-100"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
                  <Input
                    type="url"
                    placeholder="Paste image URL to append..."
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="h-8 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddGalleryImage(newGalleryUrl)}
                    disabled={!newGalleryUrl.trim()}
                    className="h-8 px-3 text-xs bg-zinc-900 text-white hover:bg-zinc-800 shrink-0 font-mono"
                  >
                    Add to Gallery
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible SEO Overrides */}
          <div className="pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setShowSeoOverrides(!showSeoOverrides)}
              className="flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors py-1"
            >
              {showSeoOverrides ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>SEO Overrides (Social Card / OpenGraph)</span>
            </button>

            {showSeoOverrides && (
              <div className="mt-3 pl-4 sm:pl-6 border-l border-zinc-200 space-y-3 pt-1">
                <div>
                  <Label className="text-xs font-mono text-zinc-600">OG Title</Label>
                  <Input
                    value={formData.og_title}
                    onChange={(e) => setFormData((p) => ({ ...p, og_title: e.target.value }))}
                    placeholder={formData.title || "Custom social title"}
                    className="h-8 mt-1 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <Label className="text-xs font-mono text-zinc-600">OG Description</Label>
                  <Textarea
                    value={formData.og_description}
                    onChange={(e) => setFormData((p) => ({ ...p, og_description: e.target.value }))}
                    placeholder={formData.description || "Custom social description"}
                    rows={2}
                    className="mt-1 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <Label className="text-xs font-mono text-zinc-600">OG Image URL</Label>
                  <Input
                    value={formData.og_image}
                    onChange={(e) => setFormData((p) => ({ ...p, og_image: e.target.value }))}
                    placeholder={formData.image_url || "https://..."}
                    className="h-8 mt-1 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. FULL-WIDTH @BLOCKNOTE/REACT CASE STUDY CANVAS */}
        <section className="pt-4 min-h-[60vh]">
          <div className="prose max-w-none bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs">
            <BlockNoteEditorComponent
              initialContent={blockNoteContent}
              loading={contentLoading}
              onChange={setBlockNoteContent}
              onEditorReady={onEditorReady}
              placeholder="Press '/' for case study sections, callouts, diagrams, code blocks..."
              className="min-h-[60vh]"
            />
          </div>
        </section>
      </main>

      {/* COVER IMAGE MODAL */}
      <Dialog open={showCoverModal} onOpenChange={setShowCoverModal}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900 max-w-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display text-zinc-900">Primary Project Cover Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <FileUpload
              label="Upload Cover Image"
              uploadType="image"
              onUploadComplete={(urls) => {
                if (urls.length > 0) {
                  setFormData((p) => ({ ...p, image_url: urls[0] }));
                  setShowCoverModal(false);
                }
              }}
              maxFiles={1}
              existingFiles={formData.image_url ? [formData.image_url] : []}
              simultaneousMode={true}
              urlInputPlaceholder="https://images.unsplash.com/..."
            />
            <div className="pt-2 border-t border-zinc-200">
              <Label className="text-xs font-mono text-zinc-600">Or Paste Image URL Directly</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="url"
                  placeholder="https://example.com/project-cover.jpg"
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                  className="h-8 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                />
                <Button
                  size="sm"
                  type="button"
                  onClick={() => {
                    if (coverUrlInput.trim()) {
                      setFormData((p) => ({ ...p, image_url: coverUrlInput.trim() }));
                      setCoverUrlInput('');
                      setShowCoverModal(false);
                    }
                  }}
                  className="h-8 px-3 text-xs bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectEditorEnhanced;
