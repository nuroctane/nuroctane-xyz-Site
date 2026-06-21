import { useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { curve } from '../data/path';
import { useCardDrag } from '../hooks/useCardDrag';
import { DragWake } from './DragWake';

function mkRand(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

const HEX = '0123456789ABCDEF';

interface FakeData {
  code: string;
  bits: string;
  line: string;     // svg polyline points
  area: string;     // svg polygon (filled) points
  dots: { x: number; y: number }[];
  bars: { x: number; h: number }[];
}

function generateFakeData(seed: number): FakeData {
  const rand = mkRand(seed * 9176 + 13);
  const W = 116, H = 54, baseY = 46;
  // code label
  let code = '';
  for (let i = 0; i < 4; i++) code += HEX[Math.floor(rand() * 16)];
  // bits
  let bits = '';
  for (let i = 0; i < 8; i++) bits += rand() > 0.5 ? '1' : '0';
  // line graph
  const pts: [number, number][] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x = 6 + (i / (n - 1)) * (W - 12);
    const y = 10 + rand() * (H - 20);
    pts.push([x, y]);
  }
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `6,${baseY} ${line} ${(W - 6).toFixed(1)},${baseY}`;
  // dots
  const dots = Array.from({ length: 5 }, () => ({
    x: 6 + rand() * (W - 12),
    y: 8 + rand() * (H - 16),
  }));
  // bars
  const bars = Array.from({ length: 6 }, (_, i) => ({
    x: 8 + i * 18,
    h: 4 + rand() * 22,
  }));
  return { code, bits, line, area, dots, bars };
}

function FakeCard({ data }: { data: FakeData }) {
  const W = 116, H = 54, baseY = 46;
  return (
    <div className="fake-node">
      <div className="fake-node-head">
        <span className="fake-dot" />
        <span>SYS://0x{data.code}</span>
      </div>
      <svg className="fake-node-svg" viewBox={`0 0 ${W} ${H}`} width="100%" height="54">
        {/* faint gridlines */}
        {[0.25, 0.5, 0.75].map((g, i) => (
          <line key={i} x1="4" x2={W - 4} y1={6 + g * (H - 12)} y2={6 + g * (H - 12)}
            stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        ))}
        {/* mini bars */}
        {data.bars.map((b, i) => (
          <rect key={i} x={b.x} y={baseY - b.h} width="6" height={b.h}
            fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
        ))}
        {/* area + line */}
        <polygon points={data.area} fill="rgba(189,239,242,0.08)" />
        <polyline points={data.line} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" />
        {/* dots */}
        {data.dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1.6" fill="rgba(255,255,255,0.9)" />
        ))}
      </svg>
      <div className="fake-node-foot">{data.bits}</div>
    </div>
  );
}

interface FakeNodeProps {
  basePos: THREE.Vector3;
  seed: number;
  mode: 'scroll' | 'camera';
}

function FakeNode({ basePos, seed, mode }: FakeNodeProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useCardDrag(mode);
  const data = useMemo(() => generateFakeData(seed), [seed]);
  const phase = (seed % 7) * 0.9 + 0.4;

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const fy = Math.sin(t * 0.28 + phase) * 0.28;
    const fx = Math.cos(t * 0.21 + phase) * 0.16;
    g.position.set(
      basePos.x + drag.offset.current.x + fx,
      basePos.y + drag.offset.current.y + fy,
      basePos.z + drag.offset.current.z,
    );
    // billboard toward camera
    g.quaternion.copy(camera.quaternion);

    // distance-based fade (visible within ~30 units)
    const dist = camera.position.distanceTo(g.position);
    const op = Math.max(0, Math.min(1, 1 - (dist - 9) / 22));
    g.scale.setScalar(0.7 + op * 0.35);

    const el = wrapRef.current;
    if (el) {
      el.style.opacity = String(op * 0.92);
      el.style.pointerEvents = mode === 'camera' && op > 0.12 ? 'auto' : 'none';
      el.style.cursor = mode === 'camera' ? 'grab' : 'default';
    }
  });

  return (
    <group ref={groupRef}>
      <DragWake dirRef={drag.dragDir} activeRef={drag.dragActive} velRef={drag.dragVel} color="#ffffff" count={26} />
      <Html transform distanceFactor={5} zIndexRange={[80, 0]}>
        <div {...drag.handlers} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
          <div ref={wrapRef} style={{ opacity: 0, pointerEvents: 'none' }}>
            <FakeCard data={data} />
          </div>
        </div>
      </Html>
    </group>
  );
}

export function FakeNodes({ mode, count = 12 }: { mode: 'scroll' | 'camera'; count?: number }) {
  const fakes = useMemo(() => {
    const rand = mkRand(1471);
    return Array.from({ length: count }, (_, i) => {
      const tt = 0.04 + (i / count) * 0.92 + (rand() - 0.5) * 0.02;
      const pt = curve.getPoint(Math.max(0.01, Math.min(0.99, tt)));
      const side = rand() > 0.5 ? 1 : -1;
      const pos = new THREE.Vector3(
        pt.x + side * (3.2 + rand() * 6),
        pt.y + (rand() - 0.5) * 7,
        pt.z + (rand() - 0.5) * 7,
      );
      return { pos, seed: i * 31 + 5 };
    });
  }, [count]);

  return (
    <>
      {fakes.map((f, i) => (
        <FakeNode key={i} basePos={f.pos} seed={f.seed} mode={mode} />
      ))}
    </>
  );
}
