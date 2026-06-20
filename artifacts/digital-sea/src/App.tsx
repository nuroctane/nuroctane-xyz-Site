import { useEffect, useRef } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { usePerformanceTier } from './hooks/usePerformanceTier';
import { Scene } from './components/Scene';

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
          el.style.opacity = t < 0.02 || t > 0.97 ? '0' : '1';
        }, 180);
      } else {
        el.style.opacity = t < 0.02 || t > 0.97 ? '0' : '1';
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
      // Fade in from t=0.008, hold, fade out before first node at t=0.032
      let op = 0;
      if (t >= 0.008 && t < 0.022) op = (t - 0.008) / 0.014;
      else if (t >= 0.022 && t < 0.030) op = 1;
      else if (t >= 0.030 && t < 0.040) op = 1 - (t - 0.030) / 0.010;
      el.style.opacity = String(Math.max(0, Math.min(1, op)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} className="summary-panel" style={{ opacity: 0 }}>
      <img
        src="/assets/nodes/nuroctane-animated-avatar.gif"
        alt="nuroctane"
        className="summary-avatar"
      />
      <div className="summary-label">SYS://IDENTITY</div>
      <p className="summary-text">
        I am <strong>nuroctane</strong> — <em>nur</em> for short.
        Inspired by the Arabic word for <em>light</em>.
        I love cars, technology and philosophy.
        Cosmic, multifaceted being, yada yada.
      </p>
      <p className="summary-text summary-text--secondary">
        This is a small digital sea — a library of profiles, works,
        writings, clubs, socials, projects, media and initiatives.
        Peruse, enjoy and inquire.
      </p>
    </div>
  );
}

export default function App() {
  const scrollProgress = useScrollProgress();
  const tier = usePerformanceTier();

  return (
    <>
      <Scene scrollProgress={scrollProgress} tier={tier} />
      <div className="scanline-overlay" />
      <SectionLabel scrollProgress={scrollProgress} />
      <SummaryPanel />

      {/* Scroll spacer — 1800vh defines the total journey */}
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
