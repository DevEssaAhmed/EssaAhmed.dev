"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from "next/link";
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from '@/lib/router-compat';
import { useDebounce } from '@/hooks/use-debouncer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Eye,
  Copy,
  Image as ImageIcon,
  Clock,
  Tag,
  Plus,
  X,
  Focus,
  Sparkles,
  ExternalLink,
  Layers,
  Globe,
  ChevronDown,
  ChevronRight,
  Loader2,
  Folder,
  Bookmark,
  Share2,
  AlignLeft,
  BookOpen,
  Check,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  createOrGetCategory,
  getAllCategories,
  associateBlogPostTags,
  getBlogPostTags,
} from '@/lib/tagUtils';
import FileUpload from '@/components/FileUpload';
import BlockNoteEditorComponent, {
  BlockNoteContent,
  markdownToBlocks,
  blocksToMarkdown,
} from '@/components/editor/BlockNoteEditor';
import { BlockNoteEditor } from '@blocknote/core';
import { PerformanceSkeleton } from '@/components/ui/performance-skeleton';
import {
  extractArticleExternalMeta,
  encodeArticleExternalMeta,
} from '@/data/externalArticlesStore';

type PostVisibility = 'draft' | 'unlisted' | 'published';

const stripMarkdown = (md: string) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/(!)?\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_~`-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const firstImageFromMarkdown = (md: string): string | null => {
  const m = md.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return m ? m[1] : null;
};

const PLATFORMS = [
  'Medium',
  'dev.to',
  'freeCodeCamp',
  'Substack',
  'Hashnode',
] as const;

const BlogEditorEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [seoDrawerOpen, setSeoDrawerOpen] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [showSeoOverrides, setShowSeoOverrides] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // External / Entry Mode States
  const [entryMode, setEntryMode] = useState<'internal' | 'external'>('internal');
  const [platform, setPlatform] = useState<string>('');
  const [externalUrl, setExternalUrl] = useState<string>('');

  // Supabase categories & series
  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewSeriesDialog, setShowNewSeriesDialog] = useState(false);
  const [newSeries, setNewSeries] = useState({ title: '', slug: '', description: '' });

  // Tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // BlockNote Editor
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const [contentLoading, setContentLoading] = useState(!!id);
  const [blockNoteContent, setBlockNoteContent] = useState<BlockNoteContent>([]);

  // Base Form Data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    image_url: '',
    video_url: '',
    video_type: '',
    category_id: '',
    category_name: '',
    series_id: '',
    series_order: 1,
    published: false,
    unlisted: false,
    reading_time: 5,
    og_title: '',
    og_description: '',
    og_image: '',
  });

  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const entryModeRef = useRef(entryMode);
  entryModeRef.current = entryMode;
  const externalUrlRef = useRef(externalUrl);
  externalUrlRef.current = externalUrl;
  const platformRef = useRef(platform);
  platformRef.current = platform;

  const onEditorReady = useCallback((editor: BlockNoteEditor) => {
    editorRef.current = editor;
  }, []);

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Debounced values for autosave
  const debouncedBlockNoteContent = useDebounce(blockNoteContent, 3000);
  const debouncedFormData = useDebounce(formData, 3000);
  const debouncedTags = useDebounce(selectedTags, 3000);
  const debouncedEntryMode = useDebounce(entryMode, 3000);
  const debouncedExternalUrl = useDebounce(externalUrl, 3000);
  const debouncedPlatform = useDebounce(platform, 3000);

  const [lastSaved, setLastSaved] = useState<{
    formData: typeof formData;
    content: BlockNoteContent;
    tags: string[];
    entryMode: 'internal' | 'external';
    externalUrl: string;
    platform: string;
  } | null>(null);

  // Calculate live word count & reading time
  const wordCount = useMemo(() => {
    const text = blockNoteContent
      .map((block: any) => {
        if (Array.isArray(block.content)) {
          return block.content.map((c: any) => c.text || '').join(' ');
        }
        return '';
      })
      .join(' ')
      .trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }, [blockNoteContent]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const loadCategories = useCallback(async () => {
    try {
      const allCategories = await getAllCategories();
      setCategories(allCategories || []);
    } catch (err) {
      console.error('Error loading categories', err);
      setCategories([]);
    }
  }, []);

  const loadSeries = useCallback(async () => {
    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .order('title');
      if (seriesError) {
        console.error('Error fetching series:', seriesError);
      } else {
        setSeries(seriesData || []);
      }
    } catch (error) {
      console.error('Error loading series:', error);
      setSeries([]);
    }
  }, []);

  const fetchBlogPost = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`*, categories (id, name), series (id, title)`)
        .eq('id', id)
        .single();
      if (error) throw error;

      // Extract external article metadata
      const externalMeta = extractArticleExternalMeta(data);
      const isExt = externalMeta.isExternal;
      setEntryMode(isExt ? 'external' : 'internal');
      setExternalUrl(externalMeta.externalUrl || '');
      setPlatform(externalMeta.platform || '');

      const loadedFormData = {
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        image_url: data.image_url || '',
        video_url: data.video_url || '',
        video_type: data.video_type || '',
        category_id: data.category_id || '',
        category_name: '',
        series_id: data.series_id || '',
        series_order: data.series_order || 1,
        published: Boolean(data.published),
        unlisted: Boolean(data.unlisted),
        reading_time: data.reading_time || 5,
        og_title: (data as any).og_title || '',
        og_description: (data as any).og_description || '',
        og_image: (data as any).og_image || '',
      };
      setFormData(loadedFormData);

      let loadedTags: string[] = [];
      const tags = await getBlogPostTags(id);
      loadedTags = tags.map((tag: any) => tag.name as string);
      setSelectedTags(loadedTags);

      // Load BlockNote content
      let contentToSet: BlockNoteContent = [];
      const contentJsonb = data.content_jsonb;
      const contentMd = data.content;

      if (contentJsonb && Array.isArray(contentJsonb) && contentJsonb.length > 0) {
        contentToSet = contentJsonb as BlockNoteContent;
      } else if (contentMd && contentMd.trim()) {
        contentToSet = markdownToBlocks(contentMd) as BlockNoteContent;
      }

      if (contentToSet.length > 0) {
        setBlockNoteContent(contentToSet);
      }
      setContentLoading(false);

      // Seed lastSaved snapshot
      setLastSaved({
        formData: loadedFormData,
        content: contentToSet,
        tags: loadedTags,
        entryMode: isExt ? 'external' : 'internal',
        externalUrl: externalMeta.externalUrl || '',
        platform: externalMeta.platform || '',
      });
    } catch (error: any) {
      console.error('Fetch post error:', error);
      toast({
        title: 'Error loading blog post',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/admin?tab=blogs');
    } finally {
      setIsLoading(false);
      setContentLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    void loadCategories();
    void loadSeries();
    if (id) void fetchBlogPost();
  }, [id, loadCategories, loadSeries, fetchBlogPost]);

  // Auto-generate slug from title for new posts
  useEffect(() => {
    if (formData.title && !id && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, id, formData.slug]);

  // Handle Fetch OpenGraph Metadata
  const handleImportExternal = async () => {
    const rawUrl = externalUrl.trim();
    if (!rawUrl) {
      toast({
        title: 'Please enter an external URL first',
        description: 'Provide an article link from Medium, Dev.to, Substack, etc.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Please sign in as an administrator before importing an article.');
      }

      const res = await fetch('/api/articles/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url: rawUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import metadata');
      }

      setFormData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        slug: data.slug || prev.slug,
        excerpt: data.excerpt || prev.excerpt,
        image_url: data.image_url || prev.image_url,
        reading_time: data.reading_time || prev.reading_time,
        og_title: data.title || prev.og_title,
        og_description: data.excerpt || prev.og_description,
        og_image: data.image_url || prev.og_image,
      }));

      if (data.platform) {
        setPlatform(data.platform);
      }
      setEntryMode('external');

      toast({
        title: 'Metadata imported successfully!',
        description: `Imported "${data.title}" from ${data.platform || 'source'}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Import failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

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

  const createNewSeries = async () => {
    if (!newSeries.title.trim()) return;
    try {
      const seriesSlug =
        newSeries.slug ||
        newSeries.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      const { data, error } = await supabase
        .from('series')
        .insert([
          {
            title: newSeries.title.trim(),
            slug: seriesSlug,
            description: newSeries.description,
            status: 'active',
          },
        ])
        .select()
        .single();
      if (error) {
        console.error('Error creating series:', error);
        toast({ title: 'Error creating series', description: error.message, variant: 'destructive' });
      } else {
        setSeries((prev) => [...prev, data]);
        setFormData((prev) => ({ ...prev, series_id: data.id }));
        toast({ title: 'Series created successfully' });
      }
      setShowNewSeriesDialog(false);
      setNewSeries({ title: '', slug: '', description: '' });
    } catch (error: any) {
      toast({ title: 'Error creating series', description: error.message, variant: 'destructive' });
    }
  };

  // Main Save function
  const handleSave = useCallback(
    async (visibilityOverride?: PostVisibility, isAutoSave = false) => {
      const currentForm = isAutoSave ? debouncedFormData : formData;
      const currentContent = isAutoSave ? debouncedBlockNoteContent : blockNoteContent;
      const currentTags = isAutoSave ? debouncedTags : selectedTags;
      const currentMode = isAutoSave ? debouncedEntryMode : entryMode;
      const currentExtUrl = isAutoSave ? debouncedExternalUrl : externalUrl;
      const currentPlat = isAutoSave ? debouncedPlatform : platform;

      if (!currentForm.title.trim()) return;
      setIsSaving(true);

      try {
        const md = editorRef.current ? await blocksToMarkdown(editorRef.current) : '';
        const calculatedReadingTime = Math.max(1, Math.ceil(md.split(/\s+/).filter(Boolean).length / 200));

        // Determine published/unlisted state
        const targetPublished =
          visibilityOverride !== undefined
            ? visibilityOverride !== 'draft'
            : currentForm.published;
        const targetUnlisted =
          visibilityOverride !== undefined
            ? visibilityOverride === 'unlisted'
            : currentForm.unlisted;

        // Auto-generate OG if empty
        const autoOgTitle = currentForm.title;
        const autoOgDescription = (currentForm.excerpt || stripMarkdown(md)).slice(0, 160);
        const autoOgImage = currentForm.image_url || firstImageFromMarkdown(md) || '';

        // Store external article metadata in its dedicated columns; video fields remain video-only.
        const encoded = encodeArticleExternalMeta({
          isExternal: currentMode === 'external',
          externalUrl: currentExtUrl.trim(),
          platform: currentPlat,
        });
        const legacyArticleMetaInVideoFields =
          currentForm.video_type.startsWith('external:') ||
          currentForm.video_type.startsWith('internal|');

        const blogData: any = {
          title: currentForm.title.trim(),
          slug: currentForm.slug.trim(),
          excerpt: currentForm.excerpt,
          content: md,
          content_jsonb: currentContent,
          image_url: currentForm.image_url || null,
          is_external: encoded.is_external,
          external_url: encoded.external_url,
          platform: encoded.platform,
          pillar: null,
          video_url: legacyArticleMetaInVideoFields ? null : currentForm.video_url || null,
          video_type: legacyArticleMetaInVideoFields ? null : currentForm.video_type || null,
          category_id: currentForm.category_id || null,
          series_id: currentForm.series_id || null,
          series_order: currentForm.series_order,
          published: targetPublished,
          unlisted: targetUnlisted,
          reading_time: currentForm.reading_time || calculatedReadingTime,
          og_title: currentForm.og_title || autoOgTitle,
          og_description: currentForm.og_description || autoOgDescription,
          og_image: currentForm.og_image || autoOgImage || null,
        };

        let savedId = id;
        if (id) {
          const { error } = await supabase.from('blog_posts').update(blogData).eq('id', id);
          if (error) throw error;
          await associateBlogPostTags(id, currentTags);
        } else {
          const { data, error } = await supabase
            .from('blog_posts')
            .insert([blogData])
            .select()
            .single();
          if (error) throw error;
          savedId = data.id;
          await associateBlogPostTags(data.id, currentTags);
        }

        setLastSavedAt(new Date());

        const updatedFormState = {
          ...currentForm,
          published: targetPublished,
          unlisted: targetUnlisted,
          reading_time: blogData.reading_time,
          video_type: legacyArticleMetaInVideoFields ? '' : currentForm.video_type,
          video_url: legacyArticleMetaInVideoFields ? '' : currentForm.video_url,
        };

        setFormData(updatedFormState);
        setLastSaved({
          formData: updatedFormState,
          content: currentContent,
          tags: currentTags,
          entryMode: currentMode,
          externalUrl: currentExtUrl,
          platform: currentPlat,
        });

        if (!isAutoSave) {
          toast({
            title: id ? 'Article updated successfully!' : 'Article created successfully!',
            description: targetPublished ? 'Post is published and live.' : 'Draft saved.',
          });
          if (!id && savedId) {
            navigate(`/admin/blog/edit/${savedId}`, { replace: true });
          }
        }
      } catch (error: any) {
        console.error('Save error:', error);
        if (!isAutoSave) {
          toast({
            title: 'Error saving article',
            description: error.message,
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
      entryMode,
      externalUrl,
      platform,
      debouncedFormData,
      debouncedBlockNoteContent,
      debouncedTags,
      debouncedEntryMode,
      debouncedExternalUrl,
      debouncedPlatform,
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
        handleSaveRef.current?.(undefined, false)?.catch(console.error);
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
      JSON.stringify(debouncedTags) !== JSON.stringify(lastSaved.tags) ||
      debouncedEntryMode !== lastSaved.entryMode ||
      debouncedExternalUrl !== lastSaved.externalUrl ||
      debouncedPlatform !== lastSaved.platform;

    if (hasChanges && debouncedFormData.title.trim()) {
      setLastSaved({
        formData: debouncedFormData,
        content: debouncedBlockNoteContent,
        tags: debouncedTags,
        entryMode: debouncedEntryMode,
        externalUrl: debouncedExternalUrl,
        platform: debouncedPlatform,
      });
      handleSaveRef.current?.(undefined, true)?.catch(console.error);
    }
  }, [
    id,
    debouncedFormData,
    debouncedBlockNoteContent,
    debouncedTags,
    debouncedEntryMode,
    debouncedExternalUrl,
    debouncedPlatform,
    lastSaved,
  ]);

  const copyArticleLink = async () => {
    if (!formData.slug) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/articles/${formData.slug}`);
      toast({ title: 'Article link copied to clipboard!' });
    } catch {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };

  const currentVisibility: PostVisibility = !formData.published
    ? 'draft'
    : formData.unlisted
    ? 'unlisted'
    : 'published';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f5] text-zinc-900 p-8">
        <PerformanceSkeleton variant="editor" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f5] text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900 antialiased font-sans">
      {/* 1. TOP STICKY ACTION BAR (h-14) */}
      <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-xl border-b border-zinc-200/90 px-4 sm:px-6 flex items-center justify-between gap-3 text-zinc-900 shadow-2xs">
        {/* Left: Back + Save Status + Word Count & Reading Time */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/admin?tab=blogs')}
            className="group inline-flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors px-2 py-1.5 rounded-md hover:bg-zinc-100 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to All Articles Database</span>
            <span className="sm:hidden">All Articles</span>
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

          {/* Live Word Count & Reading Time */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-zinc-500 shrink-0">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* Right: Focus Mode + SEO Drawer + Save Draft + Publish */}
        <div className="flex items-center gap-2 shrink-0">
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
            variant="ghost"
            size="sm"
            onClick={() => setSeoDrawerOpen(true)}
            className="h-8 px-2.5 text-xs font-mono text-zinc-700 hover:text-zinc-900 border border-zinc-300 hover:bg-zinc-100"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            <span>SEO</span>
          </Button>

          {currentVisibility !== 'draft' && formData.slug && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs font-mono text-zinc-700 hover:text-zinc-900 border border-zinc-300 hover:bg-zinc-100 hidden md:inline-flex"
            >
              <Link href={`/articles/${formData.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                <span>View</span>
              </Link>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleSave('draft', false)}
            disabled={isSaving || !formData.title.trim()}
            className="h-8 px-3 text-xs font-mono text-zinc-700 hover:text-zinc-900 border border-zinc-300 bg-white hover:bg-zinc-50 shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Draft</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSave('published', false)}
            disabled={isSaving || !formData.title.trim()}
            className="h-8 px-4 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 shadow-xs transition-all"
          >
            {currentVisibility === 'published' ? 'Update Post' : 'Publish'}
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
              alt="Featured Cover"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
              <span className="text-xs font-mono text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                Featured Cover Image
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
                <span>Add Cover Image</span>
              </button>
            </div>
          )
        )}

        {/* Large Notion Editable Title */}
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
          placeholder="Untitled Article..."
          className="w-full bg-transparent border-none px-0 py-2 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:outline-none leading-tight tracking-tight"
        />

        {/* Slug Preview directly under title */}
        <div className="flex items-center gap-2 mt-1 mb-4 text-xs font-mono text-zinc-500">
          <span>/articles/</span>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="article-slug"
            className="bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-500 text-zinc-800 focus:text-zinc-900 focus-visible:outline-none px-1 py-0.5 transition-colors font-mono"
          />
          {formData.slug && (
            <button
              type="button"
              onClick={copyArticleLink}
              title="Copy public URL"
              className="p-1 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. COMPACT NOTION INLINE PAGE PROPERTIES TABLE */}
        <div
          className={cn(
            "border-y border-zinc-200 py-4 my-6 space-y-4 transition-all",
            focusMode && "hidden"
          )}
        >
          {/* Entry Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>Entry Mode</span>
            </div>
            <div className="flex-1">
              <div className="inline-flex p-1 rounded-lg bg-zinc-100 border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setEntryMode('internal')}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md font-mono transition-all",
                    entryMode === 'internal'
                      ? "bg-white text-zinc-900 font-semibold shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  📝 Internal BlockNote Article
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('external')}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md font-mono transition-all",
                    entryMode === 'external'
                      ? "bg-white text-zinc-900 font-semibold shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  🔗 External Redirect Article
                </button>
              </div>
            </div>
          </div>

          {/* Publication Platform (External mode only) */}
          {entryMode === 'external' && (
            <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
              <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>Platform</span>
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {PLATFORMS.map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatform(plat)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md font-mono transition-all border",
                      platform === plat
                        ? "bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* External Source URL + Fetch OpenGraph Metadata (External mode only) */}
          {entryMode === 'external' && (
            <div className="flex flex-col sm:flex-row sm:items-start py-1 gap-2 sm:gap-4">
              <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 pt-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                <span>External URL</span>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://medium.com/@username/article-slug..."
                  className="h-8 bg-white border-zinc-300 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleImportExternal}
                  disabled={isImporting || !externalUrl.trim()}
                  className="h-8 px-3 text-xs font-mono shrink-0 bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-300 shadow-2xs"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      <span>Fetching…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                      <span>Fetch OpenGraph Metadata</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Category & Series */}
          <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
              <Folder className="w-3.5 h-3.5 text-zinc-400" />
              <span>Category</span>
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <Select
                value={formData.category_id || 'none'}
                onValueChange={(val) => setFormData((p) => ({ ...p, category_id: val === 'none' ? '' : val }))}
              >
                <SelectTrigger className="w-48 h-8 bg-white border-zinc-300 text-xs text-zinc-900">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-lg">
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Inline Create Category */}
              <div className="flex items-center gap-1.5">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="h-8 w-36 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!newCategoryName.trim()}
                  onClick={async () => {
                    if (!newCategoryName.trim()) return;
                    try {
                      const newCat = await createOrGetCategory(newCategoryName);
                      if (newCat) {
                        setCategories((prev) => [...prev, newCat]);
                        setFormData((prev) => ({ ...prev, category_id: newCat.id }));
                        setNewCategoryName('');
                        toast({ title: 'Category created!' });
                      }
                    } catch {
                      toast({ title: 'Failed to create category', variant: 'destructive' });
                    }
                  }}
                  className="h-8 px-2 text-xs border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Series */}
          <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
              <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
              <span>Series</span>
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <Select
                value={formData.series_id || 'none'}
                onValueChange={(val) => setFormData((p) => ({ ...p, series_id: val === 'none' ? '' : val }))}
              >
                <SelectTrigger className="w-48 h-8 bg-white border-zinc-300 text-xs text-zinc-900">
                  <SelectValue placeholder="Select Series" />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-lg">
                  <SelectItem value="none">No Series</SelectItem>
                  {series.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewSeriesDialog(true)}
                className="h-8 px-2.5 text-xs font-mono border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>New Series</span>
              </Button>

              {formData.series_id && formData.series_id !== 'none' && (
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs font-mono text-zinc-500">Order:</span>
                  <Input
                    type="number"
                    min="1"
                    value={formData.series_order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        series_order: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-14 h-8 bg-white border-zinc-300 text-xs text-center text-zinc-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col sm:flex-row sm:items-center py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>Visibility</span>
            </div>
            <div className="flex-1 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="published-toggle"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, published: checked }))
                  }
                />
                <Label htmlFor="published-toggle" className="text-xs font-mono cursor-pointer text-zinc-800">
                  Published
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="unlisted-toggle"
                  checked={formData.unlisted}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, unlisted: checked }))
                  }
                />
                <Label htmlFor="unlisted-toggle" className="text-xs font-mono cursor-pointer text-zinc-800">
                  Unlisted
                </Label>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-xs capitalize ml-auto",
                  currentVisibility === 'published' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                  currentVisibility === 'unlisted' && "bg-amber-50 text-amber-700 border-amber-200",
                  currentVisibility === 'draft' && "bg-zinc-100 text-zinc-600 border-zinc-200"
                )}
              >
                {currentVisibility}
              </Badge>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col sm:flex-row sm:items-start py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 pt-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Tags</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Add a tag..."
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

          {/* Excerpt */}
          <div className="flex flex-col sm:flex-row sm:items-start py-1 gap-2 sm:gap-4">
            <div className="w-44 shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 pt-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>Excerpt</span>
            </div>
            <div className="flex-1">
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Brief summary used on article cards and social previews..."
                rows={2}
                className="bg-white border-zinc-300 text-zinc-900 text-xs sm:text-sm placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 resize-y"
              />
            </div>
          </div>

          {/* Collapsible SEO & OpenGraph Overrides */}
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
              <span>SEO & OpenGraph Overrides ({formData.og_title || formData.og_description ? 'Customized' : 'Default'})</span>
            </button>

            {showSeoOverrides && (
              <div className="mt-3 pl-4 sm:pl-6 border-l border-zinc-200 space-y-3 pt-1">
                <div>
                  <Label className="text-xs font-mono text-zinc-600">OG Title</Label>
                  <Input
                    value={formData.og_title}
                    onChange={(e) => setFormData((p) => ({ ...p, og_title: e.target.value }))}
                    placeholder={formData.title || "Social title..."}
                    className="h-8 mt-1 bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <Label className="text-xs font-mono text-zinc-600">OG Description</Label>
                  <Textarea
                    value={formData.og_description}
                    onChange={(e) => setFormData((p) => ({ ...p, og_description: e.target.value }))}
                    placeholder={formData.excerpt || "Social description..."}
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

        {/* 4. DISTRACTION-FREE @BLOCKNOTE/REACT SLASH-COMMAND CANVAS */}
        <section className="pt-4 min-h-[60vh]">
          {entryMode === 'external' && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
              <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">External Redirect Article</p>
                <p className="text-blue-800 mt-0.5 leading-relaxed">
                  Readers who click this article on your portfolio will be redirected to{" "}
                  <span className="font-mono underline font-medium">
                    {externalUrl || "the external source URL"}
                  </span>
                  . You can still use this BlockNote canvas below to write your synopsis, outline, or cross-post content.
                </p>
              </div>
            </div>
          )}

          <div className="prose max-w-none bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs">
            <BlockNoteEditorComponent
              initialContent={blockNoteContent}
              loading={contentLoading}
              onChange={setBlockNoteContent}
              onEditorReady={onEditorReady}
              placeholder="Press '/' for commands..."
              className="min-h-[60vh]"
            />
          </div>
        </section>
      </main>

      {/* COVER IMAGE MODAL */}
      <Dialog open={showCoverModal} onOpenChange={setShowCoverModal}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900 max-w-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display text-zinc-900">Featured Cover Image</DialogTitle>
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
                  placeholder="https://example.com/cover.jpg"
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                  className="h-8 bg-white border-zinc-300 text-xs text-zinc-900"
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

      {/* CREATE NEW SERIES MODAL */}
      <Dialog open={showNewSeriesDialog} onOpenChange={setShowNewSeriesDialog}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900 max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-display text-zinc-900">Create New Article Series</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs font-mono text-zinc-700">Title *</Label>
              <Input
                value={newSeries.title}
                onChange={(e) => setNewSeries((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. S&OP Masterclass"
                className="h-8 mt-1 bg-white border-zinc-300 text-xs text-zinc-900"
              />
            </div>
            <div>
              <Label className="text-xs font-mono text-zinc-700">Slug (Optional)</Label>
              <Input
                value={newSeries.slug}
                onChange={(e) => setNewSeries((p) => ({ ...p, slug: e.target.value }))}
                placeholder="sop-masterclass"
                className="h-8 mt-1 bg-white border-zinc-300 text-xs text-zinc-900"
              />
            </div>
            <div>
              <Label className="text-xs font-mono text-zinc-700">Description</Label>
              <Textarea
                value={newSeries.description}
                onChange={(e) => setNewSeries((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="A dedicated deep-dive into..."
                className="mt-1 bg-white border-zinc-300 text-xs text-zinc-900"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={createNewSeries}
                className="flex-1 h-8 text-xs bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Create Series
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewSeriesDialog(false)}
                className="h-8 text-xs border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SEO DRAWER */}
      <Sheet open={seoDrawerOpen} onOpenChange={setSeoDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-zinc-200 text-zinc-900 w-full sm:max-w-md p-6 space-y-6 shadow-2xl">
          <SheetHeader>
            <SheetTitle className="text-lg font-display flex items-center gap-2 text-zinc-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              SEO & Social Sharing Preview
            </SheetTitle>
            <SheetDescription className="text-xs font-mono text-zinc-500">
              Customize how this article appears on Google, LinkedIn, Twitter, and messaging apps.
            </SheetDescription>
          </SheetHeader>

          {/* Live Preview Card */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 overflow-hidden p-3 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Search & Social Card Preview</span>
            <div className="aspect-[1.91/1] w-full bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 relative flex items-center justify-center">
              {formData.og_image || formData.image_url ? (
                <img
                  src={formData.og_image || formData.image_url}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <Share2 className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                  <span className="text-xs font-mono text-zinc-400">No OG image configured</span>
                </div>
              )}
            </div>
            <div className="space-y-1 pt-1">
              <p className="text-xs font-mono text-zinc-500 truncate">
                {window?.location?.hostname || 'essaahmed.dev'} › articles › {formData.slug || 'slug'}
              </p>
              <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">
                {formData.og_title || formData.title || 'Untitled Post'}
              </h4>
              <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                {formData.og_description || formData.excerpt || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono text-zinc-700">OG Title</Label>
                <span className="text-[10px] font-mono text-zinc-500">
                  {(formData.og_title || formData.title).length}/60 chars
                </span>
              </div>
              <Input
                value={formData.og_title}
                onChange={(e) => setFormData((p) => ({ ...p, og_title: e.target.value }))}
                placeholder={formData.title || 'Defaults to article title'}
                className="h-8 mt-1.5 bg-white border-zinc-300 text-xs text-zinc-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono text-zinc-700">OG Description</Label>
                <span className="text-[10px] font-mono text-zinc-500">
                  {(formData.og_description || formData.excerpt).length}/160 chars
                </span>
              </div>
              <Textarea
                value={formData.og_description}
                onChange={(e) => setFormData((p) => ({ ...p, og_description: e.target.value }))}
                placeholder={formData.excerpt || 'Defaults to excerpt or opening paragraph'}
                rows={3}
                className="mt-1.5 bg-white border-zinc-300 text-xs text-zinc-900 leading-relaxed"
              />
            </div>

            <div>
              <Label className="text-xs font-mono text-zinc-700">OG Image URL</Label>
              <Input
                value={formData.og_image}
                onChange={(e) => setFormData((p) => ({ ...p, og_image: e.target.value }))}
                placeholder={formData.image_url || 'Defaults to cover image'}
                className="h-8 mt-1.5 bg-white border-zinc-300 text-xs text-zinc-900"
              />
            </div>

            <Button
              type="button"
              onClick={() => {
                setSeoDrawerOpen(false);
                toast({ title: 'SEO overrides saved in draft!' });
              }}
              className="w-full h-8 text-xs font-mono bg-zinc-900 text-white hover:bg-zinc-800 mt-4 shadow-xs"
            >
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BlogEditorEnhanced;
