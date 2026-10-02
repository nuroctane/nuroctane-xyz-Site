/**
 * Build-time Open Graph renderer. Cloudflare serves the generated PNG assets.
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "node:fs/promises";
import { createElement as h } from "react";

const fonts = Promise.all(
  [400, 700].map(async (weight) => ({
    name: "JetBrains Mono",
    weight,
    style: "normal",
    data: await readFile(
      new URL(
        `../scripts/og-fonts/JetBrainsMono-${weight === 400 ? "Regular" : "Bold"}.ttf`,
        import.meta.url,
      ),
    ),
  })),
);

export const THEMES = {
  home: {
    badge: "DIGITAL SEA",
    accent: "#5de8f0",
    sub: "nuroctane.xyz",
    headline: "Digital Sea",
  },
  quotes: {
    badge: "QUOTES",
    accent: "#7dd3fc",
    sub: "thoughts & lines",
    headline: "Quotes",
  },
  books: {
    badge: "BOOKS",
    accent: "#a5b4fc",
    sub: "living library",
    headline: "Books",
  },
  resume: {
    badge: "RESUME",
    accent: "#5de8f0",
    sub: "David Davieson",
    headline: "Resume",
  },
  modkeys: {
    badge: "MODKEYS",
    accent: "#f0abfc",
    sub: "keyboard configurator",
    headline: "MODKEYS",
  },
  cli: {
    badge: "NurCLI",
    accent: "#e8b923",
    sub: "multi-provider terminal agent",
    headline: "NurCLI",
  },
  observatory: {
    badge: "OBSERVATORY",
    accent: "#38bdf8",
    sub: "swiss ephemeris · sky · missions",
    headline: "Observatory",
  },
  orbit: {
    badge: "OBSERVATORY",
    accent: "#38bdf8",
    sub: "swiss ephemeris · sky · missions",
    headline: "Observatory",
  },
  blog: {
    badge: "WRITINGS",
    accent: "#86efac",
    sub: "nur.writings",
    headline: "Writings",
  },
  socials: {
    badge: "SOCIALS",
    accent: "#fbbf24",
    sub: "the network",
    headline: "Socials",
  },
  projects: {
    badge: "PROJECTS",
    accent: "#fb7185",
    sub: "creative + technical",
    headline: "Projects",
  },
  fin: {
    badge: "FIN",
    accent: "#5de8f0",
    sub: "end of the sea",
    headline: "Fin",
  },
};

function seaCard(theme, badge, sub, pathLabel) {
  return h(
    "div",
    {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(145deg, #041018 0%, #0b2730 48%, #062028 100%)",
        padding: "56px 64px",
        fontFamily: "JetBrains Mono",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "14px",
          color: "#4a9aaa",
          fontSize: 22,
          letterSpacing: "0.22em",
        },
      },
      h("div", {
        style: {
          width: 10,
          height: 10,
          borderRadius: 999,
          background: theme.accent,
        },
      }),
      h("span", null, "SYS://NUROCTANE"),
    ),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 18 } },
      h(
        "div",
        {
          style: {
            color: theme.accent,
            fontSize: 28,
            letterSpacing: "0.28em",
            fontWeight: 600,
          },
        },
        badge,
      ),
      h(
        "div",
        {
          style: {
            color: "#bdeff2",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          },
        },
        theme.headline,
      ),
      h(
        "div",
        {
          style: {
            color: "#6aacb5",
            fontSize: 26,
            letterSpacing: "0.06em",
          },
        },
        sub,
      ),
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: "1px solid rgba(93,232,240,0.18)",
          paddingTop: 28,
          color: "#4a9aaa",
          fontSize: 20,
          letterSpacing: "0.12em",
        },
      },
      h("span", null, "nuroctane.xyz"),
      h("span", { style: { color: theme.accent } }, pathLabel),
    ),
  );
}

// The CLI card is set over a frame of the demo film (nur-cli scripts/demo:
// `node render.mjs --card <take seconds> --scale 2`), so the share preview
// shows the real TUI: the gold window and its live sidegraph.
let cliArtLoad;
const cliArt = () =>
  (cliArtLoad ??= Promise.all(
    [
      ["image/jpeg", "../scripts/og-assets/cli-plate.jpg"],
      ["image/png", "../artifacts/blackboard/public/assets/nodes/nur-cli-logo.png"],
    ].map(async ([type, file]) => {
      const data = await readFile(new URL(file, import.meta.url));
      return `data:${type};base64,${data.toString("base64")}`;
    }),
  ));

function cliCard([plate, logo]) {
  const gold = "#d8c494";
  const mono = "JetBrains Mono";
  const line = (text, style = {}) =>
    h("div", { style: { display: "flex", ...style } }, text);
  return h(
    "div",
    {
      style: {
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#050505",
        fontFamily: mono,
        color: "#f4f1ea",
      },
    },
    h("img", {
      src: plate,
      width: 1200,
      height: 630,
      style: { position: "absolute", left: 0, top: 0 },
    }),
    // Keeps the type legible where the window's edge reaches under it.
    h("div", {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 760,
        height: 630,
        background:
          "linear-gradient(90deg, rgba(5,5,5,0.94) 0%, rgba(5,5,5,0.82) 46%, rgba(5,5,5,0) 100%)",
      },
    }),
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: 64,
          top: 0,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
      },
      h("img", {
        src: logo,
        width: 72,
        height: 72,
        style: { borderRadius: 16, marginBottom: 26 },
      }),
      line("NurCLI", {
        fontSize: 88,
        fontWeight: 700,
        letterSpacing: "-0.05em",
        lineHeight: 1,
      }),
      line("Spend context like it matters.", {
        fontSize: 26,
        color: "#e9e3d3",
        letterSpacing: "-0.02em",
        marginTop: 18,
      }),
      line("65 providers  ·  114 Jev engines  ·  41 themes", {
        fontSize: 16,
        color: gold,
        marginTop: 16,
      }),
      h(
        "div",
        {
          style: {
            display: "flex",
            marginTop: 34,
            padding: "12px 20px",
            border: "1px solid rgba(216,196,148,0.5)",
            borderRadius: 12,
            background: "rgba(16,15,13,0.85)",
            fontSize: 24,
            fontWeight: 700,
            alignSelf: "flex-start",
          },
        },
        h("span", { style: { color: gold, marginRight: 14 } }, "$"),
        h("span", null, "npx nur-cli"),
      ),
    ),
    line("nuroctane.xyz/cli", {
      position: "absolute",
      left: 64,
      bottom: 34,
      fontSize: 17,
      color: "#a8a39a",
    }),
  );
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const page = (url.searchParams.get("page") || "home").toLowerCase();
    const theme = THEMES[page] || THEMES.home;
    const rawTitle = url.searchParams.get("title") || theme.badge;
    const badge =
      page === "cli" ? String(rawTitle) : String(rawTitle).toUpperCase();
    const sub = url.searchParams.get("sub") || theme.sub;
    const pathLabel = page === "home" ? "/" : `/${page}`;

    const element =
      page === "cli"
        ? cliCard(await cliArt())
        : seaCard(theme, badge, sub, pathLabel);

    const svg = await satori(element, {
      width: 1200,
      height: 630,
      fonts: await fonts,
    });
    const png = new Resvg(svg).render().asPng();
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (err) {
    return new Response(`OG image error: ${err?.message || err}`, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
