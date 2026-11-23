import { useEffect, useState, useCallback } from 'react';
import { MessageLocation } from '../types';

const AUTO_LOCATION_PREF_KEY = 'ld_auto_location_enabled';
const CACHED_LOCATION_KEY = 'ld_cached_visitor_location';
const LOCATION_EVENT = 'visitor-location-updated';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes session cache (respects 30-day ToS limit easily)

let inMemoryLocation: MessageLocation | null = null;
let inFlightPromise: Promise<MessageLocation | null> | null = null;

function notifyLocationListeners() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOCATION_EVENT));
  }
}

function triggerQuotaExceededIfNeeded(status: number, quotaExceeded?: boolean) {
  if (typeof window === 'undefined') return;
  if (status === 429 || quotaExceeded) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

export function isAutoLocationEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(AUTO_LOCATION_PREF_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setAutoLocationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTO_LOCATION_PREF_KEY, String(enabled));
    if (!enabled) {
      sessionStorage.removeItem(CACHED_LOCATION_KEY);
    }
  } catch {
    // ignore storage failures
  }
  notifyLocationListeners();
}

export function getCachedVisitorLocation(): MessageLocation | null {
  if (inMemoryLocation) return inMemoryLocation;
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHED_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt: number; location: MessageLocation };
    if (
      parsed &&
      parsed.location &&
      typeof parsed.savedAt === 'number' &&
      Date.now() - parsed.savedAt < CACHE_TTL_MS
    ) {
      inMemoryLocation = parsed.location;
      return parsed.location;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveCachedLocation(loc: MessageLocation) {
  inMemoryLocation = loc;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        CACHED_LOCATION_KEY,
        JSON.stringify({ savedAt: Date.now(), location: loc })
      );
    } catch {
      // ignore
    }
  }
  notifyLocationListeners();
}

function getBrowserPosition(timeoutMs = 7000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Browser geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 120000,
    });
  });
}

async function isGpsPermissionAlreadyGranted(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return false;
  }
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return status.state === 'granted';
  } catch {
    return false;
  }
}

async function reverseGeocodeViaProxy(
  lat: number,
  lng: number,
  accuracyMeters?: number
): Promise<MessageLocation | null> {
  try {
    const resp = await fetch('/api/location/reverse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, accuracyMeters }),
    });

    const data = (await resp.json().catch(() => null)) as {
      location?: MessageLocation;
      quotaExceeded?: boolean;
      error?: { status?: string };
    } | null;

    triggerQuotaExceededIfNeeded(
      resp.status,
      data?.quotaExceeded || data?.error?.status === 'RESOURCE_EXHAUSTED'
    );

    if (resp.ok && data?.location) {
      return data.location;
    }
  } catch {
    // Fallback below to raw GPS coordinates if server proxy temporarily unavailable
  }

  return {
    lat,
    lng,
    label: `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`,
    accuracyMeters,
    source: 'gps',
    capturedAt: new Date().toISOString(),
  };
}

async function detectNetworkLocationViaProxy(): Promise<MessageLocation | null> {
  try {
    const resp = await fetch('/api/location/detect', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const data = (await resp.json().catch(() => null)) as {
      location?: MessageLocation | null;
      quotaExceeded?: boolean;
      error?: { status?: string };
    } | null;

    triggerQuotaExceededIfNeeded(
      resp.status,
      data?.quotaExceeded || data?.error?.status === 'RESOURCE_EXHAUSTED'
    );

    if (resp.ok && data?.location) {
      return data.location;
    }
  } catch {
    // ignore network failure
  }
  return null;
}

export async function detectVisitorLocation(options?: {
  requestGps?: boolean;
  forceRefresh?: boolean;
}): Promise<MessageLocation | null> {
  const { requestGps = false, forceRefresh = false } = options || {};

  if (!requestGps && !isAutoLocationEnabled()) {
    return null;
  }

  if (!forceRefresh && !requestGps) {
    const cached = getCachedVisitorLocation();
    if (cached) return cached;
  }

  if (inFlightPromise && !requestGps && !forceRefresh) {
    return inFlightPromise;
  }

  const run = async (): Promise<MessageLocation | null> => {
    // 1. Use precise GPS if user explicitly clicked Pinpoint GPS OR permission was already granted
    const canTryGps = requestGps || (await isGpsPermissionAlreadyGranted());
    if (canTryGps) {
      try {
        const pos = await getBrowserPosition(requestGps ? 9000 : 4000);
        const gpsLoc = await reverseGeocodeViaProxy(
          pos.coords.latitude,
          pos.coords.longitude,
          Math.round(pos.coords.accuracy)
        );
        if (gpsLoc) {
          saveCachedLocation(gpsLoc);
          return gpsLoc;
        }
      } catch {
        // User declined GPS or device unavailable — fall back cleanly to real network geolocation
      }
    }

    // 2. Automatic real network/IP geolocation via server proxy + Google Maps Geocoding API
    const netLoc = await detectNetworkLocationViaProxy();
    if (netLoc) {
      saveCachedLocation(netLoc);
      return netLoc;
    }

    return getCachedVisitorLocation();
  };

  inFlightPromise = run().finally(() => {
    inFlightPromise = null;
  });

  return inFlightPromise;
}

/**
 * Resolves the visitor's real location for attaching to an outgoing message.
 * Uses cached location immediately if ready, or awaits real-time detection with a short timeout
 * so sending messages is never blocked.
 */
export async function resolveLocationForOutgoingMessage(): Promise<MessageLocation | undefined> {
  if (!isAutoLocationEnabled()) return undefined;

  const cached = getCachedVisitorLocation();
  if (cached) {
    return {
      ...cached,
      capturedAt: new Date().toISOString(),
    };
  }

  try {
    const detected = await Promise.race<MessageLocation | null>([
      detectVisitorLocation(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2800)),
    ]);
    if (detected) {
      return {
        ...detected,
        capturedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Never block message sending
  }
  return undefined;
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function useVisitorLocation() {
  const [location, setLocation] = useState<MessageLocation | null>(() => getCachedVisitorLocation());
  const [enabled, setEnabled] = useState<boolean>(() => isAutoLocationEnabled());
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const syncFromStore = useCallback(() => {
    setLocation(getCachedVisitorLocation());
    setEnabled(isAutoLocationEnabled());
  }, []);

  useEffect(() => {
    window.addEventListener(LOCATION_EVENT, syncFromStore);
    window.addEventListener('storage', syncFromStore);
    return () => {
      window.removeEventListener(LOCATION_EVENT, syncFromStore);
      window.removeEventListener('storage', syncFromStore);
    };
  }, [syncFromStore]);

  useEffect(() => {
    if (enabled && !location) {
      setIsDetecting(true);
      detectVisitorLocation()
        .then((loc) => {
          if (loc) setLocation(loc);
        })
        .finally(() => setIsDetecting(false));
    }
  }, [enabled, location]);

  const toggleEnabled = useCallback(() => {
    const next = !isAutoLocationEnabled();
    setAutoLocationEnabled(next);
    setEnabled(next);
    if (next) {
      setIsDetecting(true);
      detectVisitorLocation({ forceRefresh: false })
        .then((loc) => {
          if (loc) setLocation(loc);
        })
        .finally(() => setIsDetecting(false));
    }
  }, []);

  const requestPreciseGps = useCallback(async () => {
    if (!isAutoLocationEnabled()) {
      setAutoLocationEnabled(true);
      setEnabled(true);
    }
    setIsDetecting(true);
    try {
      const loc = await detectVisitorLocation({ requestGps: true, forceRefresh: true });
      if (loc) setLocation(loc);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return {
    location,
    enabled,
    isDetecting,
    toggleEnabled,
    requestPreciseGps,
  };
}
