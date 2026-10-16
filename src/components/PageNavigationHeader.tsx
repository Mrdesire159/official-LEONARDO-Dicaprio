import { useEffect } from 'react';
import { PageId, LuxuryTheme } from '../types';
import { THEME_CONFIGS } from '../data/diCaprioData';
import {
  ArrowLeft,
  Home,
  User,
  Film,
  CreditCard,
  Image,
  ShieldAlert,
  Globe,
  CornerUpLeft,
} from 'lucide-react';

interface PageNavigationHeaderProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  onGoBack: () => void;
  currentTheme: LuxuryTheme;
  historyLength?: number;
}

const PAGE_DEFS: { id: PageId; label: string; shortLabel: string; icon: typeof User }[] = [
  { id: 'home', label: 'Main Sanctuary', shortLabel: 'Main Page', icon: Home },
  { id: 'biography', label: 'Biography', shortLabel: 'Biography', icon: User },
  { id: 'filmography', label: 'Film Reel', shortLabel: 'Films', icon: Film },
  { id: 'vip-guild', label: 'VIP Guild', shortLabel: 'VIP Guild', icon: CreditCard },
  { id: 'gallery', label: 'Archival Portraits', shortLabel: 'Portraits', icon: Image },
  { id: 'verification', label: 'Official Verification', shortLabel: 'Verification', icon: ShieldAlert },
  { id: 'testimonials', label: '50 Testimonials', shortLabel: 'Testimonials', icon: Globe },
];

export function PageNavigationHeader({
  activePage,
  onSelectPage,
  onGoBack,
  currentTheme,
}: PageNavigationHeaderProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  // Keyboard "Back Key" support (Escape and Backspace when not in an input field)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onGoBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onGoBack]);

  if (activePage === 'home') {
    return null;
  }

  const currentPageDef = PAGE_DEFS.find((p) => p.id === activePage);

  return (
    <div className="w-full max-w-7xl px-3 sm:px-6 lg:px-8 mb-6 mt-2">
      <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-2.5 sm:p-3.5 shadow-2xl flex flex-col gap-3">
        {/* Top Row: Primary Back Key, Main Page Return, and Current Page Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {/* Primary Back Button / Key */}
            <button
              onClick={onGoBack}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-3.5 py-2 text-xs font-bold text-amber-300 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-95 group cursor-pointer"
              title="Return back to previous page (Keyboard Shortcut: Esc or Backspace)"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
              <kbd className="hidden sm:inline-block ml-1 rounded border border-amber-400/30 bg-black/50 px-1.5 py-0.5 text-[9px] font-mono text-amber-200 group-hover:text-black group-hover:border-black/40">
                Esc
              </kbd>
            </button>

            {/* Direct Return to Mainpage Button */}
            <button
              onClick={() => onSelectPage('home')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Return to Main Sanctuary Homepage"
            >
              <Home className="h-3.5 w-3.5 text-amber-400" />
              <span>Main Page</span>
            </button>
          </div>

          {/* Current Page Tag with Return Hint */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 ml-auto">
            <span className="hidden md:inline font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
              Current Page:
            </span>
            <span className="font-semibold text-white bg-white/10 border border-white/15 rounded-lg px-2.5 py-1 text-[11px] sm:text-xs">
              {currentPageDef?.label || activePage}
            </span>
          </div>
        </div>

        {/* Bottom Row: Quick Return & Switch to Other Pages */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
            <CornerUpLeft className="h-3 w-3 text-amber-400/80" />
            Switch Page:
          </span>
          {PAGE_DEFS.map((page) => {
            const Icon = page.icon;
            const isActive = activePage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-black font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-3 w-3" style={{ color: isActive ? '#000000' : themeConfig.accent }} />
                <span>{page.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
