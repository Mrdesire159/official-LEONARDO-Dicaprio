import { useState } from 'react';
import {
  User,
  Globe,
  Film,
  Award,
  TreePine,
  Sparkles,
  HeartHandshake,
  Quote,
  Image as ImageIcon,
  Check,
  Eye,
  Sliders
} from 'lucide-react';
import { LuxuryTheme, PhotoAsset } from '../types';
import { THEME_CONFIGS, USER_PHOTOS } from '../data/diCaprioData';

interface BiographySectionProps {
  currentTheme: LuxuryTheme;
}

export function BiographySection({ currentTheme }: BiographySectionProps) {
  const [activeTab, setActiveTab] = useState<'cinema' | 'activism' | 'scorsese'>('cinema');
  const [selectedBgPhotoIndex, setSelectedBgPhotoIndex] = useState<number>(0);

  const themeConfig = THEME_CONFIGS[currentTheme];

  // Map chapter tab to default relevant photo if not manually overridden
  const chapterDefaultPhotoMap: Record<'cinema' | 'activism' | 'scorsese', number> = {
    cinema: 3, // images (5).jfif (Inception era)
    scorsese: 5, // images (9).jfif (Killers of the Flower Moon / method actor)
    activism: 4, // images (7).jfif (UN speech)
  };

  const currentBgPhoto = USER_PHOTOS[selectedBgPhotoIndex] || USER_PHOTOS[chapterDefaultPhotoMap[activeTab]];

  const stats = [
    { label: 'Academy Award', value: 'Best Actor', sub: '7 Career Oscar Nominations', icon: Award },
    { label: 'Golden Globes', value: '3 Wins', sub: '14 HFPA Nominations', icon: Sparkles },
    { label: 'Lifetime Box Office', value: '$7.2+ Billion', sub: 'Across 30+ Feature Films', icon: Film },
    { label: 'Conservation Grants', value: '$100M+', sub: 'Active in 50+ Global Ecosystems', icon: TreePine },
  ];

  const handleTabChange = (tab: 'cinema' | 'activism' | 'scorsese') => {
    setActiveTab(tab);
    setSelectedBgPhotoIndex(chapterDefaultPhotoMap[tab]);
  };

  return (
    <section id="biography" className="relative w-full py-28 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* 1. CINEMATIC FULL-BLEED PHOTO BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* The active selected Leonardo DiCaprio photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
          style={{
            backgroundImage: `url(${currentBgPhoto.url})`,
            filter: 'saturate(1.15) brightness(0.38) contrast(1.15) blur(1.5px)',
            transform: 'scale(1.04)',
          }}
        />

        {/* Cinematic Vignette & Atmospheric Radial Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_15%,_#030305_90%)]" />

        {/* Ambient Chromatic Accent Glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full blur-[160px] opacity-25 mix-blend-screen"
          style={{ backgroundColor: themeConfig.accent }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8 backdrop-blur-md rounded-2xl p-6 bg-black/40">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: themeConfig.accent }}>
              <User className="h-4 w-4" />
              <span>The Definitive Biography</span>
            </div>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              Artistry, Vision &amp; <span className={`bg-gradient-to-r ${themeConfig.gradientText} bg-clip-text text-transparent`}>Planetary Impact</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-300 max-w-2xl font-light">
              From the streets of East Hollywood to the highest pantheon of world cinema and global environmental statesmanship.
            </p>
          </div>

          {/* Biography Chapter Tabs */}
          <div className="flex items-center gap-2 bg-black/70 p-1.5 rounded-2xl border border-white/15 backdrop-blur-xl">
            <button
              onClick={() => handleTabChange('cinema')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all ${
                activeTab === 'cinema' ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cinematic Trajectory
            </button>
            <button
              onClick={() => handleTabChange('scorsese')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all ${
                activeTab === 'scorsese' ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              The Scorsese Dynasty
            </button>
            <button
              onClick={() => handleTabChange('activism')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all ${
                activeTab === 'activism' ? 'bg-white text-black font-bold shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Earth Alliance &amp; UN
            </button>
          </div>
        </div>

        {/* 2. KEY METRICS STATS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/15 bg-black/60 p-5 shadow-2xl backdrop-blur-xl transition-transform hover:scale-102"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{s.label}</span>
                  <Icon className="h-4 w-4" style={{ color: themeConfig.accent }} />
                </div>
                <div className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white">
                  {s.value}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* 4. MAIN BIOGRAPHY CHAPTERS (Floating on Top of Ambient Photo Layer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Featured Card Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[480px] w-full rounded-3xl overflow-hidden border border-white/20 bg-black/60 shadow-2xl backdrop-blur-md group">
              <img
                src={currentBgPhoto.url}
                alt={currentBgPhoto.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = currentBgPhoto.fallbackUrl;
                }}
                className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6">
                <span className="rounded-md bg-black/80 px-2.5 py-1 text-[10px] font-mono uppercase text-amber-300 border border-white/20 backdrop-blur-md">
                  {currentBgPhoto.badgeText} · {currentBgPhoto.year}
                </span>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mt-2 drop-shadow-md">
                  {currentBgPhoto.title}
                </h3>
                <p className="text-xs text-zinc-300 mt-1 line-clamp-2 font-light">
                  {currentBgPhoto.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column In-Depth Narrative Floating Glass Box */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/15 bg-black/75 p-6 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-6">
              {activeTab === 'cinema' && (
                <div className="space-y-4 text-zinc-200 leading-relaxed text-sm sm:text-base font-light">
                  <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                    A Relentless Pursuit of Cinematic Truth
                  </h3>
                  <p>
                    Born on November 11, 1974, in Los Angeles, California, Leonardo Wilhelm DiCaprio emerged as one of the most intellectually fierce and emotionally fearless actors in motion picture history. Rejecting the easy path of teen celebrity following his global breakout in James Cameron’s <em>Titanic</em> (1997), DiCaprio made an uncompromising vow: to work almost exclusively with the world’s supreme cinematic auteurs.
                  </p>
                  <p>
                    Over three decades, his filmography became a syllabus of masterworks—collaborating with Steven Spielberg (<em>Catch Me If You Can</em>), Christopher Nolan (<em>Inception</em>), Quentin Tarantino (<em>Django Unchained</em>, <em>Once Upon a Time in Hollywood</em>), Baz Luhrmann (<em>Romeo + Juliet</em>, <em>The Great Gatsby</em>), and Alejandro González Iñárritu (<em>The Revenant</em>).
                  </p>
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 mt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                      <Quote className="h-3.5 w-3.5" />
                      <span>Philosophy of the Craft:</span>
                    </div>
                    <p className="italic text-xs sm:text-sm text-zinc-100">
                      "If you are going to put yourself through the physical and emotional crucible of storytelling, leave everything on the screen. The audience knows when you are telling the truth."
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'scorsese' && (
                <div className="space-y-4 text-zinc-200 leading-relaxed text-sm sm:text-base font-light">
                  <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                    The Definitive Partnership with Martin Scorsese
                  </h3>
                  <p>
                    Beginning with <em>Gangs of New York</em> in 2002, DiCaprio entered a creative brotherhood with legendary director Martin Scorsese that critics routinely liken to Scorsese’s historic collaborations with Robert De Niro.
                  </p>
                  <p>
                    Together, their work spans six monumental films—including <em>The Aviator</em> (2004), <em>The Departed</em> (2006, which earned Scorsese his long-awaited Academy Award for Best Director), <em>Shutter Island</em> (2010), <em>The Wolf of Wall Street</em> (2013), and the widely lauded masterwork <em>Killers of the Flower Moon</em> (2023). Their partnership is founded on intense rehearsal, psychological fearlessness, and relentless fidelity to cinematic history.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-200 font-mono pt-2">
                    <Film className="h-4 w-4 text-amber-400" />
                    <span>6 Collaborations · 31 Oscar Nominations Across Films</span>
                  </div>
                </div>
              )}

              {activeTab === 'activism' && (
                <div className="space-y-4 text-zinc-200 leading-relaxed text-sm sm:text-base font-light">
                  <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                    Earth Alliance: Guarding the Living Biosphere
                  </h3>
                  <p>
                    In 1998, at the age of just 24, Leonardo founded the Leonardo DiCaprio Foundation, subsequently expanded into <strong>Earth Alliance</strong> alongside philanthropists Laurene Powell Jobs and Brian Sheth. Earth Alliance works tirelessly across climate change, indigenous sovereignty, biodiversity restoration, and ocean defense.
                  </p>
                  <p>
                    Having mobilized more than $100 Million in direct frontline grants across six continents, DiCaprio was appointed a <strong>United Nations Messenger of Peace</strong> with a special mandate on climate change. He produced landmark environmental documentaries including <em>Before the Flood</em>, <em>The 11th Hour</em>, and <em>Sea of Shadows</em>.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                      <Globe className="h-4 w-4" />
                      <span>United Nations Climate Envoy</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                      <HeartHandshake className="h-4 w-4" />
                      <span>Indigenous Land Defense</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
