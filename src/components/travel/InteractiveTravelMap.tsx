"use client";

import React, { useEffect, useRef, useState } from "react";
import type { TravelCityHighlight } from "@/data/travelData";
import { useTheme } from "@/contexts/ThemeContext";

interface InteractiveTravelMapProps {
  cities: TravelCityHighlight[];
  activeCity: TravelCityHighlight;
  onSelectCity: (cityId: string) => void;
  onOpenStory?: (cityId: string) => void;
  yearFilter: string;
  availableYears: string[];
  onYearFilterChange: (year: string) => void;
  countriesCount: number;
}

const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const FALLBACK_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function computeCurvedArc(
  start: [number, number],
  end: [number, number],
  segments = 36
): [number, number][] {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  const offsetLat = midLat + Math.abs(dLng) * 0.18 + (dist > 15 ? 3.5 : 1.2);
  const offsetLng = midLng - dLat * 0.12;

  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const invT = 1 - t;
    const lat = invT * invT * lat1 + 2 * invT * t * offsetLat + t * t * lat2;
    const lng = invT * invT * lng1 + 2 * invT * t * offsetLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

function InteractiveTravelMapComponent({
  cities,
  activeCity,
  onSelectCity,
  onOpenStory,
  yearFilter,
  availableYears,
  onYearFilterChange,
  countriesCount,
}: InteractiveTravelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const usingFallbackTilesRef = useRef(false);
  const markersLayerRef = useRef<any>(null);
  const arcsLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const onSelectCityRef = useRef(onSelectCity);
  onSelectCityRef.current = onSelectCity;

  const { theme } = useTheme();
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Initialize Leaflet map once on client with a single theme-adaptive tile layer
  useEffect(() => {
    let isMounted = true;
    let invalidateTimeout: ReturnType<typeof setTimeout> | null = null;
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    import("leaflet").then((LModule) => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;
      const L = LModule.default || LModule;
      leafletRef.current = L;

      // Clean up any stale Leaflet container ID from React Strict Mode double-invoke
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const initialLat = activeCity?.lat ?? 26.5;
      const initialLng = activeCity?.lng ?? 52.0;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 4,
        minZoom: 2,
        maxZoom: 17,
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      const isDark = document.documentElement.classList.contains("dark");
      const tileLayer = L.tileLayer(isDark ? DARK_TILE_URL : LIGHT_TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        subdomains: "abc",
        maxZoom: 19,
      });
      tileLayer.on("tileerror", () => {
        if (usingFallbackTilesRef.current) return;
        usingFallbackTilesRef.current = true;
        tileLayer.setUrl(FALLBACK_TILE_URL);
      });
      tileLayer.addTo(map);

      const arcsLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      arcsLayerRef.current = arcsLayer;
      markersLayerRef.current = markersLayer;

      if (cities.length > 1) {
        const validCoords = cities
          .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
          .map((c) => [c.lat, c.lng] as [number, number]);
        if (validCoords.length > 1) {
          const bounds = L.latLngBounds(validCoords);
          map.fitBounds(bounds, { padding: [65, 65], maxZoom: 5 });
        }
      }

      invalidateTimeout = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 120);

      setMapReady(true);
    }).catch((error) => {
      console.error("Unable to load the travel map:", error);
      if (isMounted) setMapError(true);
    });

    return () => {
      isMounted = false;
      if (invalidateTimeout) {
        clearTimeout(invalidateTimeout);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      tileLayerRef.current = null;
      usingFallbackTilesRef.current = false;
      arcsLayerRef.current = null;
      markersLayerRef.current = null;
      setMapReady(false);
      setMapError(false);
    };
  }, []);

  // Update the single tile layer URL when Light/Dark theme toggles
  useEffect(() => {
    if (!mapReady) return;
    const map = mapInstanceRef.current;
    const tileLayer = tileLayerRef.current;
    if (!map || !tileLayer) return;

    if (!usingFallbackTilesRef.current) {
      const isDark = theme === "dark";
      tileLayer.setUrl(isDark ? DARK_TILE_URL : LIGHT_TILE_URL);
    }
  }, [mapReady, theme]);

  // Keep Leaflet's viewport in sync when the responsive map container changes size.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const container = mapContainerRef.current;
    if (!map || !container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(container);
    return () => observer.disconnect();
  }, [mapReady]);

  // Render geodesic flight arcs and custom Stitch city pins
  useEffect(() => {
    if (!mapReady) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const arcsLayer = arcsLayerRef.current;
    if (!L || !map || !markersLayer || !arcsLayer) return;

    markersLayer.clearLayers();
    arcsLayer.clearLayers();

    const isDark = theme === "dark";
    const arcColor = isDark ? "#4edea3" : "#059669";
    const secondaryArcColor = isDark ? "#adc6ff" : "#2563eb";

    const validCities = cities.filter(
      (c) => Number.isFinite(c.lat) && Number.isFinite(c.lng)
    );

    for (let i = 0; i < validCities.length - 1; i++) {
      const fromCity = validCities[i];
      const toCity = validCities[i + 1];
      const arcPoints = computeCurvedArc(
        [fromCity.lat, fromCity.lng],
        [toCity.lat, toCity.lng]
      );
      const involvesActive =
        fromCity.id === activeCity?.id || toCity.id === activeCity?.id;

      if (involvesActive) {
        L.polyline(arcPoints, {
          color: arcColor,
          weight: 5,
          opacity: isDark ? 0.25 : 0.2,
          smoothFactor: 1,
        }).addTo(arcsLayer);
      }

      L.polyline(arcPoints, {
        color: involvesActive ? arcColor : secondaryArcColor,
        weight: involvesActive ? 2.2 : 1.5,
        opacity: involvesActive ? 0.9 : isDark ? 0.42 : 0.52,
        dashArray: involvesActive ? "6, 6" : "4, 7",
        smoothFactor: 1,
      }).addTo(arcsLayer);
    }

    validCities.forEach((city) => {
      const cityName = city.city || city.city_name;
      const isSelected = city.id === activeCity?.id;
      const pinColor = isSelected
        ? isDark
          ? "#4edea3"
          : "#059669"
        : isDark
        ? "#adc6ff"
        : "#2563eb";

      const labelBg = isDark ? "rgba(14, 14, 16, 0.92)" : "rgba(255, 255, 255, 0.95)";
      const labelText = isDark ? "#e5e1e4" : "#18181b";
      const labelBorder = isDark
        ? isSelected
          ? "rgba(78, 222, 163, 0.65)"
          : "rgba(66, 71, 84, 0.65)"
        : isSelected
        ? "rgba(5, 150, 105, 0.55)"
        : "rgba(212, 212, 216, 0.9)";

      const html = `
        <div class="relative flex flex-col items-center group cursor-pointer select-none" style="transform: translate(-50%, -50%);">
          <div
            class="px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap mb-1.5 shadow-lg transition-all duration-200 flex items-center gap-1.5"
            style="background:${labelBg}; color:${labelText}; border:1px solid ${labelBorder}; backdrop-filter:blur(8px); ${
              isSelected ? "transform: scale(1.06);" : "opacity: 0.92;"
            }"
          >
            <span>${city.flag || "📍"}</span>
            <span>${cityName}</span>
            ${
              isSelected
                ? `<span style="width:6px;height:6px;border-radius:9999px;background:${pinColor};display:inline-block;"></span>`
                : ""
            }
          </div>
          <div class="relative flex items-center justify-center">
            ${
              isSelected
                ? `<span class="animate-ping absolute inline-flex rounded-full" style="width:28px;height:28px;background:${pinColor};opacity:0.45;"></span>`
                : ""
            }
            <span
              class="relative inline-flex rounded-full shadow-lg"
              style="width:${isSelected ? "14px" : "11px"};height:${
                isSelected ? "14px" : "11px"
              };background:${pinColor};border:2.5px solid ${
                isDark ? "#0e0e10" : "#ffffff"
              };box-shadow:0 0 12px ${pinColor};"
            ></span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: "custom-stitch-map-pin bg-transparent border-0",
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([city.lat, city.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(markersLayer);

      marker.on("click", () => {
        onSelectCityRef.current(city.id);
        map.flyTo([city.lat, city.lng], Math.max(map.getZoom(), 5), {
          duration: 1.2,
        });
      });
    });
  }, [mapReady, cities, activeCity?.id, theme]);

  // Smoothly fly to activeCity when selected via Country / Story Rings
  useEffect(() => {
    if (!mapReady) return;
    const map = mapInstanceRef.current;
    if (!map || !activeCity || !Number.isFinite(activeCity.lat) || !Number.isFinite(activeCity.lng)) {
      return;
    }
    map.flyTo([activeCity.lat, activeCity.lng], Math.max(map.getZoom(), 5), {
      duration: 1.25,
    });
  }, [mapReady, activeCity?.id]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetBounds = () => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || cities.length === 0) return;
    const validCities = cities.filter(
      (c) => Number.isFinite(c.lat) && Number.isFinite(c.lng)
    );
    if (validCities.length === 0) return;
    if (validCities.length === 1) {
      map.flyTo([validCities[0].lat, validCities[0].lng], 5, { duration: 1.2 });
      return;
    }
    const bounds = L.latLngBounds(
      validCities.map((c) => [c.lat, c.lng] as [number, number])
    );
    map.flyToBounds(bounds, { padding: [65, 65], maxZoom: 5, duration: 1.2 });
  };

  const activeCityName = activeCity?.city || activeCity?.city_name || "City";

  return (
    <div className="relative rounded-3xl bg-surface-container-low border border-outline-variant/30 overflow-hidden shadow-2xl h-[420px] sm:h-[470px] flex flex-col justify-between">
      {/* Dedicated Absolute Map Wrapper so Leaflet's relative container fills 100% */}
      <div className="absolute inset-0 z-0">
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
          aria-label="Interactive World Travel Map"
        />
        {mapError && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center bg-surface-container-lowest/80 px-6 text-center text-sm text-on-surface-variant backdrop-blur-sm">
            The travel map could not be loaded. Please refresh the page to try again.
          </div>
        )}
      </div>

      {/* Top Overlay Bar: Visited Summary Badge + Year Filter Pills */}
      <div className="relative z-[450] p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/30 text-code font-code text-xs text-on-surface flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>
              {countriesCount} {countriesCount === 1 ? "Country" : "Countries"} ·{" "}
              {cities.length} {cities.length === 1 ? "City" : "Cities"} Explored
            </span>
          </div>
        </div>

        {/* Floating Top-Right Year Filter Pills */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          {availableYears.map((yr) => {
            const active = yearFilter === yr;
            return (
              <button
                key={yr}
                type="button"
                onClick={() => onYearFilterChange(yr)}
                className={
                  active
                    ? "px-3 py-1 rounded-full bg-on-surface text-surface text-label-sm font-label-sm font-semibold shadow-sm transition-all"
                    : "px-3 py-1 rounded-full bg-surface-container-lowest/85 hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface text-label-sm font-label-sm border border-outline-variant/30 backdrop-blur-md transition-colors"
                }
              >
                {yr === "all" ? "All Years" : yr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Right Map Controls (Zoom In, Zoom Out, Fit World View) */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[450] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-surface-container-lowest/90 hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
          aria-label="Zoom in map"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-surface-container-lowest/90 hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
          aria-label="Zoom out map"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <button
          type="button"
          onClick={handleResetBounds}
          className="w-9 h-9 rounded-xl bg-surface-container-lowest/90 hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
          aria-label="Fit all visited cities"
          title="Fit All Visited Cities"
        >
          <span className="material-symbols-outlined text-[18px]">public</span>
        </button>
      </div>

      {/* Bottom Status Bar inside Map */}
      <div className="relative z-[450] mx-4 sm:mx-6 mb-4 px-4 py-2.5 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-code font-code text-xs text-outline shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-on-surface font-medium">
            {activeCityName} {activeCity?.flag}
          </span>
          {Number.isFinite(activeCity?.lat) && Number.isFinite(activeCity?.lng) && (
            <span>
              · {activeCity.lat.toFixed(4)}° N, {activeCity.lng.toFixed(4)}° E
            </span>
          )}
          {onOpenStory && activeCity && (
            <button
              type="button"
              onClick={() => onOpenStory(activeCity.id)}
              className="ml-2 px-2.5 py-0.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary hover:bg-secondary/25 transition-colors font-semibold"
            >
              ▶ Play {activeCity.story_slides.length} Stories
            </button>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-secondary font-medium">
            ● Drag to pan · Scroll to zoom · Click any city pin
          </span>
        </div>
      </div>
    </div>
  );
}

const InteractiveTravelMap = React.memo(InteractiveTravelMapComponent);
export default InteractiveTravelMap;
