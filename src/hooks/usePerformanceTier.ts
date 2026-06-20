import { useMemo } from 'react';

export type PerformanceTier = 'high' | 'low';

export function usePerformanceTier(): PerformanceTier {
  return useMemo(() => {
    // Prefer high tier unless clearly constrained hardware
    const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return 'low';
    if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) return 'low';
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    return isMobile ? 'low' : 'high';
  }, []);
}
