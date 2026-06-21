import { useThree, useFrame } from '@react-three/fiber';
import { PerformanceTier } from '../hooks/usePerformanceTier';

interface Props {
  mode: 'scroll' | 'camera';
  tier: PerformanceTier;
}

/**
 * Slowly shifting environmental color grade applied to the WebGL canvas in
 * swim (scroll) mode — hue / saturation / contrast / brightness drift on gentle
 * sine waves so the sea feels alive and atmospheric.
 *
 * The filter is applied to the <canvas> element only. The floating cards are
 * separate DOM elements (drei <Html>), so they are naturally excluded.
 * Disabled in explore (camera) mode for an accurate, neutral view.
 */
export function SeaColorShift({ mode, tier }: Props) {
  const gl = useThree((s) => s.gl);

  useFrame(({ clock }) => {
    const canvas = gl.domElement;
    if (mode === 'camera' || tier === 'low') {
      if (canvas.style.filter) canvas.style.filter = '';
      return;
    }
    const t = clock.elapsedTime;
    const hue = Math.sin(t * 0.045) * 16;                  // ±16°
    const sat = 1 + Math.sin(t * 0.061 + 1.1) * 0.20;      // 0.80 .. 1.20
    const con = 1 + Math.sin(t * 0.038 + 2.3) * 0.10;      // 0.90 .. 1.10
    const bri = 1 + Math.sin(t * 0.052 + 0.6) * 0.09;      // 0.91 .. 1.09
    canvas.style.filter =
      `hue-rotate(${hue.toFixed(2)}deg) saturate(${sat.toFixed(3)}) contrast(${con.toFixed(3)}) brightness(${bri.toFixed(3)})`;
  });

  return null;
}
