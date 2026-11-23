import { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Loader2,
  Map as MapIcon,
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

function InlineTelegramMapPreview({ location }: { location: MessageLocation }) {
  const { isConfigured } = useMapsConfig();
  const isLoaded = useApiIsLoaded();
  const status = useApiLoadingStatus();
  const position = { lat: location.lat, lng: location.lng };

  if (!isConfigured || status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="flex h-36 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-[#229ED9]/25 bg-zinc-950/90 px-3 text-center">
        <MapPin className="h-5 w-5 text-[#229ED9]" />
        <p className="text-[11px] font-semibold text-white">{location.label}</p>
        <p className="font-mono text-[10px] text-zinc-400">
          {formatCoordinates(location.lat, location.lng)}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-40 w-full items-center justify-center gap-2 rounded-lg border border-[#229ED9]/25 bg-zinc-950/90 text-[11px] text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin text-[#229ED9]" />
        <span>Loading Google Map preview...</span>
      </div>
    );
  }

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg border border-[#229ED9]/35 bg-zinc-950">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={position}
        defaultZoom={location.source === 'gps' ? 14 : 11}
        gestureHandling="cooperative"
        disableDefaultUI
        zoomControl
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '160px' }}
      >
        <AdvancedMarker position={position} title={location.label}>
          <Pin
            background="#229ED9"
            borderColor="#0b4f71"
            glyphColor="#ffffff"
            scale={1.05}
          />
        </AdvancedMarker>
      </GoogleMap>
    </div>
  );
}

interface MessageLocationTagProps {
  location?: MessageLocation;
  compact?: boolean;
  align?: 'left' | 'right';
  defaultExpanded?: boolean;
}

/**
 * Telegram-style real geolocation tag rendered directly below every sent message.
 * Shows live location label, real coordinates, GPS/Network badge, and an expandable interactive Google Map card.
 */
export function MessageLocationTag({
  location,
  compact = false,
  align = 'left',
  defaultExpanded = false,
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
  const isGps = location.source === 'gps';

  if (compact) {
    return (
      <div className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-md border border-[#229ED9]/30 bg-[#229ED9]/10 px-2 py-0.5 text-[10px] text-[#7dd3fc]">
        <MapPin className="h-2.5 w-2.5 shrink-0 text-[#229ED9]" />
        <span className="truncate font-medium text-sky-100">{location.label}</span>
        <span className="hidden sm:inline font-mono text-[9px] text-sky-300/75">
          • {coordsText}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`mt-1.5 w-full max-w-[340px] overflow-hidden rounded-xl border border-[#229ED9]/35 bg-gradient-to-br from-[#0c1c28]/95 via-zinc-950/95 to-black/95 shadow-[0_6px_20px_rgba(0,0,0,0.45)] ${
        align === 'right' ? 'ml-auto' : ''
      }`}
    >
      {/* Telegram-style Location Header Bar */}
      <div className="flex items-start gap-2.5 px-2.5 py-2">
        <div className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#229ED9]/20 text-[#38bdf8] border border-[#229ED9]/40">
          {isGps ? (
            <Navigation className="h-3.5 w-3.5 text-[#38bdf8]" />
          ) : (
            <MapPin className="h-3.5 w-3.5 text-[#38bdf8]" />
          )}
          <span
            className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${
              isGps ? 'bg-emerald-400 animate-pulse' : 'bg-[#229ED9]'
            } ring-2 ring-zinc-950`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <span className="truncate text-[11px] font-bold text-white leading-tight">
              {location.label}
            </span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider border ${
                isGps
                  ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-[#229ED9]/40 bg-[#229ED9]/15 text-sky-300'
              }`}
            >
              {isGps ? 'GPS Live' : 'Real Location'}
            </span>
          </div>

          {location.formattedAddress &&
            location.formattedAddress !== location.label && (
              <p className="mt-0.5 truncate text-[10px] text-zinc-300/90">
                {location.formattedAddress}
              </p>
            )}

          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[9px] font-mono text-zinc-400">
            <span className="text-sky-300/85">{coordsText}</span>
            {location.accuracyMeters !== undefined && (
              <span className="text-zinc-500">±{location.accuracyMeters}m</span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Interactive Google Map Card */}
      {mapExpanded && (
        <div className="px-2.5 pb-2">
          <InlineTelegramMapPreview location={location} />
        </div>
      )}

      {/* Telegram-style Location Action Strip */}
      <div className="flex items-center justify-between border-t border-[#229ED9]/20 bg-black/50 px-2.5 py-1.5 text-[10px]">
        <button
          type="button"
          onClick={() => setMapExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 font-semibold text-[#38bdf8] hover:text-sky-200 transition-colors cursor-pointer"
        >
          <MapIcon className="h-3 w-3" />
          <span>{mapExpanded ? 'Hide Map' : 'View Live Map'}</span>
          {mapExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[9px] text-zinc-400 hover:text-amber-300 transition-colors"
        >
          <span>Open in Maps</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
}

interface ComposerLocationStatusBarProps {
  compact?: boolean;
}

/**
 * Transparent, revocable auto-location tag bar shown inside message composers.
 * Displays the visitor's real detected location that will be automatically tagged below sent messages,
 * with one-click GPS pinpoint and an instant On/Off toggle.
 */
export function ComposerLocationStatusBar({ compact = false }: ComposerLocationStatusBarProps) {
  const { location, enabled, isDetecting, toggleEnabled, requestPreciseGps } =
    useVisitorLocation();

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border ${
        enabled
          ? 'border-[#229ED9]/35 bg-[#0c1c28]/70 text-sky-100'
          : 'border-white/10 bg-zinc-900/60 text-zinc-400'
      } ${compact ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-[11px]'}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
            enabled
              ? 'bg-[#229ED9]/20 text-[#38bdf8]'
              : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          {isDetecting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <MapPin className="h-3 w-3" />
          )}
        </span>

        <div className="min-w-0">
          {!enabled ? (
            <span className="text-zinc-400">Location tag disabled for outgoing messages</span>
          ) : isDetecting && !location ? (
            <span className="text-sky-200/90">Detecting your real location for message tag...</span>
          ) : location ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#38bdf8]">
                Auto-Location Tag:
              </span>
              <span className="truncate font-semibold text-white max-w-[190px] sm:max-w-[260px]">
                {location.label}
              </span>
              {location.source === 'gps' && (
                <span className="rounded bg-emerald-500/20 px-1 py-0.2 font-mono text-[8px] font-bold uppercase text-emerald-300 border border-emerald-500/30">
                  GPS
                </span>
              )}
            </div>
          ) : (
            <span className="text-sky-200/80">
              Auto-location active (resolves on send or tap Pinpoint GPS)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {enabled && (
          <button
            type="button"
            onClick={requestPreciseGps}
            disabled={isDetecting}
            className="inline-flex items-center gap-1 rounded-lg border border-[#229ED9]/45 bg-[#229ED9]/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-sky-200 hover:bg-[#229ED9]/30 transition-colors disabled:opacity-50 cursor-pointer"
            title="Use device GPS for exact street-level coordinates"
          >
            <Crosshair className="h-2.5 w-2.5" />
            <span>{location?.source === 'gps' ? 'Refresh GPS' : 'Pinpoint GPS'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={toggleEnabled}
          className={`rounded-lg border px-2 py-0.5 font-mono text-[9px] font-bold uppercase transition-colors cursor-pointer ${
            enabled
              ? 'border-white/15 bg-black/50 text-zinc-300 hover:text-white'
              : 'border-[#229ED9]/50 bg-[#229ED9]/20 text-sky-200 hover:bg-[#229ED9]/35'
          }`}
          title={enabled ? 'Disable automatic location tagging' : 'Enable automatic location tagging'}
        >
          {enabled ? 'Tag: ON' : 'Enable Tag'}
        </button>
      </div>
    </div>
  );
}
