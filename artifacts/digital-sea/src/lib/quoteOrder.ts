import addedRaw from '@shared/quotes-added.json?raw';
import { rankByRecency, type QuoteOrder } from './quoteRank';

/**
 * Newest/oldest ordering by when each quote was added: the category that most
 * recently gained a quote comes first, tabs included. Dates come from
 * shared/content/quotes-added.json, which the quotes pipeline keeps (backfilled
 * from git history); a live quote it has not recorded yet counts as newest.
 */
let added: Record<string, number> = {};
try {
  added = (JSON.parse(addedRaw) as { added?: Record<string, number> }).added ?? {};
} catch { /* no dates: bank order */ }

export type { QuoteOrder };

export function orderByRecency<Q extends { text: string }, S extends { name: string; quotes: Q[] }>(
  sections: S[],
  order: QuoteOrder,
): S[] {
  return rankByRecency(sections, order, added);
}
