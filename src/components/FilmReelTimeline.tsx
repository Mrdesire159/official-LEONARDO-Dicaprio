import { useState } from 'react';
import {
  Film,
  ChevronLeft,
  ChevronRight,
  Award,
  DollarSign,
  Quote
} from 'lucide-react';
import { LuxuryTheme } from '../types';
import { THEME_CONFIGS, FILM_REEL_TIMELINE } from '../data/diCaprioData';

interface FilmReelTimelineProps {
  currentTheme: LuxuryTheme;
  reducedMotion?: boolean;
}

export function FilmReelTimeline({ currentTheme }: FilmReelTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(7); // Default to The Revenant (Oscar win)
  const [projectorFlicker, setProjectorFlicker] = useState(false);

  const themeConfig = THEME_CONFIGS[currentTheme];
  const activeFilm = FILM_REEL_TIMELINE[activeIndex];

  const handlePrev = () => {
    setProjectorFlicker(true);
    setActiveIndex((prev) => (prev === 0 ? FILM_REEL_TIMELINE.length - 1 : prev - 1));
    setTimeout(() => setProjectorFlicker(false), 200);
  };

  const handleNext = () => {
    setProjectorFlicker(true);
    setActiveIndex((prev) => (prev + 1) % FILM_REEL_TIMELINE.length);
    setTimeout(() => setProjectorFlicker(false), 200);
  };

  const handleSelectFilm = (index: number) => {
    if (index !== activeIndex) {
      setProjectorFlicker(true);
      setActiveIndex(index);
      setTimeout(() => setProjectorFlicker(false), 200);
    }
  };

  return (
    <section id="film-reel" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black/60">
      {/* Background Cinematic Ambience */}
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-[140px] opacity-25"
        style={{ backgroundColor: activeFilm.accentColor }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              The Film Reel <span className={`bg-gradient-to-r ${themeConfig.gradientText} bg-clip-text text-transparent`}>Timeline</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              An interactive mechanical film reel traversing over three decades of transformative cinema, historic collaborations, and legendary screen presence.
            </p>
          </div>

          {/* Timeline Navigation Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300">
              <Film className="h-3.5 w-3.5 text-amber-300" />
              <span>Milestone {activeIndex + 1} of {FILM_REEL_TIMELINE.length}</span>
            </div>

            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={handlePrev}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
                aria-label="Previous Film"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2.5 text-xs font-mono font-bold text-amber-300">
                {String(activeIndex + 1).padStart(2, '0')}/{String(FILM_REEL_TIMELINE.length).padStart(2, '0')}
              </span>
              <button
                onClick={handleNext}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
                aria-label="Next Film"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 35mm SPROCKET FILM REEL STRIP (Horizontal Continuous Reel) */}
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/90 shadow-2xl backdrop-blur-xl">
          {/* Top Sprocket Perforations */}
          <div className="h-7 w-full border-b border-white/10 bg-black flex items-center justify-between px-3 overflow-hidden select-none">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-3.5 w-2 rounded-xs bg-zinc-800 border border-zinc-700/60 shrink-0 mx-1.5" />
            ))}
          </div>

          {/* Film Thumbnails Reel Carousel */}
          <div className="py-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-4 scroll-smooth">
            {FILM_REEL_TIMELINE.map((film, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={film.id}
                  onClick={() => handleSelectFilm(idx)}
                  className={`group relative flex flex-col shrink-0 w-36 sm:w-44 text-left rounded-xl overflow-hidden border transition-all duration-300 ${
                    isCurrent
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 bg-zinc-900 shadow-xl'
                      : 'border-white/10 bg-zinc-950/60 opacity-60 hover:opacity-100 hover:border-white/30'
                  }`}
                  style={{
                    boxShadow: isCurrent ? `0 0 25px ${film.accentColor}55` : 'none',
                  }}
                >
                  <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={film.image}
                      alt={film.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                      {film.year}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-cinzel text-xs font-bold text-white line-clamp-1 group-hover:text-amber-200">
                      {film.title}
                    </h3>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{film.role}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Sprocket Perforations */}
          <div className="h-7 w-full border-t border-white/10 bg-black flex items-center justify-between px-3 overflow-hidden select-none">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-3.5 w-2 rounded-xs bg-zinc-800 border border-zinc-700/60 shrink-0 mx-1.5" />
            ))}
          </div>
        </div>

        {/* ACTIVE FILM SPOTLIGHT DISPLAY */}
        <div className="w-full max-w-4xl mx-auto">
          <div
            className={`relative rounded-3xl border border-white/15 bg-zinc-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 ${
              projectorFlicker ? 'brightness-125' : ''
            }`}
            style={{
              boxShadow: `0 20px 50px -10px ${activeFilm.accentColor}33`,
            }}
          >
              {/* Year & Tagline Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-lg px-3 py-1 font-mono text-xs font-bold text-black"
                    style={{ backgroundColor: activeFilm.accentColor }}
                  >
                    {activeFilm.year}
                  </span>
                  <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
                    Directed by {activeFilm.director}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Box Office: {activeFilm.boxOffice}</span>
                </div>
              </div>

              {/* Title & Role */}
              <h3 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {activeFilm.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-amber-200/90 font-medium">
                <span>Portrayed:</span>
                <span className="font-semibold text-white underline decoration-amber-400/40">{activeFilm.role}</span>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
                {activeFilm.description}
              </p>

              {/* Quote Pull-out */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 relative">
                <Quote className="h-6 w-6 text-amber-400/40 absolute -top-3 left-4 bg-zinc-950 px-1" />
                <p className="italic text-xs sm:text-sm text-zinc-200 pt-1 leading-relaxed">
                  {activeFilm.quote}
                </p>
              </div>

              {/* Awards Won Badges */}
              <div className="mt-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  Key Accolades & Milestones:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeFilm.awardsWon.map((award, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200"
                    >
                      <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{award}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
