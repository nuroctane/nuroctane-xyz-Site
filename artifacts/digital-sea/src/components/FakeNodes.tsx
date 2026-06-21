import { useRef, useMemo, ReactElement } from 'react';
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
const GLYPHS = '⟁⏃⌬⎔⏚⟒⌖◊⟐⏧⎓⍙⌇⟜⍉⌗⏛⟇◈⎌⍜⏥⌬⟑⍫';

function hexCode(rand: () => number, n = 4) {
  let s = '';
  for (let i = 0; i < n; i++) s += HEX[(rand() * 16) | 0];
  return s;
}

const W = 'rgba(255,255,255,';
const stroke = (a: number) => `${W}${a})`;
const fill = (a: number) => `${W}${a})`;

type Kind =
  | 'graph' | 'document' | 'geometric' | 'alien' | 'scribble'
  | 'abstract' | 'sparse' | 'stats' | 'wave' | 'constellation';

// Weighted so the old "graph" look is now just one of many, and the more
// distinctive kinds (document / geometric / alien / abstract / scribble) appear
// often. Variety is the point.
const KIND_BAG: Kind[] = [
  'document', 'document', 'geometric', 'geometric', 'alien', 'alien',
  'abstract', 'abstract', 'scribble', 'scribble', 'sparse', 'sparse',
  'constellation', 'wave', 'stats', 'graph',
];

interface Built {
  width: number;
  vbW: number;
  vbH: number;
  head?: string;
  foot?: string;
  body: ReactElement;
}

function polyPoints(cx: number, cy: number, r: number, n: number, rot = -Math.PI / 2) {
  const p: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    p.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return p.join(' ');
}

function buildGeometric(rand: () => number): ReactElement {
  const shapes = ['cube', 'cylinder', 'pyramid', 'pentagon', 'hexagon', 'octa'];
  const kind = shapes[(rand() * shapes.length) | 0];
  const s = stroke(0.85);
  const f = fill(0.06);
  const sw = 1.2;
  switch (kind) {
    case 'cube': {
      const x = 26, y = 38, sz = 36, d = 16;
      return (
        <g stroke={s} strokeWidth={sw} fill="none">
          <rect x={x + d} y={y - d} width={sz} height={sz} />
          <rect x={x} y={y} width={sz} height={sz} fill={f} />
          <line x1={x} y1={y} x2={x + d} y2={y - d} />
          <line x1={x + sz} y1={y} x2={x + sz + d} y2={y - d} />
          <line x1={x} y1={y + sz} x2={x + d} y2={y + sz - d} />
          <line x1={x + sz} y1={y + sz} x2={x + sz + d} y2={y + sz - d} />
        </g>
      );
    }
    case 'cylinder': {
      const cx = 50, rx = 26, ry = 8, top = 24, bot = 78;
      return (
        <g stroke={s} strokeWidth={sw} fill="none">
          <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill={f} />
          <ellipse cx={cx} cy={bot} rx={rx} ry={ry} />
          <line x1={cx - rx} y1={top} x2={cx - rx} y2={bot} />
          <line x1={cx + rx} y1={top} x2={cx + rx} y2={bot} />
        </g>
      );
    }
    case 'pyramid': {
      return (
        <g stroke={s} strokeWidth={sw} fill="none">
          <polygon points="22,80 78,80 60,66 16,66" fill={f} />
          <line x1={50} y1={18} x2={16} y2={66} />
          <line x1={50} y1={18} x2={60} y2={66} />
          <line x1={50} y1={18} x2={22} y2={80} />
          <line x1={50} y1={18} x2={78} y2={80} />
          <line x1={16} y1={66} x2={60} y2={66} strokeDasharray="3 3" />
        </g>
      );
    }
    case 'pentagon':
      return <polygon points={polyPoints(50, 52, 32, 5)} stroke={s} strokeWidth={sw} fill={f} />;
    case 'hexagon':
      return <polygon points={polyPoints(50, 52, 32, 6)} stroke={s} strokeWidth={sw} fill={f} />;
    default: { // octa / diamond
      return (
        <g stroke={s} strokeWidth={sw} fill="none">
          <polygon points="50,14 78,50 50,86 22,50" fill={f} />
          <polygon points="50,32 66,50 50,68 34,50" />
          <line x1={50} y1={14} x2={50} y2={86} strokeDasharray="3 3" />
          <line x1={22} y1={50} x2={78} y2={50} strokeDasharray="3 3" />
        </g>
      );
    }
  }
}

function buildContent(kind: Kind, seed: number): Built {
  const rand = mkRand(seed * 9176 + 13);

  switch (kind) {
    case 'graph': {
      const vbW = 116, vbH = 54, baseY = 46;
      const n = 9;
      const pts: [number, number][] = [];
      for (let i = 0; i < n; i++) pts.push([6 + (i / (n - 1)) * (vbW - 12), 10 + rand() * (vbH - 20)]);
      const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
      const area = `6,${baseY} ${line} ${(vbW - 6).toFixed(1)},${baseY}`;
      return {
        width: 150, vbW, vbH, head: `0x${hexCode(rand)}`,
        foot: Array.from({ length: 8 }, () => (rand() > 0.5 ? '1' : '0')).join(''),
        body: (
          <g>
            {[0.25, 0.5, 0.75].map((g, i) => (
              <line key={i} x1="4" x2={vbW - 4} y1={6 + g * (vbH - 12)} y2={6 + g * (vbH - 12)} stroke={stroke(0.12)} strokeWidth="0.5" />
            ))}
            {Array.from({ length: 6 }, (_, i) => {
              const h = 4 + rand() * 22;
              return <rect key={`b${i}`} x={8 + i * 18} y={baseY - h} width="6" height={h} fill={fill(0.14)} stroke={stroke(0.5)} strokeWidth="0.5" />;
            })}
            <polygon points={area} fill="rgba(189,239,242,0.08)" />
            <polyline points={line} fill="none" stroke={stroke(0.8)} strokeWidth="1.1" />
            {Array.from({ length: 5 }, (_, i) => (
              <circle key={`d${i}`} cx={6 + rand() * (vbW - 12)} cy={8 + rand() * (vbH - 16)} r="1.6" fill={stroke(0.9)} />
            ))}
          </g>
        ),
      };
    }

    case 'document': {
      const vbW = 104, vbH = 134;
      const rows: ReactElement[] = [];
      let y = 30;
      let k = 0;
      while (y < vbH - 8) {
        if (rand() < 0.12) { y += 10; continue; } // paragraph gap → sparse feel
        const w = 14 + rand() * (vbW - 28);
        rows.push(<rect key={k++} x={9} y={y} width={w} height={3} rx={1.5} fill={fill(0.4)} />);
        y += 9.5;
      }
      return {
        width: 126, vbW, vbH, head: `≡ ${hexCode(rand)}.txt`,
        body: (
          <g>
            <rect x={9} y={10} width={vbW - 18} height={6} rx={2} fill={fill(0.6)} />
            <rect x={9} y={20} width={40} height={3} rx={1.5} fill={fill(0.3)} />
            {rows}
          </g>
        ),
      };
    }

    case 'geometric':
      return { width: 118, vbW: 100, vbH: 100, head: `◇ ${hexCode(rand, 3)}`, body: buildGeometric(rand) };

    case 'alien': {
      const vbW = 112, vbH = 96;
      const rows: ReactElement[] = [];
      const nRows = 4 + ((rand() * 2) | 0);
      for (let r = 0; r < nRows; r++) {
        const cols = 5 + ((rand() * 4) | 0);
        let line = '';
        for (let c = 0; c < cols; c++) line += GLYPHS[(rand() * GLYPHS.length) | 0] + ' ';
        rows.push(
          <text key={r} x={8} y={20 + r * 18} fontFamily="monospace" fontSize="12" letterSpacing="1.5" fill={stroke(0.8)}>{line}</text>,
        );
      }
      return {
        width: 132, vbW, vbH, head: '⟁ SIGNAL',
        body: (
          <g>
            <rect x={6} y={8 + ((rand() * (nRows - 1)) | 0) * 18} width={vbW - 12} height={15} rx={2} fill="none" stroke={stroke(0.3)} strokeWidth="0.6" />
            {rows}
          </g>
        ),
      };
    }

    case 'scribble': {
      const vbW = 120, vbH = 80;
      const squiggle = (yStart: number, op: number) => {
        let x = 10, y = yStart;
        const pts = [`${x},${y}`];
        for (let i = 0; i < 42; i++) {
          x += 2.6; y += (rand() - 0.5) * 16;
          y = Math.max(8, Math.min(vbH - 8, y));
          pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return <polyline points={pts.join(' ')} fill="none" stroke={stroke(op)} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />;
      };
      return {
        width: 138, vbW, vbH, head: '✎ SCRATCH',
        body: <g>{squiggle(vbH * 0.4, 0.8)}{rand() > 0.4 ? squiggle(vbH * 0.62, 0.4) : null}</g>,
      };
    }

    case 'abstract': {
      const vbW = 118, vbH = 100;
      const els: ReactElement[] = [];
      const nPoly = 2 + ((rand() * 2) | 0);
      for (let i = 0; i < nPoly; i++) {
        const cx = 20 + rand() * (vbW - 40), cy = 20 + rand() * (vbH - 40);
        const r = 14 + rand() * 26;
        els.push(<polygon key={`p${i}`} points={polyPoints(cx, cy, r, 3 + ((rand() * 4) | 0), rand() * 6)} fill={fill(0.05 + rand() * 0.08)} stroke={stroke(0.4 + rand() * 0.4)} strokeWidth={0.8} />);
      }
      for (let i = 0; i < 3; i++) {
        els.push(<circle key={`c${i}`} cx={10 + rand() * (vbW - 20)} cy={10 + rand() * (vbH - 20)} r={2 + rand() * 5} fill="none" stroke={stroke(0.6)} strokeWidth={0.8} />);
      }
      for (let i = 0; i < 3; i++) {
        els.push(<line key={`l${i}`} x1={rand() * vbW} y1={rand() * vbH} x2={rand() * vbW} y2={rand() * vbH} stroke={stroke(0.5)} strokeWidth={0.7} />);
      }
      return { width: 134, vbW, vbH, body: <g>{els}</g> };
    }

    case 'sparse': {
      const vbW = 80, vbH = 42;
      return {
        width: 92, vbW, vbH, head: `0x${hexCode(rand, 2)}`,
        body: (
          <g>
            <circle cx={16} cy={vbH / 2} r={3} fill={stroke(0.85)} />
            <line x1={28} y1={vbH / 2} x2={28 + 18 + rand() * 24} y2={vbH / 2} stroke={stroke(0.45)} strokeWidth="1.5" />
            {rand() > 0.5 && <rect x={28} y={vbH / 2 + 7} width={12 + rand() * 20} height={2.5} fill={fill(0.3)} />}
          </g>
        ),
      };
    }

    case 'stats': {
      const vbW = 104, vbH = 70;
      const big = `${(rand() * 99) | 0}.${(rand() * 9) | 0}%`;
      return {
        width: 116, vbW, vbH, head: '▤ STAT',
        body: (
          <g>
            <text x={10} y={36} fontFamily="monospace" fontSize="26" fontWeight="700" fill={stroke(0.9)}>{big}</text>
            <text x={10} y={50} fontFamily="monospace" fontSize="8" letterSpacing="1.5" fill={stroke(0.5)}>NODE_{hexCode(rand, 3)}</text>
            {Array.from({ length: 8 }, (_, i) => {
              const h = 3 + rand() * 12;
              return <rect key={i} x={10 + i * 11} y={64 - h} width={6} height={h} fill={fill(0.5)} />;
            })}
          </g>
        ),
      };
    }

    case 'wave': {
      const vbW = 120, vbH = 56;
      const mkWave = (amp: number, freq: number, ph: number, op: number) => {
        const pts: string[] = [];
        for (let x = 4; x <= vbW - 4; x += 3) {
          const y = vbH / 2 + Math.sin((x / vbW) * Math.PI * 2 * freq + ph) * amp;
          pts.push(`${x},${y.toFixed(1)}`);
        }
        return <polyline points={pts.join(' ')} fill="none" stroke={stroke(op)} strokeWidth="1.2" />;
      };
      return {
        width: 148, vbW, vbH, head: '∿ OSC', foot: `${(2 + rand() * 6).toFixed(2)}kHz`,
        body: (
          <g>
            <line x1="4" y1={vbH / 2} x2={vbW - 4} y2={vbH / 2} stroke={stroke(0.12)} strokeWidth="0.5" />
            {mkWave(8 + rand() * 8, 1 + ((rand() * 3) | 0), rand() * 6, 0.8)}
            {mkWave(5 + rand() * 6, 2 + ((rand() * 3) | 0), rand() * 6, 0.35)}
          </g>
        ),
      };
    }

    default: { // constellation
      const vbW = 116, vbH = 92;
      const n = 7 + ((rand() * 5) | 0);
      const pts = Array.from({ length: n }, () => ({ x: 8 + rand() * (vbW - 16), y: 8 + rand() * (vbH - 16) }));
      const lines: ReactElement[] = [];
      for (let i = 0; i < n; i++) {
        const j = (i + 1 + ((rand() * (n - 1)) | 0)) % n;
        lines.push(<line key={i} x1={pts[i].x} y1={pts[i].y} x2={pts[j].x} y2={pts[j].y} stroke={stroke(0.25)} strokeWidth="0.6" />);
      }
      return {
        width: 138, vbW, vbH, head: '✦ NET',
        body: (
          <g>
            {lines}
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={1.4 + rand() * 1.4} fill={stroke(0.85)} />)}
          </g>
        ),
      };
    }
  }
}

function FakeCard({ built }: { built: Built }) {
  return (
    <div className="fake-node" style={{ width: built.width }} draggable={false}>
      {built.head && (
        <div className="fake-node-head"><span className="fake-dot" /><span>{built.head}</span></div>
      )}
      <svg className="fake-node-svg" viewBox={`0 0 ${built.vbW} ${built.vbH}`} preserveAspectRatio="xMidYMid meet">
        {built.body}
      </svg>
      {built.foot && <div className="fake-node-foot">{built.foot}</div>}
    </div>
  );
}

interface FakeNodeProps {
  basePos: THREE.Vector3;
  seed: number;
  kind: Kind;
  mode: 'scroll' | 'camera';
}

function FakeNode({ basePos, seed, kind, mode }: FakeNodeProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useCardDrag(mode);
  const built = useMemo(() => buildContent(kind, seed), [kind, seed]);
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
    // Always face the camera — these read as flat digital panels from any angle
    g.quaternion.copy(camera.quaternion);

    const dist = camera.position.distanceTo(g.position);
    const op = Math.max(0, Math.min(1, 1 - (dist - 9) / 26));
    g.scale.setScalar(0.7 + op * 0.4);

    const el = wrapRef.current;
    if (el) {
      el.style.opacity = String(op * 0.92);
      el.style.pointerEvents = mode === 'camera' && op > 0.12 ? 'auto' : 'none';
      el.style.cursor = mode === 'camera' ? 'grab' : 'default';
    }
  });

  return (
    <group ref={groupRef}>
      <DragWake dirRef={drag.dragDir} activeRef={drag.dragActive} velRef={drag.dragVel} color="#ffffff" count={24} />
      <Html transform distanceFactor={5} zIndexRange={[80, 0]}>
        <div {...drag.handlers} style={{ userSelect: 'none', WebkitUserSelect: 'none' }} draggable={false}>
          <div ref={wrapRef} style={{ opacity: 0, pointerEvents: 'none' }}>
            <FakeCard built={built} />
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Floating 3D wireframe shapes (ambient "fake geometry" in the sea) ──────────
const SHAPE_FACTORIES: (() => THREE.BufferGeometry)[] = [
  () => new THREE.TetrahedronGeometry(1),
  () => new THREE.OctahedronGeometry(1),
  () => new THREE.IcosahedronGeometry(1),
  () => new THREE.DodecahedronGeometry(0.9),
  () => new THREE.CylinderGeometry(0.7, 0.7, 1.7, 6),
  () => new THREE.CylinderGeometry(0.7, 0.7, 1.7, 5),
  () => new THREE.ConeGeometry(0.9, 1.8, 4),
  () => new THREE.BoxGeometry(1.3, 1.3, 1.3),
  () => new THREE.TorusGeometry(0.8, 0.26, 8, 18),
];

function FakeShape({ basePos, seed }: { basePos: THREE.Vector3; seed: number }) {
  const { camera } = useThree();
  const ref = useRef<THREE.LineSegments>(null);
  const rand = useMemo(() => mkRand(seed * 53 + 7), [seed]);
  const edges = useMemo(() => {
    const base = SHAPE_FACTORIES[(rand() * SHAPE_FACTORIES.length) | 0]();
    const e = new THREE.EdgesGeometry(base);
    base.dispose();
    return e;
  }, [rand]);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }), []);
  const spin = useMemo(() => ({ x: (rand() - 0.5) * 0.2, y: 0.12 + rand() * 0.18, z: (rand() - 0.5) * 0.1 }), [rand]);
  const phase = useMemo(() => rand() * 6, [rand]);

  useFrame(({ clock }, dt) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    m.rotation.x += spin.x * dt;
    m.rotation.y += spin.y * dt;
    m.rotation.z += spin.z * dt;
    m.position.set(basePos.x, basePos.y + Math.sin(t * 0.3 + phase) * 0.4, basePos.z);
    const dist = camera.position.distanceTo(m.position);
    const op = Math.max(0, Math.min(0.55, (1 - (dist - 8) / 30) * 0.55));
    const mm = m.material as THREE.LineBasicMaterial;
    mm.opacity += (op - mm.opacity) * 0.1;
  });

  return <lineSegments ref={ref} geometry={edges} material={mat} frustumCulled={false} />;
}

export function FakeNodes({ mode, count = 14, shapeCount = 7 }: { mode: 'scroll' | 'camera'; count?: number; shapeCount?: number }) {
  const fakes = useMemo(() => {
    const rand = mkRand(1471);
    return Array.from({ length: count }, (_, i) => {
      const tt = 0.04 + (i / count) * 0.92 + (rand() - 0.5) * 0.025;
      const pt = curve.getPoint(Math.max(0.01, Math.min(0.99, tt)));
      const side = rand() > 0.5 ? 1 : -1;
      const pos = new THREE.Vector3(
        pt.x + side * (3.4 + rand() * 7),
        pt.y + (rand() - 0.5) * 8,
        pt.z + (rand() - 0.5) * 8,
      );
      const kind = KIND_BAG[(rand() * KIND_BAG.length) | 0];
      return { pos, seed: i * 31 + 5, kind };
    });
  }, [count]);

  const shapes = useMemo(() => {
    const rand = mkRand(9311);
    return Array.from({ length: shapeCount }, (_, i) => {
      const tt = 0.06 + (i / shapeCount) * 0.88 + (rand() - 0.5) * 0.04;
      const pt = curve.getPoint(Math.max(0.01, Math.min(0.99, tt)));
      const side = rand() > 0.5 ? 1 : -1;
      const pos = new THREE.Vector3(
        pt.x + side * (5 + rand() * 8),
        pt.y + (rand() - 0.5) * 9,
        pt.z + (rand() - 0.5) * 9,
      );
      return { pos, seed: i * 17 + 3 };
    });
  }, [shapeCount]);

  return (
    <>
      {fakes.map((f, i) => (
        <FakeNode key={i} basePos={f.pos} seed={f.seed} kind={f.kind} mode={mode} />
      ))}
      {shapes.map((s, i) => (
        <FakeShape key={`s${i}`} basePos={s.pos} seed={s.seed} />
      ))}
    </>
  );
}
