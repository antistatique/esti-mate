import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import spellingRouter from './routes/spelling.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

function matchOrigin(origin, pattern) {
  if (!pattern) return false;
  if (pattern === '*') return true;
  // Protocol wildcard like "https://*"
  if (pattern.endsWith('://*')) return origin.startsWith(pattern.replace('*', ''));
  // Protocol-only prefix like "https://"
  if (pattern.endsWith('://')) return origin.startsWith(pattern);

  let originUrl;
  try { originUrl = new URL(origin); } catch { /* ignore */ }

  // Exact string match
  if (!pattern.includes('*') && !pattern.includes('://')) {
    return origin === pattern;
  }

  // Pattern is a URL with possible wildcard host
  try {
    const pUrl = new URL(pattern.replace('*.', 'placeholder.'));
    const wildcardHost = pattern.includes('*.');
    if (wildcardHost && originUrl) {
      const hostPattern = pUrl.hostname.replace('placeholder.', ''); // e.g., "harvestapp.com"
      return originUrl.protocol === pUrl.protocol && originUrl.hostname.endsWith(hostPattern);
    }
    // No wildcard, compare exact
    return origin === pattern;
  } catch {
    // Fallback: domain wildcard without protocol e.g., "*.harvestapp.com"
    if (pattern.startsWith('*.') && originUrl) {
      return originUrl.hostname.endsWith(pattern.slice(1));
    }
    return origin === pattern;
  }
}

app.use(express.json({ limit: '1mb' }));

// Simple, explicit CORS handler to avoid surprises
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next();
  const ok = allowedOrigins.length === 0 || allowedOrigins.some((o) => matchOrigin(origin, o));
  if (!ok) {
    console.warn('CORS blocked', { origin, allowedOrigins });
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return res.status(403).send('Not allowed by CORS');
  }
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/check-spelling', spellingRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Spellcheck server listening on :${PORT}`);
});
