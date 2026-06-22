import { useRef, useMemo, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  dirRef: MutableRefObject<THREE.Vector3>;   // local screen-space pull direction
  activeRef: MutableRefObject<boolean>;
  velRef: MutableRefObject<number>;
  color?: string;
  count?: number;
}

/**
 * A small cloud of particles that streams in the direction a card is pulled,
 * evoking water displaced by the moving object. Rendered as a child of the
 * (billboarded) card group, so local XY ≈ the screen plane and particles flow
 * in the same direction the user drags.
 */
export function DragWake({ dirRef, activeRef, velRef, color = '#bdeff2', count = 30 }: Props) {
  const ptsRef = useRef<THREE.Points>(null);
  const life = useMemo(() => Float32Array.from({ length: count }, () => Math.random()), [count]);

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size: 0.05, sizeAttenuation: true,
    transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }), [color]);

  useFrame((_, dt) => {
    const pts = ptsRef.current;
    if (!pts) return;
    const active = activeRef.current;
    const vel = velRef.current;
    const m = pts.material as THREE.PointsMaterial;

    // Dormant fast-path: once opacity fades to zero and dragging has stopped,
    // skip all particle simulation and GPU buffer uploads entirely.
    // This fires for all 75 DragWake instances whenever the user isn't dragging.
    if (!active && m.opacity < 0.002) return;

    const arr = geo.attributes.position.array as Float32Array;
    const dir = dirRef.current;
    const step = Math.min(dt, 0.05);
    const spd = (0.6 + vel * 2.6) * step;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += dir.x * spd;
      arr[i * 3 + 1] += dir.y * spd;
      arr[i * 3 + 2] += dir.z * spd;
      life[i] -= step * (0.8 + vel);
      if (active && life[i] <= 0) {
        // respawn near the card, slightly behind the pull direction
        arr[i * 3] = (Math.random() - 0.5) * 0.5 - dir.x * 0.4;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 0.7 - dir.y * 0.4;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        life[i] = 0.5 + Math.random() * 0.7;
      }
    }
    geo.attributes.position.needsUpdate = true;

    const tgt = active ? Math.min(0.8, 0.3 + vel) : 0;
    m.opacity += (tgt - m.opacity) * 0.15;
  });

  return <points ref={ptsRef} geometry={geo} material={mat} frustumCulled={false} />;
}
