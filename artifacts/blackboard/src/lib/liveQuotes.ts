import { useEffect, useState } from 'react';

/**
 * The quotes bank, live. The quotes pipeline publishes every run to
 * /api/quotes (worker/quotes.ts), so a new quote shows without a deploy. The
 * bank bundled at build renders first and stays whenever the live one is
 * missing or unreachable.
 */
let live: string | null = null;
let pending: Promise<string | null> | null = null;

function fetchLive(): Promise<string | null> {
  pending ??= fetch('/api/quotes', { headers: { accept: 'text/markdown' } })
    .then(response => (response.ok ? response.text() : null))
    .then(text => (live = text && text.includes('## ') ? text : null))
    .catch(() => null)
    .finally(() => { pending = null; });
  return pending;
}

export function useLiveQuotes(bundled: string): string {
  const [bank, setBank] = useState(live ?? bundled);
  useEffect(() => {
    let active = true;
    fetchLive().then(text => { if (active && text) setBank(text); });
    return () => { active = false; };
  }, []);
  return bank;
}
