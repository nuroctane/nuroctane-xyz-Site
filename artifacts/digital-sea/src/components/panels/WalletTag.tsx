import { useEffect, useRef } from 'react';
import type { Mode } from '../../types';

const BTC_ADDR  = 'bc1qmsexp4nygxcw0gklw346hds4gxctfley2tvn40';
const ETH_ADDR  = '0xf5386e680d5629a6e1c04bb2bfd1b79a794467f5';
const BUILD_VER = 'v0.73';

interface Props {
  mode:        Mode;
  finUnlocked: boolean;
}

export function WalletTag({ mode, finUnlocked }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;

      if (mode === 'camera') {
        el.style.opacity       = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      const total = document.documentElement.scrollHeight - window.innerHeight;
      const t     = total > 0 ? window.scrollY / total : 0;

      // Summary-section band (always visible near top of scroll)
      let startOp = 0;
      if (mode !== 'blog') {
        if (t >= 0.004 && t < 0.016)      startOp = (t - 0.004) / 0.012;
        else if (t >= 0.016 && t < 0.040) startOp = 1;
        else if (t >= 0.040 && t < 0.054) startOp = 1 - (t - 0.040) / 0.014;
      }

      // FIN band — matches EndPanel fade logic per mode
      let endOp = 0;
      if (finUnlocked) {
        if (mode === 'blog') {
          // Blog track: mirror EndPanel fade
          if (t >= 0.94 && t < 0.96)  endOp = (t - 0.94) / 0.02;
          else if (t >= 0.96)          endOp = 1;
        } else {
          // Main track: near very bottom
          if (t >= 0.963 && t < 0.975) endOp = (t - 0.963) / 0.012;
          else if (t >= 0.975)         endOp = 1;
        }
      }

      const op = Math.max(0, Math.min(1, Math.max(startOp, endOp)));
      el.style.opacity       = String(op);
      el.style.pointerEvents = op > 0.05 ? 'auto' : 'none';
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [mode, finUnlocked]);

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
        <div className="wallet-addr wallet-addr--ver">
          <span className="wallet-addr-k">VER</span>
          <span className="wallet-addr-v wallet-addr-v--ver">{BUILD_VER}</span>
        </div>
      </div>
    </div>
  );
}
