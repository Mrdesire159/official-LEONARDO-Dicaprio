import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
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
        .replace(/"url": "\/"/g, `"url": "${origin}/"`)
        .replace(/"\/profile\.png"/g, `"${origin}/profile.png"`)
        .replace(/"\/google-display-photo\.webp"/g, `"${origin}/google-display-photo.webp"`);
      ldJsonScript.textContent = updated;
    } catch {
      // Keep static JSON-LD intact if serialization fails
    }
  }
}

createRoot(document.getElementById('root')!).render(<App />);
