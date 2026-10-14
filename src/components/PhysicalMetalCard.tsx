import { useState, useRef } from 'react';
import { Info, ArrowRight, ShieldCheck, QrCode, Sparkles, CreditCard } from 'lucide-react';
import { StoreItem, LuxuryTheme } from '../types';
import { THEME_CONFIGS } from '../data/diCaprioData';

interface PhysicalMetalCardProps {
  type: 'sovereign' | 'gold' | 'silver';
  item: StoreItem;
  currentTheme: LuxuryTheme;
  onAddToCart?: (item: StoreItem) => void;
  onInstantBuy: (item: StoreItem) => void;
}

export function PhysicalMetalCard({
  type,
  item,
  currentTheme,
  onInstantBuy,
}: PhysicalMetalCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const isSovereign = type === 'sovereign' || item.id === 'vip-platinum';
  const isGold = type === 'gold' && !isSovereign;
  const isSilver = type === 'silver';
  const themeConfig = THEME_CONFIGS[currentTheme];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable 3D tilt tracking on touch/mobile devices or narrow viewports to avoid jitter & scroll interference
    if (!cardRef.current || window.innerWidth < 1024) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 12;
    const rotateX = -((y - centerY) / centerY) * 12;
    const sheenX = (x / rect.width) * 100;
    const sheenY = (y / rect.height) * 100;

    setMouseTilt({ rotateX, rotateY, sheenX, sheenY });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50 });
  };

  const handleFlipToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  return (
    <div
      className={`flex flex-col h-full rounded-3xl border bg-zinc-950/80 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
        isSovereign
          ? 'border-amber-400/60 shadow-amber-500/20 hover:border-amber-300'
          : isGold
          ? 'border-amber-400/40 hover:border-amber-400'
          : 'border-white/15 hover:border-slate-300'
      }`}
    >
      {/* Top Header of the Listing */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-lg px-3 py-1 font-mono text-xs font-black uppercase tracking-wider ${
              isSovereign
                ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black shadow-lg shadow-amber-400/40'
                : isGold
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                : 'bg-slate-200 text-slate-900 shadow-lg shadow-slate-200/20'
            }`}
          >
            {isSovereign
              ? '24K Gold Sovereign ($25,000)'
              : isGold
              ? 'Gold VIP Card ($10,000)'
              : 'Silver Card ($5,000)'}
          </span>
          {isSovereign && (
            <span className="rounded-lg bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              Valued at $30,000
            </span>
          )}
          <span className="text-xs font-semibold text-zinc-400 hidden sm:inline">
            {isSovereign ? 'Face in 24K Gold' : 'Pure Metal'}
          </span>
        </div>

        {/* Card Flip Tool */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleFlipToggle}
            title="Flip to back for official serial &amp; collector seal"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-8 text-xs font-semibold text-zinc-300 hover:text-white hover:border-amber-400/40 transition-all"
          >
            <Info className="h-3.5 w-3.5 text-amber-300" />
            <span>{isFlipped ? 'Show Front Face' : 'Flip to Inspect Seal'}</span>
          </button>
        </div>
      </div>

      {/* 3D PURE METAL CARD DISPLAY CONTAINER */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="perspective-1500 my-2 w-full flex items-center justify-center select-none cursor-pointer"
        onClick={handleFlipToggle}
      >
        <div
          className="relative w-full max-w-[340px] aspect-[1/1.5] rounded-3xl transition-transform duration-700 transform-style-3d shadow-2xl"
          style={{
            transform: `rotateX(${mouseTilt.rotateX}deg) rotateY(${
              (isFlipped ? 180 : 0) + mouseTilt.rotateY
            }deg)`,
            boxShadow: isSovereign
              ? '0 25px 55px -10px rgba(245, 158, 11, 0.5), 0 0 35px rgba(212, 175, 55, 0.3)'
              : isGold
              ? '0 20px 45px -10px rgba(212, 175, 55, 0.4)'
              : '0 20px 45px -10px rgba(160, 174, 192, 0.35)',
          }}
        >
          {/* FRONT FACE: THE EXACT BRUSHED PURE METAL CARD WITH HIS FACE AT THE CENTER */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-6 flex flex-col justify-between backface-hidden overflow-hidden border-4"
            style={{
              borderColor: isSovereign ? '#f59e0b' : isGold ? '#aa8210' : '#64748b',
              background: isSovereign
                ? `radial-gradient(circle at ${mouseTilt.sheenX}% ${mouseTilt.sheenY}%, #fffbe6 0%, #f5d377 20%, #d4af37 50%, #8c680a 100%)`
                : isGold
                ? `radial-gradient(circle at ${mouseTilt.sheenX}% ${mouseTilt.sheenY}%, #fff3be 0%, #e8c464 25%, #d4af37 55%, #946f0f 100%)`
                : `radial-gradient(circle at ${mouseTilt.sheenX}% ${mouseTilt.sheenY}%, #ffffff 0%, #e2e8f0 25%, #cbd5e1 55%, #64748b 100%)`,
            }}
          >
            {/* Dynamic Specular Metallic Sheen Glare */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay transition-opacity"
              style={{
                background: `linear-gradient(${mouseTilt.sheenX * 3.6}deg, transparent 20%, rgba(255,255,255,0.95) 50%, transparent 80%)`,
              }}
            />

            {/* Inner Debossed Bezel Frame Line */}
            <div
              className="absolute inset-3.5 rounded-2xl border-2 pointer-events-none"
              style={{
                borderColor: isSilver ? 'rgba(30, 41, 59, 0.65)' : 'rgba(74, 50, 4, 0.75)',
                boxShadow: isSilver
                  ? 'inset 0 0 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.6)'
                  : 'inset 0 0 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,248,204,0.5)',
              }}
            />

            {/* 1. TOP ENGRAVED TEXT: LEONARDO DICAPRIO */}
            <div className="relative z-10 text-center pt-1">
              <span
                className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] block mb-0.5"
                style={{ color: isSilver ? '#334155' : '#573c03' }}
              >
                {isSovereign
                  ? '24K SOLID GOLD-PLATED CREDENTIAL'
                  : isGold
                  ? 'OFFICIAL VIP GOLD GUILD'
                  : 'STERLING SILVER ARCHIVAL PASS'}
              </span>
              <h4
                className="font-cinzel text-lg sm:text-xl font-black tracking-[0.24em] leading-tight"
                style={{
                  color: isSilver ? '#0f172a' : '#382501',
                  textShadow: isSilver
                    ? '1px 1px 1px #ffffff, -0.5px -0.5px 1px #1e293b'
                    : '1px 1px 1px #fff8cc, -0.5px -0.5px 1px #221501',
                }}
              >
                LEONARDO
              </h4>
              <h4
                className="font-cinzel text-lg sm:text-xl font-black tracking-[0.24em] leading-tight"
                style={{
                  color: isSilver ? '#0f172a' : '#382501',
                  textShadow: isSilver
                    ? '1px 1px 1px #ffffff, -0.5px -0.5px 1px #1e293b'
                    : '1px 1px 1px #fff8cc, -0.5px -0.5px 1px #221501',
                }}
              >
                DiCAPRIO
              </h4>
            </div>

            {/* 2. CENTER GOLD MEDALLION: LEONARDO DICAPRIO'S FACE RIGHT AT THE CENTER OF THE GOLD */}
            <div className="relative z-10 flex flex-col items-center my-auto">
              <div
                className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 overflow-hidden shadow-2xl flex items-center justify-center p-0"
                style={{
                  borderColor: isSovereign ? '#ffeaa8' : isGold ? '#ffe394' : '#e2e8f0',
                  boxShadow: isSovereign
                    ? '0 0 25px rgba(245, 158, 11, 0.65), inset 0 0 15px rgba(0,0,0,0.5)'
                    : isGold
                    ? '0 0 20px rgba(212, 175, 55, 0.5), inset 0 0 10px rgba(0,0,0,0.4)'
                    : '0 0 15px rgba(160, 174, 192, 0.35)',
                }}
              >
                {/* Photo of Leonardo DiCaprio — Face pinned dead center */}
                <img
                  src="/images/dec.webp"
                  alt="Leonardo DiCaprio face centered in gold medallion"
                  className="h-full w-full object-cover object-[center_28%] scale-110 filter"
                  style={{
                    filter: isSilver
                      ? 'grayscale(85%) contrast(120%) brightness(1.05)'
                      : 'sepia(40%) contrast(115%) brightness(1.02) saturate(1.1)',
                  }}
                />

                {/* 24K Gold Glaze Sheen Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-color opacity-40"
                  style={{
                    background: isSilver
                      ? 'radial-gradient(circle, #ffffff 0%, #64748b 100%)'
                      : 'radial-gradient(circle, #fff7cd 0%, #d4af37 60%, #785004 100%)',
                  }}
                />

                {/* Inner Bezel Ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 pointer-events-none z-10"
                  style={{ borderColor: isSilver ? 'rgba(255,255,255,0.7)' : 'rgba(255,248,204,0.8)' }}
                />
              </div>

              {/* VIP VALUE OR EXPERIENCE BANNER */}
              <div className="text-center mt-2 font-cinzel">
                {isSovereign ? (
                  <>
                    <div className="inline-block rounded-full bg-amber-950/40 border border-amber-900/60 px-2.5 py-0.5 text-[9px] font-black text-amber-950 tracking-wider mb-0.5">
                      VALUED AT $30,000 · SOLD AT $25,000
                    </div>
                    <p
                      className="text-xs font-black tracking-[0.22em] uppercase"
                      style={{ color: '#382501', textShadow: '0.5px 0.5px 0 #fff8cc' }}
                    >
                      SOVEREIGN VIP PASS
                    </p>
                    <p
                      className="text-[9px] font-bold tracking-[0.2em] uppercase text-amber-950"
                    >
                      EXTENDED SALON &amp; INTIMATE DINNER
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="text-[10px] font-bold tracking-[0.25em] uppercase"
                      style={{
                        color: isGold ? '#3d2902' : '#0f172a',
                        textShadow: isGold ? '0.5px 0.5px 0 #fff8cc' : '0.5px 0.5px 0 #ffffff',
                      }}
                    >
                      EXCLUSIVE
                    </p>
                    <p
                      className="text-xs font-black tracking-[0.2em] uppercase my-0.5"
                      style={{
                        color: isGold ? '#3d2902' : '#0f172a',
                        textShadow: isGold ? '0.5px 0.5px 0 #fff8cc' : '0.5px 0.5px 0 #ffffff',
                      }}
                    >
                      {isGold ? 'VIP GREET & MEET' : 'GREET & MEET'}
                    </p>
                    <p
                      className="text-[10px] font-bold tracking-[0.25em] uppercase"
                      style={{
                        color: isGold ? '#3d2902' : '#0f172a',
                        textShadow: isGold ? '0.5px 0.5px 0 #fff8cc' : '0.5px 0.5px 0 #ffffff',
                      }}
                    >
                      EXPERIENCE
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 3. BOTTOM ENGRAVED CARD METRICS */}
            <div className="relative z-10 flex items-center justify-between border-t border-black/20 pt-2 pb-0 text-[9px] font-mono font-bold uppercase tracking-wider">
              <span style={{ color: isSilver ? '#334155' : '#4a3304' }}>
                {isSovereign ? '24K SOLID GOLD (85g)' : isGold ? '24K PLATED (45g)' : 'STERLING (42g)'}
              </span>
              <span style={{ color: isSilver ? '#334155' : '#4a3304' }}>
                {isSovereign ? '#LD-SOVEREIGN-001' : isGold ? '#LD-GOLD-VIP-042' : '#LD-SLV-EXP-118'}
              </span>
            </div>
          </div>

          {/* BACK FACE (Flipped 180°): Serial Details & Official Guild Crest */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between rotate-y-180 backface-hidden bg-zinc-950 border-4 shadow-2xl"
            style={{
              borderColor: isSovereign ? '#f59e0b' : isGold ? '#d4af37' : '#cbd5e1',
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <QrCode className="h-4 w-4" style={{ color: isSilver ? '#38bdf8' : '#f59e0b' }} />
                  <span className="font-mono text-xs font-bold text-white tracking-widest">
                    {isSovereign ? 'SOVEREIGN-CREST' : isGold ? 'VIP-COLLECTOR-CREST' : 'SLV-COLLECTOR-CREST'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">
                  {isSovereign ? '#LD-SOVEREIGN-24K-001' : isGold ? '#LD-GOLD-VIP-042' : '#LD-SLV-EXP-118'}
                </span>
              </div>

              {/* Metallic Magnetic Band & Hologram */}
              <div className="h-9 w-full bg-black -mx-6 mb-4 flex items-center px-6">
                <span className="font-mono text-[9px] text-zinc-600 tracking-widest">
                  //////////////////// OFFICIAL ARCHIVAL GUILD SEAL ////////////////////
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <p className="font-cinzel text-sm font-bold text-white">
                  {isSovereign
                    ? 'Sovereign 24K Gold VIP Experience'
                    : isGold
                    ? 'Gold VIP Greet & Meet Experience'
                    : 'Silver Exclusive Experience'}
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  {isSovereign
                    ? 'Grants extended 120-minute private salon reception & seated dinner at Leonardo\'s private table, unhurried 1-on-1 discussion, studio portrait sitting, hand-inscribed shooting script, and engraved 24K gold credential.'
                    : isGold
                    ? 'Grants access to intimate greenroom reception, 1-on-1 private portrait moment with Leonardo DiCaprio, and engraved commemorative 24K gold pure metal card.'
                    : 'Grants red carpet fan zone entry, reserved premiere orchestra seat, and serialized sterling silver pure metal commemorative card.'}
                </p>

                <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-300">Card Specifications:</span>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Dimensions:</span>
                    <span className="text-zinc-200">85.6mm × 53.98mm (CR80)</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Weight & Composition:</span>
                    <span className="text-zinc-200">
                      {isSovereign
                        ? '85.0g / Solid Brass & Pure 24K Gold Plated'
                        : isGold
                        ? '45g / Brass & 24K Gold Plated'
                        : '42g / Brushed Stainless Steel'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Security:</span>
                    <span className="text-emerald-400">Archival Serial Hologram &amp; Tamper Seal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300">
                Tap card to return front
              </span>
              <span className="text-xs font-bold text-white">${item.price.toLocaleString()} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* LISTING PRICE & PRODUCT DETAILS SECTION */}
      <div className="mt-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white">
                {isSovereign ? '24K Gold Sovereign VIP Pass' : isGold ? 'Gold VIP Card' : 'Silver Card'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{item.subtitle}</p>
            </div>
            {/* Listing Price Tag */}
            <div className="text-right">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-[10px] line-through text-zinc-500 block">
                  ${item.originalPrice.toLocaleString()} USD
                </span>
              )}
              <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-semibold">
                Listing Price
              </span>
              <span className="font-cinzel text-2xl sm:text-3xl font-black text-white">
                ${item.price.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 block">USD / Physical Pass</span>
            </div>
          </div>

          {/* Key Perks */}
          <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
            {item.perks.slice(0, 3).map((perk, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={() => onInstantBuy(item)}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider shadow-xl transition-all hover:scale-[1.02] active:scale-98 ${
              isSovereign
                ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black shadow-amber-400/30'
                : isGold
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-amber-500/20'
                : 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 text-black shadow-slate-300/20'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>
              Reserve{' '}
              {isSovereign
                ? 'Sovereign 24K Pass ($25,000)'
                : isGold
                ? 'Gold VIP Pass ($10,000)'
                : 'Silver Card ($5,000)'}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
