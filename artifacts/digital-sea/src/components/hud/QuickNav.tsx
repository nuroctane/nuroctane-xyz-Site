import { useState, useEffect, useRef } from 'react';
import { nodes, NodeData } from '../../data/nodes';
import { blogPosts, BlogPost } from '../../data/blogPosts';
import type { Mode } from '../../types';

const SOCIAL_IDS  = ['instagram','tiktok','x','remilia','substack','soundcloud','twitch','youtube','kick','anilist','letterboxd','steam','discord'];
const PROJECT_IDS = ['atxtunerz','github','weatherguru','sis','astrosleep','geoskin','miyamaker','webutils'];

const LOGO_MAP: Record<string, string> = {
  instagram:  '/assets/nodes/instagram-logo.png',
  tiktok:     '/assets/nodes/tiktok-logo.png',
  x:          '/assets/nodes/x-logo.png',
  substack:   '/assets/nodes/substack-logo.png',
  soundcloud: '/assets/nodes/soundcloud-logo.png',
  twitch:     '/assets/nodes/twitch-logo.png',
  youtube:    '/assets/nodes/youtube-logo.png',
  kick:       '/assets/nodes/kick-logo.png',
  anilist:    '/assets/nodes/anilist-logo.png',
  letterboxd: '/assets/nodes/letterboxd-logo.png',
  remilia:    '/assets/nodes/remilia-quicklaunch-logo.png',
  steam:      '/assets/nodes/steam-logo.png',
  discord:    '/assets/nodes/discord-logo.png',
  atxtunerz:  '/assets/nodes/instagram-logo.png',
  github:     '/assets/nodes/github-logo.png',
  miyamaker:  '/assets/nodes/miyamaker-avatar.png',
  webutils:   '/assets/nodes/wrench.png',
};

const ACRONYM_MAP: Record<string, string> = {
  weatherguru: 'WG',
  sis:         'SIS',
  astrosleep:  'AS',
  geoskin:     'CS',
};

// Computed once at module load — nodes is static data, no need to filter
// on every component render.
const SOCIAL_ID_SET  = new Set(SOCIAL_IDS);
const PROJECT_ID_SET = new Set(PROJECT_IDS);
const SOCIAL_NODES   = nodes.filter(n => SOCIAL_ID_SET.has(n.id));
const PROJECT_NODES  = nodes.filter(n => PROJECT_ID_SET.has(n.id));

function scrollToNode(node: NodeData, onClose: () => void, onNavigate?: () => void) {
  onNavigate?.();
  onClose();
  requestAnimationFrame(() => {
    const total     = document.documentElement.scrollHeight - window.innerHeight;
    const approachT = node.scrollStart + (node.scrollEnd - node.scrollStart) * 0.35;
    window.scrollTo({ top: approachT * total, behavior: 'smooth' });
  });
}

function scrollToBlogPost(
  post:           BlogPost,
  mode:           Mode,
  onClose:        () => void,
  onBlogNavigate: () => void,
) {
  onClose();
  const doScroll = () => {
    const total     = document.documentElement.scrollHeight - window.innerHeight;
    const approachT = post.scrollStart + (post.scrollEnd - post.scrollStart) * 0.35;
    window.scrollTo({ top: approachT * total, behavior: 'smooth' });
  };

  if (mode !== 'blog') {
    onBlogNavigate();
    setTimeout(doScroll, 80);
  } else {
    doScroll();
  }
}

function NavItem({ node, onClose, onNavigate }: { node: NodeData; onClose: () => void; onNavigate?: () => void }) {
  const logo    = LOGO_MAP[node.id];
  const acronym = ACRONYM_MAP[node.id] ?? node.id.slice(0, 2).toUpperCase();
  const isSoon  = node.url === '#';

  return (
    <button
      className={`qnav-item${isSoon ? ' qnav-item--soon' : ''}`}
      onClick={() => scrollToNode(node, onClose, onNavigate)}
    >
      <span className="qnav-item-badge">
        {logo
          ? <img src={logo} alt="" className="qnav-item-img" />
          : <span className="qnav-item-acronym">{acronym}</span>
        }
      </span>
      <span className="qnav-item-name">{node.label}</span>
      {isSoon && <span className="qnav-item-tag">SOON</span>}
    </button>
  );
}

function BlogNavItem({
  post, mode, onClose, onBlogNavigate,
}: {
  post:           BlogPost;
  mode:           Mode;
  onClose:        () => void;
  onBlogNavigate: () => void;
}) {
  const num = blogPosts.indexOf(post) + 1;
  return (
    <button
      className="qnav-item"
      onClick={() => scrollToBlogPost(post, mode, onClose, onBlogNavigate)}
    >
      <span className="qnav-item-badge">
        <span className="qnav-item-acronym" style={{ fontSize: '0.55rem' }}>
          {String(num).padStart(2, '0')}
        </span>
      </span>
      <span className="qnav-item-name" style={{ fontSize: '0.62rem' }}>{post.title}</span>
    </button>
  );
}

function CatHeader({
  icon, label, count, expanded, onToggle, onActivate,
}: {
  icon:      React.ReactNode;
  label:     string;
  count?:    number;
  expanded?: boolean;
  onToggle?: () => void;
  onActivate?: () => void;
}) {
  return (
    <button className="qnav-cat-hd" onClick={onToggle ?? onActivate}>
      <span className="qnav-cat-ico">{icon}</span>
      <span className="qnav-cat-lbl">{label}</span>
      {count != null && <span className="qnav-cat-cnt">{count}</span>}
      {expanded != null && (
        <span className={`qnav-cat-chev${expanded ? ' qnav-cat-chev--open' : ''}`}>▸</span>
      )}
    </button>
  );
}

const IconHex = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <polygon points="8,1 14.5,4.5 14.5,11.5 8,15 1.5,11.5 1.5,4.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
    <circle cx="8" cy="8" r="1.8" fill="currentColor" opacity="0.7"/>
  </svg>
);
const IconNet = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="3"  cy="8"  r="1.8" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="13" cy="3"  r="1.8" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="13" cy="13" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="4.8" y1="7.1" x2="11.2" y2="4"  stroke="currentColor" strokeWidth="1"/>
    <line x1="4.8" y1="8.9" x2="11.2" y2="12" stroke="currentColor" strokeWidth="1"/>
  </svg>
);
const IconGrid = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1"   y="1"   width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9.5" y="1"   width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="1"   y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);
const IconFin = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <polyline points="3,5 8,10 13,5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    <line x1="3" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IconBlog = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="4.5" y1="5.5"  x2="11.5" y2="5.5"  stroke="currentColor" strokeWidth="1"/>
    <line x1="4.5" y1="8"    x2="11.5" y2="8"    stroke="currentColor" strokeWidth="1"/>
    <line x1="4.5" y1="10.5" x2="8.5"  y2="10.5" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

interface QuickNavProps {
  mode:           Mode;
  onNavigate?:    () => void;
  onBlogNavigate: () => void;
  onFinNavigate:  () => void;
}

export function QuickNav({ mode, onNavigate, onBlogNavigate, onFinNavigate }: QuickNavProps) {
  const [open,     setOpen]     = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const toggle = (cat: string) =>
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(cat) ? s.delete(cat) : s.add(cat);
      return s;
    });

  return (
    <div className="qnav" ref={panelRef}>
      <button
        className={`qnav-trigger${open ? ' qnav-trigger--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
      >
        <span className="qnav-bar qnav-bar--1" />
        <span className="qnav-bar qnav-bar--2" />
        <span className="qnav-bar qnav-bar--3" />
      </button>

      <div className={`qnav-panel${open ? ' qnav-panel--open' : ''}`} role="navigation" aria-label="Site navigation">
        <div className="qnav-scan" />

        <div className="qnav-hd">
          <img src="/assets/nodes/site-logo.png" alt="nuroctane" className="qnav-logo" />
          <span className="qnav-hd-text">// NAV</span>
          <button className="qnav-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className="qnav-body">
          <div className="qnav-cat">
            <CatHeader
              icon={<IconHex />}
              label="IDENTITY"
              onActivate={() => {
                onNavigate?.();
                setOpen(false);
                requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
              }}
            />
          </div>

          <div className="qnav-cat">
            <CatHeader
              icon={<IconNet />}
              label="SOCIALS"
              count={SOCIAL_NODES.length}
              expanded={expanded.has('SOCIALS')}
              onToggle={() => toggle('SOCIALS')}
            />
            {expanded.has('SOCIALS') && (
              <div className="qnav-items">
                {SOCIAL_NODES.map(n => (
                  <NavItem key={n.id} node={n} onClose={() => setOpen(false)} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>

          <div className="qnav-cat">
            <CatHeader
              icon={<IconGrid />}
              label="PROJECTS"
              count={PROJECT_NODES.length}
              expanded={expanded.has('PROJECTS')}
              onToggle={() => toggle('PROJECTS')}
            />
            {expanded.has('PROJECTS') && (
              <div className="qnav-items">
                {PROJECT_NODES.map(n => (
                  <NavItem key={n.id} node={n} onClose={() => setOpen(false)} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>

          <div className="qnav-cat">
            <CatHeader
              icon={<IconBlog />}
              label="BLOG"
              count={blogPosts.length}
              expanded={expanded.has('BLOG')}
              onToggle={() => toggle('BLOG')}
            />
            {expanded.has('BLOG') && (
              <div className="qnav-items">
                {blogPosts.map(p => (
                  <BlogNavItem
                    key={p.id}
                    post={p}
                    mode={mode}
                    onClose={() => setOpen(false)}
                    onBlogNavigate={onBlogNavigate}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="qnav-cat">
            <CatHeader
              icon={<IconFin />}
              label="FIN"
              onActivate={() => {
                setOpen(false);
                onFinNavigate();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
