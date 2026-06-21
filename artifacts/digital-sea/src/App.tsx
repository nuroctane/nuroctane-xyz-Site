import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { usePerformanceTier } from './hooks/usePerformanceTier';
import { Scene } from './components/Scene';
import { QuickNav } from './components/QuickNav';
import { ModeToggle } from './components/ModeToggle';

const PROJECT_THRESHOLD = 0.62;

function SectionLabel({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const t = scrollProgress.current;
      const textEl = el.querySelector('.label-text') as HTMLElement;
      if (!textEl) return;
      const next = t >= PROJECT_THRESHOLD ? 'SYS://CREATIVE_PROJECTS' : 'SOC://SOCIAL_LINKS';
      if (textEl.textContent !== next) {
        el.style.opacity = '0';
        setTimeout(() => {
          textEl.textContent = next;
          el.style.opacity = t < 0.025 || t > 0.97 ? '0' : '1';
        }, 180);
      } else {
        el.style.opacity = t < 0.025 || t > 0.97 ? '0' : '1';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollProgress]);

  return (
    <div ref={ref} className="sticky-section-label" style={{ opacity: 0 }}>
      <span className="label-text">SOC://SOCIAL_LINKS</span>
    </div>
  );
}

function SummaryPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const scrollY = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const t = total > 0 ? scrollY / total : 0;
      let op = 0;
      if (t >= 0.004 && t < 0.016) op = (t - 0.004) / 0.012;
      else if (t >= 0.016 && t < 0.040) op = 1;
      else if (t >= 0.040 && t < 0.054) op = 1 - (t - 0.040) / 0.014;
      el.style.opacity = String(Math.max(0, Math.min(1, op)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} className="summary-panel" style={{ opacity: 0 }}>
      <img src="/assets/nodes/nuroctane-animated-avatar.gif" alt="nuroctane" className="summary-avatar" />
      <div className="summary-label">SYS://IDENTITY</div>
      <p className="summary-text">
        I am <strong>"nuroctane"</strong> or <em>"nur"</em> for short.
        I was inspired to create my name from the Arabic word for <em>light</em>.
        I love cars, technology and philosophy.
        Cosmic, multifaceted being yada yada.
      </p>
      <p className="summary-text summary-text--secondary">
        This is a small digital sea/library of all my profiles and works,
        from writings to clubs, socials, projects, media and initiatives.
        Peruse, enjoy and inquire.
      </p>
    </div>
  );
}

function EndPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const scrollY = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const t = total > 0 ? scrollY / total : 0;
      let op = 0;
      if (t >= 0.963 && t < 0.975) op = (t - 0.963) / 0.012;
      else if (t >= 0.975) op = 1;
      el.style.opacity = String(Math.max(0, Math.min(1, op)));
      el.style.pointerEvents = op > 0 ? 'auto' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} className="summary-panel end-panel" style={{ opacity: 0, pointerEvents: 'none' }}>
      <img src="/assets/nodes/nuroctane-animated-avatar.gif" alt="nuroctane" className="summary-avatar" />
      <div className="summary-label">SYS://END_OF_SEA</div>
      <p className="summary-text">
        I am <strong>"nuroctane"</strong> or <em>"nur"</em> for short.
        I was inspired to create my name from the Arabic word for <em>light</em>.
        I love cars, technology and philosophy.
        Cosmic, multifaceted being yada yada.
      </p>
      <p className="summary-text summary-text--secondary">
        This is a small digital sea/library of all my profiles and works,
        from writings to clubs, socials, projects, media and initiatives.
        Peruse, enjoy and inquire.
      </p>
      <p className="end-thankyou">Thank you for visiting.</p>
    </div>
  );
}

const BTC_ADDR = 'bc1qmsexp4nygxcw0gklw346hds4gxctfley2tvn40';
const ETH_ADDR = '0xf5386e680d5629a6e1c04bb2bfd1b79a794467f5';

function WalletTag() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const t = total > 0 ? window.scrollY / total : 0;
      // Mirror the start (SummaryPanel) and end (EndPanel) fade windows.
      let startOp = 0;
      if (t >= 0.004 && t < 0.016) startOp = (t - 0.004) / 0.012;
      else if (t >= 0.016 && t < 0.040) startOp = 1;
      else if (t >= 0.040 && t < 0.054) startOp = 1 - (t - 0.040) / 0.014;
      let endOp = 0;
      if (t >= 0.963 && t < 0.975) endOp = (t - 0.963) / 0.012;
      else if (t >= 0.975) endOp = 1;
      const op = Math.max(0, Math.min(1, Math.max(startOp, endOp)));
      el.style.opacity = String(op);
      el.style.pointerEvents = op > 0.05 ? 'auto' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} className="wallet-tag" style={{ opacity: 0, pointerEvents: 'none' }}>
      <a
        className="wallet-venmo"
        href="https://venmo.com/u/nuroctane"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Venmo · nuroctane"
      >
        <img src="/assets/nodes/venmo-logo.png" alt="Venmo" />
      </a>
      <div className="wallet-addrs">
        <div className="wallet-addr">
          <span className="wallet-addr-k">BTC</span>
          <span className="wallet-addr-v">{BTC_ADDR}</span>
        </div>
        <div className="wallet-addr">
          <span className="wallet-addr-k">ETH</span>
          <span className="wallet-addr-v">{ETH_ADDR}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const scrollProgress = useScrollProgress();
  const tier = usePerformanceTier();
  const [mode, setMode] = useState<'scroll' | 'camera'>('scroll');

  // Lock page scroll in explore/camera mode so OrbitControls has full pointer ownership
  useEffect(() => {
    if (mode === 'camera') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mode]);

  return (
    <>
      <Scene scrollProgress={scrollProgress} tier={tier} mode={mode} />
      <div className="scanline-overlay" />
      <SectionLabel scrollProgress={scrollProgress} />
      <SummaryPanel />
      <EndPanel />
      <WalletTag />

      {/* Top-left: Code Lyoko quick nav */}
      <QuickNav />

      {/* Bottom-left: sea ↔ explore mode toggle */}
      <ModeToggle mode={mode} setMode={setMode} />

      {/* Explore mode hint overlay */}
      {mode === 'camera' && (
        <div className="explore-hint">
          drag to look around · scroll to zoom · hold + drag a card to move it
        </div>
      )}

      <div style={{ height: '1800vh', position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        <div className="hero-block">
          <div className="hero-label">SYS://DIGITAL_SEA</div>
          <h1 className="hero-title">NUROCTANE</h1>
          <p className="hero-sub">SCROLL TO NAVIGATE</p>
          <div className="scroll-indicator" />
        </div>
      </div>
    </>
  );
}
