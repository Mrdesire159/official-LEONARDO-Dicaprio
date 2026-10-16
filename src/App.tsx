/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import {
  LuxuryTheme,
  PageId,
  PhotoAsset,
  StoreItem,
  CartItem,
  OrderRecord,
  UserProfile,
  Testimonial
} from './types';
import {
  THEME_CONFIGS,
  USER_PHOTOS,
  DEFAULT_USER_PROFILE,
  INITIAL_PURCHASE_HISTORY,
  TESTIMONIALS
} from './data/diCaprioData';
import { ParticleBackground } from './components/ParticleBackground';
import { CursorGlow } from './components/CursorGlow';
import { CinematicScrollProgressBar } from './components/CinematicScrollProgressBar';
import { Navbar } from './components/Navbar';
import { HeroOrbital } from './components/HeroOrbital';
import { FilmReelTimeline } from './components/FilmReelTimeline';
import { OrbitingAwards } from './components/OrbitingAwards';
import { MeetAndGreetStore } from './components/MeetAndGreetStore';
import { PhotoGallery360 } from './components/PhotoGallery360';
import { BiographySection } from './components/BiographySection';
import { TestimonialsSocialProof } from './components/TestimonialsSocialProof';
import { OfficialChannelsPage } from './components/OfficialChannelsPage';
import { OfficialVerificationModal } from './components/OfficialVerificationModal';
import { CheckoutModal } from './components/CheckoutModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SocialMediaBallModal } from './components/SocialMediaBallModal';
import { FloatingSocialBallButton } from './components/FloatingSocialBallButton';
import { PageNavigationHeader } from './components/PageNavigationHeader';
import { FloatingBackButton } from './components/FloatingBackButton';
import { LiveChatAgent } from './components/LiveChatAgent';
import { AdminPortalModal } from './components/AdminPortalModal';
import { Footer } from './components/Footer';
import { ArrowRight, ArrowLeft, Home, Compass, ShieldAlert, Film, User, CreditCard, Image, Globe } from 'lucide-react';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<LuxuryTheme>('gold');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeBgPhoto, setActiveBgPhoto] = useState<PhotoAsset>(USER_PHOTOS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSocialBallOpen, setIsSocialBallOpen] = useState(false);
  const [isOwnerAdminOpen, setIsOwnerAdminOpen] = useState(false);
  const [ambientAudioPlaying, setAmbientAudioPlaying] = useState(false);

  // User requirement: "let the social media accouint be the first to pop up while opeing the site with a warning note saying this is one and only Leonardo DiCaprio social media and site report tany imposter to the telegram chanel"
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(true);

  // Multi-page navigation state
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '') as PageId;
      const validPages: PageId[] = [
        'home',
        'biography',
        'filmography',
        'vip-guild',
        'gallery',
        'verification',
        'testimonials',
      ];
      if (validPages.includes(hash)) {
        return hash;
      }
    }
    return 'home';
  });

  // Listen to hash changes in window URL
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        const hash = window.location.hash.replace('#', '') as PageId;
        const validPages: PageId[] = [
          'home',
          'biography',
          'filmography',
          'vip-guild',
          'gallery',
          'verification',
          'testimonials',
        ];
        if (validPages.includes(hash)) {
          setActivePage(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation history stack for back key and page return
  const [pageHistory, setPageHistory] = useState<PageId[]>(['home']);

  const handleSelectPage = (page: PageId) => {
    setPageHistory((prev) => (prev[prev.length - 1] === page ? prev : [...prev, page]));
    setActivePage(page);
    try {
      window.location.hash = page;
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const handleGoBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // remove current page
      const prevPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setActivePage(prevPage);
      try {
        window.location.hash = prevPage;
      } catch {
        // ignore
      }
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    } else {
      // Sequential fallback order
      const sequence: PageId[] = [
        'home',
        'biography',
        'filmography',
        'vip-guild',
        'gallery',
        'verification',
        'testimonials',
      ];
      const curIdx = sequence.indexOf(activePage);
      const prev = curIdx > 0 ? sequence[curIdx - 1] : 'home';
      setActivePage(prev);
      try {
        window.location.hash = prev;
      } catch {
        // ignore
      }
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  // Worldwide Testimonials state with local persistence
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem('ld_testimonials_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          return parsed;
        }
      }
      return TESTIMONIALS;
    } catch {
      return TESTIMONIALS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ld_testimonials_custom', JSON.stringify(testimonials));
    } catch {
      // ignore
    }
  }, [testimonials]);

  // User Profile & Purchase History State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ld_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_USER_PROFILE,
          ...parsed,
          name: parsed.name || '',
          email: parsed.email || '',
        };
      }
      return DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ld_orders_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((o: OrderRecord) => o.id !== 'ord-seed-01');
        }
      }
      return INITIAL_PURCHASE_HISTORY;
    } catch {
      return INITIAL_PURCHASE_HISTORY;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ld_orders_history', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('ld_user_profile', JSON.stringify(userProfile));
    } catch {
      // ignore
    }
  }, [userProfile]);

  const handleOrderPlaced = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== 'ord-seed-01')]);
    setUserProfile((prev) => ({
      ...prev,
      name: newOrder.attendeeName || prev.name,
      email: newOrder.attendeeEmail || prev.email,
      totalSpend: prev.totalSpend + newOrder.totalAmount,
      loyaltyPoints: prev.loyaltyPoints + Math.round(newOrder.totalAmount * 5),
    }));
  };

  // Audio synthesis reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setReducedMotion(true);
      }
    }
  }, []);

  // Web Audio Cinematic Drone Synthesizer
  const toggleAmbientAudio = () => {
    if (ambientAudioPlaying) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.4);
      }
      setAmbientAudioPlaying(false);
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 1.5);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, ctx.currentTime);
      filter.connect(masterGain);

      const freqs = [108, 162, 216, 324];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.connect(filter);
        osc.start();
      });

      setAmbientAudioPlaying(true);
    } catch {
      setAmbientAudioPlaying(false);
    }
  };

  // Cart operations
  const handleAddToCart = (item: StoreItem) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleInstantBuy = (item: StoreItem) => {
    handleAddToCart(item);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const nextQ = ci.quantity + delta;
            return nextQ > 0 ? { ...ci, quantity: nextQ } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Routing helper from internal buttons
  const handleNavigateSection = (sectionId: string) => {
    const map: Record<string, PageId> = {
      '#biography': 'biography',
      '#film-reel': 'filmography',
      '#awards': 'filmography',
      '#vip-store': 'vip-guild',
      '#gallery': 'gallery',
      '#testimonials': 'testimonials',
      '#official-channels': 'verification',
      '#multiverse': 'home',
    };
    const targetPage = map[sectionId];
    if (targetPage) {
      handleSelectPage(targetPage);
    } else {
      const el = document.querySelector(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }
  };

  const themeConfig = THEME_CONFIGS[currentTheme];

  return (
    <div
      className={`relative min-h-screen w-full bg-[#030305] text-slate-100 ${
        reducedMotion ? 'reduced-motion' : ''
      }`}
    >
      {/* Dynamic Ambient Background Layer using the User's Active Selected Photo */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-20 mix-blend-screen transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, ${themeConfig.accent}25 0%, transparent 70%), url(${activeBgPhoto.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'blur(30px) saturate(1.4) brightness(0.6)',
        }}
      />

      {/* Warm Golden-Yellow Ambient Aurora */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-35 mix-blend-screen transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(circle at 18% 22%, rgba(245, 158, 11, 0.14) 0%, transparent 55%),
            radial-gradient(circle at 82% 35%, rgba(234, 179, 8, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 75%, rgba(251, 191, 36, 0.10) 0%, transparent 60%),
            radial-gradient(circle at 70% 90%, rgba(217, 119, 6, 0.10) 0%, transparent 55%),
            radial-gradient(circle at 35% 60%, rgba(250, 204, 21, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle warm gold shimmer micro-mesh */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(rgba(245, 197, 24, 0.18) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_transparent_10%,_#030305_85%)]" />

      {/* Floating Canvas Particles */}
      <ParticleBackground theme={currentTheme} reducedMotion={reducedMotion} />

      {/* Trailing Cursor Glow */}
      <CursorGlow theme={currentTheme} reducedMotion={reducedMotion} />

      {/* Cinematic Golden Film Reel Scroll Progress Bar */}
      <CinematicScrollProgressBar activePage={activePage} />

      {/* Luxury Navigation Header with Multi-Page Tabs */}
      <Navbar
        currentTheme={currentTheme}
        activePage={activePage}
        onSelectPage={handleSelectPage}
        onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
        ambientAudioPlaying={ambientAudioPlaying}
        onToggleAmbientAudio={toggleAmbientAudio}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSocialBall={() => setIsSocialBallOpen(true)}
        onOpenConcierge={() => {
          window.dispatchEvent(new CustomEvent('open-live-chat'));
        }}
        onOpenAdmin={() => setIsOwnerAdminOpen(true)}
        orderCount={orders.length}
      />

      {/* PAGE ARCHITECTURE: Professional & Humanized Page-by-Page Router */}
      <main className="relative z-10 flex flex-col items-center w-full pt-20 sm:pt-24 lg:pt-28 pb-16 min-h-[75vh]">
        {/* Global Back Key & Page Switcher Header for Every Subpage */}
        <PageNavigationHeader
          activePage={activePage}
          onSelectPage={handleSelectPage}
          onGoBack={handleGoBack}
          currentTheme={currentTheme}
        />

        {/* PAGE 1: SANCTUARY OVERVIEW (HOME) */}
        {activePage === 'home' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            {/* Centerpiece Hero Showcase */}
            <HeroOrbital
              currentTheme={currentTheme}
              activeHeroPhoto={activeBgPhoto}
              onSelectPhotoModal={(photo) => setActiveBgPhoto(photo)}
              onNavigateSection={handleNavigateSection}
            />
          </div>
        )}

        {/* PAGE 2: BIOGRAPHY & HUMAN JOURNEY */}
        {activePage === 'biography' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <BiographySection currentTheme={currentTheme} />

            {/* Bottom Next-Chapter Navigator with Back and Mainpage Buttons */}
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-4 py-2.5 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => handleSelectPage('home')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <Home className="h-4 w-4 text-amber-400" />
                  <span>Main Sanctuary</span>
                </button>
              </div>
              <button
                onClick={() => handleSelectPage('filmography')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-cinzel font-bold uppercase tracking-wider text-white transition-all hover:scale-105 cursor-pointer ml-auto"
              >
                <span>Chapter II: 35mm Celluloid Vault & Honors</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* PAGE 3: FILMOGRAPHY & CELLULOID VAULT */}
        {activePage === 'filmography' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <FilmReelTimeline currentTheme={currentTheme} />
            <OrbitingAwards currentTheme={currentTheme} />

            {/* Bottom Next-Chapter Navigator with Back and Mainpage Buttons */}
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-4 py-2.5 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back (Biography)</span>
                </button>
                <button
                  onClick={() => handleSelectPage('home')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <Home className="h-4 w-4 text-amber-400" />
                  <span>Main Sanctuary</span>
                </button>
              </div>
              <button
                onClick={() => handleSelectPage('vip-guild')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-cinzel font-bold uppercase tracking-wider text-white transition-all hover:scale-105 cursor-pointer ml-auto"
              >
                <span>Chapter III: VIP Inner Circle Guild</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* PAGE 4: VIP GUILD & PHILANTHROPIC EXPERIENCES */}
        {activePage === 'vip-guild' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <MeetAndGreetStore
              currentTheme={currentTheme}
              onAddToCart={handleAddToCart}
              onInstantBuy={handleInstantBuy}
            />

            {/* Bottom Next-Chapter Navigator with Back and Mainpage Buttons */}
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-4 py-2.5 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back (Films)</span>
                </button>
                <button
                  onClick={() => handleSelectPage('home')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <Home className="h-4 w-4 text-amber-400" />
                  <span>Main Sanctuary</span>
                </button>
              </div>
              <button
                onClick={() => handleSelectPage('gallery')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-cinzel font-bold uppercase tracking-wider text-white transition-all hover:scale-105 cursor-pointer ml-auto"
              >
                <span>Chapter IV: Archival Portrait Salon</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* PAGE 5: ARCHIVAL PORTRAIT SALON */}
        {activePage === 'gallery' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <PhotoGallery360 currentTheme={currentTheme} />

            {/* Bottom Next-Chapter Navigator with Back and Mainpage Buttons */}
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-4 py-2.5 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back (VIP Guild)</span>
                </button>
                <button
                  onClick={() => handleSelectPage('home')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <Home className="h-4 w-4 text-amber-400" />
                  <span>Main Sanctuary</span>
                </button>
              </div>
              <button
                onClick={() => handleSelectPage('verification')}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-3 text-xs font-cinzel font-bold uppercase tracking-wider text-amber-300 transition-all hover:scale-105 cursor-pointer ml-auto"
              >
                <span>Official Verification & Imposter Registry</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* PAGE 6: OFFICIAL VERIFICATION & IMPOSTER WARNING */}
        {activePage === 'verification' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <OfficialChannelsPage
              currentTheme={currentTheme}
              onOpenReportModal={() => setIsVerificationModalOpen(true)}
            />

            {/* Bottom Next-Chapter Navigator with Back and Mainpage Buttons */}
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-4 py-2.5 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back (Portraits)</span>
                </button>
                <button
                  onClick={() => handleSelectPage('home')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <Home className="h-4 w-4 text-amber-400" />
                  <span>Main Sanctuary</span>
                </button>
              </div>
              <button
                onClick={() => handleSelectPage('testimonials')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-cinzel font-bold uppercase tracking-wider text-white transition-all hover:scale-105 cursor-pointer ml-auto"
              >
                <span>Chapter V: 50 Worldwide Testimonials</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* PAGE 7: 50 INSTITUTIONAL TESTIMONIALS */}
        {activePage === 'testimonials' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <TestimonialsSocialProof
              currentTheme={currentTheme}
              testimonials={testimonials}
              onOpenAdmin={() => setIsOwnerAdminOpen(true)}
            />

            {/* Bottom Next-Chapter Navigator with Back and Mainpage Buttons */}
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-black px-4 py-2.5 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back (Verification)</span>
                </button>
                <button
                  onClick={() => handleSelectPage('gallery')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <Image className="h-4 w-4 text-amber-400" />
                  <span>Portraits</span>
                </button>
              </div>
              <button
                onClick={() => handleSelectPage('home')}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/20 hover:bg-amber-400 hover:text-black px-5 py-3 text-xs font-cinzel font-bold uppercase tracking-wider text-amber-300 hover:text-black transition-all hover:scale-105 cursor-pointer ml-auto"
              >
                <Home className="h-4 w-4" />
                <span>Return to Main Sanctuary</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* USER REQUEST REQUIREMENT:
          "let the social media accouint be the first to pop up while opeing the site with a warning note saying this is one and only Leonardo DiCaprio social media and site report tany imposter to the telegram chanel" */}
      <OfficialVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        currentTheme={currentTheme}
      />

      {/* Secure Checkout & VIP Reservation Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        currentTheme={currentTheme}
        onOrderPlaced={handleOrderPlaced}
        onViewPurchaseHistory={() => setIsProfileOpen(true)}
        defaultAttendeeName={userProfile.name}
        defaultAttendeeEmail={userProfile.email}
      />

      {/* User Profile & Purchase History Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        orders={orders}
        currentTheme={currentTheme}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Site Owner Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isOwnerAdminOpen}
        onClose={() => setIsOwnerAdminOpen(false)}
        testimonials={testimonials}
        onUpdateTestimonials={setTestimonials}
        userProfile={userProfile}
        onUpdateUserProfile={setUserProfile}
        orders={orders}
        onUpdateOrders={setOrders}
        currentTheme={currentTheme}
      />

      {/* Luxury Footer with Specific Social Media Branding */}
      <Footer
        currentTheme={currentTheme}
        onOpenSocialBall={() => setIsSocialBallOpen(true)}
        onOpenAdmin={() => setIsOwnerAdminOpen(true)}
        onNavigatePage={handleSelectPage}
        onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
      />

      {/* Floating Back Key & Return to Main Button */}
      <FloatingBackButton
        activePage={activePage}
        onGoBack={handleGoBack}
        onSelectMainPage={() => handleSelectPage('home')}
      />

      {/* Floating 3D Social Media Ball Action Button */}
      <FloatingSocialBallButton
        onClick={() => setIsSocialBallOpen(true)}
        currentTheme={currentTheme}
      />

      {/* Live Chat VIP Host Agent (Claire Laurent - Beverly Hills & Cannes Desk) */}
      <LiveChatAgent
        currentTheme={currentTheme}
        onNavigateSection={handleNavigateSection}
        onOpenSocialBall={() => setIsSocialBallOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* 3D Celestial Social Media Ball Modal */}
      <SocialMediaBallModal
        isOpen={isSocialBallOpen}
        onClose={() => setIsSocialBallOpen(false)}
        currentTheme={currentTheme}
      />
    </div>
  );
}
