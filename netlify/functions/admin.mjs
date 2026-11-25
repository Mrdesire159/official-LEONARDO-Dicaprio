import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const ADMIN_HASH_FILE = path.join(os.tmpdir(), 'ld_owner_auth_hash.json');
const EPHEMERAL_FALLBACK_KEY = crypto.randomBytes(32).toString('hex');

let claimedAdminHash = null;
try {
  if (fs.existsSync(ADMIN_HASH_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(ADMIN_HASH_FILE, 'utf-8'));
    if (parsed && typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
      claimedAdminHash = parsed;
    }
  }
} catch {
  // ignore
}

const dispatchedReplies = [];

function getEnvAdminPasscode() {
  const raw = (process.env.ADMIN_PASSCODE || '').trim();
  if (
    raw.length >= 2 &&
    ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'")))
  ) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

function getSessionSigningKey() {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  const envPass = getEnvAdminPasscode();
  if (envPass) {
    return crypto.createHmac('sha256', 'ld-owner-session-signing-v1').update(envPass).digest('hex');
  }
  return EPHEMERAL_FALLBACK_KEY;
}

function hashPasscodeScrypt(passcode, saltHex) {
  return crypto.scryptSync(passcode, saltHex, 64, { N: 16384, r: 8, p: 1 });
}

function constantTimeCompareStrings(a, b) {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifyOwnerPasscode(candidate) {
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

function issueAdminSessionToken() {
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

function verifyAdminSessionToken(token) {
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
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return decoded.role === 'owner' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function parseJsonBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body;
  return JSON.parse(raw);
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function getBearerToken(headers) {
  const authHeader = headers?.authorization || headers?.Authorization || '';
  return typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';
}

export async function handler(event) {
  const method = (event.httpMethod || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' };
  }

  const rawPath = (event.path || '').split('?')[0];
  const segments = rawPath.split('/').filter(Boolean);
  const action = segments[segments.length - 1] || '';

  if (method === 'GET' && action === 'status') {
    const envConfigured = Boolean(getEnvAdminPasscode());
    const configured = envConfigured || Boolean(claimedAdminHash);
    return jsonResponse(200, {
      configured,
      source: envConfigured ? 'env' : claimedAdminHash ? 'claimed' : 'unclaimed',
    });
  }

  if (method === 'GET' && action === 'verify') {
    const token = getBearerToken(event.headers);
    if (!verifyAdminSessionToken(token)) {
      return jsonResponse(401, { error: 'Invalid or expired owner session' });
    }
    return jsonResponse(200, { authenticated: true });
  }

  if (action === 'replies' || segments.includes('replies')) {
    const token = getBearerToken(event.headers);
    if (!verifyAdminSessionToken(token)) {
      return jsonResponse(401, { error: 'Owner authentication required' });
    }
    if (method === 'GET') {
      return jsonResponse(200, { replies: dispatchedReplies });
    }
    if (method === 'POST') {
      let body = {};
      try {
        body = parseJsonBody(event);
      } catch {
        return jsonResponse(400, { error: 'Invalid JSON request payload' });
      }
      const messageId = typeof body?.messageId === 'string' ? body.messageId.trim() : '';
      const replyText = typeof body?.replyText === 'string' ? body.replyText.trim() : '';
      if (!messageId || !replyText) {
        return jsonResponse(400, { error: 'messageId and replyText are required.' });
      }
      const record = {
        id: `srv-reply-${Date.now()}`,
        messageId,
        replyText,
        sentAt: new Date().toISOString(),
        verificationHash:
          typeof body?.verificationHash === 'string'
            ? body.verificationHash
            : `LDC-SIG-${Date.now().toString(36).toUpperCase()}`,
      };
      dispatchedReplies.unshift(record);
      return jsonResponse(200, { success: true, reply: record });
    }
  }

  if (method === 'POST' && (action === 'setup' || action === 'login')) {
    let parsedBody = {};
    try {
      parsedBody = parseJsonBody(event);
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON request payload' });
    }

    const passcode = typeof parsedBody?.passcode === 'string' ? parsedBody.passcode.trim() : '';

    if (action === 'setup') {
      if (getEnvAdminPasscode() || claimedAdminHash) {
        return jsonResponse(409, { error: 'Owner passcode is already configured.' });
      }
      if (passcode.length < 8 || passcode.length > 128) {
        return jsonResponse(400, { error: 'Owner passcode must be between 8 and 128 characters.' });
      }
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPasscodeScrypt(passcode, salt).toString('hex');
      claimedAdminHash = { salt, hash, claimedAt: new Date().toISOString() };
      try {
        fs.writeFileSync(ADMIN_HASH_FILE, JSON.stringify(claimedAdminHash), { encoding: 'utf-8', mode: 0o600 });
      } catch {
        // ignore
      }
      const session = issueAdminSessionToken();
      return jsonResponse(201, { success: true, token: session.token, expiresAt: session.expiresAt });
    }

    if (!getEnvAdminPasscode() && !claimedAdminHash) {
      return jsonResponse(409, { error: 'Owner passcode has not been set up yet.', requiresSetup: true });
    }
    if (!passcode || passcode.length > 128 || !verifyOwnerPasscode(passcode)) {
      return jsonResponse(401, { error: 'Incorrect Site Owner passcode.' });
    }
    const session = issueAdminSessionToken();
    return jsonResponse(200, { success: true, token: session.token, expiresAt: session.expiresAt });
  }

  return jsonResponse(404, { error: 'Admin endpoint not found' });
}
