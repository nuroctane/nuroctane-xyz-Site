/**
 * Edge middleware — path-specific Open Graph HTML for social/chat crawlers.
 *
 * Humans still get the SPA (index.html rewrite). Discord, Slack, iMessage,
 * Twitter, LinkedIn, etc. receive a tiny HTML document whose og:* tags match
 * the shared route (/quotes, /resume, /modkeys, …) instead of always showing
 * the Digital Sea homepage card.
 */

const SITE = 'https://www.nuroctane.xyz';

/** Crawlers + unfurlers that read OG tags from raw HTML (not client JS). */
const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|facebot|embedly|quora link preview|whatsapp|discord|telegram|twitterbot|linkedinbot|pinterest|slackbot|vkshare|w3c_validator|redditbot|applebot|bingpreview|outbrain|skypeuripreview|tumblr|bitlybot|flipboard|nuzzel|qwantify|bitrix link preview|xing-contenttabreceiver|chrome-lighthouse|google page speed|preview|unfurl|iframely|opengraph|meta-externalagent|meta-externalfetcher/i;

const PAGES = {
  home: {
    title: 'NUROCTANE — Digital Sea',
    description:
      "A 3D interactive scroll experience through nuroctane's digital network — socials, creative projects, writings, and more.",
    badge: 'DIGITAL SEA',
    path: '/',
    image: `${SITE}/opengraph.jpg`,
    favicon: '/assets/nodes/site-logo.png',
  },
  quotes: {
    title: 'Quotes — NUROCTANE',
    description:
      'A curated vault of thoughts, lines, and ideas that shape the work — faith, discipline, shadow, and the digital sea.',
    badge: 'QUOTES',
    path: '/quotes',
    favicon: '/assets/nodes/nuroctane-animated-avatar.gif',
  },
  books: {
    title: 'Books — NUROCTANE',
    description:
      'Reading shelves, notes, and community recommendations — a living library inside the digital sea.',
    badge: 'BOOKS',
    path: '/books',
    favicon: '/assets/nodes/goodreads-logo.png',
  },
  resume: {
    title: 'Resume — David Davieson · NUROCTANE',
    description:
      'Agentic product engineer · customer success · B2B lending · technical support leadership. Projects, impact, and experience.',
    badge: 'RESUME',
    path: '/resume',
    noindex: true,
    favicon: '/assets/nodes/resume-logo.svg',
  },
  modkeys: {
    title: 'MODKEYS — Keyboard Configurator',
    description:
      'Design a mechanical keyboard in the browser — 3D preview, dual desktop/mobile shells, shareable builds, KLE/SVG/PDF export.',
    badge: 'MODKEYS',
    path: '/modkeys',
    favicon: '/assets/nodes/modkeys-logo.png',
  },
  cli: {
    title: 'NurCLI',
    description:
      'Your personal coding agent. Rust harness, gold TUI, native vision, 60+ providers, plugin marketplace, 800+ skills. Install on macOS, Windows, Linux.',
    badge: 'NurCLI',
    path: '/cli',
    siteName: 'NurCLI',
    favicon: '/assets/nodes/nur-cli-logo.png',
  },
  observatory: {
    title: 'Observatory',
    description:
      'Astrology-rooted 3D web observatory — Swiss Ephemeris, all house/ayanamsa systems, aspects, Earth satellites, solar system, Cesium globe, and NASA mission hooks.',
    badge: 'OBSERVATORY',
    path: '/observatory',
    siteName: 'Observatory',
    favicon: '/assets/nodes/orbit-veil-logo.svg',
  },
  orbit: {
    title: 'Observatory',
    description:
      'Astrology-rooted 3D web observatory — Swiss Ephemeris, all house/ayanamsa systems, aspects, Earth satellites, solar system, Cesium globe, and NASA mission hooks.',
    badge: 'OBSERVATORY',
    path: '/observatory',
    siteName: 'Observatory',
    favicon: '/assets/nodes/orbit-veil-logo.svg',
  },
  'orbit-veil': {
    title: 'Observatory',
    description:
      'Astrology-rooted 3D web observatory — Swiss Ephemeris, all house/ayanamsa systems, aspects, Earth satellites, solar system, Cesium globe, and NASA mission hooks.',
    badge: 'OBSERVATORY',
    path: '/observatory',
    siteName: 'Observatory',
    favicon: '/assets/nodes/orbit-veil-logo.svg',
  },
  blog: {
    title: 'Writings — NUROCTANE',
    description:
      'Passages from the digital sea — sovereignty, the veil, the machine, and the attractor that pulls from the future.',
    badge: 'WRITINGS',
    path: '/blog',
    favicon: '/assets/nodes/substack-logo.png',
  },
  socials: {
    title: 'Socials — NUROCTANE',
    description:
      'Swim the social constellation — Instagram, X, Discord, and the rest of the network.',
    badge: 'SOCIALS',
    path: '/socials',
    favicon: '/assets/nodes/nuroctane-avatar.png',
  },
  projects: {
    title: 'Projects — NUROCTANE',
    description:
      'Creative and technical projects — MODKEYS, SnipOCR, ASTROSleep, Blackjack, and more.',
    badge: 'PROJECTS',
    path: '/projects',
    favicon: '/assets/nodes/github-logo.png',
  },
  fin: {
    title: 'Fin — NUROCTANE',
    description:
      'End of the digital sea — identity, contact, and a place to book time with nuroctane.',
    badge: 'FIN',
    path: '/fin',
    favicon: '/assets/nodes/venmo-logo.png',
  },
};

const CHILD_FAVICONS = {
  socials: {
    instagram: '/assets/nodes/instagram-logo.png',
    tiktok: '/assets/nodes/tiktok-logo.png',
    x: '/assets/nodes/x-logo.png',
    remilia: '/assets/nodes/remilia-quicklaunch-logo.png',
    substack: '/assets/nodes/substack-logo.png',
    soundcloud: '/assets/nodes/soundcloud-logo.png',
    twitch: '/assets/nodes/twitch-logo.png',
    youtube: '/assets/nodes/youtube-logo.png',
    kick: '/assets/nodes/kick-logo.png',
    anilist: '/assets/nodes/anilist-logo.png',
    letterboxd: '/assets/nodes/letterboxd-logo.png',
    goodreads: '/assets/nodes/goodreads-logo.png',
    steam: '/assets/nodes/steam-logo.png',
    discord: '/assets/nodes/discord-logo.png',
    reddit: '/assets/nodes/reddit-logo.png',
  },
  projects: {
    'nur-cli': '/assets/nodes/nur-cli-logo.png',
    modkeys: '/assets/nodes/modkeys-logo.png',
    snipocr: '/assets/nodes/snipocr-logo.png',
    blackjack: '/assets/nodes/blackjack-logo.png',
    atxtunerz: '/assets/nodes/atx_tunerz_society-avatar.jpg',
    github: '/assets/nodes/github-logo.png',
    weatherguru: '/assets/nodes/weatherguru-logo.svg',
    sis: '/assets/nodes/sis-logo.svg',
    astrosleep: '/assets/nodes/astrosleep-logo.png',
    geoskin: '/assets/nodes/geoskin-logo.svg',
    miyamaker: '/assets/nodes/miyamaker-avatar.png',
    webutils: '/assets/nodes/wrench.png',
    'orbit-veil': '/assets/nodes/orbit-veil-logo.svg',
    observatory: '/assets/nodes/orbit-veil-logo.svg',
  },
};

function resolvePage(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';
  const segs = clean === '/' ? [] : clean.slice(1).toLowerCase().split('/');
  const top = segs[0] || 'home';
  const key = top === '' ? 'home' : top;
  const base = PAGES[key] || PAGES.home;
  const path =
    key === 'orbit-veil' || key === 'orbit' ? '/observatory' : (clean === '/' ? '/' : clean);
  const imageKey =
    key === 'orbit-veil' || key === 'orbit' ? 'observatory' : key;
  let image =
    base.image ||
    `${SITE}/api/og?page=${encodeURIComponent(imageKey === 'home' ? 'home' : imageKey)}&title=${encodeURIComponent(base.badge)}`;
  // X is picky about dynamic OG cards — keep /cli image URL stable and short
  if (key === 'cli') {
    image = `${SITE}/api/og?page=cli&v=2`;
  }
  return {
    ...base,
    path,
    image,
    favicon: CHILD_FAVICONS[top]?.[segs[1]] || base.favicon,
    // Deep links keep section branding but pin canonical URL
    url: `${SITE}${path === '/' ? '/' : path}`,
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function botHtml(meta) {
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const url = escapeHtml(meta.url);
  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${url}" />
  ${meta.favicon ? '<link rel="icon" href="' + SITE + escapeHtml(meta.favicon) + '" />' : ''}
  <meta property="og:site_name" content="${escapeHtml(meta.siteName || 'NUROCTANE')}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>
  <p><a href="${url}">${title}</a></p>
  <p>${desc}</p>
</body>
</html>`;
}

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_RE.test(ua)) {
    // Humans → continue to static SPA / rewrites
    return;
  }

  const url = new URL(request.url);
  // Never intercept API, assets, or OG image itself
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/_vercel/') ||
    /\.[a-zA-Z0-9]+$/.test(url.pathname)
  ) {
    return;
  }

  const meta = resolvePage(url.pathname);
  return new Response(botHtml(meta), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=600, stale-while-revalidate=86400',
      'x-nuroctane-og': meta.path,
    },
  });
}

export const config = {
  matcher: [
    '/',
    '/home',
    '/sea',
    '/identity',
    '/quotes',
    '/books',
    '/resume',
    '/modkeys',
    '/cli',
    '/orbit',
    '/orbit-veil',
    '/observatory',
    '/blog',
    '/blog/:path*',
    '/socials',
    '/socials/:path*',
    '/projects',
    '/projects/:path*',
    '/fin',
  ],
};
