import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

// Import CSS as raw strings for scoped injection
import modkeysVars from '../../../modkeys/src/css/variables.css?raw';
import modkeysLayout from '../../../modkeys/src/css/layout.css?raw';
import modkeysComponents from '../../../modkeys/src/css/components.css?raw';
import modkeysMobile from '../../../modkeys/src/css/mobile.css?raw';

function useModkeysStyles() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Scope modkeys CSS under .modkeys-page to avoid leaking to other pages.
    // Don't scope :root variables — the theme toggle sets data-theme on
    // <html>, and scoping :root→.modkeys-page would make elements inside
    // .modkeys-page inherit light variables instead of the dark ones set on
    // <html>[data-theme="dark"], breaking theme switching.
    // The variable names (--bg, --ink, etc.) are modkeys-specific and won't
    // leak to other pages.
    const scopedVars = modkeysVars;
    // Only scope bare selectors — never rewrite compound selectors like
    // `.snav button {` (would become `.snav .modkeys-page button {` which
    // is wrong because .modkeys-page wraps the entire app, not vice versa).
    // Bare element rules (button, svg) only match elements inside
    // .modkeys-page anyway since that's where all modkeys DOM lives.
    const scopedLayout = modkeysLayout
      .replace(/\* \{/g, '.modkeys-page * {')
      .replace(/^html,/gm, 'html, .modkeys-page,')
      .replace(/^body \{/gm, '.modkeys-page {')
      .replace(/^body /gm, '.modkeys-page ')
      .replace(/::-webkit-scrollbar/g, '.modkeys-page ::-webkit-scrollbar');
    const scopedComponents = modkeysComponents;

    const css = `${scopedVars}\n${scopedLayout}\n${scopedComponents}\n${modkeysMobile}
/* Desktop: constrain grid/flex children to prevent overflow */
.modkeys-page .app { grid-template-rows: 1fr; }
.modkeys-page .side { overflow-y: auto; height: 100%; min-height: 0; }
.modkeys-page .main { overflow: hidden; }
.modkeys-page .content { overflow: hidden; }

/* Keycaps Preview — CSS grid layout (replaces absolute-positioned keys) */
.modkeys-page .preview {
  display: grid !important;
  overflow: visible !important;
  grid-template-columns: repeat(3, auto);
  grid-template-rows: 1fr auto;
  justify-content: center;
  align-items: center;
  justify-items: center;
  align-content: center;
  gap: 12px 10px;
  padding: 16px;
}
.modkeys-page .preview .kc {
  position: relative !important;
  left: auto !important;
  top: auto !important;
  width: 52px !important;
  height: 52px !important;
}
.modkeys-page .preview .kc:nth-child(1) { grid-column: 1; grid-row: 1; }
.modkeys-page .preview .kc:nth-child(2) { grid-column: 2; grid-row: 1; }
.modkeys-page .preview .kc:nth-child(3) { grid-column: 3; grid-row: 1; }
.modkeys-page .preview .kc:nth-child(4) {
  grid-column: 1 / -1;
  grid-row: 2;
  width: 130px !important;
  height: 36px !important;
}
/* Center text inside preview keycaps */
.modkeys-page .preview .kc .kctop {
  align-items: center;
  justify-content: center;
  padding: 0;
  inset: 3px;
}
@media (max-width: 1024px) {
  .modkeys-page .preview { gap: 10px 8px; padding: 14px; }
  .modkeys-page .preview .kc { width: 46px !important; height: 46px !important; }
  .modkeys-page .preview .kc:nth-child(4) { width: 110px !important; height: 32px !important; }
}
`;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    styleRef.current = style;

    return () => {
      style.remove();
      styleRef.current = null;
    };
  }, []);
}

const MSHELL_HTML = `<div class="mShell">
      <header class="mHead">
        <div class="mBrand">
          <img src="/assets/nodes/modkeys-logo.png" onerror="this.onerror=null;this.src='./assets/modkeys-logo.png'" alt="" draggable="false" />
          <b>MODKEYS</b>
        </div>
        <nav class="tnav" id="tnav">
          <button data-nav="builder" class="on">Builder</button>
          <button data-nav="gallery" aria-label="Gallery"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></button>
        </nav>
        <button class="iconBtn" id="themeBtn" title="Toggle theme">
          <svg id="sunIc" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" stroke-linecap="round" />
          </svg>
          <svg id="moonIc" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="display:none">
            <path d="M20.5 14.5A8.5 8.5 0 119.5 3.5a7 7 0 1011 11z" stroke-linejoin="round" />
          </svg>
        </button>
      </header>
      <div class="mStageWrap">
        <div class="stage" id="stage">
          <canvas id="gl"></canvas>
          <div class="pills" id="pills">
            <div id="pillInd"></div>
            <button data-view="3d" class="on" title="3D" aria-label="3D">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>
            </button>
            <button data-view="explode" title="Explode" aria-label="Explode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><rect x="4" y="4" width="10" height="10" rx="1.5"/><rect x="10" y="10" width="10" height="10" rx="1.5"/></svg>
            </button>
            <button data-view="top" title="Top" aria-label="Top">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M12 8.5V14M9.5 11.5 12 14l2.5-2.5"/></svg>
            </button>
            <button data-view="side" title="Side" aria-label="Side">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><rect x="7" y="5" width="10" height="14" rx="2"/><path d="M10 12h5M12.5 9.5 15 12l-2.5 2.5"/></svg>
            </button>
            <button data-view="front" title="Front" aria-label="Front">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M12 15.5V10M9.5 12.5 12 10l2.5 2.5"/></svg>
            </button>
          </div>
          <div class="toolbar mTools">
            <button id="toolHand" title="Pan" data-tool="pan">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <path d="M12 2.5l2 3h-4l2-3zM5.5 8l2.5-1.5V11l-2.5-3zM18.5 8L16 6.5V11l2.5-3zM12 12l1.5 4H15v5H9v-5h1.5L12 12z" />
              </svg>
            </button>
            <button id="toolReset" title="Reset view">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <path d="M21 12a9 9 0 11-3-6.7" stroke-linecap="round" />
                <path d="M21 3v5h-5" stroke-linejoin="round" />
              </svg>
            </button>
            <span class="toolSep"></span>
            <button id="toolUndo" title="Undo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <path d="M3 10l5-5v3h7a6 6 0 010 12H8v-2" stroke-linejoin="round" />
              </svg>
            </button>
            <button id="toolRedo" title="Redo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <path d="M21 10l-5-5v3H9a6 6 0 000 12h7v-2" stroke-linejoin="round" />
              </svg>
            </button>
            <span class="toolSep"></span>
            <button id="toolShare" title="Copy share link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 3.7M15.4 6.8l-6.8 3.7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <nav class="snav mTabs" id="snav" style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;padding:4px 8px;">
        <button data-sec="layout" style="flex:none;width:auto;height:32px;padding:0 6px;border-radius:999px;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;border:1px solid var(--line);background:var(--card2,transparent);touch-action:manipulation">Layout<span class="meta" id="layoutVal">75%</span></button>
        <button data-sec="keycaps" style="flex:none;width:auto;height:32px;padding:0 6px;border-radius:999px;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;border:1px solid var(--line);background:var(--card2,transparent);touch-action:manipulation">Keycaps<span class="dot" id="dotKeycaps"></span></button>
        <button data-sec="switches" style="flex:none;width:auto;height:32px;padding:0 6px;border-radius:999px;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;border:1px solid var(--line);background:var(--card2,transparent);touch-action:manipulation">Switches<span class="dot" id="dotSwitches"></span></button>
        <button data-sec="case" style="flex:none;width:auto;height:32px;padding:0 6px;border-radius:999px;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;border:1px solid var(--line);background:var(--card2,transparent);touch-action:manipulation">Case<span class="dot" id="dotCase"></span></button>
        <button data-sec="plate" style="flex:none;width:auto;height:32px;padding:0 6px;border-radius:999px;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;border:1px solid var(--line);background:var(--card2,transparent);touch-action:manipulation">Plate<span class="dot" id="dotPlate"></span></button>
        <button data-sec="lighting" style="flex:none;width:auto;height:32px;padding:0 6px;border-radius:999px;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;border:1px solid var(--line);background:var(--card2,transparent);touch-action:manipulation">Lighting<span class="dot" id="dotLight"></span></button>
        <button data-sec="extras" style="flex:none;width:auto;height:32px;padding:0 6px;border-radius:999px;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;border:1px solid var(--line);background:var(--card2,transparent);touch-action:manipulation">Extras</button>
      </nav>
      <section class="mPanel">
        <div class="rpHead"><h2 id="panelTitle">KEYCAPS</h2></div>
        <div class="rpBody" id="panelBody"></div>
      </section>
      <div class="mBar">
        <button class="mBarBtn" id="saveBuild">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M17.5 21l-5.5-4-5.5 4V5a2 2 0 012-2h7a2 2 0 012 2z" stroke-linejoin="round" />
          </svg>Save Build
        </button>
        <button class="mBarBtn" id="mExportToggle">Export &#9662;</button>
      </div>
      <div class="mExportMenu" id="mExportMenu">
        <button id="exportKLE">KLE Layout</button>
        <button id="exportSVG">SVG Template</button>
        <button id="exportSpec">Spec Sheet</button>
        <button id="copyKLE">Copy KLE</button>
        <button id="exportPDF">PDF</button>
      </div>
    </div>`;

export default function ModkeysPage() {
  const [, setLocation] = useLocation();
  const mountedRef = useRef(false);

  useModkeysStyles();

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      try {
        // SELECT SHELL BEFORE IMPORTING APP
        // @ts-expect-error Vite resolves cross-package imports
        const shell = await import('../../../modkeys/src/js/shell.js');
        shell.selectShell();

        // @ts-expect-error Vite resolves cross-package imports; modkeys has no tsconfig project reference
        const mod = await import('../../../modkeys/src/js/app.js');
        mod.mountModkeys();
      } catch (err) {
        console.error('Failed to load modkeys:', err);
      }
    })();

    return () => {
      (async () => {
        try {
          // @ts-expect-error Vite resolves cross-package imports; modkeys has no tsconfig project reference
          const mod = await import('../../../modkeys/src/js/app.js');
          if (mod.unmountModkeys) mod.unmountModkeys();
        } catch {}
      })();
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="modkeys-page">
      <div id="loader">
        <div className="lg">
          <img src="/assets/nodes/modkeys-logo.png" alt="" style={{ height: 26, width: "auto" }} draggable={false} />
          <b>MODKEYS</b>
        </div>
        <div className="bar"><i /></div>
      </div>

      <div className="app" id="dShell">
        <aside className="side">
          <div className="logo">
            <img src="/assets/nodes/modkeys-logo.png" alt="" style={{ height: 24, width: "auto" }} draggable={false} />
            <b>MODKEYS</b>
          </div>
          <div className="sideLabel">CONFIGURE</div>
          <nav className="snav" id="snav">
            <button data-sec="layout">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="2.5" y="5" width="19" height="14" rx="3" />
                <path d="M6.5 9.5h.01M10.5 9.5h.01M14.5 9.5h.01M18 9.5h.01M6.5 12.7h.01M10.5 12.7h.01M14.5 12.7h.01M18 12.7h.01M8 16h8" strokeLinecap="round" />
              </svg>Layout<span className="meta" id="layoutVal">75%</span>
            </button>
            <button data-sec="keycaps">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M5 17l2.2-8.3A2 2 0 019.1 7h5.8a2 2 0 011.9 1.7L19 17" strokeLinejoin="round" />
                <path d="M4 17.5h16" strokeLinecap="round" />
              </svg>Keycaps<span className="dot" id="dotKeycaps" />
            </button>
            <button data-sec="switches">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="5" y="10" width="14" height="9" rx="2" />
                <path d="M12 10V6M9.5 8.5h5" strokeLinecap="round" />
              </svg>Switches<span className="dot" id="dotSwitches" />
            </button>
            <button data-sec="case">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="8" width="18" height="9" rx="2.5" />
                <path d="M6 17v2M18 17v2" strokeLinecap="round" />
              </svg>Case<span className="dot" id="dotCase" />
            </button>
            <button data-sec="plate">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                <path d="M3.5 10.5h17M3.5 14.5h17M9 5.5v13M15 5.5v13" />
              </svg>Plate<span className="dot" id="dotPlate" />
            </button>
            <button data-sec="lighting">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="3.6" />
                <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18" strokeLinecap="round" />
              </svg>Lighting<span className="dot" id="dotLight" />
            </button>
            <button data-sec="extras">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 8.5v7M8.5 12h7" strokeLinecap="round" />
              </svg>Extras
            </button>
          </nav>
          <div className="sideBottom">
            <button className="saveRow" id="saveBuild">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17.5 21l-5.5-4-5.5 4V5a2 2 0 012-2h7a2 2 0 012 2z" strokeLinejoin="round" />
              </svg>Save Build
            </button>
            <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--sideTx2)', margin: '0 6px 8px' }}>EXPORT</div>
              <button className="saveRow" id="exportKLE" style={{ marginTop: 2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
                </svg>KLE Layout
              </button>
              <button className="saveRow" id="exportSVG" style={{ marginTop: 2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
                  <path d="M14 2v6h6M12 18V8m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>SVG Template
              </button>
              <button className="saveRow" id="exportSpec" style={{ marginTop: 2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
                  <path d="M14 2v6h6M9 15h6M9 11h6" strokeLinecap="round" />
                </svg>Spec Sheet
              </button>
              <button className="saveRow" id="copyKLE" style={{ marginTop: 2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinejoin="round" />
                </svg>Copy KLE
              </button>
            </div>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <nav className="tnav" id="tnav">
              <button data-nav="builder" className="on">Builder</button>
              <button data-nav="gallery">Gallery</button>
              <button data-nav="keycaps">Keycaps</button>
              <button data-nav="switches">Switches</button>
              <button data-nav="accessories">Accessories</button>
            </nav>
            <div className="topIcons">
              <button className="iconBtn" id="themeBtn" title="Toggle theme">
                <svg id="sunIc" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" strokeLinecap="round" />
                </svg>
                <svg id="moonIc" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ display: 'none' }}>
                  <path d="M20.5 14.5A8.5 8.5 0 119.5 3.5a7 7 0 1011 11z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </header>

          <div className="content">
            <div className="stageCol">
              <div className="stage" id="stage">
                <canvas id="gl"></canvas>
                <div className="pills" id="pills">
                  <div id="pillInd"></div>
                  <button data-view="3d" className="on">3D</button>
                  <button data-view="explode">Explode</button>
                  <button data-view="top">Top</button>
                  <button data-view="side">Side</button>
                  <button data-view="front">Front</button>
                </div>
                <div className="toolbar">
                  <button id="toolHand" title="Pan" data-tool="pan">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M12 2.5l2 3h-4l2-3zM5.5 8l2.5-1.5V11l-2.5-3zM18.5 8L16 6.5V11l2.5-3zM12 12l1.5 4H15v5H9v-5h1.5L12 12z" />
                    </svg>
                  </button>
                  <button id="toolReset" title="Reset view">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M21 12a9 9 0 11-3-6.7" strokeLinecap="round" />
                      <path d="M21 3v5h-5" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="toolSep"></span>
                  <button id="toolUndo" title="Undo (Ctrl+Z)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M3 10l5-5v3h7a6 6 0 010 12H8v-2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button id="toolRedo" title="Redo (Ctrl+Y)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M21 10l-5-5v3H9a6 6 0 000 12h7v-2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="toolSep"></span>
                  <button id="toolShare" title="Copy share link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                      <path d="M8.6 13.5l6.8 3.7M15.4 6.8l-6.8 3.7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* NOTE: markup duplicated in artifacts/modkeys/index.html; change both */}
            <div className="featured">
              <div className="fhead">
                <h3>FEATURED BUILDS</h3>
                <div className="farrows">
                  <button id="scrollL">&larr;</button>
                  <button id="scrollR">&rarr;</button>
                </div>
              </div>
              <div className="btrack" id="builds"></div>
            </div>

            <aside className="rpanel">
              <div className="rpHead"><h2 id="panelTitle">KEYCAPS</h2></div>
              <div className="rpBody" id="panelBody"></div>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile shell template. Same IDs as #dShell; shell.js selectShell()
          swaps exactly one into the live DOM before app.js loads.
          dangerouslySetInnerHTML populates template.content (React children
          cannot). Markup duplicated in artifacts/modkeys/index.html; change both. */}
      <template id="mShellTpl" dangerouslySetInnerHTML={{ __html: MSHELL_HTML }} />

      <div className="toast" id="toast"></div>
      <div className="kePop" id="keyEditor"></div>
      <div className="modalWrap" id="modal">
        <div className="modalBack" id="modalBack"></div>
        <div className="modalCard">
          <div className="mHead">
            <h3 id="modalTitle"></h3>
            <button id="modalClose">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="mBody" id="modalBody"></div>
        </div>
      </div>
    </div>
  );
}
