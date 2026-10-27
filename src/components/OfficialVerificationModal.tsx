import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  Globe,
  Lock,
  Mail,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LuxuryTheme, ChanneledMessage } from '../types';
import { THEME_CONFIGS, SOCIAL_MEDIA_HANDLES, OFFICIAL_CONTACT_EMAIL } from '../data/diCaprioData';

interface OfficialVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: LuxuryTheme;
}

export function OfficialVerificationModal({
  isOpen,
  onClose,
  currentTheme,
}: OfficialVerificationModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEmailDeskExpanded, setIsEmailDeskExpanded] = useState(false);
  const themeConfig = THEME_CONFIGS[currentTheme];

  // Direct channel message to Admin Portal form states
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [category, setCategory] = useState<'imposter_report' | 'vip_inquiry' | 'official_contact' | 'urgent_takedown'>('imposter_report');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Track visitor's own inquiries and official replies
  const [myInquiries, setMyInquiries] = useState<ChanneledMessage[]>(() => {
    try {
      const userMsgIds: string[] = JSON.parse(localStorage.getItem('ld_user_submitted_message_ids') || '[]');
      const allMsgs: ChanneledMessage[] = JSON.parse(localStorage.getItem('ld_owner_channeled_messages') || '[]');
      return allMsgs.filter((m) => userMsgIds.includes(m.id));
    } catch {
      return [];
    }
  });
  const [showMyInquiries, setShowMyInquiries] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Sync real-time replies from admin for visitor's inquiries
  useEffect(() => {
    const syncInquiries = () => {
      try {
        const userMsgIds: string[] = JSON.parse(localStorage.getItem('ld_user_submitted_message_ids') || '[]');
        const allMsgs: ChanneledMessage[] = JSON.parse(localStorage.getItem('ld_owner_channeled_messages') || '[]');
        setMyInquiries(allMsgs.filter((m) => userMsgIds.includes(m.id)));
      } catch {
        // ignore
      }
    };

    const handleReplyEvent = () => {
      syncInquiries();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ld_owner_channeled_messages' || e.key === 'ld_latest_reply_stream') {
        syncInquiries();
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('ld_channeled_messages_stream');
        bc.onmessage = (event) => {
          if (event.data?.type === 'admin_reply') {
            syncInquiries();
          }
        };
      }
    } catch {
      // ignore
    }

    window.addEventListener('admin-reply-sent', handleReplyEvent);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('admin-reply-sent', handleReplyEvent);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDispatchToAdminPortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !senderName.trim()) return;

    const newMsg: ChanneledMessage = {
      id: `msg-${Date.now()}`,
      senderName: senderName.trim(),
      senderContact: senderContact.trim() || 'Anonymous Patron',
      category,
      subject: subject.trim() || (category === 'imposter_report' ? 'Reported Imposter Profile' : 'Official Portal Inquiry'),
      message: message.trim(),
      evidenceUrl: evidenceUrl.trim() || undefined,
      timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'unread',
    };

    try {
      const stored = localStorage.getItem('ld_owner_channeled_messages');
      const currentList: ChanneledMessage[] = stored ? JSON.parse(stored) : [];
      const updated = [newMsg, ...currentList];
      localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(updated));

      const userMsgIds: string[] = JSON.parse(localStorage.getItem('ld_user_submitted_message_ids') || '[]');
      const updatedUserIds = [newMsg.id, ...userMsgIds];
      localStorage.setItem('ld_user_submitted_message_ids', JSON.stringify(updatedUserIds));
      setMyInquiries([newMsg, ...myInquiries]);

      window.dispatchEvent(new CustomEvent('new-channeled-message', { detail: newMsg }));
      
      // Real-time cross-tab and cross-window broadcast
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('ld_channeled_messages_stream');
        bc.postMessage(newMsg);
        bc.close();
      }
    } catch {
      // ignore
    }

    setDispatchSuccess(true);
    setShowMyInquiries(true);
    setSenderName('');
    setSenderContact('');
    setSubject('');
    setMessage('');
    setEvidenceUrl('');
    setTimeout(() => {
      setDispatchSuccess(false);
    }, 5500);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="official-verification-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto backdrop-blur-2xl bg-black/85 transition-all duration-300 animate-in fade-in"
    >
      {/* Background radial highlight */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[550px] rounded-full blur-[160px] opacity-25 mix-blend-screen"
        style={{ backgroundColor: themeConfig.accent }}
      />

      <div className="relative w-full max-w-3xl my-auto rounded-2xl sm:rounded-3xl border border-amber-400/35 bg-gradient-to-b from-zinc-900/98 via-zinc-950/98 to-black text-slate-100 shadow-[0_0_60px_rgba(245,158,11,0.22)] overflow-hidden">
        {/* Top Warning Strip */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border-b border-amber-400/30 px-3.5 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300 truncate">
            <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 animate-pulse shrink-0" />
            <span className="truncate">Official Authenticity Advisory</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-7 space-y-4 sm:space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Main Official Warning Statement */}
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="inline-flex items-center justify-center h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] mx-auto mb-0.5">
              <ShieldCheck className="h-5 w-5 sm:h-8 sm:w-8 text-amber-400" />
            </div>
            <h2
              id="official-verification-title"
              className="font-cinzel text-lg sm:text-2xl sm:text-3xl font-black tracking-tight text-white uppercase"
            >
              The One & Only Official Leonardo DiCaprio Site
            </h2>
            <div className="rounded-xl sm:rounded-2xl border border-red-500/30 bg-red-950/30 p-3 sm:p-4 text-left space-y-1.5 sm:space-y-2">
              <div className="flex items-start gap-2 sm:gap-2.5">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-red-200">
                    Important Imposter Warning:
                  </p>
                  <p className="text-[11px] sm:text-sm text-red-100/90 leading-relaxed">
                    This website and the verified channels listed below are the <strong className="text-white underline decoration-amber-400 underline-offset-2">one and only official</strong> digital presence of Leonardo DiCaprio. Beware of fake accounts, fraudulent agents, and impersonators.
                  </p>
                  <p className="text-[11px] sm:text-sm text-amber-200 font-semibold pt-0.5 sm:pt-1">
                    Please report any imposter or fraudulent account directly to our official contact <strong className="text-white select-all underline">{OFFICIAL_CONTACT_EMAIL}</strong> or via our official Telegram channel so our security team can issue immediate takedowns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2nd Display: Official Contact Desk & Direct Channel to Admin Portal */}
          <div className="rounded-xl sm:rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-400/15 via-zinc-900/90 to-zinc-950 p-4 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.25)] relative overflow-hidden transition-all duration-300">
            {/* Clean top header strip for the Official Security & Contact Desk badge */}
            <div className="flex items-center pb-2.5 mb-3.5 border-b border-white/10">
              <span className="rounded-full bg-amber-400 text-black px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow">
                Official Security &amp; Contact Desk
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-black ml-0.5" />
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-cinzel text-sm sm:text-base font-bold text-white">
                    Official Contact Desk
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-amber-300 font-bold select-all tracking-wide">
                    {OFFICIAL_CONTACT_EMAIL}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Channel directly to Admin Portal */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCopy(OFFICIAL_CONTACT_EMAIL, 'email-modal')}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-white/5"
                  title="Copy email address"
                >
                  {copiedKey === 'email-modal' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="font-mono text-[11px]">Copy</span>
                    </>
                  )}
                </button>

                {/* Primary Button: Channel Message Directly to Admin Portal */}
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailDeskExpanded(true);
                    setCategory('official_contact');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                  title="Channel message directly into Admin Portal inbox"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Channel Message to Admin</span>
                </button>

                {/* Toggle Button to open/close direct form */}
                <button
                  type="button"
                  onClick={() => setIsEmailDeskExpanded(!isEmailDeskExpanded)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shrink-0"
                  title={isEmailDeskExpanded ? 'Collapse form' : 'Open transmission form'}
                >
                  <span>{isEmailDeskExpanded ? 'Close Form' : 'Write Direct'}</span>
                  {isEmailDeskExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-amber-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Direct Channel to Admin Portal Form (displays fully only when clicked) */}
            {isEmailDeskExpanded && (
              <form onSubmit={handleDispatchToAdminPortal} className="mt-3.5 pt-3.5 border-t border-amber-400/25 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-amber-400" />
                    Channel Direct Message to Admin Portal
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEmailDeskExpanded(false)}
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Hide Form ▲
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Your Email / Reply Contact *</label>
                    <input
                      type="text"
                      required
                      value={senderContact}
                      onChange={(e) => setSenderContact(e.target.value)}
                      placeholder="e.g. patron@cinema.org"
                      className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Transmission Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="imposter_report">Imposter / Fake Account Report</option>
                      <option value="urgent_takedown">Urgent Takedown Request</option>
                      <option value="vip_inquiry">VIP Credentials & Pass Inquiry</option>
                      <option value="official_contact">Official Direct Message</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Suspect Link / Evidence URL (Optional)</label>
                    <input
                      type="url"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder="https://instagram.com/fake_profile..."
                      className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Subject / Header</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Suspicious DM requesting wire payment"
                    className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Message &amp; Evidence Details *</label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about what the imposter requested, message screenshots, or your official inquiry..."
                    className="w-full rounded-lg border border-white/15 bg-black/70 p-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:from-amber-300 hover:to-amber-500 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Channel Message to Admin</span>
                  </button>
                </div>

                {dispatchSuccess && (
                  <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-3 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Message dispatched directly to the Admin Portal.</span>
                  </div>
                )}
              </form>
            )}

            {/* Real-time Tracked Inquiries & Official Responses for Visitors */}
            {myInquiries.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-amber-400/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowMyInquiries(!showMyInquiries)}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                    <span>My Inquiries &amp; Live Responses ({myInquiries.length})</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {showMyInquiries ? '▲ Hide' : '▼ View Status'}
                    </span>
                  </button>

                  {myInquiries.some((m) => m.status === 'resolved' || m.reply) && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                      <Check className="h-2.5 w-2.5" /> Official Reply Ready
                    </span>
                  )}
                </div>

                {showMyInquiries && (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 animate-in fade-in">
                    {myInquiries.map((inq) => {
                      const hasReply = Boolean(inq.reply || (inq.replies && inq.replies.length > 0));
                      return (
                        <div
                          key={inq.id}
                          className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-black/75 space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-white text-xs sm:text-sm block">{inq.subject}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">Dispatched: {inq.timestamp}</span>
                            </div>
                            <span
                              className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                                hasReply
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {hasReply ? '✓ Official Reply Ready' : 'Under Review'}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-zinc-900/60 text-[11px] text-zinc-300 border border-white/5">
                            {inq.message}
                          </div>

                          {/* Official Verified Response */}
                          {(inq.replies && inq.replies.length > 0
                            ? inq.replies
                            : inq.reply
                            ? [
                                {
                                  id: `reply-${inq.id}`,
                                  text: inq.reply,
                                  sender: 'Official Office of Leonardo DiCaprio',
                                  timestamp: inq.repliedAt || inq.timestamp,
                                },
                              ]
                            : []
                          ).map((rep) => (
                            <div
                              key={rep.id}
                              className="mt-2 p-3 rounded-xl border-2 border-emerald-500/50 bg-emerald-950/30 text-xs space-y-1.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                            >
                              <div className="flex items-center justify-between text-[10px] border-b border-emerald-500/20 pb-1">
                                <span className="font-bold text-emerald-300 flex items-center gap-1">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                  {rep.sender}
                                </span>
                                <span className="text-zinc-400 font-mono">{rep.timestamp}</span>
                              </div>
                              <p className="text-white text-xs leading-relaxed font-sans whitespace-pre-wrap">
                                {rep.text}
                              </p>
                              <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400/90 pt-1">
                                <span>✓ Real-Time Verified Response</span>
                                {inq.senderContact.includes('@') && (
                                  <span className="text-zinc-400">Also channeled to your email</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3rd Display: Official Telegram Channel (#1 Priority Channel) */}
          <div className="rounded-xl sm:rounded-2xl border-2 border-[#229ED9]/80 bg-gradient-to-r from-[#229ED9]/20 via-zinc-900/95 to-zinc-950 p-3.5 sm:p-5 shadow-[0_0_35px_rgba(34,158,217,0.3)] relative overflow-hidden">
            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
              <span className="rounded-full bg-[#229ED9] text-white px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider shadow">
                ★ #1 Official Broadcast
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-1 sm:mt-0">
              <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#229ED9] to-[#0088cc] text-white shadow-[0_0_20px_rgba(34,158,217,0.6)]">
                <Send className="h-5 w-5 sm:h-7 sm:w-7 text-white ml-0.5" />
              </div>

              <div className="space-y-0.5 sm:space-y-1 flex-1 pr-14 sm:pr-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                    Official Telegram Channel
                  </h3>
                  <span className="text-[9px] sm:text-[10px] bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/40 px-1.5 py-0.2 rounded font-mono font-semibold">
                    VERIFIED #1
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-mono text-[#229ED9] font-bold select-all">
                  {SOCIAL_MEDIA_HANDLES.telegram.handle}
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-200 leading-relaxed">
                  The direct and official channel to reach Leonardo DiCaprio. Connect and message him directly for verified communications, personal dispatches, and priority direct inquiries.
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCopy(SOCIAL_MEDIA_HANDLES.telegram.handle, 'tg-modal')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedKey === 'tg-modal' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-xs">Copied Handle</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs">Copy Handle</span>
                  </>
                )}
              </button>

              <a
                href={SOCIAL_MEDIA_HANDLES.telegram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#229ED9] hover:bg-[#1f8fc4] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,158,217,0.5)] hover:scale-105 active:scale-95"
              >
                <span>Message Directly on Telegram</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Grid of the Other 3 Verified Accounts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span>All Additional Verified Social Accounts</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* X / Twitter */}
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3.5 space-y-2 flex flex-col justify-between hover:border-white/25 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">X (Twitter)</span>
                    <span className="text-[10px] text-zinc-400 font-mono">16.7M+</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-300 font-semibold mt-1">
                    {SOCIAL_MEDIA_HANDLES.x.handle}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    UN Messenger of Peace and feature film announcements.
                  </p>
                </div>
                <a
                  href={SOCIAL_MEDIA_HANDLES.x.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full rounded-lg bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 text-xs font-medium transition-colors border border-white/10"
                >
                  <span>Visit @LeoDiCaprio</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Instagram */}
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3.5 space-y-2 flex flex-col justify-between hover:border-pink-500/30 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Instagram</span>
                    <span className="text-[10px] text-pink-400 font-mono">58.6M+</span>
                  </div>
                  <p className="text-xs font-mono text-pink-300 font-semibold mt-1">
                    {SOCIAL_MEDIA_HANDLES.instagram.handle}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    Global wildlife sanctuaries and environmental activism.
                  </p>
                </div>
                <a
                  href={SOCIAL_MEDIA_HANDLES.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full rounded-lg bg-[#E4405F]/15 hover:bg-[#E4405F]/25 text-pink-200 px-3 py-1.5 text-xs font-medium transition-colors border border-[#E4405F]/30"
                >
                  <span>Visit Instagram</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Facebook */}
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3.5 space-y-2 flex flex-col justify-between hover:border-blue-500/30 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Facebook</span>
                    <span className="text-[10px] text-blue-400 font-mono">19.2M+</span>
                  </div>
                  <p className="text-xs font-mono text-blue-300 font-semibold mt-1">
                    {SOCIAL_MEDIA_HANDLES.facebook.handle}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    Verified official page for retrospective and media archives.
                  </p>
                </div>
                <a
                  href={SOCIAL_MEDIA_HANDLES.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-blue-200 px-3 py-1.5 text-xs font-medium transition-colors border border-[#1877F2]/30"
                >
                  <span>Visit Facebook</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Official Sanctuary Authenticity Guaranteed</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-cinzel font-black px-6 py-3 text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Enter Official Site</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
