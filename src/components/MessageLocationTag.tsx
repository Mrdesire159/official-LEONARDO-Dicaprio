import { useState } from 'react';
import {
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
} from 'lucide-react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  useApiIsLoaded,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { MessageLocation } from '../types';
import { formatCoordinates, useVisitorLocation } from '../services/visitorLocationService';
import { useMapsConfig } from '../context/MapsConfigContext';

function InlineLocationMapPreview({ location }: { location: MessageLocation }) {
  const { isConfigured } = useMapsConfig();
  const isLoaded = useApiIsLoaded();
  const status = useApiLoadingStatus();
  const position = { lat: location.lat, lng: location.lng };

  if (!isConfigured || status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="flex h-32 w-full flex-col items-center justify-center gap-1 rounded-lg border border-[#229ED9]/25 bg-zinc-950/90 px-3 text-center">
        <MapPin className="h-4 w-4 text-[#229ED9]" />
        <p className="text-[11px] font-semibold text-white">{location.label}</p>
        <p className="font-mono text-[10px] text-zinc-400">
          {formatCoordinates(location.lat, location.lng)}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-36 w-full items-center justify-center gap-2 rounded-lg border border-[#229ED9]/25 bg-zinc-950/90 text-[11px] text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin text-[#229ED9]" />
        <span>Loading Google Map...</span>
      </div>
    );
  }

  return (
    <div className="relative h-36 w-full overflow-hidden rounded-lg border border-[#229ED9]/35 bg-zinc-950">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={position}
        defaultZoom={location.source === 'gps' ? 14 : 11}
        gestureHandling="cooperative"
        disableDefaultUI
        zoomControl
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '144px' }}
      >
        <AdvancedMarker position={position} title={location.label}>
          <Pin
            background="#229ED9"
            borderColor="#0b4f71"
            glyphColor="#ffffff"
            scale={1.0}
          />
        </AdvancedMarker>
      </GoogleMap>
    </div>
  );
}

interface MessageLocationTagProps {
  location?: MessageLocation;
  compact?: boolean;
  tone?: 'dark' | 'on-gold';
  defaultExpanded?: boolean;
  align?: 'left' | 'right';
}

/**
 * Automatic real-location tag attached below every sent message and visitor request.
 * Displays the individual's real detected city/region/country in a neat badge,
 * with a clean click-to-expand live Google Map card.
 */
export function MessageLocationTag({
  location,
  compact = false,
  tone = 'dark',
  defaultExpanded = false,
  align = 'left',
}: MessageLocationTagProps) {
  const [mapExpanded, setMapExpanded] = useState(defaultExpanded);

  if (
    !location ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lng)
  ) {
    return null;
  }

  const coordsText = formatCoordinates(location.lat, location.lng);
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${location.lat},${location.lng}`
  )}`;

  if (compact) {
    return (
      <span
        className="inline-flex max-w-[185px] sm:max-w-[220px] items-center gap-1 rounded-md border border-[#229ED9]/40 bg-[#0b1f2e]/90 px-2 py-0.5 text-[10px] font-medium text-sky-100 shadow-xs shrink-0"
        title={`${location.label} (${coordsText})`}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <MapPin className="h-2.5 w-2.5 shrink-0 text-[#38bdf8]" />
        <span className="truncate leading-tight">{location.label}</span>
      </span>
    );
  }

  const badgeToneClasses =
    tone === 'on-gold'
      ? 'border-black/25 bg-black/80 text-amber-100 hover:bg-black/90 shadow-sm'
      : 'border-[#229ED9]/45 bg-[#0a1d2a]/90 text-sky-100 hover:border-[#38bdf8] hover:bg-[#0d2738] shadow-[0_2px_10px_rgba(34,158,217,0.16)]';

  const pinIconClasses = tone === 'on-gold' ? 'text-amber-300' : 'text-[#38bdf8]';

  return (
    <div
      className={`relative inline-flex flex-col ${align === 'right' ? 'items-end' : 'items-start'} max-w-full shrink-0`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Attached Below-Request Real Location Tag */}
      <button
        type="button"
        onClick={() => setMapExpanded((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition-all cursor-pointer max-w-[240px] sm:max-w-[300px] ${badgeToneClasses}`}
        title={`Individual location: ${location.label} • Click to ${mapExpanded ? 'hide' : 'view'} map`}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <MapPin className={`h-3 w-3 shrink-0 ${pinIconClasses}`} />
        <span className="truncate leading-tight">{location.label}</span>
        {mapExpanded ? (
          <ChevronUp className="h-2.5 w-2.5 shrink-0 opacity-75" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-75" />
        )}
      </button>

      {/* Expandable Live Google Map Popover Card */}
      {mapExpanded && (
        <div className="mt-1.5 w-[250px] sm:w-[290px] overflow-hidden rounded-xl border border-[#229ED9]/40 bg-zinc-950/98 text-left text-white shadow-[0_12px_32px_rgba(0,0,0,0.75)] z-20 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-start justify-between gap-2 px-2.5 py-2 border-b border-white/10">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0 text-[#38bdf8]" />
                <span className="truncate text-[11px] font-bold text-white">
                  {location.label}
                </span>
              </div>
              {location.formattedAddress && location.formattedAddress !== location.label && (
                <p className="mt-0.5 truncate text-[10px] text-zinc-400">
                  {location.formattedAddress}
                </p>
              )}
              <p className="mt-0.5 font-mono text-[9px] text-sky-300/85">{coordsText}</p>
            </div>
            <button
              type="button"
              onClick={() => setMapExpanded(false)}
              className="rounded p-0.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close map preview"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-2">
            <InlineLocationMapPreview location={location} />
          </div>

          <div className="flex items-center justify-between border-t border-white/10 bg-black/60 px-2.5 py-1.5 text-[9px] font-mono">
            <span className="text-emerald-400 uppercase tracking-wider font-bold">
              ● Verified Real Location
            </span>
            <a
              href={externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-300 hover:text-amber-300 transition-colors"
            >
              <span>Open Maps</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

interface ComposerLocationStatusBarProps {
  compact?: boolean;
}

/**
 * Passive, zero-approval auto-location indicator shown in message composers.
 * Silently resolves the visitor's real location without any browser prompt or manual buttons.
 */
export function ComposerLocationStatusBar({ compact = false }: ComposerLocationStatusBarProps) {
  const { location, isDetecting } = useVisitorLocation();

  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg border border-[#229ED9]/30 bg-[#0b1c28]/65 text-sky-100 ${
        compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {isDetecting && !location ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-[#38bdf8]" />
        ) : (
          <MapPin className="h-3 w-3 shrink-0 text-[#38bdf8]" />
        )}
        <span className="truncate text-zinc-300">
          {location ? (
            <>
              Location tag:{' '}
              <span className="font-semibold text-white">{location.label}</span>
            </>
          ) : (
            'Detecting real location automatically...'
          )}
        </span>
      </div>

      <span className="shrink-0 inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Auto
      </span>
    </div>
  );
}
