import { useState, useEffect } from 'react';
import {
  Award,
  Globe,
  Star,
  CheckCircle2,
  ShieldCheck,
  Quote,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Maximize2,
  Users,
  Compass,
  Play,
  Pause,
  MapPin,
  Shield,
  KeyRound,
  List,
  Search
} from 'lucide-react';
import { LuxuryTheme, Testimonial } from '../types';
import { THEME_CONFIGS, TESTIMONIALS as FALLBACK_TESTIMONIALS, SOCIAL_PROOF_BADGES } from '../data/diCaprioData';

interface TestimonialsSocialProofProps {
  currentTheme: LuxuryTheme;
  testimonials?: Testimonial[];
  onOpenAdmin?: () => void;
}

type CategoryFilter = 'all' | 'directors' | 'costars' | 'conservation' | 'patrons';
type ViewMode = 'spotlight' | 'grid' | 'list';

export function TestimonialsSocialProof({
  currentTheme,
  testimonials = FALLBACK_TESTIMONIALS,
  onOpenAdmin,
}: TestimonialsSocialProofProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('spotlight');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [listSearchQuery, setListSearchQuery] = useState('');

  const themeConfig = THEME_CONFIGS[currentTheme];
  const allTestimonials = testimonials && testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;

  const filteredTestimonials: Testimonial[] = allTestimonials.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  // Ensure active index is within bounds of filtered items
  const currentIndex = Math.min(activeTestimonialIdx, Math.max(0, filteredTestimonials.length - 1));
  const activeTestimonial = filteredTestimonials[currentIndex] || allTestimonials[0];

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying || filteredTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonialIdx((prev) => (prev + 1) % filteredTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredTestimonials.length]);

  const handlePrev = () => {
    setActiveTestimonialIdx((prev) => (prev === 0 ? filteredTestimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const uniqueCountriesCount = new Set(
    allTestimonials
      .map((t) => (t.location ? t.location.split(',')[1]?.trim() || t.location : 'Global'))
      .filter(Boolean)
  ).size;

  const categories = [
    { id: 'all', label: 'All Worldwide', count: allTestimonials.length },
    { id: 'directors', label: 'Directors', count: allTestimonials.filter((t) => t.category === 'directors').length },
    { id: 'costars', label: 'Co-Stars', count: allTestimonials.filter((t) => t.category === 'costars').length },
    { id: 'conservation', label: 'Conservation', count: allTestimonials.filter((t) => t.category === 'conservation').length },
    { id: 'patrons', label: 'VIP Patrons', count: allTestimonials.filter((t) => t.category === 'patrons').length },
  ];

  return (
    <section id="testimonials" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black/85">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute top-1/4 -right-40 h-[600px] w-[600px] rounded-full blur-[180px] opacity-15"
        style={{ backgroundColor: themeConfig.accent }}
      />
      <div
        className="pointer-events-none absolute bottom-10 -left-40 h-[500px] w-[500px] rounded-full blur-[180px] opacity-10"
        style={{ backgroundColor: themeConfig.accent }}
      />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* SOCIAL PROOF BADGES ROW */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: themeConfig.accent }}>
            <ShieldCheck className="h-4 w-4" />
            <span>Integrity, Provenance & Verified Prestige</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Worldwide Acclaim & <span className={`bg-gradient-to-r ${themeConfig.gradientText} bg-clip-text text-transparent`}>Testimonials</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
            From Oscar-winning directors, screen co-stars, and world leaders to indigenous conservationists and verified VIP patrons across over {uniqueCountriesCount} countries — authentic perspectives on Leonardo DiCaprio’s cinematic titan status and planetary defense.
          </p>

          {/* Aggregate trust stats bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl">
            <div className="text-center">
              <span className="font-cinzel text-2xl font-black text-white block">
                {allTestimonials.length}
              </span>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">Worldwide Voices</span>
            </div>
            <div className="text-center">
              <span className="font-cinzel text-2xl font-black text-amber-300 block">
                {uniqueCountriesCount} Nations
              </span>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">Global Coverage</span>
            </div>
            <div className="text-center">
              <span className="font-cinzel text-2xl font-black text-white block">5.0 / 5.0</span>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">Provenance Score</span>
            </div>
            <div className="text-center">
              <span className="font-cinzel text-2xl font-black text-emerald-400 block">100%</span>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">Verified Credentials</span>
            </div>
          </div>

          {/* Dedicated Call to Action Button to Open List of 50 Testimonials */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setViewMode('list');
                const el = document.getElementById('testimonials-list-directory');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center gap-2.5 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-600/20 px-6 py-2.5 text-xs sm:text-sm font-bold text-amber-200 shadow-xl hover:border-amber-400 hover:bg-amber-400/30 hover:text-white transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <List className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Browse Full List of 50 Testimonials</span>
              <span className="rounded-full bg-amber-400/30 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-200 border border-amber-400/40">
                50 Worldwide
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 4 Official Institutional Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {SOCIAL_PROOF_BADGES.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-white/15 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-amber-400/40 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    {b.issuer}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 group-hover:scale-110 transition-transform">
                    <Award className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="font-cinzel text-base font-bold text-white mb-1">
                  {b.title}
                </h3>
                <span className="text-xs text-amber-200/90 font-medium block mb-3">
                  {b.year}
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  {b.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Historical Distinction</span>
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORY FILTER & VIEW CONTROLS BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
          {/* Category tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as CategoryFilter);
                  setActiveTestimonialIdx(0);
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  activeCategory === cat.id
                    ? 'bg-white text-black shadow-lg font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* View Mode & Autoplay controls + Admin Portal Button */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                title="Site Owner Admin"
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1 text-[11px] font-mono text-zinc-500 hover:text-amber-300 hover:border-amber-400/30 transition-all opacity-40 hover:opacity-100"
                aria-label="Site Owner Admin"
              >
                <KeyRound className="h-3 w-3" />
                <span>adm</span>
              </button>
            )}

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              title={isAutoPlaying ? 'Pause Auto-Play' : 'Start Auto-Play Carousel'}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                isAutoPlaying
                  ? 'border-amber-400/50 bg-amber-400/15 text-amber-200'
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              {isAutoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isAutoPlaying ? 'Playing' : 'Autoplay'}</span>
            </button>

            <div className="flex items-center rounded-xl border border-white/15 bg-black/60 p-1">
              <button
                onClick={() => setViewMode('spotlight')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'spotlight' ? 'bg-white text-black font-bold shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Maximize2 className="h-3 w-3" />
                <span>Spotlight</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-black font-bold shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3 w-3" />
                <span>Grid Wall</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md'
                    : 'text-amber-300 hover:text-white hover:bg-white/5'
                }`}
                title="View full list of 50 testimonials"
              >
                <List className="h-3.5 w-3.5" />
                <span>List of 50 ({allTestimonials.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW MODE 1: SPOTLIGHT HERO CAROUSEL */}
        {viewMode === 'spotlight' && (
          <div className="rounded-3xl border border-white/15 bg-zinc-950/90 p-6 sm:p-12 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            <div
              className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[100px] opacity-20"
              style={{ backgroundColor: themeConfig.accent }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Main Quote Block */}
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                    <span className="ml-2 text-xs font-bold text-zinc-300">5.0 / 5.0 Provenance Rating</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTestimonial.location && (
                      <span className="flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30">
                        <MapPin className="h-3 w-3" />
                        {activeTestimonial.location}
                      </span>
                    )}
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-white/10 text-zinc-300 border border-white/10">
                      #{currentIndex + 1} of {filteredTestimonials.length}
                    </span>
                  </div>
                </div>

                <Quote className="h-10 w-10 text-amber-400/30 mb-3" />
                <p className="font-cinzel text-lg sm:text-2xl text-white font-light italic leading-relaxed min-h-[90px]">
                  "{activeTestimonial.quote}"
                </p>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-amber-400/60 bg-zinc-900 shrink-0 shadow-lg">
                      <img
                        src={activeTestimonial.avatar}
                        alt={activeTestimonial.author}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-white text-base sm:text-lg">{activeTestimonial.author}</h4>
                        {activeTestimonial.location && (
                          <span className="text-xs text-amber-300/80 font-mono">
                            · {activeTestimonial.location}
                          </span>
                        )}
                        {activeTestimonial.verified && (
                          <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-amber-300/90">{activeTestimonial.role}</p>
                      <p className="text-[11px] text-zinc-400">{activeTestimonial.context}</p>
                    </div>
                  </div>

                  {/* Carousel navigation buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePrev}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white transition-all active:scale-95"
                      aria-label="Previous Testimonial"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white transition-all active:scale-95"
                      aria-label="Next Testimonial"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Selector List & Carousel Quick Switcher */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between max-h-[460px]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-bold tracking-widest text-zinc-400">
                      Worldwide Directory:
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {filteredTestimonials.length} perspectives
                    </span>
                  </div>

                  <div className="space-y-1.5 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {filteredTestimonials.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTestimonialIdx(idx)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                          currentIndex === idx
                            ? 'bg-gradient-to-r from-amber-400/20 to-transparent border border-amber-400/40 text-white font-semibold'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={t.avatar}
                            alt={t.author}
                            className="h-6 w-6 rounded-full object-cover shrink-0 border border-white/20"
                          />
                          <div className="min-w-0">
                            <span className="text-xs truncate block">{t.author}</span>
                            {t.location && (
                              <span className="text-[10px] text-amber-300/80 font-mono truncate block">
                                {t.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Perspective {currentIndex + 1} of {filteredTestimonials.length}</span>
                  <span>{allTestimonials.length} Total Worldwide</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: MASONRY / COMPLETE GRID SHOWCASE */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => {
                  setActiveTestimonialIdx(idx);
                  setViewMode('spotlight');
                }}
                className="group relative rounded-3xl border border-white/15 bg-zinc-950/80 p-6 sm:p-7 shadow-xl backdrop-blur-2xl flex flex-col justify-between hover:border-amber-400/50 hover:bg-zinc-900/90 transition-all cursor-pointer hover:-translate-y-1"
              >
                <div>
                  {/* Top Rating, Location & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {t.location && (
                        <span className="flex items-center gap-0.5 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-400/20">
                          <MapPin className="h-2.5 w-2.5" />
                          {t.location}
                        </span>
                      )}
                      {t.verified && (
                        <span className="flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <Quote className="h-6 w-6 text-amber-400/30 mb-2 group-hover:text-amber-400/60 transition-colors" />
                  <p className="font-cinzel text-sm sm:text-base text-zinc-200 font-light italic leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author footer */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full overflow-hidden border border-amber-400/40 bg-zinc-900 shrink-0">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate group-hover:text-amber-300 transition-colors">
                      {t.author}
                    </h4>
                    <p className="text-[11px] text-amber-200/80 truncate">{t.role}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{t.context}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW MODE 3: COMPLETE DIRECTORY LIST OF 50 TESTIMONIALS */}
        {viewMode === 'list' && (
          <div id="testimonials-list-directory" className="space-y-6">
            {/* List Header & Search Bar */}
            <div className="rounded-3xl border border-amber-400/30 bg-zinc-950/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 shrink-0">
                    <List className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                      Worldwide Directory · <span className="text-amber-300">50 Testimonials List</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-light mt-0.5">
                      Verified perspectives from acclaimed directors, iconic co-stars, environmental leaders, and global patrons across the globe.
                    </p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[280px] sm:min-w-[340px]">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={listSearchQuery}
                    onChange={(e) => setListSearchQuery(e.target.value)}
                    placeholder="Search 50 testimonials by author, country, role..."
                    className="w-full rounded-xl border border-white/15 bg-zinc-900/90 pl-10 pr-14 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                  {listSearchQuery && (
                    <button
                      onClick={() => setListSearchQuery('')}
                      className="absolute right-3 top-2.5 text-[11px] font-semibold text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-300 font-bold">
                    Showing {allTestimonials.filter((t) => {
                      const matchesCat = activeCategory === 'all' || t.category === activeCategory;
                      if (!listSearchQuery.trim()) return matchesCat;
                      const q = listSearchQuery.toLowerCase().trim();
                      return (
                        matchesCat &&
                        (t.author.toLowerCase().includes(q) ||
                          t.role.toLowerCase().includes(q) ||
                          (t.location && t.location.toLowerCase().includes(q)) ||
                          (t.context && t.context.toLowerCase().includes(q)) ||
                          t.quote.toLowerCase().includes(q))
                      );
                    }).length} of {allTestimonials.length} Worldwide Perspectives
                  </span>
                  {activeCategory !== 'all' && (
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-zinc-300">
                      Category: {categories.find((c) => c.id === activeCategory)?.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Verified Provenance
                  </span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> 5.0 Star Prestige Rating
                  </span>
                </div>
              </div>
            </div>

            {/* List Rows */}
            <div className="space-y-3.5">
              {allTestimonials
                .filter((t) => {
                  const matchesCat = activeCategory === 'all' || t.category === activeCategory;
                  if (!listSearchQuery.trim()) return matchesCat;
                  const q = listSearchQuery.toLowerCase().trim();
                  return (
                    matchesCat &&
                    (t.author.toLowerCase().includes(q) ||
                      t.role.toLowerCase().includes(q) ||
                      (t.location && t.location.toLowerCase().includes(q)) ||
                      (t.context && t.context.toLowerCase().includes(q)) ||
                      t.quote.toLowerCase().includes(q))
                  );
                })
                .map((t, idx) => {
                  const origIdx = allTestimonials.findIndex((orig) => orig.id === t.id);
                  const displayIndex = origIdx !== -1 ? origIdx + 1 : idx + 1;
                  const formattedIdx = String(displayIndex).padStart(2, '0');

                  return (
                    <div
                      key={t.id}
                      className="group relative rounded-2xl border border-white/10 bg-zinc-950/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl hover:border-amber-400/40 hover:bg-zinc-900/90 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        {/* Profile Details & Index */}
                        <div className="flex items-start gap-4 min-w-[280px] lg:max-w-[340px] shrink-0">
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-md">
                              #{formattedIdx}
                            </span>
                            <div className="h-12 w-12 rounded-full overflow-hidden border border-amber-400/40 bg-zinc-900 shrink-0 shadow-md">
                              <img
                                src={t.avatar}
                                alt={t.author}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-cinzel text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                {t.author}
                              </h4>
                              {t.verified && (
                                <span className="flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-amber-300/90 mt-0.5">{t.role}</p>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {t.location && (
                                <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-white/10">
                                  <MapPin className="h-2.5 w-2.5 text-amber-400" />
                                  {t.location}
                                </span>
                              )}
                              <span className="rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300 uppercase tracking-wide border border-amber-400/20">
                                {t.category || 'patrons'}
                              </span>
                            </div>

                            {t.context && (
                              <p className="text-[11px] text-zinc-400 mt-2 font-light">
                                Context: <span className="text-zinc-300">{t.context}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Middle: Full Quote */}
                        <div className="flex-1 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
                          <div className="flex items-center gap-1 text-amber-400 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                            ))}
                            <span className="text-[11px] font-bold text-zinc-400 ml-1.5">5.0 Authenticity Score</span>
                          </div>
                          <Quote className="h-5 w-5 text-amber-400/30 mb-1" />
                          <p className="font-cinzel text-sm sm:text-base text-zinc-200 font-light italic leading-relaxed">
                            "{t.quote}"
                          </p>
                        </div>

                        {/* Right: Quick Spotlight Action */}
                        <div className="shrink-0 self-end lg:self-center">
                          <button
                            onClick={() => {
                              const foundIdx = filteredTestimonials.findIndex((item) => item.id === t.id);
                              if (foundIdx !== -1) {
                                setActiveTestimonialIdx(foundIdx);
                              }
                              setViewMode('spotlight');
                              const el = document.getElementById('testimonials');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-amber-400 hover:bg-amber-400/10 hover:text-amber-300 transition-all shadow-md active:scale-95 cursor-pointer"
                            title="Spotlight this testimonial"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                            <span>Spotlight</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
