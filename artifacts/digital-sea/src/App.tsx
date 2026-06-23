import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { usePerformanceTier } from './hooks/usePerformanceTier';
import type { Mode } from './types';
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

export default function App() {
  const scrollProgress = useScrollProgress();
  const tier           = usePerformanceTier();
  const [mode, setMode] = useState<Mode>('scroll');
  const savedScrollY   = useRef(0);

  function handleSetMode(next: Mode) {
    if (next === 'camera') savedScrollY.current = window.scrollY;
    setMode(next);
  }

  function handleReturn() {
    setMode('scroll');
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' });
    });
  }

  useEffect(() => {
    document.body.style.overflow = mode === 'camera' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mode]);

  return (
    <>
      <Scene scrollProgress={scrollProgress} tier={tier} mode={mode} />
      <div className="scanline-overlay" />
      <SectionLabel scrollProgress={scrollProgress} />
      <SummaryPanel mode={mode} />
      <EndPanel mode={mode} />
      <WalletTag mode={mode} />

      <QuickNav onNavigate={() => { if (mode === 'camera') setMode('scroll'); }} />

      <div className="bottom-left-hud">
        <AudioControl />
        <div className="hud-modes-row">
          <ModeToggle mode={mode} setMode={handleSetMode} />
          {mode === 'camera' && <ReturnButton onReturn={handleReturn} />}
        </div>
      </div>

      {mode === 'camera' && (
        <div className="explore-hint">
          drag to look · scroll zoom · wasd/arrows fly · space rise · ctrl dive · hold+drag card to move
          <br />
          tiles are easier clicked in &ldquo;sea&rdquo; mode&nbsp;:)
        </div>
      )}

      <HeroBlock />
    </>
  );
}
