import {
  ArrowUp,
  Send,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Heart
} from 'lucide-react';
import { LuxuryTheme, PageId } from '../types';
import { THEME_CONFIGS, SOCIAL_MEDIA_HANDLES } from '../data/diCaprioData';

interface FooterProps {
  currentTheme: LuxuryTheme;
  onOpenSocialBall?: () => void;
  onOpenAdmin?: () => void;
  onNavigatePage?: (page: PageId) => void;
  onOpenVerificationModal?: () => void;
}

export function Footer({
  currentTheme,
  onOpenSocialBall,
  onOpenAdmin,
  onNavigatePage,
  onOpenVerificationModal,
}: FooterProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full border-t border-white/10 bg-black pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-[140px] opacity-20"
        style={{ backgroundColor: themeConfig.accent }}
      />

      <div className="mx-auto max-w-7xl">
        {/* TOP SECTION: SOCIAL MEDIA HANDLES HUB (Distinct Colors as requested) */}
        <div className="rounded-3xl border border-white/15 bg-zinc-950/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Official Channels & Broadcasts
              </span>
              <h3 className="font-cinzel text-2xl sm:text-3xl font-black text-white mt-1">
                Connect Directly With Leonardo DiCaprio
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Verified social hubs with live updates on new films, gala appearances, and global conservation initiatives.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Verified</span>
              </div>
            </div>
          </div>

          {/* Social Links Cards Grid with distinct branding colors — Telegram #1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. TELEGRAM (#1 PRIORITY DISPLAY) */}
            <a
              href={SOCIAL_MEDIA_HANDLES.telegram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{
                borderColor: 'rgba(34, 158, 217, 0.7)',
                background: 'linear-gradient(135deg, rgba(34, 158, 217, 0.16) 0%, rgba(9, 9, 11, 0.98) 100%)',
                boxShadow: '0 8px 30px rgba(34, 158, 217, 0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = SOCIAL_MEDIA_HANDLES.telegram.hoverGlow;
                e.currentTarget.style.borderColor = '#229ED9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(34, 158, 217, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(34, 158, 217, 0.7)';
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: '#229ED9', boxShadow: '0 0 15px rgba(34, 158, 217, 0.6)' }}
                  >
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md">
                    ★ #1 Channel
                  </span>
                </div>
                <h4 className="font-cinzel text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {SOCIAL_MEDIA_HANDLES.telegram.name}
                </h4>
                <p className="text-xs font-mono text-cyan-300 font-bold mt-0.5">{SOCIAL_MEDIA_HANDLES.telegram.handle}</p>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Leonardo&apos;s primary direct broadcast for urgent climate actions and cinematic direct contact.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#229ED9]">
                <span>Join Telegram Channel</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </a>

            {/* 2. OFFICIAL X (TWITTER) ACCOUNT */}
            <a
              href={SOCIAL_MEDIA_HANDLES.x.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(9, 9, 11, 0.98) 100%)',
                boxShadow: '0 4px 25px rgba(0, 0, 0, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = SOCIAL_MEDIA_HANDLES.x.hoverGlow;
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-black border border-white/30 text-white font-bold text-lg shadow-lg"
                  >
                    <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="rounded-full bg-white/10 border border-white/30 px-2.5 py-0.5 text-[10px] font-bold text-zinc-200 uppercase tracking-wider">
                    Official Verified
                  </span>
                </div>
                <h4 className="font-cinzel text-base font-bold text-white group-hover:text-white transition-colors">
                  {SOCIAL_MEDIA_HANDLES.x.name}
                </h4>
                <p className="text-xs font-mono text-zinc-300 font-bold mt-0.5">{SOCIAL_MEDIA_HANDLES.x.handle}</p>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  19M+ followers worldwide for UN Messenger of Peace statements and film announcements.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-zinc-200">
                <span>Follow on X</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </a>

            {/* 3. INSTAGRAM */}
            <a
              href={SOCIAL_MEDIA_HANDLES.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{
                borderColor: 'rgba(228, 64, 95, 0.4)',
                background: 'linear-gradient(135deg, rgba(228, 64, 95, 0.08) 0%, rgba(9, 9, 11, 0.95) 100%)',
                boxShadow: '0 4px 25px rgba(0, 0, 0, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = SOCIAL_MEDIA_HANDLES.instagram.hoverGlow;
                e.currentTarget.style.borderColor = '#E4405F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(228, 64, 95, 0.4)';
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-bold text-lg shadow-lg">
                    <span className="font-sans font-black">IG</span>
                  </div>
                  <span className="rounded-full bg-[#E4405F]/20 border border-[#E4405F]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#E4405F] uppercase tracking-wider">
                    Meta Verified
                  </span>
                </div>
                <h4 className="font-cinzel text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                  {SOCIAL_MEDIA_HANDLES.instagram.name}
                </h4>
                <p className="text-xs font-mono text-rose-300 font-bold mt-0.5">{SOCIAL_MEDIA_HANDLES.instagram.handle}</p>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Over 62 million followers dedicated to frontline biodiversity &amp; planetary rescue.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#E4405F]">
                <span>Open Instagram Profile</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </a>

            {/* 4. FACEBOOK */}
            <a
              href={SOCIAL_MEDIA_HANDLES.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{
                borderColor: 'rgba(24, 119, 242, 0.4)',
                background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.08) 0%, rgba(9, 9, 11, 0.95) 100%)',
                boxShadow: '0 4px 25px rgba(0, 0, 0, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = SOCIAL_MEDIA_HANDLES.facebook.hoverGlow;
                e.currentTarget.style.borderColor = '#1877F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(24, 119, 242, 0.4)';
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: '#1877F2' }}
                  >
                    f
                  </div>
                  <span className="rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#1877F2] uppercase tracking-wider">
                    Official Page
                  </span>
                </div>
                <h4 className="font-cinzel text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {SOCIAL_MEDIA_HANDLES.facebook.name}
                </h4>
                <p className="text-xs font-mono text-blue-300 font-bold mt-0.5">{SOCIAL_MEDIA_HANDLES.facebook.handle}</p>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Official Facebook community for press tours, gala galas, and film festivals.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#1877F2]">
                <span>Visit Facebook Page</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          </div>
        </div>

        {/* MIDDLE SECTION: BRAND DETAILS & SIGNATURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-white/10 pb-12 mb-8">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg border font-cinzel font-bold text-sm"
                style={{ borderColor: themeConfig.accent, color: themeConfig.accent }}
              >
                LD
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-white tracking-widest">
                  LEONARDO DICAPRIO
                </h3>
                <span className="text-[10px] tracking-widest text-zinc-400 uppercase">
                  Cinematic Legacy & Earth Alliance
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              A bespoke digital archive honoring thirty-three years of groundbreaking performance, Academy Award recognition, and unwavering planetary conservation advocacy.
            </p>
          </div>

          {/* Authentic Signature Graphic */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
              Official Monogram & Endorsement
            </span>
            <div className="h-16 w-56 flex items-center justify-center filter invert opacity-80 hover:opacity-100 transition-opacity">
              <img
                src="/images/leo_signature.png"
                alt="Leonardo DiCaprio Authentic Signature"
                className="h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Quick links & Back to Top */}
          <div className="lg:col-span-3 flex flex-col items-start lg:items-end gap-3">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ArrowUp className="h-4 w-4" />
              <span>Back to Top</span>
            </button>
            <span className="text-[11px] text-zinc-500">
              The Official Experience
            </span>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Leonardo DiCaprio. All Rights Reserved. Not affiliated with commercial advertisers.</p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {onNavigatePage ? (
              <>
                <button
                  onClick={() => {
                    onNavigatePage('home');
                    scrollToTop();
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Overview
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    onNavigatePage('biography');
                    scrollToTop();
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Biography
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    onNavigatePage('filmography');
                    scrollToTop();
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Film Reel
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    onNavigatePage('vip-guild');
                    scrollToTop();
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  VIP Guild
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    onNavigatePage('verification');
                    scrollToTop();
                  }}
                  className="text-amber-400 hover:text-white font-semibold transition-colors"
                >
                  Official Warning & Report
                </button>
              </>
            ) : (
              <>
                <a href="#biography" className="hover:text-zinc-300 transition-colors">Earth Alliance</a>
                <span>·</span>
                <a href="#vip-store" className="hover:text-zinc-300 transition-colors">Vault Provenance</a>
              </>
            )}
            {onOpenVerificationModal && (
              <>
                <span>·</span>
                <button
                  onClick={onOpenVerificationModal}
                  className="text-amber-400 hover:text-white transition-colors"
                >
                  Anti-Fraud Notice
                </button>
              </>
            )}
            {onOpenAdmin && (
              <>
                <span>·</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 text-zinc-500 font-mono text-[10px] transition-colors flex items-center gap-1 opacity-40 hover:opacity-100"
                  title="Site Owner Admin"
                  aria-label="Site Owner Admin"
                >
                  <ShieldCheck className="h-2.5 w-2.5 text-zinc-500" />
                  <span>adm</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
