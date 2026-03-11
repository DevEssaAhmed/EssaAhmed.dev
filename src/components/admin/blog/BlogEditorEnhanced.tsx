"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import { cn } from '@/lib/utils';

import { useNavigate, useParams } from '@/lib/router-compat';
import { useDebounce } from '@/hooks/use-debouncer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Settings,
  Image as ImageIcon,
  Hash,
  Clock,
  Tag,
  Plus,
  X,
  Focus,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createOrGetCategory, getAllCategories, associateBlogPostTags, getBlogPostTags } from '@/lib/tagUtils';
import FileUpload from '@/components/FileUpload';
import BlockNoteEditorComponent, { BlockNoteContent, markdownToBlocks, blocksToMarkdown } from '@/components/editor/BlockNoteEditor';
import { BlockNoteEditor } from '@blocknote/core';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { PerformanceSkeleton } from '@/components/ui/performance-skeleton';

// Helpers for OG auto-generation
const stripMarkdown = (md: string) => md
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

const BlogEditorEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [blockNoteContent, setBlockNoteContent] = useState<BlockNoteContent>([]);
  const [showNewSeriesDialog, setShowNewSeriesDialog] = useState(false);
  const [newSeries, setNewSeries] = useState({ title: '', slug: '', description: '' });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    image_url: '',
    video_url: '',
    video_type: 'youtube',
    category_id: '',
    category_name: '',
    series_id: '',
    series_order: 1,
    published: false,
    reading_time: 5,
    og_title: '',
    og_description: '',
    og_image: '',
  });

  // BlockNote editor reference
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const [contentLoading, setContentLoading] = useState(!!id);

  // Stable ref to latest handleSave, used by the Ctrl+S listener to avoid stale closures
  const handleSaveRef = useRef<((isPublishing: boolean, isAutoSave?: boolean) => Promise<void>) | null>(null);

  // Stable callback for onEditorReady — must be at component scope to avoid
  // creating a new function reference on every render, which triggers focus loss.
  const onEditorReady = useCallback((editor: BlockNoteEditor) => {
    editorRef.current = editor;
  }, []);

  // Last save timestamp for display
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Debounced mirrors for autosave behavior
  const debouncedBlockNoteContent = useDebounce(blockNoteContent, 3000);
  const debouncedFormData = useDebounce(formData, 3000);
  const debouncedTags = useDebounce(selectedTags, 3000);

  // Track last saved version (seeded by fetchProject to prevent spurious saves on load)
  const [lastSaved, setLastSaved] = useState<{
    formData: typeof formData;
    content: BlockNoteContent;
    tags: string[];
  } | null>(null);

  const loadCategories = useCallback(async () => {
    try { const allCategories = await getAllCategories(); setCategories(allCategories || []); }
    catch (err) { console.error('Error loading categories', err); setCategories([]); }
  }, []);

  const loadSeries = useCallback(async () => {
    try {
      const { data: seriesData, error: seriesError } = await supabase.from('series').select('*').order('title');
      if (seriesError) { console.error('Error fetching series:', seriesError); } else { setSeries(seriesData || []); }
    } catch (error) { console.error('Error loading series:', error); setSeries([]); }
  }, []);

  const fetchBlogPost = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`*, categories (id, name), series (id, title)`)
        .eq('id', id)
        .single();
      if (error) throw error;

      const loadedFormData = {
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        image_url: data.image_url || '',
        video_url: data.video_url || '',
        video_type: data.video_type || 'youtube',
        category_id: data.category_id || '',
        category_name: '',
        series_id: data.series_id || '',
        series_order: data.series_order || 1,
        published: data.published || false,
        reading_time: data.reading_time || 5,
        og_title: (data as any).og_title || '',
        og_description: (data as any).og_description || '',
        og_image: (data as any).og_image || '',
      };
      setFormData(loadedFormData);

      let loadedTags: string[] = [];
      if (id) {
        const tags = await getBlogPostTags(id);
        loadedTags = tags.map((tag: any) => tag.name as string);
        setSelectedTags(loadedTags);
      }

      // Load content - check if BlockNote format (array) or old Yoopta format (object)
      let contentToSet: BlockNoteContent = [];
      const contentJsonb = data.content_jsonb;
      const contentMd = data.content;

      if (contentJsonb && Array.isArray(contentJsonb) && contentJsonb.length > 0) {
        // Already BlockNote format
        contentToSet = contentJsonb as BlockNoteContent;
      } else if (contentJsonb && typeof contentJsonb === 'object' && !Array.isArray(contentJsonb) && Object.keys(contentJsonb).length > 0) {
        // Old Yoopta format - convert from markdown
        if (contentMd && contentMd.trim()) {
          contentToSet = markdownToBlocks(contentMd) as BlockNoteContent;
        }
      } else if (contentMd && contentMd.trim()) {
        // Just markdown
        contentToSet = markdownToBlocks(contentMd) as BlockNoteContent;
      }

      if (contentToSet.length > 0) {
        setBlockNoteContent(contentToSet);
      }
      setContentLoading(false);

      // Seed lastSaved so the first debounce tick doesn't trigger a spurious autosave
      setLastSaved({ formData: loadedFormData, content: contentToSet, tags: loadedTags });
    } catch (error: any) {
      console.error('Fetch post error:', error);
      toast({ title: 'Error loading blog post', description: error.message, variant: 'destructive' });
      navigate('/admin');
    } finally { setIsLoading(false); setContentLoading(false); }
  }, [id, navigate, toast]);

  useEffect(() => {
    void loadCategories();
    void loadSeries();
    if (id) void fetchBlogPost();
  }, [id, loadCategories, loadSeries, fetchBlogPost]);

  useEffect(() => {
    if (formData.title && !id) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, id]);

  const handleAddTag = () => { if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) { setSelectedTags(prev => [...prev, tagInput.trim()]); setTagInput(''); } };
  const handleRemoveTag = (tagToRemove: string) => { setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove)); };
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } };

  // Autosave: fire when debounced state differs from lastSaved snapshot.
  // NOTE: isSaving is intentionally excluded from deps — adding it causes a
  // re-run loop (save starts → isSaving=true → effect reruns → isSaving=false → effect reruns)
  useEffect(() => {
    if (!id) return;
    if (!lastSaved) return; // not seeded yet, skip

    const hasChanges =
      JSON.stringify(debouncedFormData) !== JSON.stringify(lastSaved.formData) ||
      JSON.stringify(debouncedBlockNoteContent) !== JSON.stringify(lastSaved.content) ||
      JSON.stringify(debouncedTags) !== JSON.stringify(lastSaved.tags);

    if (hasChanges && debouncedFormData.title.trim()) {
      const snapshot = {
        formData: debouncedFormData,
        content: debouncedBlockNoteContent,
        tags: debouncedTags,
      };
      // Update lastSaved immediately to prevent double-fires while the async save runs
      setLastSaved(snapshot);
      (async () => {
        try {
          if (handleSaveRef.current) await handleSaveRef.current(debouncedFormData.published as unknown as boolean, true);
        } catch (err) {
          console.error('Autosave error:', err);
        }
      })();
    }

  }, [id, debouncedFormData, debouncedBlockNoteContent, debouncedTags, lastSaved]);

  // Ctrl/Cmd+S keyboard shortcut - uses a ref to always call the latest handleSave
  // without needing it in the deps array (avoids stale closures / [object Event] error)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (handleSaveRef.current) handleSaveRef.current(formData.published, false).catch(console.error);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // Empty deps is intentional — we use handleSaveRef to access the latest save fn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNewSeries = async () => {
    if (!newSeries.title) return;
    try {
      const seriesSlug = newSeries.slug || newSeries.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const { data, error } = await supabase.from('series').insert([{ title: newSeries.title, slug: seriesSlug, description: newSeries.description, status: 'active' }]).select().single();
      if (error) {
        console.error('Error creating series:', error);
        const mockId = (series.length + 1).toString();
        const newSeriesItem = { id: mockId, title: newSeries.title, slug: seriesSlug, description: newSeries.description };
        setSeries(prev => [...prev, newSeriesItem]);
        setFormData(prev => ({ ...prev, series_id: mockId }));
        toast({ title: 'Series created successfully (demo mode)' });
      } else {
        setSeries(prev => [...prev, data]);
        setFormData(prev => ({ ...prev, series_id: data.id }));
        toast({ title: 'Series created successfully' });
      }
      setShowNewSeriesDialog(false);
      setNewSeries({ title: '', slug: '', description: '' });
    } catch (error) {
      console.error('Error creating series:', error);
      toast({ title: 'Error creating series', description: 'Please try again', variant: 'destructive' });
    }
  };

  const estimateReadingTime = (markdown: string): number => {
    const words = markdown.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleSave = useCallback(async (isPublishing: boolean, isAutoSave = false) => {
    const dataToSave = isAutoSave ? debouncedFormData : formData;
    const contentToSave = isAutoSave ? debouncedBlockNoteContent : blockNoteContent;
    const tagsToSave = isAutoSave ? debouncedTags : selectedTags;

    if (!dataToSave.title.trim()) return;
    setIsSaving(true);
    try {
      const md = editorRef.current ? await blocksToMarkdown(editorRef.current) : '';
      const readingTime = estimateReadingTime(md);

      // Auto-generate OG if empty
      const autoOgTitle = dataToSave.title;
      const autoOgDescription = (dataToSave.excerpt || stripMarkdown(md)).slice(0, 160);
      const autoOgImage = dataToSave.image_url || firstImageFromMarkdown(md) || '';

      const blogData: any = {
        title: dataToSave.title,
        slug: dataToSave.slug,
        excerpt: dataToSave.excerpt,
        content: md,
        content_jsonb: contentToSave,
        image_url: dataToSave.image_url,
        video_url: dataToSave.video_url,
        video_type: dataToSave.video_type,
        category_id: dataToSave.category_id || null,
        series_id: dataToSave.series_id || null,
        series_order: dataToSave.series_order,
        published: isPublishing,
        reading_time: readingTime,
        og_title: dataToSave.og_title || autoOgTitle,
        og_description: dataToSave.og_description || autoOgDescription,
        og_image: dataToSave.og_image || autoOgImage || null,
      };

      if (id) {
        const { error } = await supabase.from('blog_posts').update(blogData).eq('id', id);
        if (error) throw error;
        await associateBlogPostTags(id, tagsToSave);
        setLastSavedAt(new Date());
        if (!isAutoSave) toast({ title: 'Blog post updated successfully!' });
      } else {
        const { data, error } = await supabase.from('blog_posts').insert([blogData]).select().single();
        if (error) throw error;
        await associateBlogPostTags(data.id, tagsToSave);
        setLastSavedAt(new Date());
        if (!isAutoSave) {
          toast({ title: 'Blog post created successfully!' });
          navigate(`/admin/blog/edit/${data.id}`);
        }
      }
    } catch (error: any) {
      if (!isAutoSave) toast({ title: 'Error saving blog post', description: error.message, variant: 'destructive' });
      console.error('Save error:', error);
    } finally { setIsSaving(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, formData, blockNoteContent, selectedTags, debouncedFormData, debouncedBlockNoteContent, debouncedTags]);

  // Keep the ref always pointing at the latest handleSave
  useEffect(() => { handleSaveRef.current = handleSave; }, [handleSave]);

  const handleImageUpload = (urls: string[]) => { if (urls.length > 0) setFormData(prev => ({ ...prev, image_url: urls[0] })); };
  const handleVideoUpload = (urls: string[]) => { if (urls.length > 0) { setFormData(prev => ({ ...prev, video_url: urls[0], video_type: urls[0].includes('youtube') || urls[0].includes('vimeo') ? 'external' : 'file' })); } };

  if (isLoading) {
    return (
      <AdminLayout title="Blog Editor" subtitle="Loading..." fullWidthContent={focusMode}>
        <PerformanceSkeleton variant="editor" className="animate-fade-up" />
      </AdminLayout>
    );
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link href="/admin">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </Button>
      <div className="hidden md:flex items-center gap-2 mr-2">
        <div
          className={`w-2 h-2 rounded-full transition-colors ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}
        />
        <span className='text-xs text-muted-foreground mr-4'>
          {isSaving
            ? 'Saving…'
            : lastSavedAt
              ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : id
                ? 'Saved'
                : 'Ready'}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-2">
        <Settings className="w-4 h-4" /> Settings
      </Button>
      <Button variant={focusMode ? 'default' : 'outline'} size="sm" onClick={() => setFocusMode((v) => !v)} className="gap-2 hidden md:inline-flex">
        <Focus className="w-4 h-4" /> {focusMode ? 'Exit Focus' : 'Focus'}
      </Button>
      <Button variant="outline" size="sm" className="gap-2" disabled={!formData.title}>
        <Eye className="w-4 h-4" /> Preview
      </Button>
      <Button size="sm" onClick={() => handleSave(false, false)} disabled={isSaving || !formData.title} className="gap-2">
        <Save className="w-4 h-4" /> Save Draft
      </Button>
      {!formData.published && (
        <Button size="sm" onClick={() => handleSave(true, false)} disabled={isSaving || !formData.title} className="gap-2">
          <Save className="w-4 h-4" /> Publish
        </Button>
      )}
    </div>
  );

  return (
    <AdminLayout title="Blog Editor" subtitle={id ? 'Editing post' : 'Create new post'} actions={actions} fullWidthContent={focusMode}>
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
              placeholder="Post Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight border-none bg-transparent px-0 h-auto py-2 placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 leading-tight"
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
            'w-full lg:w-[300px] shrink-0 space-y-6 transition-all duration-500',
            focusMode ? 'opacity-0 translate-x-8 pointer-events-none hidden' : 'opacity-100 translate-x-0 block'
          )}
        >
          <div className="sticky top-24 space-y-6 pb-24 animate-slide-in-right">

            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden animate-scale-in delay-300">
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                  <Hash className="w-3.5 h-3.5" /> Post Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Slug</Label>
                    <Input value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} className="mt-1" placeholder="blog-post-slug" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Excerpt (Optional)</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      className="mt-1"
                      placeholder="Brief summary used on article cards..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden animate-scale-in delay-300">
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                  <Clock className="w-3.5 h-3.5" /> Publishing
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge
                      variant={formData.published ? 'default' : 'secondary'}
                      className={cn(
                        "transition-all duration-200",
                        formData.published && "bg-gradient-primary text-primary-foreground shadow-glow"
                      )}
                    >
                      {formData.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      Reading Time
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.reading_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                        className="w-16 h-8 text-center border-muted focus:border-primary/50 transition-colors"
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                  <Tag className="w-3.5 h-3.5" /> Categories & Series
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={formData.category_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value === 'none' ? '' : value }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((category: any) => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Create New Category</Label>
                    <div className="flex gap-2 mt-1"><Input value={formData.category_name} onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))} placeholder="Category name" className="flex-1" /><Button size="sm" variant="outline" onClick={async () => { if (!formData.category_name.trim()) return; try { const newCategory = await createOrGetCategory(formData.category_name); if (newCategory) { setCategories(prev => [...prev, newCategory]); setFormData(prev => ({ ...prev, category_id: newCategory.id, category_name: '' })); toast({ title: 'Category created successfully!' }); } } catch { toast({ title: 'Error creating category', description: 'Failed to create new category', variant: 'destructive' }); } }} disabled={!formData.category_name.trim()}><Plus className="w-4 h-4" /></Button></div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Series (Optional)</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={formData.series_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, series_id: value === 'none' ? '' : value }))}>
                        <SelectTrigger><SelectValue placeholder="Select a series" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Series</SelectItem>
                          {series.map((s) => (<SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <Dialog open={showNewSeriesDialog} onOpenChange={setShowNewSeriesDialog}>
                        <DialogTrigger asChild><Button type="button" variant="outline" size="sm"><Plus className="w-4 h-4" /></Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Create New Series</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div><Label htmlFor="series-title">Title *</Label><Input id="series-title" value={newSeries.title} onChange={(e) => setNewSeries({ ...newSeries, title: e.target.value })} required /></div>
                            <div><Label htmlFor="series-description">Description</Label><Textarea id="series-description" value={newSeries.description} onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })} rows={3} /></div>
                            <div className="flex gap-2 pt-4"><Button onClick={createNewSeries} className="flex-1">Create Series</Button><Button type="button" variant="outline" onClick={() => setShowNewSeriesDialog(false)}>Cancel</Button></div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {formData.series_id && formData.series_id !== 'none' && (<div className="mt-2"><Label className="text-sm">Order in Series</Label><Input type="number" min="1" value={formData.series_order} onChange={(e) => setFormData(prev => ({ ...prev, series_order: parseInt(e.target.value) || 1 }))} className="mt-1" /></div>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                  <Hash className="w-3.5 h-3.5" /> Tags
                </h3>
                <div className="flex gap-2 mb-3"><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Add a tag..." className="flex-1" /><Button size="sm" variant="outline" onClick={handleAddTag} disabled={!tagInput.trim() || selectedTags.includes(tagInput.trim())}><Plus className="w-4 h-4" /></Button></div>
                <div className="flex flex-wrap gap-2">{selectedTags.map((tag, index) => (<Badge key={index} variant="secondary" className="gap-1">{tag}<button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button></Badge>))}</div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                  <ImageIcon className="w-3.5 h-3.5" /> Media
                </h3>
                <div className="space-y-4">
                  <FileUpload label="Featured Image" uploadType="image" onUploadComplete={handleImageUpload} maxFiles={1} existingFiles={formData.image_url ? [formData.image_url] : []} simultaneousMode={true} urlInputPlaceholder="https://example.com/image.jpg" enableImageEditing={true} />
                  <FileUpload label="Video (Optional)" uploadType="video" onUploadComplete={handleVideoUpload} maxFiles={1} existingFiles={formData.video_url ? [formData.video_url] : []} simultaneousMode={true} urlInputPlaceholder="https://youtube.com/watch?v=... or direct video URL" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4">SEO Overrides</h3>
                <div className="space-y-4">
                  <div><Label>OG Title</Label><Input value={formData.og_title} onChange={(e) => setFormData(prev => ({ ...prev, og_title: e.target.value }))} placeholder="Custom title for social shares" /></div>
                  <div><Label>OG Description</Label><Textarea value={formData.og_description} onChange={(e) => setFormData(prev => ({ ...prev, og_description: e.target.value }))} rows={3} placeholder="Custom description for social shares" /></div>
                  <div><Label>OG Image URL</Label><Input value={formData.og_image} onChange={(e) => setFormData(prev => ({ ...prev, og_image: e.target.value }))} placeholder="https://..." /></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogEditorEnhanced;




