import { useState } from 'react';
import {
  CreditCard,
  RotateCw,
  Check,
  ShoppingBag,
  ShieldCheck,
  Lock,
  QrCode,
  Flame,
  ArrowRight,
  Info
} from 'lucide-react';
import { LuxuryTheme, StoreItem } from '../types';
import { THEME_CONFIGS, STORE_ITEMS } from '../data/diCaprioData';

interface MeetAndGreetStoreProps {
  currentTheme: LuxuryTheme;
  reducedMotion?: boolean;
  onAddToCart: (item: StoreItem) => void;
  onInstantBuy: (item: StoreItem) => void;
}

export function MeetAndGreetStore({
  currentTheme,
  onAddToCart,
  onInstantBuy,
}: MeetAndGreetStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const themeConfig = THEME_CONFIGS[currentTheme];

  const handleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = (item: StoreItem) => {
    onAddToCart(item);
    setAddedItemNotice(item.id);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const filteredItems = STORE_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'platinum') return item.id === 'vip-platinum';
    if (selectedCategory === 'gold') return item.id === 'vip-gold';
    if (selectedCategory === 'silver') return item.id === 'vip-silver';
    if (selectedCategory === 'vip') return item.category === 'meet-and-greet';
    if (selectedCategory === 'memorabilia') return item.category === 'signed-memorabilia';
    if (selectedCategory === 'apparel') return item.category === 'apparel' || item.category === 'props';
    return true;
  });

  return (
    <section id="vip-store" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black/90">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute top-1/3 -left-40 h-[600px] w-[600px] rounded-full blur-[180px] opacity-20"
        style={{ backgroundColor: themeConfig.accent }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              The Leonardo DiCaprio <span className={`bg-gradient-to-r ${themeConfig.gradientText} bg-clip-text text-transparent`}>VIP Experience</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed font-light">
              An unprecedented, unscripted evening with cinema titan Leonardo DiCaprio. Step beyond the public curtain into private salon receptions, personal 1-on-1 photo encounters, and red carpet guild arrivals. Every credential is forged in solid pure metal with individually engraved serial authentication, with direct funding empowering frontline Earth Alliance conservation missions worldwide.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            {[
              { id: 'all', label: 'All Vault Items' },
              { id: 'platinum', label: '24K Gold Sovereign ($25,000)' },
              { id: 'gold', label: 'Gold VIP Card ($10,000)' },
              { id: 'silver', label: 'Silver Card ($5,000)' },
              { id: 'vip', label: 'All VIP Passes' },
              { id: 'memorabilia', label: 'Signed Memorabilia' },
              { id: 'apparel', label: 'Apparel & Props' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-amber-400 text-black shadow-lg font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>



        {/* COMPLETE CATALOG GRID (With Platinum Pass and Archival Rarities) */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
              Full Archival Store &amp; Pass Collection
            </h3>
            <p className="text-xs text-zinc-400">All passes and collector items available for reservation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const isFlipped = !!flippedCards[item.id];
            const isAdded = addedItemNotice === item.id;

            const isPlatinum = item.tier === 'Platinum';
            const isGold = item.tier === 'Gold';
            const isSilver = item.tier === 'Silver';

            const cardBorderColor = isPlatinum
              ? 'rgba(245, 158, 11, 0.75)'
              : isGold
              ? 'rgba(212, 175, 55, 0.5)'
              : isSilver
              ? 'rgba(192, 192, 192, 0.4)'
              : 'rgba(255, 255, 255, 0.15)';

            const cardGlow = isPlatinum
              ? '0 0 45px rgba(245, 158, 11, 0.4)'
              : isGold
              ? '0 0 35px rgba(212, 175, 55, 0.3)'
              : isSilver
              ? '0 0 30px rgba(192, 192, 192, 0.2)'
              : '0 10px 30px rgba(0, 0, 0, 0.5)';

            return (
              <div
                key={item.id}
                className="perspective-1000 flex flex-col h-full"
              >
                {/* 3D Flippable Container */}
                <div
                  className="relative w-full rounded-3xl transition-transform duration-700 transform-style-3d flex flex-col flex-grow"
                  style={{
                    transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
                  }}
                >
                  {/* FRONT FACE OF CARD */}
                  <div
                    className={`w-full rounded-3xl border p-6 sm:p-7 flex flex-col justify-between backface-hidden transition-all duration-300 relative overflow-hidden flex-grow ${
                      item.isSoldOut ? 'bg-zinc-950/95 opacity-85' : 'bg-zinc-950/90 backdrop-blur-2xl'
                    }`}
                    style={{
                      borderColor: cardBorderColor,
                      boxShadow: cardGlow,
                    }}
                  >
                    {/* Hologram Light Sweeper */}
                    <div className="pointer-events-none absolute inset-0 hologram-shimmer opacity-30" />

                    <div>
                      {/* Top Badges & Flip Tool */}
                      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-lg px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase ${
                              isPlatinum
                                ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black font-black shadow-md shadow-amber-400/30'
                                : isGold
                                ? 'bg-amber-400 text-black font-bold'
                                : isSilver
                                ? 'bg-zinc-300 text-black'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {item.badge}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="rounded-lg bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                              Valued at ${item.originalPrice.toLocaleString()}
                            </span>
                          )}
                          {item.isSoldOut && (
                            <span className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                              <Lock className="h-3 w-3" />
                              SOLD OUT
                            </span>
                          )}
                        </div>

                        {/* Interactive Flip Tool */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleFlip(item.id)}
                            title="Flip to Back for Serial &amp; Crest Details"
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 h-8 text-[11px] font-semibold text-zinc-300 hover:text-white hover:border-white/30 transition-all"
                          >
                            <Info className="h-3.5 w-3.5" />
                            <span>{isFlipped ? 'Front' : 'Flip'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Item Image Preview */}
                      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-5 border border-white/10 bg-zinc-900">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-contain p-2 transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300">
                          <span className="flex items-center gap-1 font-mono">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            {isPlatinum ? '24K Gold Sovereign Edition' : isGold ? 'Gold VIP Edition' : isSilver ? 'Silver Metal Edition' : 'Archival Provenance'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="font-cinzel text-xl font-bold text-white tracking-tight leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400">{item.subtitle}</p>

                      {/* Pricing Tag with prominent Listing Price display */}
                      <div className="mt-4 flex items-baseline justify-between border-b border-white/10 pb-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Listing Price</span>
                          <div className="flex items-baseline gap-2.5">
                            {item.price === 0 ? (
                              <span className="font-cinzel text-3xl font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                                FREE
                              </span>
                            ) : (
                              <span className="font-cinzel text-3xl font-extrabold text-amber-300">
                                ${item.price.toLocaleString()}
                              </span>
                            )}
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="font-cinzel text-base text-zinc-500 line-through">
                                ${item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                            {item.price === 0 ? 'Complimentary' : 'USD / Card'}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="inline-block rounded bg-emerald-400/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 mt-1">
                              {item.price === 0 ? '100% Free Allocation' : `Save $${(item.originalPrice - item.price).toLocaleString()}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Key Perks List */}
                      <div className="mt-4 space-y-2">
                        {item.perks.slice(0, 4).map((perk, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 pt-4 border-t border-white/10 relative z-10 flex items-center gap-3">
                      {item.isSoldOut ? (
                        <button
                          disabled
                          className="w-full rounded-xl border border-red-500/30 bg-red-950/30 py-3 text-center text-xs font-bold uppercase tracking-wider text-red-300 cursor-not-allowed"
                        >
                          Sold Out In Archival Auction
                        </button>
                      ) : (
                        <button
                          onClick={() => onInstantBuy(item)}
                          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-wider uppercase text-black shadow-lg transition-transform hover:scale-102 active:scale-98 ${
                            item.price === 0
                              ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:brightness-110 ring-2 ring-emerald-400/50'
                              : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600'
                          }`}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>{item.price === 0 ? 'Claim Free Pass' : 'Reserve VIP Experience'}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* REVERSE FACE OF CARD (Flipped 180°) */}
                  <div
                    className="absolute inset-0 w-full rounded-3xl border border-white/20 bg-zinc-950/95 p-6 sm:p-7 flex flex-col justify-between rotate-y-180 backface-hidden shadow-2xl backdrop-blur-2xl overflow-hidden"
                    style={{
                      borderColor: cardBorderColor,
                    }}
                  >
                    <div>
                      {/* Top Bar on Reverse */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-amber-400" />
                          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-300">
                            Official Serial &amp; Guild Crest
                          </span>
                        </div>
                        <button
                          onClick={() => handleFlip(item.id)}
                          className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white"
                        >
                          Return Front
                        </button>
                      </div>

                      {/* Card Hologram Foil Simulation */}
                      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 mb-4 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono tracking-widest text-zinc-500">
                            SERIAL #{item.id.toUpperCase()}-2026
                          </span>
                          <span className="h-5 w-8 rounded bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-600 border border-yellow-200/50 shadow-inner" />
                        </div>
                        <p className="font-cinzel text-sm font-bold text-white mb-1">{item.title}</p>
                        <p className="text-[11px] text-zinc-400">Authenticated Pure Metal Series · Verified by AMPAS Guild</p>
                      </div>

                      {/* Detailed Description & Itinerary */}
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                          Card Inclusions &amp; Privileges:
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed font-light">
                          {item.description}
                        </p>

                        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                            All Inclusions:
                          </span>
                          {item.perks.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Return Action on Reverse */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        ${item.price.toLocaleString()} USD
                      </span>
                      {!item.isSoldOut && (
                        <button
                          onClick={() => onInstantBuy(item)}
                          className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black hover:bg-amber-300 transition-colors"
                        >
                          Reserve Pass
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
