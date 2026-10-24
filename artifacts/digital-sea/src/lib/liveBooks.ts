import { useEffect, useState } from 'react';

/**
 * The books list, live. /api/books (worker/books.ts) serves shared/content/books.md
 * as last published: by the latest deploy, by the local pipeline for edits not
 * yet deployed, or by an admin read toggle. The list bundled at build renders
 * first and stays whenever the live one is missing or unreachable.
 */
let live: string | null = null;
let pending: Promise<string | null> | null = null;

function fetchLive(): Promise<string | null> {
  // no-cache revalidates by ETag, so an admin's toggle shows on the next load.
  pending ??= fetch('/api/books', { headers: { accept: 'text/markdown' }, cache: 'no-cache' })
    .then(response => (response.ok ? response.text() : null))
    .then(text => {
      // A failed refresh keeps the last good live list rather than dropping it.
      if (text && text.includes('## ') && text.includes('- [')) live = text;
      return live;
    })
    .catch(() => live)
    .finally(() => { pending = null; });
  return pending;
}

export function useLiveBooks(bundled: string): string {
  const [bank, setBank] = useState(live ?? bundled);
  useEffect(() => {
    let active = true;
    fetchLive().then(text => { if (active && text) setBank(text); });
    return () => { active = false; };
  }, []);
  return bank;
}

/** Admin: mark a curated book read or unread (needs the admin session cookie). */
export async function saveCuratedRead(key: string, read: boolean): Promise<void> {
  const response = await fetch('/api/books/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, read }),
  });
  if (!response.ok) throw new Error(`books/read ${response.status}`);
  // Later mounts start from the toggled list, not the one fetched before it.
  if (live) live = setReadMark(live, key, read);
}

/** The list with every line of `key` (`Title|Author`) checked or unchecked. */
function setReadMark(text: string, key: string, read: boolean): string {
  return text.split('\n').map(line => {
    const match = line.match(/^- \[([ x])\] (.+)$/);
    if (!match) return line;
    const content = match[2].trim();
    const sep = content.indexOf(' — ');
    const author = sep > 0 ? content.slice(0, sep).trim() : '';
    const title = (sep > 0 ? content.slice(sep + 3) : content).replace(/_\(.+?\)_/, '').trim();
    return `${title}|${author}` === key ? `- [${read ? 'x' : ' '}] ${match[2]}` : line;
  }).join('\n');
}
