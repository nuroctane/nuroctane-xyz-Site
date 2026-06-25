import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { usePerformanceTier } from './hooks/usePerformanceTier';
import type { Mode, Track } from './types';
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

// The moment scroll drops below these thresholds the fin summary hides and
// portals immediately re-arm.  Values match the start of each EndPanel fade-in
// window so even a slight backward scroll dismisses the overlay.
const FIN_DISMISS_MAIN = 0.963;
const FIN_DISMISS_BLOG = 0.940;

export default function App() {
  const scrollProgress = useScrollProgress();
  const tier           = usePerformanceTier();
  const [mode,         setMode]         = useState<Mode>('scroll');
  const [finUnlocked,  setFinUnlocked]  = useState(false);
  const [portalsArmed, setPortalsArmed] = useState(true);

  // ── Separate origin refs prevent one mode path from clobbering the other ──
  //
  // blogOriginScrollY: the main-track scrollY saved when the blog portal was
  //   clicked.  ReturnButton in blog mode always restores this.
  //
  // cameraOriginScrollY / cameraOriginMode: the scrollY and mode saved when
  //   the explore toggle was activated.  ReturnButton in camera mode restores
  //   both so the user lands exactly where they left off in the right mode.
  const blogOriginScrollY   = useRef(0);
  const cameraOriginScrollY = useRef(0);
  const cameraOriginMode    = useRef<Mode>('scroll');

  const activeTrack: Track =
    mode === 'blog' || (mode === 'camera' && cameraOriginMode.current === 'blog')
      ? 'blog'
      : 'main';

  // ── Mode transitions ───────────────────────────────────────────────────────

  // Called by ModeToggle only.  Saves camera origin before entering explore.
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

  // ReturnButton handler — restores context based on which mode we're leaving.
  function handleReturn() {
    if (mode === 'camera') {
      // Return from explore: go back to whatever mode and scroll we left.
      const prev = cameraOriginMode.current;
      setMode(prev);
      requestAnimationFrame(() => {
        window.scrollTo({ top: cameraOriginScrollY.current, behavior: 'instant' });
      });
    } else if (mode === 'blog') {
      // Return from blog: always go back to the main scroll at the position
      // the user was at when they clicked the blog portal.
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
      // Save the main-track position so ReturnButton can restore it later.
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

  // ── FIN summary auto-dismiss ──────────────────────────────────────────────
  // Resets finUnlocked (and re-arms portals) the moment the user scrolls back
  // past the EndPanel fade-in boundary.  This means even a tiny backward scroll
  // hides the overlay, and portals are immediately clickable again without
  // needing to retreat all the way to MAIN_ZONE_THRESHOLD.
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

  // ── Body overflow ─────────────────────────────────────────────────────────
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
