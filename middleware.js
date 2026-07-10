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
  },
  quotes: {
    title: 'Quotes — NUROCTANE',
    description:
      'A curated vault of thoughts, lines, and ideas that shape the work — faith, discipline, shadow, and the digital sea.',
    badge: 'QUOTES',
    path: '/quotes',
  },
  books: {
    title: 'Books — NUROCTANE',
    description:
      'Reading shelves, notes, and community recommendations — a living library inside the digital sea.',
    badge: 'BOOKS',
    path: '/books',
  },
  resume: {
    title: 'Resume — David Davieson · NUROCTANE',
    description:
      'Agentic product engineer · customer success · B2B lending · technical support leadership. Projects, impact, and experience.',
    badge: 'RESUME',
    path: '/resume',
    noindex: true,
  },
  modkeys: {
    title: 'MODKEYS — Keyboard Configurator',
    description:
      'Design a mechanical keyboard in the browser — 3D preview, dual desktop/mobile shells, shareable builds, KLE/SVG/PDF export.',
    badge: 'MODKEYS',
    path: '/modkeys',
  },
  blog: {
    title: 'Writings — NUROCTANE',
    description:
      'Passages from the digital sea — sovereignty, the veil, the machine, and the attractor that pulls from the future.',
    badge: 'WRITINGS',
    path: '/blog',
  },
  socials: {
    title: 'Socials — NUROCTANE',
    description:
      'Swim the social constellation — Instagram, X, Discord, and the rest of the network.',
    badge: 'SOCIALS',
    path: '/socials',
  },
  projects: {
    title: 'Projects — NUROCTANE',
    description:
      'Creative and technical projects — MODKEYS, SnipOCR, ASTROSleep, Blackjack, and more.',
    badge: 'PROJECTS',
    path: '/projects',
  },
  fin: {
    title: 'Fin — NUROCTANE',
    description:
      'End of the digital sea — identity, contact, and a place to book time with nuroctane.',
    badge: 'FIN',
    path: '/fin',
  },
};

function resolvePage(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';
  const segs = clean === '/' ? [] : clean.slice(1).toLowerCase().split('/');
  const top = segs[0] || 'home';
  const key = top === '' ? 'home' : top;
  const base = PAGES[key] || PAGES.home;
  const path = clean === '/' ? '/' : clean;
  const image =
    base.image ||
    `${SITE}/api/og?page=${encodeURIComponent(key === 'home' ? 'home' : key)}&title=${encodeURIComponent(base.badge)}`;
  return {
    ...base,
    path,
    image,
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
  <meta property="og:site_name" content="NUROCTANE" />
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
    '/quotes',
    '/books',
    '/resume',
    '/modkeys',
    '/blog',
    '/blog/:path*',
    '/socials',
    '/socials/:path*',
    '/projects',
    '/projects/:path*',
    '/fin',
  ],
};
