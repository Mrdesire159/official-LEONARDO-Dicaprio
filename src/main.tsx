import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  // Capture PWA beforeinstallprompt early so in-app Download App buttons never miss it
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as unknown as { __ldDeferredInstallPrompt?: Event }).__ldDeferredInstallPrompt = e;
  });

  // Prevent stale Service Worker caches in dev; keep PWA auto-updating in production
  if (import.meta.env.DEV) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((reg) => {
            reg.unregister().catch(() => {});
          });
        })
        .catch(() => {});
    }
    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => {
          keys
            .filter((k) => k.includes('workbox') || k.includes('vite-pwa'))
            .forEach((k) => caches.delete(k).catch(() => {}));
        })
        .catch(() => {});
    }
  } else {
    try {
      registerSW({
        immediate: true,
        onRegisteredSW(_swUrl, registration) {
          registration?.update().catch(() => {});
        },
      });
    } catch {
      // Ignore SW registration issues in restricted environments
    }
  }

  // Tier 1 Google Maps Platform quota & auth error listeners
  (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    origConsoleError.apply(console, args);
    const msg = args.map((a) => String(a)).join(' ');
    if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  };

  const origin = window.location.origin;
  const canonicalUrl = `${origin}${window.location.pathname}`;

  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonicalUrl;

  const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.content = canonicalUrl;
  }

  const profileAbsoluteUrl = `${origin}/profile.png`;
  const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
  if (ogImage) {
    ogImage.content = profileAbsoluteUrl;
  }
  const ogLogo = document.querySelector<HTMLMetaElement>('meta[property="og:logo"]');
  if (ogLogo) {
    ogLogo.content = profileAbsoluteUrl;
  }
  const twitterImage = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
  if (twitterImage) {
    twitterImage.content = profileAbsoluteUrl;
  }

  const ldJsonScript = document.getElementById('seo-structured-data');
  if (ldJsonScript?.textContent) {
    try {
      const updated = ldJsonScript.textContent
        .replace(/"(\/(?:#[^"]*|(?:\?q=\{search_term_string\})?)?)"/g, `"${origin}$1"`)
        .replace(/"\/profile\.png"/g, `"${origin}/profile.png"`)
        .replace(/"\/google-display-photo\.webp"/g, `"${origin}/google-display-photo.webp"`);
      ldJsonScript.textContent = updated;
    } catch {
      // Keep static JSON-LD intact if serialization fails
    }
  }
}

createRoot(document.getElementById('root')!).render(<App />);
