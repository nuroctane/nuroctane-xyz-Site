/* Builds arrive from anyone: the community gallery and shared #links. Colours,
 * ids and names never hold markup characters, and several panels write state
 * into HTML, so such strings are dropped, as are keys that would reach
 * Object.prototype. Key legends are the exception: `"`, `<`, `>` and `` ` `` are
 * real legends, and legend text only reaches canvas textures and escaped
 * inputs, so it is kept (length-capped). Every way a build comes in passes
 * through here; keep in step with unsafeSnapValue in api-server modkeys.ts. */
const UNSAFE_TEXT = /[<>"`]|javascript:/i;
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const LEGEND_KEYS = new Set(['customText', 'text']);
const MAX_LEGEND = 64;

export function cleanSnap(value, key = '') {
  if (Array.isArray(value)) return value.map((v) => cleanSnap(v)).filter((v) => v !== undefined);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (UNSAFE_KEYS.has(k)) continue;
      const clean = cleanSnap(v, k);
      if (clean !== undefined) out[k] = clean;
    }
    return out;
  }
  if (typeof value === 'string') {
    if (LEGEND_KEYS.has(key)) return value.slice(0, MAX_LEGEND);
    if (UNSAFE_TEXT.test(value)) return undefined;
  }
  return value;
}
