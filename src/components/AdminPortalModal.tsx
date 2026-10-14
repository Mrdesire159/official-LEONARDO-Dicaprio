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
  PackageCheck
} from 'lucide-react';
import { Testimonial, UserProfile, OrderRecord, LuxuryTheme } from '../types';
import { THEME_CONFIGS, TESTIMONIALS as DEFAULT_TESTIMONIALS } from '../data/diCaprioData';

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
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ld_owner_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [enteredPasskey, setEnteredPasskey] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'testimonials' | 'visitors' | 'settings'>('testimonials');

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

  const themeConfig = THEME_CONFIGS[currentTheme];

  if (!isOpen) return null;

  const handleAuthenticate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPass = enteredPasskey.trim();
    if (cleanPass === DEFAULT_OWNER_PASSKEY) {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        sessionStorage.setItem('ld_owner_authenticated', 'true');
      } catch {
        // ignore
      }
    } else {
      setAuthError('Incorrect Site Owner Passcode. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('ld_owner_authenticated');
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
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-xl hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                <span>Unlock Owner Portal</span>
              </button>
            </form>
          </div>
        ) : (
          /* 2. AUTHENTICATED PORTAL WORKSPACE */
          <div>
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

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Lock Session</span>
                </button>
              </div>
            </div>

            {/* Navigation tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all flex items-center gap-2 ${
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
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all flex items-center gap-2 ${
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
                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === 'settings'
                    ? 'bg-amber-400 text-black font-bold shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span>Directory Presets</span>
              </button>
            </div>

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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
