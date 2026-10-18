"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "@/lib/router-compat";
import {
  TravelCityHighlight,
  TravelStorySlide,
  TravelEssayBlock,
  DEFAULT_TRAVEL_HIGHLIGHTS,
  loadTravelHighlightsLocal,
  saveTravelHighlightsLocal,
  fetchTravelHighlightsFromSupabase,
  upsertTravelHighlightInSupabase,
} from "@/data/travelData";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Globe2,
  Image as ImageIcon,
  Instagram,
  Loader2,
  MapPin,
  Plus,
  Quote,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyHighlightTemplate: TravelCityHighlight = {
  id: "",
  slug: "",
  city_name: "",
  country_name: "",
  country_code: "",
  flag: "✈️",
  year: new Date().getFullYear(),
  month: `${new Date().toLocaleString("en", { month: "short" })} ${new Date().getFullYear()}`,
  subtitle: "",
  lat: 24.7136,
  lng: 46.6753,
  cover_image_url: "",
  instagram_highlight_url: "https://www.instagram.com/",
  is_published: true,
  story_slides: [],
  essay_title: "",
  essay_blocks: [],
};

export default function TravelHighlightEditor() {
  const navigate = useNavigate();
  const params = useParams();
  const paramId = params?.id as string | undefined;
  const isEditing = Boolean(paramId && paramId !== "new");

  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [allHighlights, setAllHighlights] = useState<TravelCityHighlight[]>([]);
  const [highlight, setHighlight] = useState<TravelCityHighlight>(emptyHighlightTemplate);
  const [showCoverUploader, setShowCoverUploader] = useState(false);

  // Load highlights from localStorage & Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      let list = loadTravelHighlightsLocal();

      try {
        const remote = await fetchTravelHighlightsFromSupabase();
        if (Array.isArray(remote)) {
          list = remote;
        }
      } catch (err) {
        console.error("Failed to fetch travel highlights from Supabase:", err);
      }

      if (!isMounted) return;
      setAllHighlights(list);

      if (isEditing && paramId) {
        const found = list.find(
          (h) =>
            h.id.toLowerCase() === paramId.toLowerCase() ||
            h.slug.toLowerCase() === paramId.toLowerCase()
        );
        if (found) {
          setHighlight(JSON.parse(JSON.stringify(found)));
        } else {
          toast({
            title: "Highlight not found",
            description: `Could not find highlight matching "${paramId}". Initialized empty highlight.`,
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [paramId, isEditing, toast]);

  // Handle field change helper
  const updateField = <K extends keyof TravelCityHighlight>(
    field: K,
    value: TravelCityHighlight[K]
  ) => {
    setHighlight((prev) => ({ ...prev, [field]: value }));
  };

  // City Name change with auto-slug
  const handleCityNameChange = (val: string) => {
    setHighlight((prev) => {
      const shouldAutoSlug = !prev.slug || prev.slug === slugify(prev.city_name);
      return {
        ...prev,
        city_name: val,
        slug: shouldAutoSlug ? slugify(val) : prev.slug,
      };
    });
  };

  // ══════════ STORY SLIDES MANAGER ══════════
  const addSlide = () => {
    const newSlide: TravelStorySlide = {
      id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      image_url:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
      caption: "New story slide caption...",
      timestamp: "18:00 AST",
      exif: "24mm · f/1.8 · ISO 200",
    };
    setHighlight((prev) => ({
      ...prev,
      story_slides: [...prev.story_slides, newSlide],
    }));
  };

  const updateSlide = (index: number, patch: Partial<TravelStorySlide>) => {
    setHighlight((prev) => {
      const slides = [...prev.story_slides];
      slides[index] = { ...slides[index], ...patch };
      return { ...prev, story_slides: slides };
    });
  };

  const removeSlide = (index: number) => {
    setHighlight((prev) => ({
      ...prev,
      story_slides: prev.story_slides.filter((_, i) => i !== index),
    }));
  };

  const moveSlide = (index: number, direction: "left" | "right") => {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= highlight.story_slides.length) return;
    setHighlight((prev) => {
      const slides = [...prev.story_slides];
      const temp = slides[index];
      slides[index] = slides[target];
      slides[target] = temp;
      return { ...prev, story_slides: slides };
    });
  };

  // ══════════ ESSAY BLOCKS MANAGER ══════════
  const addBlock = (type: TravelEssayBlock["type"]) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let newBlock: TravelEssayBlock;

    switch (type) {
      case "h3":
        newBlock = { id, type: "h3", content: "Section Subheading" };
        break;
      case "quote":
        newBlock = {
          id,
          type: "quote",
          content: "A memorable field note observation from this city...",
          author: `Field Note · ${highlight.city_name || "Observation"}`,
        };
        break;
      case "photo_pair":
        newBlock = {
          id,
          type: "photo_pair",
          images: [
            {
              url:
                highlight.cover_image_url ||
                "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=80",
              caption: "First perspective",
              exif: "24mm · f/1.8",
            },
            {
              url:
                highlight.story_slides[0]?.image_url ||
                "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=900&q=80",
              caption: "Second perspective",
              exif: "50mm · f/2.8",
            },
          ],
        };
        break;
      case "p":
      default:
        newBlock = {
          id,
          type: "p",
          content:
            "Write your immersive field observations and narrative about the architecture, light, and atmosphere...",
        };
        break;
    }

    setHighlight((prev) => ({
      ...prev,
      essay_blocks: [...prev.essay_blocks, newBlock],
    }));
  };

  const updateBlock = (index: number, patch: Partial<TravelEssayBlock>) => {
    setHighlight((prev) => {
      const blocks = [...prev.essay_blocks];
      blocks[index] = { ...blocks[index], ...patch };
      return { ...prev, essay_blocks: blocks };
    });
  };

  const removeBlock = (index: number) => {
    setHighlight((prev) => ({
      ...prev,
      essay_blocks: prev.essay_blocks.filter((_, i) => i !== index),
    }));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= highlight.essay_blocks.length) return;
    setHighlight((prev) => {
      const blocks = [...prev.essay_blocks];
      const temp = blocks[index];
      blocks[index] = blocks[target];
      blocks[target] = temp;
      return { ...prev, essay_blocks: blocks };
    });
  };

  // ══════════ SAVE & PUBLISH ══════════
  const handleSaveAndPublish = async () => {
    if (!highlight.city_name.trim()) {
      toast({
        title: "City Name required",
        description: "Please specify a city name before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const generatedId =
        highlight.id.trim() ||
        `${slugify(highlight.city_name)}-${(highlight.country_code || "loc").toLowerCase()}`;

      const finalHighlight: TravelCityHighlight = {
        ...highlight,
        id: generatedId,
        slug: highlight.slug.trim() || slugify(highlight.city_name),
        country_code: highlight.country_code.toUpperCase(),
        year: Number(highlight.year) || new Date().getFullYear(),
        lat: Number(highlight.lat) || 0,
        lng: Number(highlight.lng) || 0,
      };

      // Merge into allHighlights
      const existingIdx = allHighlights.findIndex(
        (h) => h.id === finalHighlight.id || (paramId && h.id === paramId)
      );

      let updatedList: TravelCityHighlight[];
      if (existingIdx >= 0) {
        updatedList = [...allHighlights];
        updatedList[existingIdx] = finalHighlight;
      } else {
        updatedList = [finalHighlight, ...allHighlights];
      }

      // Persist to travel_highlights table as single source of truth
      await upsertTravelHighlightInSupabase(finalHighlight);

      // Update local and UI state only after successful persistence
      saveTravelHighlightsLocal(updatedList);
      setAllHighlights(updatedList);
      setHighlight(finalHighlight);

      toast({
        title: "Highlight Published",
        description: `${finalHighlight.city_name} (${finalHighlight.country_name}) has been saved and published to the travel atlas.`,
      });

      // Update URL if new
      if (typeof window !== "undefined" && (!paramId || paramId === "new")) {
        window.history.replaceState(null, "", `/admin/travel/edit/${finalHighlight.id}`);
      }
    } catch (err: any) {
      console.error("Save travel highlight error:", err);
      toast({
        title: "Failed to save highlight",
        description: err.message || "An error occurred while saving the highlight.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-sm text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          <span>Loading travel destination highlight...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-rose-500/30 selection:text-white">
      {/* ══════════ 1. TOP STICKY BAR ══════════ */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Back button */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin?tab=travel")}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900 -ml-2 px-2.5 h-8 font-mono text-xs flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to All Travel Destinations</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <span className="text-zinc-700 hidden sm:inline">|</span>

            <Badge
              variant="outline"
              className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-colors ${
                highlight.is_published
                  ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  highlight.is_published ? "bg-rose-400" : "bg-zinc-500"
                }`}
              />
              {highlight.is_published ? "Published" : "Draft"}
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <span
              role="status"
              title="The public Travel page is hidden while it is being rebuilt."
              className="inline-flex items-center px-3 h-8 rounded-lg text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-500"
            >
              Public preview hidden
            </span>

            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={handleSaveAndPublish}
              className="h-8 px-4 text-xs font-semibold bg-white text-[#09090B] hover:bg-zinc-200 transition-all shadow-sm flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save &amp; Publish Highlight
            </Button>
          </div>
        </div>
      </header>

      {/* ══════════ MAIN WORKSPACE ══════════ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-24 space-y-12">
        {/* ══════════ 2. TOP SECTION — STORY RING PREVIEW & NOTION PROPERTIES ══════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 104x104px Live Story Ring Preview */}
          <div className="lg:col-span-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col items-center text-center space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Live Story Ring Preview
            </span>

            {/* 104x104px Circular Instagram Gradient Ring */}
            <div className="relative group">
              <div className="w-[104px] h-[104px] rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-[0_0_30px_rgba(244,63,94,0.35)] transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-full p-[3px] bg-surface">
                  {highlight.cover_image_url ? (
                    <img
                      src={highlight.cover_image_url}
                      alt={highlight.city_name || "City cover"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-2xl">
                      {highlight.flag || "✈️"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 font-display text-base font-bold text-white">
                <span>{highlight.city_name || "Untitled City"}</span>
                <span>{highlight.flag}</span>
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">
                {highlight.country_name || "Country Name"} · {highlight.month}
              </p>
            </div>

            {/* Coordinate Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[11px] text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {Number(highlight.lat).toFixed(4)}° N, {Number(highlight.lng).toFixed(4)}° E
              </span>
            </div>

            {/* Cover Image Inputs */}
            <div className="w-full pt-3 border-t border-outline-variant/30 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Cover Image URL</span>
                <button
                  type="button"
                  onClick={() => setShowCoverUploader((v) => !v)}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  {showCoverUploader ? "Hide Uploader" : "Upload File"}
                </button>
              </div>

              <Input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={highlight.cover_image_url}
                onChange={(e) => updateField("cover_image_url", e.target.value)}
                className="h-8 bg-zinc-900/90 border-zinc-800 focus:border-zinc-700 text-xs text-on-surface"
              />

              {showCoverUploader && (
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <FileUpload
                    label="Upload City Highlight Cover"
                    uploadType="image"
                    accept="image/*"
                    maxFiles={1}
                    existingFiles={highlight.cover_image_url ? [highlight.cover_image_url] : []}
                    onUploadComplete={(urls) => {
                      if (urls && urls[0]) {
                        updateField("cover_image_url", urls[0]);
                        setShowCoverUploader(false);
                      }
                    }}
                    allowUrlInput={false}
                    showPreview={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Notion Inline Properties Card */}
          <div className="lg:col-span-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 divide-y divide-zinc-800/60 overflow-hidden shadow-sm">
            {/* City Name & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3 gap-3 hover:bg-zinc-900/30 transition-colors">
              <div className="sm:col-span-4 text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>City Name &amp; Slug</span>
              </div>
              <div className="sm:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="e.g. Riyadh"
                  value={highlight.city_name}
                  onChange={(e) => handleCityNameChange(e.target.value)}
                  className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs text-on-surface"
                />
                <div className="relative">
                  <Input
                    placeholder="slug (e.g. riyadh)"
                    value={highlight.slug}
                    onChange={(e) => updateField("slug", slugify(e.target.value))}
                    className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs font-mono text-zinc-300"
                  />
                </div>
              </div>
            </div>

            {/* Country Name, Code & Flag */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3 gap-3 hover:bg-zinc-900/30 transition-colors">
              <div className="sm:col-span-4 text-xs font-mono text-zinc-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>Country &amp; Flag Emoji</span>
              </div>
              <div className="sm:col-span-8 grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <Input
                    placeholder="Saudi Arabia"
                    value={highlight.country_name}
                    onChange={(e) => updateField("country_name", e.target.value)}
                    className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs text-on-surface"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="SA"
                    maxLength={3}
                    value={highlight.country_code}
                    onChange={(e) => updateField("country_code", e.target.value.toUpperCase())}
                    className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs font-mono text-zinc-300 uppercase"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="🇸🇦"
                    value={highlight.flag}
                    onChange={(e) => updateField("flag", e.target.value)}
                    className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs text-center text-on-surface"
                  />
                </div>
              </div>
            </div>

            {/* Visited Month & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3 gap-3 hover:bg-zinc-900/30 transition-colors">
              <div className="sm:col-span-4 text-xs font-mono text-zinc-400 flex items-center gap-2">
                <span>📅 Visited Month / Year</span>
              </div>
              <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                <Input
                  placeholder="e.g. Nov 2025"
                  value={highlight.month}
                  onChange={(e) => updateField("month", e.target.value)}
                  className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs text-on-surface"
                />
                <Input
                  type="number"
                  placeholder="2025"
                  value={highlight.year}
                  onChange={(e) => updateField("year", parseInt(e.target.value) || 2025)}
                  className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs font-mono text-on-surface"
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3 gap-3 hover:bg-zinc-900/30 transition-colors">
              <div className="sm:col-span-4 text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-zinc-500" />
                <span>Subtitle</span>
              </div>
              <div className="sm:col-span-8">
                <Input
                  placeholder="e.g. Desert Modernism & Ancient Mud-Brick Architecture"
                  value={highlight.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs text-on-surface"
                />
              </div>
            </div>

            {/* Map Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3 gap-3 hover:bg-zinc-900/30 transition-colors">
              <div className="sm:col-span-4 text-xs font-mono text-zinc-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>Map Coordinates (lat, lng)</span>
              </div>
              <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-zinc-500">lat:</span>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="24.7136"
                    value={highlight.lat}
                    onChange={(e) => updateField("lat", parseFloat(e.target.value) || 0)}
                    className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs font-mono text-on-surface"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-zinc-500">lng:</span>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="46.6753"
                    value={highlight.lng}
                    onChange={(e) => updateField("lng", parseFloat(e.target.value) || 0)}
                    className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs font-mono text-on-surface"
                  />
                </div>
              </div>
            </div>

            {/* Instagram Highlight URL */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3 gap-3 hover:bg-zinc-900/30 transition-colors">
              <div className="sm:col-span-4 text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-zinc-500" />
                <span>Instagram Story URL</span>
              </div>
              <div className="sm:col-span-8">
                <Input
                  type="url"
                  placeholder="https://www.instagram.com/stories/highlights/..."
                  value={highlight.instagram_highlight_url}
                  onChange={(e) => updateField("instagram_highlight_url", e.target.value)}
                  className="h-8 bg-zinc-900/80 border-zinc-800 focus:border-zinc-700 text-xs text-on-surface"
                />
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3 gap-3 hover:bg-zinc-900/30 transition-colors">
              <div className="sm:col-span-4 text-xs font-mono text-zinc-400 flex items-center gap-2">
                <span>Visibility</span>
              </div>
              <div className="sm:col-span-8">
                <div className="inline-flex rounded-lg bg-zinc-900/80 border border-zinc-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => updateField("is_published", true)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                      highlight.is_published
                        ? "bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Published
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("is_published", false)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                      !highlight.is_published
                        ? "bg-zinc-800 text-on-surface shadow-sm border border-zinc-700"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ 3. MIDDLE SECTION — 9:16 VERTICAL INSTAGRAM STORY SLIDES ══════════ */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
            <div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-rose-400" />
                <h2 className="font-display text-lg font-bold text-white">
                  9:16 Vertical Instagram Story Slides
                </h2>
                <Badge variant="outline" className="font-mono text-[11px] text-zinc-400 border-zinc-800">
                  {highlight.story_slides.length} slides
                </Badge>
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-1">
                Vertical 9:16 reels previewed directly in the travel atlas carousel.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSlide}
              className="h-8 px-3 text-xs bg-zinc-900 border-zinc-800 text-on-surface hover:bg-zinc-800 hover:text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              Add 9:16 Story Slide
            </Button>
          </div>

          {/* Horizontal Grid of Story Slide Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {highlight.story_slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden flex flex-col justify-between shadow-md hover:border-zinc-700 transition-colors"
              >
                {/* 9:16 Story Preview Thumbnail */}
                <div className="aspect-[9/16] relative bg-surface overflow-hidden group">
                  <img
                    src={slide.image_url}
                    alt={slide.caption || `Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Top bar overlay */}
                  <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-300 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-300">
                      {slide.timestamp || "Time"}
                    </span>
                  </div>

                  {/* Bottom caption overlay preview */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    {slide.exif && (
                      <span className="font-mono text-[9px] text-amber-300 block mb-1">
                        📷 {slide.exif}
                      </span>
                    )}
                    <p className="text-[11px] text-white line-clamp-2 leading-snug">
                      {slide.caption}
                    </p>
                  </div>
                </div>

                {/* Form fields for this slide */}
                <div className="p-3.5 space-y-2.5 bg-surface-container-low flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                        Image URL
                      </label>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={slide.image_url}
                        onChange={(e) => updateSlide(idx, { image_url: e.target.value })}
                        className="h-7 text-xs bg-zinc-900 border-zinc-800 text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                        Caption
                      </label>
                      <Textarea
                        rows={2}
                        placeholder="Story caption text..."
                        value={slide.caption}
                        onChange={(e) => updateSlide(idx, { caption: e.target.value })}
                        className="text-xs bg-zinc-900 border-zinc-800 text-on-surface resize-none min-h-[50px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          Timestamp
                        </label>
                        <Input
                          placeholder="20:14 AST"
                          value={slide.timestamp}
                          onChange={(e) => updateSlide(idx, { timestamp: e.target.value })}
                          className="h-7 text-xs font-mono bg-zinc-900 border-zinc-800 text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          EXIF
                        </label>
                        <Input
                          placeholder="24mm · f/1.8"
                          value={slide.exif || ""}
                          onChange={(e) => updateSlide(idx, { exif: e.target.value })}
                          className="h-7 text-xs font-mono bg-zinc-900 border-zinc-800 text-on-surface"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions: Move left / right / delete */}
                  <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSlide(idx, "left")}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
                        title="Move Left"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === highlight.story_slides.length - 1}
                        onClick={() => moveSlide(idx, "right")}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
                        title="Move Right"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* [+ Add 9:16 Story Slide] Action Card */}
            <button
              type="button"
              onClick={addSlide}
              className="min-h-[280px] rounded-2xl border-2 border-dashed border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900/30 p-6 flex flex-col items-center justify-center text-center group transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-900 group-hover:bg-rose-500/10 border border-zinc-800 group-hover:border-rose-500/30 flex items-center justify-center text-zinc-400 group-hover:text-rose-400 mb-3 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-display text-sm font-semibold text-zinc-300 group-hover:text-white">
                Add 9:16 Story Slide
              </span>
              <span className="font-mono text-[11px] text-zinc-500 mt-1">
                Upload or link a vertical story reel
              </span>
            </button>
          </div>
        </section>

        {/* ══════════ 4. BOTTOM SECTION — VISUAL TRAVEL ESSAY & FIELD NOTES ══════════ */}
        <section className="space-y-6">
          <div className="pb-3 border-b border-outline-variant/30">
            <h2 className="font-display text-xl font-bold text-white">
              Visual Travel Essay &amp; Field Notes
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-1">
              Craft the long-form city narrative with rich text paragraphs, pull quotes, and paired photography.
            </p>
          </div>

          {/* Essay Title */}
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
              Essay Title
            </label>
            <Input
              placeholder="e.g. Riyadh: Between Ancient Mud-Brick & Hyper-Vertical Glass"
              value={highlight.essay_title}
              onChange={(e) => updateField("essay_title", e.target.value)}
              className="text-lg font-bold bg-surface-container-low border-zinc-800 focus:border-zinc-700 text-white h-11"
            />
          </div>

          {/* Essay Blocks List */}
          <div className="space-y-4">
            {highlight.essay_blocks.map((block, idx) => (
              <div
                key={block.id || idx}
                className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 space-y-3 shadow-sm hover:border-zinc-700 transition-colors"
              >
                {/* Block Header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/70">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] uppercase tracking-wider bg-zinc-900 border-zinc-700 text-rose-300"
                    >
                      {block.type === "p" && "Paragraph"}
                      {block.type === "quote" && "Pull Quote"}
                      {block.type === "h3" && "Subheading"}
                      {block.type === "photo_pair" && "Photo Pair"}
                    </Badge>
                    <span className="text-xs font-mono text-zinc-500">Block #{idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveBlock(idx, "up")}
                      className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === highlight.essay_blocks.length - 1}
                      onClick={() => moveBlock(idx, "down")}
                      className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10 hover:text-red-300 ml-1"
                      title="Delete Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Content Inputs */}
                {block.type === "h3" && (
                  <div>
                    <Input
                      placeholder="Subheading text..."
                      value={block.content || ""}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      className="text-base font-bold bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                )}

                {block.type === "p" && (
                  <div>
                    <Textarea
                      rows={4}
                      placeholder="Write paragraph content..."
                      value={block.content || ""}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      className="text-sm bg-zinc-900 border-zinc-800 text-on-surface resize-y leading-relaxed"
                    />
                  </div>
                )}

                {block.type === "quote" && (
                  <div className="space-y-2">
                    <Textarea
                      rows={2}
                      placeholder="Quote or field note excerpt..."
                      value={block.content || ""}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      className="text-sm italic bg-zinc-900 border-zinc-800 text-on-surface"
                    />
                    <Input
                      placeholder="Author / Attribution (e.g. Field Note #04 · Diriyah Quarter)"
                      value={block.author || ""}
                      onChange={(e) => updateBlock(idx, { author: e.target.value })}
                      className="h-8 text-xs font-mono bg-zinc-900 border-zinc-800 text-rose-300"
                    />
                  </div>
                )}

                {block.type === "photo_pair" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Photo 1 */}
                    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <span className="font-mono text-[11px] text-zinc-400 block">Photo 1</span>
                      <Input
                        type="url"
                        placeholder="Image 1 URL"
                        value={block.images?.[0]?.url || ""}
                        onChange={(e) => {
                          const imgs = [...(block.images || [{}, {}])];
                          imgs[0] = { ...imgs[0], url: e.target.value };
                          updateBlock(idx, { images: imgs as any });
                        }}
                        className="h-8 text-xs bg-zinc-900 border-zinc-800 text-on-surface"
                      />
                      <Input
                        placeholder="Caption"
                        value={block.images?.[0]?.caption || ""}
                        onChange={(e) => {
                          const imgs = [...(block.images || [{}, {}])];
                          imgs[0] = { ...imgs[0], caption: e.target.value };
                          updateBlock(idx, { images: imgs as any });
                        }}
                        className="h-8 text-xs bg-zinc-900 border-zinc-800 text-on-surface"
                      />
                      <Input
                        placeholder="EXIF (e.g. 24mm · f/1.8)"
                        value={block.images?.[0]?.exif || ""}
                        onChange={(e) => {
                          const imgs = [...(block.images || [{}, {}])];
                          imgs[0] = { ...imgs[0], exif: e.target.value };
                          updateBlock(idx, { images: imgs as any });
                        }}
                        className="h-8 text-xs font-mono bg-zinc-900 border-zinc-800 text-on-surface"
                      />
                    </div>

                    {/* Photo 2 */}
                    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <span className="font-mono text-[11px] text-zinc-400 block">Photo 2</span>
                      <Input
                        type="url"
                        placeholder="Image 2 URL"
                        value={block.images?.[1]?.url || ""}
                        onChange={(e) => {
                          const imgs = [...(block.images || [{}, {}])];
                          imgs[1] = { ...imgs[1], url: e.target.value };
                          updateBlock(idx, { images: imgs as any });
                        }}
                        className="h-8 text-xs bg-zinc-900 border-zinc-800 text-on-surface"
                      />
                      <Input
                        placeholder="Caption"
                        value={block.images?.[1]?.caption || ""}
                        onChange={(e) => {
                          const imgs = [...(block.images || [{}, {}])];
                          imgs[1] = { ...imgs[1], caption: e.target.value };
                          updateBlock(idx, { images: imgs as any });
                        }}
                        className="h-8 text-xs bg-zinc-900 border-zinc-800 text-on-surface"
                      />
                      <Input
                        placeholder="EXIF (e.g. 50mm · f/2.8)"
                        value={block.images?.[1]?.exif || ""}
                        onChange={(e) => {
                          const imgs = [...(block.images || [{}, {}])];
                          imgs[1] = { ...imgs[1], exif: e.target.value };
                          updateBlock(idx, { images: imgs as any });
                        }}
                        className="h-8 text-xs font-mono bg-zinc-900 border-zinc-800 text-on-surface"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Block Action Bar */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs text-zinc-400">
              Add visual essay block:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("p")}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-on-surface hover:bg-zinc-800 hover:text-white"
              >
                + Paragraph
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("quote")}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-on-surface hover:bg-zinc-800 hover:text-white"
              >
                + Pull Quote
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("h3")}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-on-surface hover:bg-zinc-800 hover:text-white"
              >
                + Subheading
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("photo_pair")}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-on-surface hover:bg-zinc-800 hover:text-white"
              >
                + Photo Pair
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
