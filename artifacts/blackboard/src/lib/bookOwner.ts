import { useEffect, useState } from 'react';

/**
 * /api/visitor-books never publishes a visitor's sessionId (it is what proves
 * ownership); each book carries `owner`, a one-way tag of it. The page tags its
 * own sessionId the same way to recognise the books it added. Keep in step
 * with ownerTag in artifacts/api-server/src/routes/books.ts.
 */
export async function ownerTag(sessionId: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`nuroctane-book-owner:${sessionId}`));
  return [...new Uint8Array(digest)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** A per-tab id that cannot be guessed. */
export function newSessionId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Safari before 15.4 has no randomUUID; 16 random bytes serve the same.
  return [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useOwnerTag(sessionId: string): string {
  const [tag, setTag] = useState('');
  useEffect(() => {
    let active = true;
    if (sessionId) ownerTag(sessionId).then(value => { if (active) setTag(value); }).catch(() => {});
    return () => { active = false; };
  }, [sessionId]);
  return tag;
}

/** True when this tab added the book (a fresh local copy, or a listed one). */
export function isOwnBook(book: { sessionId?: string; owner?: string }, sessionId: string, tag: string): boolean {
  return Boolean((sessionId && book.sessionId === sessionId) || (tag && book.owner === tag));
}
