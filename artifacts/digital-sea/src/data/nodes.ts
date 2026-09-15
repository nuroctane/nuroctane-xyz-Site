import * as THREE from 'three';
import { curve } from './path';
import { directoryEntries as raw } from './directory';

export interface NodeData {
  id: string;
  label: string;
  handle: string;
  url: string;
  urlDisplay: string;
  subtitle: string;
  description: string;
  avatar: string;
  logo: string;
  /** Optional QuickNav label; falls back to `label` when omitted. */
  navLabel?: string;
  scrollStart: number;
  scrollEnd: number;
  position: THREE.Vector3;
  idleRotation: THREE.Euler;
}

const zFromMid = (s: number, e: number) => curve.getPoint((s + e) / 2).z;



// Cards alternate sides and are spread by *even midpoints* along the scroll
// path so focus spacing stays uniform as cards are added/removed. Width expands
// symmetrically around each mid  -  never "start + width"  -  so a wider first card
// (edge envelope) cannot collapse into TikTok/X the way the old layout did.
const yPattern = [1.0, -0.4, 1.3, 0.2, -0.8, 0.9, 0.1, -0.5, 1.1, 0.5, -0.2, 0.8, 0.3, -0.6, 1.0, 0.4, -0.1];

// Focus band: after identity panel, before portal attractors (~0.955).
// Slightly wider than the old 0.075→0.875 start band so mid-to-mid gaps breathe.
const FIRST_MID = 0.090;
const LAST_MID  = 0.910;

// Glasp was inserted at the social→projects seam. It used to share NurCLI's
// layout slot and get pulled back half a step so every other card kept its
// exact pre-insertion midpoint (no full-sea reflow) — but that compressed the
// Reddit → Glasp → NurCLI seam to half the normal spacing while every other
// pair in the sea sat a full MID_STEP apart, which read as janky while
// swimming through there. Every node now gets its own full, uniformly-spaced
// slot (MID_STEP recomputed across the true node count) — the one thing this
// deliberately still keeps from the old insertion is layoutIndexFor's parity
// below, which drives left/right side + y-pattern/rotation and is a separate,
// already-tuned concern from spacing.
const INSERTED_NODE_ID = 'glasp';
const INSERTED_INDEX = raw.findIndex(n => n.id === INSERTED_NODE_ID);
const layoutIndexFor = (i: number) => i > INSERTED_INDEX ? i - 1 : i;
const MID_STEP = (LAST_MID - FIRST_MID) / Math.max(1, raw.length - 1);

// Attractor envelope (full width). Softly overlaps neighbors for magnetic
// swimming; peak focus points remain MID_STEP apart so cards never stack.
const CARD_WIDTH = 0.040;
// Gentle ease-in/out at the ends  -  still centered on the even mid.
const EDGE_CARD_WIDTH = 0.048;

// At their default alternating x-side, these nodes land on the *same* side as
// the camera path at their t value (< 1 unit apart in X)  -  flip them across
// so the camera looks across the sea at the card instead of being nose-to-it.
// When inserting a node mid-list, index parity shifts for everything after it  - 
// invert FLIP membership for those shifted ids so their world-side stays put.
// Existing nodes retain their world-side when new cards are appended.
const FLIP_X = new Set([
  'tiktok', 'substack', 'kick', 'goodreads', 'remilia',
  // nur-cli insert shifts creative parity  -  keep facing readable across the sea
  'nur-cli',
  'modkeys',
  'snipocr',
  // flip blackjack so it faces opposite snipocr at adjacent scroll slots
  'blackjack',
  // blackjack inserted after snipocr  -  nodes after it inverted vs pre-insert set
  'atxtunerz', 'hoodstock', 'sis', 'starsleep', 'miyamaker', 'webutils',
  // github + geoskin were flipped pre-insert; inverted out after shift
]);

// Late-path nodes get a slightly wider envelope so the camera has more scroll
// distance to frame them (esp. mobile). Widths stay well under ~1.6× MID_STEP
// so neighboring peaks remain distinct; still centered on the even mid.
// Glasp used to have a narrowed 0.028 entry here to fit the half-step squeeze
// removed above — it now gets a full uniform slot like any other non-wide,
// non-edge node, so it just falls through to the default CARD_WIDTH.
const WIDE_CARD: Record<string, number> = {
  'nur-cli':   0.054,
  modkeys:     0.054,
  snipocr:     0.052,
  blackjack:   0.052,
  atxtunerz:   0.054,
  github:      0.050,
  hoodstock:   0.056,
  sis:         0.054,
  starsleep:  0.056,
  geoskin:     0.056,
  miyamaker:   0.058,
  // last card before portals  -  smooth entrance + room to pivot away
  webutils:    0.056,
  observatory: 0.058,
};

const Z_OVERRIDE: Record<string, number> = {};

const SOCIAL_COUNT = raw.findIndex(n => n.id === 'nur-cli');

export const nodes: NodeData[] = raw.map((n, i) => {
  const isEdge = i === 0 || i === raw.length - 1;
  // Every node — Glasp included — gets its own full, uniformly-spaced slot.
  // See the comment above MID_STEP for why this is no longer a special case.
  const mid = FIRST_MID + i * MID_STEP;
  const cardWidth = WIDE_CARD[n.id] ?? (isEdge ? EDGE_CARD_WIDTH : CARD_WIDTH);
  const scrollStart = mid - cardWidth / 2;
  const scrollEnd   = mid + cardWidth / 2;

  // Determine which side to place the card.
  // Default alternates per node; FLIP_X nodes get the opposite side.
  // visualIndex intentionally still uses layoutIndexFor's pre-Glasp-insertion
  // parity — side/y-pattern/rotation are a separate, already-tuned concern
  // from the spacing fix above; changing this would flip left/right for every
  // node after Glasp for no reason.
  const layoutIndex = layoutIndexFor(i);
  const visualIndex = n.id === INSERTED_NODE_ID ? i : layoutIndex;
  const defaultSide = visualIndex % 2 === 0 ? -1 : 1;
  const side = FLIP_X.has(n.id) ? -defaultSide : defaultSide;
  const x = side * (isEdge ? 1.4 : 2.0);

  const rawZ = zFromMid(scrollStart, scrollEnd);
  const z    = Z_OVERRIDE[n.id] ?? rawZ;

  return {
    ...n,
    scrollStart,
    scrollEnd,
    position: new THREE.Vector3(x, yPattern[visualIndex % yPattern.length], z),
    idleRotation: new THREE.Euler(
      (visualIndex % 3 - 1) * 0.15,
      x < 0 ? 0.55 : -0.55,
      (visualIndex % 2 === 0 ? 1 : -1) * 0.08,
    ),
  };
});

/** Midpoint of a node's scroll attractor window. */
export function nodeMid(n: Pick<NodeData, 'scrollStart' | 'scrollEnd'>): number {
  return (n.scrollStart + n.scrollEnd) / 2;
}

/**
 * Scroll t to land on when jumping to a card: slightly before mid so the card
 * blooms into frame while swimming, but past scrollStart. Never jump to
 * scrollStart itself  -  an envelope's leading edge sits inside the previous
 * card's window (widths overlap by design), so /projects landed on Reddit
 * rather than NurCLI. Shared by nav, deep-links and section jumps so every
 * entry point frames the same card.
 */
const APPROACH_FRAC = 0.35;

export function nodeApproachT(n: Pick<NodeData, 'scrollStart' | 'scrollEnd'>): number {
  return n.scrollStart + (n.scrollEnd - n.scrollStart) * APPROACH_FRAC;
}

/**
 * Boundary between socials and creative projects (scroll t).
 * Midway between last social and first project focus  -  stays correct when
 * spacing constants change.
 */
export const PROJECT_THRESHOLD: number = (() => {
  const lastSocial   = nodes[Math.max(0, SOCIAL_COUNT - 1)];
  const firstProject = nodes[Math.min(nodes.length - 1, SOCIAL_COUNT)];
  if (!lastSocial || !firstProject || lastSocial === firstProject) return 0.57;
  return (nodeMid(lastSocial) + nodeMid(firstProject)) / 2;
})();
