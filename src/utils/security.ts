/**
 * Validates and normalizes user-supplied external URLs to block javascript:, data:, and vbscript: schemes.
 * Returns a safe http(s) URL string or null if invalid/unsafe.
 */
export function sanitizeExternalUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Strips ASCII control characters from plain text inputs to prevent log/header spoofing.
 */
export function sanitizePlainText(raw: string, maxLength = 2000): string {
  return raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}
