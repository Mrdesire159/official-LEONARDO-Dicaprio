import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Film,
  Award,
  CreditCard,
  Globe,
  Archive,
  ChevronRight,
  Maximize2,
  Quote,
  Star,
  CheckCircle2,
  Layers,
  HeartHandshake,
  Send,
  ExternalLink,
  Bot,
  MessageSquare,
  Compass,
  User,
  Image,
  ShieldAlert
} from 'lucide-react';
import { LuxuryTheme, PhotoAsset } from '../types';
import { THEME_CONFIGS, SOCIAL_MEDIA_HANDLES } from '../data/diCaprioData';

interface MajorRoleItem {
  id: string;
  character: string;
  project: string;
  year: string;
  director: string;
  category: 'oscar' | 'auteur' | 'leadership';
  badge: string;
  tagline: string;
  narrative: string;
  signatureLine: string;
  accentColor: string;
}

const MAJOR_ROLES: MajorRoleItem[] = [
  {
    id: 'hugh-glass',
    character: 'Hugh Glass',
    project: 'The Revenant',
    year: '2015',
    director: 'Alejandro G. Iñárritu',
    category: 'oscar',
    badge: 'Academy Award Winner — Best Actor',
    tagline: 'Primordial Endurance & Unyielding Will',
    narrative:
      'DiCaprio’s career-defining physical and emotional triumph. In the sub-zero wilderness of 1823 Montana, he endured freezing glacial rivers, raw bison liver, and grueling sub-arctic filming to portray real-life frontiersman Hugh Glass. After surviving a brutal grizzly bear attack and betrayal, Glass crawls hundreds of miles powered solely by the will to live and seek retribution.',
    signatureLine: 'As long as you can still grab a breath, you fight. You breathe... keep breathing.',
    accentColor: '#f59e0b',
  },
  {
    id: 'jack-dawson',
    character: 'Jack Dawson',
    project: 'Titanic',
    year: '1997',
    director: 'James Cameron',
    category: 'oscar',
    badge: '11 Academy Awards · Generational Icon',
    tagline: 'Bohemian Freedom & Tragic Transcendence',
    narrative:
      'The role that catapulted 22-year-old DiCaprio into the stratosphere of worldwide cultural history. Bringing effortless bohemian charm, emotional vulnerability, and incandescent nobility to the third-class passenger who wins passage on the doomed liner, Jack’s romance with Rose touched billions and redefined cinema romance for all time.',
    signatureLine: 'To making each day count. I figure life’s a gift and I don’t intend on wasting it.',
    accentColor: '#38bdf8',
  },
  {
    id: 'dom-cobb',
    character: 'Dom Cobb',
    project: 'Inception',
    year: '2010',
    director: 'Christopher Nolan',
    category: 'auteur',
    badge: '4 Academy Awards · Mind-Bending Sci-Fi',
    tagline: 'Subconscious Architect & Haunting Guilt',
    narrative:
      'DiCaprio plays the haunted master extractor who infiltrates corporate subconscious minds while asleep. Blending razor-sharp mathematical heist precision with profound, heartbreaking sorrow over the loss of his wife Mal, his performance anchored Nolan’s labyrinthine multi-level dreams with raw emotional reality.',
    signatureLine: 'An idea is like a virus. Resilient. Highly contagious. And the smallest seed of an idea can grow.',
    accentColor: '#a855f7',
  },
  {
    id: 'jordan-belfort',
    character: 'Jordan Belfort',
    project: 'The Wolf of Wall Street',
    year: '2013',
    director: 'Martin Scorsese',
    category: 'auteur',
    badge: 'Golden Globe Winner · Oscar Nominee',
    tagline: 'Uninhibited Excess & Manic Satire',
    narrative:
      'A volcanic tour de force of physical comedy, theatrical mania, and moral decay. DiCaprio’s fearless performance laid bare the intoxicating ecstasy and devastating ruin of Wall Street broker hedonism, earning him the Golden Globe and cementing his legendary synergy with Martin Scorsese.',
    signatureLine: 'The only thing standing between you and your goal is the bullshit story you keep telling yourself as to why you can’t achieve it.',
    accentColor: '#eab308',
  },
  {
    id: 'jay-gatsby',
    character: 'Jay Gatsby',
    project: 'The Great Gatsby',
    year: '2013',
    director: 'Baz Luhrmann',
    category: 'auteur',
    badge: '2 Academy Awards · Jazz Age Pantheon',
    tagline: 'The Mythic Romantic & The Green Light',
    narrative:
      'Embodying F. Scott Fitzgerald’s most legendary creation, DiCaprio gave Gatsby a dazzling smile of rare assurance, masked over an agonizing inner fragility. His Gatsby is an American myth—an enigmatic dreamer engineering grand Long Island spectacles solely to recapture an unreachable past.',
    signatureLine: 'Can’t repeat the past? Why of course you can, old sport!',
    accentColor: '#fbbf24',
  },
  {
    id: 'rick-dalton',
    character: 'Rick Dalton',
    project: 'Once Upon a Time in Hollywood',
    year: '2019',
    director: 'Quentin Tarantino',
    category: 'auteur',
    badge: 'Academy Award Nominee · BAFTA Nominee',
    tagline: 'Fragile Stardom & Nostalgic Redemption',
    narrative:
      'Tarantino’s tender, hilarious, and emotionally searing tribute to a 1969 television cowboy grappling with aging, alcohol, and the twilight of classic Hollywood. DiCaprio’s iconic trailer breakdown scene was fully improvised on set, creating an unforgettable portrait of an actor fighting for his dignity.',
    signatureLine: 'Eight years of doing stunts and blowing things up... that’s what I call a career.',
    accentColor: '#f97316',
  },
  {
    id: 'calvin-candie',
    character: 'Calvin Candie',
    project: 'Django Unchained',
    year: '2012',
    director: 'Quentin Tarantino',
    category: 'auteur',
    badge: 'National Board of Review Winner',
    tagline: 'Charismatic Malevolence & Visceral Method',
    narrative:
      'In a shocking departure from heroic roles, DiCaprio plunged into the role of the sadistic plantation lord Calvin Candie. During the dinner confrontation scene, he accidentally shattered a crystal glass and cut his hand deeply, continuing the monologue with blood dripping down his fingers without breaking character.',
    signatureLine: 'Gentlemen, you had my curiosity. But now you have my attention.',
    accentColor: '#ef4444',
  },
  {
    id: 'frank-abagnale',
    character: 'Frank Abagnale Jr.',
    project: 'Catch Me If You Can',
    year: '2002',
    director: 'Steven Spielberg',
    category: 'auteur',
    badge: 'Golden Globe Nominee · Spielberg Collaboration',
    tagline: 'Prodigal Charisma & The Art of Deception',
    narrative:
      'DiCaprio brought buoyant youth, dazzling charm, and quiet melancholy to the true story of a teenager who successfully passed bad checks worth millions while posing as an airline co-pilot, pediatrician, and county attorney, pursued by Tom Hanks’ dogged FBI agent.',
    signatureLine: 'Two little mice fell in a bucket of cream. The first mouse quickly gave up and drowned. The second mouse wouldn’t quit.',
    accentColor: '#34d399',
  },
  {
    id: 'howard-hughes',
    character: 'Howard Hughes',
    project: 'The Aviator',
    year: '2004',
    director: 'Martin Scorsese',
    category: 'oscar',
    badge: 'Golden Globe Winner · 5 Academy Awards',
    tagline: 'Audacious Aviation Titan & Troubled Genius',
    narrative:
      'DiCaprio spent months researching obsessive-compulsive disorder and Hughes’ archival transcripts to capture the soaring ambition and agonizing psychological unraveling of the billionaire aviation pioneer, film producer, and eccentric recluse.',
    signatureLine: 'The way of the future. The way of the future. The way of the future.',
    accentColor: '#06b6d4',
  },
  {
    id: 'billy-costigan',
    character: 'Billy Costigan',
    project: 'The Departed',
    year: '2006',
    director: 'Martin Scorsese',
    category: 'oscar',
    badge: 'Academy Award Best Picture Winner',
    tagline: 'Paranoid Undercover Life on the Razor Edge',
    narrative:
      'Playing an undercover state police trooper embedded deep inside Frank Costello’s Irish mob syndicate, DiCaprio portrayed a man suffocating from paranoia, sleeplessness, and panic attacks while desperately trying to preserve his soul.',
    signatureLine: 'I’m a cop, not a criminal. Just get me out of here!',
    accentColor: '#6366f1',
  },
  {
    id: 'earth-alliance',
    character: 'UN Messenger of Peace',
    project: 'Earth Alliance & Rewild',
    year: '1998 — Present',
    director: 'Global Environmental Statesmanship',
    category: 'leadership',
    badge: '$100M+ Direct Grants · 50+ Global Ecosystems',
    tagline: 'Planetary Defense & Indigenous Rights',
    narrative:
      'Beyond cinema, Leonardo serves on the frontlines of the planetary ecological emergency. Founding Earth Alliance alongside Laurene Powell Jobs, he has directed over $100 Million to wildlife protection, ocean conservation, Amazon rainforest defense, and indigenous land protection across six continents.',
    signatureLine: 'Clean air, water, and a livable climate are inalienable human rights. And solving this crisis is not a question of politics—it is our moral obligation.',
    accentColor: '#10b981',
  },
  {
    id: 'producer',
    character: 'Visionary Producer',
    project: 'Appian Way Productions',
    year: '2001 — Present',
    director: 'Independent Cinema & Groundbreaking Documentaries',
    category: 'leadership',
    badge: 'Executive Producer · Landmark Documentaries',
    tagline: 'Auteur Storytelling & Investigative Truth',
    narrative:
      'Through his production company Appian Way, DiCaprio has championed critical environmental documentaries including Before the Flood, The 11th Hour, Sea of Shadows, and Cowspiracy, utilizing the power of world media to educate hundreds of millions on ecological survival.',
    signatureLine: 'Cinema has the singular power to awaken consciousness where words alone cannot.',
    accentColor: '#e11d48',
  },
];

interface HeroOrbitalProps {
  currentTheme: LuxuryTheme;
  reducedMotion?: boolean;
  activeHeroPhoto: PhotoAsset;
  onSelectPhotoModal: (photo: PhotoAsset) => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenSocialBall?: () => void;
}

export function HeroOrbital({
  currentTheme,
  activeHeroPhoto,
  onSelectPhotoModal,
  onNavigateSection,
}: HeroOrbitalProps) {
  // Balanced stationary layout for pods
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [hoveredPod, setHoveredPod] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeRoleCategory, setActiveRoleCategory] = useState<'all' | 'oscar' | 'auteur' | 'leadership'>('all');
  const [selectedRole, setSelectedRole] = useState<MajorRoleItem>(MAJOR_ROLES[0]);
  const dragStartX = useRef(0);

  const themeConfig = THEME_CONFIGS[currentTheme];

  const filteredRoles = activeRoleCategory === 'all'
    ? MAJOR_ROLES
    : MAJOR_ROLES.filter((r) => r.category === activeRoleCategory);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobileScreen) return; // Don't drag-rotate on phones
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobileScreen) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = e.clientX;
    setOrbitAngle((prev) => (prev + dx * 0.12) % 360);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 5 synchronized orbital pods matching the updated site sections
  const orbitalPods = [
    {
      id: 'biography',
      title: 'Biography',
      subtitle: 'Human Journey & Planetary Leadership',
      tag: 'Earth Alliance',
      icon: User,
      angleOffset: 0,
      radius: 260,
      color: '#10b981',
      target: '#biography',
    },
    {
      id: 'film-reel',
      title: 'Film Reel',
      subtitle: '30+ Years of Masterpieces & Honors',
      tag: 'Cerebral Cinema',
      icon: Film,
      angleOffset: 72,
      radius: 275,
      color: '#f59e0b',
      target: '#film-reel',
    },
    {
      id: 'vip-guild',
      title: 'VIP Guild',
      subtitle: 'Gold, Silver & Platinum Memberships',
      tag: 'VIP Sanctuary',
      icon: CreditCard,
      angleOffset: 144,
      radius: 260,
      color: '#38bdf8',
      target: '#vip-guild',
    },
    {
      id: 'gallery',
      title: 'Portraits',
      subtitle: 'High-Res Cinematic Portrait Salon',
      tag: 'Portrait Salon',
      icon: Image,
      angleOffset: 216,
      radius: 280,
      color: '#eab308',
      target: '#gallery',
    },
    {
      id: 'verification',
      title: 'Verification & Warning',
      subtitle: 'Zero-Tolerance Imposter Advisory',
      tag: 'Official Security',
      icon: ShieldAlert,
      angleOffset: 288,
      radius: 265,
      color: '#f43f5e',
      target: '#verification',
    },
  ];

  return (
    <section
      id="multiverse"
      className="relative min-h-[92vh] w-full overflow-hidden pt-28 pb-16 flex flex-col justify-center items-center"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Dynamic Ambient Background Illumination */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full blur-[140px] transition-all duration-700 opacity-40"
        style={{ backgroundColor: themeConfig.accent }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#030305_75%)]" />

      {/* Hero Header Typography */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 backdrop-blur-md mb-6">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-200">
            WELCOME TO THE OFFICIAL AND ONLY WEBSITE OF LEONARDO DICAPRIO
          </span>
        </div>

        <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-none drop-shadow-2xl">
          LEONARDO <span className={`bg-gradient-to-r ${themeConfig.gradientText} bg-clip-text text-transparent`}>DICAPRIO</span>
        </h1>

        <div className="mx-auto mt-5 max-w-3xl space-y-3 font-light">
          <p className="text-base sm:text-lg text-amber-100 font-serif italic">
            "Three decades of uncompromising screen transformation, psychological fearlessness, and frontline planetary leadership."
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            From bohemian romance in <strong className="text-amber-300 font-semibold">Titanic</strong> to grueling wilderness endurance in <strong className="text-amber-300 font-semibold">The Revenant</strong>, cerebral dream espionage in <strong className="text-amber-300 font-semibold">Inception</strong>, and intoxicating ambition in <strong className="text-amber-300 font-semibold">The Wolf of Wall Street</strong>—explore the defining characters of modern motion picture history and his real-world crusade mobilizing over $100M+ as United Nations Messenger of Peace.
          </p>
        </div>

        {/* All 4 Official Social Media Accounts Displayed at the Same Time — Telegram #1 */}
        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {/* #1 Telegram Channel (Featured #1) */}
          <a
            href={SOCIAL_MEDIA_HANDLES.telegram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-xl border border-[#229ED9]/70 bg-[#229ED9]/15 px-3.5 py-2 text-xs text-white hover:border-[#229ED9] hover:bg-[#229ED9]/25 transition-all shadow-[0_0_20px_rgba(34,158,217,0.3)] backdrop-blur-md"
            title="Join Leonardo DiCaprio on Telegram (@leonardodicap1974) — #1 Official Channel"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#229ED9] text-white shadow-sm">
              <Send className="h-3 w-3" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-amber-400 text-black px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider">
                #1
              </span>
              <span className="font-mono text-xs font-bold text-white">@leonardodicap1974</span>
            </div>
            <ExternalLink className="h-3 w-3 text-cyan-300 group-hover:text-white transition-colors" />
          </a>

          {/* Official X (Twitter) Account */}
          <a
            href={SOCIAL_MEDIA_HANDLES.x.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-xl border border-white/30 bg-zinc-950/90 px-3.5 py-2 text-xs text-zinc-200 hover:text-white hover:border-white hover:bg-white/10 transition-all shadow-lg backdrop-blur-md"
            title="Visit Leonardo DiCaprio on X (@LeoDiCaprio)"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-black border border-white/30 text-white shadow-sm">
              <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>
            <span className="font-mono text-xs font-semibold text-white">@LeoDiCaprio</span>
            <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-white transition-colors" />
          </a>

          {/* Instagram */}
          <a
            href={SOCIAL_MEDIA_HANDLES.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-xl border border-[#E4405F]/40 bg-zinc-950/80 px-3.5 py-2 text-xs text-zinc-200 hover:text-white hover:border-[#E4405F] hover:bg-[#E4405F]/15 transition-all shadow-lg backdrop-blur-md"
            title="Visit Leonardo DiCaprio on Instagram (@leonardodicaprio)"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-[10px] font-black text-white shadow-sm">
              IG
            </span>
            <span className="font-mono text-xs font-semibold text-white">@leonardodicaprio</span>
            <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-white transition-colors" />
          </a>

          {/* Facebook */}
          <a
            href={SOCIAL_MEDIA_HANDLES.facebook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-xl border border-[#1877F2]/40 bg-zinc-950/80 px-3.5 py-2 text-xs text-zinc-200 hover:text-white hover:border-[#1877F2] hover:bg-[#1877F2]/15 transition-all shadow-lg backdrop-blur-md"
            title="Visit Leonardo DiCaprio on Facebook (@LeonardoDiCaprio)"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1877F2] font-black text-xs text-white shadow-sm">
              f
            </span>
            <span className="font-mono text-xs font-semibold text-white">@LeonardoDiCaprio</span>
            <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-white transition-colors" />
          </a>

        </div>
      </div>

      {/* CENTRAL CORE: LEO PORTRAIT */}
      <div className="relative z-20 mt-8 flex flex-col items-center">
        {/* Central Portrait Container */}
        <div
          className="relative h-44 w-44 sm:h-56 sm:w-56 rounded-full p-1.5 transition-transform duration-700 ease-out group shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${themeConfig.accent}, #ffffff33, ${themeConfig.accent})`,
            boxShadow: `0 0 50px -10px ${themeConfig.accent}88`,
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-black/80 bg-zinc-900">
            <img
              src={activeHeroPhoto.url}
              alt={activeHeroPhoto.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = activeHeroPhoto.fallbackUrl;
              }}
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
            />

            {/* Holographic light sweep */}
            <div className="pointer-events-none absolute inset-0 hologram-shimmer opacity-40" />

            {/* Quick Inspect Button on Hover/Tap */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPhotoModal(activeHeroPhoto);
                window.dispatchEvent(
                  new CustomEvent('open-photo-modal', { detail: activeHeroPhoto })
                );
              }}
              title="Inspect High-Res Portrait"
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-black/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                <Maximize2 className="h-3.5 w-3.5 text-amber-300" />
                <span>Inspect Portrait</span>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* FEATURE PODS (Mobile Grid) */}
      <div className="w-full max-w-4xl px-4 mt-10 lg:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {orbitalPods.map((pod) => {
            const Icon = pod.icon;
            return (
              <button
                key={pod.id}
                onClick={() => onNavigateSection(pod.target)}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-white/15 bg-zinc-950/90 text-left transition-all active:scale-98 shadow-xl"
                style={{
                  borderLeftColor: pod.color,
                  borderLeftWidth: '4px',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                      backgroundColor: `${pod.color}22`,
                      borderColor: `${pod.color}66`,
                      color: pod.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-sm font-bold text-white">
                      {pod.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400">{pod.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP 3D SYNCHRONIZED ORBITAL STAGE (Desktop Only) */}
      <div
        className="hidden lg:flex relative mt-4 h-[520px] w-full max-w-5xl select-none items-center justify-center cursor-grab active:cursor-grabbing perspective-1500"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* 3D Elliptical Orbital Ring Track */}
        <div
          className="pointer-events-none absolute inset-0 m-auto h-[480px] w-[480px] rounded-full border border-white/10 opacity-60"
          style={{
            transform: 'scaleY(0.72) rotateZ(-12deg)',
            boxShadow: `inset 0 0 40px ${themeConfig.accent}15`,
          }}
        />

        {/* Orbiting Feature Pods */}
        {orbitalPods.map((pod) => {
          const totalAngle = (orbitAngle + pod.angleOffset) * (Math.PI / 180);
          const scaleY = 0.68;
          const x = Math.cos(totalAngle) * pod.radius;
          const y = Math.sin(totalAngle) * (pod.radius * scaleY);
          const zDepth = (Math.sin(totalAngle) + 1) / 2;
          const scale = 0.82 + zDepth * 0.32;
          const zIndex = Math.round(zDepth * 30);
          const Icon = pod.icon;
          const isHovered = hoveredPod === pod.id;

          return (
            <div
              key={pod.id}
              className="absolute transition-transform duration-100 ease-linear cursor-pointer"
              style={{
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                zIndex,
              }}
              onMouseEnter={() => setHoveredPod(pod.id)}
              onMouseLeave={() => setHoveredPod(null)}
              onClick={() => onNavigateSection(pod.target)}
            >
              <div
                className={`group relative flex items-center gap-3 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
                  isHovered
                    ? 'border-white/50 bg-zinc-900/95 ring-2 ring-white/30 scale-105'
                    : 'border-white/15 bg-zinc-950/80 hover:border-white/30'
                }`}
                style={{
                  boxShadow: isHovered ? `0 0 30px ${pod.color}66` : '0 10px 30px rgba(0,0,0,0.6)',
                }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${pod.color}22`,
                    borderColor: `${pod.color}66`,
                    color: pod.color,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex flex-col pr-2 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: pod.color }}>
                      {pod.tag}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[9px] text-zinc-400">Click to enter</span>
                  </div>
                  <h3 className="font-cinzel text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                    {pod.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">{pod.subtitle}</p>
                </div>

                <ChevronRight className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* MAJOR ROLES BREAKDOWN: INTERACTIVE PANTHEON EXPLORER */}
      <div className="relative z-20 w-full max-w-6xl px-4 mt-16 mb-8">
        <div className="rounded-3xl border border-white/20 bg-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
                <Film className="h-4 w-4" />
                <span>The Definitive Roles &amp; Legacy Breakdown</span>
              </div>
              <h2 className="font-cinzel text-2xl sm:text-4xl font-black text-white mt-1">
                The Characters &amp; Roles <span className={`bg-gradient-to-r ${themeConfig.gradientText} bg-clip-text text-transparent`}>He Inhabited</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl font-light">
                Select any iconic role below to explore the character psychology, auteur direction, historic awards, and unforgettable dialogue.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
              {[
                { id: 'all', label: 'All Roles (12)' },
                { id: 'oscar', label: 'Oscar & Laurels' },
                { id: 'auteur', label: 'Auteur Classics' },
                { id: 'leadership', label: 'UN & Activism' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleCategory(tab.id as 'all' | 'oscar' | 'auteur' | 'leadership')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    activeRoleCategory === tab.id
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Showcase: Role Navigation Grid + Rich Detailed Breakdown Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Role Navigation Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredRoles.map((role) => {
                const isSelected = selectedRole.id === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'border-amber-400/80 bg-white/10 ring-2 ring-amber-400/30 shadow-lg scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                        <span>{role.year}</span>
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: role.accentColor }}
                        />
                      </div>
                      <h4 className="font-cinzel text-xs font-bold text-white group-hover:text-amber-200 line-clamp-1">
                        {role.character}
                      </h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                        {role.project}
                      </p>
                    </div>
                    <span
                      className="mt-2 text-[9px] font-bold uppercase tracking-wider line-clamp-1"
                      style={{ color: role.accentColor }}
                    >
                      {role.tagline}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Rich Detailed Breakdown Card */}
            <div className="lg:col-span-6">
              <div
                className="rounded-3xl border p-6 sm:p-7 relative overflow-hidden transition-all duration-300"
                style={{
                  borderColor: `${selectedRole.accentColor}60`,
                  background: `linear-gradient(135deg, ${selectedRole.accentColor}12 0%, rgba(9, 9, 11, 0.95) 100%)`,
                  boxShadow: `0 15px 40px ${selectedRole.accentColor}25`,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold"
                    style={{
                      borderColor: `${selectedRole.accentColor}50`,
                      backgroundColor: `${selectedRole.accentColor}20`,
                      color: selectedRole.accentColor,
                    }}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {selectedRole.badge}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    {selectedRole.year} · {selectedRole.director}
                  </span>
                </div>

                <h3 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white">
                  {selectedRole.character}
                </h3>
                <p
                  className="font-mono text-xs uppercase tracking-wider font-semibold mt-1"
                  style={{ color: selectedRole.accentColor }}
                >
                  {selectedRole.project} — {selectedRole.tagline}
                </p>

                <p className="text-xs sm:text-sm text-zinc-200 mt-4 leading-relaxed font-light">
                  {selectedRole.narrative}
                </p>

                {/* Signature Dialogue Quote */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                    <Quote className="h-3.5 w-3.5" />
                    <span>Signature Ethos / Quote:</span>
                  </div>
                  <p className="italic text-xs sm:text-sm text-zinc-100 font-serif">
                    "{selectedRole.signatureLine}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orbit Footer Quick-Jump Prompts */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-4 px-4 text-xs">
        <button
          onClick={() => onNavigateSection('#vip-store')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-3 font-bold text-black shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          style={{ boxShadow: themeConfig.neonShadow }}
        >
          <CreditCard className="h-4 w-4" />
          <span>Gold VIP ($10K) · Silver ($5K) · 24K Sovereign ($25K)</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
