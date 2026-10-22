import { useState } from 'react';
import {
  ShieldCheck,
  Send,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Flag,
  Lock,
  Globe,
  Radio,
  FileText,
  CheckCircle2,
  HelpCircle,
  Mail
} from 'lucide-react';
import { LuxuryTheme } from '../types';
import { THEME_CONFIGS, SOCIAL_MEDIA_HANDLES, OFFICIAL_CONTACT_EMAIL } from '../data/diCaprioData';

interface OfficialChannelsPageProps {
  currentTheme: LuxuryTheme;
  onOpenReportModal?: () => void;
}

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightRadius?: number;
  style?: React.CSSProperties;
}

function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.15)',
  spotlightRadius = 350,
  style = {},
}: SpotlightCardProps) {
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Radial Cursor-Following Spotlight Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${spotlightRadius}px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        {children}
      </div>
    </div>
  );
}

export function OfficialChannelsPage({ currentTheme }: OfficialChannelsPageProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const themeConfig = THEME_CONFIGS[currentTheme];

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div id="verification" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in duration-300">

      {/* Critical Imposter Warning Banner */}
      <SpotlightCard
        spotlightColor="rgba(245, 158, 11, 0.22)"
        spotlightRadius={520}
        className="group rounded-3xl border-2 border-amber-400/50 hover:border-amber-400/80 bg-gradient-to-r from-red-950/40 via-amber-950/30 to-black p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] hover:shadow-[0_0_70px_rgba(245,158,11,0.35)] transition-all duration-500 ease-out"
      >
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-amber-500 blur-3xl opacity-10 group-hover:opacity-25 transition-opacity duration-700" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Zero-Tolerance Imposter Advisory</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white">
              One & Only Official Leonardo DiCaprio Presence
            </h2>
            <p className="text-sm text-zinc-200 leading-relaxed">
              Neither Leonardo DiCaprio nor his management office ever engages in private unsolicited direct messaging requesting cryptocurrency, private wire transfers, fan club membership fees, or unofficial meet-and-greets. Any account outside this verified list is an imposter.
            </p>
            <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
              <Flag className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Action Required:</strong> Encountered a suspicious account, fake message, or imposter? Forward the screenshot and profile link immediately to our official contact desk: <strong className="text-white select-all">{OFFICIAL_CONTACT_EMAIL}</strong>.
              </span>
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={`mailto:${OFFICIAL_CONTACT_EMAIL}?subject=Official%20Inquiry%20%2F%20Imposter%20Report%20-%20Leonardo%20DiCaprio%20Official&body=Please%20attach%20the%20fake%20profile%20link%20and%20screenshot%20evidence%20here%3A`}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Mail className="h-5 w-5" />
              <span>Contact {OFFICIAL_CONTACT_EMAIL}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </SpotlightCard>

      {/* Official Channels Roster */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-2xl font-bold text-white uppercase tracking-wide">
            Verified Official Channels Registry
          </h2>
          <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4" /> Verified Identity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. TELEGRAM (#1 PRIORITY) */}
          <SpotlightCard
            spotlightColor="rgba(34, 158, 217, 0.35)"
            spotlightRadius={380}
            className="group rounded-2xl border-2 border-[#229ED9]/80 bg-gradient-to-b from-[#229ED9]/15 via-zinc-950 to-zinc-950 p-6 shadow-[0_0_35px_rgba(34,158,217,0.25)] hover:shadow-[0_15px_50px_rgba(34,158,217,0.45)] hover:border-[#229ED9] hover:scale-[1.018] hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            {/* Subtle interactive radiant glow on hover */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#229ED9] blur-3xl opacity-20 group-hover:opacity-45 transition-opacity duration-500" />

            <div className="absolute top-4 right-4 z-10">
              <span className="rounded-full bg-[#229ED9] text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow">
                ★ #1 Official Broadcast
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#229ED9] text-white shadow-[0_0_20px_rgba(34,158,217,0.6)]">
                  <Send className="h-7 w-7 text-white ml-0.5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-xl font-bold text-white">
                    Telegram Official Broadcast
                  </h3>
                  <p className="text-sm font-mono text-[#229ED9] font-bold">
                    {SOCIAL_MEDIA_HANDLES.telegram.handle}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                The flagship live dispatch direct from Leonardo&apos;s communications desk. Real-time dispatches from climate summits, film festival red carpets, behind-the-scenes cinema archives, and the central portal to submit imposter reports.
              </p>

              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Primary imposter & fraud reporting channel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Exclusive field dispatches & production notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Direct VIP concierge routing</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopy(SOCIAL_MEDIA_HANDLES.telegram.handle, 'tg-page')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'tg-page' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Handle</span>
                  </>
                )}
              </button>

              <a
                href={SOCIAL_MEDIA_HANDLES.telegram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#229ED9] hover:bg-[#1f8fc4] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,158,217,0.5)] hover:scale-105"
              >
                <span>Open Telegram Channel</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </SpotlightCard>

          {/* 2. X / TWITTER */}
          <SpotlightCard
            spotlightColor="rgba(255, 255, 255, 0.18)"
            spotlightRadius={380}
            className="group rounded-2xl border border-white/20 hover:border-white/60 bg-gradient-to-b from-white/[0.04] via-zinc-950 to-zinc-950 p-6 shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_45px_rgba(255,255,255,0.14)] hover:scale-[1.018] hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            {/* Subtle interactive radiant glow on hover */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black font-black text-xl shadow-lg">
                    𝕏
                  </div>
                  <div>
                    <h3 className="font-cinzel text-xl font-bold text-white">
                      X (Twitter) Official
                    </h3>
                    <p className="text-sm font-mono text-zinc-300 font-bold">
                      {SOCIAL_MEDIA_HANDLES.x.handle}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 text-white px-3 py-1 text-xs font-mono">
                  16.7M+
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Global announcements on United Nations climate negotiations, Indigenous rights advocacy, Earth Alliance releases, and major motion picture debuts.
              </p>

              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Blue verified public policy record</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Global environmental policy broadcasts</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopy(SOCIAL_MEDIA_HANDLES.x.handle, 'x-page')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'x-page' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Handle</span>
                  </>
                )}
              </button>

              <a
                href={SOCIAL_MEDIA_HANDLES.x.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span>Visit X Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </SpotlightCard>

          {/* 3. INSTAGRAM */}
          <SpotlightCard
            spotlightColor="rgba(228, 64, 95, 0.32)"
            spotlightRadius={380}
            className="group rounded-2xl border border-pink-500/30 hover:border-pink-500/70 bg-gradient-to-b from-[#E4405F]/10 via-zinc-950 to-zinc-950 p-6 shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_50px_rgba(228,64,95,0.38)] hover:scale-[1.018] hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            {/* Subtle interactive radiant glow on hover */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] blur-3xl opacity-10 group-hover:opacity-35 transition-opacity duration-500" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xl shadow-lg">
                    <Globe className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-xl font-bold text-white">
                      Instagram Official
                    </h3>
                    <p className="text-sm font-mono text-pink-400 font-bold">
                      {SOCIAL_MEDIA_HANDLES.instagram.handle}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E4405F]/20 text-pink-300 px-3 py-1 text-xs font-mono">
                  58.6M+
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Visual photo-journalism highlighting endangered species, rewilding initiatives, rainforest conservation projects, and cinematic retrospectives.
              </p>

              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Verified Meta blue badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Field photography & wildlife protection</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopy(SOCIAL_MEDIA_HANDLES.instagram.handle, 'ig-page')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'ig-page' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Handle</span>
                  </>
                )}
              </button>

              <a
                href={SOCIAL_MEDIA_HANDLES.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-md"
              >
                <span>Visit Instagram</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </SpotlightCard>

          {/* 4. FACEBOOK */}
          <SpotlightCard
            spotlightColor="rgba(24, 119, 242, 0.32)"
            spotlightRadius={380}
            className="group rounded-2xl border border-blue-500/30 hover:border-blue-500/70 bg-gradient-to-b from-[#1877F2]/10 via-zinc-950 to-zinc-950 p-6 shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_50px_rgba(24,119,242,0.38)] hover:scale-[1.018] hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            {/* Subtle interactive radiant glow on hover */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#1877F2] blur-3xl opacity-10 group-hover:opacity-35 transition-opacity duration-500" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877F2] text-white font-bold text-xl shadow-lg">
                    f
                  </div>
                  <div>
                    <h3 className="font-cinzel text-xl font-bold text-white">
                      Facebook Official
                    </h3>
                    <p className="text-sm font-mono text-blue-400 font-bold">
                      {SOCIAL_MEDIA_HANDLES.facebook.handle}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#1877F2]/20 text-blue-300 px-3 py-1 text-xs font-mono">
                  19.2M+
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Archival documentary releases, full-length environmental speeches, and retrospective cinema anniversary celebrations.
              </p>

              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Verified Meta blue verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Long-form documentary features</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopy(SOCIAL_MEDIA_HANDLES.facebook.handle, 'fb-page')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'fb-page' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Handle</span>
                  </>
                )}
              </button>

              <a
                href={SOCIAL_MEDIA_HANDLES.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-md"
              >
                <span>Visit Facebook</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Guide: How to Report Imposters */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-amber-400" />
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase">
            How to Identify & Report Imposters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group space-y-2 border-l-2 border-amber-400/50 pl-4 py-3 pr-3 rounded-r-xl transition-all duration-300 hover:bg-amber-400/[0.04] hover:shadow-[0_4px_25px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:translate-x-1">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">Step 01</span>
            <h4 className="font-cinzel text-base font-bold text-white group-hover:text-amber-300 transition-colors">Capture the Evidence</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Take clear screenshots of the fake account profile, username/handle, direct messages, or payment requests sent to you.
            </p>
          </div>

          <div className="group space-y-2 border-l-2 border-amber-400/60 pl-4 py-3 pr-3 rounded-r-xl transition-all duration-300 hover:bg-amber-400/[0.04] hover:shadow-[0_4px_25px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:translate-x-1">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">Step 02</span>
            <h4 className="font-cinzel text-base font-bold text-white group-hover:text-amber-300 transition-colors">Forward to Official Contact Desk</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Submit directly to our official contact desk at <strong className="text-white select-all">{OFFICIAL_CONTACT_EMAIL}</strong>, and transmit all evidence for immediate verification.
            </p>
          </div>

          <div className="group space-y-2 border-l-2 border-emerald-400/60 pl-4 py-3 pr-3 rounded-r-xl transition-all duration-300 hover:bg-emerald-400/[0.04] hover:shadow-[0_4px_25px_rgba(52,211,153,0.15)] hover:border-emerald-400 hover:translate-x-1">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Step 03</span>
            <h4 className="font-cinzel text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Immediate Legal Takedown</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our legal and trust & safety representatives will coordinate directly with the relevant platform hosts to remove the imposter profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
