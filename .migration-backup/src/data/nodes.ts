import * as THREE from 'three';

export interface NodeData {
  id: string;
  label: string;
  handle: string;
  url: string;
  urlDisplay: string;
  subtitle: string;
  avatar: string;
  logo: string;
  scrollStart: number;
  scrollEnd: number;
  position: THREE.Vector3;
  idleRotation: THREE.Euler;
}

// path spans z=25 (t=0) to z=-182 (t=1), range=207 units
const zFromMid = (s: number, e: number) => 25 - ((s + e) / 2) * 207;

// Shared avatar for all social nodes — all social profiles, one face
const AVATAR = '/assets/nodes/nuroctane-avatar.png';

const raw: Omit<NodeData, 'position' | 'idleRotation'>[] = [
  // ─── SOCIAL (11) ──────────────────────────────────────────────────────────
  {
    id: 'instagram', label: 'Instagram', handle: '@nuroctane',
    url: 'https://www.instagram.com/nuroctane/',
    urlDisplay: 'instagram.com/nuroctane',
    subtitle: 'Photos & Reels',
    avatar: AVATAR,
    logo: '/assets/nodes/instagram-logo.png',
    scrollStart: 0.035, scrollEnd: 0.075,
  },
  {
    id: 'tiktok', label: 'TikTok', handle: '@nuroctane',
    url: 'https://www.tiktok.com/@nuroctane',
    urlDisplay: 'tiktok.com/@nuroctane',
    subtitle: 'Short form video',
    avatar: AVATAR,
    logo: '/assets/nodes/tiktok-logo.png',
    scrollStart: 0.089, scrollEnd: 0.129,
  },
  {
    id: 'x', label: 'X', handle: '@nuroctane',
    url: 'https://x.com/nuroctane',
    urlDisplay: 'x.com/nuroctane',
    subtitle: 'Thoughts & threads',
    avatar: AVATAR,
    logo: '/assets/nodes/x-logo.png',
    scrollStart: 0.144, scrollEnd: 0.184,
  },
  {
    id: 'substack', label: 'Substack', handle: 'Civeta Dei',
    url: 'https://substack.com/@nuroctane',
    urlDisplay: 'substack.com/@nuroctane',
    subtitle: '"there is" — 17 subscribers',
    avatar: AVATAR,
    logo: '/assets/nodes/substack-logo.png',
    scrollStart: 0.198, scrollEnd: 0.238,
  },
  {
    id: 'soundcloud', label: 'SoundCloud', handle: 'nuroctane',
    url: 'https://soundcloud.com/nuroctane',
    urlDisplay: 'soundcloud.com/nuroctane',
    subtitle: 'i like making moody shit — 23 followers',
    avatar: AVATAR,
    logo: '/assets/nodes/soundcloud-logo.png',
    scrollStart: 0.253, scrollEnd: 0.293,
  },
  {
    id: 'twitch', label: 'Twitch', handle: 'nuroctane',
    url: 'https://www.twitch.tv/nuroctane',
    urlDisplay: 'twitch.tv/nuroctane',
    subtitle: 'ars motus',
    avatar: AVATAR,
    logo: '/assets/nodes/twitch-logo.png',
    scrollStart: 0.307, scrollEnd: 0.347,
  },
  {
    id: 'youtube', label: 'YouTube', handle: '@nuroctane',
    url: 'https://www.youtube.com/@nuroctane',
    urlDisplay: 'youtube.com/@nuroctane',
    subtitle: 'nur! — ars motus',
    avatar: AVATAR,
    logo: '/assets/nodes/youtube-logo.png',
    scrollStart: 0.361, scrollEnd: 0.401,
  },
  {
    id: 'kick', label: 'Kick', handle: 'nuroctane',
    url: 'https://kick.com/nuroctane',
    urlDisplay: 'kick.com/nuroctane',
    subtitle: '7 followers',
    avatar: AVATAR,
    logo: '/assets/nodes/kick-logo.png',
    scrollStart: 0.416, scrollEnd: 0.456,
  },
  {
    id: 'anilist', label: 'AniList', handle: 'nuroctane',
    url: 'https://anilist.co/user/nuroctane/',
    urlDisplay: 'anilist.co/user/nuroctane',
    subtitle: 'Anime & manga tracker',
    avatar: AVATAR,
    logo: '/assets/nodes/anilist-logo.png',
    scrollStart: 0.470, scrollEnd: 0.510,
  },
  {
    id: 'steam', label: 'Steam', handle: 'nuroctane',
    url: 'https://steamcommunity.com/id/nuroctane',
    urlDisplay: 'steamcommunity.com/id/nuroctane',
    subtitle: 'Austin, TX · Level 9 · 473 hrs on CS2',
    avatar: AVATAR,
    logo: '/assets/nodes/steam-logo.png',
    scrollStart: 0.525, scrollEnd: 0.565,
  },
  {
    id: 'discord', label: 'Discord', handle: 'nuroctane',
    url: 'https://discord.com/users/139458577440964608',
    urlDisplay: 'discord.com/users/nuroctane',
    subtitle: 'nuroctane',
    avatar: AVATAR,
    logo: '/assets/nodes/discord-logo.png',
    scrollStart: 0.579, scrollEnd: 0.619,
  },

  // ─── CREATIVE PROJECTS (6) ─────────────────────────────────────────────────
  {
    id: 'weatherguru', label: 'WeatherGuru', handle: 'project',
    url: '#',
    urlDisplay: 'weatherguru.app',
    subtitle: 'Hyperlocal weather intelligence',
    avatar: '',
    logo: '',
    scrollStart: 0.634, scrollEnd: 0.674,
  },
  {
    id: 'sis', label: 'Sovereign Intelligence Systems', handle: 'SIS',
    url: '#',
    urlDisplay: 'sovereignintelligence.systems',
    subtitle: 'Infrastructure for autonomous minds',
    avatar: '',
    logo: '',
    scrollStart: 0.688, scrollEnd: 0.728,
  },
  {
    id: 'atxtunerz', label: 'ATX Tunerz Society', handle: '@atx_tunerz_society',
    url: 'https://www.instagram.com/atx_tunerz_society/',
    urlDisplay: 'instagram.com/atx_tunerz_society',
    subtitle: 'Austin car culture collective',
    avatar: '/assets/nodes/atx_tunerz_society-avatar.jpg',
    logo: '/assets/nodes/instagram-logo.png',
    scrollStart: 0.742, scrollEnd: 0.782,
  },
  {
    id: 'astrosleep', label: 'AstroSleep', handle: 'project',
    url: '#',
    urlDisplay: 'astrosleep.app',
    subtitle: 'Sleep cycle optimization',
    avatar: '',
    logo: '',
    scrollStart: 0.797, scrollEnd: 0.837,
  },
  {
    id: 'geoskin', label: 'Geometric CS2 Skin Project', handle: 'project',
    url: '#',
    urlDisplay: 'geoskin.design',
    subtitle: 'Parametric weapon skin design',
    avatar: '',
    logo: '',
    scrollStart: 0.851, scrollEnd: 0.891,
  },
  {
    id: 'miyamaker', label: 'Miyamaker', handle: 'miyamaker',
    url: 'https://miyamaker.com',
    urlDisplay: 'miyamaker.com',
    subtitle: 'Creative tools for builders',
    avatar: '/assets/nodes/miyamaker-avatar.png',
    logo: '',
    scrollStart: 0.906, scrollEnd: 0.946,
  },
];

const xPositions = [-3.8, 3.8, -3.8, 3.8, -3.8, 3.8, -3.8, 3.8, -3.8, 3.8, -3.8, 3.8, -3.8, 3.8, -3.8, 3.8, -3.8];
const yPositions = [1.0, -0.4, 1.3, 0.2, -0.8, 0.9, 0.1, -0.5, 1.1, 0.5, -0.2, 0.8, 0.3, -0.6, 1.0, 0.4, -0.1];

export const nodes: NodeData[] = raw.map((n, i) => ({
  ...n,
  position: new THREE.Vector3(xPositions[i], yPositions[i], zFromMid(n.scrollStart, n.scrollEnd)),
  idleRotation: new THREE.Euler(
    (i % 3 - 1) * 0.15,
    xPositions[i] < 0 ? 0.55 : -0.55,
    (i % 2 === 0 ? 1 : -1) * 0.08
  ),
}));
