import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Award,
  ArrowLeft,
  CornerDownLeft,
  Play,
  Pause,
  Layers,
  ArrowUp
} from 'lucide-react';
import { LuxuryTheme, PhotoAsset } from '../types';
import { THEME_CONFIGS, USER_PHOTOS } from '../data/diCaprioData';

interface PhotoGallery360Props {
  currentTheme: LuxuryTheme;
  onSelectTheme?: (theme: LuxuryTheme) => void;
  reducedMotion?: boolean;
  activeBgPhoto?: PhotoAsset;
  onSelectBgPhoto?: (photo: PhotoAsset) => void;
}

export function PhotoGallery360({
  currentTheme,
  onSelectBgPhoto,
}: PhotoGallery360Props) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeModalPhoto, setActiveModalPhoto] = useState<PhotoAsset | null>(null);
  const [isAutoSlide, setIsAutoSlide] = useState(true); // Default to Auto Display Mode
  const [autoProgress, setAutoProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isSectionEntered, setIsSectionEntered] = useState(false);
  const [slideAnimationKey, setSlideAnimationKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  const themeConfig = THEME_CONFIGS[currentTheme];
  const activePhoto = USER_PHOTOS[selectedPhotoIndex] || USER_PHOTOS[0];

  // Observe section entry so all photos slide up when entered
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionEntered(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Slide up to next photo
  const handleSlideUpNext = useCallback(() => {
    setSelectedPhotoIndex((prev) => {
      const nextIndex = (prev + 1) % USER_PHOTOS.length;
      if (onSelectBgPhoto) onSelectBgPhoto(USER_PHOTOS[nextIndex]);
      return nextIndex;
    });
    setSlideAnimationKey((k) => k + 1);
    setAutoProgress(0);
  }, [onSelectBgPhoto]);

  // Slide down to previous photo
  const handleSlideDownPrev = useCallback(() => {
    setSelectedPhotoIndex((prev) => {
      const prevIndex = prev === 0 ? USER_PHOTOS.length - 1 : prev - 1;
      if (onSelectBgPhoto) onSelectBgPhoto(USER_PHOTOS[prevIndex]);
      return prevIndex;
    });
    setSlideAnimationKey((k) => k + 1);
    setAutoProgress(0);
  }, [onSelectBgPhoto]);

  // Select photo when entered / hovered or clicked
  const handleSelectPhoto = useCallback((index: number) => {
    if (index !== selectedPhotoIndex) {
      setSelectedPhotoIndex(index);
      setSlideAnimationKey((k) => k + 1);
      setAutoProgress(0);
      if (onSelectBgPhoto) onSelectBgPhoto(USER_PHOTOS[index]);
    }
  }, [selectedPhotoIndex, onSelectBgPhoto]);

  // Auto Display Mode loop: smoothly advances portraits every 4.2 seconds
  useEffect(() => {
    if (!isAutoSlide || isHovered) {
      return;
    }
    const slideDuration = 4200;
    const tickInterval = 50;
    const progressIncrement = (tickInterval / slideDuration) * 100;

    const interval = setInterval(() => {
      setAutoProgress((prev) => {
        if (prev >= 100) {
          handleSlideUpNext();
          return 0;
        }
        return prev + progressIncrement;
      });
    }, tickInterval);

    return () => clearInterval(interval);
  }, [isAutoSlide, isHovered, handleSlideUpNext]);

  // Reset auto progress whenever photo changes
  useEffect(() => {
    setAutoProgress(0);
  }, [selectedPhotoIndex]);

  // Scroll active thumbnail smoothly into view inside compact horizontal dock without triggering window vertical jumps
  const dockContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeThumbnailRef.current && dockContainerRef.current) {
      const container = dockContainerRef.current;
      const thumbnail = activeThumbnailRef.current;
      const targetScroll = thumbnail.offsetLeft - (container.clientWidth / 2) + (thumbnail.clientWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [selectedPhotoIndex]);

  // Modal navigation handlers
  const currentModalIndex = activeModalPhoto
    ? USER_PHOTOS.findIndex((p) => p.id === activeModalPhoto.id)
    : -1;

  const handlePrevModalPhoto = useCallback(() => {
    if (currentModalIndex > 0) {
      setActiveModalPhoto(USER_PHOTOS[currentModalIndex - 1]);
    } else {
      setActiveModalPhoto(USER_PHOTOS[USER_PHOTOS.length - 1]);
    }
  }, [currentModalIndex]);

  const handleNextModalPhoto = useCallback(() => {
    if (currentModalIndex >= 0 && currentModalIndex < USER_PHOTOS.length - 1) {
      setActiveModalPhoto(USER_PHOTOS[currentModalIndex + 1]);
    } else {
      setActiveModalPhoto(USER_PHOTOS[0]);
    }
  }, [currentModalIndex]);

  const handleGoBack = useCallback(() => {
    setActiveModalPhoto(null);
    if (window.history.state?.modal === 'portrait-photo-view') {
      window.history.back();
    }
  }, []);

  // Listen for open-photo-modal custom events
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<PhotoAsset>;
      if (customEvent.detail) {
        setActiveModalPhoto(customEvent.detail);
        const idx = USER_PHOTOS.findIndex((p) => p.id === customEvent.detail.id);
        if (idx !== -1) setSelectedPhotoIndex(idx);
      } else {
        setActiveModalPhoto(USER_PHOTOS[0]);
        setSelectedPhotoIndex(0);
      }
    };
    window.addEventListener('open-photo-modal', handleOpen);
    return () => window.removeEventListener('open-photo-modal', handleOpen);
  }, []);

  // Back navigation key support: Esc key, Backspace key, and Browser / Hardware Back navigation key
  useEffect(() => {
    if (!activeModalPhoto) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.history.pushState({ modal: 'portrait-photo-view', id: activeModalPhoto.id }, '');

    const handlePopState = () => {
      setActiveModalPhoto(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' ||
        (e.key === 'Backspace' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement))
      ) {
        e.preventDefault();
        handleGoBack();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrevModalPhoto();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNextModalPhoto();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModalPhoto, handleGoBack, handlePrevModalPhoto, handleNextModalPhoto]);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black/85"
    >
      {/* Background ambient radiance */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full blur-[140px] opacity-25"
        style={{ backgroundColor: themeConfig.accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-[140px] opacity-20"
        style={{ backgroundColor: themeConfig.accent }}
      />

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/10 pb-6">
          <div>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              Archival <span className={`bg-gradient-to-r ${themeConfig.gradientText} bg-clip-text text-transparent`}>Portrait Gallery</span>
            </h2>
          </div>

          {/* Quick controls: Back to Top, Auto-Slide and Slide Up navigation */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Back key */}
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.hash = 'home';
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/60 hover:bg-amber-400 hover:text-black px-4 py-2 text-xs font-bold text-amber-300 transition-all shadow-md active:scale-95 group cursor-pointer"
              title="Return back to previous page"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setIsAutoSlide(!isAutoSlide)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                isAutoSlide
                  ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-lg shadow-amber-500/20'
                  : 'border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Automatically slide up each portrait"
            >
              {isAutoSlide ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Slide Reel</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Auto Slide-Up Loop</span>
                </>
              )}
            </button>

            <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
              <button
                onClick={handleSlideDownPrev}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/15 hover:text-white transition-colors"
                title="Slide Previous Portrait"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="font-mono text-xs px-2 font-bold text-amber-300">
                {String(selectedPhotoIndex + 1).padStart(2, '0')} / {String(USER_PHOTOS.length).padStart(2, '0')}
              </span>
              <button
                onClick={handleSlideUpNext}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/15 hover:text-white transition-colors"
                title="Slide Up Next Portrait"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            JOINED ARCHIVAL SALON CONSOLE (ALL REMAIN IN ONE PLACE)
           ========================================================================= */}
        <div
          className="relative rounded-3xl border border-white/20 bg-zinc-950/90 shadow-2xl backdrop-blur-2xl p-4 sm:p-6 lg:p-8"
        >
          {/* Top Bar inside console with live Auto Display Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 ${isAutoSlide ? 'opacity-75' : 'opacity-0'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isAutoSlide ? 'bg-amber-400' : 'bg-zinc-500'}`} />
              </span>

              <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                {isAutoSlide ? 'Auto Display Active' : 'Auto Display Paused'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {/* Progress counter */}
              <span className="font-mono text-zinc-400 hidden sm:inline">
                Portrait <span className="text-amber-300 font-bold">{String(selectedPhotoIndex + 1).padStart(2, '0')}</span> of {String(USER_PHOTOS.length).padStart(2, '0')}
              </span>
              <button
                onClick={() => setIsAutoSlide(!isAutoSlide)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                  isAutoSlide
                    ? 'border-amber-400/60 bg-amber-400/20 text-amber-300'
                    : 'border-white/20 bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {isAutoSlide ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Pause Loop</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Resume Auto Loop</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* UNIFIED CENTERPIECE STAGE (ALL PHOTOS REMAIN IN ONE PLACE IN AUTO DISPLAY MODE) */}
          <div className="max-w-4xl mx-auto w-full flex flex-col justify-between rounded-2xl border border-white/15 bg-black/70 p-4 sm:p-7 overflow-hidden relative shadow-2xl">
            {/* Auto Display Mode countdown progress bar */}
            {isAutoSlide && (
              <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-200 transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  style={{ width: `${autoProgress}%` }}
                />
              </div>
            )}

            {/* Main Cinematic Portrait Viewport with Smooth Slide-Up Transition */}
            <div
              key={slideAnimationKey}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-full h-80 sm:h-[460px] md:h-[520px] rounded-2xl overflow-hidden border border-amber-400/35 bg-zinc-950 group cursor-pointer shadow-2xl animate-slide-up"
              onClick={() => setActiveModalPhoto(activePhoto)}
            >
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = activePhoto.fallbackUrl;
                }}
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />

              {/* Holographic light reflection */}
              <div className="pointer-events-none absolute inset-0 hologram-shimmer opacity-30" />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl border border-white/20 bg-black/85 px-3 py-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider backdrop-blur-md shadow-lg">
                    {activePhoto.badgeText}
                  </div>
                  {isAutoSlide && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider backdrop-blur-md hidden sm:flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Auto Display</span>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-white/20 bg-black/85 px-3 py-1.5 text-xs font-mono font-bold text-white backdrop-blur-md shadow-lg">
                  {activePhoto.year}
                </div>
              </div>

              {/* Hover Slide-Up Inspection Prompt */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-amber-300">Click to Inspect in High-Res</p>
                    <p className="text-sm font-cinzel font-bold text-white">{activePhoto.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/60 bg-amber-400/20 px-3.5 py-2 text-xs font-bold text-amber-200 backdrop-blur-md shadow-lg">
                    <Maximize2 className="h-4 w-4" />
                    <span>Inspect Fullscreen</span>
                  </div>
                </div>
              </div>

              {/* Floating Slide Up Quick Buttons */}
              <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideDownPrev();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-black/80 hover:bg-amber-500 hover:text-black text-white backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
                  title="Slide Previous Portrait"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideUpNext();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/60 bg-amber-500/80 hover:bg-amber-400 text-black backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
                  title="Slide Up Next Portrait"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Active Portrait Curatorial Information Bar */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
                  <Award className="h-3.5 w-3.5" />
                  <span className="font-mono">{activePhoto.filmOrEvent}</span>
                </div>
                <h3 className="font-cinzel text-xl sm:text-2xl font-black text-white truncate">
                  {activePhoto.title}
                </h3>
                <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                  {activePhoto.description}
                </p>
              </div>

              {/* Direct Action Buttons with Back button */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveModalPhoto(activePhoto)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/60 bg-amber-400/20 hover:bg-amber-400 hover:text-black px-4 py-2.5 text-xs font-bold text-amber-300 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Inspect Portrait</span>
                </button>

                <button
                  onClick={handleSlideDownPrev}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all active:scale-95 cursor-pointer"
                  title="Back to Previous Portrait"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-amber-400" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleSlideUpNext}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all active:scale-95 cursor-pointer"
                  title="Slide Up Next Portrait"
                >
                  <ArrowUp className="h-3.5 w-3.5 text-amber-400" />
                  <span>Next</span>
                </button>
              </div>
            </div>

            {/* COMPACT HORIZONTAL THUMBNAIL DOCK (Replaces the long vertical archive display) */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider">
                  All {USER_PHOTOS.length} Portraits Cycling In Sequence
                </span>
                <span className="text-zinc-500 text-[11px]">
                  Click any portrait to jump directly
                </span>
              </div>

              <div ref={dockContainerRef} className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 pt-1 select-none custom-scrollbar">
                {USER_PHOTOS.map((photo, index) => {
                  const isActive = index === selectedPhotoIndex;
                  return (
                    <button
                      key={photo.id}
                      ref={isActive ? activeThumbnailRef : null}
                      onClick={() => handleSelectPhoto(index)}
                      className={`group relative shrink-0 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'border-2 border-amber-400 shadow-lg shadow-amber-500/25 scale-105 ring-2 ring-amber-400/40'
                          : 'border border-white/15 opacity-60 hover:opacity-100 hover:border-amber-400/60'
                      }`}
                      style={{ width: '64px', height: '64px' }}
                      title={`${photo.title} (${photo.year})`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = photo.fallbackUrl;
                        }}
                        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-amber-400/20 pointer-events-none" />
                      )}
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-black/85 px-1 py-0.2 text-[8px] font-mono text-amber-300 font-bold">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Synchronized Slider Navigation Bar */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center sm:justify-start gap-4">
            {/* Dots / Jump pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {USER_PHOTOS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPhoto(idx)}
                  className={`h-2 transition-all rounded-full ${
                    idx === selectedPhotoIndex
                      ? 'w-7 bg-amber-400 shadow-md shadow-amber-400/50'
                      : 'w-2 bg-white/20 hover:bg-white/50'
                  }`}
                  title={`Jump to Portrait ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN INSPECTION MODAL (WITH PROMINENT BACK BUTTONS) */}
      {activeModalPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleGoBack();
          }}
        >
          {/* 1. FLOATING VIEWPORT CORNER BACK BUTTON (ALWAYS VISIBLE & PROMINENT) */}
          <button
            onClick={handleGoBack}
            className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[60] flex items-center gap-2 rounded-full border-2 border-amber-400 bg-black/95 hover:bg-amber-400 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-amber-300 hover:text-black shadow-2xl backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer"
            aria-label="Back to gallery after viewing portrait"
            title="Back to gallery after viewing portrait (or press Esc / Backspace)"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
            <span className="tracking-wider uppercase font-cinzel font-black">Back</span>
            <span className="hidden md:inline-flex items-center gap-1 rounded bg-zinc-800/90 group-hover:bg-black/20 px-2 py-0.5 text-[10px] font-mono border border-amber-400/30 text-amber-200 group-hover:text-black">
              Esc / ←
            </span>
          </button>

          <div
            className="relative w-full max-w-4xl rounded-3xl border border-white/20 bg-zinc-950 p-5 sm:p-8 shadow-2xl overflow-hidden mt-10 sm:mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient gold glow */}
            <div
              className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-[100px] opacity-20"
              style={{ backgroundColor: themeConfig.accent }}
            />

            {/* TOP NAVIGATION BAR WITH DEDICATED BACK BUTTON */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              {/* Primary Back Button */}
              <button
                onClick={handleGoBack}
                className="group flex items-center gap-2.5 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-transparent hover:bg-amber-400 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:text-black transition-all shadow-xl active:scale-95 cursor-pointer"
                title="Back to gallery after viewing portrait (Esc or Backspace key)"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1.5" />
                <span className="tracking-wide uppercase font-cinzel font-black">Back to Gallery</span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-black/70 group-hover:bg-black/20 px-2 py-0.5 text-[10px] font-mono border border-amber-400/30 text-amber-200 group-hover:text-black">
                  <CornerDownLeft className="h-2.5 w-2.5" /> ESC
                </span>
              </button>

              <div className="flex items-center gap-2">
                {/* Counter Badge */}
                <span className="hidden sm:inline-block rounded-xl bg-white/5 border border-white/10 px-3 py-1 font-mono text-xs text-zinc-400">
                  {currentModalIndex + 1} of {USER_PHOTOS.length} Portraits
                </span>

                {/* Prev / Next Header Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevModalPhoto}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                    title="Previous Portrait (Left / Up Arrow)"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextModalPhoto}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                    title="Next Portrait (Right / Down Arrow)"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Close X Key */}
                <button
                  onClick={handleGoBack}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                  title="Close & Return (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Title & Event */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  Archival Portrait · {activeModalPhoto.year}
                </span>
                <h3 className="font-cinzel text-xl sm:text-2xl font-black text-white mt-0.5">
                  {activeModalPhoto.title}
                </h3>
                <p className="text-xs text-zinc-400">{activeModalPhoto.filmOrEvent}</p>
              </div>
            </div>

            {/* Photo Canvas Area with Floating In-Canvas Back Key */}
            <div
              className="relative h-96 sm:h-[430px] w-full rounded-2xl overflow-hidden border border-white/15 bg-black flex items-center justify-center select-none shadow-2xl"
            >
              {/* Floating In-Canvas Back Navigation Key */}
              <button
                onClick={handleGoBack}
                className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-xl border border-amber-400/60 bg-black/85 hover:bg-amber-400 hover:text-black px-3.5 py-1.5 text-xs font-bold text-amber-300 transition-all shadow-md active:scale-95 group cursor-pointer"
                title="Go Back to Gallery (Esc)"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Back</span>
              </button>

              <div
                className="relative h-80 sm:h-[390px] w-64 sm:w-80 rounded-2xl overflow-hidden shadow-2xl border border-amber-400/50"
              >
                <img
                  src={activeModalPhoto.url}
                  alt={activeModalPhoto.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = activeModalPhoto.fallbackUrl;
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 hologram-shimmer opacity-35" />
              </div>
            </div>

            {/* Controls Bar with Back Navigation Button */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                {activeModalPhoto.description}
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handlePrevModalPhoto}
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextModalPhoto}
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  Next
                </button>

                {/* Bottom Back Button */}
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-500/25 hover:bg-amber-400 hover:text-black px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-300 transition-all shadow-md active:scale-95 cursor-pointer font-cinzel"
                  title="Back to gallery after viewing portrait (Esc / Back key)"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Gallery</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
