/**
 * Dynamic Open Graph image for share embeds.
 * GET /api/og?page=resume&title=RESUME
 *
 * Edge runtime + @vercel/og — distinct card per page so Discord/Slack/iMessage
 * unfurls match the route, not a single Digital Sea thumbnail.
 *
 * /cli uses NurCLI gold TUI palette + logo from the GitHub/docs asset.
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

/** Gold TUI aesthetic from nur-cli/src/theme.rs + GitHub logo. */
function cliCard(logoDataUrl) {
  const gold = '#e8b923';
  const goldBright = '#ffd65a';
  const goldSky = '#ffe08c';
  const violet = '#b294ff';
  const muted = '#948e80';
  const border = '#302c24';

  return h(
    'div',
    {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(145deg, #0b0e12 0%, #12161c 46%, #0b0e12 100%)',
        padding: '52px 60px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        position: 'relative',
      },
    },
    // gold radial wash
    h('div', {
      style: {
        position: 'absolute',
        top: -80,
        left: '20%',
        width: 700,
        height: 320,
        background: 'radial-gradient(ellipse, rgba(255,214,90,0.14) 0%, transparent 70%)',
        display: 'flex',
      },
    }),
    // top bar
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: muted,
          fontSize: 20,
          letterSpacing: '0.18em',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 14 } },
        h('div', {
          style: {
            width: 10,
            height: 10,
            borderRadius: 999,
            background: gold,
            boxShadow: `0 0 18px ${gold}`,
          },
        }),
        h('span', { style: { color: goldSky } }, 'SYS://CLI'),
      ),
      h('span', { style: { color: violet, letterSpacing: '0.14em' } }, 'nuroctane.xyz/cli'),
    ),
    // main brand row
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 36,
          marginTop: 8,
        },
      },
      logoDataUrl
        ? h('img', {
            src: logoDataUrl,
            width: 168,
            height: 168,
            style: {
              width: 168,
              height: 168,
              objectFit: 'contain',
              borderRadius: 12,
              boxShadow: `0 0 40px rgba(232,185,35,0.28)`,
            },
          })
        : h('div', {
            style: {
              width: 168,
              height: 168,
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: 'linear-gradient(135deg, #1a1f28, #12161c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: gold,
              fontSize: 48,
              fontWeight: 700,
            },
          }, 'NUR'),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        h(
          'div',
          {
            style: {
              color: violet,
              fontSize: 22,
              letterSpacing: '0.2em',
              textTransform: 'lowercase',
            },
          },
          '// multi-provider terminal agent',
        ),
        h(
          'div',
          {
            style: {
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: '0.06em',
              lineHeight: 1,
              backgroundImage:
                'linear-gradient(115deg, #fff8b4 0%, #ffe678 18%, #ffc83c 36%, #e8b923 55%, #c89614 78%, #a06e0f 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              // @vercel/og may not support background-clip text reliably — solid gold fallback via color if needed
            },
          },
          // Use solid goldBright for maximum compatibility with Satori
          h(
            'span',
            {
              style: {
                color: goldBright,
                textShadow: `0 0 40px rgba(232,185,35,0.35)`,
              },
            },
            'NurCLI',
          ),
        ),
        h(
          'div',
          {
            style: {
              color: muted,
              fontSize: 26,
              letterSpacing: '0.04em',
              maxWidth: 720,
              lineHeight: 1.35,
            },
          },
          'Rust harness · gold TUI · 60+ providers · vision · 800+ skills',
        ),
      ),
    ),
    // footer strip
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
          letterSpacing: '0.12em',
        },
      },
      h('span', null, 'nur install · /login · /model · /plugins'),
      h('span', { style: { color: gold } }, '/cli'),
    ),
  );
}

async function fetchLogoDataUrl() {
  try {
    const res = await fetch(NUR_LOGO, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    // btoa available in edge
    const b64 = btoa(binary);
    return `data:image/png;base64,${b64}`;
  } catch {
    return null;
  }
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const page = (url.searchParams.get('page') || 'home').toLowerCase();
    const theme = THEMES[page] || THEMES.home;
    const badge = (url.searchParams.get('title') || theme.badge);
    const sub = url.searchParams.get('sub') || theme.sub;
    const pathLabel = page === 'home' ? '/' : `/${page}`;

    let element;
    if (page === 'cli') {
      const logo = await fetchLogoDataUrl();
      element = cliCard(logo);
    } else {
      element = seaCard(theme, String(badge).toUpperCase(), sub, pathLabel);
    }

    return new ImageResponse(element, {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=86400',
      },
    });
  } catch (err) {
    return new Response(`OG image error: ${err?.message || err}`, { status: 500 });
  }
}
