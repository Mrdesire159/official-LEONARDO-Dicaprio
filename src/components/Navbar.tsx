import { useState } from 'react';
import {
  Film,
  Award,
  CreditCard,
  Image,
  User,
  Globe,
  Menu,
  X,
  ShieldAlert,
  ShieldCheck,
  Compass,
  Lock,
  Volume2,
  VolumeX,
  Send
} from 'lucide-react';
import { LuxuryTheme, PageId } from '../types';
import { THEME_CONFIGS, SOCIAL_MEDIA_HANDLES } from '../data/diCaprioData';

interface NavbarProps {
  currentTheme: LuxuryTheme;
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  onOpenVerificationModal: () => void;
  ambientAudioPlaying?: boolean;
  onToggleAmbientAudio?: () => void;
  onOpenProfile?: () => void;
  onOpenSocialBall?: () => void;
  onOpenConcierge?: () => void;
  onOpenAdmin?: () => void;
  orderCount?: number;
}

export function Navbar({
  currentTheme,
  activePage,
  onSelectPage,
  onOpenVerificationModal,
  ambientAudioPlaying,
  onToggleAmbientAudio,
  onOpenProfile,
  onOpenAdmin,
  orderCount = 0,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const themeConfig = THEME_CONFIGS[currentTheme];

  const navPages: { pageId: PageId; label: string; icon: typeof User }[] = [
    { pageId: 'home', label: 'Sanctuary Overview', icon: Compass },
    { pageId: 'biography', label: 'Biography', icon: User },
    { pageId: 'filmography', label: 'Film Reel', icon: Film },
    { pageId: 'vip-guild', label: 'VIP Guild', icon: CreditCard },
    { pageId: 'gallery', label: 'Portraits', icon: Image },
    { pageId: 'verification', label: 'Verification & Warning', icon: ShieldAlert },
    { pageId: 'testimonials', label: '50 Testimonials', icon: Globe },
  ];

  const handlePageClick = (pageId: PageId) => {
    setMobileMenuOpen(false);
    onSelectPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl transition-colors duration-500">
      {/* Top Advisory Bar */}
      <div className="bg-gradient-to-r from-amber-500/20 via-black to-cyan-500/20 border-b border-white/5 px-2.5 sm:px-4 py-1 sm:py-1.5 text-center flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-zinc-300">
        <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 shrink-0" />
        <span className="font-semibold text-white">Authentic Sanctuary:</span>
        <span className="hidden md:inline">The one and only verified Leonardo DiCaprio website & social presence.</span>
        <button
          onClick={onOpenVerificationModal}
          className="text-amber-300 hover:text-white underline font-bold ml-0.5 sm:ml-1 transition-colors"
        >
          Warning & Report Imposters →
        </button>
      </div>

      <div className="mx-auto flex h-14 sm:h-16 lg:h-20 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Header */}
        <button
          onClick={() => handlePageClick('home')}
          className="group flex items-center gap-2 sm:gap-3 text-left transition-opacity hover:opacity-90 min-w-0 shrink"
        >
          <div
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border text-xs sm:text-sm font-semibold tracking-widest font-cinzel transition-all duration-300 shrink-0"
            style={{
              borderColor: themeConfig.accent,
              boxShadow: themeConfig.neonShadow,
              color: themeConfig.accent,
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.8) 100%)',
            }}
          >
            LD
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-cinzel text-xs sm:text-base font-bold tracking-[0.12em] sm:tracking-[0.2em] text-white group-hover:text-amber-200 transition-colors truncate">
              LEONARDO DICAPRIO
            </span>
            <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-zinc-400 truncate">
              The Official Experience
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-medium tracking-wider uppercase">
          {navPages.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.pageId;
            return (
              <button
                key={item.pageId}
                onClick={() => handlePageClick(item.pageId)}
                className={`group relative flex items-center gap-1.5 py-2 transition-colors ${
                  isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className="h-3.5 w-3.5 transition-colors"
                  style={{ color: isActive ? themeConfig.accent : 'currentColor' }}
                />
                <span>{item.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                  style={{ backgroundColor: themeConfig.accent }}
                />
              </button>
            );
          })}
        </nav>

        {/* Action Controls - CSS selector 1: div#root > div > header > div:nth-of-type(2) > div:nth-of-type(1) */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
          {/* Prominent Verification & Imposter Warning Button */}
          <button
            onClick={onOpenVerificationModal}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border border-amber-400/40 bg-amber-400/10 px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] active:scale-95"
            title="Open Official Accounts & Imposter Warning Notice"
          >
            <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wide">Official</span>
            <span className="hidden sm:inline rounded-full bg-amber-400 text-black px-1.5 py-0.2 text-[9px] font-black uppercase">
              Notice
            </span>
          </button>

          {/* Ambient Noir Audio Control */}
          {onToggleAmbientAudio && (
            <button
              onClick={onToggleAmbientAudio}
              className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
              title={ambientAudioPlaying ? 'Mute Cinematic Audio' : 'Play Cinematic Audio'}
              aria-label="Toggle ambient soundtrack"
            >
              {ambientAudioPlaying ? (
                <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
              )}
            </button>
          )}

          {/* Patron Profile Trigger */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex h-7 sm:h-9 items-center gap-1 sm:gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-2.5 text-xs text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
              title="Patron Profile & Orders"
            >
              <User className="h-3.5 w-3.5" />
              {orderCount > 0 && (
                <span className="rounded-full bg-amber-400 text-black px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-black leading-none py-0.5">
                  {orderCount}
                </span>
              )}
            </button>
          )}

          {/* Discreet Smallish Admin Portal Trigger (hidden on phone, accessible in drawer) */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              title="Site Owner Admin"
              className="hidden sm:flex group h-7 items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-2 text-[10px] font-mono text-zinc-500 hover:text-amber-300 hover:border-amber-400/30 hover:bg-amber-400/10 transition-all opacity-40 hover:opacity-100"
              aria-label="Site Owner Admin"
            >
              <Lock className="h-2.5 w-2.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              <span>adm</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 xl:hidden hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-black/98 px-4 py-4 sm:px-6 sm:py-6 backdrop-blur-2xl xl:hidden max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2.5">
            {/* Mobile Prominent Warning Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVerificationModal();
              }}
              className="flex items-center justify-between rounded-xl border border-amber-400/40 bg-amber-400/10 p-2.5 sm:p-3 text-xs font-bold text-amber-300 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Official Accounts & Imposter Warning</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-amber-400 text-black px-1.5 py-0.5 rounded font-black shrink-0">
                Notice
              </span>
            </button>

            {/* Mobile Navigation Pages */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-3">
                Sanctuary Chapters
              </span>
              {navPages.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.pageId;
                return (
                  <button
                    key={item.pageId}
                    onClick={() => handlePageClick(item.pageId)}
                    className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white font-bold'
                        : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: isActive ? themeConfig.accent : 'currentColor' }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Discreet Smallish Admin Trigger */}
            {onOpenAdmin && (
              <div className="pt-2 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-mono text-zinc-500 hover:text-amber-300 transition-colors opacity-60 hover:opacity-100"
                  aria-label="Site Owner Admin"
                >
                  <Lock className="h-2.5 w-2.5 text-zinc-500" />
                  <span>Admin Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
