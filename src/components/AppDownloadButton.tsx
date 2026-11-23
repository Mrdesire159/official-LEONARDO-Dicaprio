import { useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Copy,
  Check,
  Monitor,
  WifiOff,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

interface AppDownloadButtonProps {
  variant?: 'navbar' | 'hero' | 'mobile-drawer' | 'footer';
  onActionComplete?: () => void;
}

export function AppDownloadButton({
  variant = 'navbar',
  onActionComplete,
}: AppDownloadButtonProps) {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInstalling, install } =
    usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Hide automatically when already running as an installed standalone app
  if (isInstalled && !justInstalled) {
    return null;
  }

  const appUrl =
    typeof window !== 'undefined' ? window.location.origin + '/' : '/';

  const handleClick = async () => {
    if (isInstallable) {
      const result = await install();
      if (result === 'accepted') {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
        onActionComplete?.();
        return;
      }
      if (result === 'dismissed') {
        return;
      }
    }
    setShowGuideModal(true);
  };

  const handleCopyAppUrl = () => {
    try {
      navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownloadWebShortcut = () => {
    const shortcutContent = `[InternetShortcut]\nURL=${appUrl}\n`;
    const blob = new Blob([shortcutContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Leonardo-DiCaprio-Official-App.url';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderTrigger = () => {
    if (justInstalled) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>App Installed</span>
        </span>
      );
    }

    if (variant === 'hero') {
      return (
        <button
          type="button"
          onClick={handleClick}
          disabled={isInstalling}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/15 hover:bg-emerald-500/25 px-4 py-2.5 text-xs font-bold text-emerald-200 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 cursor-pointer"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>{isInstallable ? 'Install Official App' : 'Download App'}</span>
        </button>
      );
    }

    if (variant === 'mobile-drawer') {
      return (
        <button
          type="button"
          onClick={() => {
            handleClick();
          }}
          disabled={isInstalling}
          className="flex items-center justify-between w-full rounded-xl border border-emerald-400/45 bg-emerald-500/15 hover:bg-emerald-500/25 p-2.5 sm:p-3 text-xs font-bold text-emerald-200 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{isInstallable ? 'Install Official App' : 'Download Official App'}</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-400 text-black px-1.5 py-0.5 rounded font-black shrink-0">
            Free
          </span>
        </button>
      );
    }

    if (variant === 'footer') {
      return (
        <button
          type="button"
          onClick={handleClick}
          disabled={isInstalling}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 hover:text-white transition-all cursor-pointer"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Download App</span>
        </button>
      );
    }

    // Default: navbar compact luxury button
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isInstalling}
        title="Download & Install Leonardo DiCaprio Official App to your phone or desktop"
        className="flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-emerald-400/50 bg-emerald-500/15 hover:bg-emerald-500/30 px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold text-emerald-200 hover:text-white transition-all shadow-[0_0_14px_rgba(16,185,129,0.2)] active:scale-95 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span className="hidden md:inline">Download App</span>
        <span className="md:hidden text-[10px]">App</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {showGuideModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Download Leonardo DiCaprio Official App"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-emerald-400/35 bg-zinc-950 p-6 text-left shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Close install guide"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <img
                src="/pwa-192x192.png"
                alt="Leonardo DiCaprio Official App Icon"
                className="h-14 w-14 rounded-2xl border border-amber-400/50 object-cover shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/profile.png';
                }}
              />
              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Official Progressive Web App</span>
                </div>
                <h3 className="font-cinzel text-lg font-bold text-white leading-tight">
                  Leonardo DiCaprio VIP
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Instant home-screen access · Offline support · Full-screen app
                </p>
              </div>
            </div>

            {isInstallable && (
              <button
                type="button"
                onClick={async () => {
                  const res = await install();
                  if (res === 'accepted') {
                    setShowGuideModal(false);
                    setJustInstalled(true);
                    onActionComplete?.();
                  }
                }}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-3 px-4 text-xs font-black uppercase tracking-wider text-black shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Install App Directly Now</span>
              </button>
            )}

            <div className="space-y-3 text-xs text-zinc-300">
              {isIOS ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Smartphone className="h-4 w-4 text-amber-400" />
                    <span>Install on iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="space-y-2 text-[11px] text-zinc-300 list-decimal list-inside">
                    <li>
                      Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="h-3 w-3 text-sky-400 inline" /> Share</strong> button in Safari&apos;s toolbar.
                    </li>
                    <li>
                      Scroll down and tap <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="h-3 w-3 text-emerald-400 inline" /> Add to Home Screen</strong>.
                    </li>
                    <li>
                      Tap <strong className="text-white">Add</strong> to launch directly from your Home Screen.
                    </li>
                  </ol>
                </div>
              ) : isAndroid ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    <span>Install on Android (Chrome)</span>
                  </div>
                  <ol className="space-y-2 text-[11px] text-zinc-300 list-decimal list-inside">
                    <li>
                      Tap the <strong className="text-white">⋮ Menu</strong> icon in the top-right corner of Chrome.
                    </li>
                    <li>
                      Tap <strong className="text-white">Install app</strong> or <strong className="text-white">Add to Home screen</strong>.
                    </li>
                    <li>
                      Confirm <strong className="text-white">Install</strong> to add the app icon to your phone.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Monitor className="h-4 w-4 text-amber-400" />
                    <span>Install on Desktop or Mobile</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-zinc-300">
                    <li>
                      <strong className="text-white">Chrome / Edge:</strong> Click the install icon in the browser address bar (or open the full app URL in a standalone browser tab).
                    </li>
                    <li>
                      <strong className="text-white">iPhone / iPad:</strong> Open in Safari → Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>.
                    </li>
                    <li>
                      <strong className="text-white">Android:</strong> Open in Chrome → Tap <strong>⋮ Menu</strong> → <strong>Install app</strong>.
                    </li>
                  </ul>
                </div>
              )}

              {/* Direct Quick Actions: Open Full Tab, Copy App Link, Download Desktop Shortcut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/15 hover:bg-amber-400/25 px-3 py-2.5 text-[11px] font-bold text-amber-200 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Browser Tab</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadWebShortcut}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-2.5 text-[11px] font-bold text-emerald-200 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Save App Shortcut</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyAppUrl}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedUrl ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">App Link Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy App Link to Install on Phone</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/95 px-3.5 py-2 text-xs font-bold text-black shadow-xl backdrop-blur-md">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Offline Mode — Cached app data active</span>
    </div>
  );
}
