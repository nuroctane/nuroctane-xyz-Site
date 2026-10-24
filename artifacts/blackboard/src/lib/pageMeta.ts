/**
 * Canonical page metadata for document title, SEO, and Open Graph embeds.
 * Kept in sync with worker/og-meta.ts (bot unfurl HTML). Every page shares this
 * design's embed (../../embed.json): one image and site name, plus the home
 * title and description. Pages differ only in text and favicon.
 */
import embed from "../../embed.json";

export interface PageMeta {
  /** Browser tab / og:title */
  title: string;
  /** meta description / og:description */
  description: string;
  /** Absolute path for og:url (no origin) */
  path: string;
  /** noindex for crawlers that honor robots (resume) */
  noindex?: boolean;
  /** document favicon path or data URL override */
  favicon?: string;
  /**
   * Browser tab text. The Blackboard keeps one tab title, NUROCTANE, for every
   * page; a standalone product that brands its own tab says so here. Set in
   * the page's own effect instead, it lost to this one on in-app navigation
   * (parent effects run after children) and won on a direct load.
   */
  tabTitle?: string;
}

const DEFAULT: PageMeta = {
  title: embed.title,
  description: embed.description,
  path: "/",
};

const PAGES: Record<string, PageMeta> = {
  "": DEFAULT,
  home: DEFAULT,
  sea: DEFAULT,
  identity: DEFAULT,
  quotes: {
    title: "Quotes — NUROCTANE",
    description:
      "A curated vault of thoughts, lines, and ideas that shape the work — faith, discipline, shadow, and meaning.",
    path: "/quotes",
    favicon: "/assets/nodes/nuroctane-animated-avatar.gif",
  },
  books: {
    title: "Books — NUROCTANE",
    description:
      "Reading shelves, notes, and community recommendations — a living library.",
    path: "/books",
    favicon: "/assets/nodes/books-logo.png?v=115",
  },
  resume: {
    title: "Resume — David Davieson · NUROCTANE",
    description:
      "Software engineer · cybersecurity · agentic systems · customer success. Projects, impact, and experience.",
    path: "/resume",
    noindex: true,
    favicon: "/assets/nodes/resume-logo.svg",
  },
  modkeys: {
    title: "MODKEYS — Keyboard Configurator",
    description:
      "Design a mechanical keyboard in the browser — 3D preview, dual desktop/mobile shells, shareable builds, KLE/SVG/PDF export.",
    path: "/modkeys",
    favicon: "/assets/nodes/modkeys-logo.png?v=115",
    tabTitle: "MODKEYS",
  },
  cli: {
    title: "NurCLI",
    description:
      "Spend context like it matters. A Rust coding agent with 71 provider routes, a 142-system Jev catalog, semantic search first, local usage aggregation, Enclave security agents, and local-first memory.",
    path: "/cli",
    favicon: "/assets/nodes/nur-cli-logo.png",
  },
  curriculum: {
    title: "World Models: A Daily Series",
    description:
      "90 days, one paper a day: from Ha & Schmidhuber to the frontier. Model-based RL, JEPA, generative interactive environments, world foundation models, robots, and evaluation.",
    path: "/curriculum",
    favicon: "/assets/nodes/site-logo.png",
  },
  observatory: {
    title: "Observatory",
    description:
      "Astrology-rooted 3D web observatory — Swiss Ephemeris, all house/ayanamsa systems, aspects, Earth satellites, solar system, Cesium globe, and NASA mission hooks.",
    path: "/observatory",
    favicon: "/assets/nodes/observatory-logo.png?v=115",
  },
  github: {
    title: "GitHub — NUROCTANE",
    description:
      "A year of contributions, standing in glass — every day nuroctane shipped code, in 3D.",
    path: "/github",
    favicon: "/assets/nodes/github-logo.png",
  },
  stats: {
    title: "Stats — NUROCTANE",
    description:
      "Public site statistics: visitors over time, where they came from, and what they opened.",
    path: "/stats",
    favicon: "/assets/nodes/site-logo.png",
  },
  blog: {
    title: "Writings — NUROCTANE",
    description:
      "Passages on sovereignty, the veil, the machine, and the attractor that pulls from the future.",
    path: "/blog",
    favicon: "/assets/nodes/blog-logo.png?v=115",
  },
  socials: {
    title: "Socials — NUROCTANE",
    description:
      "Swim the social constellation — Instagram, X, Discord, and the rest of the network.",
    path: "/socials",
    favicon: "/assets/nodes/nuroctane-avatar.png",
  },
  projects: {
    title: "Projects — NUROCTANE",
    description:
      "Creative and technical projects — MODKEYS, SnipOCR, StarSleep, Blackjack, and more.",
    path: "/projects",
    favicon: "/assets/nodes/github-logo.png",
  },
  fin: {
    title: "Fin — NUROCTANE",
    description:
      "End of the digital sea — identity, contact, and a place to book time with nuroctane.",
    path: "/fin",
    favicon: "/assets/nodes/site-logo.png",
  },
};

const CHILD_FAVICONS: Record<string, Record<string, string>> = {
  socials: {
    instagram: "/assets/nodes/instagram-logo.png",
    tiktok: "/assets/nodes/tiktok-logo.png",
    x: "/assets/nodes/x-logo.png",
    remilia: "/assets/nodes/remilia-quicklaunch-logo.png",
    substack: "/assets/nodes/substack-logo.png",
    soundcloud: "/assets/nodes/soundcloud-logo.png",
    twitch: "/assets/nodes/twitch-logo.png",
    youtube: "/assets/nodes/youtube-logo.png",
    kick: "/assets/nodes/kick-logo.png",
    anilist: "/assets/nodes/anilist-logo.png",
    letterboxd: "/assets/nodes/letterboxd-logo.png",
    goodreads: "/assets/nodes/goodreads-logo.png",
    steam: "/assets/nodes/steam-logo.png",
    discord: "/assets/nodes/discord-logo.png",
    reddit: "/assets/nodes/reddit-logo.png",
    glasp: "/assets/nodes/glasp-logo.png",
  },
  projects: {
    "nur-cli": "/assets/nodes/nur-cli-logo.png",
    modkeys: "/assets/nodes/modkeys-logo.png?v=115",
    snipocr: "/assets/nodes/snipocr-logo.png?v=115",
    blackjack: "/assets/nodes/blackjack-logo.png?v=115",
    atxtunerz: "/assets/nodes/atx_tunerz_society-avatar.jpg",
    github: "/assets/nodes/github-logo.png",
    hoodstock: "/assets/nodes/hoodstock-logo.png",
    sis: "/assets/nodes/civeta-dei-research.png?v=116",
    starsleep: "/assets/nodes/starsleep-logo.png",
    geoskin: "/assets/nodes/geoskin-logo.svg",
    miyamaker: "/assets/nodes/miyamaker-avatar.png",
    webutils: "/assets/nodes/wrench.png",
    observatory: "/assets/nodes/observatory-logo.png?v=115",
  },
};

/** Map a pathname (e.g. /quotes or /blog/sovereignty) to page meta. */
export function resolvePageMeta(pathname: string): PageMeta {
  const clean = (pathname || "/").split("?")[0]?.split("#")[0] ?? "/";
  const normalized = clean.replace(/\/+$/, "") || "/";
  const segs =
    normalized === "/"
      ? []
      : normalized.replace(/^\//, "").toLowerCase().split("/");
  const top = segs[0] ?? "";

  if (!top) return { ...DEFAULT };

  const base = PAGES[top];
  if (!base) return { ...DEFAULT, path: normalized };

  // Nested deep links keep the section meta but pin og:url to the concrete path
  if (segs.length > 1) {
    const childFavicon = CHILD_FAVICONS[top]?.[segs[1] ?? ""];
    return {
      ...base,
      path: normalized.startsWith("/") ? normalized : `/${normalized}`,
      favicon: childFavicon ?? base.favicon,
    };
  }
  return { ...base };
}

export function absoluteUrl(
  path: string,
  origin = "https://www.nuroctane.xyz",
): string {
  const base = origin.replace(/\/+$/, "");
  if (!path || path === "/") return `${base}/`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Absolute OG image URL: this design's embed, the same for every page. */
export function ogImageUrl(origin = "https://www.nuroctane.xyz"): string {
  return absoluteUrl(embed.image, origin);
}

/** Apply meta tags in the document head (client SPA navigations). */
export function applyDocumentMeta(meta: PageMeta, origin?: string): void {
  if (typeof document === "undefined") return;
  const originSafe =
    origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://www.nuroctane.xyz");

  document.title = meta.tabTitle ?? "NUROCTANE";

  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      if (selector.includes("property=")) {
        const prop = selector.match(/property="([^"]+)"/)?.[1];
        if (prop) el.setAttribute("property", prop);
      } else {
        const name = selector.match(/name="([^"]+)"/)?.[1];
        if (name) el.setAttribute("name", name);
      }
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  setMeta('meta[name="description"]', "content", meta.description);
  setMeta('meta[property="og:title"]', "content", meta.title);
  setMeta('meta[property="og:description"]', "content", meta.description);
  setMeta('meta[property="og:type"]', "content", "website");
  setMeta(
    'meta[property="og:url"]',
    "content",
    absoluteUrl(meta.path, originSafe),
  );
  setMeta('meta[property="og:image"]', "content", ogImageUrl(originSafe));
  setMeta('meta[property="og:image:width"]', "content", String(embed.width));
  setMeta('meta[property="og:image:height"]', "content", String(embed.height));
  setMeta('meta[property="og:site_name"]', "content", embed.siteName);

  // Always pin the active route's mark so SPA navigation never leaks the
  // previous page's favicon into the next page.
  const faviconHref = meta.favicon || "/assets/nodes/site-logo.png";
  let icon = document.querySelector(
    'link[rel="icon"]',
  ) as HTMLLinkElement | null;
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    document.head.appendChild(icon);
  }
  icon.type = faviconHref.startsWith("data:image/")
    ? faviconHref.slice(5, faviconHref.indexOf(","))
    : faviconHref.endsWith(".svg")
      ? "image/svg+xml"
      : faviconHref.match(/\.gif$/i)
        ? "image/gif"
        : faviconHref.match(/\.jpe?g$/i)
          ? "image/jpeg"
          : "image/png";
  // Bust sticky browser cache when swapping brand icons mid-session
  icon.href =
    faviconHref + (faviconHref.includes("?") ? "&" : "?") + `v=${Date.now()}`;
  setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
  setMeta('meta[name="twitter:title"]', "content", meta.title);
  setMeta('meta[name="twitter:description"]', "content", meta.description);
  setMeta(
    'meta[name="twitter:image"]',
    "content",
    ogImageUrl(originSafe),
  );

  let robots = document.querySelector(
    'meta[name="robots"]',
  ) as HTMLMetaElement | null;
  if (meta.noindex) {
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
  } else if (robots && robots.content.includes("noindex")) {
    // Leaving a noindex from resume when navigating away
    robots.content = "index, follow";
  }
}
