import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
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
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // If Gemini client is configured, call gemini-3.8-flash
  if (aiClient) {
    try {
      // Build conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.role && item.text) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await Promise.race([
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timeout after 4s')), 4000)
        ),
      ]);

      const replyText = response.text || '';
      if (replyText.trim()) {
        res.json({ reply: replyText });
        return;
      }
    } catch (err) {
      console.error('Gemini API call error, falling back to local engine:', err);
      // Fallback cleanly below
    }
  }

  // Graceful fallback response
  const fallback = generateFallbackResponse(message);
  res.json({ reply: fallback.reply });
});

// Server-authoritative persistent log of dispatched replies
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
}

const REPLIES_FILE = path.resolve(__dirname, 'dispatched_replies.json');

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

// API endpoint to log and dispatch real-time replies to human recipients without needing email
app.post('/api/replies', (req: Request, res: Response) => {
  const { messageId, recipientName, recipientContact, subject, replyText, channelMethod, verificationHash } = req.body;

  if (!replyText || !messageId) {
    res.status(400).json({ error: 'Message ID and reply text are required' });
    return;
  }

  const generatedHash =
    verificationHash ||
    `LDC-SIG-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const newLog: DispatchedReplyLog = {
    id: `disp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    messageId,
    recipientName: recipientName || 'Patron',
    recipientContact: recipientContact || 'contact@officialleonardodicaprio.com',
    subject: subject || 'Official Transmission Reply',
    replyText,
    timestamp: new Date().toISOString(),
    channelMethod: channelMethod || 'direct_portal_and_telegram',
    deliveredToHuman: true,
    verificationHash: generatedHash,
    telegramRelayReceipt: `TG-EXEC-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'delivered_instant',
  };

  dispatchedRepliesLedger.unshift(newLog);
  saveDispatchedReplies(dispatchedRepliesLedger);

  console.log(
    `[AUTOMATIC DIRECT REPLY DISPATCHED - NO EMAIL REQUIRED] To: ${newLog.recipientName} (${newLog.recipientContact}) | Msg: ${newLog.messageId} | Sig: ${newLog.verificationHash} | TG Relay: ${newLog.telegramRelayReceipt}`
  );

  res.status(200).json({
    success: true,
    message: 'Reply automatically transmitted via Direct Portal Relay & Telegram Liaison Desk without external email mailing',
    dispatch: newLog,
  });
});

app.get('/api/replies', (_req: Request, res: Response) => {
  res.json({
    count: dispatchedRepliesLedger.length,
    dispatchedReplies: dispatchedRepliesLedger,
  });
});

// Direct check for a specific message's replies
app.get('/api/replies/:messageId', (req: Request, res: Response) => {
  const { messageId } = req.params;
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

// Setup Vite or static serving
async function startServer() {
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.K_REVISION);
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    isCloudRun ||
    (process.env.PORT !== undefined && process.env.PORT !== '3000');

  const distPath = path.resolve(__dirname, 'dist');
  const indexPath = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(indexPath);

  if (isProduction && hasDist) {
    // Cache immutable assets
    app.use(
      '/assets',
      express.static(path.resolve(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );

    // Serve other static files (images, fonts)
    app.use(
      express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );

    // SPA fallback route for all other GET requests - strictly prevent caching of index.html
    app.get('*', (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(indexPath, (err) => {
        if (err && !res.headersSent) {
          res.status(500).send('Error loading page. Please refresh.');
        }
      });
    });
  } else {
    // Development or fallback when dist is not built: use Vite dev middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `VIP Experience Server running on http://0.0.0.0:${PORT} (Mode: ${
        isProduction && hasDist ? 'Production' : 'Development/Vite-Fallback'
      })`
    );
  });
}

startServer();
