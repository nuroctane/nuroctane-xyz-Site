import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { PerformanceTier } from '../../hooks/usePerformanceTier';
import type { Mode } from '../../types';

interface Props {
  mode: Mode;
  tier: PerformanceTier;
}

/**
 * Slowly shifting environmental color grade applied to the WebGL canvas in
 * swim mode — hue / saturation / contrast / brightness drift on gentle sine
 * waves so the sea feels alive. Disabled in explore mode for a neutral view.
 *
 * The filter is applied to the <canvas> element only. The floating cards are
 * separate DOM elements (drei <Html>), so they are naturally excluded.
 */
export function SeaColorShift({ mode, tier }: Props) {
  const gl     = useThree((s) => s.gl);
  const _frame = useRef(0);

  useFrame(({ clock }) => {
    const canvas = gl.domElement;
    if (mode === 'camera' || tier === 'low' || tier === 'minimal') {
      if (canvas.style.filter) canvas.style.filter = '';
      return;
    }
    // Throttle to every 4th frame (~15 fps). The sine waves have periods of
    // 100-165 s; updating at 15 fps changes each value by < 0.25° per step —
    // imperceptible, but saves 75% of browser recomposite cost on this element.
    if (++_frame.current % 4 !== 0) return;
    const t   = clock.elapsedTime;
    const hue = Math.sin(t * 0.045) * 16;
    const sat = 1 + Math.sin(t * 0.061 + 1.1) * 0.20;
    const con = 1 + Math.sin(t * 0.038 + 2.3) * 0.10;
    const bri = 1 + Math.sin(t * 0.052 + 0.6) * 0.09;
    canvas.style.filter =
      `hue-rotate(${hue.toFixed(2)}deg) saturate(${sat.toFixed(3)}) contrast(${con.toFixed(3)}) brightness(${bri.toFixed(3)})`;
  });

  return null;
}
