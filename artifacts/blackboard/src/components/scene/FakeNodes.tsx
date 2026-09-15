import { useRef, useMemo, useEffect, ReactElement } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { curve } from '../../data/path';
import { useCardDrag } from '../../hooks/useCardDrag';
import { DragWake } from './DragWake';
import { mkRand } from './Blocks';
import type { Mode } from '../../types';

const HEX   = '0123456789ABCDEF';
const GLYPHS = '⟁⏃⌬⎔⏚⟒⌖◊⟐⏧⎓⍙⌇⟜⍉⌗⏛⟇◈⎌⍜⏥⌬⟑⍫';

function hexCode(rand: () => number, n = 4) {
  let s = '';
  for (let i = 0; i < n; i++) s += HEX[(rand() * 16) | 0];
  return s;
}

function tealColor(rand: () => number) {
  const h = 148 + rand() * 68;
  const s = 48  + rand() * 44;
  const l = 46  + rand() * 34;
  return {
    color:    `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`,
    glow:     `hsla(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%, 0.35)`,
    glowSoft: `hsla(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%, 0.12)`,
  };
}

type Kind =
  | 'graph' | 'document' | 'geometric' | 'alien' | 'scribble'
  | 'abstract' | 'sparse' | 'stats' | 'wave' | 'constellation';

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
  const kind   = shapes[(rand() * shapes.length) | 0];
  const sw     = 1.2;
  const wrap   = (children: ReactElement) => (
    <g stroke="currentColor" strokeOpacity={0.85} strokeWidth={sw} fill="none">{children}</g>
  );
  const facet = { fill: 'currentColor', fillOpacity: 0.06 } as const;
  switch (kind) {
    case 'cube': {
      const x = 26, y = 38, sz = 36, d = 16;
      return wrap(
        <>
          <rect x={x + d} y={y - d} width={sz} height={sz} />
          <rect x={x} y={y} width={sz} height={sz} {...facet} />
          <line x1={x} y1={y} x2={x + d} y2={y - d} />
          <line x1={x + sz} y1={y} x2={x + sz + d} y2={y - d} />
          <line x1={x} y1={y + sz} x2={x + d} y2={y + sz - d} />
          <line x1={x + sz} y1={y + sz} x2={x + sz + d} y2={y + sz - d} />
        </>,
      );
    }
    case 'cylinder': {
      const cx = 50, rx = 26, ry = 8, top = 24, bot = 78;
      return wrap(
        <>
          <ellipse cx={cx} cy={top} rx={rx} ry={ry} {...facet} />
          <ellipse cx={cx} cy={bot} rx={rx} ry={ry} />
          <line x1={cx - rx} y1={top} x2={cx - rx} y2={bot} />
          <line x1={cx + rx} y1={top} x2={cx + rx} y2={bot} />
        </>,
      );
    }
    case 'pyramid':
      return wrap(
        <>
          <polygon points="22,80 78,80 60,66 16,66" {...facet} />
          <line x1={50} y1={18} x2={16} y2={66} />
          <line x1={50} y1={18} x2={60} y2={66} />
          <line x1={50} y1={18} x2={22} y2={80} />
          <line x1={50} y1={18} x2={78} y2={80} />
          <line x1={16} y1={66} x2={60} y2={66} strokeDasharray="3 3" />
        </>,
      );
    case 'pentagon':
      return wrap(<polygon points={polyPoints(50, 52, 32, 5)} {...facet} />);
    case 'hexagon':
      return wrap(<polygon points={polyPoints(50, 52, 32, 6)} {...facet} />);
    default:
      return wrap(
        <>
          <polygon points="50,14 78,50 50,86 22,50" {...facet} />
          <polygon points="50,32 66,50 50,68 34,50" />
          <line x1={50} y1={14} x2={50} y2={86} strokeDasharray="3 3" />
          <line x1={22} y1={50} x2={78} y2={50} strokeDasharray="3 3" />
        </>,
      );
  }
}

function buildContent(kind: Kind, seed: number): Built {
  const rand = mkRand(seed * 9176 + 13);

  switch (kind) {
    case 'graph': {
      const vbW = 116, vbH = 54, baseY = 46;
      const n   = 9;
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
              <line key={i} x1="4" x2={vbW - 4} y1={6 + g * (vbH - 12)} y2={6 + g * (vbH - 12)} stroke="currentColor" strokeOpacity={0.12} strokeWidth="0.5" />
            ))}
            {Array.from({ length: 6 }, (_, i) => {
              const h = 4 + rand() * 22;
              return <rect key={`b${i}`} x={8 + i * 18} y={baseY - h} width="6" height={h} fill="currentColor" fillOpacity={0.14} stroke="currentColor" strokeOpacity={0.5} strokeWidth="0.5" />;
            })}
            <polygon points={area} fill="currentColor" fillOpacity={0.09} />
            <polyline points={line} fill="none" stroke="currentColor" strokeOpacity={0.85} strokeWidth="1.1" />
            {Array.from({ length: 5 }, (_, i) => (
              <circle key={`d${i}`} cx={6 + rand() * (vbW - 12)} cy={8 + rand() * (vbH - 16)} r="1.6" fill="currentColor" fillOpacity={0.9} />
            ))}
          </g>
        ),
      };
    }

    case 'document': {
      const vbW = 104, vbH = 134;
      const rows: ReactElement[] = [];
      let y = 30, k = 0;
      while (y < vbH - 8) {
        if (rand() < 0.12) { y += 10; continue; }
        const w = 14 + rand() * (vbW - 28);
        rows.push(<rect key={k++} x={9} y={y} width={w} height={3} rx={1.5} fill="currentColor" fillOpacity={0.4} />);
        y += 9.5;
      }
      return {
        width: 126, vbW, vbH, head: `≡ ${hexCode(rand)}.txt`,
        body: (
          <g>
            <rect x={9} y={10} width={vbW - 18} height={6} rx={2} fill="currentColor" fillOpacity={0.6} />
            <rect x={9} y={20} width={40} height={3} rx={1.5} fill="currentColor" fillOpacity={0.3} />
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
          <text key={r} x={8} y={20 + r * 18} fontFamily="monospace" fontSize="12" letterSpacing="1.5" fill="currentColor" fillOpacity={0.82}>{line}</text>,
        );
      }
      return {
        width: 132, vbW, vbH, head: '⟁ SIGNAL',
        body: (
          <g>
            <rect x={6} y={8 + ((rand() * (nRows - 1)) | 0) * 18} width={vbW - 12} height={15} rx={2} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth="0.6" />
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
        return <polyline points={pts.join(' ')} fill="none" stroke="currentColor" strokeOpacity={op} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />;
      };
      return {
        width: 138, vbW, vbH, head: '✎ SCRATCH',
        body: <g>{squiggle(vbH * 0.4, 0.85)}{rand() > 0.4 ? squiggle(vbH * 0.62, 0.4) : null}</g>,
      };
    }

    case 'abstract': {
      const vbW = 118, vbH = 100;
      const els: ReactElement[] = [];
      const nPoly = 2 + ((rand() * 2) | 0);
      for (let i = 0; i < nPoly; i++) {
        const cx = 20 + rand() * (vbW - 40), cy = 20 + rand() * (vbH - 40);
        const r  = 14 + rand() * 26;
        els.push(<polygon key={`p${i}`} points={polyPoints(cx, cy, r, 3 + ((rand() * 4) | 0), rand() * 6)} fill="currentColor" fillOpacity={0.05 + rand() * 0.08} stroke="currentColor" strokeOpacity={0.4 + rand() * 0.4} strokeWidth={0.8} />);
      }
      for (let i = 0; i < 3; i++) {
        els.push(<circle key={`c${i}`} cx={10 + rand() * (vbW - 20)} cy={10 + rand() * (vbH - 20)} r={2 + rand() * 5} fill="none" stroke="currentColor" strokeOpacity={0.6} strokeWidth={0.8} />);
      }
      for (let i = 0; i < 3; i++) {
        els.push(<line key={`l${i}`} x1={rand() * vbW} y1={rand() * vbH} x2={rand() * vbW} y2={rand() * vbH} stroke="currentColor" strokeOpacity={0.5} strokeWidth={0.7} />);
      }
      return { width: 134, vbW, vbH, body: <g>{els}</g> };
    }

    case 'sparse': {
      const vbW = 80, vbH = 42;
      return {
        width: 92, vbW, vbH, head: `0x${hexCode(rand, 2)}`,
        body: (
          <g>
            <circle cx={16} cy={vbH / 2} r={3} fill="currentColor" fillOpacity={0.85} />
            <line x1={28} y1={vbH / 2} x2={28 + 18 + rand() * 24} y2={vbH / 2} stroke="currentColor" strokeOpacity={0.45} strokeWidth="1.5" />
            {rand() > 0.5 && <rect x={28} y={vbH / 2 + 7} width={12 + rand() * 20} height={2.5} fill="currentColor" fillOpacity={0.3} />}
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
            <text x={10} y={36} fontFamily="monospace" fontSize="26" fontWeight="700" fill="currentColor" fillOpacity={0.9}>{big}</text>
            <text x={10} y={50} fontFamily="monospace" fontSize="8" letterSpacing="1.5" fill="currentColor" fillOpacity={0.5}>NODE_{hexCode(rand, 3)}</text>
            {Array.from({ length: 8 }, (_, i) => {
              const h = 3 + rand() * 12;
              return <rect key={i} x={10 + i * 11} y={64 - h} width={6} height={h} fill="currentColor" fillOpacity={0.5} />;
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
        return <polyline points={pts.join(' ')} fill="none" stroke="currentColor" strokeOpacity={op} strokeWidth="1.2" />;
      };
      return {
        width: 148, vbW, vbH, head: '∿ OSC', foot: `${(2 + rand() * 6).toFixed(2)}kHz`,
        body: (
          <g>
            <line x1="4" y1={vbH / 2} x2={vbW - 4} y2={vbH / 2} stroke="currentColor" strokeOpacity={0.12} strokeWidth="0.5" />
            {mkWave(8 + rand() * 8, 1 + ((rand() * 3) | 0), rand() * 6, 0.85)}
            {mkWave(5 + rand() * 6, 2 + ((rand() * 3) | 0), rand() * 6, 0.35)}
          </g>
        ),
      };
    }

    default: { // constellation
      const vbW = 116, vbH = 92;
      const n   = 7 + ((rand() * 5) | 0);
      const pts = Array.from({ length: n }, () => ({ x: 8 + rand() * (vbW - 16), y: 8 + rand() * (vbH - 16) }));
      const lines: ReactElement[] = [];
      for (let i = 0; i < n; i++) {
        const j = (i + 1 + ((rand() * (n - 1)) | 0)) % n;
        lines.push(<line key={i} x1={pts[i].x} y1={pts[i].y} x2={pts[j].x} y2={pts[j].y} stroke="currentColor" strokeOpacity={0.25} strokeWidth="0.6" />);
      }
      return {
        width: 138, vbW, vbH, head: '✦ NET',
        body: (
          <g>
            {lines}
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={1.4 + rand() * 1.4} fill="currentColor" fillOpacity={0.85} />)}
          </g>
        ),
      };
    }
  }
}

function FakeCard({ built, color, glow, glowSoft }: { built: Built; color: string; glow: string; glowSoft: string }) {
  return (
    <div
      className="fake-node"
      draggable={false}
      style={{
        width: built.width,
        color,
        borderColor: color,
        boxShadow: `0 0 16px ${glow}, inset 0 0 10px ${glowSoft}`,
      }}
    >
      {built.head && (
        <div className="fake-node-head" style={{ color }}>
          <span className="fake-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          <span>{built.head}</span>
        </div>
      )}
      <svg className="fake-node-svg" viewBox={`0 0 ${built.vbW} ${built.vbH}`} preserveAspectRatio="xMidYMid meet">
        {built.body}
      </svg>
      {built.foot && <div className="fake-node-foot" style={{ color, opacity: 0.7 }}>{built.foot}</div>}
    </div>
  );
}

interface FakeNodeProps {
  basePos: THREE.Vector3;
  seed:    number;
  kind:    Kind;
  mode:    Mode;
}

function FakeNode({ basePos, seed, kind, mode }: FakeNodeProps) {
  const { camera } = useThree();
  const groupRef   = useRef<THREE.Group>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const drag       = useCardDrag(mode);
  const built      = useMemo(() => buildContent(kind, seed), [kind, seed]);
  const palette    = useMemo(() => tealColor(mkRand(seed * 7 + 91)), [seed]);
  const baseOpacity = useMemo(() => 0.5 + mkRand(seed * 3 + 41)() * 0.45, [seed]);
  const panelScale = useMemo(() => 0.72 + mkRand(seed * 5 + 67)() * 0.78, [seed]);
  const phase = (seed % 7) * 0.9 + 0.4;
  const prevOp = useRef(0);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;

    // Distance-based early exit: if the card is far from camera and already
    // fully faded out, skip all per-frame math. This saves ~40 cards per frame.
    const approxDist = camera.position.distanceTo(basePos);
    if (approxDist > 40 && prevOp.current < 0.01) return;

    const t  = clock.elapsedTime;
    const fy = Math.sin(t * 0.28 + phase) * 0.28;
    const fx = Math.cos(t * 0.21 + phase) * 0.16;
    g.position.set(
      basePos.x + drag.offset.current.x + fx,
      basePos.y + drag.offset.current.y + fy,
      basePos.z + drag.offset.current.z,
    );
    g.quaternion.copy(camera.quaternion);

    const dist = approxDist;
    const op   = Math.max(0, Math.min(1, 1 - (dist - 9) / 26));
    prevOp.current = op;
    g.scale.setScalar((0.7 + op * 0.4) * panelScale);

    const el = wrapRef.current;
    if (el) {
      el.style.opacity       = String(op * baseOpacity);
      el.style.pointerEvents = mode === 'camera' && op > 0.12 ? 'auto' : 'none';
      el.style.cursor        = mode === 'camera' ? 'grab' : 'default';
    }
  });

  return (
    <group ref={groupRef}>
      <DragWake dirRef={drag.dragDir} activeRef={drag.dragActive} velRef={drag.dragVel} color={palette.color} count={24} />
      <Html transform distanceFactor={5} zIndexRange={[80, 0]}>
        <div {...drag.handlers} style={{ userSelect: 'none', WebkitUserSelect: 'none' }} draggable={false}>
          <div ref={wrapRef} style={{ opacity: 0, pointerEvents: 'none' }}>
            <FakeCard built={built} color={palette.color} glow={palette.glow} glowSoft={palette.glowSoft} />
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Floating 3D wireframe shapes & sea creatures ──────────────────────────────
type SwimStyle = 'fish' | 'jelly' | 'eel' | 'manta';
interface Part     { geom: THREE.BufferGeometry; pos?: [number, number, number]; rot?: [number, number, number]; scale?: [number, number, number]; }
interface ShapeDef { parts: Part[]; creature: boolean; swim?: SwimStyle; }

function edgesOf(base: THREE.BufferGeometry): THREE.BufferGeometry {
  const e = new THREE.EdgesGeometry(base);
  base.dispose();
  return e;
}

function lineGeo(pts: number[]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function fishDef(rand: () => number): ShapeDef {
  const len = 1.5 + rand() * 0.7;
  return {
    creature: true, swim: 'fish',
    parts: [
      { geom: edgesOf(new THREE.OctahedronGeometry(0.72)), scale: [len, 0.78 + rand() * 0.2, 0.52] },
      { geom: edgesOf(new THREE.ConeGeometry(0.5, 0.95, 4)), pos: [-(len * 0.62 + 0.18), 0, 0], rot: [0, 0, -Math.PI / 2], scale: [1, 0.85, 0.45] },
    ],
  };
}

function jellyDef(rand: () => number): ShapeDef {
  const n = 5, segs = 6;
  const pos: number[] = [];
  for (let k = 0; k < n; k++) {
    const ang = (k / n) * Math.PI * 2;
    let px = Math.cos(ang) * 0.62, py = 0.05, pz = Math.sin(ang) * 0.62;
    for (let s = 0; s < segs; s++) {
      const nx = Math.cos(ang) * 0.62 + Math.sin(s * 0.9 + k) * 0.13;
      const ny = py - 0.22;
      const nz = Math.sin(ang) * 0.62 + Math.cos(s * 0.7 + k) * 0.1;
      pos.push(px, py, pz, nx, ny, nz);
      px = nx; py = ny; pz = nz;
    }
  }
  return {
    creature: true, swim: 'jelly',
    parts: [
      { geom: edgesOf(new THREE.SphereGeometry(0.85, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2)), pos: [0, 0.2, 0] },
      { geom: lineGeo(pos), pos: [0, 0.15, 0] },
    ],
  };
}

function mantaDef(): ShapeDef {
  return {
    creature: true, swim: 'manta',
    parts: [
      { geom: edgesOf(new THREE.OctahedronGeometry(1)), scale: [1.7, 0.22, 1.3] },
      { geom: lineGeo([-1.3, 0, 0, -2.5, 0.05, 0]) },
    ],
  };
}

function eelDef(rand: () => number): ShapeDef {
  const pos: number[] = [];
  let x = -1.9, py = 0, pz = 0;
  for (let i = 0; i < 15; i++) {
    const nx = x + 0.26;
    const ny = Math.sin(i * 0.6 + rand()) * 0.26;
    const nz = Math.cos(i * 0.5) * 0.12;
    pos.push(x, py, pz, nx, ny, nz);
    x = nx; py = ny; pz = nz;
  }
  return { creature: true, swim: 'eel', parts: [{ geom: lineGeo(pos) }] };
}

const SHAPE_BUILDERS: ((rand: () => number) => ShapeDef)[] = [
  () => ({ creature: false, parts: [{ geom: edgesOf(new THREE.TetrahedronGeometry(1)) }] }),
  () => ({ creature: false, parts: [{ geom: edgesOf(new THREE.OctahedronGeometry(1)) }] }),
  () => ({ creature: false, parts: [{ geom: edgesOf(new THREE.IcosahedronGeometry(1)) }] }),
  () => ({ creature: false, parts: [{ geom: edgesOf(new THREE.DodecahedronGeometry(0.9)) }] }),
  () => ({ creature: false, parts: [{ geom: edgesOf(new THREE.CylinderGeometry(0.7, 0.7, 1.7, 6)) }] }),
  () => ({ creature: false, parts: [{ geom: edgesOf(new THREE.CylinderGeometry(0.7, 0.7, 1.7, 5)) }] }),
  () => ({ creature: false, parts: [{ geom: edgesOf(new THREE.ConeGeometry(0.9, 1.8, 4)) }] }),
  () => ({ creature: false, parts: [{ geom: edgesOf(new THREE.TorusGeometry(0.8, 0.26, 8, 18)) }] }),
  fishDef, fishDef, fishDef,
  jellyDef, jellyDef,
  mantaDef,
  eelDef, eelDef,
];

function FakeShape({ basePos, seed }: { basePos: THREE.Vector3; seed: number }) {
  const { camera } = useThree();
  const ref   = useRef<THREE.Group>(null);
  const rand  = useMemo(() => mkRand(seed * 53 + 7), [seed]);
  const def   = useMemo(() => SHAPE_BUILDERS[(rand() * SHAPE_BUILDERS.length) | 0](rand), [rand]);
  const palette = useMemo(() => tealColor(rand), [rand]);
  const mat   = useMemo(
    () => new THREE.LineBasicMaterial({ color: new THREE.Color(palette.color), transparent: true, opacity: 0 }),
    [palette.color],
  );
  const cfg = useMemo(() => ({
    spin:   { x: (rand() - 0.5) * 0.28, y: 0.08 + rand() * 0.28, z: (rand() - 0.5) * 0.18 },
    phase:  rand() * 6,
    speed:  0.5 + rand() * 0.6,
    yaw:    rand() > 0.5 ? 0 : Math.PI,
    size:   0.52 + rand() * 1.18,
    maxOp:  0.32 + rand() * 0.5,
  }), [rand]);

  useEffect(() => () => {
    def.parts.forEach(p => p.geom.dispose());
    mat.dispose();
  }, [def, mat]);

  useFrame(({ clock }, dt) => {
    const m = ref.current;
    if (!m) return;

    const approxDist = camera.position.distanceTo(basePos);
    if (approxDist > 65) {
      if (mat.opacity > 0.001) mat.opacity = 0;
      return;
    }

    const t = clock.elapsedTime * cfg.speed + cfg.phase;

    if (def.creature) {
      let pulse = 1;
      switch (def.swim) {
        case 'jelly':
          m.position.set(basePos.x, basePos.y + Math.sin(t) * 0.7, basePos.z);
          m.rotation.set(0, t * 0.25, 0);
          pulse = 1 + Math.sin(t * 1.6) * 0.12;
          break;
        case 'eel':
          m.position.set(basePos.x + Math.sin(t * 0.5) * 1.3, basePos.y + Math.sin(t + cfg.phase) * 0.3, basePos.z + Math.cos(t * 0.4) * 0.8);
          m.rotation.set(0, cfg.yaw + Math.sin(t * 0.8) * 0.4, Math.sin(t * 2.4) * 0.3);
          break;
        case 'manta':
          m.position.set(basePos.x + Math.sin(t * 0.5) * 1.6, basePos.y + Math.sin(t * 0.7 + cfg.phase) * 0.5, basePos.z + Math.cos(t * 0.45) * 1.1);
          m.rotation.set(Math.sin(t * 1.4) * 0.25, cfg.yaw + Math.sin(t * 0.5) * 0.3, 0);
          break;
        default: // fish
          m.position.set(basePos.x + Math.sin(t * 0.6) * 1.4, basePos.y + Math.sin(t * 0.9 + cfg.phase) * 0.35, basePos.z + Math.cos(t * 0.5) * 0.9);
          m.rotation.set(0, cfg.yaw + Math.sin(t) * 0.22, Math.sin(t * 3) * 0.12);
          break;
      }
      m.scale.setScalar(cfg.size * pulse);
    } else {
      m.rotation.x += cfg.spin.x * dt;
      m.rotation.y += cfg.spin.y * dt;
      m.rotation.z += cfg.spin.z * dt;
      m.position.set(basePos.x, basePos.y + Math.sin(t * 0.6) * 0.4, basePos.z);
      m.scale.setScalar(cfg.size);
    }

    // Reuse the distance computed at the top for the opacity calc — but only
    // if the shape hasn't moved (non-creature). Creatures move, so re-measure.
    const dist = def.creature ? camera.position.distanceTo(m.position) : approxDist;
    const op   = Math.max(0, Math.min(cfg.maxOp, (1 - (dist - 8) / 30) * cfg.maxOp));
    mat.opacity += (op - mat.opacity) * 0.1;
  });

  return (
    <group ref={ref}>
      {def.parts.map((p, i) => (
        <lineSegments
          key={i}
          geometry={p.geom}
          material={mat}
          position={p.pos ?? [0, 0, 0]}
          rotation={p.rot ?? [0, 0, 0]}
          scale={p.scale ?? [1, 1, 1]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}

export function FakeNodes({ mode, count = 28, shapeCount = 14 }: { mode: Mode; count?: number; shapeCount?: number }) {
  const fakes = useMemo(() => {
    const rand = mkRand(1471);
    return Array.from({ length: count }, (_, i) => {
      const tt   = 0.04 + (i / count) * 0.92 + (rand() - 0.5) * 0.035;
      const pt   = curve.getPoint(Math.max(0.01, Math.min(0.99, tt)));
      const side = rand() > 0.5 ? 1 : -1;
      const pos  = new THREE.Vector3(
        pt.x + side * (2.8 + rand() * 10.5),
        pt.y + (rand() - 0.5) * 8.5,
        pt.z + (rand() - 0.5) * 5,
      );
      const seed = Math.floor(rand() * 99991 + i * 37);
      const kind = KIND_BAG[(rand() * KIND_BAG.length) | 0];
      return { pos, seed, kind };
    });
  }, [count]);

  const shapes = useMemo(() => {
    const rand = mkRand(2731);
    return Array.from({ length: shapeCount }, (_, i) => {
      const tt   = 0.02 + (i / shapeCount) * 0.96 + (rand() - 0.5) * 0.055;
      const pt   = curve.getPoint(Math.max(0.01, Math.min(0.99, tt)));
      const side = rand() > 0.5 ? 1 : -1;
      const pos  = new THREE.Vector3(
        pt.x + side * (4.5 + rand() * 18),
        pt.y + (rand() - 0.5) * 13,
        pt.z + (rand() - 0.5) * 7,
      );
      const seed = Math.floor(rand() * 99991 + i * 53);
      return { pos, seed };
    });
  }, [shapeCount]);

  return (
    <>
      {fakes.map((f, i) => (
        <FakeNode key={i} basePos={f.pos} seed={f.seed} kind={f.kind} mode={mode} />
      ))}
      {shapes.map((s, i) => (
        <FakeShape key={`sh${i}`} basePos={s.pos} seed={s.seed} />
      ))}
    </>
  );
}
