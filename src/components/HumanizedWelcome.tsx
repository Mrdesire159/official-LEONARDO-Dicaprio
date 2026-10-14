import {
  Quote,
  ShieldCheck,
} from 'lucide-react';
import { LuxuryTheme, PageId } from '../types';
import { THEME_CONFIGS, USER_PHOTOS } from '../data/diCaprioData';

interface HumanizedWelcomeProps {
  currentTheme: LuxuryTheme;
  onNavigatePage?: (page: PageId) => void;
  onOpenVerificationModal: () => void;
}

export function HumanizedWelcome({
  currentTheme,
  onOpenVerificationModal,
}: HumanizedWelcomeProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Letter from Leonardo DiCaprio: Humanizing Voice */}
      <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full blur-[140px] opacity-15"
          style={{ backgroundColor: themeConfig.accent }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="relative shrink-0">
            <div className="h-44 w-44 sm:h-52 sm:w-52 rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-[0_0_35px_rgba(245,158,11,0.25)] relative group">
              <img
                src={USER_PHOTOS[1]?.url || USER_PHOTOS[0]?.url}
                alt="Leonardo DiCaprio Portrait"
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300">
                  Leonardo DiCaprio
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-left flex-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: themeConfig.accent }}>
              <Quote className="h-4 w-4" />
              <span>A Personal Note to Visitors</span>
            </div>

            <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
              &ldquo;Cinema gives us empathy for strangers. Conservation demands we protect the only home we will ever share.&rdquo;
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 font-serif italic leading-relaxed">
              &ldquo;Throughout my life, storytelling has never been about fame; it has been about truth. Whether bringing Hugh Glass’s survival to life in freezing sub-zero wilderness or sitting with Indigenous leaders in the heart of the Amazon, the goal is unchanged: honoring our shared humanity and guarding the natural wonders that keep us alive. Welcome to my official sanctuary and living archive.&rdquo;
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <span className="font-cinzel text-base font-bold text-white">
                  Leonardo DiCaprio
                </span>
                <span className="text-xs text-zinc-400">
                  Actor, Producer & UN Messenger of Peace
                </span>
              </div>

              <button
                onClick={onOpenVerificationModal}
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Read Authenticity & Anti-Fraud Notice →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
