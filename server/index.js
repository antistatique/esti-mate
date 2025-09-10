import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load .env next to this file, regardless of where the server is launched from
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

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
  res.setHeader('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-API-Key');
  if (req.method === 'OPTIONS') {
    // Cache preflight to reduce OPTIONS chatter
    res.setHeader('Access-Control-Max-Age', '600'); // 10 minutes (browsers cap if needed)
    return res.sendStatus(204);
  }
  next();
});

// Simple healthcheck at root
app.get('/', (_req, res) => res.json({ ok: true }));
app.get('/config', (_req, res) => {
  res.json({
    port: PORT,
    openai: !!process.env.OPENAI_API_KEY,
    allowedOriginsCount: allowedOrigins.length,
    secretRequired: !!(process.env.ESTI_SECRET && process.env.ESTI_SECRET.trim()),
  });
});
// Import routes after env is loaded so they see OPENAI_API_KEY
const spellingRouter = (await import('./routes/spelling.js')).default;
// Simple shared-secret protection: if ESTI_SECRET is set, require it
const secrets = (process.env.ESTI_SECRET || '').split(',').map(s => s.trim()).filter(Boolean);
function requireSecret(req, res, next) {
  if (!secrets.length) return next(); // disabled in dev
  const provided = req.header('x-api-key');
  if (provided && secrets.includes(provided)) return next();
  return res.status(401).json({ error: 'unauthorized' });
}
app.use('/check-spelling', requireSecret);
app.use('/check-spelling', spellingRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// On Vercel, prefer default export without listening. Keep listener for local dev.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Spellcheck server listening on :${PORT}`);
    console.log(`Config: OPENAI ${process.env.OPENAI_API_KEY ? 'set' : 'missing'}, ALLOWED_ORIGINS ${allowedOrigins.length}`);
  });
}

export default app;
