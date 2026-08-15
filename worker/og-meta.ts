/**
 * Path-specific Open Graph HTML for social/chat crawlers.
 *
 * Ported from the Vercel edge middleware (middleware.js). Humans get the SPA;
 * Discord, Slack, iMessage, Twitter, LinkedIn, etc. receive a tiny HTML document
 * whose og:* tags match the shared route (/quotes, /resume, /modkeys, …) instead
 * of always showing the Digital Sea homepage card.
 *
 * The Vercel `config.matcher` array is replaced by assets.run_worker_first in
 * wrangler.jsonc — see the route list there.
 */

const SITE = "https://www.nuroctane.xyz";

/** Crawlers + unfurlers that read OG tags from raw HTML (not client JS). */
const BOT_UA_SUBSTRINGS = [
  "bot",
  "crawl",
  "spider",
  "slurp",
  "facebookexternalhit",
  "facebot",
  "embedly",
  "quora link preview",
  "whatsapp",
  "discord",
  "telegram",
  "twitterbot",
  "linkedinbot",
  "pinterest",
  "slackbot",
  "vkshare",
  "w3c_validator",
  "redditbot",
  "applebot",
  "bingpreview",
  "outbrain",
  "skypeuripreview",
  "tumblr",
  "bitlybot",
  "flipboard",
  "nuzzel",
  "qwantify",
  "bitrix link preview",
  "xing-contenttabreceiver",
  "chrome-lighthouse",
  "google page speed",
  "preview",
  "unfurl",
  "iframely",
  "opengraph",
  "meta-externalagent",
  "meta-externalfetcher",
];

const BOT_RE = new RegExp(BOT_UA_SUBSTRINGS.join("|"), "i");

export function isBot(userAgent: string): boolean {
  return BOT_RE.test(userAgent);
}

interface PageMeta {
  title: string;
  description: string;
  badge: string;
  path: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  noindex?: boolean;
}

const PAGES: Record<string, PageMeta> = {
  home: {
    title: "NUROCTANE — Digital Sea",
    description:
      "A 3D interactive scroll experience through nuroctane's digital network — socials, creative projects, writings, and more.",
    badge: "DIGITAL SEA",
    path: "/",
    image: `${SITE}/opengraph.jpg`,
    favicon: "/assets/nodes/site-logo.png",
  },
  quotes: {
    title: "Quotes — NUROCTANE",
    description:
      "A curated vault of thoughts, lines, and ideas that shape the work — faith, discipline, shadow, and the digital sea.",
    badge: "QUOTES",
    path: "/quotes",
    favicon: "/assets/nodes/nuroctane-animated-avatar.gif",
  },
  books: {
    title: "Books — NUROCTANE",
    description:
      "Reading shelves, notes, and community recommendations — a living library inside the digital sea.",
    badge: "BOOKS",
    path: "/books",
    favicon: "/assets/nodes/books-logo.png?v=115",
  },
  resume: {
    title: "Resume — David Davieson · NUROCTANE",
    description:
      "Agentic product engineer · customer success · B2B lending · technical support leadership. Projects, impact, and experience.",
    badge: "RESUME",
    path: "/resume",
    noindex: true,
    favicon: "/assets/nodes/resume-logo.svg",
  },
  modkeys: {
    title: "MODKEYS — Keyboard Configurator",
    description:
      "Design a mechanical keyboard in the browser — 3D preview, dual desktop/mobile shells, shareable builds, KLE/SVG/PDF export.",
    badge: "MODKEYS",
    path: "/modkeys",
    favicon: "/assets/nodes/modkeys-logo.png?v=115",
  },
  cli: {
    title: "NurCLI",
    description:
      "Token-efficient Rust coding agent with 62 provider routes, local-first memory, inline tool compression, usage telemetry, native vision, and a dense gold TUI.",
    badge: "NurCLI",
    path: "/cli",
    siteName: "NurCLI",
    favicon: "/assets/nodes/nur-cli-logo.png",
  },
  curriculum: {
    title: "World Models: A Daily Series",
    description:
      "90 days, one paper a day: from a car dreaming to the frontier. Model-based RL, JEPA, generative interactive environments, world foundation models, robots, and evaluation.",
    badge: "CURRICULUM",
    path: "/curriculum",
    image: `${SITE}/opengraph.jpg`,
    favicon: "/favicon.svg",
  },
  observatory: {
    title: "Observatory",
    description:
      "Astrology-rooted 3D web observatory — Swiss Ephemeris, all house/ayanamsa systems, aspects, Earth satellites, solar system, Cesium globe, and NASA mission hooks.",
    badge: "OBSERVATORY",
    path: "/observatory",
    siteName: "Observatory",
    favicon: "/assets/nodes/observatory-logo.png?v=115",
  },
  blog: {
    title: "Writings — NUROCTANE",
    description:
      "Passages from the digital sea — sovereignty, the veil, the machine, and the attractor that pulls from the future.",
    badge: "WRITINGS",
    path: "/blog",
    favicon: "/assets/nodes/blog-logo.png?v=115",
  },
  socials: {
    title: "Socials — NUROCTANE",
    description:
      "Swim the social constellation — Instagram, X, Discord, and the rest of the network.",
    badge: "SOCIALS",
    path: "/socials",
    favicon: "/assets/nodes/nuroctane-avatar.png",
  },
  projects: {
    title: "Projects — NUROCTANE",
    description:
      "Creative and technical projects — MODKEYS, SnipOCR, StarSleep, Blackjack, and more.",
    badge: "PROJECTS",
    path: "/projects",
    favicon: "/assets/nodes/github-logo.png",
  },
  fin: {
    title: "Fin — NUROCTANE",
    description:
      "End of the digital sea — identity, contact, and a place to book time with nuroctane.",
    badge: "FIN",
    path: "/fin",
    favicon: "/assets/nodes/venmo-logo.png",
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
    weatherguru: "/assets/nodes/weatherguru-logo.svg",
    sis: "/assets/nodes/civeta-dei-research.png?v=116",
    starsleep: "/assets/nodes/starsleep-logo.png",
    geoskin: "/assets/nodes/geoskin-logo.svg",
    miyamaker: "/assets/nodes/miyamaker-avatar.png",
    webutils: "/assets/nodes/wrench.png",
    observatory: "/assets/nodes/observatory-logo.png?v=115",
  },
};

interface ResolvedMeta extends PageMeta {
  image: string;
  url: string;
}

function resolvePage(pathname: string): ResolvedMeta {
  const clean = (pathname || "/").replace(/\/+$/, "") || "/";
  const segs = clean === "/" ? [] : clean.slice(1).toLowerCase().split("/");
  const top = segs[0] || "home";
  const key = top === "" ? "home" : top;
  const base = PAGES[key] || PAGES.home;
  const path = clean === "/" ? "/" : clean;
  const imageKey = key;
  let image =
    base.image ||
    `${SITE}/api/og?page=${encodeURIComponent(imageKey === "home" ? "home" : imageKey)}&title=${encodeURIComponent(base.badge)}`;
  // X is picky about dynamic OG cards — keep /cli image URL stable and short
  if (key === "cli") {
    image = `${SITE}/api/og?page=cli&v=2`;
  }
  return {
    ...base,
    path,
    image,
    favicon: (segs[1] && CHILD_FAVICONS[top]?.[segs[1]]) || base.favicon,
    // Deep links keep the section branding but pin canonical URL
    url: `${SITE}${path === "/" ? "/" : path}`,
  };
}

/* The version of this in middleware.js was a no-op — every replacement mapped a
 * character to itself, so the HTML entities had been lost somewhere along the
 * way. Because `url` below is built from the request path, that made the bot
 * document a reflected-XSS sink for anything sending a crawler User-Agent.
 * Restored to real escaping. */
function escapeHtml(s: unknown): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function botHtml(meta: ResolvedMeta): string {
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const url = escapeHtml(meta.url);
  const robots = meta.noindex ? "noindex, nofollow" : "index, follow";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${url}" />
  ${meta.favicon ? '<link rel="icon" href="' + SITE + escapeHtml(meta.favicon) + '" />' : ""}
  <meta property="og:site_name" content="${escapeHtml(meta.siteName || "NUROCTANE")}" />
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

/** Returns the crawler document for a path, or null if this path is never bot-served. */
export function botResponse(pathname: string): Response | null {
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/assets/") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return null;
  }

  const meta = resolvePage(pathname);
  return new Response(botHtml(meta), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, s-maxage=600, stale-while-revalidate=86400",
      "x-nuroctane-og": meta.path,
    },
  });
}
