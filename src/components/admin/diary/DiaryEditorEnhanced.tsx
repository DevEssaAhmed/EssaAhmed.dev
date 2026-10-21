"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlignLeft,
  Save,
  Check,
  Loader2,
  Columns,
  Pencil,
  FileText,
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  Code,
  Link as LinkIcon,
  Tag,
  X,
  Sparkles,
} from "lucide-react";

export default function DiaryEditorEnhanced() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEditing = Boolean(id && id !== "new");

  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");
  const [showUploader, setShowUploader] = useState(false);

  // Form State
  const [currentId, setCurrentId] = useState<string | null>(isEditing ? (id as string) : null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [isPublished, setIsPublished] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [topicTag, setTopicTag] = useState("Engineering & Reflections");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing entry
  useEffect(() => {
    if (!isEditing || !id) {
      setIsLoading(false);
      return;
    }

    const targetId: string = id;
    let isMounted = true;

    async function loadEntry(entryId: string) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("diary_entries")
          .select("*")
          .eq("id", entryId)
          .single();

        if (error) throw error;
        if (data && isMounted) {
          setCurrentId(data.id);
          setTitle(data.title || "");
          setContent(data.content || "");
          setEntryDate(data.entry_date || new Date().toISOString().slice(0, 10));
          setIsPublished(Boolean(data.is_published));
          setImageUrl(data.image_url || "");
          setImageAlt(data.image_alt || "");
          setExcerpt(data.excerpt || "");
          setTopicTag(data.topic_tag || "Engineering & Reflections");
        }
      } catch (err: any) {
        console.error("Failed to load diary entry:", err);
        toast({
          title: "Error loading entry",
          description: err.message || "Could not retrieve the diary entry.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadEntry(targetId);
    return () => {
      isMounted = false;
    };
  }, [id, isEditing, toast]);

  // Word count & reading time
  const stats = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) return { words: 0, characters: 0, readTime: 1 };
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const characters = trimmed.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readTime };
  }, [content]);

  // Markdown toolbar action
  const insertMarkdown = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end) || defaultText;

    const replacement = `${before}${selected}${after}`;
    const newText =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  // Save handler
  const handleSave = useCallback(
    async (targetPublishStatus?: boolean) => {
      const publishState =
        typeof targetPublishStatus === "boolean" ? targetPublishStatus : isPublished;

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        toast({
          title: "Title required",
          description: "Please enter a title for your diary entry before saving.",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      try {
        const payload = {
          title: trimmedTitle,
          content,
          entry_date: entryDate,
          excerpt: excerpt.trim() || null,
          image_url: imageUrl.trim() || null,
          image_alt: imageAlt.trim() || null,
          is_published: publishState,
          topic_tag: topicTag.trim() || "Engineering & Reflections",
          updated_at: new Date().toISOString(),
        };

        if (currentId) {
          const { error } = await supabase
            .from("diary_entries")
            .update(payload)
            .eq("id", currentId);

          if (error) throw error;

          setIsPublished(publishState);
          setLastSavedAt(new Date());
          toast({
            title: publishState ? "Entry Published" : "Draft Saved",
            description: `Diary entry was successfully ${publishState ? "published" : "saved as draft"}.`,
          });
        } else {
          const { data, error } = await supabase
            .from("diary_entries")
            .insert([payload])
            .select()
            .single();

          if (error) throw error;

          if (data?.id) {
            setCurrentId(data.id);
            setIsPublished(publishState);
            setLastSavedAt(new Date());
            toast({
              title: publishState ? "Entry Created & Published" : "Draft Created",
              description: `Diary entry was created and ${publishState ? "published" : "saved as draft"}.`,
            });
            // Update URL without full page reload
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", `/admin/diary/edit/${data.id}`);
            }
          }
        }
      } catch (err: any) {
        console.error("Save diary entry error:", err);
        toast({
          title: "Save failed",
          description: err.message || "An error occurred while saving the diary entry.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [
      title,
      content,
      entryDate,
      excerpt,
      imageUrl,
      imageAlt,
      isPublished,
      topicTag,
      currentId,
      toast,
    ]
  );

  // Cmd+S / Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f5] text-zinc-900 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-sm text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          <span>Loading diary entry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f5] text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900 antialiased font-sans">
      {/* ══════════ TOP STICKY BAR ══════════ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-4 sm:px-8 py-3 text-zinc-900 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Back button */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin?tab=diary")}
              className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 -ml-2 px-2.5 h-8 font-mono text-xs flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to All Diary Entries</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <span className="text-zinc-300 hidden sm:inline">|</span>

            {/* Status Badge */}
            <Badge
              variant="outline"
              className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-colors ${
                isPublished
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPublished ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {isPublished ? "Published" : "Draft"}
            </Badge>

            {/* Save Status */}
            {lastSavedAt && (
              <span className="text-[11px] font-mono text-zinc-500 hidden md:inline">
                Saved at{" "}
                {lastSavedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="h-8 px-3 text-xs bg-white border-zinc-300 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 shadow-2xs transition-colors"
            >
              {isSaving && !isPublished ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
              )}
              Save Draft
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="h-8 px-3.5 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-xs"
            >
              {isSaving && isPublished ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 mr-1.5" />
              )}
              Publish Entry
            </Button>
          </div>
        </div>
      </header>

      {/* ══════════ MAIN DOCUMENT WORKSPACE ══════════ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-8 pb-24">
        {/* Optional Cover Banner */}
        {imageUrl && (
          <div className="relative group mb-8 rounded-2xl overflow-hidden border border-zinc-200 bg-white aspect-[21/9] max-h-[320px] shadow-2xs">
            <img
              src={imageUrl}
              alt={imageAlt || title || "Diary cover"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
              title="Remove cover image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Large Editable Title Input */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Diary Entry..."
            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 placeholder:text-zinc-400 px-0 leading-tight font-display"
          />
        </div>

        {/* ══════════ NOTION INLINE PAGE PROPERTIES TABLE ══════════ */}
        <section className="mb-8 rounded-xl border border-zinc-200/90 bg-white divide-y divide-zinc-200 shadow-2xs overflow-hidden">
          {/* Row 1: Entry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-2.5 gap-2 sm:gap-4 hover:bg-zinc-50/60 transition-colors">
            <div className="sm:col-span-3 flex items-center gap-2 text-xs font-mono text-zinc-500">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Entry Date</span>
            </div>
            <div className="sm:col-span-9 flex items-center gap-3">
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="h-8 max-w-[200px] bg-white border-zinc-300 focus:border-zinc-500 text-xs text-zinc-900 font-mono"
              />
              <span className="text-[11px] font-mono text-zinc-500">
                Timestamp for timeline ordering
              </span>
            </div>
          </div>

          {/* Row 2: Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-2.5 gap-2 sm:gap-4 hover:bg-zinc-50/60 transition-colors">
            <div className="sm:col-span-3 flex items-center gap-2 text-xs font-mono text-zinc-500">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>Visibility</span>
            </div>
            <div className="sm:col-span-9">
              <div className="inline-flex rounded-lg bg-zinc-100 border border-zinc-200 p-0.5">
                <button
                  type="button"
                  onClick={() => setIsPublished(true)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isPublished
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublished(false)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    !isPublished
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Draft
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Cover / Attached Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-12 items-start px-4 py-2.5 gap-2 sm:gap-4 hover:bg-zinc-50/60 transition-colors">
            <div className="sm:col-span-3 flex items-center gap-2 text-xs font-mono text-zinc-500 pt-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Cover / Photo</span>
            </div>
            <div className="sm:col-span-9 space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-8 flex-1 bg-white border-zinc-300 focus:border-zinc-500 text-xs text-zinc-900 placeholder:text-zinc-400"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploader((v) => !v)}
                  className="h-8 px-3 text-xs bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 whitespace-nowrap shadow-2xs"
                >
                  {showUploader ? "Hide Uploader" : "Upload File"}
                </Button>
              </div>

              {showUploader && (
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                  <FileUpload
                    label="Upload Diary Cover Image"
                    uploadType="image"
                    accept="image/*"
                    maxFiles={1}
                    existingFiles={imageUrl ? [imageUrl] : []}
                    onUploadComplete={(urls) => {
                      if (urls && urls[0]) {
                        setImageUrl(urls[0]);
                        setShowUploader(false);
                      }
                    }}
                    allowUrlInput={false}
                    showPreview={false}
                  />
                </div>
              )}

              <Input
                type="text"
                placeholder="Image alt description (accessibility & SEO)"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="h-8 bg-white border-zinc-300 focus:border-zinc-500 text-xs text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Row 4: Short Excerpt */}
          <div className="grid grid-cols-1 sm:grid-cols-12 items-start px-4 py-2.5 gap-2 sm:gap-4 hover:bg-zinc-50/60 transition-colors">
            <div className="sm:col-span-3 flex items-center gap-2 text-xs font-mono text-zinc-500 pt-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>Short Excerpt</span>
            </div>
            <div className="sm:col-span-9">
              <Textarea
                placeholder="Optional one or two sentence summary shown on public feed..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="bg-white border-zinc-300 focus:border-zinc-500 text-xs text-zinc-900 placeholder:text-zinc-400 resize-y min-h-[56px]"
              />
            </div>
          </div>

          {/* Row 5: Topic Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-12 items-start px-4 py-2.5 gap-2 sm:gap-4 hover:bg-zinc-50/60 transition-colors">
            <div className="sm:col-span-3 flex items-center gap-2 text-xs font-mono text-zinc-500 pt-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Topic Tag</span>
            </div>
            <div className="sm:col-span-9 space-y-2">
              <Input
                type="text"
                placeholder="e.g. Engineering & Reflections"
                value={topicTag}
                onChange={(e) => setTopicTag(e.target.value)}
                className="h-8 max-w-sm bg-white border-zinc-300 focus:border-zinc-500 text-xs text-zinc-900 font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  "Engineering & Reflections",
                  "Field Notes",
                  "Supply Chain Architecture",
                  "Life & Travel",
                  "Decisions & Learnings",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTopicTag(preset)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono transition-colors border ${
                      topicTag === preset
                        ? "bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs"
                        : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 hover:text-zinc-900"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FULL-PAGE CONTENT EDITOR ══════════ */}
        <section className="space-y-4">
          {/* Formatting & View Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 text-xs">
            {/* Markdown shortcuts */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**", "bold text")}
                title="Bold (Ctrl+B)"
                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*", "italic text")}
                title="Italic (Ctrl+I)"
                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("### ", "", "Section Heading")}
                title="Heading 3"
                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("> ", "", "Quote block")}
                title="Quote"
                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("- ", "", "List item")}
                title="Bullet List"
                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("```\n", "\n```", "code")}
                title="Code Block"
                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[", "](https://...)", "link text")}
                title="Link"
                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Word stats & View Toggle */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">
                {stats.words} words · {stats.readTime} min read
              </span>

              {/* View Mode Toggle */}
              <div className="inline-flex rounded-lg bg-zinc-200/80 border border-zinc-300/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                    viewMode === "edit"
                      ? "bg-white text-zinc-900 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("split")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                    viewMode === "split"
                      ? "bg-white text-zinc-900 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                    viewMode === "preview"
                      ? "bg-white text-zinc-900 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Editor Canvas by View Mode */}
          {viewMode === "edit" && (
            <div className="pt-2">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your diary reflection in markdown... Use Cmd+S / Ctrl+S to save instantly."
                className="w-full min-h-[540px] bg-white border border-zinc-200/90 rounded-2xl p-6 outline-none focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 placeholder:text-zinc-400 font-sans text-base leading-relaxed resize-y shadow-2xs"
              />
            </div>
          )}

          {viewMode === "split" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your diary entry in markdown..."
                  className="w-full min-h-[540px] bg-white border border-zinc-200/90 rounded-2xl p-6 outline-none focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 placeholder:text-zinc-400 font-mono text-sm leading-relaxed resize-y shadow-2xs"
                />
              </div>
              <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 overflow-y-auto max-h-[700px] prose prose-zinc max-w-none shadow-2xs">
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-zinc-400 italic text-sm">Preview will appear here as you type...</p>
                )}
              </div>
            </div>
          )}

          {viewMode === "preview" && (
            <div className="pt-4 rounded-2xl bg-white border border-zinc-200/90 p-8 min-h-[500px] prose prose-zinc max-w-none shadow-2xs">
              {content ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-zinc-400 italic text-sm">Nothing written yet to preview.</p>
              )}
            </div>
          )}

          {/* Subtle footer shortcut cue */}
          <div className="pt-8 border-t border-zinc-200 flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-700">⌘S</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-700">Ctrl+S</kbd> to save</span>
            <span>Markdown &amp; HTML supported</span>
          </div>
        </section>
      </main>
    </div>
  );
}
