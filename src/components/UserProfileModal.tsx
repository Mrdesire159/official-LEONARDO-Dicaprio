import { useState } from 'react';
import {
  X,
  ShoppingBag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
  Truck,
  Ticket,
  QrCode,
  Printer,
} from 'lucide-react';
import { OrderRecord, UserProfile, LuxuryTheme } from '../types';
import { THEME_CONFIGS } from '../data/diCaprioData';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  orders: OrderRecord[];
  currentTheme: LuxuryTheme;
  onOpenCheckout?: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  orders,
  currentTheme,
}: UserProfileModalProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activePassModalOrder, setActivePassModalOrder] = useState<OrderRecord | null>(null);

  const themeConfig = THEME_CONFIGS[currentTheme];

  if (!isOpen) return null;

  const filteredOrders = orders.filter((order) => {
    if (selectedStatusFilter === 'all') return true;
    if (selectedStatusFilter === 'active') return order.status === 'ready_for_venue' || order.status === 'shipped';
    if (selectedStatusFilter === 'processing') return order.status === 'pending_approval' || order.status === 'confirmed' || order.status === 'engraving';
    return true;
  });

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'ready_for_venue':
        return {
          label: 'Ready for Venue Check-In',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          step: 4,
        };
      case 'shipped':
        return {
          label: 'Armored Courier In Transit',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          step: 3,
        };
      case 'engraving':
        return {
          label: 'Physical Metal Card Engraving',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          step: 2,
        };
      case 'pending_approval':
        return {
          label: 'Awaiting Telegram Approval & Payment',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          step: 1,
        };
      case 'confirmed':
      default:
        return {
          label: 'Order Confirmed & Credentials Minted',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          step: 1,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/20 bg-zinc-950 p-5 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          aria-label="Close Profile"
        >
          <X className="h-5 w-5" />
        </button>

        {/* PURCHASE HISTORY HEADER & FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: themeConfig.accent }} />
              <h3 className="font-cinzel text-xl font-bold text-white">
                Purchase History &amp; Order Status
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Track your physical metal card engraving, armored courier delivery, and digital venue credentials.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
            {[
              { id: 'all', label: `All (${orders.length})` },
              { id: 'active', label: 'Active Passes' },
              { id: 'processing', label: 'In Production' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedStatusFilter === f.id
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-white/15 bg-white/5">
            <ShoppingBag className="mx-auto h-10 w-10 text-zinc-600 mb-2" />
            <p className="font-cinzel text-base text-zinc-300">No orders found in this filter.</p>
            <p className="text-xs text-zinc-500 mt-1">Reserve a Gold or Silver VIP Card in the store to see live order tracking.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusBadge(order.status);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/15 bg-zinc-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-xl transition-all hover:border-amber-400/40"
                >
                  {/* Order Top Bar: Order ID, Date & Total */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300">
                        <Ticket className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            #{order.orderNumber}
                          </span>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400">
                          Purchased on {order.date}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Total Billed</span>
                      <span className="font-cinzel text-xl font-black text-amber-300">
                        ${order.totalAmount.toLocaleString()} USD
                      </span>
                    </div>
                  </div>

                  {/* 4-STEP ORDER PROGRESS PIPELINE */}
                  <div className="mb-6 rounded-xl bg-black/40 border border-white/10 p-3 sm:p-4">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
                      Order Fulfillment Status Pipeline:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      {[
                        { stepNum: 1, title: 'Confirmed & Paid', icon: CheckCircle2 },
                        { stepNum: 2, title: 'Card Engraving', icon: Package },
                        { stepNum: 3, title: 'Armored Courier', icon: Truck },
                        { stepNum: 4, title: 'Venue Check-In Ready', icon: ShieldCheck },
                      ].map((s) => {
                        const Icon = s.icon;
                        const isDone = statusInfo.step >= s.stepNum;
                        const isCurrent = statusInfo.step === s.stepNum;
                        return (
                          <div
                            key={s.stepNum}
                            className={`rounded-lg p-2 border transition-all ${
                              isDone
                                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                                : 'border-white/5 bg-white/5 text-zinc-500'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                              <Icon className={`h-3.5 w-3.5 ${isDone ? 'text-emerald-400' : 'text-zinc-600'}`} />
                              <span className="text-[10px] font-mono">0{s.stepNum}</span>
                            </div>
                            <span className={`text-[10px] font-bold block ${isCurrent ? 'text-amber-300' : ''}`}>
                              {s.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-zinc-400 text-center italic">
                      "{order.statusDescription}"
                    </p>
                  </div>

                  {/* Items in this order */}
                  <div className="space-y-3 mb-5">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={it.image}
                            alt={it.title}
                            className="h-12 w-12 rounded-lg object-contain bg-black/50 border border-white/10 p-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              {it.tier && (
                                <span className="rounded bg-amber-400/20 text-amber-300 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase">
                                  {it.tier} Tier
                                </span>
                              )}
                              <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white">
                                {it.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-zinc-400">{it.subtitle}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-white">
                            Qty: {it.quantity}
                          </span>
                          <span className="font-cinzel text-xs text-amber-200 block">
                            ${(it.price * it.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Logistics & Venue Credentials Card Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-5 rounded-xl border border-white/10 bg-black/30 p-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Courier Tracking</span>
                      <span className="font-mono text-zinc-200">{order.trackingNumber}</span>
                      <span className="text-[10px] text-zinc-400 block">{order.courier}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Gala Event &amp; Venue</span>
                      <span className="font-semibold text-white">{order.venueEvent}</span>
                      <span className="text-[10px] text-amber-300 block">{order.venueDate} · {order.seatZone}</span>
                    </div>
                  </div>

                  {/* Action Buttons: View Digital Pass / Print Ticket */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <QrCode className="h-4 w-4 text-amber-300" />
                      <span>Pass Serial: {order.qrCodeSerial}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print Receipt</span>
                      </button>

                      <button
                        onClick={() => setActivePassModalOrder(order)}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black hover:bg-amber-300 transition-colors shadow"
                      >
                        <Ticket className="h-3.5 w-3.5" />
                        <span>View VIP Pass &amp; QR</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DIGITAL PASS INSPECTOR POPUP */}
        {activePassModalOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4 backdrop-blur-3xl animate-in zoom-in-95 duration-200">
            <div className="relative w-full max-w-md rounded-3xl border border-amber-400/40 bg-zinc-950 p-6 sm:p-7 shadow-2xl text-center">
              <button
                onClick={() => setActivePassModalOrder(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="h-12 w-12 mx-auto rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mb-3">
                <Ticket className="h-6 w-6" />
              </div>

              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                Official Digital Venue Pass
              </span>
              <h3 className="font-cinzel text-xl font-bold text-white mt-1">
                {activePassModalOrder.items[0]?.title || 'Leonardo DiCaprio Gala Pass'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Order #{activePassModalOrder.orderNumber} · Verified VIP Pass
              </p>

              {/* QR Code Container */}
              <div className="my-6 p-4 rounded-2xl bg-white mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-2xl">
                <QrCode className="h-36 w-36 text-black" />
                <span className="font-mono text-[9px] font-bold text-zinc-800 mt-1">
                  {activePassModalOrder.qrCodeSerial}
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-left space-y-1 mb-5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Venue:</span>
                  <span className="text-white font-semibold">{activePassModalOrder.venueEvent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date &amp; Time:</span>
                  <span className="text-amber-200">{activePassModalOrder.venueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Security Clearance:</span>
                  <span className="text-emerald-400 font-bold">Verified &amp; Valid</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full rounded-xl bg-amber-400 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-300"
              >
                Download / Print Venue Badge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
