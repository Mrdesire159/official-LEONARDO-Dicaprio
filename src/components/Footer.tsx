import { useState, useEffect } from 'react';
import {
  ArrowUp,
  ShieldCheck,
} from 'lucide-react';
import { LuxuryTheme, PageId } from '../types';
import { THEME_CONFIGS } from '../data/diCaprioData';

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

  const [isOwnerVisible, setIsOwnerVisible] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return (
          localStorage.getItem('ld_owner_mode') === 'true' ||
          sessionStorage.getItem('ld_owner_authenticated') === 'true'
        );
      }
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleOwnerEvent = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === 'boolean') {
        setIsOwnerVisible(detail);
      }
    };
    window.addEventListener('owner-mode-changed', handleOwnerEvent);
    return () => window.removeEventListener('owner-mode-changed', handleOwnerEvent);
  }, []);

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
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
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
                    onNavigatePage('gallery');
                    scrollToTop();
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  Portraits
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    onNavigatePage('testimonials');
                    scrollToTop();
                  }}
                  className="hover:text-amber-300 transition-colors"
                >
                  50 Testimonials
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
            {onOpenAdmin && isOwnerVisible && (
              <>
                <span>·</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 text-amber-400 font-mono text-xs transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                  title="Site Owner Admin Portal (Visible exclusively to you)"
                  aria-label="Site Owner Admin Portal"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Admin Portal</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
