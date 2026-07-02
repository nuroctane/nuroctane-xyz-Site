import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Book {
  title: string;
  author: string;
  read: boolean;
  note?: string;
  visitor?: boolean;
  coverUrl?: string;
  dateAdded?: string;
  sessionId?: string;
}

const BOOKS_KEY = 'visitor-books';
const OVERRIDES_KEY = 'read-overrides';
const ADMIN_PASSWORD = 'xnegro';

const redis = new Redis({
  url: process.env.nuroctanesitestorage_KV_REST_API_URL!,
  token: process.env.nuroctanesitestorage_KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method === 'GET') {
      const books = (await redis.get<Book[]>(BOOKS_KEY)) ?? [];
      const overrides = (await redis.get<Record<string, boolean>>(OVERRIDES_KEY)) ?? {};
      return res.status(200).json({ books, overrides });
    }

    if (req.method === 'POST') {
      const { action } = req.body as { action: string };

      if (action === 'add') {
        const { book } = req.body as { book: Book };
        if (!book || !book.title) {
          return res.status(400).json({ error: 'Missing book title' });
        }
        const books = (await redis.get<Book[]>(BOOKS_KEY)) ?? [];
        books.push(book);
        await redis.set(BOOKS_KEY, books);
        return res.status(200).json({ ok: true });
      }

      if (action === 'delete') {
        const { password, book } = req.body as { password: string; book: Book };
        if (password !== ADMIN_PASSWORD) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
        const books = (await redis.get<Book[]>(BOOKS_KEY)) ?? [];
        const filtered = books.filter(b =>
          !(b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded),
        );
        await redis.set(BOOKS_KEY, filtered);
        return res.status(200).json({ ok: true });
      }

      if (action === 'toggleVisitorRead') {
        const { password, book } = req.body as { password: string; book: Book };
        if (password !== ADMIN_PASSWORD) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
        const books = (await redis.get<Book[]>(BOOKS_KEY)) ?? [];
        const idx = books.findIndex(b =>
          b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded,
        );
        if (idx >= 0) {
          books[idx].read = !books[idx].read;
          await redis.set(BOOKS_KEY, books);
        }
        return res.status(200).json({ ok: true });
      }

      if (action === 'toggleCuratedRead') {
        const { password, key, read } = req.body as {
          password: string; key: string; read: boolean;
        };
        if (password !== ADMIN_PASSWORD) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
        const overrides = (await redis.get<Record<string, boolean>>(OVERRIDES_KEY)) ?? {};
        overrides[key] = read;
        await redis.set(OVERRIDES_KEY, overrides);
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('env') || msg.includes('url') || msg.includes('token') || msg.includes('connect')) {
      return res.status(503).json({ error: 'KV_NOT_CONFIGURED', message: msg });
    }
    return res.status(500).json({ error: 'Internal server error', message: msg });
  }
}
