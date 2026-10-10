import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * The Blackboard's hero numbers count to their value rather than appearing.
 * From whatever is shown now, so a new range eases from the old total instead
 * of restarting at zero. Reduced motion lands on the value at once.
 */
export function useCountUp(target: number, reduced: boolean, duration = 1400): number {
  const [value, setValue] = useState(reduced ? target : 0);
  const shown = useRef(value);

  useEffect(() => {
    if (reduced) {
      shown.current = target;
      setValue(target);
      return undefined;
    }
    const from = shown.current;
    if (from === target) return undefined;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const next = Math.round(from + (target - from) * easeOutCubic(t));
      shown.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced, duration]);

  return value;
}
