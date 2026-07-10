/**
 * Dynamic Open Graph image for share embeds.
 * GET /api/og?page=resume&title=RESUME
 *
 * Edge runtime + @vercel/og — distinct card per page so Discord/Slack/iMessage
 * unfurls match the route, not a single Digital Sea thumbnail.
 */
import { ImageResponse } from '@vercel/og';
import { createElement as h } from 'react';

export const config = { runtime: 'edge' };

const THEMES = {
  home:     { badge: 'DIGITAL SEA', accent: '#5de8f0', sub: 'nuroctane.xyz',     headline: 'Digital Sea' },
  quotes:   { badge: 'QUOTES',      accent: '#7dd3fc', sub: 'thoughts & lines',  headline: 'Quotes' },
  books:    { badge: 'BOOKS',       accent: '#a5b4fc', sub: 'living library',    headline: 'Books' },
  resume:   { badge: 'RESUME',      accent: '#5de8f0', sub: 'David Davieson',    headline: 'Resume' },
  modkeys:  { badge: 'MODKEYS',     accent: '#f0abfc', sub: 'keyboard configurator', headline: 'MODKEYS' },
  blog:     { badge: 'WRITINGS',    accent: '#86efac', sub: 'nur.writings',      headline: 'Writings' },
  socials:  { badge: 'SOCIALS',     accent: '#fbbf24', sub: 'the network',       headline: 'Socials' },
  projects: { badge: 'PROJECTS',    accent: '#fb7185', sub: 'creative + technical', headline: 'Projects' },
  fin:      { badge: 'FIN',         accent: '#5de8f0', sub: 'end of the sea',    headline: 'Fin' },
};

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const page = (url.searchParams.get('page') || 'home').toLowerCase();
    const theme = THEMES[page] || THEMES.home;
    const badge = (url.searchParams.get('title') || theme.badge).toUpperCase();
    const sub = url.searchParams.get('sub') || theme.sub;
    const pathLabel = page === 'home' ? '/' : `/${page}`;

    return new ImageResponse(
      h(
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
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, immutable, no-transform, max-age=86400',
        },
      },
    );
  } catch (err) {
    return new Response(`OG image error: ${err?.message || err}`, { status: 500 });
  }
}
