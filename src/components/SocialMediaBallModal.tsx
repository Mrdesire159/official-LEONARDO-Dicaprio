import { useState, useEffect, useRef } from 'react';
import {
  Globe,
  X,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  RotateCw,
  Compass,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Radio,
  ShieldAlert
} from 'lucide-react';
import { LuxuryTheme } from '../types';
import { THEME_CONFIGS, SOCIAL_MEDIA_HANDLES } from '../data/diCaprioData';

interface SocialMediaBallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: LuxuryTheme;
}

type HandleKey = 'telegram' | 'x' | 'instagram' | 'facebook';

export function SocialMediaBallModal({
  isOpen,
  onClose,
  currentTheme,
}: SocialMediaBallModalProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  // 3D Ball Rotation State
  const [rotationX, setRotationX] = useState<number>(-12);
  const [rotationY, setRotationY] = useState<number>(35);
  const [isAutoOrbiting, setIsAutoOrbiting] = useState<boolean>(true);
  const [hoveredHandle, setHoveredHandle] = useState<HandleKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: -12,
    rotY: 35,
  });

  // Auto-orbit animation loop
  useEffect(() => {
    if (!isOpen || !isAutoOrbiting || isDragging) return;

    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.65) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, [isOpen, isAutoOrbiting, isDragging]);

  // Handle Drag / Touch rotation of the Ball
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotationX,
      rotY: rotationY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setRotationY(dragStartRef.current.rotY + deltaX * 0.5);
    setRotationX(Math.max(-60, Math.min(60, dragStartRef.current.rotX - deltaY * 0.4)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      rotX: rotationX,
      rotY: rotationY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;
    setRotationY(dragStartRef.current.rotY + deltaX * 0.6);
    setRotationX(Math.max(-60, Math.min(60, dragStartRef.current.rotX - deltaY * 0.5)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Smoothly rotate the ball to focus directly on a handle
  // Smoothly rotate the ball to focus directly on a handle
  const focusHandle = (handleKey: HandleKey) => {
    setHoveredHandle(handleKey);
    setIsAutoOrbiting(false);
    if (handleKey === 'telegram') {
      setRotationY(0);
      setRotationX(-10);
    } else if (handleKey === 'x') {
      setRotationY(-90);
      setRotationX(-10);
    } else if (handleKey === 'instagram') {
      setRotationY(-180);
      setRotationX(-10);
    } else if (handleKey === 'facebook') {
      setRotationY(-270);
      setRotationX(-10);
    }
  };

  const handleCopyHandle = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  // Complete data for all official handles with Telegram featured as #1
  const handlesConfig: Record<
    HandleKey,
    {
      angle: number;
      name: string;
      handle: string;
      platform: string;
      followers: string;
      verified: string;
      url: string;
      color: string;
      accentBg: string;
      borderGlow: string;
      description: string;
      iconType: 'telegram' | 'x' | 'ig' | 'facebook';
      highlights: string[];
      isNumberOne?: boolean;
    }
  > = {
    telegram: {
      angle: 0,
      name: 'Telegram Broadcast',
      handle: '@leonardodicap1974',
      platform: 'Telegram',
      followers: 'Verified Direct Broadcast',
      verified: '#1 Official Priority Broadcast',
      url: SOCIAL_MEDIA_HANDLES.telegram.url,
      color: '#229ED9',
      accentBg: 'from-[#0088cc]/25 via-[#229ED9]/20 to-[#54c4f8]/10',
      borderGlow: 'rgba(34, 158, 217, 0.8)',
      description:
        'Leonardo\'s primary, #1 direct communication channel for urgent climate emergency alerts, personal direct contact, and exclusive cinema chronicles.',
      iconType: 'telegram',
      isNumberOne: true,
      highlights: ['#1 Official Priority Channel', 'Direct Urgent Climate Action', 'Exclusive Production Chronicles'],
    },
    x: {
      angle: 90,
      name: 'X (Twitter) Official',
      handle: '@LeoDiCaprio',
      platform: 'X (Twitter)',
      followers: '19.0M+ Followers',
      verified: 'Official Verified Account',
      url: SOCIAL_MEDIA_HANDLES.x.url,
      color: '#FFFFFF',
      accentBg: 'from-white/20 via-zinc-500/15 to-black/80',
      borderGlow: 'rgba(255, 255, 255, 0.7)',
      description:
        'Official global voice for urgent ecological alerts, United Nations climate announcements, and major Hollywood cinema releases.',
      iconType: 'x',
      highlights: ['19M+ Global Followers', 'UN Messenger of Peace Updates', 'Major Motion Picture Releases'],
    },
    instagram: {
      angle: 180,
      name: 'Instagram Verified',
      handle: '@leonardodicaprio',
      platform: 'Instagram',
      followers: '62.1M+ Followers',
      verified: 'Meta Verified · Public Figure',
      url: SOCIAL_MEDIA_HANDLES.instagram.url,
      color: '#E4405F',
      accentBg: 'from-[#833AB4]/20 via-[#FD1D1D]/15 to-[#F77737]/10',
      borderGlow: 'rgba(228, 64, 95, 0.6)',
      description:
        'The primary official portal for planetary environmental initiatives, wildlife protection, and cinema project announcements.',
      iconType: 'ig',
      highlights: ['Amazon Rainforest Conservation', 'Global Wildlife Protection', 'Behind-the-Scenes Film Drops'],
    },
    facebook: {
      angle: 270,
      name: 'Facebook Official',
      handle: '@LeonardoDiCaprio',
      platform: 'Facebook',
      followers: '19.2M+ Followers',
      verified: 'Blue Badge Verified Community',
      url: SOCIAL_MEDIA_HANDLES.facebook.url,
      color: '#1877F2',
      accentBg: 'from-[#1877F2]/20 via-[#0d65d9]/15 to-[#2583ff]/10',
      borderGlow: 'rgba(24, 119, 242, 0.6)',
      description:
        'Official press tour updates, red carpet galleries, Earth Alliance grants, and historic cinema retrospects.',
      iconType: 'facebook',
      highlights: ['Earth Alliance Grant Releases', 'Red Carpet Galleries', 'Historic 35mm Retrospectives'],
    },
  };

  const handleKeys: HandleKey[] = ['telegram', 'x', 'instagram', 'facebook'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 lg:p-6 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-3xl border border-white/20 bg-zinc-950/95 p-4 sm:p-6 lg:p-8 shadow-2xl text-white"
        style={{
          boxShadow: `0 0 90px ${themeConfig.accent}25, 0 30px 60px -12px rgba(0, 0, 0, 0.95)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 rounded-full border border-amber-400/60 bg-black/85 hover:bg-amber-400 hover:text-black px-4 py-2 text-xs font-bold text-amber-300 transition-all shadow-xl active:scale-95 cursor-pointer"
          title="Back / Close"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-zinc-300 hover:bg-white/20 hover:text-white transition-all hover:scale-105"
          aria-label="Close Social Sphere Modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Official Welcome · Verified Social Accounts</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-1">
              Welcome to the World of <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Leonardo DiCaprio</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
              Welcome to Leonardo DiCaprio&apos;s official verified social media accounts. Connect directly across all four authenticated channels below for official announcements, climate initiatives, and direct contact.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              4 Verified Channels Live
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
              <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
              Telegram #1 Channel
            </span>
          </div>
        </div>

        {/* TOP SECTION: 3D CELESTIAL BALL EXHIBIT */}
        <div className="relative mb-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/60 p-4 sm:p-6 backdrop-blur-xl overflow-hidden">
          {/* Subtle celestial backdrop grid */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Info */}
            <div className="lg:max-w-xs text-center lg:text-left space-y-2">
              <h3 className="font-cinzel text-lg font-bold text-white">
                Verified Social Media
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Connect directly through Leonardo DiCaprio&apos;s verified social media channels: Telegram, X, Instagram, and Facebook.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <button
                  onClick={() => setIsAutoOrbiting(!isAutoOrbiting)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isAutoOrbiting
                      ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isAutoOrbiting ? 'animate-spin' : ''}`} />
                  <span>{isAutoOrbiting ? 'Auto-Rotating' : 'Rotation Paused'}</span>
                </button>
                <button
                  onClick={() => {
                    setRotationX(-12);
                    setRotationY(35);
                    setIsAutoOrbiting(true);
                    setHoveredHandle(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Reset View</span>
                </button>
              </div>
            </div>

            {/* Center: THE 3D CELESTIAL BALL (With all 3 nodes visible at once) */}
            <div
              className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none perspective-1000 my-2"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* External Ambient Halo */}
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, rgba(228, 64, 95, 0.15) 35%, rgba(34, 158, 217, 0.15) 70%, transparent 80%)',
                }}
              />

              {/* Equator & Celestial Orbit Rings */}
              <div
                className="absolute w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] rounded-full border border-dashed border-amber-300/30 pointer-events-none transition-transform duration-700"
                style={{
                  transform: `rotateX(65deg) rotateZ(${rotationY}deg)`,
                }}
              />
              <div
                className="absolute w-[270px] h-[270px] sm:w-[310px] sm:h-[310px] rounded-full border border-cyan-400/25 pointer-events-none transition-transform duration-700"
                style={{
                  transform: `rotateY(55deg) rotateX(${rotationX}deg)`,
                }}
              />

              {/* THE 3D BALL BODY */}
              <div
                className="relative w-[190px] h-[190px] sm:w-[220px] sm:h-[220px] rounded-full shadow-2xl transition-transform ease-out flex items-center justify-center"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                  background: 'radial-gradient(circle at 30% 30%, #3f3f46 0%, #18181b 50%, #000000 100%)',
                  boxShadow: 'inset -15px -15px 40px rgba(0, 0, 0, 0.95), inset 10px 10px 25px rgba(255, 255, 255, 0.25), 0 0 50px rgba(234, 179, 8, 0.3)',
                }}
              >
                {/* Frosted Glass Grid lines */}
                <div className="absolute inset-2 rounded-full border border-white/20 opacity-70 pointer-events-none" />
                <div className="absolute inset-5 rounded-full border border-amber-400/20 opacity-50 pointer-events-none" />

                {/* Sphere Specular Glare Reflection */}
                <div
                  className="absolute top-2 left-5 h-12 w-20 rounded-full opacity-40 blur-[2px] pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, transparent 80%)',
                    transform: 'rotate(-30deg)',
                  }}
                />

                {/* Subtle ambient texture overlay of Leonardo's Academy Award portrait */}
                <div
                  className="absolute inset-2 rounded-full opacity-30 mix-blend-screen bg-cover bg-top overflow-hidden pointer-events-none"
                  style={{
                    backgroundImage: 'url(/images/awa.webp)',
                    filter: 'contrast(1.15) brightness(0.95)',
                  }}
                />

                {/* Core Center Portrait of Leonardo DiCaprio in the Ball Cycle (Front Facing) */}
                <div
                  className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-amber-300 bg-zinc-950 p-0.5 shadow-2xl overflow-hidden backdrop-blur-md ring-2 ring-amber-400/50 group/core cursor-pointer"
                  style={{
                    transform: 'translateZ(14px)',
                    boxShadow: '0 0 35px rgba(245, 158, 11, 0.65), inset 0 0 12px rgba(0, 0, 0, 0.9)',
                  }}
                  title="Leonardo DiCaprio — Academy Award Winner"
                >
                  <img
                    src="/images/awa.webp"
                    alt="Leonardo DiCaprio Academy Award Winner"
                    className="h-full w-full rounded-full object-cover object-top filter brightness-105 contrast-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/now07.webp';
                    }}
                  />
                  {/* Subtle golden bevel & specular glare ring */}
                  <div className="pointer-events-none absolute inset-0 rounded-full border border-amber-300/60 shadow-inner" />
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-transparent to-white/25" />
                </div>

                {/* Core Center Portrait of Leonardo DiCaprio in the Ball Cycle (Back Facing - 360° visibility) */}
                <div
                  className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-amber-300 bg-zinc-950 p-0.5 shadow-2xl overflow-hidden backdrop-blur-md ring-2 ring-amber-400/50 group/core cursor-pointer"
                  style={{
                    transform: 'translateZ(-14px) rotateY(180deg)',
                    boxShadow: '0 0 35px rgba(245, 158, 11, 0.65), inset 0 0 12px rgba(0, 0, 0, 0.9)',
                  }}
                  title="Leonardo DiCaprio — Academy Award Winner"
                >
                  <img
                    src="/images/awa.webp"
                    alt="Leonardo DiCaprio Academy Award Winner"
                    className="h-full w-full rounded-full object-cover object-top filter brightness-105 contrast-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/now07.webp';
                    }}
                  />
                  {/* Subtle golden bevel & specular glare ring */}
                  <div className="pointer-events-none absolute inset-0 rounded-full border border-amber-300/60 shadow-inner" />
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-transparent to-white/25" />
                </div>

                {/* ALL THREE SATELLITE NODES ON THE BALL FORM - DISPLAYED AT THE SAME TIME */}
                {handleKeys.map((key) => {
                  const cfg = handlesConfig[key];
                  const angleRad = ((cfg.angle + rotationY) * Math.PI) / 180;
                  const radius = 115; // Distance from center of sphere
                  const x = Math.sin(angleRad) * radius;
                  const z = Math.cos(angleRad) * radius;
                  const isFront = z > 0;
                  const isHovered = hoveredHandle === key;

                  return (
                    <div
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation();
                        focusHandle(key);
                      }}
                      onMouseEnter={() => setHoveredHandle(key)}
                      onMouseLeave={() => setHoveredHandle(null)}
                      className="absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-300"
                      style={{
                        transform: `translateX(${x}px) translateZ(${z}px) scale(${isHovered ? 1.15 : isFront ? 1.05 : 0.9})`,
                        // Keep visible at all times so all three handles display simultaneously
                        opacity: isFront ? 1 : 0.85,
                        zIndex: isFront ? 25 : 10,
                      }}
                    >
                      {/* Satellite Node Orb */}
                      <div
                        className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 p-1 shadow-2xl transition-all duration-300 ${
                          isHovered
                            ? 'ring-4 ring-white/60 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          borderColor: cfg.color,
                          backgroundColor: '#09090b',
                          boxShadow: `0 0 25px ${cfg.color}`,
                        }}
                      >
                        {/* Inner Gradient Core */}
                        <div
                          className={`flex h-full w-full items-center justify-center rounded-full font-bold text-white shadow-inner ${
                            cfg.iconType === 'ig'
                              ? 'bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737]'
                              : cfg.iconType === 'telegram'
                              ? 'bg-[#229ED9]'
                              : cfg.iconType === 'x'
                              ? 'bg-black border border-white/40'
                              : 'bg-[#1877F2]'
                          }`}
                        >
                          {cfg.iconType === 'ig' && <span className="font-sans font-black text-xs sm:text-sm">IG</span>}
                          {cfg.iconType === 'telegram' && <Send className="h-5 w-5 sm:h-6 sm:w-6 text-white ml-0.5" />}
                          {cfg.iconType === 'x' && (
                            <svg className="h-4 w-4 sm:h-5 sm:w-5 fill-current text-white" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          )}
                          {cfg.iconType === 'facebook' && <span className="font-sans font-bold text-lg sm:text-xl">f</span>}
                        </div>

                        {cfg.isNumberOne && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black text-[9px] font-black shadow-md ring-2 ring-black">
                            1
                          </span>
                        )}

                        {/* Orbiting Ring Indicator */}
                        <span
                          className="absolute -inset-1 rounded-full animate-ping opacity-25"
                          style={{ backgroundColor: cfg.color }}
                        />
                      </div>

                      {/* Floating Label Under Node with Handle Name */}
                      <div
                        className="mt-1.5 whitespace-nowrap rounded-lg border border-white/20 bg-black/95 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wider backdrop-blur-md shadow-xl"
                        style={{
                          color: cfg.color,
                          borderColor: isHovered ? cfg.color : 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {cfg.handle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Summary: Quick Status for all 3 */}
            <div className="lg:max-w-xs space-y-2.5 w-full">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block">
                Simultaneous Hub Status
              </span>
              <div className="space-y-1.5">
                {handleKeys.map((key) => {
                  const cfg = handlesConfig[key];
                  const isHovered = hoveredHandle === key;
                  return (
                    <div
                      key={key}
                      onClick={() => focusHandle(key)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all ${
                        isHovered
                          ? 'border-white bg-white/10 scale-102'
                          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.08]'
                      }`}
                      style={{
                        borderLeftColor: cfg.color,
                        borderLeftWidth: '3px',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }}
                        />
                        <span className="text-xs font-bold text-white">{cfg.platform}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{cfg.handle}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: ALL FOUR SOCIAL MEDIA CHANNELS DISPLAYED AT THE SAME TIME */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>All 4 Social Media Accounts — Live &amp; Direct</span>
            </h3>
          </div>

          {/* SIMULTANEOUS 4-COLUMN CARDS GRID (ALL 4 DISPLAYED TOGETHER, TELEGRAM #1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {handleKeys.map((key) => {
              const cfg = handlesConfig[key];
              const isHovered = hoveredHandle === key;

              return (
                <div
                  key={key}
                  onMouseEnter={() => setHoveredHandle(key)}
                  onMouseLeave={() => setHoveredHandle(null)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-300 shadow-xl overflow-hidden ${
                    cfg.isNumberOne
                      ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/10 via-zinc-900/95 to-zinc-950/98 shadow-[0_0_25px_rgba(217,119,6,0.25)]'
                      : isHovered
                      ? 'border-white/60 -translate-y-1 scale-[1.02]'
                      : 'border-white/15 hover:border-white/40'
                  }`}
                  style={{
                    borderColor: isHovered ? cfg.color : cfg.isNumberOne ? '#f59e0b' : undefined,
                    background: cfg.isNumberOne
                      ? undefined
                      : `linear-gradient(145deg, rgba(18, 18, 22, 0.95) 0%, rgba(9, 9, 12, 0.98) 100%)`,
                    boxShadow: isHovered
                      ? `0 12px 35px ${cfg.color}35`
                      : cfg.isNumberOne
                      ? '0 10px 30px rgba(245, 158, 11, 0.25)'
                      : '0 8px 25px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {/* Top Ambient Glow Ribbon */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 transition-opacity"
                    style={{
                      backgroundColor: cfg.color,
                      boxShadow: `0 0 15px ${cfg.color}`,
                    }}
                  />

                  {/* Card Content Top */}
                  <div>
                    {/* Header: Platform Icon + Badge */}
                    <div className="flex items-center justify-between mb-4 mt-1">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold text-base shadow-lg shrink-0"
                          style={{
                            backgroundColor: cfg.iconType === 'x' ? '#09090b' : cfg.color,
                            border: cfg.iconType === 'x' ? '1px solid rgba(255,255,255,0.4)' : undefined,
                            boxShadow: `0 0 15px ${cfg.color}66`,
                          }}
                        >
                          {cfg.iconType === 'telegram' && <Send className="h-5 w-5 text-white ml-0.5" />}
                          {cfg.iconType === 'x' && (
                            <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          )}
                          {cfg.iconType === 'ig' && 'IG'}
                          {cfg.iconType === 'facebook' && 'f'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-cinzel text-sm font-bold text-white truncate max-w-[110px]">
                              {cfg.platform}
                            </h4>
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          </div>
                          <span
                            className="font-mono text-[11px] font-bold block truncate max-w-[120px]"
                            style={{ color: cfg.color }}
                          >
                            {cfg.handle}
                          </span>
                        </div>
                      </div>

                      {cfg.isNumberOne ? (
                        <span className="rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-400 to-amber-500 text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 shadow-md">
                          ★ #1 Official
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300 uppercase tracking-wider shrink-0">
                          Official
                        </span>
                      )}
                    </div>

                    {/* Follower / Audience Metric Pill */}
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 mb-3">
                      <span className="text-[10px] text-zinc-400">Audience:</span>
                      <span className="font-cinzel text-[11px] font-bold text-white">
                        {cfg.followers}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-300 leading-relaxed font-light mb-3 min-h-[44px]">
                      {cfg.description}
                    </p>

                    {/* Key Highlights Bullet points */}
                    <div className="space-y-1 mb-4">
                      {cfg.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <span className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions Bottom: Open Platform + Copy Handle */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-1.5">
                    <a
                      href={cfg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-102 active:scale-98"
                      style={{
                        backgroundColor: cfg.iconType === 'x' ? '#27272a' : cfg.color,
                        border: cfg.iconType === 'x' ? '1px solid rgba(255,255,255,0.3)' : undefined,
                        boxShadow: `0 4px 12px ${cfg.color}35`,
                      }}
                    >
                      <span className="truncate">Open {cfg.platform}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
                    </a>

                    <button
                      onClick={() => handleCopyHandle(cfg.handle, key)}
                      className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-2 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/15 transition-all shrink-0 cursor-pointer"
                      title={`Copy ${cfg.platform} handle to clipboard`}
                      aria-label={`Copy ${cfg.platform} handle`}
                    >
                      {copiedKey === key ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-[9px] text-emerald-300 font-mono">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-zinc-300" />
                          <span className="text-[9px] font-mono">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Modal Footer / Official Notice & Scam Advisory */}
        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex flex-col gap-2.5 max-w-3xl rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Official Verification Notice &amp; Quick Reply Advisory</span>
            </div>

            <span className="text-xs text-zinc-200 leading-relaxed">
              These are Leonardo DiCaprio&apos;s <strong>official verified social media accounts</strong>. For a <strong>quick reply</strong> and direct communication, please <strong>write directly to his official Telegram channel</strong> (<span className="text-cyan-300 font-mono font-semibold">@leonardodicap1974</span>).
              <br />
              <strong className="text-amber-300 mt-1.5 inline-block">Notice:</strong> Anyone contacting or messaging you without these official verified accounts is a <strong>scam</strong> and should be <strong>reported immediately through the official Telegram channel</strong>.
            </span>

          </div>

          <button
            onClick={onClose}
            className="w-full lg:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-xl hover:scale-102 active:scale-98 transition-all font-sans cursor-pointer"
          >
            <span>Enter Official Experience &amp; VIP Store</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
