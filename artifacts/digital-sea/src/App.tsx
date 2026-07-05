import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useScrollProgress } from './hooks/useScrollProgress';
import { usePerformanceTier } from './hooks/usePerformanceTier';
import type { Mode, Track } from './types';
import { nodes } from './data/nodes';
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

const FIN_DISMISS_MAIN = 0.963;
const FIN_DISMISS_BLOG = 0.940;

const socialsStart  = nodes[0].scrollStart;
const projectsStart = nodes.find(n => n.id === 'atxtunerz')?.scrollStart ?? nodes[0].scrollStart;

export default function App() {
  const scrollProgress = useScrollProgress();
  const tier           = usePerformanceTier();
  const [mode,         setMode]         = useState<Mode>('scroll');
  const [finUnlocked,  setFinUnlocked]  = useState(false);
  const [portalsArmed, setPortalsArmed] = useState(true);
  const [location] = useLocation();

  const blogOriginScrollY   = useRef(0);
  const cameraOriginScrollY = useRef(0);
  const cameraOriginMode    = useRef<Mode>('scroll');
  const modeRef             = useRef<Mode>(mode);
  modeRef.current           = mode;

  const activeTrack: Track =
    mode === 'blog' || (mode === 'camera' && cameraOriginMode.current === 'blog')
      ? 'blog'
      : 'main';

  function scrollToT(t: number) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total > 0) {
      window.scrollTo({ top: t * total, behavior: 'instant' });
      return true;
    }
    return false;
  }

  // Section-based routing: auto-scroll or switch mode on initial load / nav
  useEffect(() => {
    const path = location.replace(/^\//, '').toLowerCase();
    if (path === 'blog') {
      if (modeRef.current !== 'blog') {
        setMode('blog');
        scrollToT(0);
      }
      return;
    }
    if (modeRef.current !== 'scroll') {
      setMode('scroll');
    }
    if (path === 'socials' || path === 'projects') {
      const t = path === 'socials' ? socialsStart : projectsStart;
      if (!scrollToT(t)) {
        let cancelled = false;
        const retry = () => { if (!cancelled && !scrollToT(t)) requestAnimationFrame(retry); };
        const id = requestAnimationFrame(retry);
        return () => { cancelled = true; cancelAnimationFrame(id); };
      }
    }
    return;
  }, [location]);

  function handleSetMode(next: Mode) {
    if (next === mode) return;

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
      requestAnimationFrame(() => {
        window.scrollTo({ top: blogOriginScrollY.current, behavior: 'instant' });
      });
    }
  }

  function handleFinClick() {
    setPortalsArmed(false);
    setFinUnlocked(true);

    if (mode === 'blog') return;

    setMode('scroll');
    requestAnimationFrame(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    );
  }

  function handleFinNav() {
    setPortalsArmed(false);
    setFinUnlocked(true);
    setMode('scroll');
    requestAnimationFrame(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
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
