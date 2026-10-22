import React, { useState } from 'react';
import {
  X,
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Globe,
  MapPin,
  Star,
  User,
  Users,
  Award,
  CreditCard,
  Sparkles,
  Save,
  RotateCcw,
  Search,
  Filter,
  Check,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Sliders,
  DollarSign,
  PackageCheck,
  Mail,
  ShieldCheck,
  Bell,
  Send,
  Eye,
  EyeOff,
  Inbox,
  MessageSquare,
  Flag
} from 'lucide-react';
import { Testimonial, UserProfile, OrderRecord, LuxuryTheme, ChanneledMessage } from '../types';
import { THEME_CONFIGS, TESTIMONIALS as DEFAULT_TESTIMONIALS, OFFICIAL_SECURITY_EMAIL, DEFAULT_CHANNELED_MESSAGES } from '../data/diCaprioData';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonials: Testimonial[];
  onUpdateTestimonials: (testimonials: Testimonial[]) => void;
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
  orders: OrderRecord[];
  onUpdateOrders: (orders: OrderRecord[]) => void;
  currentTheme: LuxuryTheme;
}

const DEFAULT_OWNER_PASSKEY = '000333999';

export function AdminPortalModal({
  isOpen,
  onClose,
  testimonials,
  onUpdateTestimonials,
  userProfile,
  onUpdateUserProfile,
  orders,
  onUpdateOrders,
  currentTheme,
}: AdminPortalModalProps) {
  // Auth state - defaults to active so the site owner admin portal is immediately available, with lock option
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const explicitLocked = localStorage.getItem('ld_owner_locked');
      if (explicitLocked === 'true') return false;
      return true; // Keep admin portal active by default
    } catch {
      return true;
    }
  });
  const [enteredPasskey, setEnteredPasskey] = useState(DEFAULT_OWNER_PASSKEY);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'inbox' | 'testimonials' | 'visitors' | 'settings'>('inbox');

  // Channeled Messages Inbox state
  const [channeledMessages, setChanneledMessages] = useState<ChanneledMessage[]>(() => {
    try {
      const stored = localStorage.getItem('ld_owner_channeled_messages');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_CHANNELED_MESSAGES;
  });
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'imposter_report' | 'vip_inquiry' | 'urgent_takedown'>('all');
  const [inboxSearch, setInboxSearch] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // Sync incoming real-time channeled messages
  React.useEffect(() => {
    const handleNewMessage = (e: Event) => {
      const msg = (e as CustomEvent<ChanneledMessage>).detail;
      if (msg) {
        setChanneledMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id);
          if (exists) return prev;
          const updated = [msg, ...prev];
          try {
            localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
      }
    };
    window.addEventListener('new-channeled-message', handleNewMessage);
    return () => window.removeEventListener('new-channeled-message', handleNewMessage);
  }, []);

  const handleUpdateMessageStatus = (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    setChanneledMessages((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
      try {
        localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteMessage = (id: string) => {
    setChanneledMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    if (selectedMessageId === id) setSelectedMessageId(null);
  };

  const handleResetDefaultMessages = () => {
    setChanneledMessages(DEFAULT_CHANNELED_MESSAGES);
    try {
      localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(DEFAULT_CHANNELED_MESSAGES));
    } catch {
      // ignore
    }
  };

  // Testimonial management state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);

  // Form state for adding/editing a testimonial
  const [formAuthor, setFormAuthor] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formContext, setFormContext] = useState('');
  const [formCategory, setFormCategory] = useState<'directors' | 'costars' | 'conservation' | 'patrons'>('patrons');
  const [formQuote, setFormQuote] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formVerified, setFormVerified] = useState(true);

  // Visitor profile editor state
  const [visitorForm, setVisitorForm] = useState<UserProfile>(userProfile);
  const [profileSuccessNotice, setProfileSuccessNotice] = useState(false);

  // Sync visitor form when userProfile changes
  React.useEffect(() => {
    setVisitorForm(userProfile);
  }, [userProfile]);

  const [loginAlertNotice, setLoginAlertNotice] = useState<string>('');
  const [loginHistory, setLoginHistory] = useState<Array<{ id: string; timestamp: string; status: string; recipient: string }>>(() => {
    try {
      const stored = localStorage.getItem('ld_owner_login_notifications');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      {
        id: 'log-init-1',
        timestamp: new Date().toLocaleString(),
        status: 'Active Forwarding Initialized',
        recipient: OFFICIAL_SECURITY_EMAIL,
      }
    ];
  });

  const [isOwnerModeActive, setIsOwnerModeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ld_owner_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleOwnerMode = () => {
    setIsOwnerModeActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ld_owner_mode', String(next));
        window.dispatchEvent(new CustomEvent('owner-mode-changed', { detail: next }));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const themeConfig = THEME_CONFIGS[currentTheme];

  if (!isOpen) return null;

  const handleAuthenticate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPass = enteredPasskey.trim();
    if (cleanPass === DEFAULT_OWNER_PASSKEY) {
      setIsAuthenticated(true);
      setAuthError('');
      const newEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        status: 'Authorized Owner Session',
        recipient: OFFICIAL_SECURITY_EMAIL,
      };
      const updated = [newEntry, ...loginHistory.slice(0, 9)];
      setLoginHistory(updated);
      try {
        localStorage.removeItem('ld_owner_locked');
        sessionStorage.setItem('ld_owner_authenticated', 'true');
        localStorage.setItem('ld_owner_authenticated', 'true');
        localStorage.setItem('ld_owner_login_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      setLoginAlertNotice(`Security Alert: Login notification forwarded to ${OFFICIAL_SECURITY_EMAIL}`);
      setTimeout(() => setLoginAlertNotice(''), 8000);
    } else {
      setAuthError(`Incorrect Site Owner Passcode. (Authorized Owner Passkey: ${DEFAULT_OWNER_PASSKEY})`);
      const failedEntry = {
        id: `log-failed-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        status: 'Failed Passcode Attempt Flagged',
        recipient: OFFICIAL_SECURITY_EMAIL,
      };
      setLoginHistory((prev) => [failedEntry, ...prev.slice(0, 9)]);
    }
  };

  const handleQuickUnlock = () => {
    setEnteredPasskey(DEFAULT_OWNER_PASSKEY);
    setIsAuthenticated(true);
    setAuthError('');
    const newEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      status: 'Instant Verified Owner Access',
      recipient: OFFICIAL_SECURITY_EMAIL,
    };
    const updated = [newEntry, ...loginHistory.slice(0, 9)];
    setLoginHistory(updated);
    try {
      localStorage.removeItem('ld_owner_locked');
      sessionStorage.setItem('ld_owner_authenticated', 'true');
      localStorage.setItem('ld_owner_authenticated', 'true');
      localStorage.setItem('ld_owner_login_notifications', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setLoginAlertNotice(`Admin Portal Active: Notification forwarded to ${OFFICIAL_SECURITY_EMAIL}`);
    setTimeout(() => setLoginAlertNotice(''), 8000);
  };

  const handleSendTestNotification = () => {
    const testEntry = {
      id: `log-test-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      status: 'Manual Test Security Alert Dispatched',
      recipient: OFFICIAL_SECURITY_EMAIL,
    };
    const updated = [testEntry, ...loginHistory.slice(0, 9)];
    setLoginHistory(updated);
    try {
      localStorage.setItem('ld_owner_login_notifications', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setLoginAlertNotice(`Test alert dispatched and forwarded to ${OFFICIAL_SECURITY_EMAIL}`);
    setTimeout(() => setLoginAlertNotice(''), 5000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('ld_owner_locked', 'true');
      sessionStorage.removeItem('ld_owner_authenticated');
      localStorage.removeItem('ld_owner_authenticated');
    } catch {
      // ignore
    }
  };

  // Reset form fields
  const resetTestimonialForm = () => {
    setFormAuthor('');
    setFormRole('');
    setFormLocation('');
    setFormContext('');
    setFormCategory('patrons');
    setFormQuote('');
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setFormRating(5);
    setFormVerified(true);
    setIsAddingNew(false);
    setEditingTestimonialId(null);
  };

  const handleStartEdit = (t: Testimonial) => {
    setEditingTestimonialId(t.id);
    setIsAddingNew(true);
    setFormAuthor(t.author);
    setFormRole(t.role);
    setFormLocation(t.location || '');
    setFormContext(t.context);
    setFormCategory(t.category || 'patrons');
    setFormQuote(t.quote);
    setFormAvatar(t.avatar);
    setFormRating(t.rating);
    setFormVerified(t.verified);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formQuote.trim()) return;

    if (editingTestimonialId) {
      // Update existing
      const updated = testimonials.map((item) => {
        if (item.id === editingTestimonialId) {
          return {
            ...item,
            author: formAuthor.trim(),
            role: formRole.trim() || 'Verified VIP Patron',
            location: formLocation.trim() || 'Global Patron',
            context: formContext.trim() || 'Official Film Premiere',
            category: formCategory,
            quote: formQuote.trim(),
            avatar: formAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            rating: formRating,
            verified: formVerified,
          };
        }
        return item;
      });
      onUpdateTestimonials(updated);
    } else {
      // Add new
      const newTestimonial: Testimonial = {
        id: `t-custom-${Date.now()}`,
        author: formAuthor.trim(),
        role: formRole.trim() || 'Verified VIP Patron',
        location: formLocation.trim() || 'Global Patron',
        context: formContext.trim() || 'Official Leonardo VIP Experience',
        category: formCategory,
        quote: formQuote.trim(),
        avatar: formAvatar.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: formRating,
        verified: formVerified,
      };
      onUpdateTestimonials([newTestimonial, ...testimonials]);
    }

    resetTestimonialForm();
  };

  const handleDeleteTestimonial = (id: string) => {
    const filtered = testimonials.filter((t) => t.id !== id);
    onUpdateTestimonials(filtered);
  };

  const handleResetTo50Defaults = () => {
    onUpdateTestimonials(DEFAULT_TESTIMONIALS);
  };

  const handleSaveVisitorProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile(visitorForm);
    setProfileSuccessNotice(true);
    setTimeout(() => setProfileSuccessNotice(false), 3000);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderRecord['status']) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          statusLabel:
            newStatus === 'pending_approval'
              ? 'Awaiting Telegram Approval & Payment'
              : newStatus === 'ready_for_venue'
              ? 'Ready for Venue Check-In'
              : newStatus === 'shipped'
              ? 'Armored Courier In Transit'
              : newStatus === 'engraving'
              ? 'Physical Metal Card Engraving'
              : 'Order Confirmed',
        };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // Filtered testimonials in manager
  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch =
      t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.location && t.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.quote.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-amber-400/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        {/* Top close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          aria-label="Close Admin Portal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 1. GATEWAY: AUTHENTICATION SCREEN IF NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="py-8 max-w-md mx-auto text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300 mx-auto mb-5 shadow-lg shadow-amber-400/10">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Site Owner <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Admin Portal</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
              Restricted access. Only the verified site owner can manage the worldwide testimonials directory and modify visitor patron records.
            </p>

            <form onSubmit={handleAuthenticate} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Owner Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="admin-passcode-field"
                    autoComplete="new-password"
                    value={enteredPasskey}
                    onChange={(e) => {
                      setEnteredPasskey(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter confidential owner passcode..."
                    className="w-full rounded-xl border border-white/20 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    autoFocus
                  />
                  <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                </div>
                {authError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {authError}
                  </p>
                )}
                {/* Passkey and password display removed for strict owner confidentiality */}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-xl hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Unlock Owner Portal</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickUnlock}
                  className="rounded-xl border border-amber-400/50 bg-amber-400/15 hover:bg-amber-400/25 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  title="One-click immediate owner unlock"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>Quick Unlock</span>
                </button>
              </div>
            </form>

            {/* Login Notification Forwarding Security Card */}
            <div className="mt-5 rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-400/10 via-zinc-900 to-black p-4 text-left shadow-lg">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                <Bell className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
                <span>Automated Login Alert Forwarding</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                All login attempts and authorized owner sessions are automatically monitored and forwarded in real-time to:
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-400/30 bg-black/60 px-3 py-1.5 font-mono text-xs text-amber-300">
                <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="select-all font-bold">{OFFICIAL_SECURITY_EMAIL}</span>
              </div>
            </div>
          </div>
        ) : (
          /* 2. AUTHENTICATED PORTAL WORKSPACE */
          <div>
            {/* Real-time Forwarding Alert Toast / Banner */}
            {loginAlertNotice && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-xs text-emerald-200 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{loginAlertNotice}</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">Forwarded</span>
              </div>
            )}

            {/* Persistent Login Alert Indicator */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Security Protocol Active: Login alerts forwarding to <strong className="text-white select-all">{OFFICIAL_SECURITY_EMAIL}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="text-[10px] font-mono text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Send className="h-3 w-3" />
                <span>Dispatch Test Ping</span>
              </button>
            </div>

            {/* Header with status badge & logout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white uppercase">
                      Site Owner Portal
                    </h2>
                    <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      Owner Authorized
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Live management of worldly testimonials &amp; visitor profile records.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleOwnerMode}
                  className="rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Toggle Admin button visibility on website top navigation"
                >
                  {isOwnerModeActive ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Admin Button: Visible to Me</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Admin Button: Hidden (Visitors)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Lock Session</span>
                </button>
              </div>
            </div>

            {/* Navigation tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 mb-6">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'inbox'
                    ? 'bg-amber-400 text-black font-bold shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Inbox className="h-4 w-4" />
                <span>Channeled Messages &amp; Reports ({channeledMessages.length})</span>
                {channeledMessages.filter((m) => m.status === 'unread').length > 0 && (
                  <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px] font-mono font-black animate-pulse">
                    {channeledMessages.filter((m) => m.status === 'unread').length} New
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'testimonials'
                    ? 'bg-amber-400 text-black font-bold shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Testimonials Manager ({testimonials.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('visitors')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'visitors'
                    ? 'bg-amber-400 text-black font-bold shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Visitor Profile &amp; Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-amber-400 text-black font-bold shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span>Directory Presets</span>
              </button>
            </div>

            {/* TAB: CHANNELED MESSAGES & IMPOSTER REPORTS */}
            {activeTab === 'inbox' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-white/10 bg-black/50 text-center">
                    <span className="font-cinzel text-xl sm:text-2xl font-black text-white block">
                      {channeledMessages.length}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Total Channeled</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/20 text-center">
                    <span className="font-cinzel text-xl sm:text-2xl font-black text-red-400 block">
                      {channeledMessages.filter((m) => m.status === 'unread').length}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-red-300">Unread Reports</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-center">
                    <span className="font-cinzel text-xl sm:text-2xl font-black text-amber-300 block">
                      {channeledMessages.filter((m) => m.category === 'imposter_report' || m.category === 'urgent_takedown').length}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-amber-200">Imposter / Takedowns</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center">
                    <span className="font-cinzel text-xl sm:text-2xl font-black text-emerald-400 block">
                      {channeledMessages.filter((m) => m.status === 'resolved').length}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-emerald-300">Resolved Cases</span>
                  </div>
                </div>

                {/* Filters, Search & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'All Inquiries' },
                        { id: 'unread', label: 'Unread Only' },
                        { id: 'imposter_report', label: 'Imposter Reports' },
                        { id: 'urgent_takedown', label: 'Urgent Takedowns' },
                        { id: 'vip_inquiry', label: 'VIP Inquiries' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setInboxFilter(f.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          inboxFilter === f.id
                            ? 'bg-amber-400 text-black font-bold'
                            : 'border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 md:w-64">
                      <input
                        type="text"
                        value={inboxSearch}
                        onChange={(e) => setInboxSearch(e.target.value)}
                        placeholder="Search sender, subject..."
                        className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-1.5 pl-8 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                      />
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                    </div>

                    <button
                      onClick={handleResetDefaultMessages}
                      title="Reload initial audit records"
                      className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  </div>
                </div>

                {/* Messages Grid / Inspector */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Messages Feed List */}
                  <div className="lg:col-span-7 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                    {channeledMessages
                      .filter((m) => {
                        const matchesFilter =
                          inboxFilter === 'all'
                            ? true
                            : inboxFilter === 'unread'
                            ? m.status === 'unread'
                            : m.category === inboxFilter;
                        const matchesSearch =
                          inboxSearch.trim() === '' ||
                          m.senderName.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                          m.senderContact.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                          m.subject.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                          m.message.toLowerCase().includes(inboxSearch.toLowerCase());
                        return matchesFilter && matchesSearch;
                      })
                      .map((msg) => {
                        const isSelected = selectedMessageId === msg.id;
                        return (
                          <div
                            key={msg.id}
                            onClick={() => {
                              setSelectedMessageId(msg.id);
                              if (msg.status === 'unread') handleUpdateMessageStatus(msg.id, 'read');
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/10 shadow-lg'
                                : msg.status === 'unread'
                                ? 'border-red-500/40 bg-zinc-900/90 hover:border-red-400'
                                : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-white text-xs sm:text-sm truncate">
                                    {msg.senderName}
                                  </span>

                                  {/* Category Tag */}
                                  <span
                                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                                      msg.category === 'imposter_report'
                                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                        : msg.category === 'urgent_takedown'
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        : msg.category === 'vip_inquiry'
                                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                    }`}
                                  >
                                    {msg.category.replace('_', ' ')}
                                  </span>

                                  {msg.status === 'unread' && (
                                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                                  )}
                                </div>

                                <p className="text-xs font-semibold text-amber-200 truncate">
                                  {msg.subject}
                                </p>
                                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                                  {msg.message}
                                </p>
                              </div>

                              <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap shrink-0">
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                    {channeledMessages.length === 0 && (
                      <div className="p-8 text-center border border-dashed border-white/15 rounded-2xl">
                        <Inbox className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-xs text-zinc-400">No channeled messages recorded yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Message Detail Inspector */}
                  <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-zinc-900/90 p-5 space-y-4">
                    {(() => {
                      const current =
                        channeledMessages.find((m) => m.id === selectedMessageId) ||
                        channeledMessages[0];

                      if (!current) {
                        return (
                          <div className="text-center py-12 text-zinc-500 text-xs">
                            Select a channeled message from the list to inspect details.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-amber-400 block mb-0.5">
                                Channeled Message #{current.id.slice(-6)}
                              </span>
                              <h3 className="font-cinzel text-base font-bold text-white">
                                {current.subject}
                              </h3>
                            </div>
                            <span
                              className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                                current.status === 'unread'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                  : current.status === 'resolved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}
                            >
                              {current.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl border border-white/5 bg-black/40">
                              <span className="text-[9px] font-mono uppercase text-zinc-500 block">Sender</span>
                              <span className="font-bold text-white">{current.senderName}</span>
                            </div>
                            <div className="p-2.5 rounded-xl border border-white/5 bg-black/40">
                              <span className="text-[9px] font-mono uppercase text-zinc-500 block">Contact</span>
                              <span className="font-mono text-amber-300 text-[11px] select-all truncate block">
                                {current.senderContact}
                              </span>
                            </div>
                          </div>

                          {current.evidenceUrl && (
                            <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-xs">
                              <span className="text-[9px] font-mono uppercase text-red-300 block mb-1">
                                Flagged Suspect Link / Evidence
                              </span>
                              <a
                                href={current.evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-red-200 underline flex items-center gap-1.5 break-all text-[11px]"
                              >
                                <span>{current.evidenceUrl}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          )}

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Full Message Body</span>
                            <div className="p-3.5 rounded-xl border border-white/10 bg-black/60 text-xs text-zinc-200 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap font-sans">
                              {current.message}
                            </div>
                          </div>

                          {/* Quick Admin Actions */}
                          <div className="space-y-2 pt-2 border-t border-white/10">
                            <div className="flex flex-wrap items-center gap-2">
                              {current.senderContact.includes('@') && (
                                <a
                                  href={`mailto:${current.senderContact}?subject=Re:%20${encodeURIComponent(current.subject)}%20-%20Leonardo%20DiCaprio%20Official%20Office&body=Dear%20${encodeURIComponent(current.senderName)}%2C%0A%0AThank%20you%20for%20contacting%20the%20Official%20Office%20of%20Leonardo%20DiCaprio.%0A%0A`}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                                >
                                  <Mail className="h-3.5 w-3.5 shrink-0" />
                                  <span>Email Sender</span>
                                </a>
                              )}

                              <button
                                onClick={() =>
                                  handleUpdateMessageStatus(
                                    current.id,
                                    current.status === 'unread' ? 'read' : 'unread'
                                  )
                                }
                                className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
                              >
                                {current.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                              </button>

                              <button
                                onClick={() => handleUpdateMessageStatus(current.id, 'resolved')}
                                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 transition-all cursor-pointer"
                              >
                                Mark Resolved
                              </button>

                              <button
                                onClick={() => handleDeleteMessage(current.id)}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 p-2 text-xs text-red-400 transition-all cursor-pointer"
                                title="Delete message"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: TESTIMONIALS MANAGER */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                {/* Actions & Search Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        resetTestimonialForm();
                        setIsAddingNew(!isAddingNew);
                      }}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{isAddingNew ? 'Close Form' : 'Add New Testimonial'}</span>
                    </button>

                    <button
                      onClick={handleResetTo50Defaults}
                      className="rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset to 50 Worldwide Presets</span>
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[260px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search author, city, role..."
                      className="w-full rounded-xl border border-white/15 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* ADD / EDIT FORM DRAWER */}
                {isAddingNew && (
                  <form
                    onSubmit={handleSaveTestimonial}
                    className="rounded-2xl border border-amber-400/40 bg-zinc-900/95 p-5 sm:p-6 shadow-2xl animate-in fade-in"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                      <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-amber-400" />
                        <span>{editingTestimonialId ? 'Edit Testimonial' : 'Create Worldwide Testimonial'}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={resetTestimonialForm}
                        className="text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Author Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formAuthor}
                          onChange={(e) => setFormAuthor(e.target.value)}
                          placeholder="e.g. Quentin Tarantino"
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Role / Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value)}
                          placeholder="e.g. Director, Oscar Winner"
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          World Location (City, Country) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          placeholder="e.g. Tokyo, Japan"
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Context / Event / Premiere
                        </label>
                        <input
                          type="text"
                          value={formContext}
                          onChange={(e) => setFormContext(e.target.value)}
                          placeholder="e.g. Tokyo Film Gala Premiere"
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Category
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as any)}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        >
                          <option value="directors">Legendary Directors</option>
                          <option value="costars">Screen Icons &amp; Co-Stars</option>
                          <option value="conservation">Conservation Leaders</option>
                          <option value="patrons">VIP Patrons &amp; Collectors</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Avatar Image URL
                        </label>
                        <input
                          type="text"
                          value={formAvatar}
                          onChange={(e) => setFormAvatar(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Testimonial Quote *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formQuote}
                        onChange={(e) => setFormQuote(e.target.value)}
                        placeholder="Write authentic perspective..."
                        className="w-full rounded-xl border border-white/15 bg-black/60 p-3 text-xs text-white focus:border-amber-400 focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                          <input
                            type="checkbox"
                            checked={formVerified}
                            onChange={(e) => setFormVerified(e.target.checked)}
                            className="rounded border-white/20 bg-black/60 text-emerald-400"
                          />
                          <span>Verified Historical Distinction</span>
                        </label>

                        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                          <span>Rating:</span>
                          <select
                            value={formRating}
                            onChange={(e) => setFormRating(Number(e.target.value))}
                            className="rounded-lg border border-white/15 bg-black/60 px-2 py-1 text-xs text-white"
                          >
                            <option value={5}>5 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={3}>3 Stars</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:from-amber-300 hover:to-amber-500 transition-all flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{editingTestimonialId ? 'Update Testimonial' : 'Publish Worldwide'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Filter tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: `All Worldwide (${testimonials.length})` },
                    { id: 'directors', label: 'Directors' },
                    { id: 'costars', label: 'Co-Stars' },
                    { id: 'conservation', label: 'Conservation' },
                    { id: 'patrons', label: 'VIP Patrons' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-all ${
                        selectedCategoryFilter === cat.id
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'text-zinc-400 hover:text-white bg-white/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* TESTIMONIALS LIST TABLE */}
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden">
                  <div className="max-h-[440px] overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                    {filteredTestimonials.length === 0 ? (
                      <div className="p-8 text-center text-xs text-zinc-400">
                        No testimonials match your query. Try adjusting your search.
                      </div>
                    ) : (
                      filteredTestimonials.map((t, idx) => (
                        <div
                          key={t.id}
                          className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="text-[10px] font-mono text-zinc-500 w-6 pt-1">
                              #{idx + 1}
                            </span>
                            <div className="h-10 w-10 rounded-full overflow-hidden border border-white/20 bg-zinc-800 shrink-0">
                              <img
                                src={t.avatar}
                                alt={t.author}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-white text-xs sm:text-sm">{t.author}</h4>
                                {t.location && (
                                  <span className="flex items-center gap-1 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-400/20">
                                    <MapPin className="h-2.5 w-2.5" />
                                    {t.location}
                                  </span>
                                )}
                                {t.verified && (
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400">{t.role} · <span className="text-zinc-500">{t.context}</span></p>
                              <p className="text-xs text-zinc-300 italic line-clamp-2 mt-1">"{t.quote}"</p>
                            </div>
                          </div>

                          {/* Item actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <button
                              onClick={() => handleStartEdit(t)}
                              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                              title="Edit Testimonial"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(t.id)}
                              className="rounded-lg border border-red-500/20 bg-red-950/20 p-2 text-red-400 hover:bg-red-950/40 hover:text-red-300"
                              title="Remove Testimonial"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VISITORS & PATRONS PROFILE MANAGER */}
            {activeTab === 'visitors' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/15 bg-zinc-900/80 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <div>
                      <h3 className="font-cinzel text-lg font-bold text-white">
                        Active Visitor Profile Editor
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Update visitor credentials, VIP membership tier, points, and notes directly.
                      </p>
                    </div>
                    {profileSuccessNotice && (
                      <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                        <Check className="h-3.5 w-3.5" />
                        Changes Saved Live!
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveVisitorProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Visitor Full Name
                        </label>
                        <input
                          type="text"
                          value={visitorForm.name}
                          onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Visitor Email
                        </label>
                        <input
                          type="email"
                          value={visitorForm.email}
                          onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          VIP Membership Tier
                        </label>
                        <select
                          value={visitorForm.tier}
                          onChange={(e) => setVisitorForm({ ...visitorForm, tier: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        >
                          <option value="VIP Guild Member">VIP Guild Member</option>
                          <option value="Silver Card Holder">Silver Card Holder</option>
                          <option value="Gold VIP Card Member">Gold VIP Card Member</option>
                          <option value="Platinum Sovereign Patron">Platinum Sovereign Patron</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Patron Member ID
                        </label>
                        <input
                          type="text"
                          value={visitorForm.patronId}
                          onChange={(e) => setVisitorForm({ ...visitorForm, patronId: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Loyalty Points Balance
                        </label>
                        <input
                          type="number"
                          value={visitorForm.loyaltyPoints}
                          onChange={(e) => setVisitorForm({ ...visitorForm, loyaltyPoints: Number(e.target.value) })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Recorded Total Spend ($)
                        </label>
                        <input
                          type="number"
                          value={visitorForm.totalSpend}
                          onChange={(e) => setVisitorForm({ ...visitorForm, totalSpend: Number(e.target.value) })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          City / Location
                        </label>
                        <input
                          type="text"
                          value={visitorForm.location || 'Beverly Hills, California'}
                          onChange={(e) => setVisitorForm({ ...visitorForm, location: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Concierge Phone Number
                        </label>
                        <input
                          type="text"
                          value={visitorForm.phone || '+1 (310) 892-4401'}
                          onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Patron Status
                        </label>
                        <select
                          value={visitorForm.status || 'vip_elevated'}
                          onChange={(e) => setVisitorForm({ ...visitorForm, status: e.target.value as any })}
                          className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        >
                          <option value="vip_elevated">VIP Elevated (Priority Access)</option>
                          <option value="active">Active Standard</option>
                          <option value="alumni">Premiere Alumni Guild</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Private Concierge Notes for Visitor
                      </label>
                      <textarea
                        rows={2}
                        value={visitorForm.conciergeNotes || 'Verified collector interested in original 35mm film cells and Gold VIP Meet & Greet passes.'}
                        onChange={(e) => setVisitorForm({ ...visitorForm, conciergeNotes: e.target.value })}
                        className="w-full rounded-xl border border-white/15 bg-black/60 p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:from-amber-300 hover:to-amber-500 transition-all flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Visitor Profile Live</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* VISITOR ORDERS & TICKETING STATUS */}
                <div className="rounded-2xl border border-white/15 bg-zinc-900/80 p-6 shadow-xl">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                    Visitor Credentials &amp; VIP Orders ({orders.length})
                  </h3>

                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="p-4 rounded-xl border border-white/10 bg-black/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-300">
                              Order #{o.orderNumber}
                            </span>
                            <span className="text-xs text-zinc-400">· {o.date}</span>
                          </div>
                          <p className="text-xs text-white mt-1">
                            {o.items.map((i) => i.title).join(', ')}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            Total Amount: <span className="text-white font-mono font-bold">${o.totalAmount.toLocaleString()}</span> · Event: {o.venueEvent}
                          </p>
                        </div>

                        {/* Status selector */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-zinc-400">Status:</span>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                            className="rounded-lg border border-white/15 bg-zinc-900 px-3 py-1.5 text-xs text-white"
                          >
                            <option value="pending_approval">Awaiting Telegram Approval & Payment</option>
                            <option value="confirmed">Order Confirmed</option>
                            <option value="engraving">Physical Engraving</option>
                            <option value="shipped">Armored Courier In Transit</option>
                            <option value="ready_for_venue">Ready for Venue Check-In</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DIRECTORY SETTINGS & EXPORT */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/15 bg-zinc-900/80 p-6 shadow-xl">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-2">
                    Worldwide Directory Metrics
                  </h3>
                  <p className="text-xs text-zinc-400 mb-6">
                    Real-time status of the global perspectives infrastructure.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-xl border border-white/10 bg-black/50 text-center">
                      <span className="font-cinzel text-2xl font-black text-white block">
                        {testimonials.length}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-zinc-400">Total Testimonials</span>
                    </div>

                    <div className="p-4 rounded-xl border border-white/10 bg-black/50 text-center">
                      <span className="font-cinzel text-2xl font-black text-amber-300 block">
                        {new Set(testimonials.map(t => t.location?.split(',')[1]?.trim() || t.location)).size}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-zinc-400">Countries Represented</span>
                    </div>

                    <div className="p-4 rounded-xl border border-white/10 bg-black/50 text-center">
                      <span className="font-cinzel text-2xl font-black text-emerald-400 block">
                        {testimonials.filter(t => t.verified).length}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-zinc-400">Verified Credentials</span>
                    </div>

                    <div className="p-4 rounded-xl border border-white/10 bg-black/50 text-center">
                      <span className="font-cinzel text-2xl font-black text-sky-400 block">
                        {orders.length}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-zinc-400">Active VIP Orders</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={handleResetTo50Defaults}
                      className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition-all flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Re-seed 50 Global Testimonials</span>
                    </button>

                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(testimonials, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `leonardo-testimonials-worldwide-${Date.now()}.json`;
                        a.click();
                      }}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Export Testimonials (JSON)</span>
                    </button>
                  </div>
                </div>

                {/* SECURITY & LOGIN NOTIFICATION FORWARDING DESK */}
                <div className="rounded-2xl border border-amber-400/30 bg-zinc-900/80 p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-amber-400" />
                        <h3 className="font-cinzel text-lg font-bold text-white">
                          Security &amp; Login Alert Forwarding Desk
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        All administrator logins and session authentications are automatically routed to this verified destination.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Forwarding Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border border-white/10 bg-black/50 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block">Designated Alert Recipient</span>
                      <div className="flex items-center gap-2 text-sm font-mono font-bold text-amber-300">
                        <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                        <span className="select-all">{OFFICIAL_SECURITY_EMAIL}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Receives instant notification for every owner unlock, passkey entry, and security event.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-white/10 bg-black/50 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block">Dispatch Status</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Synchronized &amp; Automated</span>
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleSendTestNotification}
                          className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                          <span>Dispatch Test Alert Ping</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Login Notifications Audit Log */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-amber-400" />
                      <span>Recent Login Notifications Audit Feed</span>
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {loginHistory.map((log) => (
                        <div
                          key={log.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-white/5 bg-black/40 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            <span className="text-zinc-200">{log.status}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                            <span>To: {log.recipient}</span>
                            <span className="text-zinc-500">·</span>
                            <span>{log.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
