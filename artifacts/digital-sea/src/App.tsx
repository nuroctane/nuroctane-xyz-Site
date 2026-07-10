import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useScrollProgress } from './hooks/useScrollProgress';
import { usePerformanceTier } from './hooks/usePerformanceTier';
import type { Mode, Track } from './types';
import { nodes, PROJECT_THRESHOLD, nodeMid } from './data/nodes';
import { blogPosts } from './data/blogPosts';
import { Scene } from './components/scene/Scene';
import { QuickNav } from './components/hud/QuickNav';
import { ModeToggle } from './components/hud/ModeToggle';
import { ReturnButton } from './components/hud/ReturnButton';
import { AudioControl } from './components/hud/AudioControl';
import { SectionLabel } from './components/panels/SectionLabel';
import { SummaryPanel } from './components/panels/SummaryPanel';
import { EndPanel } from './components/panels/EndPanel';
import { WalletTag } from './components/panels/WalletTag';
import { HeroBlock } from './components/panels/HeroBlock';
import { trackEvent } from './lib/analytics';

const FIN_DISMISS_MAIN = 0.963;
const FIN_DISMISS_BLOG = 0.940;

const socialsStart = nodes[0]?.scrollStart ?? 0;
const firstProject = nodes.find(n => nodeMid(n) >= PROJECT_THRESHOLD) ?? nodes[0];
const projectsStart = firstProject?.scrollStart ?? socialsStart;

function parseSeaPath(location: string): {
  section: string;
  id: string | null;
} {
  const raw = location.replace(/^\//, '').toLowerCase();
  if (!raw) return { section: '', id: null };
  const [section, id] = raw.split('/');
  return { section: section ?? '', id: id || null };
}

export default function App() {
  const scrollProgress = useScrollProgress();
  const tier           = usePerformanceTier();
  const [mode,         setMode]         = useState<Mode>('scroll');
  const [finUnlocked,  setFinUnlocked]  = useState(false);
  const [portalsArmed, setPortalsArmed] = useState(true);
  const [location, setLocation] = useLocation();

  const blogOriginScrollY   = useRef(0);
  const cameraOriginScrollY = useRef(0);
  const cameraOriginMode    = useRef<Mode>('scroll');
  const modeRef             = useRef<Mode>(mode);
  modeRef.current           = mode;
  const finUnlockedRef      = useRef(finUnlocked);
  finUnlockedRef.current    = finUnlocked;
  const locationRef         = useRef(location);
  locationRef.current       = location;
  const skipScrollSyncUntil = useRef(0);
  const lastSyncedPath      = useRef('');

  const activeTrack: Track =
    mode === 'blog' || (mode === 'camera' && cameraOriginMode.current === 'blog')
      ? 'blog'
      : 'main';

  function scrollToT(t: number, behavior: ScrollBehavior = 'instant') {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total > 0) {
      window.scrollTo({ top: t * total, behavior });
      return true;
    }
    return false;
  }

  // Section-based routing: deep-link /socials/:id, /projects/:id, /blog/:slug, /fin
  useEffect(() => {
    const { section, id } = parseSeaPath(location);
    skipScrollSyncUntil.current = performance.now() + 900;

    if (section === 'blog') {
      if (modeRef.current !== 'blog') {
        setMode('blog');
        trackEvent('Mode Change', { mode: 'blog', source: 'route' });
      }
      if (id) {
        const post = blogPosts.find(
          p => p.id === id || p.id === `blog-${id}` || p.id.replace(/^blog-/, '') === id,
        );
        if (post) {
          const t = post.scrollStart + (post.scrollEnd - post.scrollStart) * 0.35;
          if (!scrollToT(t)) {
            let cancelled = false;
            const retry = () => { if (!cancelled && !scrollToT(t)) requestAnimationFrame(retry); };
            const raf = requestAnimationFrame(retry);
            return () => { cancelled = true; cancelAnimationFrame(raf); };
          }
          return;
        }
      }
      scrollToT(0);
      return;
    }

    if (section === 'fin') {
      if (modeRef.current !== 'scroll') setMode('scroll');
      setPortalsArmed(false);
      setFinUnlocked(true);
      trackEvent('Fin Open', { source: 'route' });
      requestAnimationFrame(() =>
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
      );
      return;
    }

    if (modeRef.current === 'blog') {
      // Leaving blog via explicit sea URL
      setMode('scroll');
    } else if (modeRef.current !== 'scroll' && modeRef.current !== 'camera') {
      setMode('scroll');
    }

    if (section === 'socials' || section === 'projects') {
      let t = section === 'socials' ? socialsStart : projectsStart;
      if (id) {
        const node = nodes.find(n => n.id === id);
        if (node) t = node.scrollStart + (node.scrollEnd - node.scrollStart) * 0.35;
      }
      if (!scrollToT(t)) {
        let cancelled = false;
        const retry = () => { if (!cancelled && !scrollToT(t)) requestAnimationFrame(retry); };
        const raf = requestAnimationFrame(retry);
        return () => { cancelled = true; cancelAnimationFrame(raf); };
      }
      return;
    }

    // `/` or unknown sea root — stay; identity is top of scroll
    if (!section) {
      // only snap home when explicitly navigating to root from another section path
      return;
    }
    return;
  }, [location]);

  // While scrolling the sea, keep the URL on a section route so Vercel Top Pages
  // records /socials, /projects, /fin (not only `/`).
  useEffect(() => {
    if (mode !== 'scroll') return;

    const tick = () => {
      if (performance.now() < skipScrollSyncUntil.current) return;
      const { section } = parseSeaPath(locationRef.current);
      // Don't stomp nested deep-links while user is still near that card
      if (section === 'blog') return;
      if (locationRef.current.includes('/') && locationRef.current.split('/').filter(Boolean).length > 1) {
        // e.g. /socials/instagram — leave until user leaves the card window
        const id = locationRef.current.replace(/^\//, '').split('/')[1];
        if (id) {
          const node = nodes.find(n => n.id === id);
          if (node) {
            const t = scrollProgress.current;
            if (t >= node.scrollStart - 0.02 && t <= node.scrollEnd + 0.02) return;
          }
        }
      }

      const t = scrollProgress.current;
      let next = '/';
      if (finUnlockedRef.current && t >= FIN_DISMISS_MAIN) next = '/fin';
      else if (t >= PROJECT_THRESHOLD) next = '/projects';
      else if (t >= 0.04) next = '/socials';
      else next = '/';

      if (next === lastSyncedPath.current) return;
      // Avoid thrashing replace when already on a matching nested path
      const cur = locationRef.current.replace(/\/+$/, '') || '/';
      if (cur === next || cur.startsWith(`${next}/`)) {
        lastSyncedPath.current = next;
        return;
      }
      lastSyncedPath.current = next;
      setLocation(next, { replace: true });
    };

    window.addEventListener('scroll', tick, { passive: true });
    tick();
    return () => window.removeEventListener('scroll', tick);
  }, [mode, setLocation, scrollProgress]);

  function handleSetMode(next: Mode) {
    if (next === mode) return;
    trackEvent('Mode Change', { mode: next, source: 'toggle' });

    if (next === 'camera') {
      cameraOriginScrollY.current = window.scrollY;
      cameraOriginMode.current    = mode;
      setMode('camera');
      return;
    }

    if (next === 'scroll') {
      if (mode === 'blog') return;

      if (mode === 'camera') {
        const prev = cameraOriginMode.current;
        setMode(prev === 'blog' ? 'blog' : 'scroll');
        requestAnimationFrame(() => {
          window.scrollTo({ top: cameraOriginScrollY.current, behavior: 'instant' });
        });
        return;
      }
    }

    setMode(next);
  }

  function handleReturn() {
    if (mode === 'camera') {
      const prev = cameraOriginMode.current;
      setMode(prev);
      requestAnimationFrame(() => {
        window.scrollTo({ top: cameraOriginScrollY.current, behavior: 'instant' });
      });
    } else if (mode === 'blog') {
      setMode('scroll');
      setLocation('/', { replace: true });
      requestAnimationFrame(() => {
        window.scrollTo({ top: blogOriginScrollY.current, behavior: 'instant' });
      });
    }
  }

  function handleFinClick() {
    setPortalsArmed(false);
    setFinUnlocked(true);
    trackEvent('Fin Open', { source: 'portal' });
    skipScrollSyncUntil.current = performance.now() + 1200;
    setLocation('/fin', { replace: true });

    if (mode === 'blog') return;

    setMode('scroll');
    requestAnimationFrame(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }),
    );
  }

  function handleFinNav() {
    setPortalsArmed(false);
    setFinUnlocked(true);
    setMode('scroll');
    trackEvent('Fin Open', { source: 'nav' });
    skipScrollSyncUntil.current = performance.now() + 1200;
    setLocation('/fin');
    requestAnimationFrame(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }),
    );
  }

  function handleBlogClick() {
    const alreadyOnBlogTrack =
      mode === 'blog' || (mode === 'camera' && cameraOriginMode.current === 'blog');

    if (!alreadyOnBlogTrack) {
      blogOriginScrollY.current = window.scrollY;
    }

    setFinUnlocked(false);
    setPortalsArmed(true);
    setMode('blog');
    trackEvent('Mode Change', { mode: 'blog', source: 'portal' });
    skipScrollSyncUntil.current = performance.now() + 1200;
    setLocation('/blog');
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function handlePortalsBlurred() {
    setPortalsArmed(true);
  }

  useEffect(() => {
    if (!finUnlocked) return;

    const check = () => {
      const t         = scrollProgress.current;
      const dismissAt = mode === 'blog' ? FIN_DISMISS_BLOG : FIN_DISMISS_MAIN;
      if (t < dismissAt) {
        setFinUnlocked(false);
        setPortalsArmed(true);
      }
    };

    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [finUnlocked, mode, scrollProgress]);

  useEffect(() => {
    document.body.style.overflow = mode === 'camera' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mode]);

  return (
    <>
      <Scene
        scrollProgress={scrollProgress}
        tier={tier}
        mode={mode}
        activeTrack={activeTrack}
        finUnlocked={finUnlocked}
        portalsArmed={portalsArmed}
        onFinClick={handleFinClick}
        onBlogClick={handleBlogClick}
        onPortalsBlurred={handlePortalsBlurred}
      />
      <div className="scanline-overlay" />
      <SectionLabel scrollProgress={scrollProgress} mode={mode} />
      <SummaryPanel mode={mode} />
      <EndPanel mode={mode} finUnlocked={finUnlocked} />
      <WalletTag mode={mode} finUnlocked={finUnlocked} />

      <QuickNav
        mode={mode}
        onNavigate={() => { if (mode !== 'scroll') setMode('scroll'); }}
        onBlogNavigate={handleBlogClick}
        onFinNavigate={handleFinNav}
      />

      <div className="bottom-left-hud">
        <AudioControl activeTrack={activeTrack} scrollProgress={scrollProgress} />
        <div className="hud-modes-row">
          <ModeToggle mode={mode} setMode={handleSetMode} />
          {(mode === 'camera' || mode === 'blog') && (
            <ReturnButton onReturn={handleReturn} />
          )}
        </div>
      </div>

      {mode === 'camera' && (
        <div className="explore-hint">
          drag to look · scroll zoom · wasd/arrows fly · space rise · ctrl dive · hold+drag card to move
          <br />
          tiles are easier clicked in &ldquo;sea&rdquo; mode&nbsp;:)
        </div>
      )}

      {mode === 'blog' && (
        <div className="blog-mode-label">
          <span className="blog-mode-label-prefix">SYS://</span>NUR.WRITINGS
        </div>
      )}

      <HeroBlock mode={mode} />
    </>
  );
}
