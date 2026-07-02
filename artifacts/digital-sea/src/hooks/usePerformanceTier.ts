import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export type PerformanceTier = 'high' | 'low';

/**
 * Initial tier guess based on hardware signals.
 * Conservative: mobile → low, desktop → high.
 */
function detectInitialTier(): PerformanceTier {
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return 'low';
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) return 'low';
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  return isMobile ? 'low' : 'high';
}

/**
 * Performance tier with a runtime frame-time watchdog.
 *
 * Measures actual GPU frame times over a rolling window. If frames consistently
 * exceed the budget (18ms ≈ 55fps target), the tier auto-downgrades from
 * 'high' to 'low'. This catches thermal throttling, weak integrated GPUs,
 * and high-DPI displays that the heuristic missed.
 *
 * The watchdog only DOWNGRADES — it never upgrades back at runtime (upgrading
 * would cause a jank spike as heavier effects re-mount). A page reload is
 * required to re-test.
 *
 * Returns a tuple: [tier, frameMonitor] where frameMonitor is a component
 * that must be rendered inside <Canvas> to feed the watchdog.
 */
export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>(() => detectInitialTier());

  // Expose the downgrade trigger globally so the FrameMonitor (rendered inside
  // Canvas) can flip it without causing a React state update from useFrame.
  useEffect(() => {
    (window as any).__perfDowngrade = () => setTier('low');
    return () => { delete (window as any).__perfDowngrade; };
  }, []);

  return tier;
}

/**
 * Render this inside <Canvas> to feed frame-time data to the watchdog.
 * It measures delta time each frame and triggers a downgrade if the rolling
 * average exceeds the budget for a sustained period.
 */
export function FrameMonitor() {
  const samples = useRef<number[]>([]);
  const degraded = useRef(false);

  useFrame((_, delta) => {
    if (degraded.current) return;

    const buf = samples.current;
    buf.push(delta * 1000);
    if (buf.length > 60) buf.shift();

    // Need at least 30 samples (~0.5s at 60fps) before evaluating
    if (buf.length < 30) return;

    // Simple p90: find the value at the 90th percentile index.
    // Avoid allocating a sorted copy — use a rough max-based approach instead.
    // Count how many frames exceed 22ms; if >18 of the last 60 do, downgrade.
    let bad = 0;
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] > 22) bad++;
    }
    if (bad > 18) {
      degraded.current = true;
      (window as any).__perfDowngrade?.();
    }
  });

  return null;
}
