import * as THREE from 'three';

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

// path spans z=25 (t=0) to z=-182 (t=1), range=207 units
const zFromMid = (s: number, e: number) => 25 - ((s + e) / 2) * 207;

const AVATAR = '/assets/nodes/nuroctane-avatar.png';

const raw: Omit<NodeData, 'position' | 'idleRotation' | 'scrollStart' | 'scrollEnd'>[] = [
  // ─── SOCIAL (11) ──────────────────────────────────────────────────────────
  {
    id: 'instagram', label: 'Instagram', handle: '@nuroctane',
    url: 'https://www.instagram.com/nuroctane/',
    urlDisplay: 'instagram.com/nuroctane',
    subtitle: 'Photos & Reels',
    description: 'mostly just automotive, irls and life stuff.',
    avatar: AVATAR,
    logo: '/assets/nodes/instagram-logo.png',
  },
  {
    id: 'tiktok', label: 'TikTok', handle: '@nuroctane',
    url: 'https://www.tiktok.com/@nuroctane',
    urlDisplay: 'tiktok.com/@nuroctane',
    subtitle: 'Short form video',
    description: "i really don't post here. i might one day. i tried at one point. idk.",
    avatar: AVATAR,
    logo: '/assets/nodes/tiktok-logo.png',
  },
  {
    id: 'x', label: 'X', handle: '@nuroctane',
    url: 'https://x.com/nuroctane',
    urlDisplay: 'x.com/nuroctane',
    subtitle: 'Thoughts & threads',
    description: 'rants and musings.',
    avatar: AVATAR,
    logo: '/assets/nodes/x-logo.png',
  },
  {
    id: 'substack', label: 'Substack', handle: 'Civeta Dei',
    url: 'https://substack.com/@nuroctane',
    urlDisplay: 'substack.com/@nuroctane',
    subtitle: '"there is" — 17 subscribers',
    description: 'rants and musings extended.',
    avatar: AVATAR,
    logo: '/assets/nodes/substack-logo.png',
  },
  {
    id: 'soundcloud', label: 'SoundCloud', handle: 'nuroctane',
    url: 'https://soundcloud.com/nuroctane',
    urlDisplay: 'soundcloud.com/nuroctane',
    subtitle: 'i like making moody shit — 23 followers',
    description: "i love making music, just don't do it enough.",
    avatar: AVATAR,
    logo: '/assets/nodes/soundcloud-logo.png',
  },
  {
    id: 'twitch', label: 'Twitch', handle: 'nuroctane',
    url: 'https://www.twitch.tv/nuroctane',
    urlDisplay: 'twitch.tv/nuroctane',
    subtitle: 'ars motus',
    description: 'i stream sometimes.',
    avatar: AVATAR,
    logo: '/assets/nodes/twitch-logo.png',
  },
  {
    id: 'youtube', label: 'YouTube', handle: '@nuroctane',
    url: 'https://www.youtube.com/@nuroctane',
    urlDisplay: 'youtube.com/@nuroctane',
    subtitle: 'nur! — ars motus',
    description: 'i upload sometimes, commentary mostly.',
    avatar: AVATAR,
    logo: '/assets/nodes/youtube-logo.png',
  },
  {
    id: 'kick', label: 'Kick', handle: 'nuroctane',
    url: 'https://kick.com/nuroctane',
    urlDisplay: 'kick.com/nuroctane',
    subtitle: '7 followers',
    description: 'i stream sometimes part 2.',
    avatar: AVATAR,
    logo: '/assets/nodes/kick-logo.png',
  },
  {
    id: 'anilist', label: 'AniList', handle: 'nuroctane',
    url: 'https://anilist.co/user/nuroctane/',
    urlDisplay: 'anilist.co/user/nuroctane',
    subtitle: 'Anime & manga tracker',
    description: "i update this whenever i'm actively watching an anime.",
    avatar: AVATAR,
    logo: '/assets/nodes/anilist-logo.png',
  },
  {
    id: 'steam', label: 'Steam', handle: 'nuroctane',
    url: 'https://steamcommunity.com/id/nuroctane',
    urlDisplay: 'steamcommunity.com/id/nuroctane',
    subtitle: 'Austin, TX · Level 9 · 473 hrs on CS2',
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

  // ─── CREATIVE PROJECTS (8) — ATX Tunerz first ──────────────────────────────
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
    url: '#',
    urlDisplay: 'astrosleep.app',
    subtitle: 'Sleep cycle optimization',
    description: "fun little astrology app i'm committed to finishing.",
    avatar: '',
    logo: '',
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
    subtitle: 'Curated on Raindrop',
    description: 'my favorite internet tools and tinkers',
    avatar: '/assets/nodes/nuroctane-tools-avatar.png',
    logo: '/assets/nodes/wrench.png',
  },
];

// Cards alternate sides and are spread evenly along the scroll path so the
// layout self-adjusts as cards are added/removed.
const yPattern = [1.0, -0.4, 1.3, 0.2, -0.8, 0.9, 0.1, -0.5, 1.1, 0.5, -0.2, 0.8, 0.3, -0.6, 1.0, 0.4, -0.1];
const FIRST_START = 0.075;
const CARD_WIDTH = 0.04;
// Edge cards get a wider scroll envelope so they approach/recede more gently.
const EDGE_CARD_WIDTH = 0.065;
const LAST_START = 0.91;
const STEP = (LAST_START - FIRST_START) / Math.max(1, raw.length - 1);

export const nodes: NodeData[] = raw.map((n, i) => {
  const isEdge = i === 0 || i === raw.length - 1;
  const scrollStart = FIRST_START + i * STEP;
  const cardWidth = isEdge ? EDGE_CARD_WIDTH : CARD_WIDTH;
  const scrollEnd = scrollStart + cardWidth;
  // Edge nodes sit closer to center-x: at path extremes the camera is very
  // close in z, so a full ±2.0 offset creates a steep angle that clips the card.
  const x = i % 2 === 0 ? (isEdge ? -1.4 : -2.0) : (isEdge ? 1.4 : 2.0);
  return {
    ...n,
    scrollStart,
    scrollEnd,
    position: new THREE.Vector3(x, yPattern[i % yPattern.length], zFromMid(scrollStart, scrollEnd)),
    idleRotation: new THREE.Euler(
      (i % 3 - 1) * 0.15,
      x < 0 ? 0.55 : -0.55,
      (i % 2 === 0 ? 1 : -1) * 0.08,
    ),
  };
});
