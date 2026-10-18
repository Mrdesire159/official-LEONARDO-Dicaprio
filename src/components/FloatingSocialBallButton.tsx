import { Globe, Sparkles } from 'lucide-react';
import { LuxuryTheme } from '../types';
import { THEME_CONFIGS } from '../data/diCaprioData';

interface FloatingSocialBallButtonProps {
  onClick: () => void;
  currentTheme: LuxuryTheme;
}

export function FloatingSocialBallButton({
  onClick,
  currentTheme,
}: FloatingSocialBallButtonProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  return (
    <aside aria-label="Official Social Media Navigation" className="fixed bottom-6 left-5 sm:left-8 z-40 flex items-center">
      <button
        onClick={onClick}
        title="Official Social Media (Telegram #1, X, Instagram, Facebook)"
        className="group relative flex items-center gap-3 rounded-2xl border border-white/20 bg-black/85 p-2 sm:px-4 sm:py-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-zinc-950 active:scale-95"
        style={{
          boxShadow: `0 8px 30px rgba(0, 0, 0, 0.7), 0 0 25px ${themeConfig.accent}30`,
        }}
        aria-label="Display official social media channels"
      >
        {/* Animated 3D Mini Celestial Ball Icon */}
        <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-amber-400/50 bg-gradient-to-tr from-zinc-900 via-black to-zinc-800 shadow-inner overflow-hidden ring-1 ring-amber-400/30">
          {/* Internal image avatar */}
          <img
            src="/images/awa.webp"
            alt="Leonardo DiCaprio"
            className="h-full w-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/now07.webp';
            }}
          />
          {/* Internal rotating glow overlay */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.3)_0%,_transparent_60%)] pointer-events-none" />

          {/* 4 Orbiting dots for the 4 handles (Telegram #1 cyan, X white, Instagram pink, Facebook blue) */}
          <span className="absolute top-1 left-1.5 h-2 w-2 rounded-full bg-[#229ED9] shadow-[0_0_8px_#229ED9] ring-1 ring-amber-400 animate-pulse" title="Telegram #1" />
          <span className="absolute bottom-1 right-1.5 h-2 w-2 rounded-full bg-[#FFFFFF] shadow-[0_0_6px_#FFFFFF]" title="X (Twitter)" />
          <span className="absolute top-2.5 right-1 h-2 w-2 rounded-full bg-[#E4405F] shadow-[0_0_6px_#E4405F]" title="Instagram" />
          <span className="absolute bottom-2.5 left-1 h-2 w-2 rounded-full bg-[#1877F2] shadow-[0_0_6px_#1877F2]" title="Facebook" />
        </div>

        {/* Text Details (Responsive) */}
        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-cinzel text-xs font-bold tracking-wider text-white group-hover:text-amber-200 transition-colors">
              Social Media
            </span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-cyan-300 font-semibold">
            Telegram #1 · 4 Verified Handles
          </span>
        </div>

        {/* Pulsing Accent Ring */}
        <span
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-20 transition-opacity group-hover:opacity-40 animate-pulse"
          style={{
            border: `1.5px solid ${themeConfig.accent}`,
          }}
        />
      </button>
    </aside>
  );
}
