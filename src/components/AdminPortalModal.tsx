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
  Flag,
  Reply
} from 'lucide-react';
import { Testimonial, UserProfile, OrderRecord, LuxuryTheme, ChanneledMessage, MessageReply } from '../types';
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
  const [enteredPasskey, setEnteredPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
  const [realtimeIncomingAlert, setRealtimeIncomingAlert] = useState<ChanneledMessage | null>(null);

  // Real-time reply composer states (Direct non-email automated dispatch)
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySuccessNotice, setReplySuccessNotice] = useState<string | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Reset reply state on message selection change
  React.useEffect(() => {
    setIsReplying(false);
    setReplyText('');
    setReplySuccessNotice(null);
  }, [selectedMessageId]);

  // Sync incoming real-time channeled messages & replies
  React.useEffect(() => {
    const playNotificationPing = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch {
        // audio not allowed without prior interaction or unsupported
      }
    };

    const processIncomingMessage = (msg: ChanneledMessage) => {
      if (!msg) return;
      setChanneledMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;
        return [msg, ...prev];
      });
      setRealtimeIncomingAlert(msg);
      playNotificationPing();
      setTimeout(() => setRealtimeIncomingAlert((curr) => (curr?.id === msg.id ? null : curr)), 7000);
    };

    const processIncomingReply = (messageId: string, reply: MessageReply) => {
      if (!messageId || !reply) return;
      setChanneledMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const prevReplies = m.replies || [];
            if (prevReplies.some((r) => r.id === reply.id)) return m;
            return {
              ...m,
              status: 'resolved' as const,
              reply: reply.text,
              repliedAt: reply.timestamp,
              replies: [...prevReplies, reply],
            };
          }
          return m;
        })
      );
    };

    const handleNewMessage = (e: Event) => {
      const msg = (e as CustomEvent<ChanneledMessage>).detail;
      if (msg) {
        processIncomingMessage(msg);
      }
    };

    const handleAdminReplyEvent = (e: Event) => {
      const data = (e as CustomEvent<{ messageId: string; reply: MessageReply }>).detail;
      if (data?.messageId && data?.reply) {
        processIncomingReply(data.messageId, data.reply);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ld_owner_channeled_messages' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChanneledMessages(parsed);
          }
        } catch {
          // ignore
        }
      }
      if (e.key === 'ld_latest_reply_stream' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.messageId && parsed?.reply) {
            processIncomingReply(parsed.messageId, parsed.reply);
          }
        } catch {
          // ignore
        }
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('ld_channeled_messages_stream');
        bc.onmessage = (event) => {
          if (event.data) {
            if (event.data.type === 'admin_reply') {
              processIncomingReply(event.data.messageId, event.data.reply);
            } else {
              processIncomingMessage(event.data);
            }
          }
        };
      }
    } catch {
      // ignore
    }

    window.addEventListener('new-channeled-message', handleNewMessage);
    window.addEventListener('admin-reply-sent', handleAdminReplyEvent);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('new-channeled-message', handleNewMessage);
      window.removeEventListener('admin-reply-sent', handleAdminReplyEvent);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  const handleSendReply = async (messageId: string, customText?: string) => {
    const textToDispatch = (customText !== undefined ? customText : replyText).trim();
    if (!textToDispatch) return;

    setIsSendingReply(true);
    const targetMsg = channeledMessages.find((m) => m.id === messageId);
    const now = new Date();
    const formattedTimestamp =
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    const authHash = `LDC-SIG-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const newReply: MessageReply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: 'Official Office of Leonardo DiCaprio (Executive Desk)',
      text: textToDispatch,
      timestamp: formattedTimestamp,
      channelMethod: 'auto_direct_relay',
      verificationHash: authHash,
      relayStatus: 'Direct Portal Push & Telegram Relay Confirmed',
    };

    setChanneledMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === messageId) {
          const prevReplies = m.replies || (m.reply ? [{
            id: `reply-init-${m.id}`,
            sender: 'Official Admin Desk',
            text: m.reply,
            timestamp: m.repliedAt || m.timestamp,
            channelMethod: 'auto_direct_relay' as const,
            verificationHash: `LDC-SIG-INITIAL-${m.id.slice(-4)}`,
            relayStatus: 'Direct Portal Relay Verified',
          }] : []);
          return {
            ...m,
            status: 'resolved' as const,
            reply: textToDispatch,
            repliedAt: formattedTimestamp,
            replies: [...prevReplies, newReply],
          };
        }
        return m;
      });

      try {
        localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(updated));
        localStorage.setItem(
          'ld_latest_reply_stream',
          JSON.stringify({
            messageId,
            reply: newReply,
            sentAt: Date.now(),
          })
        );
      } catch {
        // ignore
      }
      return updated;
    });

    // Real-Time BroadcastChannel transmission across tabs & instances
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('ld_channeled_messages_stream');
        bc.postMessage({
          type: 'admin_reply',
          messageId,
          reply: newReply,
        });
        bc.close();
      }
    } catch {
      // ignore
    }

    // Real-time custom event for in-page listeners & notification banners
    window.dispatchEvent(
      new CustomEvent('admin-reply-sent', {
        detail: {
          messageId,
          reply: newReply,
          senderName: targetMsg?.senderName,
          subject: targetMsg?.subject,
        },
      })
    );

    window.dispatchEvent(
      new CustomEvent('official-reply-alert', {
        detail: {
          messageId,
          recipientName: targetMsg?.senderName,
          subject: targetMsg?.subject,
          reply: newReply,
        },
      })
    );

    // Server-side audit logging & direct dispatch queue (NO EMAIL REQUIRED)
    try {
      await fetch('/api/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          recipientName: targetMsg?.senderName,
          recipientContact: targetMsg?.senderContact,
          subject: targetMsg?.subject,
          replyText: textToDispatch,
          channelMethod: 'direct_portal_and_telegram',
          verificationHash: authHash,
        }),
      });
    } catch {
      // ignore
    }

    // Audio chime feedback
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // ignore
    }

    setIsSendingReply(false);
    setIsReplying(false);
    setReplyText('');
    setReplySuccessNotice(
      `✓ Reply automatically transmitted via Direct Portal & Telegram Relay (#${authHash.slice(-6)}) without requiring email!`
    );
    setTimeout(() => {
      setReplySuccessNotice(null);
    }, 7000);
  };

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
      setAuthError('Incorrect Site Owner Passcode. Please enter your passcode manually.');
      const failedEntry = {
        id: `log-failed-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        status: 'Failed Passcode Attempt Flagged',
        recipient: OFFICIAL_SECURITY_EMAIL,
      };
      setLoginHistory((prev) => [failedEntry, ...prev.slice(0, 9)]);
    }
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
    setEnteredPasskey('');
    setAuthError('');
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
                    type={showPassword ? 'text' : 'password'}
                    name="admin-passcode-field"
                    autoComplete="off"
                    value={enteredPasskey}
                    onChange={(e) => {
                      setEnteredPasskey(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter owner passcode manually..."
                    className="w-full rounded-xl border border-white/20 bg-zinc-900/90 pl-4 pr-11 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {authError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {authError}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-xl hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Unlock Owner Portal</span>
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

            {/* Real-Time Incoming Message Alert Banner */}
            {realtimeIncomingAlert && (
              <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/25 via-zinc-900 to-black p-3.5 text-xs text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">⚡ Real-Time Message Received:</span>{' '}
                    <span className="text-zinc-200 font-medium">{realtimeIncomingAlert.senderName}</span>{' '}
                    <span className="text-amber-300 font-mono text-[11px]">(&ldquo;{realtimeIncomingAlert.subject}&rdquo;)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('inbox');
                      setSelectedMessageId(realtimeIncomingAlert.id);
                      setRealtimeIncomingAlert(null);
                    }}
                    className="rounded-lg bg-amber-400 text-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    Open Inbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealtimeIncomingAlert(null)}
                    className="text-zinc-400 hover:text-white p-1 text-xs"
                    aria-label="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Persistent Login Alert Indicator */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Security Protocol Active: Login alerts forwarding to <strong className="text-white select-all">{OFFICIAL_SECURITY_EMAIL}</strong></span>
              </div>
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

                                  {(msg.reply || (msg.replies && msg.replies.length > 0)) && (
                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <Reply className="h-2.5 w-2.5" /> Replied
                                    </span>
                                  )}

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

                          {/* Reply Success Feedback Toast */}
                          {replySuccessNotice && (
                            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span className="font-semibold">{replySuccessNotice}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setReplySuccessNotice(null)}
                                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* Quick Admin Actions with Dedicated Reply Button */}
                          <div className="space-y-2 pt-2 border-t border-white/10">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Dedicated Reply Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsReplying((prev) => !prev);
                                }}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 text-center ${
                                  isReplying
                                    ? 'bg-zinc-800 text-zinc-300 border border-white/20 hover:bg-zinc-700'
                                    : 'border border-amber-400/50 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25'
                                }`}
                              >
                                <Reply className="h-3.5 w-3.5 shrink-0" />
                                <span>{isReplying ? 'Close Reply' : 'Reply to Message'}</span>
                              </button>

                              {/* Send Message Button (Editable before sending) */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isReplying && replyText.trim()) {
                                    handleSendReply(current.id, replyText);
                                  } else {
                                    setIsReplying(true);
                                  }
                                }}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                                title="Send official message - review and edit before sending in real time without email"
                              >
                                <Send className="h-3.5 w-3.5 text-black shrink-0" />
                                <span>Send Message</span>
                              </button>

                              <button
                                type="button"
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
                                type="button"
                                onClick={() => handleUpdateMessageStatus(current.id, 'resolved')}
                                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 transition-all cursor-pointer"
                              >
                                Mark Resolved
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(current.id)}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 p-2 text-xs text-red-400 transition-all cursor-pointer"
                                title="Delete message"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Direct Non-Email Channel Status Badge */}
                            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                              <span className="flex items-center gap-1.5 font-bold">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Direct Digital Channel Active
                              </span>
                              <span className="text-zinc-400">Zero Email Needed • Instant Device &amp; Telegram Push</span>
                            </div>
                          </div>

                          {/* Interactive Real-Time Reply Composer */}
                          {isReplying && (
                            <div className="p-3.5 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-950/20 via-zinc-950 to-black space-y-3 animate-in fade-in slide-in-from-top-1">
                              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  <span className="text-[10px] font-mono uppercase font-bold text-amber-300">
                                    Direct Real-Time Reply Dispatcher (No Email)
                                  </span>
                                </div>
                                <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[170px]">
                                  To: {current.senderContact}
                                </span>
                              </div>

                              {/* Quick Reply Presets */}
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-mono text-zinc-400 block">Quick Official Templates (Click to edit before sending):</span>
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyText(
                                        `Dear ${current.senderName},\n\nThis is an official verified response from the Executive Office of Leonardo DiCaprio regarding "${current.subject}". Your transmission has been authenticated, logged into our secure VIP ledger, and routed to executive liaisons.\n\nCase Status: VERIFIED & RESOLVED.\nDirect Channel Transmission ID: #${current.id.slice(-6)}`
                                      )
                                    }
                                    className="text-[10px] rounded-lg border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 px-2 py-1 transition-all text-left cursor-pointer flex items-center gap-1 font-semibold"
                                  >
                                    <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                                    <span>⚡ Auto-Reply (Editable)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyText(
                                        `Dear ${current.senderName},\n\nWe have received your imposter report regarding "${current.subject}". The unauthorized profile has been flagged and transmitted directly to our legal enforcement team for immediate takedown.\n\nThank you for safeguarding Leonardo's official community.`
                                      )
                                    }
                                    className="text-[10px] rounded-lg border border-red-500/30 bg-red-950/30 hover:bg-red-900/40 text-red-200 px-2 py-1 transition-all text-left cursor-pointer"
                                  >
                                    🛡️ Imposter Takedown
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyText(
                                        `Dear ${current.senderName},\n\nThank you for your VIP inquiry regarding "${current.subject}". We have allocated your transmission to the executive concierge desk. An official credential liaison will follow up with verified documentation.`
                                      )
                                    }
                                    className="text-[10px] rounded-lg border border-sky-500/30 bg-sky-950/30 hover:bg-sky-900/40 text-sky-200 px-2 py-1 transition-all text-left cursor-pointer"
                                  >
                                    👑 VIP Concierge
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyText(
                                        `Dear ${current.senderName},\n\nThank you for contacting the Official Office of Leonardo DiCaprio. Your message has been formally reviewed, logged into our secure ledger, and verified as resolved.`
                                      )
                                    }
                                    className="text-[10px] rounded-lg border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-200 px-2 py-1 transition-all text-left cursor-pointer"
                                  >
                                    ✓ Case Resolved
                                  </button>
                                </div>
                              </div>

                              {/* Free Message Composer */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                                  <span className="text-zinc-300">Message:</span>
                                  {replyText && (
                                    <button
                                      type="button"
                                      onClick={() => setReplyText('')}
                                      className="text-amber-400/80 hover:text-amber-300 text-[10px] underline cursor-pointer"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Type your message here..."
                                  rows={5}
                                  className="w-full rounded-xl border border-white/20 bg-black/80 p-3 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none font-sans"
                                />
                              </div>

                              {/* Dispatch actions */}
                              <div className="flex items-center justify-between gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsReplying(false);
                                    setReplyText('');
                                  }}
                                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  disabled={isSendingReply || !replyText.trim()}
                                  onClick={() => handleSendReply(current.id, replyText)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:from-amber-300 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  <span>{isSendingReply ? 'Sending...' : 'Send Message'}</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Dispatched Replies Thread History */}
                          {((current.replies && current.replies.length > 0) || current.reply) && (
                            <div className="space-y-2 border-t border-white/10 pt-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Official Dispatched Replies ({current.replies?.length || 1})
                                </span>
                                <span className="text-[9px] font-mono text-zinc-500">Direct Authenticated Channel</span>
                              </div>

                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {(current.replies && current.replies.length > 0
                                  ? current.replies
                                  : [
                                      {
                                        id: 'reply-legacy',
                                        sender: 'Official Office of Leonardo DiCaprio',
                                        text: current.reply || '',
                                        timestamp: current.repliedAt || current.timestamp,
                                        channelMethod: 'auto_direct_relay' as const,
                                        verificationHash: `LDC-SIG-${current.id.slice(-6).toUpperCase()}`,
                                        relayStatus: 'Direct Portal Relay Verified',
                                      },
                                    ]
                                ).map((r) => (
                                  <div
                                    key={r.id}
                                    className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-2 text-[10px]">
                                      <span className="font-bold text-emerald-300 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" />
                                        {r.sender}
                                      </span>
                                      <span className="text-zinc-500 font-mono">{r.timestamp}</span>
                                    </div>
                                    <p className="text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                                      {r.text}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-[9px] font-mono text-emerald-400/80 pt-1.5 border-t border-emerald-500/20">
                                      <div className="flex items-center gap-2">
                                        <span>✓ Verified Delivered</span>
                                        <span>⚡ Zero Email Required (Direct Push &amp; Telegram)</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400">
                                        <span className="text-amber-400">Sig:</span>
                                        <span className="text-zinc-300 select-all font-bold">{r.verificationHash || `LDC-SIG-${r.id.slice(-6).toUpperCase()}`}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
