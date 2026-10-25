import { quoteKey } from './quoteKey';

export type QuoteOrder = 'newest' | 'oldest';

/** A quote with no recorded date arrived after the dates file: the newest. */
export const UNSEEN = Number.MAX_SAFE_INTEGER;

/**
 * Newest first: each category's quotes by added time, and categories by their
 * most recent addition. Oldest first is the exact mirror. Ties keep the bank's
 * order (append order within a section). Identical in every design;
 * check-designs.mjs compares the copies.
 */
export function rankByRecency<Q extends { text: string }, S extends { name: string; quotes: Q[] }>(
  sections: S[],
  order: QuoteOrder,
  added: Record<string, number>,
): S[] {
  const ranked = sections.map((section, sectionIndex) => {
    const quotes = section.quotes
      .map((quote, position) => ({ quote, position, at: added[quoteKey(quote.text)] ?? UNSEEN }))
      .sort((x, y) => y.at - x.at || y.position - x.position);
    return { section, sectionIndex, latest: quotes[0]?.at ?? 0, quotes: quotes.map(q => q.quote) };
  });
  ranked.sort((x, y) => y.latest - x.latest || x.sectionIndex - y.sectionIndex);
  const newest = ranked.map(r => ({ ...r.section, quotes: r.quotes }));
  return order === 'newest' ? newest : newest.reverse().map(s => ({ ...s, quotes: [...s.quotes].reverse() }));
}
