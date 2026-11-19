"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { filterAndSortTravel, type TravelSortOption } from "@/lib/admin-helpers";
import { isPublicTravelHighlight } from "@/data/travelVisibility";

interface TravelDirectoryTabProps {
  travelHighlights: any[];
  onTogglePublish: (city: any) => Promise<void>;
  onDeleteCity: (id: string) => Promise<void>;
}

export const TravelDirectoryTab: React.FC<TravelDirectoryTabProps> = ({
  travelHighlights,
  onTogglePublish,
  onDeleteCity,
}) => {
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<TravelSortOption>("year_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pendingDeleteCity, setPendingDeleteCity] = useState<any | null>(null);

  const filteredCities = useMemo(
    () =>
      filterAndSortTravel(travelHighlights, {
        statusFilter,
        searchQuery,
        sortBy,
      }),
    [travelHighlights, statusFilter, searchQuery, sortBy]
  );

  const handleToggleClick = async (city: any) => {
    setTogglingId(city.id);
    try {
      await onTogglePublish(city);
    } finally {
      setTogglingId(null);
    }
  };

  const hasActiveFilters = statusFilter !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <Card className="bg-white border-zinc-200/80 shadow-2xs rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
              {(["all", "published", "draft"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {status === "all" ? "All Cities" : status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-zinc-500">
                {filteredCities.length} / {travelHighlights.length} pins
              </span>
              <Link href="/travel" target="_blank">
                <Button size="sm" variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg h-8 text-xs">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Live Atlas
                </Button>
              </Link>
              <Link href="/admin/travel/new">
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg h-8 text-xs shadow-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Travel City
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, country, or subtitle..."
                className="pl-9 pr-8 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-9 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as TravelSortOption)}>
              <SelectTrigger className="w-full md:w-[175px] bg-white border-zinc-200 text-zinc-900 rounded-lg h-9 text-xs">
                <SelectValue placeholder="Sort cities" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                <SelectItem value="year_desc">Newest Year</SelectItem>
                <SelectItem value="city_asc">City Name (A-Z)</SelectItem>
                <SelectItem value="slides_desc">Most Story Slides</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs text-zinc-600 hover:text-zinc-900 h-9 rounded-lg"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* City Cards Grid */}
      {filteredCities.length === 0 ? (
        <Card className="bg-white border-zinc-200/80 shadow-2xs rounded-2xl">
          <CardContent className="p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-800">No travel destinations match</p>
            <div className="pt-1 flex items-center justify-center gap-2">
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/admin/travel/new">
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Travel City
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCities.map((city) => {
            const slidesCount = Array.isArray(city.story_slides) ? city.story_slides.length : 0;
            const atlasReady = isPublicTravelHighlight({ ...city, is_published: true });
            const isPub = Boolean(city.is_published);

            return (
              <Card
                key={city.id}
                className="group bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-md shadow-2xs rounded-2xl overflow-hidden flex flex-col transition-all"
              >
                <div className="relative h-40 bg-zinc-100 border-b border-zinc-200/80 overflow-hidden">
                  {city.cover_image_url ? (
                    <OptimizedImage
                      src={city.cover_image_url}
                      alt={city.city_name || "Travel destination"}
                      width={600}
                      height={320}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <Badge className="bg-zinc-900/85 text-white border-0 font-mono text-[10px]">
                      {city.year || "—"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] bg-white/95 backdrop-blur-xs ${
                        isPub
                          ? "text-emerald-700 border-emerald-200"
                          : "text-zinc-600 border-zinc-200"
                      }`}
                    >
                      {isPub ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/admin/travel/edit/${city.id}`}
                          className="text-base font-semibold text-zinc-900 hover:text-indigo-600"
                        >
                          {city.city_name || "Unnamed City"}
                        </Link>
                        <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{city.country_name || "No country"}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                        {slidesCount} {slidesCount === 1 ? "slide" : "slides"}
                      </span>
                    </div>

                    {city.subtitle && (
                      <p className="text-xs text-zinc-600 line-clamp-2">{city.subtitle}</p>
                    )}

                    <div className="pt-1 flex items-center gap-1.5 text-[11px]">
                      {atlasReady ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Atlas validation ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Needs cover, valid coords, or slide image
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={togglingId === city.id}
                      onClick={() => void handleToggleClick(city)}
                      className={`h-7 text-xs rounded-lg ${
                        isPub
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {togglingId === city.id && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                      {isPub ? "Set Draft" : "Publish"}
                    </Button>

                    <div className="inline-flex items-center gap-0.5">
                      {isPub && city.slug && (
                        <Link
                          href={`/travel?city=${encodeURIComponent(city.slug)}`}
                          target="_blank"
                          title="View Pin on Live Atlas"
                        >
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-zinc-900 rounded-md">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/travel/edit/${city.id}`} title="Edit Highlight">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-zinc-700 hover:text-zinc-900 rounded-md">
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Delete Travel Pin"
                        onClick={() => setPendingDeleteCity(city)}
                        className="h-7 w-7 text-zinc-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Shared Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(pendingDeleteCity)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteCity(null);
        }}
      >
        <AlertDialogContent className="bg-white border-zinc-200 text-zinc-900 shadow-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDeleteCity?.city_name || "this destination"}?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              This travel city pin and all its story slides and essay blocks will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDeleteCity) return;
                const targetId = pendingDeleteCity.id;
                setPendingDeleteCity(null);
                await onDeleteCity(targetId);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
            >
              Delete City
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
