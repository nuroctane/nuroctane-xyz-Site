import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type { PerformanceTier } from '../../hooks/usePerformanceTier';

interface Props {
  tier: PerformanceTier;
}

export function Effects({ tier }: Props) {
  if (tier === 'low' || tier === 'minimal') return null;

  return (
    <EffectComposer>
      <Bloom
        intensity={1.1}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.75}
        mipmapBlur
        radius={0.65}
      />
      <Vignette
        offset={0.32}
        darkness={0.6}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
