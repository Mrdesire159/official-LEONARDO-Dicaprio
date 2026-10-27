export type LuxuryTheme = 'gold' | 'platinum' | 'emerald' | 'sapphire' | 'ruby';

export type PageId = 'home' | 'biography' | 'filmography' | 'vip-guild' | 'gallery' | 'verification' | 'testimonials';

export interface ThemeConfig {
  id: LuxuryTheme;
  name: string;
  accent: string;
  borderGlow: string;
  badgeBg: string;
  gradientText: string;
  heroGlow: string;
  neonShadow: string;
}

export interface PhotoAsset {
  id: string;
  title: string;
  filename: string;
  url: string;
  fallbackUrl: string;
  year: string;
  filmOrEvent: string;
  description: string;
  themeMatch: LuxuryTheme;
  aspectRatio: string;
  badgeText: string;
}

export interface FilmMilestone {
  id: string;
  year: number;
  title: string;
  role: string;
  director: string;
  boxOffice: string;
  awardsWon: string[];
  description: string;
  quote: string;
  image: string;
  posterBg: string;
  accentColor: string;
}

export interface AwardMedal {
  id: string;
  title: string;
  year: number;
  organization: string;
  category: string;
  film: string;
  result: 'Won' | 'Nominated';
  speechExcerpt: string;
  trophyType: 'oscar' | 'golden-globe' | 'bafta' | 'sag' | 'bear';
  accentColor: string;
  orbitAngle: number;
  orbitRadius: number;
}

export interface StoreItem {
  id: string;
  tier?: 'Silver' | 'Gold' | 'Platinum' | 'Collector';
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  description: string;
  perks: string[];
  badge: string;
  image: string;
  inStock: boolean;
  stockCount: number;
  isSoldOut?: boolean;
  holographicType: 'silver' | 'gold' | 'platinum' | 'collector';
  category: 'meet-and-greet' | 'signed-memorabilia' | 'apparel' | 'props';
}

export interface CartItem {
  item: StoreItem;
  quantity: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  context: string;
  location?: string;
  avatar: string;
  rating: number;
  verified: boolean;
  category?: 'directors' | 'costars' | 'conservation' | 'patrons';
}

export interface SocialProofBadge {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
  iconType: string;
}

export type OrderStatus = 'pending_approval' | 'confirmed' | 'engraving' | 'shipped' | 'ready_for_venue';

export interface OrderItemSummary {
  itemId: string;
  title: string;
  subtitle: string;
  tier?: 'Silver' | 'Gold' | 'Platinum' | 'Collector';
  image: string;
  price: number;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItemSummary[];
  subtotal: number;
  discount: number;
  conciergeFee: number;
  totalAmount: number;
  status: OrderStatus;
  statusLabel: string;
  statusDescription: string;
  trackingNumber: string;
  courier: string;
  attendeeName: string;
  attendeeEmail: string;
  venueEvent: string;
  venueDate: string;
  seatZone: string;
  qrCodeSerial: string;
}

export interface UserProfile {
  name: string;
  email: string;
  patronId: string;
  tier: string;
  joinedDate: string;
  avatarUrl: string;
  totalSpend: number;
  loyaltyPoints: number;
  location?: string;
  phone?: string;
  status?: 'active' | 'vip_elevated' | 'alumni' | 'pending';
  conciergeNotes?: string;
}

export interface MessageReply {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  channelMethod?: 'direct_in_app' | 'email' | 'official_desk';
}

export interface ChanneledMessage {
  id: string;
  senderName: string;
  senderContact: string;
  category: 'imposter_report' | 'vip_inquiry' | 'official_contact' | 'urgent_takedown';
  subject: string;
  message: string;
  evidenceUrl?: string;
  timestamp: string;
  status: 'unread' | 'read' | 'resolved';
  reply?: string;
  repliedAt?: string;
  replies?: MessageReply[];
}

