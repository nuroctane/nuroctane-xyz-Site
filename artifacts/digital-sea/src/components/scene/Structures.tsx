import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { curve } from '../../data/path';
import { makeMat, mkRand, InstanceGroup, BlockSpec } from './Blocks';
import type { PerformanceTier } from '../../hooks/usePerformanceTier';
import { WORLD_Z_MIN, WORLD_Z_MAX } from '../../constants';

// Rotate a local (lx, lz) offset around Y by angle a → world XZ delta
function rotXZ(lx: number, lz: number, a: number): [number, number] {
  const ca = Math.cos(a), sa = Math.sin(a);
  return [lx * ca - lz * sa, lx * sa + lz * ca];
}

// ── Cascading blocky bridges ──────────────────────────────────────────────────
function buildBridge(cx: number, cy: number, cz: number, len: number, ang: number): BlockSpec[] {
  const specs: BlockSpec[] = [];
  const seg    = 9;
  const segLen = len / seg;
  for (let i = 0; i < seg; i++) {
    const lx       = (i - (seg - 1) / 2) * segLen;
    const [dx, dz] = rotXZ(lx, 0, ang);
    specs.push({ x: cx + dx, y: cy, z: cz + dz, w: segLen * 1.04, h: 0.32, d: 2.6, rotY: ang, rotX: 0 });
    for (const side of [-1, 1]) {
      const [rx, rz] = rotXZ(lx, side * 1.2, ang);
      specs.push({ x: cx + rx, y: cy + 0.5, z: cz + rz, w: segLen * 1.04, h: 0.62, d: 0.14, rotY: ang, rotX: 0 });
    }
  }
  for (const f of [-0.34, 0.34]) {
    const [dx, dz] = rotXZ(f * len, 0, ang);
    const h = 7 + Math.random() * 6;
    specs.push({ x: cx + dx, y: cy - h / 2 - 0.2, z: cz + dz, w: 0.55, h, d: 0.55, rotY: ang, rotX: 0 });
  }
  return specs;
}

function Bridges() {
  const mat   = useMemo(() => makeMat('#1c5f70', 0.80, '#071c24'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand    = mkRand(503);
    const out: BlockSpec[] = [];
    const anchors = [0.16, 0.38, 0.58, 0.78];
    anchors.forEach((tt, i) => {
      const pt   = curve.getPoint(tt);
      const side = i % 2 === 0 ? 1 : -1;
      const cx   = pt.x + side * (6 + rand() * 4);
      const cy   = pt.y + 3 - i * 1.6 + (rand() - 0.5) * 2;
      const cz   = pt.z + (rand() - 0.5) * 6;
      const len  = 12 + rand() * 8;
      const ang  = side * (0.5 + rand() * 0.5);
      out.push(...buildBridge(cx, cy, cz, len, ang));
    });
    return out;
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Cascading blocky stairs ───────────────────────────────────────────────────
function buildStairs(cx: number, cy: number, cz: number, steps: number, ang: number, dir = 1): BlockSpec[] {
  const specs: BlockSpec[] = [];
  const stepD = 0.9, stepH = 0.7;
  for (let i = 0; i < steps; i++) {
    const lx       = i * stepD * dir;
    const [dx, dz] = rotXZ(lx, 0, ang);
    specs.push({ x: cx + dx, y: cy + i * stepH, z: cz + dz, w: 2.4, h: stepH, d: stepD * 1.02, rotY: ang, rotX: 0 });
  }
  return specs;
}

function Stairs() {
  const mat   = useMemo(() => makeMat('#175870', 0.84, '#060e1c'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand    = mkRand(617);
    const out: BlockSpec[] = [];
    const anchors = [0.10, 0.30, 0.50, 0.70, 0.90];
    anchors.forEach((tt, i) => {
      const pt   = curve.getPoint(tt);
      const side = i % 2 === 0 ? -1 : 1;
      const cx   = pt.x + side * (7 + rand() * 6);
      const cy   = pt.y - 4 + (rand() - 0.5) * 3;
      const cz   = pt.z + (rand() - 0.5) * 8;
      const ang  = side * (0.6 + rand() * 0.7);
      out.push(...buildStairs(cx, cy, cz, 7 + Math.floor(rand() * 4), ang, side));
    });
    return out;
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Floating blocky ships ─────────────────────────────────────────────────────
function buildShip(cx: number, cy: number, cz: number, ang: number, scale = 1): BlockSpec[] {
  const s     = scale;
  const specs: BlockSpec[] = [];
  const put = (lx: number, ly: number, lz: number, w: number, h: number, d: number) => {
    const [dx, dz] = rotXZ(lx * s, lz * s, ang);
    specs.push({ x: cx + dx, y: cy + ly * s, z: cz + dz, w: w * s, h: h * s, d: d * s, rotY: ang, rotX: 0 });
  };
  put(0,    0,   0,  5.4, 0.8, 1.8);
  put(0,   -0.7, 0,  4.0, 0.7, 1.2);
  put(0,    0.7, 0,  5.0, 0.5, 1.6);
  put(-1.0, 1.4, 0,  1.6, 1.0, 1.0);
  put(0.8,  2.4, 0,  0.22, 3.2, 0.22);
  put(0.8,  3.4, 0,  0.22, 0.22, 2.4);
  put(0.8,  2.8, 0,  1.8, 1.2, 0.08);
  put(2.9,  0.4, 0,  1.6, 0.18, 0.18);
  return specs;
}

function Ships() {
  const mat   = useMemo(() => makeMat('#104858', 0.72, '#040e14'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand    = mkRand(733);
    const out: BlockSpec[] = [];
    const anchors = [0.22, 0.5, 0.82];
    anchors.forEach((tt, i) => {
      const pt   = curve.getPoint(tt);
      const side = i % 2 === 0 ? 1 : -1;
      const cx   = pt.x + side * (10 + rand() * 6);
      const cy   = pt.y + 7 + rand() * 5;
      const cz   = pt.z + (rand() - 0.5) * 10;
      const ang  = rand() * Math.PI;
      out.push(...buildShip(cx, cy, cz, ang, 0.9 + rand() * 0.5));
    });
    return out;
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Animated snakes ───────────────────────────────────────────────────────────
function Snakes() {
  const mat    = useMemo(() => makeMat('#1c5f70', 0.86, '#071c24'), []);
  const ref    = useRef<THREE.InstancedMesh>(null);
  const dummy  = useMemo(() => new THREE.Object3D(), []);
  const _frame = useRef(0);
  const SEG    = 14;
  const snakes = useMemo(() => {
    const rand = mkRand(211);
    return Array.from({ length: 5 }, () => ({
      cx:     (rand() - 0.5) * 44,
      cy:     (rand() - 0.5) * 16,
      cz:     WORLD_Z_MAX - rand() * (WORLD_Z_MAX - WORLD_Z_MIN),
      radius: 8 + rand() * 6,
      speed:  0.5 + rand() * 0.5,
      phase:  rand() * Math.PI * 2,
      size:   0.42 + rand() * 0.58,
      bob:    1.0 + rand() * 1.0,
    }));
  }, []);
  const COUNT = snakes.length * SEG;

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh || ++_frame.current % 4 !== 0) return;
    const t   = clock.elapsedTime;
    let   idx = 0;
    for (const s of snakes) {
      for (let i = 0; i < SEG; i++) {
        const ang = t * 0.05 * s.speed + s.phase - i * 0.20;
        const bx  = s.cx + Math.cos(ang) * s.radius;
        const bz  = s.cz + Math.sin(ang) * s.radius;
        const by  = s.cy + Math.sin(t * 0.2 + s.phase - i * 0.3) * s.bob + Math.sin(t * 1.6 - i * 0.6) * 0.3;
        dummy.position.set(bx, by, bz);
        const sc = s.size * (1 - i * 0.035);
        dummy.scale.set(sc, sc, sc);
        dummy.rotation.set(0, -ang + Math.PI / 2, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} material={mat} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

// ── Animated fish ─────────────────────────────────────────────────────────────
function Fish() {
  const mat    = useMemo(() => makeMat('#175870', 0.85, '#060e1c'), []);
  const ref    = useRef<THREE.InstancedMesh>(null);
  const dummy  = useMemo(() => new THREE.Object3D(), []);
  const _frame = useRef(0);
  const PARTS  = 5;
  const fish   = useMemo(() => {
    const rand = mkRand(307);
    return Array.from({ length: 15 }, () => ({
      px:      (rand() - 0.5) * 50,
      py:      (rand() - 0.5) * 18,
      pz:      WORLD_Z_MAX - rand() * (WORLD_Z_MAX - WORLD_Z_MIN),
      heading: rand() * Math.PI * 2,
      speed:   1.2 + rand() * 1.4,
      size:    0.32 + rand() * 0.82,
      phase:   rand() * Math.PI * 2,
    }));
  }, []);
  const COUNT = fish.length * PARTS;

  useFrame(({ clock }, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (++_frame.current % 4 !== 0) return;
    const t    = clock.elapsedTime;
    const step = Math.min(dt * 2, 0.1);
    let   idx  = 0;
    for (const f of fish) {
      const dirX = Math.cos(f.heading);
      const dirZ = Math.sin(f.heading);
      f.px += dirX * f.speed * step;
      f.pz += dirZ * f.speed * step;
      if (f.px >  30) f.px = -30; else if (f.px < -30) f.px = 30;
      if (f.pz > WORLD_Z_MAX) f.pz = WORLD_Z_MIN; else if (f.pz < WORLD_Z_MIN) f.pz = WORLD_Z_MAX;
      const py = f.py + Math.sin(t * 0.6 + f.phase) * 1.2;
      for (let i = 0; i < PARTS; i++) {
        const back = i * 0.6 * f.size;
        const wag  = Math.sin(t * 6 + f.phase - i * 0.9) * (0.18 + i * 0.10) * f.size;
        const bx   = f.px - dirX * back - dirZ * wag;
        const bz   = f.pz - dirZ * back + dirX * wag;
        dummy.position.set(bx, py, bz);
        const taper = i < PARTS - 1 ? (1 - i * 0.16) : 0.45;
        const sc    = f.size * taper;
        if (i === PARTS - 1) dummy.scale.set(sc * 0.5, sc * 1.4, sc * 1.4);
        else                  dummy.scale.set(sc * 1.3, sc, sc);
        dummy.rotation.set(0, -f.heading, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} material={mat} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

// ── Animated geometric monsters ───────────────────────────────────────────────
const MONSTER_PARTS: [number, number, number, number, number, number][] = [
  [0, 0, 0, 1.8, 1.8, 1.8],
  [-1.4, -0.2, 0, 0.7, 1.6, 0.7],
  [1.4,  -0.2, 0, 0.7, 1.6, 0.7],
  [0,    -0.2, -1.4, 0.7, 1.4, 0.7],
  [0,    -0.2,  1.4, 0.7, 1.4, 0.7],
  [0,     1.5,  0,   1.0, 1.0, 1.0],
  [0,     1.5,  0.7, 0.4, 0.4, 0.4],
];

function Monsters() {
  const mat    = useMemo(() => makeMat('#0d4a5a', 0.82, '#050f14'), []);
  const ref    = useRef<THREE.InstancedMesh>(null);
  const dummy  = useMemo(() => new THREE.Object3D(), []);
  const parent = useMemo(() => new THREE.Object3D(), []);
  const child  = useMemo(() => new THREE.Object3D(), []);
  const _frame = useRef(0);
  const PARTS  = MONSTER_PARTS.length;
  const monsters = useMemo(() => {
    const rand = mkRand(859);
    return Array.from({ length: 7 }, () => ({
      cx:    (rand() - 0.5) * 40,
      cy:    (rand() - 0.5) * 14 + 2,
      cz:    WORLD_Z_MAX - rand() * (WORLD_Z_MAX - WORLD_Z_MIN),
      phase: rand() * Math.PI * 2,
      spin:  (rand() - 0.5) * 0.4,
      size:  0.55 + rand() * 1.15,
    }));
  }, []);
  const COUNT = monsters.length * PARTS;

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh || ++_frame.current % 4 !== 0) return;
    const t   = clock.elapsedTime;
    let   idx = 0;
    for (const m of monsters) {
      parent.position.set(
        m.cx + Math.sin(t * 0.08 + m.phase) * 2.5,
        m.cy + Math.sin(t * 0.4  + m.phase) * 1.2,
        m.cz + Math.cos(t * 0.08 + m.phase) * 2.5,
      );
      parent.rotation.set(0, t * m.spin + m.phase, 0);
      parent.scale.setScalar(m.size);
      parent.updateMatrix();
      for (const [lx, ly, lz, w, h, d] of MONSTER_PARTS) {
        child.position.set(lx, ly, lz);
        child.rotation.set(0, 0, 0);
        child.scale.set(w, h, d);
        child.updateMatrix();
        dummy.matrix.multiplyMatrices(parent.matrix, child.matrix);
        mesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} material={mat} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

export function Structures({ tier }: { tier: PerformanceTier }) {
  return (
    <>
      <Bridges />
      <Stairs />
      <Ships />
      <Snakes />
      <Fish />
      {tier !== 'low' && <Monsters />}
    </>
  );
}
