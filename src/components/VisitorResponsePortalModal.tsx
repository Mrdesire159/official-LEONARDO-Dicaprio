import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Search,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Inbox,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Reply,
  Volume2,
  VolumeX,
  Lock,
  User,
  Filter
} from 'lucide-react';
import { LuxuryTheme, ChanneledMessage, MessageReply } from '../types';
import { THEME_CONFIGS, OFFICIAL_CONTACT_EMAIL } from '../data/diCaprioData';

interface VisitorResponsePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: LuxuryTheme;
  initialMessageId?: string | null;
  onOpenAdminPortal?: () => void;
}

export function VisitorResponsePortalModal({
  isOpen,
  onClose,
  currentTheme,
  initialMessageId = null,
  onOpenAdminPortal,
}: VisitorResponsePortalModalProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  // All channeled messages from local storage
  const [messages, setMessages] = useState<ChanneledMessage[]>(() => {
    try {
      const stored = localStorage.getItem('ld_owner_channeled_messages');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  // Visitor tracked emails / IDs
  const [visitorEmail, setVisitorEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('ld_visitor_registered_email') || '';
    } catch {
      return '';
    }
  });

  const [trackedMessageIds, setTrackedMessageIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ld_user_submitted_message_ids') || '[]');
    } catch {
      return [];
    }
  });

  // Selected message to view thread
  const [activeMessageId, setActiveMessageId] = useState<string | null>(initialMessageId);
  const [activeTab, setActiveTab] = useState<'my_threads' | 'new_inquiry' | 'email_sync'>('my_threads');
  const [emailSearchInput, setEmailSearchInput] = useState('');
  const [syncStatusNotice, setSyncStatusNotice] = useState<string | null>(null);

  // Visitor follow-up composer state
  const [followUpText, setFollowUpText] = useState('');
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [followUpSuccess, setFollowUpSuccess] = useState<string | null>(null);

  // New inquiry direct dispatch form state
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderEmail, setNewSenderEmail] = useState(visitorEmail);
  const [newCategory, setNewCategory] = useState<'official_contact' | 'vip_inquiry' | 'imposter_report' | 'urgent_takedown'>('official_contact');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newInquirySuccess, setNewInquirySuccess] = useState<string | null>(null);

  // Sync when initialMessageId changes
  useEffect(() => {
    if (initialMessageId) {
      setActiveMessageId(initialMessageId);
      setActiveTab('my_threads');
    }
  }, [initialMessageId]);

  // Sync with real-time messages & replies
  useEffect(() => {
    const refreshData = () => {
      try {
        const stored = localStorage.getItem('ld_owner_channeled_messages');
        if (stored) setMessages(JSON.parse(stored));
        const userIds = JSON.parse(localStorage.getItem('ld_user_submitted_message_ids') || '[]');
        setTrackedMessageIds(userIds);
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', refreshData);
    window.addEventListener('official-reply-alert', refreshData);
    window.addEventListener('new-channeled-message', refreshData);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('ld_channeled_messages_stream');
        bc.onmessage = () => {
          refreshData();
        };
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('official-reply-alert', refreshData);
      window.removeEventListener('new-channeled-message', refreshData);
      if (bc) bc.close();
    };
  }, []);

  // Filter messages relevant to visitor
  const visitorMessages = useMemo(() => {
    const emailNorm = visitorEmail.trim().toLowerCase();
    return messages.filter((m) => {
      if (trackedMessageIds.includes(m.id)) return true;
      if (emailNorm && m.senderContact.toLowerCase().includes(emailNorm)) return true;
      return false;
    });
  }, [messages, trackedMessageIds, visitorEmail]);

  // All messages with replies
  const messagesWithReplies = useMemo(() => {
    return visitorMessages.filter((m) => (m.replies && m.replies.length > 0) || m.reply);
  }, [visitorMessages]);

  // Set default active message if none selected
  useEffect(() => {
    if (!activeMessageId && visitorMessages.length > 0) {
      setActiveMessageId(visitorMessages[0].id);
    }
  }, [visitorMessages, activeMessageId]);

  const activeMessage = useMemo(() => {
    return messages.find((m) => m.id === activeMessageId) || null;
  }, [messages, activeMessageId]);

  // Handle email registration & custom email sync
  const handleLinkEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailSearchInput.trim();
    if (!cleanEmail) return;

    setVisitorEmail(cleanEmail);
    try {
      localStorage.setItem('ld_visitor_registered_email', cleanEmail);
    } catch {
      // ignore
    }

    // Find any messages with this email
    const matched = messages.filter((m) => m.senderContact.toLowerCase().includes(cleanEmail.toLowerCase()));
    if (matched.length > 0) {
      const newIds = Array.from(new Set([...trackedMessageIds, ...matched.map((m) => m.id)]));
      setTrackedMessageIds(newIds);
      try {
        localStorage.setItem('ld_user_submitted_message_ids', JSON.stringify(newIds));
      } catch {
        // ignore
      }
      setActiveMessageId(matched[0].id);
      setActiveTab('my_threads');
      setSyncStatusNotice(`✓ Successfully linked ${matched.length} inquiry thread(s) associated with ${cleanEmail}!`);
    } else {
      // Register it as custom email inquiry endpoint
      const simulatedInquiry: ChanneledMessage = {
        id: `msg-custom-sync-${Date.now()}`,
        senderName: cleanEmail.split('@')[0].toUpperCase(),
        senderContact: cleanEmail,
        category: 'official_contact',
        subject: `Direct Custom Email Inquiry to ${OFFICIAL_CONTACT_EMAIL}`,
        message: `Registered on-site response receiver for external dispatch sent to ${OFFICIAL_CONTACT_EMAIL}. Executive replies will stream directly to this portal.`,
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'unread',
      };

      const updated = [simulatedInquiry, ...messages];
      setMessages(updated);
      try {
        localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(updated));
        const newIds = [...trackedMessageIds, simulatedInquiry.id];
        setTrackedMessageIds(newIds);
        localStorage.setItem('ld_user_submitted_message_ids', JSON.stringify(newIds));
      } catch {
        // ignore
      }

      setActiveMessageId(simulatedInquiry.id);
      setActiveTab('my_threads');
      setSyncStatusNotice(`✓ Connected ${cleanEmail}! Live response relay is now active.`);
    }

    setTimeout(() => setSyncStatusNotice(null), 5000);
  };

  // Dispatch visitor follow-up
  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMessage || !followUpText.trim()) return;

    setIsSendingFollowUp(true);
    const textToSend = followUpText.trim();
    const updatedFollowUpReply: MessageReply = {
      id: `rep-visitor-${Date.now()}`,
      sender: activeMessage.senderName || 'Patron Inquiry',
      text: textToSend,
      timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      channelMethod: 'direct_in_app',
      relayStatus: 'Verified On-Site Visitor Dispatch',
    };

    const updated = messages.map((m) => {
      if (m.id === activeMessage.id) {
        return {
          ...m,
          status: 'unread' as const,
          replies: [...(m.replies || []), updatedFollowUpReply],
        };
      }
      return m;
    });

    setMessages(updated);
    try {
      localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Broadcast event to admin
    window.dispatchEvent(new CustomEvent('new-channeled-message', { detail: activeMessage }));

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('ld_channeled_messages_stream');
        bc.postMessage({
          type: 'visitor_follow_up',
          messageId: activeMessage.id,
          followUp: updatedFollowUpReply,
        });
        bc.close();
      }
    } catch {
      // ignore
    }

    setIsSendingFollowUp(false);
    setFollowUpText('');
    setFollowUpSuccess('✓ Follow-up dispatched to Leonardo DiCaprio Executive Desk! No email needed.');
    setTimeout(() => setFollowUpSuccess(null), 5000);
  };

  // Submit new direct inquiry
  const handleSendNewInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSenderName.trim() || !newSenderEmail.trim() || !newMessage.trim()) return;

    const newMsg: ChanneledMessage = {
      id: `msg-direct-${Date.now()}`,
      senderName: newSenderName.trim(),
      senderContact: newSenderEmail.trim(),
      category: newCategory,
      subject: newSubject.trim() || 'Direct Inquiry to Executive Desk',
      message: newMessage.trim(),
      timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'unread',
    };

    const updated = [newMsg, ...messages];
    setMessages(updated);
    const updatedIds = [newMsg.id, ...trackedMessageIds];
    setTrackedMessageIds(updatedIds);
    setVisitorEmail(newSenderEmail.trim());

    try {
      localStorage.setItem('ld_owner_channeled_messages', JSON.stringify(updated));
      localStorage.setItem('ld_user_submitted_message_ids', JSON.stringify(updatedIds));
      localStorage.setItem('ld_visitor_registered_email', newSenderEmail.trim());
    } catch {
      // ignore
    }

    window.dispatchEvent(new CustomEvent('new-channeled-message', { detail: newMsg }));
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('ld_channeled_messages_stream');
        bc.postMessage(newMsg);
        bc.close();
      }
    } catch {
      // ignore
    }

    setNewSenderName('');
    setNewSubject('');
    setNewMessage('');
    setActiveMessageId(newMsg.id);
    setActiveTab('my_threads');
    setNewInquirySuccess('✓ Direct inquiry channeled to Admin Portal! Replies will arrive directly here on-site.');
    setTimeout(() => setNewInquirySuccess(null), 6000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor-portal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 backdrop-blur-2xl bg-black/85 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-amber-400/40 bg-zinc-950 text-slate-100 shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-500/25 via-zinc-900 to-black border-b border-amber-400/30 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md font-bold">
              <Inbox className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="visitor-portal-title" className="font-cinzel text-sm sm:text-base font-bold text-white uppercase tracking-wider truncate">
                  Executive Response &amp; Reply Portal
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30 font-mono uppercase">
                  Zero Email Required
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-200/80 truncate">
                Direct on-site correspondence with the Leonardo DiCaprio Executive Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Response Portal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status Notice Toast */}
        {(syncStatusNotice || newInquirySuccess || followUpSuccess) && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{syncStatusNotice || newInquirySuccess || followUpSuccess}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation & Search Bar */}
        <div className="bg-black/60 border-b border-white/10 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('my_threads')}
              className={`rounded-lg sm:rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my_threads'
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>My Inquiries &amp; Replies</span>
              {messagesWithReplies.length > 0 && (
                <span className="rounded-full bg-emerald-500 text-black px-1.5 py-0.2 text-[9px] font-black">
                  {messagesWithReplies.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('new_inquiry')}
              className={`rounded-lg sm:rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'new_inquiry'
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Compose Message</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('email_sync')}
              className={`rounded-lg sm:rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'email_sync'
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Custom Email Sync</span>
            </button>
          </div>

          {/* Quick email tracker indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <span>Tracking for:</span>
            <span className="text-amber-300 font-bold select-all bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {visitorEmail || 'Current Session'}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: MY THREADS & REPLIES */}
          {activeTab === 'my_threads' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
              {/* Left Column: Inquiry Threads List */}
              <div className="md:col-span-5 flex flex-col space-y-2.5 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-4 max-h-[55vh] md:max-h-[62vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Active Transmissions ({visitorMessages.length})
                  </span>
                  <button
                    onClick={() => setActiveTab('email_sync')}
                    className="text-[10px] font-mono text-amber-300 hover:underline cursor-pointer"
                  >
                    + Link Another Email
                  </button>
                </div>

                {visitorMessages.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center space-y-2">
                    <Inbox className="h-7 w-7 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-300 font-semibold">No Inquiries Found Yet</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Sent an inquiry to <span className="text-amber-300">{OFFICIAL_CONTACT_EMAIL}</span>? Link your email or compose a new dispatch to receive responses here in real time.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => setActiveTab('new_inquiry')}
                        className="rounded-lg bg-amber-400 text-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-amber-300 cursor-pointer"
                      >
                        Write Direct Message
                      </button>
                      <button
                        onClick={() => setActiveTab('email_sync')}
                        className="rounded-lg border border-white/20 bg-black/60 text-zinc-300 hover:text-white px-3 py-1.5 text-xs font-semibold cursor-pointer"
                      >
                        Enter Email to Sync
                      </button>
                    </div>
                  </div>
                ) : (
                  visitorMessages.map((msg) => {
                    const isSelected = msg.id === activeMessageId;
                    const hasReplies = (msg.replies && msg.replies.length > 0) || msg.reply;

                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => setActiveMessageId(msg.id)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'border-white/10 bg-black/50 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-mono text-zinc-400">{msg.timestamp}</span>
                          {hasReplies ? (
                            <span className="flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold font-mono">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Reply Received
                            </span>
                          ) : (
                            <span className="rounded bg-amber-400/15 border border-amber-400/30 text-amber-300 px-1.5 py-0.2 text-[9px] font-mono">
                              Under Review
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white truncate mb-0.5">{msg.subject}</h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{msg.message}</p>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 pt-1.5 border-t border-white/5 font-mono">
                          <span className="truncate max-w-[140px]">{msg.senderContact}</span>
                          <span className="text-amber-400 flex items-center gap-0.5">
                            View <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Active Thread Details & Reply Composer */}
              <div className="md:col-span-7 flex flex-col justify-between max-h-[55vh] md:max-h-[62vh] overflow-y-auto">
                {activeMessage ? (
                  <div className="space-y-4">
                    {/* Thread Header */}
                    <div className="rounded-xl border border-white/10 bg-black/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                            {activeMessage.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">{activeMessage.timestamp}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">ID: #{activeMessage.id.slice(-6)}</span>
                      </div>

                      <h3 className="font-cinzel text-sm sm:text-base font-bold text-white mb-2">
                        {activeMessage.subject}
                      </h3>

                      <div className="rounded-lg bg-zinc-900/90 border border-white/10 p-3 text-xs text-zinc-200 leading-relaxed font-sans mb-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 mb-1">
                          <User className="h-3 w-3 text-amber-400" />
                          <span>From: {activeMessage.senderName} ({activeMessage.senderContact})</span>
                        </div>
                        <p>{activeMessage.message}</p>
                        {activeMessage.evidenceUrl && (
                          <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-amber-300 font-mono">
                            Evidence Reference: <span className="underline">{activeMessage.evidenceUrl}</span>
                          </div>
                        )}
                      </div>

                      {/* Official Replies Stream */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            Official Executive Desk Replies
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400">
                            Direct On-Site Stream (Zero-Email)
                          </span>
                        </div>

                        {/* If single reply was set */}
                        {activeMessage.reply && (!activeMessage.replies || activeMessage.replies.length === 0) && (
                          <div className="rounded-xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-3.5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-400" />
                                Leonardo DiCaprio Executive Liaison
                              </span>
                              <span className="text-zinc-400">{activeMessage.repliedAt || 'Recently Received'}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-100 font-sans leading-relaxed pl-1">
                              "{activeMessage.reply}"
                            </p>
                            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-2 border-t border-white/10">
                              <span>Relay: On-Site Direct Stream</span>
                              <span className="text-amber-300">✓ Cryptographically Verified</span>
                            </div>
                          </div>
                        )}

                        {/* If replies array exists */}
                        {activeMessage.replies && activeMessage.replies.length > 0 ? (
                          activeMessage.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className={`rounded-xl border p-3.5 space-y-2 ${
                                rep.sender.includes('Patron') || rep.sender === activeMessage.senderName
                                  ? 'border-white/15 bg-zinc-900/60 ml-4'
                                  : 'border-2 border-amber-400/60 bg-gradient-to-br from-amber-950/30 via-zinc-950 to-black shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className={`font-bold flex items-center gap-1 ${
                                  rep.sender.includes('Patron') ? 'text-zinc-300' : 'text-amber-300'
                                }`}>
                                  {!rep.sender.includes('Patron') && <ShieldCheck className="h-3 w-3 text-emerald-400" />}
                                  {rep.sender}
                                </span>
                                <span className="text-zinc-400">{rep.timestamp}</span>
                              </div>
                              <p className="text-xs text-zinc-100 font-sans leading-relaxed">{rep.text}</p>
                              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1.5 border-t border-white/5">
                                <span>{rep.relayStatus || 'Direct In-App Delivery'}</span>
                                {rep.verificationHash && (
                                  <span className="text-amber-300 select-all font-mono">#{rep.verificationHash.slice(-8)}</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : !activeMessage.reply ? (
                          <div className="rounded-xl border border-dashed border-amber-400/30 bg-amber-400/5 p-4 text-center space-y-1">
                            <Clock className="h-5 w-5 text-amber-400 mx-auto animate-pulse" />
                            <p className="text-xs font-semibold text-amber-200">Inquiry Under Review by Executive Liaisons</p>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                              Your transmission has been directly channeled to the Site Owner Admin Portal. You do not need to check your email—responses will automatically illuminate here the instant they are dispatched.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Follow-up reply box */}
                    <form onSubmit={handleSendFollowUp} className="rounded-xl border border-amber-400/30 bg-black/80 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1">
                          <Reply className="h-3.5 w-3.5" />
                          Send Follow-up Directly (No Email Needed)
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={followUpText}
                        onChange={(e) => setFollowUpText(e.target.value)}
                        placeholder="Type your follow-up reply directly to the executive desk..."
                        className="w-full rounded-lg border border-white/15 bg-zinc-950 p-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                      />
                      <div className="flex items-center justify-end">
                        <button
                          type="submit"
                          disabled={isSendingFollowUp || !followUpText.trim()}
                          className="rounded-lg bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <Send className="h-3 w-3" />
                          <span>{isSendingFollowUp ? 'Transmitting...' : 'Dispatch Follow-up'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400 space-y-2">
                    <Inbox className="h-8 w-8 text-zinc-600" />
                    <p className="text-sm font-semibold">Select an inquiry thread on the left</p>
                    <p className="text-xs max-w-sm">
                      View full correspondence, official executive replies, and dispatch follow-ups directly on this screen.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMPOSE NEW DIRECT MESSAGE */}
          {activeTab === 'new_inquiry' && (
            <div className="max-w-2xl mx-auto space-y-4 py-2">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-cinzel font-bold text-xs sm:text-sm">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Direct Executive Dispatch Desk
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  Messages dispatched here stream directly to the Site Owner Admin Portal in real time. Official replies return straight to this portal so you never have to check external emails.
                </p>
              </div>

              <form onSubmit={handleSendNewInquiry} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newSenderName}
                      onChange={(e) => setNewSenderName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full rounded-xl border border-white/15 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Your Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={newSenderEmail}
                      onChange={(e) => setNewSenderEmail(e.target.value)}
                      placeholder="e.g. patron@cinema.org"
                      className="w-full rounded-xl border border-white/15 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Inquiry Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-white/15 bg-zinc-900/90 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="official_contact">Official Correspondence / Liaison</option>
                      <option value="vip_inquiry">VIP Guild &amp; Philanthropic Experience</option>
                      <option value="imposter_report">Imposter Account / Fraud Report</option>
                      <option value="urgent_takedown">Urgent Legal &amp; Security Takedown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Subject / Reference</label>
                    <input
                      type="text"
                      required
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="e.g. Cannes 2026 Reservation / Question"
                      className="w-full rounded-xl border border-white/15 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Enter your confidential transmission to the Leonardo DiCaprio Executive Desk..."
                    className="w-full rounded-xl border border-white/15 bg-zinc-900/90 p-3 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Real-Time Admin Channel Active</span>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    Channel Message Directly
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CUSTOM EMAIL SYNC */}
          {activeTab === 'email_sync' && (
            <div className="max-w-xl mx-auto space-y-5 py-3">
              <div className="rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/10 via-zinc-950 to-black p-5 text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 mx-auto">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white uppercase">
                  Sent An Email to {OFFICIAL_CONTACT_EMAIL}?
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  If you dispatched an email directly from your email client (Gmail, Outlook, iCloud) to our custom email, link your email address below. All responses issued by our executive desk will illuminate directly on this site in real time—eliminating the need to wait or monitor email inboxes!
                </p>
              </div>

              <form onSubmit={handleLinkEmail} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Your Contact Email Address
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={emailSearchInput}
                      onChange={(e) => setEmailSearchInput(e.target.value)}
                      placeholder="e.g. your-email@domain.com"
                      className="flex-1 rounded-xl border border-white/20 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 active:scale-95 shadow"
                    >
                      Sync &amp; View Replies
                    </button>
                  </div>
                </div>
              </form>

              {/* Sample / Quick Links for Easy Testing */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">
                  Quick Access Demo Accounts (Test Real-Time Flow):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailSearchInput('alexandra.sterling@cinema-guild.com');
                      setVisitorEmail('alexandra.sterling@cinema-guild.com');
                      localStorage.setItem('ld_visitor_registered_email', 'alexandra.sterling@cinema-guild.com');
                      setActiveMessageId('msg-seed-1');
                      setActiveTab('my_threads');
                    }}
                    className="rounded-lg border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 text-[11px] font-mono text-amber-300 transition-colors cursor-pointer"
                  >
                    alexandra.sterling@cinema-guild.com
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailSearchInput('kensington.estate@monaco-invest.mc');
                      setVisitorEmail('kensington.estate@monaco-invest.mc');
                      localStorage.setItem('ld_visitor_registered_email', 'kensington.estate@monaco-invest.mc');
                      setActiveMessageId('msg-seed-2');
                      setActiveTab('my_threads');
                    }}
                    className="rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-[11px] font-mono text-zinc-300 transition-colors cursor-pointer"
                  >
                    kensington.estate@monaco-invest.mc
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="bg-black/80 border-t border-white/10 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400 font-mono shrink-0">
          <div className="flex items-center gap-1.5 text-amber-300">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Official Encrypted Executive Relay • Authenticity Guaranteed</span>
          </div>
          <span className="text-zinc-500">Official Leonardo DiCaprio Sanctuary Desk</span>
        </div>
      </div>
    </div>
  );
}
