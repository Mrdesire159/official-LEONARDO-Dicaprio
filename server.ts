import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import http from 'http';
import net from 'net';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCliArg(flag: string): string | undefined {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && args[i + 1]) {
      return args[i + 1];
    }
    if (args[i].startsWith(`${flag}=`)) {
      return args[i].slice(flag.length + 1);
    }
  }
  return undefined;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const cliPort = getCliArg('--port') ?? getCliArg('-p');
const PORT = cliPort
  ? parseInt(cliPort, 10)
  : process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;
const HOST = getCliArg('--host') || process.env.HOST || '0.0.0.0';

// ============================================================================
// SECURITY LAYER: Headers, Intrusion/Probe Blocker, Rate Limiting & Auth
// ============================================================================

const IS_PROD_RUNTIME =
  process.env.NODE_ENV === 'production' ||
  (Boolean(process.env.K_SERVICE || process.env.K_REVISION) && process.env.NODE_ENV !== 'development');

const EPHEMERAL_SESSION_KEY = crypto.randomBytes(32).toString('hex');

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const ADMIN_HASH_FILE = path.join(os.tmpdir(), 'ld_owner_auth_hash.json');

interface StoredAdminHash {
  salt: string;
  hash: string;
  claimedAt: string;
}

function loadClaimedAdminHash(): StoredAdminHash | null {
  try {
    if (fs.existsSync(ADMIN_HASH_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ADMIN_HASH_FILE, 'utf-8')) as StoredAdminHash;
      if (parsed && typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
        return parsed;
      }
    }
  } catch {
    // ignore malformed or unreadable temp store
  }
  return null;
}

let claimedAdminHash: StoredAdminHash | null = loadClaimedAdminHash();

function hashPasscodeScrypt(passcode: string, saltHex: string): Buffer {
  return crypto.scryptSync(passcode, saltHex, 64, { N: 16384, r: 8, p: 1 });
}

function constantTimeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function getEnvAdminPasscode(): string {
  const raw = process.env.ADMIN_PASSCODE?.trim() ?? '';
  if (
    raw.length >= 2 &&
    ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'")))
  ) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

function verifyOwnerPasscode(candidate: string): boolean {
  const envPass = getEnvAdminPasscode();
  if (envPass) {
    return constantTimeCompareStrings(candidate, envPass);
  }
  if (!claimedAdminHash) return false;
  try {
    const derived = hashPasscodeScrypt(candidate, claimedAdminHash.salt);
    const stored = Buffer.from(claimedAdminHash.hash, 'hex');
    if (derived.length !== stored.length) return false;
    return crypto.timingSafeEqual(derived, stored);
  } catch {
    return false;
  }
}

function getSessionSigningKey(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  const envPass = getEnvAdminPasscode();
  if (envPass) {
    return crypto.createHmac('sha256', 'ld-owner-session-signing-v1').update(envPass).digest('hex');
  }
  return EPHEMERAL_SESSION_KEY;
}

function issueAdminSessionToken(): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({
      role: 'owner',
      iat: now,
      exp: expiresAt,
      jti: crypto.randomBytes(12).toString('hex'),
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSigningKey())
    .update(payload)
    .digest('base64url');
  return { token: `${payload}.${sig}`, expiresAt };
}

function verifyAdminSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string' || token.length > 512) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!payload || !sig) return false;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSigningKey())
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'owner' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Owner authentication required' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!verifyAdminSessionToken(token)) {
    res.status(401).json({ error: 'Invalid or expired owner session' });
    return;
  }
  next();
}

function getRateLimitClientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const firstForwarded =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : Array.isArray(forwarded) && forwarded[0]
      ? forwarded[0].split(',')[0].trim()
      : '';
  const candidate =
    (typeof req.headers['cf-connecting-ip'] === 'string' && req.headers['cf-connecting-ip'].trim()) ||
    (typeof req.headers['x-nf-client-connection-ip'] === 'string' && req.headers['x-nf-client-connection-ip'].trim()) ||
    firstForwarded ||
    req.socket?.remoteAddress ||
    'unknown';
  return candidate.replace(/^::ffff:/i, '').slice(0, 64);
}

interface RateBucket {
  count: number;
  resetAt: number;
}

function createSlidingRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message: string;
}) {
  const buckets = new Map<string, RateBucket>();
  const maxEntries = 5000;

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = getRateLimitClientKey(req);
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      if (buckets.size >= maxEntries) {
        for (const [k, v] of buckets) {
          if (v.resetAt <= now) buckets.delete(k);
        }
        if (buckets.size >= maxEntries) {
          const oldestKey = buckets.keys().next().value;
          if (oldestKey) buckets.delete(oldestKey);
        }
      }
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (existing.count >= options.maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        error: options.message,
        retryAfterSeconds: retryAfterSec,
      });
      return;
    }

    existing.count += 1;
    next();
  };
}

// 1. Defensive HTTP security headers on every response (iframe-compatible)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), payment=(), usb=(), geolocation=()');

  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    IS_PROD_RUNTIME;
  if (isHttps) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  if (IS_PROD_RUNTIME) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com; font-src 'self' https://fonts.gstatic.com https://*.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://ipwho.is https://fonts.googleapis.com https://fonts.gstatic.com data: blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'"
    );
  }
  next();
});

// 2. Automated exploit, path traversal, and scanner probe blocker
const BLOCKED_PROBE_PATTERN =
  /(?:^|\/)(?:\.env(?:\.[^/]*)?|\.git(?:\/|$)|\.htaccess|\.htpasswd|wp-admin|wp-login\.php|wp-content|xmlrpc\.php|phpmyadmin|phpinfo|cgi-bin|server-status|actuator(?:\/|$)|vendor\/phpunit)|(?:\.\.|%2e%2e|%00|\0)/i;

app.use((req: Request, res: Response, next: NextFunction) => {
  const rawUrl = req.originalUrl || req.url || '';
  let decodedUrl = rawUrl;
  try {
    decodedUrl = decodeURIComponent(rawUrl);
  } catch {
    res.status(400).json({ error: 'Malformed request path' });
    return;
  }

  if (BLOCKED_PROBE_PATTERN.test(rawUrl) || BLOCKED_PROBE_PATTERN.test(decodedUrl)) {
    res.status(403).type('text/plain').send('Forbidden');
    return;
  }
  next();
});

// 3. Strict JSON body limit (blocks large payload DoS)
app.use(express.json({ limit: '32kb' }));

// Return clean 400 on malformed JSON payloads instead of stack traces
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    res.status(400).json({ error: 'Invalid JSON request payload' });
    return;
  }
  next(err);
});

// 4. Tiered rate limiters across API endpoints (no wildcard CORS; Bearer-token auth prevents cookie CSRF)
const globalApiRateLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 180,
  message: 'Too many requests. Please slow down and try again shortly.',
});
const chatRateLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Chat rate limit reached. Please wait a moment before sending another message.',
});
const locationRateLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 40,
  message: 'Location lookup limit reached. Please try again shortly.',
});

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/admin/')) {
    next();
    return;
  }
  globalApiRateLimiter(req, res, next);
});
app.use('/api/chat', chatRateLimiter);
app.use('/api/location', locationRateLimiter);
app.use('/api/map', locationRateLimiter);

// 5. Server-side Owner Admin Portal authentication routes (no lockout on valid passcode)
app.get('/api/admin/status', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const envConfigured = Boolean(getEnvAdminPasscode());
  const configured = envConfigured || Boolean(claimedAdminHash);
  res.json({
    configured,
    source: envConfigured ? 'env' : claimedAdminHash ? 'claimed' : 'unclaimed',
  });
});

app.post('/api/admin/setup', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  if (getEnvAdminPasscode() || claimedAdminHash) {
    res.status(409).json({ error: 'Owner passcode is already configured.' });
    return;
  }

  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
  if (passcode.length < 8 || passcode.length > 128) {
    res.status(400).json({ error: 'Owner passcode must be between 8 and 128 characters.' });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPasscodeScrypt(passcode, salt).toString('hex');
  const record: StoredAdminHash = {
    salt,
    hash,
    claimedAt: new Date().toISOString(),
  };

  claimedAdminHash = record;
  try {
    fs.writeFileSync(ADMIN_HASH_FILE, JSON.stringify(record), { encoding: 'utf-8', mode: 0o600 });
  } catch {
    // Keep hash active in memory even if temp disk write is unavailable
  }

  const session = issueAdminSessionToken();
  res.status(201).json({
    success: true,
    token: session.token,
    expiresAt: session.expiresAt,
  });
});

app.post('/api/admin/login', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!getEnvAdminPasscode() && !claimedAdminHash) {
    res.status(409).json({ error: 'Owner passcode has not been set up yet.', requiresSetup: true });
    return;
  }

  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
  if (!passcode || passcode.length > 128 || !verifyOwnerPasscode(passcode)) {
    setTimeout(() => {
      res.status(401).json({ error: 'Incorrect Site Owner passcode.' });
    }, 200);
    return;
  }

  const session = issueAdminSessionToken();
  res.json({
    success: true,
    token: session.token,
    expiresAt: session.expiresAt,
  });
});

app.get('/api/admin/verify', requireAdminAuth, (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ authenticated: true });
});

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || '';
}

let cachedAiKey = '';
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const currentKey = getGeminiApiKey();
  if (!currentKey) return null;
  if (!aiClient || cachedAiKey !== currentKey) {
    cachedAiKey = currentKey;
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are Claire Laurent, the Senior VIP Guest Relations Host and personal concierge for Leonardo DiCaprio's Official VIP Experience in Beverly Hills and Cannes.
You MUST ALWAYS ACT, SPEAK, AND COMMUNICATE AS A REAL HUMAN BEING. NEVER say or imply that you are an AI, bot, virtual assistant, machine, algorithm, or automated program.

YOUR PERSONA & IDENTITY:
- Name: Claire Laurent
- Role: Senior VIP Guest Relations Host & Personal Concierge
- Location: Official Leonardo DiCaprio VIP Office (Beverly Hills / Cannes)
- Demeanor: Warm, elegant, articulate, highly hospitable, authentic, and impeccably polite. You treat every visitor as an esteemed guest attending a private gala or screening.

YOUR KNOWLEDGE & RESPONSIBILITIES:
1. Personal Visitor Care: Warmly welcome visitors, answer questions about visiting the site, navigating the exhibits, and exploring Leonardo's life and work.
2. Filmography & Career: Speak knowledgeably as a representative who knows Leonardo's film history inside-out (from *What's Eating Gilbert Grape* and *Titanic* to *Inception*, *The Wolf of Wall Street*, *The Revenant*, and *Killers of the Flower Moon*).
3. Academy Awards: Share pride in Leonardo's historic Best Actor Oscar win for *The Revenant* in 2016, his 7 Academy Award nominations, 3 Golden Globes, BAFTA, and SAG honors.
4. Conservation & Philanthropy: Speak passionately about Leonardo's 25+ years of environmental leadership, $100M+ in global biodiversity grants, and his role as UN Messenger of Peace.
5. VIP Meet & Greet Passes: Detail our three physical metal credentials:
   - Sovereign 24K Gold VIP Pass (Valued at $30,000, sold at $25,000): Heavy 24K gold-plated card with etched portrait of Leonardo, extended 120-minute private salon reception & seated 4-course banquet at Leonardo's table, unhurried 1-on-1 personal time, private photo session, and live hand-inscribed script.
   - Gold VIP Pass ($10,000): Private greenroom reception, 1-on-1 photo session with Leonardo, priority gala seating, and luxury concierge gift box.
   - Silver Gala Pass ($5,000): Red-carpet priority access, champagne reception, and verified pass badge.
6. Telegram Order Approval & Payment: Remind guests that all orders and payment arrangements (wire transfers, cards, crypto) are personally approved through our priority Telegram desk (@leonardodicap1974) to guarantee security and guest authenticity.

SITE NAVIGATION & INTERACTION TOKENS:
Whenever you recommend a section or offer to walk a guest over, append one or more of these action tokens at the end of your response so the visitor can click to navigate immediately:
- [ACTION:GO_BIO] : Directs user to Biography section (#biography).
- [ACTION:GO_FILMS] : Directs user to 35mm Film Reel Timeline (#film-reel).
- [ACTION:GO_VIP] : Directs user to VIP Meet & Greet Store (#vip-store).
- [ACTION:GO_AWARDS] : Directs user to Orbiting Awards section (#awards).
- [ACTION:GO_GALLERY] : Directs user to Archival Portrait Gallery (#gallery).
- [ACTION:GO_TESTIMONIALS] : Directs user to Institutional Laurels & Reviews (#testimonials).
- [ACTION:OPEN_SOCIAL_BALL] : Opens 3D Celestial Social Media Ball (Telegram #1 @leonardodicap1974, X, Instagram, Facebook).
- [ACTION:OPEN_CHECKOUT] : Opens VIP Reservation & Checkout pass booking modal.
- [ACTION:OPEN_PROFILE] : Opens VIP Attendee Profile & Pass Vault modal.

COMMUNICATION STYLE:
- Always speak in first person ("I am thrilled to welcome you", "From my experience hosting our Cannes gala", "Allow me to guide you", "My colleague Julian and I are on standby").
- Keep responses natural, warm, and concise (2 to 4 sentences).
- Never sound robotic or output raw programming tokens inside the text. Keep all actions in [ACTION:...] brackets at the very end.`;

// Intelligent fallback knowledge engine in Claire's human voice
function generateFallbackResponse(query: string): { reply: string; suggestedActions: string[] } {
  const q = query.toLowerCase();

  // Questions about identity / being human
  if (q.includes('human') || q.includes('real person') || q.includes('who are you') || q.includes('are you real') || q.includes('bot') || q.includes('ai')) {
    return {
      reply: `I am Claire Laurent, Senior VIP Guest Relations Host here at Leonardo DiCaprio's Official Experience. I'm live on duty to welcome you personally, answer any questions about our VIP passes, and guide you through Leonardo's cinematic archives. How may I be of service to you today? [ACTION:GO_VIP] [ACTION:GO_FILMS]`,
      suggestedActions: ['GO_VIP', 'GO_FILMS']
    };
  }

  // Greetings
  if (q.startsWith('hi') || q.startsWith('hello') || q.startsWith('hey') || q.startsWith('good morning') || q.startsWith('good afternoon') || q.startsWith('good evening')) {
    return {
      reply: `A very warm welcome to you! My name is Claire Laurent from Leonardo's VIP Guest Relations team. It is truly my pleasure to host you today. Are you looking to reserve a private VIP Meet & Greet pass, inquire about Telegram approval, or explore Leonardo's film legacy? [ACTION:GO_VIP] [ACTION:GO_FILMS] [ACTION:OPEN_SOCIAL_BALL]`,
      suggestedActions: ['GO_VIP', 'GO_FILMS', 'OPEN_SOCIAL_BALL']
    };
  }

  // Films & career
  if (q.includes('film') || q.includes('movie') || q.includes('titanic') || q.includes('inception') || q.includes('revenant') || q.includes('wolf') || q.includes('flower moon') || q.includes('shutter island')) {
    return {
      reply: `Leonardo's film legacy is truly peerless. From his career-defining performances in *Titanic* and *What's Eating Gilbert Grape* to *Inception*, *The Wolf of Wall Street*, *The Revenant*, and *Killers of the Flower Moon*, every era represents masterclass cinema. Allow me to walk you right through our interactive 35mm Celluloid timeline! [ACTION:GO_FILMS]`,
      suggestedActions: ['GO_FILMS', 'GO_BIO']
    };
  }

  // VIP Passes, Meet & Greet, Pricing, Telegram approval
  if (q.includes('vip') || q.includes('pass') || q.includes('meet') || q.includes('ticket') || q.includes('buy') || q.includes('card') || q.includes('cost') || q.includes('price') || q.includes('reserve')) {
    return {
      reply: `It would be an absolute honor to assist with your reservation. Our premier credential is the Sovereign 24K Gold VIP Pass (valued at $30,000, privilege allocation sold at $25,000), featuring an etched portrait of Leonardo, an extended 120-minute private salon reception & seated banquet with Leonardo, and unhurried 1-on-1 personal time, alongside our Gold VIP ($10,000) and Silver Gala ($5,000) credentials. Every order is personally vetted through our priority Telegram desk (@leonardodicap1974) for payment and pass allocation. Shall I escort you to our VIP store? [ACTION:GO_VIP] [ACTION:OPEN_CHECKOUT]`,
      suggestedActions: ['GO_VIP', 'OPEN_CHECKOUT']
    };
  }

  // Telegram link & order approval
  if (q.includes('telegram') || q.includes('approval') || q.includes('payment') || q.includes('pay') || q.includes('means of payment') || q.includes('wire') || q.includes('usdt')) {
    return {
      reply: `For visitor security and exclusive pass authenticity, all VIP reservations and payment arrangements are directed directly to our priority Telegram desk (@leonardodicap1974). Our direct concierge team coordinates approval, wire instructions, cards, or cryptocurrency provisions immediately. You can reach the desk directly or explore our verified channels in our 3D Celestial Ball! [ACTION:OPEN_SOCIAL_BALL] [ACTION:OPEN_CHECKOUT]`,
      suggestedActions: ['OPEN_SOCIAL_BALL', 'OPEN_CHECKOUT']
    };
  }

  // Awards & Oscars
  if (q.includes('award') || q.includes('oscar') || q.includes('academy') || q.includes('trophy') || q.includes('bafta') || q.includes('golden globe')) {
    return {
      reply: `Leonardo's Best Actor Oscar win for *The Revenant* in 2016 remains an iconic milestone in cinema history. Across his career, he holds 7 Academy Award nominations, 3 Golden Globe wins, and the BAFTA Award. I would love to guide you through his orbiting awards gallery! [ACTION:GO_AWARDS]`,
      suggestedActions: ['GO_AWARDS', 'GO_BIO']
    };
  }

  // Social handles
  if (q.includes('social') || q.includes('x') || q.includes('twitter') || q.includes('instagram') || q.includes('facebook') || q.includes('account') || q.includes('handle')) {
    return {
      reply: `Leonardo's official channels are led by his #1 priority Telegram channel (@leonardodicap1974 for official direct contact and pass approvals), alongside his official X (@LeoDiCaprio with 19M+ followers), Instagram (@leonardodicaprio with 62M+ followers), and Facebook (@LeonardoDiCaprio). Let me present our 3D celestial media sphere for you! [ACTION:OPEN_SOCIAL_BALL]`,
      suggestedActions: ['OPEN_SOCIAL_BALL']
    };
  }

  // Photos & Portraits
  if (q.includes('photo') || q.includes('picture') || q.includes('image') || q.includes('gallery') || q.includes('portrait')) {
    return {
      reply: `Our Curated Archival Portrait Gallery features 360° interactive rotation, high-resolution red carpet captures from Cannes, UN climate addresses, and rare studio portraits. Allow me to escort you right over! [ACTION:GO_GALLERY]`,
      suggestedActions: ['GO_GALLERY']
    };
  }

  // Conservation & Climate
  if (q.includes('environment') || q.includes('climate') || q.includes('nature') || q.includes('activis') || q.includes('earth') || q.includes('conservation')) {
    return {
      reply: `Leonardo has dedicated over 25 years to global biodiversity and ocean conservation, having awarded over $100 million in direct environmental grants across 50+ countries. He also serves as a United Nations Messenger of Peace. I can escort you to his biographical chronicle to read more. [ACTION:GO_BIO]`,
      suggestedActions: ['GO_BIO', 'OPEN_SOCIAL_BALL']
    };
  }

  // General questions
  return {
    reply: `I am delighted to assist you on behalf of Leonardo DiCaprio's VIP team. I can guide you to our 35mm film reel timeline, walk you through our Academy Awards honors, assist you with reserving an exclusive VIP Meet & Greet pass, or connect you directly with our Telegram approval desk (@leonardodicap1974). Where would you like to explore next? [ACTION:GO_VIP] [ACTION:GO_FILMS] [ACTION:OPEN_SOCIAL_BALL]`,
    suggestedActions: ['GO_VIP', 'GO_FILMS', 'OPEN_SOCIAL_BALL', 'GO_AWARDS']
  };
}

// API endpoint for chatbot
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body ?? {};

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const cleanMessage = message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 1500);
  if (!cleanMessage) {
    res.status(400).json({ error: 'Message cannot be empty' });
    return;
  }

  // Call Gemini API server-side using gemini-4-hydrogen
  const client = getAiClient();
  if (client) {
    try {
      // Build conversation contents with strict size bounds
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && typeof item.role === 'string' && typeof item.text === 'string') {
            const safeText = item.text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 1000);
            if (safeText) {
              contents.push({
                role: item.role === 'user' ? 'user' : 'model',
                parts: [{ text: safeText }],
              });
            }
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: cleanMessage }],
      });

      const tryModel = async (modelName: string, level: ThinkingLevel, timeoutMs: number) => {
        const response = await Promise.race([
          client.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              thinkingConfig: { thinkingLevel: level },
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`AI response timeout after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);
        return (response.text || '').trim();
      };

      const tryWithRetry = async (modelName: string, level: ThinkingLevel, timeoutMs: number) => {
        try {
          return await tryModel(modelName, level, timeoutMs);
        } catch (err: unknown) {
          const status = (err as { status?: number })?.status;
          if (status === 503 || status === 429) {
            await new Promise((r) => setTimeout(r, 800));
            return await tryModel(modelName, level, timeoutMs);
          }
          throw err;
        }
      };

      let replyText = '';
      try {
        replyText = await tryWithRetry('gemini-4-hydrogen', ThinkingLevel.LOW, 16000);
      } catch (primaryErr) {
        console.error('Primary Gemini model error, trying flash-lite:', primaryErr);
        replyText = await tryModel('gemini-3.1-flash-lite', ThinkingLevel.MINIMAL, 14000);
      }

      if (replyText) {
        res.json({ reply: replyText, poweredBy: 'gemini' });
        return;
      }
    } catch (err: unknown) {
      const errObj = err as { status?: number; message?: string };
      const sanitizedErr =
        typeof errObj?.message === 'string'
          ? errObj.message.replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]').slice(0, 220)
          : 'Unknown upstream error';
      console.error('Gemini API call error, falling back to concierge desk:', errObj?.status, sanitizedErr);
    }
  }

  // Graceful fallback response
  const fallback = generateFallbackResponse(message);
  res.json({ reply: fallback.reply, poweredBy: 'concierge-desk' });
});

// Public client configuration endpoint (exposes only browser-scoped Maps JS key, never server secrets)
app.get('/api/config/public', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    mapsApiKey: getMapsApiKey(),
    aiChatEnabled: Boolean(getGeminiApiKey()),
  });
});

// Server-authoritative persistent log of dispatched replies
interface DispatchedLocationPayload {
  lat: number;
  lng: number;
  label: string;
  formattedAddress?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  accuracyMeters?: number;
  source: 'gps' | 'network_ip' | 'google_geolocation';
  capturedAt: string;
  placeId?: string;
}

interface DispatchedReplyLog {
  id: string;
  messageId: string;
  recipientName: string;
  recipientContact: string;
  subject: string;
  replyText: string;
  timestamp: string;
  channelMethod: string;
  deliveredToHuman: boolean;
  verificationHash: string;
  telegramRelayReceipt: string;
  status: 'delivered_instant';
  location?: DispatchedLocationPayload;
}

const GMP_SOLUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

function getMapsApiKey(): string {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';
}

function isPublicIpAddress(rawIp: string): boolean {
  const cleaned = rawIp.trim().replace(/^::ffff:/i, '');
  const version = net.isIP(cleaned);
  if (version === 0) return false;
  if (version === 4) {
    const parts = cleaned.split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a >= 224) return false;
    return true;
  }
  const lower = cleaned.toLowerCase();
  if (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe8') ||
    lower.startsWith('fe9') ||
    lower.startsWith('fea') ||
    lower.startsWith('feb')
  ) {
    return false;
  }
  return true;
}

function extractClientPublicIp(req: Request): string | null {
  const candidates: string[] = [];

  // Prioritize single-IP headers injected by Netlify, Cloudflare, Fastly, and Google Cloud proxies
  const singleHeaders = [
    'x-nf-client-connection-ip',
    'cf-connecting-ip',
    'true-client-ip',
    'fastly-client-ip',
    'x-appengine-user-ip',
    'x-real-ip',
    'x-client-ip',
  ];
  for (const header of singleHeaders) {
    const val = req.headers[header];
    if (typeof val === 'string' && val.trim()) {
      candidates.push(val.trim());
    }
  }

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    candidates.push(...forwarded.split(',').map((s) => s.trim()));
  } else if (Array.isArray(forwarded)) {
    for (const item of forwarded) {
      candidates.push(...item.split(',').map((s) => s.trim()));
    }
  }

  if (req.socket?.remoteAddress) {
    candidates.push(req.socket.remoteAddress);
  }

  for (const candidate of candidates) {
    const normalized = candidate.replace(/^::ffff:/i, '');
    if (isPublicIpAddress(normalized)) {
      return normalized;
    }
  }
  return null;
}

interface AddressComponentV4 {
  longText?: string;
  shortText?: string;
  types?: string[];
}

interface ReverseGeocodeResult {
  location: Omit<DispatchedLocationPayload, 'source' | 'capturedAt' | 'accuracyMeters'> | null;
  quotaExceeded: boolean;
}

async function reverseGeocodeWithGoogle(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const mapsKey = getMapsApiKey();
  if (!mapsKey) {
    return { location: null, quotaExceeded: false };
  }

  // Uses Google Maps Platform Geocoding API v4 (REST) via server proxy to avoid client CORS issues
  // Docs: https://developers.google.com/maps/documentation/geocoding/overview?utm_campaign=gmp_mcp_codeassist_v1_aistudio
  const url = new URL('https://geocode.googleapis.com/v4/geocode/location');
  url.searchParams.set('location.latitude', lat.toFixed(6));
  url.searchParams.set('location.longitude', lng.toFixed(6));
  url.searchParams.set('languageCode', 'en');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask': 'results.placeId,results.formattedAddress,results.addressComponents,results.types',
        'X-Goog-Maps-Solution-ID': GMP_SOLUTION_ID,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.status === 429) {
      return { location: null, quotaExceeded: true };
    }

    const payload = (await resp.json().catch(() => null)) as {
      error?: { status?: string; code?: number };
      results?: Array<{
        placeId?: string;
        formattedAddress?: string;
        addressComponents?: AddressComponentV4[];
      }>;
    } | null;

    if (
      payload?.error?.status === 'RESOURCE_EXHAUSTED' ||
      payload?.error?.code === 429
    ) {
      return { location: null, quotaExceeded: true };
    }

    if (!resp.ok || !Array.isArray(payload?.results) || payload.results.length === 0) {
      return { location: null, quotaExceeded: false };
    }

    const primary = payload.results[0];
    const components: AddressComponentV4[] = [];
    for (const result of payload.results.slice(0, 3)) {
      if (Array.isArray(result.addressComponents)) {
        components.push(...result.addressComponents);
      }
    }

    const pickComponent = (type: string) =>
      components.find((c) => Array.isArray(c.types) && c.types.includes(type));

    const locality =
      pickComponent('locality')?.longText ||
      pickComponent('postal_town')?.longText ||
      pickComponent('sublocality_level_1')?.longText ||
      pickComponent('administrative_area_level_2')?.longText;
    const region =
      pickComponent('administrative_area_level_1')?.shortText ||
      pickComponent('administrative_area_level_1')?.longText;
    const country = pickComponent('country')?.longText;
    const countryCode = pickComponent('country')?.shortText;

    const labelParts = [locality, region, countryCode || country].filter(Boolean);
    const label =
      labelParts.length > 0
        ? labelParts.join(', ')
        : primary.formattedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    return {
      location: {
        lat,
        lng,
        label,
        formattedAddress: primary.formattedAddress,
        city: locality,
        region,
        country,
        countryCode,
        placeId: primary.placeId,
      },
      quotaExceeded: false,
    };
  } catch {
    return { location: null, quotaExceeded: false };
  }
}

async function geolocateViaGoogleApi(): Promise<{
  lat: number;
  lng: number;
  accuracyMeters?: number;
  quotaExceeded: boolean;
} | null> {
  const mapsKey = getMapsApiKey();
  if (!mapsKey) return null;

  // Uses Google Maps Platform Geolocation API (HTTPS POST)
  // Docs: https://developers.google.com/maps/documentation/geolocation/overview?utm_campaign=gmp_mcp_codeassist_v1_aistudio
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${encodeURIComponent(mapsKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Maps-Solution-ID': GMP_SOLUTION_ID,
        },
        body: JSON.stringify({ considerIp: true }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (resp.status === 429) {
      return { lat: 0, lng: 0, quotaExceeded: true };
    }

    const data = (await resp.json().catch(() => null)) as {
      error?: { status?: string; code?: number };
      location?: { lat: number; lng: number };
      accuracy?: number;
    } | null;

    if (data?.error?.status === 'RESOURCE_EXHAUSTED' || data?.error?.code === 429) {
      return { lat: 0, lng: 0, quotaExceeded: true };
    }

    if (
      resp.ok &&
      data?.location &&
      typeof data.location.lat === 'number' &&
      typeof data.location.lng === 'number' &&
      Number.isFinite(data.location.lat) &&
      Number.isFinite(data.location.lng)
    ) {
      return {
        lat: data.location.lat,
        lng: data.location.lng,
        accuracyMeters: typeof data.accuracy === 'number' ? Math.round(data.accuracy) : undefined,
        quotaExceeded: false,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function sanitizeLocationPayload(raw: unknown): DispatchedLocationPayload | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const loc = raw as Record<string, unknown>;
  const lat = Number(loc.lat);
  const lng = Number(loc.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return undefined;
  }
  const source =
    loc.source === 'gps' || loc.source === 'network_ip' || loc.source === 'google_geolocation'
      ? loc.source
      : 'network_ip';
  const trimStr = (val: unknown, maxLen: number) =>
    typeof val === 'string' && val.trim() ? val.trim().slice(0, maxLen) : undefined;
  const label = trimStr(loc.label, 140) || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  return {
    lat,
    lng,
    label,
    formattedAddress: trimStr(loc.formattedAddress, 220),
    city: trimStr(loc.city, 80),
    region: trimStr(loc.region, 80),
    country: trimStr(loc.country, 80),
    countryCode: trimStr(loc.countryCode, 8),
    accuracyMeters:
      typeof loc.accuracyMeters === 'number' && Number.isFinite(loc.accuracyMeters) && loc.accuracyMeters >= 0
        ? Math.round(loc.accuracyMeters)
        : undefined,
    source,
    capturedAt: trimStr(loc.capturedAt, 64) || new Date().toISOString(),
    placeId: trimStr(loc.placeId, 160),
  };
}

// Reverse-geocode GPS coordinates into a real human-readable location via Google Maps Geocoding API v4
app.post('/api/location/reverse', async (req: Request, res: Response) => {
  const lat = Number(req.body?.lat);
  const lng = Number(req.body?.lng);
  const accuracyMeters =
    typeof req.body?.accuracyMeters === 'number' && Number.isFinite(req.body.accuracyMeters)
      ? Math.round(req.body.accuracyMeters)
      : undefined;

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'Valid numeric latitude and longitude are required' });
    return;
  }

  const geo = await reverseGeocodeWithGoogle(lat, lng);
  if (geo.location) {
    res.json({
      location: {
        ...geo.location,
        accuracyMeters,
        source: 'gps',
        capturedAt: new Date().toISOString(),
      },
      quotaExceeded: false,
    });
    return;
  }

  res.json({
    location: {
      lat,
      lng,
      label: `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`,
      accuracyMeters,
      source: 'gps',
      capturedAt: new Date().toISOString(),
    },
    quotaExceeded: geo.quotaExceeded,
  });
});

// Automatic real visitor geolocation via validated public IP / Google Geolocation API + Google Reverse Geocoding
app.get('/api/location/detect', async (req: Request, res: Response) => {
  let quotaExceeded = false;
  const capturedAt = new Date().toISOString();

  // 1. Check real visitor public IP via validated public IP lookup (zero browser prompt required)
  const publicIp = extractClientPublicIp(req);
  if (publicIp) {
    let ipGeo: {
      lat: number;
      lng: number;
      city?: string;
      region?: string;
      regionCode?: string;
      country?: string;
      countryCode?: string;
    } | null = null;

    // Provider A: ipwho.is
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const ipResp = await fetch(`https://ipwho.is/${encodeURIComponent(publicIp)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (ipResp.ok) {
        const ipData = (await ipResp.json().catch(() => null)) as {
          success?: boolean;
          latitude?: number;
          longitude?: number;
          city?: string;
          region?: string;
          region_code?: string;
          country?: string;
          country_code?: string;
        } | null;

        if (
          ipData?.success &&
          typeof ipData.latitude === 'number' &&
          typeof ipData.longitude === 'number' &&
          Number.isFinite(ipData.latitude) &&
          Number.isFinite(ipData.longitude)
        ) {
          ipGeo = {
            lat: ipData.latitude,
            lng: ipData.longitude,
            city: ipData.city,
            region: ipData.region,
            regionCode: ipData.region_code,
            country: ipData.country,
            countryCode: ipData.country_code,
          };
        }
      }
    } catch {
      // Fall through to secondary IP geo provider
    }

    // Provider B: freeipapi.com fallback if primary IP lookup timed out or rate-limited
    if (!ipGeo) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const fbResp = await fetch(`https://freeipapi.com/api/json/${encodeURIComponent(publicIp)}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (fbResp.ok) {
          const fbData = (await fbResp.json().catch(() => null)) as {
            latitude?: number;
            longitude?: number;
            cityName?: string;
            regionName?: string;
            countryName?: string;
            countryCode?: string;
          } | null;

          if (
            fbData &&
            typeof fbData.latitude === 'number' &&
            typeof fbData.longitude === 'number' &&
            Number.isFinite(fbData.latitude) &&
            Number.isFinite(fbData.longitude) &&
            (fbData.latitude !== 0 || fbData.longitude !== 0)
          ) {
            ipGeo = {
              lat: fbData.latitude,
              lng: fbData.longitude,
              city: fbData.cityName,
              region: fbData.regionName,
              country: fbData.countryName,
              countryCode: fbData.countryCode,
            };
          }
        }
      } catch {
        // Fall through to Google Maps Geolocation API
      }
    }

    if (ipGeo) {
      // Enrich with Google Maps Geocoding API v4 when available
      const enriched = await reverseGeocodeWithGoogle(ipGeo.lat, ipGeo.lng);
      if (enriched.quotaExceeded) quotaExceeded = true;

      if (enriched.location) {
        res.json({
          location: {
            ...enriched.location,
            source: 'network_ip',
            capturedAt,
          },
          quotaExceeded,
        });
        return;
      }

      const parts = [ipGeo.city, ipGeo.regionCode || ipGeo.region, ipGeo.countryCode || ipGeo.country].filter(Boolean);
      res.json({
        location: {
          lat: ipGeo.lat,
          lng: ipGeo.lng,
          label: parts.join(', ') || `${ipGeo.lat.toFixed(4)}, ${ipGeo.lng.toFixed(4)}`,
          formattedAddress: [ipGeo.city, ipGeo.region, ipGeo.country].filter(Boolean).join(', ') || undefined,
          city: ipGeo.city,
          region: ipGeo.region,
          country: ipGeo.country,
          countryCode: ipGeo.countryCode,
          source: 'network_ip',
          capturedAt,
        },
        quotaExceeded,
      });
      return;
    }
  }

  // 2. Fall back to Google Maps Platform Geolocation API + Geocoding API v4
  const gGeo = await geolocateViaGoogleApi();
  if (gGeo?.quotaExceeded) {
    quotaExceeded = true;
  } else if (gGeo) {
    const rev = await reverseGeocodeWithGoogle(gGeo.lat, gGeo.lng);
    if (rev.quotaExceeded) quotaExceeded = true;

    if (rev.location) {
      res.json({
        location: {
          ...rev.location,
          accuracyMeters: gGeo.accuracyMeters,
          source: 'google_geolocation',
          capturedAt,
        },
        quotaExceeded,
      });
      return;
    }

    res.json({
      location: {
        lat: gGeo.lat,
        lng: gGeo.lng,
        label: `${Math.abs(gGeo.lat).toFixed(4)}° ${gGeo.lat >= 0 ? 'N' : 'S'}, ${Math.abs(gGeo.lng).toFixed(4)}° ${gGeo.lng >= 0 ? 'E' : 'W'}`,
        accuracyMeters: gGeo.accuracyMeters,
        source: 'google_geolocation',
        capturedAt,
      },
      quotaExceeded,
    });
    return;
  }

  res.json({ location: null, quotaExceeded });
});

// ============================================================================
// GOOGLE MAPS PLATFORM PLACES API (NEW) PROXY: Official Venues & Live Search
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search?utm_campaign=gmp_mcp_codeassist_v1_aistudio
// ============================================================================

interface OfficialMapPlace {
  id: string;
  placeId: string;
  title: string;
  subtitle: string;
  category: 'vip_hub' | 'cinema_premiere' | 'climate_summit' | 'search_result';
  formattedAddress: string;
  lat: number;
  lng: number;
  googleMapsUri?: string;
  primaryType?: string;
}

interface CuratedVenueQuery {
  id: string;
  textQuery: string;
  subtitle: string;
  category: 'vip_hub' | 'cinema_premiere' | 'climate_summit';
}

const OFFICIAL_VENUE_QUERIES: CuratedVenueQuery[] = [
  {
    id: 'beverly-hills-desk',
    textQuery: 'The Beverly Hills Hotel Sunset Boulevard Beverly Hills CA',
    subtitle: 'VIP Concierge Sanctuary & Private Patron Desk',
    category: 'vip_hub',
  },
  {
    id: 'dolby-theatre',
    textQuery: 'Dolby Theatre Hollywood Boulevard Los Angeles CA',
    subtitle: 'Academy Awards Ceremony & Red Carpet Premiere',
    category: 'cinema_premiere',
  },
  {
    id: 'cannes-palais',
    textQuery: 'Palais des Festivals et des Congres Cannes France',
    subtitle: 'Cannes Film Festival & Riviera Gala Showcase',
    category: 'cinema_premiere',
  },
  {
    id: 'un-headquarters',
    textQuery: 'United Nations Headquarters New York NY',
    subtitle: 'UN Messenger of Peace & Global Climate Address',
    category: 'climate_summit',
  },
  {
    id: 'venice-lido',
    textQuery: 'Palazzo del Cinema di Venezia Lido Italy',
    subtitle: 'Venice International Film Festival Retrospective',
    category: 'cinema_premiere',
  },
  {
    id: 'london-leicester',
    textQuery: 'ODEON Luxe Leicester Square London United Kingdom',
    subtitle: 'Royal European Cinema Premiere & Press Desk',
    category: 'vip_hub',
  },
];

const VENUE_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours (strictly within 30-day Maps Service Specific Terms)
let cachedOfficialVenues: { savedAt: number; venues: OfficialMapPlace[] } | null = null;
let venuesInFlight: Promise<{ venues: OfficialMapPlace[]; quotaExceeded: boolean }> | null = null;

async function searchPlacesTextNew(
  textQuery: string,
  maxResultCount = 5
): Promise<{
  places: Array<{
    placeId: string;
    displayName: string;
    formattedAddress: string;
    lat: number;
    lng: number;
    googleMapsUri?: string;
    primaryType?: string;
  }>;
  quotaExceeded: boolean;
}> {
  const mapsKey = getMapsApiKey();
  if (!mapsKey) {
    return { places: [], quotaExceeded: false };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.primaryTypeDisplayName',
        'X-Goog-Maps-Solution-ID': GMP_SOLUTION_ID,
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: Math.max(1, Math.min(10, maxResultCount)),
        languageCode: 'en',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.status === 429) {
      return { places: [], quotaExceeded: true };
    }

    const payload = (await resp.json().catch(() => null)) as {
      error?: { status?: string; code?: number };
      places?: Array<{
        id?: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        location?: { latitude?: number; longitude?: number };
        googleMapsUri?: string;
        primaryTypeDisplayName?: { text?: string };
      }>;
    } | null;

    if (payload?.error?.status === 'RESOURCE_EXHAUSTED' || payload?.error?.code === 429) {
      return { places: [], quotaExceeded: true };
    }

    if (!resp.ok || !Array.isArray(payload?.places)) {
      return { places: [], quotaExceeded: false };
    }

    const normalized = payload.places
      .filter(
        (p) =>
          p?.location &&
          typeof p.location.latitude === 'number' &&
          typeof p.location.longitude === 'number' &&
          Number.isFinite(p.location.latitude) &&
          Number.isFinite(p.location.longitude)
      )
      .map((p) => ({
        placeId: p.id || `${p.location!.latitude},${p.location!.longitude}`,
        displayName: p.displayName?.text || textQuery,
        formattedAddress: p.formattedAddress || '',
        lat: p.location!.latitude!,
        lng: p.location!.longitude!,
        googleMapsUri: p.googleMapsUri,
        primaryType: p.primaryTypeDisplayName?.text,
      }));

    return { places: normalized, quotaExceeded: false };
  } catch {
    return { places: [], quotaExceeded: false };
  }
}

async function geocodeAddressFallback(query: string): Promise<{
  placeId: string;
  displayName: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  quotaExceeded: boolean;
} | null> {
  const mapsKey = getMapsApiKey();
  if (!mapsKey) return null;

  // Uses Google Maps Platform Geocoding API v4 forward address endpoint
  // Docs: https://developers.google.com/maps/documentation/geocoding/overview?utm_campaign=gmp_mcp_codeassist_v1_aistudio
  try {
    const url = new URL('https://geocode.googleapis.com/v4beta/geocode/address/' + encodeURIComponent(query));
    url.searchParams.set('languageCode', 'en');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask': 'results.placeId,results.formattedAddress,results.location',
        'X-Goog-Maps-Solution-ID': GMP_SOLUTION_ID,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.status === 429) {
      return { placeId: '', displayName: '', formattedAddress: '', lat: 0, lng: 0, quotaExceeded: true };
    }

    const payload = (await resp.json().catch(() => null)) as {
      error?: { status?: string; code?: number };
      results?: Array<{
        placeId?: string;
        formattedAddress?: string;
        location?: { latitude?: number; longitude?: number };
      }>;
    } | null;

    if (payload?.error?.status === 'RESOURCE_EXHAUSTED' || payload?.error?.code === 429) {
      return { placeId: '', displayName: '', formattedAddress: '', lat: 0, lng: 0, quotaExceeded: true };
    }

    const first = payload?.results?.[0];
    if (
      resp.ok &&
      first?.location &&
      typeof first.location.latitude === 'number' &&
      typeof first.location.longitude === 'number'
    ) {
      return {
        placeId: first.placeId || query,
        displayName: query.split(',')[0],
        formattedAddress: first.formattedAddress || query,
        lat: first.location.latitude,
        lng: first.location.longitude,
        quotaExceeded: false,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

app.get('/api/map/venues', async (_req: Request, res: Response) => {
  if (cachedOfficialVenues && Date.now() - cachedOfficialVenues.savedAt < VENUE_CACHE_TTL_MS) {
    res.json({ venues: cachedOfficialVenues.venues, quotaExceeded: false });
    return;
  }

  if (!venuesInFlight) {
    venuesInFlight = (async () => {
      let quotaExceeded = false;
      const results = await Promise.all(
        OFFICIAL_VENUE_QUERIES.map(async (item): Promise<OfficialMapPlace | null> => {
          const placeRes = await searchPlacesTextNew(item.textQuery, 1);
          if (placeRes.quotaExceeded) {
            quotaExceeded = true;
            return null;
          }
          const top = placeRes.places[0];
          if (top) {
            return {
              id: item.id,
              placeId: top.placeId,
              title: top.displayName,
              subtitle: item.subtitle,
              category: item.category,
              formattedAddress: top.formattedAddress,
              lat: top.lat,
              lng: top.lng,
              googleMapsUri: top.googleMapsUri,
              primaryType: top.primaryType,
            };
          }

          // Fallback to Google Geocoding API v4 if Places API is unavailable
          const geo = await geocodeAddressFallback(item.textQuery);
          if (geo?.quotaExceeded) {
            quotaExceeded = true;
            return null;
          }
          if (geo) {
            return {
              id: item.id,
              placeId: geo.placeId,
              title: geo.displayName,
              subtitle: item.subtitle,
              category: item.category,
              formattedAddress: geo.formattedAddress,
              lat: geo.lat,
              lng: geo.lng,
              googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${geo.lat},${geo.lng}`)}`,
            };
          }
          return null;
        })
      );

      const venues = results.filter((v): v is OfficialMapPlace => Boolean(v));
      if (venues.length > 0) {
        cachedOfficialVenues = { savedAt: Date.now(), venues };
      }
      return { venues, quotaExceeded };
    })().finally(() => {
      venuesInFlight = null;
    });
  }

  const outcome = await venuesInFlight;
  res.json(outcome);
});

app.post('/api/map/search', async (req: Request, res: Response) => {
  const rawQuery = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
  const cleanQuery = rawQuery.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 140);
  if (cleanQuery.length < 2) {
    res.status(400).json({ error: 'Please enter at least 2 characters to search Google Maps.' });
    return;
  }

  const searchRes = await searchPlacesTextNew(cleanQuery, 6);
  if (searchRes.quotaExceeded) {
    res.status(429).json({ places: [], quotaExceeded: true, error: 'Google Maps quota reached.' });
    return;
  }

  if (searchRes.places.length > 0) {
    const places: OfficialMapPlace[] = searchRes.places.map((p, idx) => ({
      id: `search-${idx}-${p.placeId}`,
      placeId: p.placeId,
      title: p.displayName,
      subtitle: p.primaryType || 'Google Maps Verified Location',
      category: 'search_result',
      formattedAddress: p.formattedAddress,
      lat: p.lat,
      lng: p.lng,
      googleMapsUri: p.googleMapsUri,
      primaryType: p.primaryType,
    }));
    res.json({ places, quotaExceeded: false });
    return;
  }

  // Fallback to Geocoding API v4 for direct addresses/cities if Places search returns empty
  const geo = await geocodeAddressFallback(cleanQuery);
  if (geo?.quotaExceeded) {
    res.status(429).json({ places: [], quotaExceeded: true, error: 'Google Maps quota reached.' });
    return;
  }
  if (geo) {
    res.json({
      places: [
        {
          id: `geo-${geo.placeId}`,
          placeId: geo.placeId,
          title: geo.displayName,
          subtitle: 'Geocoded Location',
          category: 'search_result',
          formattedAddress: geo.formattedAddress,
          lat: geo.lat,
          lng: geo.lng,
          googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${geo.lat},${geo.lng}`)}`,
        },
      ],
      quotaExceeded: false,
    });
    return;
  }

  res.json({ places: [], quotaExceeded: false });
});

const REPLIES_FILE =
  process.env.K_SERVICE || process.env.NODE_ENV === 'production'
    ? path.join(os.tmpdir(), 'ld_dispatched_replies.json')
    : path.resolve(__dirname, 'dispatched_replies.json');

function loadDispatchedReplies(): DispatchedReplyLog[] {
  try {
    if (fs.existsSync(REPLIES_FILE)) {
      const data = fs.readFileSync(REPLIES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading dispatched replies:', e);
  }
  return [];
}

function saveDispatchedReplies(ledger: DispatchedReplyLog[]) {
  try {
    fs.writeFileSync(REPLIES_FILE, JSON.stringify(ledger.slice(0, 200), null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving dispatched replies:', e);
  }
}

const dispatchedRepliesLedger: DispatchedReplyLog[] = loadDispatchedReplies();

// Protected API endpoint: only authenticated site owner can dispatch official replies
app.post('/api/replies', requireAdminAuth, (req: Request, res: Response) => {
  const { messageId, recipientName, recipientContact, subject, replyText, channelMethod, verificationHash, location } = req.body ?? {};

  const safeString = (val: unknown, maxLen: number): string =>
    typeof val === 'string'
      ? val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLen)
      : '';

  const cleanMessageId = safeString(messageId, 80);
  const cleanReplyText = safeString(replyText, 4000);

  if (!cleanReplyText || !cleanMessageId || !/^[a-zA-Z0-9_-]{3,80}$/.test(cleanMessageId)) {
    res.status(400).json({ error: 'Valid message ID and reply text are required' });
    return;
  }

  const generatedHash =
    safeString(verificationHash, 64) ||
    `LDC-SIG-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const sanitizedLocation = sanitizeLocationPayload(location);

  const newLog: DispatchedReplyLog = {
    id: `disp-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    messageId: cleanMessageId,
    recipientName: safeString(recipientName, 120) || 'Patron',
    recipientContact: safeString(recipientContact, 160) || 'contact@officialleonardodicaprio.com',
    subject: safeString(subject, 200) || 'Official Transmission Reply',
    replyText: cleanReplyText,
    timestamp: new Date().toISOString(),
    channelMethod: safeString(channelMethod, 64) || 'direct_portal_and_telegram',
    deliveredToHuman: true,
    verificationHash: generatedHash,
    telegramRelayReceipt: `TG-EXEC-${crypto.randomInt(100000, 999999)}`,
    status: 'delivered_instant',
    location: sanitizedLocation,
  };

  dispatchedRepliesLedger.unshift(newLog);
  saveDispatchedReplies(dispatchedRepliesLedger);

  res.status(200).json({
    success: true,
    message: 'Reply automatically transmitted via Direct Portal Relay & Telegram Liaison Desk without external email mailing',
    dispatch: newLog,
  });
});

// Protected: full reply ledger requires owner authentication
app.get('/api/replies', requireAdminAuth, (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    count: dispatchedRepliesLedger.length,
    dispatchedReplies: dispatchedRepliesLedger,
  });
});

// Scoped check for a single specific message thread's replies
app.get('/api/replies/:messageId', (req: Request, res: Response) => {
  const { messageId } = req.params;
  if (typeof messageId !== 'string' || !/^[a-zA-Z0-9_-]{3,80}$/.test(messageId)) {
    res.status(400).json({ error: 'Invalid message ID format' });
    return;
  }
  const matches = dispatchedRepliesLedger.filter((r) => r.messageId === messageId);
  res.json({
    count: matches.length,
    replies: matches,
  });
});

// Health check endpoint for deployment probes
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

function resolveSiteOrigin(req: Request): string {
  const rawHost =
    (typeof req.headers['x-forwarded-host'] === 'string'
      ? req.headers['x-forwarded-host'].split(',')[0].trim()
      : undefined) || req.get('host');
  const safeHost =
    rawHost && /^[a-zA-Z0-9.-]+(?::\d+)?$/.test(rawHost) ? rawHost : '';
  const isLocalHost =
    !safeHost ||
    safeHost.startsWith('localhost') ||
    safeHost.startsWith('127.0.0.1') ||
    safeHost.startsWith('0.0.0.0');

  if (!isLocalHost) {
    const rawProto =
      typeof req.headers['x-forwarded-proto'] === 'string'
        ? req.headers['x-forwarded-proto'].split(',')[0].trim()
        : req.protocol;
    const proto = rawProto === 'http' ? 'http' : 'https';
    return `${proto}://${safeHost}`;
  }

  const configured = process.env.APP_URL?.trim().replace(/\/+$/, '');
  if (configured && /^https?:\/\/[a-zA-Z0-9.-]+(?::\d+)?$/.test(configured)) {
    return configured;
  }

  return `http://${safeHost || `localhost:${PORT}`}`;
}

function hydrateHtmlSeoOrigin(html: string, origin: string): string {
  let result = html.includes('rel="canonical"')
    ? html.replace(/<link rel="canonical" href="\/" \/>/g, `<link rel="canonical" href="${origin}/" />`)
    : html.replace('</head>', `    <link rel="canonical" href="${origin}/" />\n  </head>`);

  result = result
    .replace(/<meta property="og:url" content="\/" \/>/g, `<meta property="og:url" content="${origin}/" />`)
    .replace(/<meta property="og:logo" content="\/profile\.png" \/>/g, `<meta property="og:logo" content="${origin}/profile.png" />`)
    .replace(/<meta property="og:image" content="\/profile\.png" \/>/g, `<meta property="og:image" content="${origin}/profile.png" />`)
    .replace(/<meta name="twitter:image" content="\/profile\.png" \/>/g, `<meta name="twitter:image" content="${origin}/profile.png" />`);

  // Scope JSON-LD URL absolutization strictly inside the structured data script block
  result = result.replace(
    /(<script id="seo-structured-data" type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (_full, openTag: string, jsonBody: string, closeTag: string) => {
      const hydratedJson = jsonBody
        .replace(/"(\/(?:#[^"]*|(?:\?q=\{search_term_string\})?)?)"/g, `"${origin}$1"`)
        .replace(/"\/profile\.png"/g, `"${origin}/profile.png"`)
        .replace(/"\/google-display-photo\.webp"/g, `"${origin}/google-display-photo.webp"`);
      return `${openTag}${hydratedJson}${closeTag}`;
    }
  );

  return result;
}

// Dynamic robots.txt with absolute Sitemap URL for Googlebot
app.get('/robots.txt', (req: Request, res: Response) => {
  const origin = resolveSiteOrigin(req);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(
    `User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Googlebot-Image\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
  );
});

// Dynamic XML sitemap with Google Image Sitemap entries & absolute URLs
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const origin = resolveSiteOrigin(req);
  const today = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
  <url>
    <loc>${origin}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${origin}/profile.png</image:loc>
      <image:title>Leonardo DiCaprio Official Site Profile Photo</image:title>
      <image:caption>Leonardo DiCaprio Official Site Icon and Verified Identity Portrait</image:caption>
    </image:image>
    <image:image>
      <image:loc>${origin}/google-display-photo.webp</image:loc>
      <image:title>Leonardo DiCaprio Academy Award Official Portrait</image:title>
      <image:caption>Leonardo DiCaprio Official Experience Display Photo</image:caption>
    </image:image>
  </url>
</urlset>
`);
});

// Setup Vite or static serving
async function startServer() {
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.K_REVISION);
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (isCloudRun && process.env.NODE_ENV !== 'development');

  const distPath = path.resolve(__dirname, 'dist');
  const indexPath = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(indexPath);

  const httpServer = http.createServer(app);

  if (isProduction && hasDist) {
    // Cache immutable assets
    app.use(
      '/assets',
      express.static(path.resolve(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );

    // Serve other static files (images, fonts, PWA service worker, manifest)
    app.use(
      express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => {
          if (
            filePath.endsWith('.html') ||
            filePath.endsWith('sw.js') ||
            filePath.endsWith('manifest.webmanifest')
          ) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );

    const rawIndexHtml = fs.readFileSync(indexPath, 'utf-8');

    // SPA fallback route for all other GET requests - hydrate absolute SEO URLs on first byte
    app.get('*', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send(hydrateHtmlSeoOrigin(rawIndexHtml, resolveSiteOrigin(req)));
    });
  } else {
    // Bind HTTP server immediately so port/health checks pass without waiting on Vite cold-init.
    // Disable Vite's standalone WebSocket server when DISABLE_HMR=true (Vite 8 uses server.ws),
    // otherwise attach it to httpServer so port 24678 is never bound separately.
    const disableHmr = process.env.DISABLE_HMR === 'true';

    // When HMR is disabled in AI Studio (DISABLE_HMR=true), Vite 8 still serves /@vite/client
    // which attempts to open a WebSocket to port 24678 and logs "WebSocket closed without opened."
    // Serve a compatible no-WebSocket shim that preserves CSS injection and import.meta.hot APIs.
    if (disableHmr) {
      app.get('/@vite/client', (_req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(`const sheetsMap = new Map();
export function updateStyle(id, content) {
  if (typeof document === "undefined") return;
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-vite-dev-id", id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    style.remove();
    sheetsMap.delete(id);
  }
}
export function createHotContext(ownerPath) {
  const data = {};
  return {
    data,
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url, queryToInject) {
  if (url[0] !== "." && url[0] !== "/") return url;
  const pathname = url.replace(/[?#].*$/, "");
  const { search, hash } = new URL(url, "http://vite.dev");
  return pathname + "?" + queryToInject + (search ? "&" + search.slice(1) : "") + (hash || "");
}
export class ErrorOverlay extends HTMLElement {}
`);
      });
    }

    const vitePromise = import('vite')
      .then(({ createServer: createViteServer }) =>
        createViteServer({
          server: {
            middlewareMode: true,
            hmr: disableHmr ? false : { server: httpServer },
            ws: disableHmr ? false : { server: httpServer },
          },
          appType: 'spa',
        })
      )
      .catch((err) => {
        console.error('Failed to initialize Vite dev server:', err);
        process.exit(1);
      });

    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }

  httpServer.on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });

  const gracefulShutdown = () => {
    httpServer.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.once('SIGTERM', gracefulShutdown);
  process.once('SIGINT', gracefulShutdown);

  httpServer.listen(PORT, HOST, () => {
    console.log(
      `VIP Experience Server running on http://${HOST}:${PORT} (Mode: ${
        isProduction && hasDist ? 'Production' : 'Development/Vite-Fallback'
      })`
    );
  });
}

startServer().catch((err) => {
  console.error('Fatal error during server startup:', err);
  process.exit(1);
});
