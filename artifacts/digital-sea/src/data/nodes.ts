import * as THREE from 'three';
import { curve } from './path';

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
  scrollStart: number;
  scrollEnd: number;
  position: THREE.Vector3;
  idleRotation: THREE.Euler;
}

const zFromMid = (s: number, e: number) => curve.getPoint((s + e) / 2).z;

const AVATAR = '/assets/nodes/nuroctane-avatar.png';

const raw: Omit<NodeData, 'position' | 'idleRotation' | 'scrollStart' | 'scrollEnd'>[] = [
  // ─── SOCIAL (15) ──────────────────────────────────────────────────────────
  {
    id: 'instagram', label: 'Instagram', handle: '@nuroctane',
    url: 'https://www.instagram.com/nuroctane/',
    urlDisplay: 'instagram.com/nuroctane',
    subtitle: '"the huzz"',
    description: 'mostly just automotive, irls and life stuff.',
    avatar: AVATAR,
    logo: '/assets/nodes/instagram-logo.png',
  },
  {
    id: 'tiktok', label: 'TikTok', handle: '@nuroctane',
    url: 'https://www.tiktok.com/@nuroctane',
    urlDisplay: 'tiktok.com/@nuroctane',
    subtitle: 'Goyslop central',
    description: "i really don't post here. i might one day. i tried at one point. idk.",
    avatar: AVATAR,
    logo: '/assets/nodes/tiktok-logo.png',
  },
  {
    id: 'x', label: 'X', handle: '@nuroctane',
    url: 'https://x.com/nuroctane',
    urlDisplay: 'x.com/nuroctane',
    subtitle: "fka twitter, Elon's gooncave",
    description: 'rants and musings.',
    avatar: AVATAR,
    logo: '/assets/nodes/x-logo.png',
  },
  {
    id: 'remilia', label: 'Remilia', handle: '~nuroctane',
    url: 'https://www.remilia.net/~nuroctane',
    urlDisplay: 'remilia.net/~nuroctane',
    subtitle: 'milady',
    description: '',
    avatar: '/assets/nodes/nuroctane-remilia-cover.png',
    logo: '',
  },
  {
    id: 'substack', label: 'Substack', handle: 'Civeta Dei',
    url: 'https://substack.com/@nuroctane',
    urlDisplay: 'substack.com/@nuroctane',
    subtitle: 'yapperrrrr',
    description: 'rants and musings extended.',
    avatar: AVATAR,
    logo: '/assets/nodes/substack-logo.png',
  },
  {
    id: 'soundcloud', label: 'SoundCloud', handle: 'nuroctane',
    url: 'https://soundcloud.com/nuroctane',
    urlDisplay: 'soundcloud.com/nuroctane',
    subtitle: 'mixes and tunes',
    description: "i love making music, just don't do it enough.",
    avatar: AVATAR,
    logo: '/assets/nodes/soundcloud-logo.png',
  },
  {
    id: 'twitch', label: 'Twitch', handle: 'nuroctane',
    url: 'https://www.twitch.tv/nuroctane',
    urlDisplay: 'twitch.tv/nuroctane',
    subtitle: 'iwnl',
    description: 'i stream sometimes.',
    avatar: AVATAR,
    logo: '/assets/nodes/twitch-logo.png',
  },
  {
    id: 'youtube', label: 'YouTube', handle: '@nuroctane',
    url: 'https://www.youtube.com/@nuroctane',
    urlDisplay: 'youtube.com/@nuroctane',
    subtitle: 'nur!',
    description: 'i upload sometimes, commentary mostly.',
    avatar: AVATAR,
    logo: '/assets/nodes/youtube-logo.png',
  },
  {
    id: 'kick', label: 'Kick', handle: 'nuroctane',
    url: 'https://kick.com/nuroctane',
    urlDisplay: 'kick.com/nuroctane',
    subtitle: 'iwnl',
    description: 'i stream sometimes part 2.',
    avatar: AVATAR,
    logo: '/assets/nodes/kick-logo.png',
  },
  {
    id: 'anilist', label: 'AniList', handle: 'nuroctane',
    url: 'https://anilist.co/user/nuroctane/',
    urlDisplay: 'anilist.co/user/nuroctane',
    subtitle: 'anime and manga list mhm',
    description: "i update this whenever i'm actively watching an anime.",
    avatar: AVATAR,
    logo: '/assets/nodes/anilist-logo.png',
  },
  {
    id: 'letterboxd', label: 'Letterboxd', handle: 'nuroctane',
    url: 'https://letterboxd.com/nuroctane/',
    urlDisplay: 'letterboxd.com/nuroctane',
    subtitle: 'movie list mhm',
    description: 'movie list mhm',
    avatar: '/assets/nodes/nuroctane-letterboxd-avatar.png',
    logo: '/assets/nodes/letterboxd-logo.png',
  },
  {
    id: 'goodreads', label: 'Goodreads', handle: 'nuroctane',
    url: 'https://goodreads.com/nuroctane',
    urlDisplay: 'goodreads.com/nuroctane',
    subtitle: 'book reviews',
    description: 'click the recommendations card next to this to see my full library',
    avatar: '/assets/nodes/goodreads-nuroctane-avatar.png',
    logo: '/assets/nodes/goodreads-logo.png',
  },
  {
    id: 'steam', label: 'Steam', handle: 'nuroctane',
    url: 'https://steamcommunity.com/id/nuroctane',
    urlDisplay: 'steamcommunity.com/id/nuroctane',
    subtitle: 'gaben never loses',
    description: 'leave provocative comments on my profile please.',
    avatar: AVATAR,
    logo: '/assets/nodes/steam-logo.png',
  },
  {
    id: 'discord', label: 'Discord', handle: 'nuroctane',
    url: 'https://discord.com/users/139458577440964608',
    urlDisplay: 'discord.com/users/nuroctane',
    subtitle: 'nuroctane',
    description: 'ugh.',
    avatar: AVATAR,
    logo: '/assets/nodes/discord-logo.png',
  },
  {
    id: 'reddit', label: 'Reddit', handle: 'u/nuroctane',
    url: 'https://www.reddit.com/user/nuroctane/',
    urlDisplay: 'reddit.com/user/nuroctane',
    subtitle: 'posts & lurking',
    description: '',
    avatar: '/assets/nodes/nuroctane-reddit-avatar.png',
    logo: '/assets/nodes/reddit-logo.png',
  },

  // ─── CREATIVE PROJECTS (11)  -  NurCLI + MODKEYS first ─────────────────────
  {
    id: 'nur-cli', label: 'NurCLI', handle: 'nur',
    url: 'https://github.com/nuroctane/nur-cli',
    urlDisplay: 'github.com/nuroctane/nur-cli',
    subtitle: 'multi-provider terminal agent',
    description: 'Rust coding agent spanning 60+ providers  -  streaming TUI, /model picker, /plugins marketplace, native vision, 800+ skills, hardened sandbox. Built to rival Claude Code-class density.',
    avatar: '/assets/nodes/nur-cli-logo.png',
    logo: '/assets/nodes/github-logo.png',
  },
  {
    id: 'modkeys', label: 'MODKEYS', handle: 'keyboard configurator',
    url: 'https://www.nuroctane.xyz/modkeys',
    urlDisplay: 'nuroctane.xyz/modkeys',
    subtitle: 'design your endgame board',
    description: '3D mechanical keyboard configurator. build it, color it, export it.',
    avatar: '/assets/nodes/modkeys-logo.png',
    logo: '/assets/nodes/github-logo.png',
  },
  {
    id: 'snipocr', label: 'SnipOCR', handle: 'snipocr',
    url: 'https://github.com/nuroctane/snipocr',
    urlDisplay: 'github.com/nuroctane/snipocr',
    subtitle: 'screenshot → text',
    description: 'Automatic local OCR for Windows Snipping Tool and macOS screenshots',
    avatar: '/assets/nodes/snipocr-logo.png',
    logo: '/assets/nodes/github-logo.png',
  },
  {
    id: 'blackjack', label: 'Blackjack', handle: 'project',
    url: 'https://github.com/nuroctane/blackjack',
    urlDisplay: 'github.com/nuroctane/blackjack',
    subtitle: 'Quiet table. Dense engine.',
    description: 'Blackjack - liquid glass UI, SIWE (RainbowKit + WalletConnect) + GitHub auth, Capacitor iOS/Android. Accurate shoe odds.',
    avatar: '/assets/nodes/blackjack-logo.png',
    logo: '/assets/nodes/github-logo.png',
  },
  {
    id: 'atxtunerz', label: 'ATX Tunerz Society', handle: '@atx_tunerz_society',
    url: 'https://www.instagram.com/atx_tunerz_society/',
    urlDisplay: 'instagram.com/atx_tunerz_society',
    subtitle: 'Austin car culture collective',
    description: "the Austin, TX car club that im VP of.",
    avatar: '/assets/nodes/atx_tunerz_society-avatar.jpg',
    logo: '/assets/nodes/instagram-logo.png',
  },
  {
    id: 'github', label: 'GitHub', handle: 'nuroctane',
    url: 'https://github.com/nuroctane',
    urlDisplay: 'github.com/nuroctane',
    subtitle: 'Code & projects',
    description: 'i might have committment issues',
    avatar: '/assets/nodes/nuroctane-github-avatar.png',
    logo: '/assets/nodes/github-logo.png',
  },
  {
    id: 'weatherguru', label: 'WeatherGuru', handle: 'project',
    url: '#',
    urlDisplay: 'weatherguru.app',
    subtitle: 'Hyperlocal weather intelligence',
    description: "i wanted to make a framework for prediction markets. not a bot. infrastructure. may get inspired to work on this again, or i'll just scrap it and throw the code i have up on Github. who knows.",
    avatar: '',
    logo: '',
  },
  {
    id: 'sis', label: 'Sovereign Intelligence Systems', handle: 'SIS',
    url: '#',
    urlDisplay: 'sovereignintelligence.systems',
    subtitle: 'Infrastructure for autonomous minds',
    description: "local ai infrastructure project that probably has no moat but it's fun.",
    avatar: '',
    logo: '',
  },
  {
    id: 'astrosleep', label: 'AstroSleep', handle: 'project',
    url: 'https://github.com/nuroctane/ASTROSleep',
    urlDisplay: 'github.com/nuroctane/ASTROSleep',
    subtitle: 'Sleep cycle optimization',
    description: "fun little astrology app i'm committed to finishing.",
    avatar: '/assets/nodes/astrosleep-logo.png',
    logo: '/assets/nodes/github-logo.png',
  },
  {
    id: 'geoskin', label: 'CS Skin Creations', handle: 'project',
    url: '#',
    urlDisplay: 'geoskin.design',
    subtitle: 'Parametric weapon skin design',
    description: "self-explanatory name, but i have some cool ideas and will put steam workshop & reddit links on this card as they get created and iterated upon.",
    avatar: '',
    logo: '',
  },
  {
    id: 'miyamaker', label: 'Miyamaker', handle: 'miyamaker',
    url: 'https://miyamaker.com',
    urlDisplay: 'miyamaker.com',
    subtitle: 'Creative tools for builders',
    description: "this was a niche crypto/NFT project i did with some buddies to help distribute liquidity better for derivative NFT collections to their main collections and holders respectively. it had no moat i guess.",
    avatar: '/assets/nodes/miyamaker-avatar.png',
    logo: '',
  },
  {
    id: 'webutils', label: 'Utilities for The Wired', handle: 'nuroctane',
    url: 'https://raindrop.io/nuroctane/web-utilities-31127922',
    urlDisplay: 'raindrop.io/nuroctane',
    subtitle: 'we all love Lain',
    description: 'my favorite internet tools and tinkers',
    avatar: '/assets/nodes/nuroctane-tools-avatar.png',
    logo: '/assets/nodes/wrench.png',
  },
];

// Cards alternate sides and are spread by *even midpoints* along the scroll
// path so focus spacing stays uniform as cards are added/removed. Width expands
// symmetrically around each mid  -  never "start + width"  -  so a wider first card
// (edge envelope) cannot collapse into TikTok/X the way the old layout did.
const yPattern = [1.0, -0.4, 1.3, 0.2, -0.8, 0.9, 0.1, -0.5, 1.1, 0.5, -0.2, 0.8, 0.3, -0.6, 1.0, 0.4, -0.1];

// Focus band: after identity panel, before portal attractors (~0.955).
// Slightly wider than the old 0.075→0.875 start band so mid-to-mid gaps breathe.
const FIRST_MID = 0.090;
const LAST_MID  = 0.910;
const MID_STEP  = (LAST_MID - FIRST_MID) / Math.max(1, raw.length - 1);

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
// 27 nodes (nur-cli first creative; blackjack after snipocr).
const FLIP_X = new Set([
  'tiktok', 'substack', 'kick', 'goodreads', 'remilia',
  // nur-cli insert shifts creative parity  -  keep facing readable across the sea
  'nur-cli',
  'modkeys',
  'snipocr',
  // flip blackjack so it faces opposite snipocr at adjacent scroll slots
  'blackjack',
  // blackjack inserted after snipocr  -  nodes after it inverted vs pre-insert set
  'atxtunerz', 'weatherguru', 'sis', 'astrosleep', 'miyamaker', 'webutils',
  // github + geoskin were flipped pre-insert; inverted out after shift
]);

// Late-path nodes get a slightly wider envelope so the camera has more scroll
// distance to frame them (esp. mobile). Widths stay well under ~1.6× MID_STEP
// so neighboring peaks remain distinct; still centered on the even mid.
const WIDE_CARD: Record<string, number> = {
  'nur-cli':   0.054,
  modkeys:     0.054,
  snipocr:     0.052,
  blackjack:   0.052,
  atxtunerz:   0.054,
  github:      0.050,
  weatherguru: 0.056,
  sis:         0.054,
  astrosleep:  0.056,
  geoskin:     0.056,
  miyamaker:   0.058,
  // last card before portals  -  smooth entrance + room to pivot away
  webutils:    0.056,
};

const Z_OVERRIDE: Record<string, number> = {};

const SOCIAL_COUNT = raw.findIndex(n => n.id === 'nur-cli');

export const nodes: NodeData[] = raw.map((n, i) => {
  const isEdge = i === 0 || i === raw.length - 1;
  const mid = FIRST_MID + i * MID_STEP;
  const cardWidth = WIDE_CARD[n.id] ?? (isEdge ? EDGE_CARD_WIDTH : CARD_WIDTH);
  const scrollStart = mid - cardWidth / 2;
  const scrollEnd   = mid + cardWidth / 2;

  // Determine which side to place the card.
  // Default alternates per node; FLIP_X nodes get the opposite side.
  const defaultSide = i % 2 === 0 ? -1 : 1;
  const side = FLIP_X.has(n.id) ? -defaultSide : defaultSide;
  const x = side * (isEdge ? 1.4 : 2.0);

  const rawZ = zFromMid(scrollStart, scrollEnd);
  const z    = Z_OVERRIDE[n.id] ?? rawZ;

  return {
    ...n,
    scrollStart,
    scrollEnd,
    position: new THREE.Vector3(x, yPattern[i % yPattern.length], z),
    idleRotation: new THREE.Euler(
      (i % 3 - 1) * 0.15,
      x < 0 ? 0.55 : -0.55,
      (i % 2 === 0 ? 1 : -1) * 0.08,
    ),
  };
});

/** Midpoint of a node's scroll attractor window. */
export function nodeMid(n: Pick<NodeData, 'scrollStart' | 'scrollEnd'>): number {
  return (n.scrollStart + n.scrollEnd) / 2;
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
