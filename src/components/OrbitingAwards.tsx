import { useState, useEffect } from 'react';
import {
  Award,
  Quote,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { LuxuryTheme, AwardMedal } from '../types';
import { THEME_CONFIGS, ORBITING_AWARDS } from '../data/diCaprioData';

interface OrbitingAwardsProps {
  currentTheme: LuxuryTheme;
  reducedMotion?: boolean;
}

export function OrbitingAwards({ currentTheme }: OrbitingAwardsProps) {
  const [angle] = useState(0);
  const [selectedAward, setSelectedAward] = useState<AwardMedal>(ORBITING_AWARDS[0]);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const themeConfig = THEME_CONFIGS[currentTheme];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section id="awards" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black/80">
      {/* Background radial gold aura */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full blur-[160px] opacity-25"
        style={{ backgroundColor: themeConfig.accent }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: themeConfig.accent }}>
            <Award className="h-4 w-4" />
            <span>Honors & Global Accolades</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Major <span className={`bg-gradient-to-r ${themeConfig.gradientText} bg-clip-text text-transparent`}>Medals &amp; Laurels</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-300 font-light max-w-2xl mx-auto">
            DiCaprio’s prestigious cinematic honors displayed in cosmic harmony around the 88th Academy Award Oscar monument. Select any medal to inspect the acceptance speech and historical citation.
          </p>
        </div>

        {/* 3D ORBITAL ARENA & INSPECTOR CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* ORBIT ARENA (Left / Center) */}
          <div className="lg:col-span-7 relative h-[480px] sm:h-[560px] flex items-center justify-center">
            {/* Orbital concentric tracks */}
            <div className="pointer-events-none absolute h-[340px] w-[340px] sm:h-[400px] sm:w-[400px] rounded-full border border-dashed border-amber-400/20" />
            <div className="pointer-events-none absolute h-[260px] w-[260px] sm:h-[300px] sm:w-[300px] rounded-full border border-amber-400/15" />
            <div className="pointer-events-none absolute h-[420px] w-[420px] sm:h-[480px] sm:w-[480px] rounded-full border border-white/5" />

            {/* Central Pedestal: 88th Academy Award Oscar Statue Monument */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full border-2 border-amber-400/80 bg-zinc-950 p-2 shadow-2xl flex items-center justify-center">
                <img
                  src="/images/images (4).jfif"
                  alt="Oscar Award Monument"
                  className="h-full w-full object-cover rounded-full"
                />
                <div className="pointer-events-none absolute inset-0 rounded-full hologram-shimmer opacity-40" />
              </div>
              <div className="mt-3 rounded-full border border-amber-400/40 bg-black/90 px-3 py-1 text-center shadow-lg backdrop-blur-md">
                <span className="font-cinzel text-xs font-bold text-amber-300 tracking-wider">
                  88th Academy Awards
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-zinc-400">
                  Best Actor In A Leading Role
                </span>
              </div>
            </div>

            {/* Orbiting Medals */}
            {ORBITING_AWARDS.map((award, index) => {
              const currentAngleRad = ((angle + award.orbitAngle) * Math.PI) / 180;
              const radius = isMobileScreen ? award.orbitRadius * 0.65 : award.orbitRadius;
              const x = Math.cos(currentAngleRad) * radius;
              const y = Math.sin(currentAngleRad) * (radius * 0.72);
              const isSelected = selectedAward.id === award.id;
              const zIndex = y > 0 ? 25 : 5;

              return (
                <div
                  key={award.id}
                  className="absolute transition-transform duration-75 cursor-pointer"
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                    zIndex,
                  }}
                  onClick={() => setSelectedAward(award)}
                >
                  <div
                    className={`group relative flex items-center justify-center rounded-full p-2.5 transition-all duration-300 ${
                      isSelected
                        ? 'border-2 border-amber-300 bg-amber-400/30 scale-125 ring-4 ring-amber-400/40'
                        : 'border border-amber-400/40 bg-zinc-950/90 hover:scale-110 hover:border-amber-300'
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? '0 0 30px rgba(212, 175, 55, 0.8)'
                        : '0 0 15px rgba(0, 0, 0, 0.7)',
                    }}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/80 text-amber-300">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-12" />
                    </div>

                    {/* Medal Tooltip Chip */}
                    <div className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/95 px-2 py-0.5 text-[9px] font-bold text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-lg">
                      {award.organization.split(' ')[0]} {award.year}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* INSPECTOR PANEL (Right) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/15 bg-zinc-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
              {/* Medal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                      {selectedAward.year} Laureate
                    </span>
                    <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                      {selectedAward.organization}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{selectedAward.result}</span>
                </div>
              </div>

              {/* Award Category & Film */}
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                    Category
                  </span>
                  <p className="text-sm font-semibold text-white">{selectedAward.category}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                    Feature Film
                  </span>
                  <p className="text-sm font-semibold text-amber-200">{selectedAward.film}</p>
                </div>
              </div>

              {/* Speech Soundbite Excerpt */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 relative mb-6">
                <Quote className="h-5 w-5 text-amber-400/40 absolute -top-2.5 left-4 bg-zinc-950 px-1" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300/80 block mb-2">
                  Historic Acceptance Speech:
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                  {selectedAward.speechExcerpt}
                </p>
              </div>

              {/* Medal Quick Selector Strip */}
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block mb-2">
                  Switch Orbiting Medal:
                </span>
                <div className="flex flex-wrap gap-2">
                  {ORBITING_AWARDS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAward(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedAward.id === a.id
                          ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {a.year} {a.organization.includes('Academy') ? 'Oscar' : a.organization.includes('BAFTA') ? 'BAFTA' : a.organization.includes('Screen') ? 'SAG' : 'Globe'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
