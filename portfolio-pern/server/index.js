import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const isProd = process.env.NODE_ENV === 'production';
const { DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL || !JWT_SECRET || !ADMIN_PASSWORD) {
  console.error('Missing DATABASE_URL, JWT_SECRET or ADMIN_PASSWORD environment variable.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS photo (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    data BYTEA NOT NULL,
    mime TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);

const app = express();
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

// ---- auth (single owner) ----
const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();
const passwordOk = (given) => crypto.timingSafeEqual(digest(given), digest(ADMIN_PASSWORD));

const requireOwner = (req, res, next) => {
  try {
    jwt.verify(req.cookies.token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Please log in' });
  }
};

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Try again later.' } });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many messages. Try again later.' } });

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/login', loginLimiter, (req, res) => {
  if (!passwordOk(req.body?.password ?? '')) return res.status(401).json({ error: 'Wrong password' });
  const token = jwt.sign({ role: 'owner' }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: isProd, maxAge: 7 * 864e5 });
  res.json({ ok: true });
});
app.post('/api/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(204).end();
});
app.get('/api/me', requireOwner, (_req, res) => res.json({ ok: true }));

// ---- profile photo: anyone can view, only the owner can change ----
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024, files: 1 } });
const sniff = (b) =>
  b[0] === 0xff && b[1] === 0xd8 ? 'image/jpeg'
  : b.subarray(0, 4).toString('hex') === '89504e47' ? 'image/png'
  : b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' ? 'image/webp'
  : null;

app.get('/api/profile', async (_req, res) => {
  const { rows } = await pool.query('SELECT extract(epoch from updated_at)::bigint AS v FROM photo WHERE id = 1');
  res.set('Cache-Control', 'no-cache');
  res.json({ hasPhoto: rows.length > 0, version: rows[0]?.v ?? null });
});
app.get('/api/photo', async (_req, res) => {
  const { rows } = await pool.query('SELECT data, mime FROM photo WHERE id = 1');
  if (!rows.length) return res.status(404).end();
  res.set({ 'Content-Type': rows[0].mime, 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' });
  res.send(rows[0].data);
});
app.post('/api/photo', requireOwner, upload.single('photo'), async (req, res) => {
  const mime = req.file && sniff(req.file.buffer);
  if (!mime) return res.status(400).json({ error: 'Upload a JPG, PNG or WebP image' });
  await pool.query(
    `INSERT INTO photo (id, data, mime, updated_at) VALUES (1, $1, $2, now())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, mime = EXCLUDED.mime, updated_at = now()`,
    [req.file.buffer, mime]
  );
  res.json({ ok: true });
});
app.delete('/api/photo', requireOwner, async (_req, res) => {
  await pool.query('DELETE FROM photo WHERE id = 1');
  res.status(204).end();
});

// ---- contact messages: anyone can send, only the owner can read ----
app.post('/api/contact', contactLimiter, async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim();
  const body = String(req.body?.message ?? '').trim();
  if (!name || name.length > 100) return res.status(400).json({ error: 'Enter your name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: 'Enter a valid email' });
  if (body.length < 5 || body.length > 2000) return res.status(400).json({ error: 'Message must be 5 to 2000 characters' });
  await pool.query('INSERT INTO messages (name, email, body) VALUES ($1, $2, $3)', [name, email, body]);
  res.status(201).json({ ok: true });
});
app.get('/api/messages', requireOwner, async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, body, created_at FROM messages ORDER BY id DESC LIMIT 200');
  res.json(rows);
});
app.delete('/api/messages/:id', requireOwner, async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id = $1', [Number(req.params.id) || 0]);
  res.status(204).end();
});

// ---- React build ----
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
app.use(express.static(dist));
app.get('*', (req, res, next) => (req.path.startsWith('/api') ? next() : res.sendFile(path.join(dist, 'index.html'))));

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Image is larger than 3 MB' : 'Upload failed' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Portfolio running on port ${port}`));
