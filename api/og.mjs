/**
 * Dynamic Open Graph image for share embeds.
 * GET /api/og?page=cli
 *
 * Edge runtime + @vercel/og. /cli uses NurCLI gold TUI palette + GitHub logo.
 * Keep styles Satori-safe: flex only, solid colors, no textShadow / background-clip text.
 */
import { ImageResponse } from '@vercel/og';
import { createElement as h } from 'react';

export const config = { runtime: 'edge' };

const SITE = 'https://www.nuroctane.xyz';
const NUR_LOGO = `${SITE}/assets/nodes/nur-cli-logo.png`;

const THEMES = {
  home:     { badge: 'DIGITAL SEA', accent: '#5de8f0', sub: 'nuroctane.xyz',     headline: 'Digital Sea' },
  quotes:   { badge: 'QUOTES',      accent: '#7dd3fc', sub: 'thoughts & lines',  headline: 'Quotes' },
  books:    { badge: 'BOOKS',       accent: '#a5b4fc', sub: 'living library',    headline: 'Books' },
  resume:   { badge: 'RESUME',      accent: '#5de8f0', sub: 'David Davieson',    headline: 'Resume' },
  modkeys:  { badge: 'MODKEYS',     accent: '#f0abfc', sub: 'keyboard configurator', headline: 'MODKEYS' },
  cli:      { badge: 'NurCLI',      accent: '#e8b923', sub: 'multi-provider terminal agent', headline: 'NurCLI' },
  orbit:    { badge: 'ORBIT VEIL', accent: '#38bdf8', sub: 'real-time satellite tracker', headline: 'Orbit Veil' },
  blog:     { badge: 'WRITINGS',    accent: '#86efac', sub: 'nur.writings',      headline: 'Writings' },
  socials:  { badge: 'SOCIALS',     accent: '#fbbf24', sub: 'the network',       headline: 'Socials' },
  projects: { badge: 'PROJECTS',    accent: '#fb7185', sub: 'creative + technical', headline: 'Projects' },
  fin:      { badge: 'FIN',         accent: '#5de8f0', sub: 'end of the sea',    headline: 'Fin' },
};

function seaCard(theme, badge, sub, pathLabel) {
  return h(
    'div',
    {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(145deg, #041018 0%, #0b2730 48%, #062028 100%)',
        padding: '56px 64px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          color: '#4a9aaa',
          fontSize: 22,
          letterSpacing: '0.22em',
        },
      },
      h('div', {
        style: {
          width: 10,
          height: 10,
          borderRadius: 999,
          background: theme.accent,
          boxShadow: `0 0 18px ${theme.accent}`,
        },
      }),
      h('span', null, 'SYS://NUROCTANE'),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 18 } },
      h(
        'div',
        {
          style: {
            color: theme.accent,
            fontSize: 28,
            letterSpacing: '0.28em',
            fontWeight: 600,
          },
        },
        badge,
      ),
      h(
        'div',
        {
          style: {
            color: '#bdeff2',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          },
        },
        theme.headline,
      ),
      h(
        'div',
        {
          style: {
            color: '#6aacb5',
            fontSize: 26,
            letterSpacing: '0.06em',
          },
        },
        sub,
      ),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid rgba(93,232,240,0.18)',
          paddingTop: 28,
          color: '#4a9aaa',
          fontSize: 20,
          letterSpacing: '0.12em',
        },
      },
      h('span', null, 'nuroctane.xyz'),
      h('span', { style: { color: theme.accent } }, pathLabel),
    ),
  );
}

/**
 * NurCLI gold card — same structural pattern as seaCard (Satori-safe).
 * Logo via absolute URL (not base64) so @vercel/og can fetch it.
 */
function cliCard(logoOk) {
  const gold = '#e8b923';
  const goldBright = '#ffd65a';
  const goldSky = '#ffe08c';
  const violet = '#b294ff';
  const muted = '#948e80';
  const border = 'rgba(232,185,35,0.28)';

  return h(
    'div',
    {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(145deg, #0b0e12 0%, #12161c 48%, #0b0e12 100%)',
        padding: '52px 60px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
    },
    // top bar
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: goldSky,
            fontSize: 22,
            letterSpacing: '0.2em',
          },
        },
        h('div', {
          style: {
            width: 10,
            height: 10,
            borderRadius: 999,
            background: gold,
            boxShadow: `0 0 18px ${gold}`,
          },
        }),
        h('span', null, 'SYS://CLI'),
      ),
      h(
        'div',
        {
          style: {
            color: violet,
            fontSize: 20,
            letterSpacing: '0.14em',
          },
        },
        'nuroctane.xyz/cli',
      ),
    ),
    // brand
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 36,
        },
      },
      logoOk
        ? h('img', {
            src: NUR_LOGO,
            width: 160,
            height: 160,
            style: {
              width: 160,
              height: 160,
              objectFit: 'contain',
              borderRadius: 12,
              border: `1px solid ${border}`,
            },
          })
        : h(
            'div',
            {
              style: {
                width: 160,
                height: 160,
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: '#1a1f28',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: goldBright,
                fontSize: 42,
                fontWeight: 700,
                letterSpacing: '0.08em',
              },
            },
            'NUR',
          ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          },
        },
        h(
          'div',
          {
            style: {
              color: violet,
              fontSize: 22,
              letterSpacing: '0.16em',
            },
          },
          '// multi-provider terminal agent',
        ),
        h(
          'div',
          {
            style: {
              color: goldBright,
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: '0.06em',
              lineHeight: 1.05,
            },
          },
          'NurCLI',
        ),
        h(
          'div',
          {
            style: {
              color: muted,
              fontSize: 24,
              letterSpacing: '0.04em',
              maxWidth: 700,
              lineHeight: 1.35,
            },
          },
          'Rust harness · gold TUI · 60+ providers · vision · 800+ skills',
        ),
      ),
    ),
    // footer
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: `1px solid ${border}`,
          paddingTop: 26,
          color: muted,
          fontSize: 20,
          letterSpacing: '0.1em',
        },
      },
      h('span', null, 'nur install  ·  /login  ·  /model  ·  /plugins'),
      h('span', { style: { color: gold } }, '/cli'),
    ),
  );
}

async function logoAvailable() {
  try {
    const res = await fetch(NUR_LOGO, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const page = (url.searchParams.get('page') || 'home').toLowerCase();
    const theme = THEMES[page] || THEMES.home;
    // Prefer theme badge as-is for cli (NurCLI); others uppercase for sea chrome
    const rawTitle = url.searchParams.get('title') || theme.badge;
    const badge = page === 'cli' ? String(rawTitle) : String(rawTitle).toUpperCase();
    const sub = url.searchParams.get('sub') || theme.sub;
    const pathLabel = page === 'home' ? '/' : `/${page}`;

    let element;
    if (page === 'cli') {
      const ok = await logoAvailable();
      element = cliCard(ok);
    } else {
      element = seaCard(theme, badge, sub, pathLabel);
    }

    return new ImageResponse(element, {
      width: 1200,
      height: 630,
      headers: {
        // shorter cache so X re-fetches after fixes; still CDN friendly
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    // Never return empty image/png — X drops zero-byte cards
    return new Response(`OG image error: ${err?.message || err}`, {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}
