import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useApiIsLoaded,
  useApiLoadingStatus,
  useAdvancedMarkerRef,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Globe,
  Search,
  Navigation,
  ExternalLink,
  Loader2,
  Layers,
  Maximize2,
  Sparkles,
  Film,
  Leaf,
  Crown,
  X,
  MessageSquare,
} from 'lucide-react';
import { LuxuryTheme, ChanneledMessage } from '../types';
import { THEME_CONFIGS } from '../data/diCaprioData';
import { useMapsConfig } from '../context/MapsConfigContext';
import { useVisitorLocation, formatCoordinates } from '../services/visitorLocationService';
import { sanitizeExternalUrl } from '../utils/security';

export interface SanctuaryMapPin {
  id: string;
  placeId?: string;
  title: string;
  subtitle: string;
  category: 'vip_hub' | 'cinema_premiere' | 'climate_summit' | 'visitor_live' | 'visitor_message' | 'search_result';
  formattedAddress: string;
  lat: number;
  lng: number;
  googleMapsUri?: string;
  primaryType?: string;
}

interface GlobalSanctuaryMapProps {
  currentTheme: LuxuryTheme;
}

const CATEGORY_META: Record<
  SanctuaryMapPin['category'],
  { label: string; pinBg: string; pinBorder: string; badgeClass: string }
> = {
  vip_hub: {
    label: 'VIP Sanctuary Hub',
    pinBg: '#f59e0b',
    pinBorder: '#78350f',
    badgeClass: 'border-amber-400/40 bg-amber-400/15 text-amber-300',
  },
  cinema_premiere: {
    label: 'Cinema Premiere',
    pinBg: '#e11d48',
    pinBorder: '#881337',
    badgeClass: 'border-rose-400/40 bg-rose-500/15 text-rose-300',
  },
  climate_summit: {
    label: 'Climate & UN',
    pinBg: '#10b981',
    pinBorder: '#064e3b',
    badgeClass: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300',
  },
  visitor_live: {
    label: 'Your Live Location',
    pinBg: '#0ea5e9',
    pinBorder: '#0c4a6e',
    badgeClass: 'border-sky-400/40 bg-sky-500/15 text-sky-300',
  },
  visitor_message: {
    label: 'Visitor Dispatch',
    pinBg: '#8b5cf6',
    pinBorder: '#4c1d95',
    badgeClass: 'border-violet-400/40 bg-violet-500/15 text-violet-300',
  },
  search_result: {
    label: 'Search Result',
    pinBg: '#22c55e',
    pinBorder: '#14532d',
    badgeClass: 'border-green-400/40 bg-green-500/15 text-green-300',
  },
};

function PinCategoryIcon({ category }: { category: SanctuaryMapPin['category'] }) {
  switch (category) {
    case 'vip_hub':
      return <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    case 'cinema_premiere':
      return <Film className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
    case 'climate_summit':
      return <Leaf className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
    case 'visitor_live':
      return <Navigation className="h-3.5 w-3.5 text-sky-400 shrink-0" />;
    case 'visitor_message':
      return <MessageSquare className="h-3.5 w-3.5 text-violet-400 shrink-0" />;
    default:
      return <MapPin className="h-3.5 w-3.5 text-green-400 shrink-0" />;
  }
}

interface InteractivePinMarkerProps {
  pin: SanctuaryMapPin;
  isSelected: boolean;
  onSelect: (pin: SanctuaryMapPin) => void;
  onClose: () => void;
}

function InteractivePinMarker({ pin, isSelected, onSelect, onClose }: InteractivePinMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const meta = CATEGORY_META[pin.category];
  const safeMapUrl =
    sanitizeExternalUrl(pin.googleMapsUri) ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pin.lat},${pin.lng}`)}`;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: pin.lat, lng: pin.lng }}
        title={pin.title}
        zIndex={isSelected ? 100 : pin.category === 'visitor_live' ? 80 : 40}
        onClick={() => onSelect(pin)}
      >
        <Pin
          background={meta.pinBg}
          borderColor={meta.pinBorder}
          glyphColor="#ffffff"
          scale={isSelected ? 1.28 : 1.05}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={290} onCloseClick={onClose}>
          <div className="p-1 text-zinc-900 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-block rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {meta.label}
              </span>
            </div>
            <h4 className="font-bold text-sm text-zinc-950 leading-snug">{pin.title}</h4>
            <p className="text-[11px] font-medium text-zinc-700 leading-snug">{pin.subtitle}</p>
            {pin.formattedAddress && (
              <p className="text-[11px] text-zinc-600 leading-snug">{pin.formattedAddress}</p>
            )}
            <p className="font-mono text-[10px] text-zinc-500">
              {formatCoordinates(pin.lat, pin.lng)}
            </p>
            <div className="pt-1 border-t border-zinc-200 flex items-center justify-between gap-2">
              <a
                href={safeMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

interface MapCameraControllerProps {
  selectedPin: SanctuaryMapPin | null;
  allPins: SanctuaryMapPin[];
  fitTrigger: number;
}

function MapCameraController({ selectedPin, allPins, fitTrigger }: MapCameraControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedPin) return;
    map.panTo({ lat: selectedPin.lat, lng: selectedPin.lng });
    const targetZoom = selectedPin.category === 'visitor_live' ? 11 : 13;
    const currentZoom = map.getZoom() ?? 2;
    if (currentZoom < targetZoom) {
      map.setZoom(targetZoom);
    }
  }, [map, selectedPin]);

  useEffect(() => {
    if (!map || allPins.length === 0) return;

    if (allPins.length === 1) {
      map.setCenter({ lat: allPins[0].lat, lng: allPins[0].lng });
      map.setZoom(11);
      return;
    }

    let north = -90;
    let south = 90;
    let east = -180;
    let west = 180;
    for (const p of allPins) {
      if (p.lat > north) north = p.lat;
      if (p.lat < south) south = p.lat;
      if (p.lng > east) east = p.lng;
      if (p.lng < west) west = p.lng;
    }
    map.fitBounds(
      { north, south, east, west },
      { top: 48, right: 48, bottom: 48, left: 48 }
    );
  }, [map, fitTrigger, allPins.length]);

  return null;
}

export function GlobalSanctuaryMap({ currentTheme }: GlobalSanctuaryMapProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];
  const { isConfigured } = useMapsConfig();
  const isLoaded = useApiIsLoaded();
  const apiStatus = useApiLoadingStatus();
  const { location: visitorLocation } = useVisitorLocation();

  const [officialVenues, setOfficialVenues] = useState<SanctuaryMapPin[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SanctuaryMapPin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'official' | 'live' | 'search'>('all');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [fitTrigger, setFitTrigger] = useState(0);
  const [messagePins, setMessagePins] = useState<SanctuaryMapPin[]>([]);

  // Fetch curated official VIP & cinema venues via server-side Places API (New) proxy
  useEffect(() => {
    let cancelled = false;
    setVenuesLoading(true);

    fetch('/api/map/venues')
      .then(async (resp) => {
        const data = (await resp.json().catch(() => null)) as {
          venues?: SanctuaryMapPin[];
          quotaExceeded?: boolean;
        } | null;

        if (resp.status === 429 || data?.quotaExceeded) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled && Array.isArray(data?.venues)) {
          setOfficialVenues(data.venues);
          setFitTrigger((n) => n + 1);
        }
      })
      .catch(() => {
        // Keep map operational with visitor location / search even if venues request fails
      })
      .finally(() => {
        if (!cancelled) setVenuesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Load any visitor-sent messages that carry real detected coordinates
  useEffect(() => {
    const syncMessagePins = () => {
      try {
        const raw = localStorage.getItem('ld_owner_channeled_messages');
        if (!raw) return;
        const parsed = JSON.parse(raw) as ChanneledMessage[];
        if (!Array.isArray(parsed)) return;

        const pins: SanctuaryMapPin[] = [];
        for (const msg of parsed.slice(0, 12)) {
          if (
            msg.location &&
            Number.isFinite(msg.location.lat) &&
            Number.isFinite(msg.location.lng)
          ) {
            pins.push({
              id: `msg-pin-${msg.id}`,
              placeId: msg.location.placeId,
              title: msg.location.label,
              subtitle: `Inquiry from ${msg.senderName} • ${msg.timestamp}`,
              category: 'visitor_message',
              formattedAddress: msg.location.formattedAddress || msg.location.label,
              lat: msg.location.lat,
              lng: msg.location.lng,
            });
          }
        }
        setMessagePins(pins);
      } catch {
        // ignore
      }
    };

    syncMessagePins();
    window.addEventListener('new-channeled-message', syncMessagePins);
    window.addEventListener('storage', syncMessagePins);
    return () => {
      window.removeEventListener('new-channeled-message', syncMessagePins);
      window.removeEventListener('storage', syncMessagePins);
    };
  }, []);

  const liveVisitorPin: SanctuaryMapPin | null = useMemo(() => {
    if (
      !visitorLocation ||
      !Number.isFinite(visitorLocation.lat) ||
      !Number.isFinite(visitorLocation.lng)
    ) {
      return null;
    }
    return {
      id: 'visitor-live-location',
      placeId: visitorLocation.placeId,
      title: `Your Location: ${visitorLocation.label}`,
      subtitle: 'Auto-Detected Real Visitor Position',
      category: 'visitor_live',
      formattedAddress: visitorLocation.formattedAddress || visitorLocation.label,
      lat: visitorLocation.lat,
      lng: visitorLocation.lng,
    };
  }, [visitorLocation]);

  const allPins = useMemo<SanctuaryMapPin[]>(() => {
    const combined: SanctuaryMapPin[] = [];
    if (liveVisitorPin) combined.push(liveVisitorPin);
    combined.push(...officialVenues);
    combined.push(...searchResults);
    combined.push(...messagePins);
    return combined;
  }, [liveVisitorPin, officialVenues, searchResults, messagePins]);

  const visiblePins = useMemo<SanctuaryMapPin[]>(() => {
    if (activeFilter === 'official') return officialVenues;
    if (activeFilter === 'live') {
      return [...(liveVisitorPin ? [liveVisitorPin] : []), ...messagePins];
    }
    if (activeFilter === 'search') return searchResults;
    return allPins;
  }, [activeFilter, allPins, officialVenues, liveVisitorPin, messagePins, searchResults]);

  const selectedPin = useMemo(
    () => allPins.find((p) => p.id === selectedPinId) || null,
    [allPins, selectedPinId]
  );

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (q.length < 2 || isSearching) return;

      setIsSearching(true);
      setSearchNotice(null);
      try {
        const resp = await fetch('/api/map/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        });

        const data = (await resp.json().catch(() => null)) as {
          places?: SanctuaryMapPin[];
          quotaExceeded?: boolean;
          error?: string;
        } | null;

        if (resp.status === 429 || data?.quotaExceeded) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setSearchNotice('Google Maps search limit reached temporarily.');
          return;
        }

        if (!resp.ok) {
          setSearchNotice(data?.error || 'Could not complete map search right now.');
          return;
        }

        const found = Array.isArray(data?.places) ? data.places : [];
        setSearchResults(found);
        if (found.length > 0) {
          setActiveFilter('all');
          setSelectedPinId(found[0].id);
        } else {
          setSearchNotice(`No places matched "${q}". Try a city, landmark, or cinema venue.`);
        }
      } catch {
        setSearchNotice('Network error while searching Google Maps.');
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, isSearching]
  );

  const initialCenter = useMemo(() => {
    if (officialVenues[0]) {
      return { lat: officialVenues[0].lat, lng: officialVenues[0].lng };
    }
    if (liveVisitorPin) {
      return { lat: liveVisitorPin.lat, lng: liveVisitorPin.lng };
    }
    return { lat: 25, lng: 0 };
  }, [officialVenues, liveVisitorPin]);

  const mapReady =
    isConfigured &&
    isLoaded &&
    apiStatus !== APILoadingStatus.FAILED &&
    apiStatus !== APILoadingStatus.AUTH_FAILURE;

  return (
    <section
      id="global-sanctuary-map"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      aria-labelledby="global-sanctuary-map-heading"
    >
      <div className="rounded-3xl border border-amber-400/25 bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black p-5 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.12)] space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-amber-300">
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span>Live Google Maps Platform • Worldwide Venues &amp; Visitor Locator</span>
            </div>
            <h2
              id="global-sanctuary-map-heading"
              className="font-cinzel text-2xl sm:text-3xl font-black text-white tracking-tight"
            >
              Global VIP Sanctuary &amp;{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, #fef08a, ${themeConfig.accent}, #f59e0b)`,
                }}
              >
                Premiere Map
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Explore verified international premiere theaters, Beverly Hills &amp; Cannes VIP hubs,
              UN climate venues, your automatically detected live position, or search any place worldwide.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full lg:w-[390px] shrink-0">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city, cinema, hotel, or venue..."
                className="w-full rounded-xl border border-white/15 bg-black/80 pl-10 pr-24 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchNotice(null);
                  }}
                  className="absolute right-[78px] p-1 text-zinc-400 hover:text-white cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching || searchQuery.trim().length < 2}
                className="absolute right-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black hover:from-amber-300 hover:to-amber-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSearching ? 'Finding...' : 'Search'}
              </button>
            </div>
            {searchNotice && (
              <p className="mt-1.5 text-[11px] text-amber-300">{searchNotice}</p>
            )}
          </form>
        </div>

        {/* Filter & Map Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: `All Pins (${allPins.length})` },
                { id: 'official', label: `Official Venues (${officialVenues.length})` },
                {
                  id: 'live',
                  label: `Live & Dispatches (${(liveVisitorPin ? 1 : 0) + messagePins.length})`,
                },
                ...(searchResults.length > 0
                  ? [{ id: 'search' as const, label: `Search (${searchResults.length})` }]
                  : []),
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-amber-400 text-black font-bold shadow-md'
                    : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {liveVisitorPin && (
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedPinId(liveVisitorPin.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 px-3 py-1.5 text-xs font-semibold text-sky-200 transition-all cursor-pointer"
              >
                <Navigation className="h-3.5 w-3.5 text-sky-400" />
                <span>My Location</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedPinId(null);
                setFitTrigger((n) => n + 1);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Fit All</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setMapTypeId((prev) => (prev === 'roadmap' ? 'hybrid' : 'roadmap'))
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>{mapTypeId === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Split Interactive Google Map + Directory Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Interactive Google Map Canvas (CF2: explicit CSS height) */}
          <div className="lg:col-span-8 relative h-[440px] sm:h-[540px] w-full overflow-hidden rounded-2xl border border-amber-400/30 bg-zinc-950 shadow-2xl">
            {mapReady ? (
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={initialCenter}
                defaultZoom={2}
                mapTypeId={mapTypeId}
                gestureHandling="greedy"
                streetViewControl={false}
                mapTypeControl={false}
                fullscreenControl
                zoomControl
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                onClick={() => setSelectedPinId(null)}
              >
                <MapCameraController
                  selectedPin={selectedPin}
                  allPins={visiblePins}
                  fitTrigger={fitTrigger}
                />
                {visiblePins.map((pin) => (
                  <InteractivePinMarker
                    key={pin.id}
                    pin={pin}
                    isSelected={selectedPinId === pin.id}
                    onSelect={(p) => setSelectedPinId(p.id)}
                    onClose={() => setSelectedPinId(null)}
                  />
                ))}
              </GoogleMap>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-zinc-950">
                {apiStatus === APILoadingStatus.FAILED ||
                apiStatus === APILoadingStatus.AUTH_FAILURE ? (
                  <>
                    <MapPin className="h-8 w-8 text-amber-400" />
                    <p className="text-sm font-semibold text-white">
                      Unable to load interactive Google Map tiles right now.
                    </p>
                    <p className="text-xs text-zinc-400 max-w-md">
                      Please check your network connection or Google Maps API key restrictions. You can still browse verified venue links on the right.
                    </p>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
                    <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Loading Live Google Map...
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Subtle Pin Counter Overlay */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-xl border border-white/15 bg-black/80 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono text-zinc-200 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {venuesLoading
                  ? 'Syncing live Google Maps venues...'
                  : `${visiblePins.length} live verified ${visiblePins.length === 1 ? 'location' : 'locations'} plotted`}
              </span>
            </div>
          </div>

          {/* Interactive Location Directory Sidebar */}
          <div className="lg:col-span-4 flex flex-col rounded-2xl border border-white/10 bg-black/60 overflow-hidden max-h-[440px] sm:max-h-[540px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-zinc-900/80">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-white">
                  Pinned Destinations
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">
                {visiblePins.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {venuesLoading && visiblePins.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-400 text-xs">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                  <span>Loading verified Google Maps places...</span>
                </div>
              )}

              {!venuesLoading && visiblePins.length === 0 && (
                <div className="py-10 text-center text-xs text-zinc-400 px-4">
                  No locations in this filter yet. Try searching any landmark or switching to All Pins.
                </div>
              )}

              {visiblePins.map((pin) => {
                const isSelected = selectedPinId === pin.id;
                const meta = CATEGORY_META[pin.category];
                const safeExternalUrl =
                  sanitizeExternalUrl(pin.googleMapsUri) ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${pin.lat},${pin.lng}`
                  )}`;

                return (
                  <div
                    key={pin.id}
                    onClick={() => setSelectedPinId(pin.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPinId(pin.id);
                      }
                    }}
                    className={`group rounded-xl border p-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/12 shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                        : 'border-white/10 bg-zinc-900/70 hover:border-white/25 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <PinCategoryIcon category={pin.category} />
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                          {pin.title}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-amber-200/90 leading-snug">
                      {pin.subtitle}
                    </p>

                    {pin.formattedAddress && (
                      <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2 leading-snug">
                        {pin.formattedAddress}
                      </p>
                    )}

                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="text-zinc-500">
                        {formatCoordinates(pin.lat, pin.lng)}
                      </span>
                      <a
                        href={safeExternalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-sky-300 hover:text-amber-300 transition-colors"
                      >
                        <span>Directions</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
