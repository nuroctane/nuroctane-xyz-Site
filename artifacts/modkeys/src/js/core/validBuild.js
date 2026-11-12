/* Builds arrive from anyone: shared #links, the community gallery, and (through
 * the undo stack) whatever was loaded from those. A build is rebuilt here from
 * an allowlist, never cleaned of a blocklist: only the fields a build has are
 * kept, each one checked against its own table or shape, and anything else is
 * dropped. The result has no key a page could not have made itself.
 *
 * - enums (layout, profile, colorway, case, finish, plate, switch, material,
 *   brand, light mode, image fit, emoji) must be own keys of their tables;
 * - colours are #rgb … #rrggbbaa, nothing else (no url(), no names);
 * - numbers are finite and clamped to what the sliders allow;
 * - per-key ids are row-col or "knob"; images are PNG/JPEG data URLs, capped;
 * - text is length-capped (legends reach canvas textures and escaped markup).
 *
 * The API (api-server routes/modkeys.ts) runs this over every build posted to the
 * community gallery and every entry it serves, and miyaOS's gallery proxy runs its
 * copy of this file too, so keep it free of DOM and three.js, and keep the two in
 * step (validBuild.d.ts gives the API its types). */
import { LAYOUTS } from '../data/layouts.js';
import { COLORWAYS } from '../data/colorways.js';
import { CASES, FINISHES, PLATES, SWITCHES, MATERIALS, PROFILES, EXTRAS } from '../data/components.js';
import { BRAND_MARKS, EMOJI, MARKS } from '../data/art.js';

export const MAX_LEGEND = 64;
export const MAX_NAME = 40;
/** Largest key image a build may carry, as a data URL (a 3 MB file, base64). See imageLoader.js. */
export const MAX_IMAGE_DATA = 4 * 1024 * 1024 + 64;
/** More than any layout has keys (a 75% board has under 90), plus the knob. */
export const MAX_OVERRIDES = 160;
export const LIGHT_MODES = { wave: 0, static: 1, breathe: 2, off: 3 };
export const IMAGE_FITS = { wrap: 1, fill: 1, sticker: 1 };
export const BRIGHT_MIN = 0;
export const BRIGHT_MAX = 1.5;
export const FONT_MIN = 12;
export const FONT_MAX = 48;

const HEX = /^#[0-9a-f]{3,8}$/i;
const KEY_ID = /^(\d{1,2}-\d{1,2}|knob)$/;
const IMAGE = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/;

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const own = (table, v) => (typeof v === 'string' || typeof v === 'number') && Object.hasOwn(table, String(v));
const field = (o, k) => (Object.hasOwn(o, k) ? o[k] : undefined);

export const isHex = (v) => typeof v === 'string' && HEX.test(v);
export const isKeyId = (v) => typeof v === 'string' && KEY_ID.test(v);
export const isImageData = (v) => typeof v === 'string' && v.length <= MAX_IMAGE_DATA && IMAGE.test(v);
export const isMark = (v) => typeof v === 'string' && (Object.hasOwn(EMOJI, v) || Object.hasOwn(MARKS, v));
export const isLayout = (v) => own(LAYOUTS, v);

function num(v, min, max) {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

/** Text a person typed, cut to `max` characters, with control characters other than a newline taken out. */
export function cleanText(v, max) {
  if (typeof v !== 'string') return undefined;
  return v.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').slice(0, max);
}

/** A colour, or null where the build may say "use the default" (case, plate, switch tints). */
function tint(o, k) {
  const v = field(o, k);
  if (v === null) return null;
  return isHex(v) ? v : undefined;
}

function light(v) {
  if (!isObj(v)) return undefined;
  const out = {};
  const mode = field(v, 'mode');
  if (own(LIGHT_MODES, mode)) out.mode = String(mode);
  const color = field(v, 'color');
  if (isHex(color)) out.color = color;
  const bright = num(field(v, 'bright'), BRIGHT_MIN, BRIGHT_MAX);
  if (bright !== undefined) out.bright = bright;
  return Object.keys(out).length ? out : undefined;
}

function extras(v) {
  if (!isObj(v)) return undefined;
  const out = {};
  for (const k of Object.keys(EXTRAS)) {
    const b = field(v, k);
    if (typeof b === 'boolean') out[k] = b;
  }
  return Object.keys(out).length ? out : undefined;
}

/** All three roles, each with both colours, or nothing: the renderer reads every one of them. */
function customColors(v) {
  if (v === null) return null;
  if (!isObj(v)) return undefined;
  const out = {};
  for (const role of ['a', 'm', 'x']) {
    const r = field(v, role);
    if (!isObj(r) || !isHex(field(r, 'bg')) || !isHex(field(r, 'fg'))) return undefined;
    out[role] = { bg: r.bg, fg: r.fg };
  }
  return out;
}

/** One key's override, or undefined when nothing in it is valid. */
export function validOverride(v) {
  if (!isObj(v)) return undefined;
  const out = {};
  for (const k of ['bgColor', 'fgColor']) if (isHex(field(v, k))) out[k] = v[k];
  const text = cleanText(field(v, 'customText'), MAX_LEGEND);
  if (text !== undefined) out.customText = text;
  const fs = num(field(v, 'fontSize'), FONT_MIN, FONT_MAX);
  if (fs !== undefined) out.fontSize = fs;
  if (own(IMAGE_FITS, field(v, 'imageFit'))) out.imageFit = v.imageFit;
  if (isMark(field(v, 'markId'))) out.markId = v.markId;
  if (isImageData(field(v, 'imageData'))) out.imageData = v.imageData;
  for (const k of ['glow', 'labelHidden', 'imageBehindText']) if (typeof field(v, k) === 'boolean') out[k] = v[k];
  return Object.keys(out).length ? out : undefined;
}

/** The per-key map, keyed by row-col / knob, with no prototype (so no id can reach Object.prototype). */
export function validOverrides(v, { images = true } = {}) {
  if (!isObj(v)) return undefined;
  const out = Object.create(null);
  let n = 0;
  for (const id of Object.keys(v)) {
    if (n >= MAX_OVERRIDES) break;
    if (!isKeyId(id)) continue;
    const o = validOverride(v[id]);
    if (!o) continue;
    if (!images) delete o.imageData;
    if (!Object.keys(o).length) continue;
    out[id] = o;
    n++;
  }
  return out;
}

const ENUMS = {
  layout: LAYOUTS,
  profile: PROFILES,
  brand: BRAND_MARKS,
  colorway: COLORWAYS,
  caseColor: CASES,
  finish: FINISHES,
  plate: PLATES,
  sw: SWITCHES,
  material: MATERIALS,
};

/** The fields a build carries. Everything else a snapshot may hold (view, tool, theme, section, selection) is the
 *  viewer's own and never comes from outside. */
export const BUILD_FIELDS = [
  ...Object.keys(ENUMS),
  'caseCustomColor', 'plateColor', 'switchColor', 'light', 'extras', 'customColors', 'perKeyOverrides',
];

/**
 * A build rebuilt from its allowed fields, or null when `raw` is not an object. Invalid fields are left out (the
 * page keeps its current value for them). `images: false` drops key images (the gallery does not store them).
 */
export function validBuild(raw, { images = true } = {}) {
  if (!isObj(raw)) return null;
  const out = {};
  for (const [k, table] of Object.entries(ENUMS)) {
    const v = field(raw, k);
    if (own(table, v)) out[k] = String(v);
  }
  for (const k of ['caseCustomColor', 'plateColor', 'switchColor']) {
    const v = tint(raw, k);
    if (v !== undefined) out[k] = v;
  }
  const l = light(field(raw, 'light'));
  if (l) out.light = l;
  const e = extras(field(raw, 'extras'));
  if (e) out.extras = e;
  const cc = customColors(field(raw, 'customColors'));
  if (cc !== undefined) out.customColors = cc;
  const pk = validOverrides(field(raw, 'perKeyOverrides'), { images });
  if (pk) out.perKeyOverrides = pk;
  return out;
}

const GALLERY_ID = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * One community gallery entry ({ id, name, layout, createdAt, snap }), or null when it has no usable id or build.
 * `layout` is taken from the build, so a card never says one thing and loads another.
 */
export function validGalleryEntry(t) {
  if (!isObj(t)) return null;
  const id = field(t, 'id');
  if (typeof id !== 'string' || !GALLERY_ID.test(id)) return null;
  const snap = validBuild(field(t, 'snap'), { images: false });
  if (!snap || !Object.keys(snap).length) return null;
  const name = (cleanText(field(t, 'name'), MAX_NAME) || '').replace(/\n/g, ' ').trim() || 'Untitled build';
  const out = { id, name, snap };
  if (snap.layout) out.layout = snap.layout;
  const at = field(t, 'createdAt');
  if (typeof at === 'string' && at.length <= 40 && Number.isFinite(Date.parse(at))) out.createdAt = at;
  return out;
}
