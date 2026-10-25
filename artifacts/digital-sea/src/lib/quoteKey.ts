/**
 * A quote's identity for its added date (shared/content/quotes-added.json):
 * letters and digits of its text only, so punctuation repairs, emphasis and
 * moving it to another category keep its date. Identical in every design and
 * in scripts/quotes-added.ts; check-designs.mjs compares the copies.
 */
export function quoteKey(text: string): string {
  const norm = text.normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '').toLowerCase();
  // Two independent 32-bit FNV-1a passes: 16 hex characters, no collisions at
  // this bank's size.
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ norm.length;
  for (let i = 0; i < norm.length; i++) {
    const c = norm.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c, 0x01000193) ^ (b >>> 15);
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
}
