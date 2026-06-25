import type { Mode } from '../../types';

interface Props {
  mode: Mode;
  setMode: (m: Mode) => void;
}

export function ModeToggle({ mode, setMode }: Props) {
  return (
    <div className="mode-toggle" aria-label="Navigation mode toggle">
      <div className="mtoggle-row">
        <button
          className={`mtoggle-side${mode === 'scroll' || mode === 'blog' ? ' mtoggle-active' : ''}`}
          onClick={() => setMode('scroll')}
          title="Sea mode — scroll to navigate"
          aria-pressed={mode === 'scroll' || mode === 'blog'}
        >
          <svg viewBox="0 0 22 18" fill="none" className="mtoggle-icon" aria-hidden="true">
            <path d="M1 8 C5 3 9 3 11 8 C13 13 17 13 21 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <path d="M1 13 C5 8 9 8 11 13 C13 18 17 18 21 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.45"/>
          </svg>
        </button>

        <div className="mtoggle-divider" aria-hidden="true" />

        <button
          className={`mtoggle-side${mode === 'camera' ? ' mtoggle-active' : ''}`}
          onClick={() => setMode('camera')}
          title="Explore mode — drag to look around"
          aria-pressed={mode === 'camera'}
        >
          <svg viewBox="0 0 22 18" fill="none" className="mtoggle-icon" aria-hidden="true">
            <line x1="7"  y1="5.5" x2="5.5" y2="2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="11" y1="4"   x2="11"  y2="1"   stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="15" y1="5.5" x2="16.5" y2="2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M1.5 10 Q11 2 20.5 10 Q11 18 1.5 10" stroke="currentColor" strokeWidth="1.6" fill="none"/>
            <circle cx="11" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
            <circle cx="11" cy="10" r="1.6" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div className="mtoggle-label" aria-live="polite">
        {mode === 'scroll' ? 'SEA' : mode === 'blog' ? 'BLOG' : 'EXPLORE'}
      </div>
    </div>
  );
}
