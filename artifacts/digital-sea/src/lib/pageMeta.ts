/**
 * Canonical page metadata for document title, SEO, and Open Graph embeds.
 * Kept in sync with middleware.js (bot unfurl HTML) + /api/og image labels.
 */

export interface PageMeta {
  /** Browser tab / og:title */
  title: string;
  /** meta description / og:description */
  description: string;
  /** Short label burned into the OG card */
  badge: string;
  /** Absolute path for og:url (no origin) */
  path: string;
  /** Optional absolute-or-root image override; default is /api/og?page=… */
  imagePath?: string;
  /** noindex for crawlers that honor robots (resume) */
  noindex?: boolean;
  /** og:site_name override (default NUROCTANE) */
  siteName?: string;
  /** document favicon path or data URL override */
  favicon?: string;
}

const DEFAULT: PageMeta = {
  title: 'NUROCTANE — Digital Sea',
  description:
    'A 3D interactive scroll experience through nuroctane’s digital network — socials, creative projects, writings, and more.',
  badge: 'DIGITAL SEA',
  path: '/',
  imagePath: '/opengraph.jpg',
};

const PAGES: Record<string, PageMeta> = {
  '': DEFAULT,
  home: DEFAULT,
  sea: DEFAULT,
  identity: DEFAULT,
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
    imagePath: '/api/og?page=cli&v=2',
  },
  observatory: {
    title: 'Observatory',
    description:
      'Astrology-rooted 3D web observatory — Swiss Ephemeris, all house/ayanamsa systems, aspects, Earth satellites, solar system, Cesium globe, and NASA mission hooks.',
    badge: 'OBSERVATORY',
    path: '/observatory',
    siteName: 'Observatory',
    favicon: '/assets/nodes/orbit-veil-logo.svg',
    imagePath: '/api/og?page=observatory&v=2',
  },
  // Legacy keys redirect metadata to /observatory
  orbit: {
    title: 'Observatory',
    description:
      'Astrology-rooted 3D web observatory — Swiss Ephemeris, all house/ayanamsa systems, aspects, Earth satellites, solar system, Cesium globe, and NASA mission hooks.',
    badge: 'OBSERVATORY',
    path: '/observatory',
    siteName: 'Observatory',
    favicon: '/assets/nodes/orbit-veil-logo.svg',
    imagePath: '/api/og?page=observatory&v=2',
  },
  'orbit-veil': {
    title: 'Observatory',
    description:
      'Astrology-rooted 3D web observatory — Swiss Ephemeris, all house/ayanamsa systems, aspects, Earth satellites, solar system, Cesium globe, and NASA mission hooks.',
    badge: 'OBSERVATORY',
    path: '/observatory',
    siteName: 'Observatory',
    favicon: '/assets/nodes/orbit-veil-logo.svg',
    imagePath: '/api/og?page=observatory&v=2',
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

const CHILD_FAVICONS: Record<string, Record<string, string>> = {
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

/** Map a pathname (e.g. /quotes or /blog/sovereignty) to page meta. */
export function resolvePageMeta(pathname: string): PageMeta {
  const clean = (pathname || '/').split('?')[0]?.split('#')[0] ?? '/';
  const normalized = clean.replace(/\/+$/, '') || '/';
  const segs = normalized === '/' ? [] : normalized.replace(/^\//, '').toLowerCase().split('/');
  const top = segs[0] ?? '';

  if (!top) return { ...DEFAULT };

  const base = PAGES[top];
  if (!base) return { ...DEFAULT, path: normalized };

  // Nested deep links keep the section meta but pin og:url to the concrete path
  if (segs.length > 1) {
    const childFavicon = CHILD_FAVICONS[top]?.[segs[1] ?? ''];
    return {
      ...base,
      path: normalized.startsWith('/') ? normalized : `/${normalized}`,
      favicon: childFavicon ?? base.favicon,
    };
  }
  return { ...base };
}

export function absoluteUrl(path: string, origin = 'https://www.nuroctane.xyz'): string {
  const base = origin.replace(/\/+$/, '');
  if (!path || path === '/') return `${base}/`;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Absolute OG image URL for a page. Prefer dynamic card; home keeps classic opengraph.jpg. */
export function ogImageUrl(meta: PageMeta, origin = 'https://www.nuroctane.xyz'): string {
  if (meta.imagePath?.startsWith('http')) return meta.imagePath;
  if (meta.imagePath) return absoluteUrl(meta.imagePath, origin);
  const pageKey =
    meta.path === '/' ? 'home' : meta.path.replace(/^\//, '').split('/')[0] || 'home';
  return absoluteUrl(
    `/api/og?page=${encodeURIComponent(pageKey)}&title=${encodeURIComponent(meta.badge)}`,
    origin,
  );
}

/** Apply meta tags in the document head (client SPA navigations). */
export function applyDocumentMeta(meta: PageMeta, origin?: string): void {
  if (typeof document === 'undefined') return;
  const originSafe =
    origin ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz');

  document.title = meta.title;

  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      if (selector.includes('property=')) {
        const prop = selector.match(/property="([^"]+)"/)?.[1];
        if (prop) el.setAttribute('property', prop);
      } else {
        const name = selector.match(/name="([^"]+)"/)?.[1];
        if (name) el.setAttribute('name', name);
      }
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  setMeta('meta[name="description"]', 'content', meta.description);
  setMeta('meta[property="og:title"]', 'content', meta.title);
  setMeta('meta[property="og:description"]', 'content', meta.description);
  setMeta('meta[property="og:type"]', 'content', 'website');
  setMeta('meta[property="og:url"]', 'content', absoluteUrl(meta.path, originSafe));
  setMeta('meta[property="og:image"]', 'content', ogImageUrl(meta, originSafe));
  setMeta('meta[property="og:site_name"]', 'content', meta.siteName || 'NUROCTANE');

  // Always pin the active route's mark so SPA navigation never leaks the
  // previous page's favicon into the next page.
  const faviconHref = meta.favicon || '/assets/nodes/site-logo.png';
  let icon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (!icon) {
    icon = document.createElement('link');
    icon.rel = 'icon';
    document.head.appendChild(icon);
  }
  icon.type = faviconHref.startsWith('data:image/')
    ? faviconHref.slice(5, faviconHref.indexOf(','))
    : faviconHref.endsWith('.svg')
      ? 'image/svg+xml'
      : faviconHref.match(/\.gif$/i)
        ? 'image/gif'
        : faviconHref.match(/\.jpe?g$/i)
          ? 'image/jpeg'
          : 'image/png';
  // Bust sticky browser cache when swapping brand icons mid-session
  icon.href = faviconHref;
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', meta.title);
  setMeta('meta[name="twitter:description"]', 'content', meta.description);
  setMeta('meta[name="twitter:image"]', 'content', ogImageUrl(meta, originSafe));

  let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (meta.noindex) {
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
  } else if (robots && robots.content.includes('noindex')) {
    // Leaving a noindex from resume when navigating away
    robots.content = 'index, follow';
  }
}
