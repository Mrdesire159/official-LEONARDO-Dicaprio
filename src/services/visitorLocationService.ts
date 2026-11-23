import { useEffect, useState, useCallback } from 'react';
import { MessageLocation } from '../types';

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
  return true;
}

export function setAutoLocationEnabled(_enabled: boolean): void {
  // Always automatically enabled without requiring manual approval
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

async function detectNetworkLocationViaProxy(): Promise<MessageLocation | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch('/api/location/detect', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

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
    // Fall through to client-side silent IP lookup (for static hosting without Express proxy)
  }

  // Fallback for static deployments (e.g., Netlify) where /api/location/detect is not mounted
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const ipResp = await fetch('https://ipwho.is/', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (ipResp.ok) {
      const ipData = (await ipResp.json().catch(() => null)) as {
        success?: boolean;
        latitude?: number;
        longitude?: number;
        city?: string;
        region?: string;
        region_code?: string;
        country?: string;
        country_code?: string;
      } | null;

      if (
        ipData?.success &&
        typeof ipData.latitude === 'number' &&
        typeof ipData.longitude === 'number' &&
        Number.isFinite(ipData.latitude) &&
        Number.isFinite(ipData.longitude)
      ) {
        const parts = [
          ipData.city,
          ipData.region_code || ipData.region,
          ipData.country_code || ipData.country,
        ].filter(Boolean);
        return {
          lat: ipData.latitude,
          lng: ipData.longitude,
          label: parts.join(', ') || `${ipData.latitude.toFixed(4)}, ${ipData.longitude.toFixed(4)}`,
          formattedAddress:
            [ipData.city, ipData.region, ipData.country].filter(Boolean).join(', ') || undefined,
          city: ipData.city,
          region: ipData.region,
          country: ipData.country,
          countryCode: ipData.country_code,
          source: 'network_ip',
          capturedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // ignore network failure
  }

  return null;
}

export async function detectVisitorLocation(options?: {
  forceRefresh?: boolean;
}): Promise<MessageLocation | null> {
  const { forceRefresh = false } = options || {};

  if (!forceRefresh) {
    const cached = getCachedVisitorLocation();
    if (cached) return cached;
  }

  if (inFlightPromise && !forceRefresh) {
    return inFlightPromise;
  }

  const run = async (): Promise<MessageLocation | null> => {
    // Silent, zero-approval real location resolution (never triggers browser permission popup)
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
 * Automatically resolves the visitor's real location for every outgoing message/request
 * without requiring any browser permission prompt or manual approval.
 */
export async function resolveLocationForOutgoingMessage(): Promise<MessageLocation | undefined> {
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
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4500)),
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
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const syncFromStore = useCallback(() => {
    setLocation(getCachedVisitorLocation());
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
    if (!location) {
      setIsDetecting(true);
      detectVisitorLocation()
        .then((loc) => {
          if (loc) setLocation(loc);
        })
        .finally(() => setIsDetecting(false));
    }
  }, [location]);

  return {
    location,
    enabled: true,
    isDetecting,
  };
}
