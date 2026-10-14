import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  X,
  ChevronRight,
  Film,
  Award,
  CreditCard,
  Globe,
  User,
  Image as ImageIcon,
  Minimize2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  VolumeX,
  PhoneCall,
  ExternalLink,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { LuxuryTheme } from '../types';
import { THEME_CONFIGS, SOCIAL_MEDIA_HANDLES } from '../data/diCaprioData';

export interface ActionDefinition {
  id: string;
  label: string;
  icon: typeof Film;
  target: 'scroll' | 'modal';
  selector?: string;
  modalKey?: 'social_ball' | 'checkout' | 'profile';
  description: string;
}

export const DIRECTORY_ACTIONS: Record<string, ActionDefinition> = {
  GO_FILMS: {
    id: 'GO_FILMS',
    label: 'Film Reel Timeline',
    icon: Film,
    target: 'scroll',
    selector: '#film-reel',
    description: '35mm celluloid timeline of iconic roles from Titanic to Killers of the Flower Moon',
  },
  GO_VIP: {
    id: 'GO_VIP',
    label: 'VIP Meet & Greet Store',
    icon: CreditCard,
    target: 'scroll',
    selector: '#vip-store',
    description: 'Reserve physical metal cards ($25k Sovereign 24K Gold Extended Encounter, $10k Gold VIP, $5k Silver Gala)',
  },
  GO_AWARDS: {
    id: 'GO_AWARDS',
    label: 'Honors & Academy Awards',
    icon: Award,
    target: 'scroll',
    selector: '#awards',
    description: 'Best Actor Oscar win, 7 Academy nominations, 3 Golden Globes, BAFTA',
  },
  GO_BIO: {
    id: 'GO_BIO',
    label: 'Life & Career Biography',
    icon: User,
    target: 'scroll',
    selector: '#biography',
    description: 'Early prodigy, Scorsese partnership, and global climate conservation',
  },
  GO_GALLERY: {
    id: 'GO_GALLERY',
    label: 'Archival Portrait Gallery',
    icon: ImageIcon,
    target: 'scroll',
    selector: '#gallery',
    description: 'Curated archival master portraits from Cannes, premieres, and private collections',
  },
  GO_TESTIMONIALS: {
    id: 'GO_TESTIMONIALS',
    label: 'Laurels & Social Proof',
    icon: ShieldCheck,
    target: 'scroll',
    selector: '#testimonials',
    description: 'Verified collector testimonials, authenticity provenance, and prestige reviews',
  },
  OPEN_SOCIAL_BALL: {
    id: 'OPEN_SOCIAL_BALL',
    label: '3D Celestial Social Media Ball',
    icon: Globe,
    target: 'modal',
    modalKey: 'social_ball',
    description: 'Simultaneous 3D media sphere of official Telegram (#1), X (@LeoDiCaprio), Instagram, and Facebook',
  },
  OPEN_CHECKOUT: {
    id: 'OPEN_CHECKOUT',
    label: 'VIP Reservation Checkout',
    icon: CreditCard,
    target: 'modal',
    modalKey: 'checkout',
    description: 'Complete pass bookings and access pass credentials',
  },
  OPEN_PROFILE: {
    id: 'OPEN_PROFILE',
    label: 'VIP Pass Vault & Profile',
    icon: User,
    target: 'modal',
    modalKey: 'profile',
    description: 'View authenticated VIP passes, attendee order history & status',
  },
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actions?: string[];
  readStatus?: 'sent' | 'delivered' | 'read';
}

interface LiveChatAgentProps {
  currentTheme: LuxuryTheme;
  onNavigateSection: (selector: string) => void;
  onOpenSocialBall: () => void;
  onOpenCheckout: () => void;
  onOpenProfile: () => void;
}

// Sophisticated luxury audio chime using Web Audio API
function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Gracefully ignore audio failures if blocked by browser policy
  }
}

export function LiveChatAgent({
  currentTheme,
  onNavigateSection,
  onOpenSocialBall,
  onOpenCheckout,
  onOpenProfile,
}: LiveChatAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'direct'>('chat');
  const [showProactiveGreeting, setShowProactiveGreeting] = useState(false);
  const [hasDismissedProactive, setHasDismissedProactive] = useState(false);

  const themeConfig = THEME_CONFIGS[currentTheme];

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-agent',
    sender: 'agent',
    text: `Good day and welcome! My name is **Claire Laurent**, Senior VIP Guest Relations Host for Leonardo DiCaprio's Official Experience.\n\nWhether you wish to arrange an exclusive **VIP Meet & Greet pass**, finalize order approval via our **priority Telegram desk**, or explore Leonardo's legendary cinema archives, I am here live to assist you personally. How may I be of service today?`,
    timestamp: 'Just now',
    actions: ['GO_VIP', 'OPEN_SOCIAL_BALL', 'GO_FILMS', 'GO_AWARDS'],
    readStatus: 'read',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Proactive greeting popover after 3.5 seconds if chat is closed
  useEffect(() => {
    if (hasDismissedProactive || isOpen) return;
    const timer = setTimeout(() => {
      setShowProactiveGreeting(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [hasDismissedProactive, isOpen]);

  // Listen for open events (support both open-live-chat and open-ask-me-concierge)
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setShowProactiveGreeting(false);
    };
    window.addEventListener('open-live-chat', handleOpen);
    window.addEventListener('open-ask-me-concierge', handleOpen);

    return () => {
      window.removeEventListener('open-live-chat', handleOpen);
      window.removeEventListener('open-ask-me-concierge', handleOpen);
    };
  }, []);

  // Scroll to bottom when messages update or typing starts
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setShowProactiveGreeting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, activeTab]);

  const executeAction = (actionKey: string) => {
    const def = DIRECTORY_ACTIONS[actionKey];
    if (!def) return;

    if (def.target === 'scroll' && def.selector) {
      onNavigateSection(def.selector);
    } else if (def.target === 'modal') {
      if (def.modalKey === 'social_ball') onOpenSocialBall();
      else if (def.modalKey === 'checkout') onOpenCheckout();
      else if (def.modalKey === 'profile') onOpenProfile();
    }
  };

  // Parse [ACTION:KEY] tokens from response
  const parseResponseActions = (rawText: string): { cleanText: string; actions: string[] } => {
    const actionRegex = /\[ACTION:([A-Z_]+)\]/g;
    const actionsFound: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = actionRegex.exec(rawText)) !== null) {
      if (DIRECTORY_ACTIONS[match[1]] && !actionsFound.includes(match[1])) {
        actionsFound.push(match[1]);
      }
    }

    const cleanText = rawText.replace(actionRegex, '').trim();
    return { cleanText, actions: actionsFound };
  };

  const handleSendMessage = async (userText: string) => {
    const query = userText.trim();
    if (!query || isTyping) return;

    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readStatus: 'delivered',
    };

    setMessages((prev) => [...prev, userMsg]);

    // Natural human pause before Claire starts typing
    setTimeout(() => {
      setIsTyping(true);
    }, 350);

    const lower = query.toLowerCase();
    const isDirectIntent =
      lower.includes('direct me') ||
      lower.includes('take me to') ||
      lower.includes('go to') ||
      lower.includes('bring me to');

    try {
      const chatHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: chatHistory,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const rawReply = data.reply || '';
      const { cleanText, actions } = parseResponseActions(rawReply);

      // Realistic typing duration based on response length for human feel (min 700ms, max 1400ms)
      const simulatedTypingDelay = Math.min(Math.max(cleanText.length * 8, 700), 1400);

      setTimeout(() => {
        setIsTyping(false);

        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: cleanText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: actions.length > 0 ? actions : undefined,
          readStatus: 'read',
        };

        setMessages((prev) => [...prev, agentMsg]);

        if (soundEnabled) {
          playChimeSound();
        }

        if (isDirectIntent && actions.length > 0) {
          setTimeout(() => {
            executeAction(actions[0]);
          }, 800);
        }
      }, simulatedTypingDelay);
    } catch {
      // Warm, human client-side fallback if network or API key unavailable
      setTimeout(() => {
        setIsTyping(false);

        let fallbackText = `I am delighted to assist you on behalf of Leonardo's VIP office. I can walk you through our VIP Meet & Greet cards, escort you to our 35mm film reel timeline, or connect you directly with our priority Telegram desk.`;
        const fallbackActions: string[] = [];

        if (lower.includes('human') || lower.includes('real') || lower.includes('bot')) {
          fallbackText = `Yes, I am Claire Laurent, Senior VIP Host for Leonardo DiCaprio's Official Experience. I'm right here with you live to ensure your itinerary and pass reservations are handled with the highest level of care.`;
          fallbackActions.push('GO_VIP', 'OPEN_SOCIAL_BALL');
        } else if (lower.includes('film') || lower.includes('movie') || lower.includes('titanic') || lower.includes('inception')) {
          fallbackText = `Leonardo's cinematic journey is unparalleled—from Titanic and Inception to The Revenant and Killers of the Flower Moon. Allow me to walk you through our interactive 35mm Celluloid timeline!`;
          fallbackActions.push('GO_FILMS');
        } else if (
          lower.includes('vip') ||
          lower.includes('pass') ||
          lower.includes('ticket') ||
          lower.includes('meet') ||
          lower.includes('price') ||
          lower.includes('cost')
        ) {
          fallbackText = `Our premier credential is the Sovereign 24K Gold VIP Pass (valued at $30,000, sold at $25,000), featuring an etched portrait of Leonardo, an extended 120-minute private salon reception and seated gala dinner table with Leonardo, and unhurried 1-on-1 personal time, alongside our Gold VIP ($10,000) and Silver Gala ($5,000) passes. Every order is personally vetted through our priority Telegram desk (@leonardodicap1974) for payment approval. Let me open the VIP Store for you!`;
          fallbackActions.push('GO_VIP', 'OPEN_CHECKOUT');
        } else if (
          lower.includes('telegram') ||
          lower.includes('approval') ||
          lower.includes('payment') ||
          lower.includes('pay')
        ) {
          fallbackText = `All VIP reservations and payment provisions (wire transfer, cryptocurrency, or card concierge) are finalized directly through our priority Telegram desk (@leonardodicap1974). You can connect with our team directly there anytime!`;
          fallbackActions.push('OPEN_SOCIAL_BALL', 'OPEN_CHECKOUT');
        } else if (lower.includes('award') || lower.includes('oscar')) {
          fallbackText = `Leonardo won the Best Actor Academy Award for *The Revenant* and holds 7 career Oscar nominations. Let me show you his celestial orbiting honors!`;
          fallbackActions.push('GO_AWARDS');
        } else if (
          lower.includes('social') ||
          lower.includes('x') ||
          lower.includes('instagram') ||
          lower.includes('facebook')
        ) {
          fallbackText = `Leonardo's official channels are led by his #1 priority Telegram Channel (@leonardodicap1974), alongside his official X (@LeoDiCaprio), Instagram (@leonardodicaprio), and Facebook. Let me open our 3D Celestial Ball for you!`;
          fallbackActions.push('OPEN_SOCIAL_BALL');
        } else if (lower.includes('photo') || lower.includes('gallery')) {
          fallbackText = `Step right into Leonardo's archival portrait salon from Cannes, Hollywood galas, and private archives. Escorting you to the gallery!`;
          fallbackActions.push('GO_GALLERY');
        } else {
          fallbackActions.push('GO_VIP', 'GO_FILMS', 'OPEN_SOCIAL_BALL');
        }

        const agentMsg: ChatMessage = {
          id: `agent-fallback-${Date.now()}`,
          sender: 'agent',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: fallbackActions,
          readStatus: 'read',
        };

        setMessages((prev) => [...prev, agentMsg]);

        if (soundEnabled) {
          playChimeSound();
        }

        if (isDirectIntent && fallbackActions.length > 0) {
          setTimeout(() => {
            executeAction(fallbackActions[0]);
          }, 800);
        }
      }, 850);
    }
  };

  const visitorSuggestions = [
    { label: '🎟️ Reserve VIP Meet & Greet', text: 'How do I reserve a VIP Meet & Greet pass and meet Leonardo?' },
    { label: '💬 Telegram Order Approval', text: 'How does payment approval work through the Telegram link?' },
    { label: '🎬 35mm Film Timeline', text: 'Direct me to Leonardo\'s cinematic timeline and film highlights' },
    { label: '🏆 Oscar Win & Honors', text: 'Tell me about Leonardo\'s Academy Award win and honors' },
    { label: '🌐 Verified Social Channels', text: 'Where can I find Leonardo\'s verified social accounts and Telegram?' },
    { label: '🌱 Climate Foundation', text: 'Tell me about Leonardo\'s environmental and wildlife conservation work' },
  ];

  return (
    <>
      {/* 1. PROACTIVE FLOATING GREETING BUBBLE (Appears gently after 3.5s if chat is closed) */}
      {!isOpen && showProactiveGreeting && (
        <div className="fixed bottom-24 right-5 sm:right-8 z-50 max-w-xs sm:max-w-sm rounded-2xl border border-amber-400/50 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => {
              setShowProactiveGreeting(false);
              setHasDismissedProactive(true);
            }}
            className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
            aria-label="Dismiss greeting"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-full border border-amber-400/50 overflow-hidden bg-zinc-900 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                  alt="Claire Laurent - Live VIP Host"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
            </div>

            <div className="flex-1 pr-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-amber-300">Claire Laurent</span>
                <span className="text-[10px] text-zinc-400 font-medium">VIP Host</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Good day! I&apos;m on live duty. Feel free to ask me anything about <strong>VIP passes</strong>, meeting Leonardo, or <strong>Telegram payment approval</strong>!
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsOpen(true);
                    setShowProactiveGreeting(false);
                  }}
                  className="rounded-lg bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-400/30 transition-all flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Chat Live</span>
                </button>
                <button
                  onClick={() => {
                    setShowProactiveGreeting(false);
                    setHasDismissedProactive(true);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PERSISTENT FLOATING TRIGGER BUTTON (Live Agent Badge) */}
      <div className="fixed bottom-6 right-5 sm:right-8 z-50">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setShowProactiveGreeting(false);
          }}
          className={`group relative flex items-center gap-3 rounded-full p-2 sm:px-4 sm:py-2.5 transition-all duration-300 shadow-2xl cursor-pointer ${
            isOpen
              ? 'bg-zinc-900 border border-zinc-700 text-white'
              : 'border border-amber-400/60 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white hover:border-amber-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]'
          }`}
          aria-label="Open Live Chat with VIP Agent"
        >
          {/* Animated glow halo */}
          {!isOpen && (
            <span
              className="absolute -inset-1 rounded-full opacity-50 blur-md group-hover:opacity-90 transition-opacity"
              style={{
                background: `linear-gradient(90deg, ${themeConfig.accent}, #f59e0b, ${themeConfig.accent})`,
              }}
            />
          )}

          {/* Agent Avatar with Live Status Dot */}
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-amber-400/50 overflow-hidden bg-zinc-900 shadow-inner group-hover:scale-105 transition-transform">
            {isOpen ? (
              <X className="h-5 w-5 text-zinc-300" />
            ) : (
              <>
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                  alt="Claire Laurent - Live Agent"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse" />
              </>
            )}
          </div>

          {/* Label */}
          <div className="hidden sm:flex flex-col text-left pr-1 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wide text-amber-300 group-hover:text-amber-200">
                Live Chat
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] text-zinc-300 font-medium">Claire • VIP Host Online</span>
          </div>
        </button>
      </div>

      {/* 3. MAIN LIVE CHAT AGENT POPUP WINDOW */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-8 z-50 w-[calc(100vw-1.5rem)] sm:w-[440px] max-w-[460px] h-[610px] max-h-[85vh] rounded-3xl border border-amber-500/35 bg-zinc-950/98 shadow-[0_25px_70px_rgba(0,0,0,0.98),0_0_50px_rgba(217,119,6,0.25)] backdrop-blur-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header with Human Host Details & Status */}
          <div className="relative border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/50 overflow-hidden bg-zinc-900 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                  alt="Claire Laurent"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-wide text-zinc-100">
                    Claire Laurent
                  </h3>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/30">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Verified Host
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Now
                  </span>
                  <span>•</span>
                  <span>Beverly Hills &amp; Cannes Desk</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-zinc-400">
              {/* Sound chime toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute notification chimes' : 'Unmute notification chimes'}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Toggle chime sound"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-amber-400/90" />
                ) : (
                  <VolumeX className="h-4 w-4 text-zinc-500" />
                )}
              </button>

              {/* Reset chat */}
              <button
                onClick={() => {
                  setMessages([initialWelcomeMessage]);
                }}
                title="Restart conversation"
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Restart conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors ml-1"
                aria-label="Close Live Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Telegram Approval Notice Bar */}
          <div className="bg-gradient-to-r from-[#229ED9]/20 via-zinc-900 to-[#229ED9]/15 border-b border-[#229ED9]/30 px-3.5 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-[#229ED9] animate-pulse" />
              <span className="text-[11px]">
                Direct Approval Desk: <strong className="text-white">@leonardodicap1974</strong>
              </span>
            </div>
            <a
              href={SOCIAL_MEDIA_HANDLES.telegram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-[#229ED9]/30 hover:bg-[#229ED9]/50 border border-[#229ED9]/40 px-2 py-0.5 text-[10px] font-semibold text-[#64B5F6] transition-colors"
            >
              <span>Open Telegram</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* Tab Bar: Live Conversation vs Quick Navigation Directory */}
          <div className="flex border-b border-zinc-800 bg-zinc-950 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                activeTab === 'chat'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              💬 Live Chat with Claire
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                activeTab === 'direct'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🗺️ Site Escort Directory
            </button>
          </div>

          {/* TAB 1: LIVE CHAT VIEW */}
          {activeTab === 'chat' && (
            <>
              {/* Message History Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-zinc-200">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 px-1">
                        {!isUser && (
                          <span className="font-semibold text-amber-300">Claire Laurent</span>
                        )}
                        <span>{m.timestamp}</span>
                        {isUser && (
                          <span className="text-emerald-400 text-[9px]">✓✓</span>
                        )}
                      </div>

                      <div
                        className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium shadow-md rounded-br-xs'
                            : 'bg-zinc-900/90 border border-zinc-800 text-zinc-100 shadow-inner rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                      </div>

                      {/* Interactive Action Buttons attached to Agent response */}
                      {m.actions && m.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1 max-w-[90%]">
                          {m.actions.map((actKey) => {
                            const def = DIRECTORY_ACTIONS[actKey];
                            if (!def) return null;
                            const IconComponent = def.icon;
                            return (
                              <button
                                key={actKey}
                                onClick={() => executeAction(actKey)}
                                className="group inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-zinc-900/90 hover:bg-amber-400/20 px-3 py-1 text-[11px] font-semibold text-amber-300 transition-all shadow-sm cursor-pointer"
                              >
                                <IconComponent className="h-3 w-3 text-amber-400" />
                                <span>{def.label}</span>
                                <ChevronRight className="h-3 w-3 text-amber-400/60 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Live Human Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start space-y-1">
                    <span className="text-[10px] text-zinc-400 px-1 flex items-center gap-1">
                      <span className="font-semibold text-amber-300">Claire Laurent</span> is typing...
                    </span>
                    <div className="rounded-2xl rounded-bl-xs bg-zinc-900 border border-zinc-800 p-3 flex items-center gap-1.5 text-zinc-400 shadow-md">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested visitor prompts */}
              <div className="px-3 py-2 border-t border-zinc-900 bg-zinc-950/60 overflow-x-auto scrollbar-none flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold shrink-0 tracking-wider">
                  Suggested:
                </span>
                {visitorSuggestions.map((sugg) => (
                  <button
                    key={sugg.label}
                    onClick={() => handleSendMessage(sugg.text)}
                    disabled={isTyping}
                    className="shrink-0 text-[11px] rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-amber-400/40 px-2.5 py-1 text-zinc-300 transition-colors disabled:opacity-50"
                  >
                    {sugg.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-zinc-800/80 bg-zinc-950">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputMessage);
                  }}
                  className="relative flex items-center"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message to Claire..."
                    disabled={isTyping}
                    className="w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/90 pl-4 pr-12 py-3 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/40 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 transition-all cursor-pointer shadow-md"
                    aria-label="Send message to live agent"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400 px-1">
                  <span>VIP Guest Relations • Live Response</span>
                  <a
                    href={SOCIAL_MEDIA_HANDLES.telegram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#64B5F6] hover:underline flex items-center gap-0.5"
                  >
                    <span>Telegram Approval</span>
                    <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: DIRECT SITE ESCORT DIRECTORY */}
          {activeTab === 'direct' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-zinc-300">
                <p className="font-semibold text-amber-300 mb-1">
                  Personal Escort Directory
                </p>
                <p className="text-[11px] text-zinc-400">
                  Select any destination below. Claire will immediately guide and transport your view to that exact exhibit or experience.
                </p>
              </div>

              <div className="space-y-2">
                {Object.values(DIRECTORY_ACTIONS).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        executeAction(action.id);
                        setIsOpen(false);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/90 hover:border-amber-400/50 transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-400 group-hover:scale-105 transition-transform">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors">
                            {action.label}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Direct Telegram Approval Button */}
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <a
                  href={SOCIAL_MEDIA_HANDLES.telegram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#1E88E5] py-2.5 px-4 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Connect with Concierge on Telegram (@leonardodicap1974)</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
