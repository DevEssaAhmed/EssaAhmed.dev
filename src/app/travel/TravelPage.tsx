"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { OptimizedImage } from "@/components/OptimizedImage";
import dynamic from "next/dynamic";

const InteractiveTravelMap = dynamic(
  () => import("@/components/travel/InteractiveTravelMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-3xl bg-surface-container-low border border-outline-variant/30 animate-pulse flex flex-col items-center justify-center text-on-surface-variant font-code text-xs gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span>Loading map telemetry...</span>
      </div>
    ),
  }
);
import {
  normalizeTravelRow,
  type TravelCityHighlight,
} from "@/data/travelData";
import { useAuth } from "@/contexts/AuthContext";

interface TravelPageProps {
  initialHighlights: TravelCityHighlight[];
}

export default function TravelPage({ initialHighlights }: TravelPageProps) {
  const searchParams = useSearchParams();
  const initialSlug = searchParams?.get("city") || "";
  const { user } = useAuth();

  const [highlights] = useState<TravelCityHighlight[]>(() =>
    initialHighlights.map(normalizeTravelRow)
  );
  const [selectedCityId, setSelectedCityId] = useState<string>(
    initialHighlights[0]?.id || ""
  );
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  // 9:16 Inline & Modal Story Player state
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [storyModalOpen, setStoryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!initialSlug) return;
    const found = highlights.find(
      (h) => h.slug.toLowerCase() === initialSlug.toLowerCase() || h.id === initialSlug
    );
    if (found) {
      setSelectedCityId(found.id);
      setActiveSlideIndex(0);
      setSlideProgress(0);
    }
  }, [initialSlug, highlights]);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(highlights.map((h) => String(h.year)))).sort(
      (a, b) => Number(b) - Number(a)
    );
    return ["all", ...years];
  }, [highlights]);

  const availableCountries = useMemo(() => {
    const map = new Map<string, { country: string; flag: string; count: number }>();
    for (const h of highlights) {
      const countryKey = h.country || h.country_name;
      const existing = map.get(countryKey);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(countryKey, { country: countryKey, flag: h.flag, count: 1 });
      }
    }
    return Array.from(map.values());
  }, [highlights]);

  const filteredHighlights = useMemo(() => {
    return highlights.filter((h) => {
      const countryKey = h.country || h.country_name;
      const matchesCountry = countryFilter === "all" || countryKey === countryFilter;
      const matchesYear = yearFilter === "all" || String(h.year) === yearFilter;
      return matchesCountry && matchesYear;
    });
  }, [highlights, countryFilter, yearFilter]);

  const mapCities = useMemo(
    () => (filteredHighlights.length > 0 ? filteredHighlights : highlights),
    [filteredHighlights, highlights]
  );

  const groupedByCountry = useMemo(() => {
    const groups: Array<{
      country: string;
      flag: string;
      cities: TravelCityHighlight[];
    }> = [];
    for (const city of filteredHighlights) {
      const countryKey = city.country || city.country_name;
      let group = groups.find((g) => g.country === countryKey);
      if (!group) {
        group = { country: countryKey, flag: city.flag, cities: [] };
        groups.push(group);
      }
      group.cities.push(city);
    }
    return groups;
  }, [filteredHighlights]);

  const activeCity = useMemo(() => {
    return (
      filteredHighlights.find((h) => h.id === selectedCityId) ||
      highlights.find((h) => h.id === selectedCityId) ||
      filteredHighlights[0] ||
      highlights[0]
    );
  }, [filteredHighlights, highlights, selectedCityId]);

  const slides = activeCity?.story_slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0];

  // Auto-advance 9:16 story player every 5 seconds unless paused
  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    const interval = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          setActiveSlideIndex((idx) => (idx + 1) % slides.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, slides.length, activeCity?.id]);

  const handleSelectCity = useCallback((cityId: string) => {
    setSelectedCityId(cityId);
    setActiveSlideIndex(0);
    setSlideProgress(0);
  }, []);

  const handleOpenStory = useCallback((cityId: string) => {
    setSelectedCityId(cityId);
    setActiveSlideIndex(0);
    setSlideProgress(0);
    setStoryModalOpen(true);
  }, []);

  const handleNextSlide = () => {
    if (slides.length === 0) return;
    setActiveSlideIndex((idx) => (idx + 1) % slides.length);
    setSlideProgress(0);
  };

  const handlePrevSlide = () => {
    if (slides.length === 0) return;
    setActiveSlideIndex((idx) => (idx - 1 + slides.length) % slides.length);
    setSlideProgress(0);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main id="main-content" tabIndex={-1} className="w-full pt-10 pb-20 px-4 sm:px-6">
        {/* 1. PAGE HEADER & STATS BAR */}
        <section className="max-w-[1080px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Visual Travel Log · Field Notes</span>
              </div>
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-headline-lg text-on-surface tracking-tight">
                Travel Stories &amp; Visual Atlas
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed">
                Visual dispatches, street photography, and reflective field essays from journeys across the Middle East, Karakoram mountains, and beyond.
              </p>
            </div>

            {/* Right: Metadata Counters + Authenticated-Only CMS Shortcut */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
              <div className="px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-2.5">
                <span className="text-base">🌍</span>
                <div>
                  <div className="text-label-sm font-label-sm text-outline uppercase">
                    Countries
                  </div>
                  <div className="text-headline-sm font-code text-on-surface leading-tight">
                    {availableCountries.length} Explored
                  </div>
                </div>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-2.5">
                <span className="text-base">📍</span>
                <div>
                  <div className="text-label-sm font-label-sm text-outline uppercase">
                    Cities
                  </div>
                  <div className="text-headline-sm font-code text-on-surface leading-tight">
                    {highlights.length} Logged
                  </div>
                </div>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-2.5">
                <span className="text-base">📸</span>
                <div>
                  <div className="text-label-sm font-label-sm text-outline uppercase">
                    Highlights
                  </div>
                  <div className="text-headline-sm font-code text-secondary leading-tight">
                    {highlights.reduce((acc, c) => acc + (c.story_slides?.length || 0), 0)} Stories
                  </div>
                </div>
              </div>
              {user && activeCity && (
                <Link
                  href={`/admin/travel/edit/${activeCity.id}`}
                  className="px-3.5 py-2.5 rounded-xl bg-primary/15 border border-primary/30 text-xs font-code text-primary hover:bg-primary/25 transition-colors"
                >
                  Edit in CMS →
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* 2. INTERACTIVE WORLD MAP (Real Leaflet Map with Light & Dark Theme Tiles) */}
        <section className="max-w-[1080px] mx-auto mt-10">
          {activeCity && (
            <InteractiveTravelMap
              cities={mapCities}
              activeCity={activeCity}
              onSelectCity={handleSelectCity}
              onOpenStory={handleOpenStory}
              yearFilter={yearFilter}
              availableYears={availableYears}
              onYearFilterChange={setYearFilter}
              countriesCount={availableCountries.length}
            />
          )}
        </section>

        {/* 3. COUNTRY SECTIONS WITH INSTAGRAM-STYLE CITY STORY HIGHLIGHTS */}
        <section className="max-w-[1080px] mx-auto mt-14 space-y-10">
          {/* Section Header with Country Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface font-bold">
                Browse by Country
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Tap any highlight circle to fly the map and load field stories &amp; photo dispatches.
              </p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                type="button"
                onClick={() => setCountryFilter("all")}
                className={
                  countryFilter === "all"
                    ? "px-3.5 py-1.5 rounded-full bg-on-surface text-surface text-label-md font-label-md font-semibold shrink-0 transition-all"
                    : "px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-label-md font-label-md border border-outline-variant/30 transition-colors shrink-0"
                }
              >
                All ({highlights.length})
              </button>
              {availableCountries.map((c) => {
                const active = countryFilter === c.country;
                return (
                  <button
                    key={c.country}
                    type="button"
                    onClick={() => setCountryFilter(c.country)}
                    className={
                      active
                        ? "px-3.5 py-1.5 rounded-full bg-on-surface text-surface text-label-md font-label-md font-semibold shrink-0 transition-all"
                        : "px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-label-md font-label-md border border-outline-variant/30 transition-colors shrink-0"
                    }
                  >
                    {c.flag} {c.country} ({c.count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country Groups */}
          <div className="space-y-8">
            {groupedByCountry.map((group, groupIdx) => (
              <div
                key={group.country}
                className={
                  groupIdx > 0 ? "space-y-4 pt-6 border-t border-outline-variant/15" : "space-y-4"
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-2xl">{group.flag}</span>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">
                      {group.country}
                    </h3>
                    <span className="text-code font-code text-xs px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant">
                      {group.cities[0]?.visited_at} · {group.cities.length}{" "}
                      {group.cities.length === 1 ? "City" : "Cities"}
                    </span>
                  </div>
                  <span className="text-label-sm font-label-sm text-outline">
                    {group.cities.length}{" "}
                    {group.cities.length === 1 ? "Highlight" : "Highlights"}
                  </span>
                </div>

                <div className="flex items-center gap-6 overflow-x-auto py-2 px-1 no-scrollbar">
                  {group.cities.map((city) => {
                    const isSelected = city.id === activeCity?.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleSelectCity(city.id)}
                        onDoubleClick={() => {
                          handleSelectCity(city.id);
                          setStoryModalOpen(true);
                        }}
                        aria-label={`${city.city} Story Highlights`}
                        className="flex flex-col items-center group text-center focus:outline-none shrink-0"
                      >
                        <div
                          className={`p-[3px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 rounded-full group-hover:scale-105 transition-transform duration-200 ${
                            isSelected
                              ? "shadow-lg shadow-rose-500/25 ring-2 ring-secondary/40"
                              : "opacity-85 group-hover:opacity-100"
                          }`}
                        >
                          <div className="p-[2.5px] bg-surface-container-lowest rounded-full">
                            <OptimizedImage
                              src={city.cover_url}
                              alt={city.city}
                              width={88}
                              height={88}
                              className="w-[88px] h-[88px] rounded-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        <span
                          className={`mt-2.5 font-label-md text-label-md flex items-center gap-1 transition-colors ${
                            isSelected
                              ? "text-on-surface font-semibold"
                              : "text-on-surface-variant group-hover:text-on-surface"
                          }`}
                        >
                          {city.city} {city.flag}
                        </span>
                        <span
                          className={`font-code text-code text-xs ${
                            isSelected ? "text-secondary font-medium" : "text-outline"
                          }`}
                        >
                          {city.visited_at} · {city.story_slides.length} Stories
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. ACTIVE CITY INSTAGRAM STORY VIEWER & VISUAL BLOG FEED (Split 12-Column Bento Showcase) */}
        {activeCity && (
          <section
            id="visual-essay"
            className="max-w-[1080px] mx-auto mt-16 rounded-3xl bg-surface-container-low border border-outline-variant/30 p-6 sm:p-10 shadow-2xl relative"
          >
            {/* Section Breadcrumb & Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-label-md font-label-md text-on-surface tracking-wider uppercase font-semibold">
                  Selected Highlight: {activeCity.city}, {activeCity.country} (
                  {activeCity.visited_at})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-code font-code text-xs text-secondary hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isPaused ? "play_arrow" : "pause"}
                  </span>
                  <span>
                    {isPaused ? "Paused" : "Playing"} Story{" "}
                    {String(activeSlideIndex + 1).padStart(2, "0")} /{" "}
                    {String(Math.max(slides.length, 1)).padStart(2, "0")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-code font-code text-xs text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                  <span>Fullscreen</span>
                </button>
              </div>
            </div>

            {/* 12-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 mt-8 items-start">
              {/* Left 5 Columns: Instagram 9:16 Vertical Story Player */}
              <div className="md:col-span-5 w-full flex justify-center">
                <div className="aspect-[9/16] w-full max-w-[340px] rounded-[32px] border-2 border-outline-variant/40 bg-surface-container-lowest shadow-2xl overflow-hidden relative flex flex-col justify-between p-4 group select-none">
                  {/* Story Slide Photo */}
                  <div className="absolute inset-0 z-0">
                    <OptimizedImage
                      src={currentSlide?.image_url || activeCity.cover_url}
                      alt={currentSlide?.caption || activeCity.city}
                      className="w-full h-full object-cover transition-all duration-500"
                      priority
                      sizes="(max-width: 768px) 100vw, 340px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85" />
                  </div>

                  {/* Top Overlay: Segmented Progress Bars & Story Header */}
                  <div className="relative z-10 w-full space-y-3">
                    <div className="flex items-center gap-1.5 w-full">
                      {slides.map((s, idx) => (
                        <button
                          key={s.id || idx}
                          type="button"
                          onClick={() => {
                            setActiveSlideIndex(idx);
                            setSlideProgress(0);
                          }}
                          aria-label={`Story slide ${idx + 1}`}
                          className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden relative"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100"
                            style={{
                              width:
                                idx < activeSlideIndex
                                  ? "100%"
                                  : idx === activeSlideIndex
                                  ? `${slideProgress}%`
                                  : "0%",
                            }}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Story Header Bar */}
                    <div className="flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-white/40 bg-black/50 flex items-center justify-center font-bold text-white text-[11px] overflow-hidden">
                          <OptimizedImage
                            src={activeCity.cover_url}
                            alt={activeCity.city}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 font-semibold font-label-md text-label-md leading-none">
                            essa.ahmed
                          </div>
                          <div className="text-[10px] text-zinc-300 font-label-sm mt-0.5">
                            {activeCity.city}, {activeCity.country} ·{" "}
                            {currentSlide?.timestamp || activeCity.visited_at}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={isPaused ? "Play Story" : "Pause Story"}
                          onClick={() => setIsPaused((p) => !p)}
                          className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isPaused ? "play_arrow" : "pause"}
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label="Open Fullscreen Story"
                          onClick={() => setStoryModalOpen(true)}
                          className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            open_in_full
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Center Tap Navigation Controls */}
                  <div className="relative z-10 flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      aria-label="Previous slide"
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      aria-label="Next slide"
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>

                  {/* Bottom Story Overlay */}
                  <div className="relative z-10 w-full space-y-3">
                    {currentSlide?.caption && (
                      <div className="px-3.5 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-body-md leading-relaxed">
                        &ldquo;{currentSlide.caption}&rdquo;
                        {currentSlide.exif && (
                          <div className="text-[10px] font-code text-zinc-400 mt-1">
                            📷 {currentSlide.exif}
                          </div>
                        )}
                      </div>
                    )}

                    {/* View the original travel highlight, when one is linked. */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {activeCity.instagram_url && (
                        <a
                          className="ml-auto px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-label-sm text-label-sm flex items-center gap-1 transition-all"
                          href={activeCity.instagram_url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <span>Instagram</span>
                          <span className="material-symbols-outlined text-[13px]">
                            open_in_new
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 7 Columns: Visual Travel Essay & Photo Grid */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center gap-2.5 text-code font-code text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/20 text-secondary font-medium">
                    GPS: {activeCity.lat.toFixed(4)}° N, {activeCity.lng.toFixed(4)}° E
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface-variant">
                    {activeCity.visited_at}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface-variant">
                    {activeCity.flag} {activeCity.country}
                  </span>
                </div>

                {/* Essay Title */}
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface font-bold tracking-tight">
                    {activeCity.essay_title}
                  </h3>
                  {activeCity.subtitle && (
                    <p className="text-sm text-primary font-medium mt-1">
                      {activeCity.subtitle}
                    </p>
                  )}
                </div>

                {/* Reflective Prose / Field Notes */}
                <div className="space-y-4">
                  {activeCity.essay_blocks.map((block, idx) => {
                    if (block.type === "p") {
                      return (
                        <p
                          key={idx}
                          className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed"
                        >
                          {block.text}
                        </p>
                      );
                    }
                    if (block.type === "h3") {
                      return (
                        <h4
                          key={idx}
                          className="text-headline-sm font-headline-sm text-on-surface font-semibold pt-2"
                        >
                          {block.text}
                        </h4>
                      );
                    }
                    if (block.type === "quote") {
                      return (
                        <blockquote
                          key={idx}
                          className="p-5 rounded-2xl bg-surface-container border-l-4 border-secondary text-on-surface italic text-body-md font-body-md leading-relaxed"
                        >
                          &ldquo;{block.text}&rdquo;
                        </blockquote>
                      );
                    }
                    if (block.type === "photo_pair" && block.images) {
                      return (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {block.images.map((img, imgIdx) => (
                            <figure
                              key={imgIdx}
                              className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 group"
                            >
                              <div className="aspect-[4/3] overflow-hidden">
                                <OptimizedImage
                                  src={img.url}
                                  alt={img.caption}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                  sizes="(max-width: 640px) 100vw, 360px"
                                />
                              </div>
                              <figcaption className="p-3 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/20">
                                <span className="truncate pr-2">{img.caption}</span>
                                {img.meta && (
                                  <span className="font-code text-[11px] text-outline shrink-0">
                                    {img.meta}
                                  </span>
                                )}
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Story Thumbnail Strip for Quick Slide Selection */}
                {slides.length > 1 && (
                  <div className="pt-4 border-t border-outline-variant/20">
                    <div className="text-label-sm font-label-sm text-outline uppercase tracking-wider mb-3">
                      All {activeCity.city} Story Frames ({slides.length})
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {slides.map((slide, idx) => {
                        const isCurrent = idx === activeSlideIndex;
                        return (
                          <button
                            key={slide.id || idx}
                            type="button"
                            onClick={() => {
                              setActiveSlideIndex(idx);
                              setSlideProgress(0);
                            }}
                            className={`group relative aspect-[9/14] rounded-xl overflow-hidden border transition-all text-left ${
                              isCurrent
                                ? "border-secondary ring-2 ring-secondary/30 scale-[1.02]"
                                : "border-outline-variant/30 opacity-75 hover:opacity-100"
                            }`}
                          >
                            <OptimizedImage
                              src={slide.image_url}
                              alt={slide.caption}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              sizes="120px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <span className="absolute bottom-2 left-2 right-2 text-[10px] font-code text-white truncate">
                              #{idx + 1} · {slide.timestamp}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Fullscreen 9:16 Instagram Story Modal */}
      {storyModalOpen && activeCity && (
        <div
          className="fixed inset-0 z-[1300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setStoryModalOpen(false)}
        >
          <div
            className="relative w-full max-w-[390px] aspect-[9/16] rounded-[32px] overflow-hidden border border-white/20 bg-black shadow-2xl flex flex-col justify-between p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <OptimizedImage
              src={currentSlide?.image_url || activeCity.cover_url}
              alt={currentSlide?.caption || activeCity.city}
              className="absolute inset-0 w-full h-full object-cover"
              sizes="390px"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-1.5">
                {slides.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <div
                      className="h-full bg-white rounded-full transition-all duration-100"
                      style={{
                        width:
                          idx < activeSlideIndex
                            ? "100%"
                            : idx === activeSlideIndex
                            ? `${slideProgress}%`
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <OptimizedImage
                    src={activeCity.cover_url}
                    alt={activeCity.city}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover border border-white/40"
                  />
                  <div>
                    <div className="text-xs font-semibold">
                      {activeCity.city} {activeCity.flag}
                    </div>
                    <div className="text-[11px] text-zinc-300 font-code">
                      {currentSlide?.timestamp} · {currentSlide?.exif}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="relative z-10 space-y-3">
              {currentSlide?.caption && (
                <div className="p-3.5 rounded-2xl bg-black/65 backdrop-blur-md border border-white/15 text-white text-xs leading-relaxed">
                  {currentSlide.caption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <OptimizedFooter />
    </div>
  );
}
