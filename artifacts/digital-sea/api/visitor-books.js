const URL = process.env.nuroctanesitestorage_KV_REST_API_URL;
const TOKEN = process.env.nuroctanesitestorage_KV_REST_API_TOKEN;

const BOOKS_KEY = 'visitor-books';
const OVERRIDES_KEY = 'read-overrides';
const ADMIN_PASSWORD = 'xnegro';

async function kvGet(key) {
  const res = await fetch(`${URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`KV GET ${key} failed: ${res.status}`);
  const data = await res.json();
  return data.result;
}

async function kvSet(key, value) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, value]),
  });
  if (!res.ok) throw new Error(`KV SET ${key} failed: ${res.status}`);
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (!URL || !TOKEN) {
    return res.status(503).json({ error: 'KV_NOT_CONFIGURED', message: 'Missing env vars' });
  }

  try {
    if (req.method === 'GET') {
      const booksRaw = await kvGet(BOOKS_KEY);
      const overridesRaw = await kvGet(OVERRIDES_KEY);
      const books = booksRaw ? JSON.parse(booksRaw) : [];
      const overrides = overridesRaw ? JSON.parse(overridesRaw) : {};
      return res.status(200).json({ books, overrides });
    }

    if (req.method === 'POST') {
      const { action } = req.body;

      if (action === 'add') {
        const { book } = req.body;
        if (!book || !book.title) {
          return res.status(400).json({ error: 'Missing book title' });
        }
        const booksRaw = await kvGet(BOOKS_KEY);
        const books = booksRaw ? JSON.parse(booksRaw) : [];
        books.push(book);
        await kvSet(BOOKS_KEY, JSON.stringify(books));
        return res.status(200).json({ ok: true });
      }

      if (action === 'delete') {
        const { password, book } = req.body;
        if (password !== ADMIN_PASSWORD) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
        const booksRaw = await kvGet(BOOKS_KEY);
        const books = booksRaw ? JSON.parse(booksRaw) : [];
        const filtered = books.filter(b =>
          !(b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded),
        );
        await kvSet(BOOKS_KEY, JSON.stringify(filtered));
        return res.status(200).json({ ok: true });
      }

      if (action === 'toggleVisitorRead') {
        const { password, book } = req.body;
        if (password !== ADMIN_PASSWORD) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
        const booksRaw = await kvGet(BOOKS_KEY);
        const books = booksRaw ? JSON.parse(booksRaw) : [];
        const idx = books.findIndex(b =>
          b.title === book.title && b.author === book.author && b.dateAdded === book.dateAdded,
        );
        if (idx >= 0) {
          books[idx].read = !books[idx].read;
          await kvSet(BOOKS_KEY, JSON.stringify(books));
        }
        return res.status(200).json({ ok: true });
      }

      if (action === 'toggleCuratedRead') {
        const { password, key, read } = req.body;
        if (password !== ADMIN_PASSWORD) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
        const overridesRaw = await kvGet(OVERRIDES_KEY);
        const overrides = overridesRaw ? JSON.parse(overridesRaw) : {};
        overrides[key] = read;
        await kvSet(OVERRIDES_KEY, JSON.stringify(overrides));
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', message: msg });
  }
};
