import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { ChanneledMessage, LuxuryTheme } from '../types';
import { THEME_CONFIGS, OFFICIAL_CONTACT_EMAIL } from '../data/diCaprioData';

interface NotificationBasePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: LuxuryTheme;
  onOpenResponsePortal: (messageId?: string) => void;
  unreadCount: number;
}

export function NotificationBasePopover({
  isOpen,
  onClose,
  currentTheme,
  onOpenResponsePortal,
  unreadCount,
}: NotificationBasePopoverProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];
  const [messages, setMessages] = useState<ChanneledMessage[]>(() => {
    try {
      const stored = localStorage.getItem('ld_owner_channeled_messages');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ld_notification_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Track user submitted message IDs
  const [userMsgIds, setUserMsgIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ld_user_submitted_message_ids') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('ld_owner_channeled_messages');
        if (stored) setMessages(JSON.parse(stored));
        const ids = JSON.parse(localStorage.getItem('ld_user_submitted_message_ids') || '[]');
        setUserMsgIds(ids);
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('official-reply-alert', handleStorage);
    window.addEventListener('new-channeled-message', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('official-reply-alert', handleStorage);
      window.removeEventListener('new-channeled-message', handleStorage);
    };
  }, []);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem('ld_notification_sound_enabled', String(nextVal));
    } catch {
      // ignore
    }
  };

  // Find notifications: messages that have replies or are user submitted
  const activeNotifications = messages.filter((m) => {
    const hasReplies = (m.replies && m.replies.length > 0) || m.reply;
    const isUserTracked = userMsgIds.includes(m.id);
    return hasReplies || isUserTracked;
  }).slice(0, 6);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-amber-400/40 bg-zinc-950/98 p-4 text-white shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-black font-bold">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-cinzel text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Notification Base
            </h3>
            <span className="text-[10px] text-amber-300 font-mono block">
              Direct Custom Email &amp; Inquiries Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5 text-zinc-500" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close notification panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Live sync banner */}
      <div className="mt-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-2 text-[10px] font-mono text-emerald-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Syncing {OFFICIAL_CONTACT_EMAIL}</span>
        </div>
        <span className="text-[9px] uppercase font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40">
          Zero Email Needed
        </span>
      </div>

      {/* Notifications list */}
      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
        {activeNotifications.length === 0 ? (
          <div className="p-4 text-center space-y-1.5 rounded-xl border border-white/5 bg-white/5">
            <Inbox className="h-6 w-6 text-zinc-500 mx-auto" />
            <p className="text-xs text-zinc-300 font-semibold">No New Notifications</p>
            <p className="text-[10px] text-zinc-400">
              When you send an inquiry to {OFFICIAL_CONTACT_EMAIL} or through the site, live executive responses will illuminate here.
            </p>
          </div>
        ) : (
          activeNotifications.map((msg) => {
            const hasReplies = (msg.replies && msg.replies.length > 0) || msg.reply;
            const latestReply = msg.replies && msg.replies.length > 0 ? msg.replies[msg.replies.length - 1].text : msg.reply;

            return (
              <div
                key={msg.id}
                onClick={() => {
                  onOpenResponsePortal(msg.id);
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-white/10 bg-black/60 hover:border-amber-400/50 hover:bg-amber-400/5 transition-all cursor-pointer space-y-1 group"
              >
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                  <span className="text-zinc-400">{msg.timestamp}</span>
                  {hasReplies ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                      Reply Ready
                    </span>
                  ) : (
                    <span className="text-amber-300 font-mono">Under Review</span>
                  )}
                </div>

                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                  {msg.subject}
                </p>

                {hasReplies && (
                  <p className="text-[11px] text-zinc-300 line-clamp-2 bg-zinc-900/90 p-1.5 rounded-lg border border-white/10 italic">
                    "{latestReply}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono pt-1">
                  <span className="truncate max-w-[170px]">{msg.senderContact}</span>
                  <span className="text-amber-400 flex items-center gap-0.5 group-hover:underline">
                    View in Portal <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            onOpenResponsePortal();
            onClose();
          }}
          className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black py-2 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow text-center flex items-center justify-center gap-1.5"
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>Open Full Response Portal</span>
        </button>
      </div>
    </div>
  );
}
