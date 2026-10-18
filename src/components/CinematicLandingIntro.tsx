import { useState, useEffect, useCallback } from 'react';
import { Film, Sparkles, ArrowRight, Play } from 'lucide-react';
import { LuxuryTheme } from '../types';
import { THEME_CONFIGS } from '../data/diCaprioData';

interface CinematicLandingIntroProps {
  currentTheme: LuxuryTheme;
  onComplete: () => void;
  reducedMotion?: boolean;
}

export function CinematicLandingIntro({
  currentTheme,
  onComplete,
  reducedMotion = false,
}: CinematicLandingIntroProps) {
  const [phase, setPhase] = useState<'shutter' | 'title' | 'tagline' | 'exit'>('shutter');
  const [progress, setProgress] = useState(0);
  const themeConfig = THEME_CONFIGS[currentTheme];

  const handleFinish = useCallback(() => {
    setPhase('exit');
    setTimeout(() => {
      onComplete();
    }, 600);
  }, [onComplete]);

  // If user prefers reduced motion, finish immediately
  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    // Phase 1 -> Phase 2 (Title): at 500ms
    const t1 = setTimeout(() => setPhase('title'), 500);

    // Phase 2 -> Phase 3 (Tagline): at 1800ms
    const t2 = setTimeout(() => setPhase('tagline'), 1800);

    // Phase 3 -> Auto Exit: at 4200ms
    const t3 = setTimeout(() => handleFinish(), 4200);

    // Progress bar tick
    const startTime = Date.now();
    const duration = 4200;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFinish, onComplete, reducedMotion]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050507] text-white overflow-hidden select-none transition-all duration-700 ease-out ${
        phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="dialog"
      aria-label="Cinematic Landing Experience"
    >
      {/* 1. 35mm Film Sprocket Bars on Left & Right Margins */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 z-20 flex flex-col justify-between py-4 border-r border-amber-500/15 bg-black/60">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={`left-${i}`}
            className="w-4 h-6 sm:w-5 sm:h-7 mx-auto rounded-xs border border-amber-400/30 bg-[#09090b] shadow-inner"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 z-20 flex flex-col justify-between py-4 border-l border-amber-500/15 bg-black/60">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={`right-${i}`}
            className="w-4 h-6 sm:w-5 sm:h-7 mx-auto rounded-xs border border-amber-400/30 bg-[#09090b] shadow-inner"
          />
        ))}
      </div>

      {/* 2. Film Reel Static, Grain & Projector Flutter Layer */}
      <div className="pointer-events-none absolute inset-0 z-10 animate-film-flicker opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(245, 197, 24, 0.22) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* 3. Subtle Vertical Film Scratch Line Jitter */}
      <div className="pointer-events-none absolute inset-y-0 left-1/3 w-[1px] bg-amber-200/20 z-10 animate-film-scratch" />
      <div className="pointer-events-none absolute inset-y-0 right-1/4 w-[1px] bg-white/15 z-10 animate-film-scratch [animation-delay:0.18s]" />

      {/* 4. Ambient Anamorphic Golden Beam Flare in Background */}
      <div
        className="pointer-events-none absolute h-[400px] w-[900px] rounded-full blur-[160px] opacity-25 animate-beam-flare"
        style={{ backgroundColor: themeConfig.accent }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#030305_75%)]" />

      {/* 5. Central Branding Holographic Vignette */}
      <div className="relative z-30 mx-auto max-w-4xl px-8 text-center flex flex-col items-center">
        {/* Archival Celluloid Monogram Emblem */}
        <div
          className={`transition-all duration-1000 ease-out mb-6 flex flex-col items-center ${
            phase !== 'shutter' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          <div className="relative mb-3 flex items-center justify-center">
            {/* Glowing outer ring */}
            <div
              className="absolute h-20 w-20 sm:h-24 sm:w-24 rounded-full blur-md opacity-60 animate-pulse"
              style={{ backgroundColor: themeConfig.accent }}
            />
            {/* Monogram crest */}
            <div
              className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 bg-black/90 shadow-2xl backdrop-blur-md"
              style={{ borderColor: themeConfig.accent }}
            >
              <span
                className="font-cinzel text-2xl sm:text-3xl font-black tracking-widest"
                style={{ color: themeConfig.accent }}
              >
                LD
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-amber-300">
            <Film className="h-3 w-3" />
            <span>35mm Archival Celluloid Edition</span>
          </div>
        </div>

        {/* Cinematic Leonardo DiCaprio Title Fade-In */}
        <div
          className={`transition-all duration-1000 ease-out ${
            phase !== 'shutter' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
          }`}
        >
          <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-[0.2em] sm:tracking-[0.28em] text-white drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]">
            LEONARDO
          </h1>
          <h2
            className="font-cinzel text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light uppercase tracking-[0.25em] sm:tracking-[0.35em] mt-1"
            style={{
              background: `linear-gradient(135deg, #ffffff 0%, ${themeConfig.accent} 60%, #ffffff 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            DICAPRIO
          </h2>
        </div>

        {/* Subtitle & Mission Statement */}
        <div
          className={`mt-6 max-w-2xl transition-all duration-1000 ease-out ${
            phase === 'tagline' || phase === 'exit'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="h-[1px] w-32 sm:w-48 mx-auto bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mb-4" />
          <p className="font-cinzel text-xs sm:text-sm tracking-[0.3em] uppercase text-zinc-300 font-semibold">
            The Official Cinematic Sanctuary
          </p>
          <p className="font-serif italic text-xs sm:text-sm text-amber-200/80 mt-1.5 tracking-wide">
            Three Decades of Uncompromising Screen Transformation &amp; Earth Alliance Crusade
          </p>
        </div>

        {/* Skip / Enter Sanctuary Interactive Control */}
        <div
          className={`mt-10 transition-all duration-700 ease-out ${
            phase !== 'shutter' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={handleFinish}
            className="group inline-flex items-center gap-3 rounded-full border border-amber-400/50 bg-black/80 hover:bg-amber-400 hover:text-black px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-amber-400 group-hover:text-black transition-colors" />
            <span>Enter Sanctuary</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            <span className="font-mono text-[10px] text-zinc-400 group-hover:text-black/70 border-l border-white/20 pl-2 ml-1">
              ↵
            </span>
          </button>
        </div>
      </div>

      {/* 6. Bottom Film Reel Timecode & Progress Indicator */}
      <div className="absolute bottom-6 left-12 right-12 sm:left-16 sm:right-16 z-30 flex flex-col items-center gap-2">
        <div className="w-full max-w-md flex items-center justify-between text-[10px] font-mono tracking-widest text-zinc-500">
          <span className="text-amber-400/80">REEL 01 // 35MM</span>
          <span>PRESS [ENTER] TO SKIP</span>
          <span className="text-amber-400/80">24 FPS</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full max-w-md h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200 transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
