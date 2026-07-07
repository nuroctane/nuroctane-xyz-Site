import type { Mode } from '../../types';

interface Props {
  mode: Mode;
}

export function HeroBlock({ mode }: Props) {
  return (
    <div style={{ height: '1800vh', position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
      {/* Main sea hero — hidden in blog mode */}
      <div className={`hero-block${mode === 'blog' ? ' hero-block--hidden' : ''}`}>
        <div className="hero-label">SYS://DIGITAL_SEA</div>
        <h1 className="hero-title">NUROCTANE</h1>
        <p className="hero-sub">SCROLL TO NAVIGATE</p>
        <div className="scroll-indicator" />
      </div>

      {/* Blog-mode landing screen — replaces the hero area so users aren't confused */}
      {mode === 'blog' && (
        <div className="hero-block blog-hero-block">
          <div className="blog-hero-sys">[ SYS://WRITINGS ]</div>
          <h1 className="blog-hero-title">BLOG</h1>
          <p className="blog-hero-sub">↓ SCROLL TO READ PASSAGES</p>
          <div className="scroll-indicator" />
        </div>
      )}
    </div>
  );
}
