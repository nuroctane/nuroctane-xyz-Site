import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { curve } from '../data/path';

function mkRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function makeMat(color: string, opacity: number, emissive = '#061418') {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity: 0.28,
    metalness: 0.06,
    roughness: 0.12,
    transmission: 0.42,
    thickness: 1.2,
    transparent: true,
    opacity,
    side: THREE.FrontSide,
  });
}

interface BlockSpec {
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  rotY: number; rotX: number;
}

function InstanceGroup({ specs, mat }: { specs: BlockSpec[]; mat: THREE.Material }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    specs.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(b.rotX, b.rotY, 0);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [specs, dummy]);
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, specs.length]}
      material={mat}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

// World bounds for scatter
const WORLD_Z_MIN = -190;
const WORLD_Z_MAX = 28;
const WORLD_X_HALF = 40;

// ── Tall thin pillars ─────────────────────────────────────────────────────────
function Pillars() {
  const mat = useMemo(() => makeMat('#1c5f70', 0.80, '#071c24'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(7);
    // Path-corridor pillars — close to path, visible as user passes
    const pathPillars = Array.from({ length: 90 }, (_, i) => {
      const t = 0.005 + (i / 90) * 0.99;
      const pt = curve.getPoint(t);
      const side = rand() > 0.5 ? 1 : -1;
      const h = 5 + rand() * 20;
      const w = 0.16 + rand() * 0.7;
      return {
        x: pt.x + side * (4.5 + rand() * 12),
        y: pt.y + (rand() - 0.5) * 10 - h * 0.1,
        z: pt.z + (rand() - 0.5) * 6,
        w, h, d: w * (0.5 + rand() * 1.0),
        rotY: (rand() - 0.5) * 0.5, rotX: (rand() - 0.5) * 0.05,
      };
    });
    // World-scattered pillars — spread far and wide for openness
    const worldPillars = Array.from({ length: 160 }, () => {
      const h = 6 + rand() * 28;
      const w = 0.12 + rand() * 0.85;
      return {
        x: (rand() - 0.5) * WORLD_X_HALF * 2,
        y: (rand() - 0.5) * 14 - h * 0.1,
        z: WORLD_Z_MAX + rand() * (WORLD_Z_MIN - WORLD_Z_MAX),
        w, h, d: w * (0.4 + rand() * 1.1),
        rotY: (rand() - 0.5) * 0.5, rotX: (rand() - 0.5) * 0.06,
      };
    });
    return [...pathPillars, ...worldPillars];
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Wide flat platforms ───────────────────────────────────────────────────────
function Platforms() {
  const mat = useMemo(() => makeMat('#0d4a5a', 0.72, '#050f14'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(13);
    const pathPlatforms = Array.from({ length: 60 }, (_, i) => {
      const t = 0.005 + (i / 60) * 0.99;
      const pt = curve.getPoint(t);
      const side = rand() > 0.5 ? 1 : -1;
      return {
        x: pt.x + side * (2.0 + rand() * 10),
        y: pt.y + (rand() - 0.5) * 10 - 2.5,
        z: pt.z + (rand() - 0.5) * 7,
        w: 1.5 + rand() * 7.0,
        h: 0.12 + rand() * 0.7,
        d: 0.8 + rand() * 4.5,
        rotY: (rand() - 0.5) * 0.6, rotX: (rand() - 0.5) * 0.07,
      };
    });
    const worldPlatforms = Array.from({ length: 90 }, () => ({
      x: (rand() - 0.5) * WORLD_X_HALF * 2,
      y: (rand() - 0.5) * 16 - 2,
      z: WORLD_Z_MAX + rand() * (WORLD_Z_MIN - WORLD_Z_MAX),
      w: 1.5 + rand() * 9.0,
      h: 0.1 + rand() * 0.65,
      d: 0.8 + rand() * 5.0,
      rotY: (rand() - 0.5) * 0.7, rotX: (rand() - 0.5) * 0.08,
    }));
    return [...pathPlatforms, ...worldPlatforms];
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Medium cubic blocks ───────────────────────────────────────────────────────
function MediumBlocks() {
  const mat = useMemo(() => makeMat('#175870', 0.84, '#060e1c'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(29);
    const pathBlocks = Array.from({ length: 80 }, (_, i) => {
      const t = 0.005 + (i / 80) * 0.99;
      const pt = curve.getPoint(t);
      const side = rand() > 0.5 ? 1 : -1;
      return {
        x: pt.x + side * (2.5 + rand() * 11) + (rand() - 0.5) * 2,
        y: pt.y + (rand() - 0.5) * 8,
        z: pt.z + (rand() - 0.5) * 7,
        w: 0.4 + rand() * 2.8,
        h: 0.6 + rand() * 6.0,
        d: 0.3 + rand() * 2.5,
        rotY: (rand() - 0.5) * Math.PI * 0.35, rotX: (rand() - 0.5) * 0.09,
      };
    });
    const worldBlocks = Array.from({ length: 120 }, () => ({
      x: (rand() - 0.5) * WORLD_X_HALF * 2,
      y: (rand() - 0.5) * 14,
      z: WORLD_Z_MAX + rand() * (WORLD_Z_MIN - WORLD_Z_MAX),
      w: 0.4 + rand() * 3.5,
      h: 0.6 + rand() * 7.0,
      d: 0.3 + rand() * 3.0,
      rotY: (rand() - 0.5) * Math.PI * 0.4, rotX: (rand() - 0.5) * 0.1,
    }));
    return [...pathBlocks, ...worldBlocks];
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Massive background monoliths ──────────────────────────────────────────────
function Monoliths() {
  const mat = useMemo(() => makeMat('#0b3040', 0.60, '#030a10'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(61);
    const pathMonoliths = Array.from({ length: 30 }, (_, i) => {
      const t = 0.01 + (i / 30) * 0.98;
      const pt = curve.getPoint(t);
      const side = rand() > 0.5 ? 1 : -1;
      const h = 12 + rand() * 28;
      return {
        x: pt.x + side * (8 + rand() * 16),
        y: pt.y - h * 0.3 + (rand() - 0.5) * 6,
        z: pt.z + (rand() - 0.5) * 4,
        w: 0.9 + rand() * 3.0,
        h,
        d: 0.2 + rand() * 1.5,
        rotY: (rand() - 0.5) * 0.2, rotX: 0,
      };
    });
    const worldMonoliths = Array.from({ length: 50 }, () => {
      const h = 14 + rand() * 34;
      return {
        x: (rand() - 0.5) * WORLD_X_HALF * 2,
        y: -h * 0.35 + (rand() - 0.5) * 4,
        z: WORLD_Z_MAX + rand() * (WORLD_Z_MIN - WORLD_Z_MAX),
        w: 0.7 + rand() * 3.5,
        h,
        d: 0.2 + rand() * 1.8,
        rotY: (rand() - 0.5) * 0.25, rotX: 0,
      };
    });
    return [...pathMonoliths, ...worldMonoliths];
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Far background tower spires — deepest visual layer ────────────────────────
function TowerSpires() {
  const mat = useMemo(() => makeMat('#082030', 0.45, '#020810'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(97);
    return Array.from({ length: 80 }, () => {
      const h = 18 + rand() * 45;
      const w = 0.2 + rand() * 1.2;
      return {
        x: (rand() - 0.5) * 90,
        y: -h * 0.4,
        z: WORLD_Z_MAX + rand() * (WORLD_Z_MIN - WORLD_Z_MAX),
        w, h, d: w * (0.5 + rand() * 0.8),
        rotY: rand() * Math.PI, rotX: 0,
      };
    });
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Floating horizontal slabs — Code Lyoko style platforms ───────────────────
function FloatingSlabs() {
  const mat = useMemo(() => makeMat('#104858', 0.55, '#040e14'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(43);
    return Array.from({ length: 70 }, () => ({
      x: (rand() - 0.5) * 50,
      y: (rand() - 0.5) * 20,
      z: WORLD_Z_MAX + rand() * (WORLD_Z_MIN - WORLD_Z_MAX),
      w: 2 + rand() * 12,
      h: 0.08 + rand() * 0.35,
      d: 1 + rand() * 8,
      rotY: (rand() - 0.5) * Math.PI,
      rotX: (rand() - 0.5) * 0.12,
    }));
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

export function Blocks() {
  return (
    <>
      <TowerSpires />
      <Monoliths />
      <Pillars />
      <FloatingSlabs />
      <Platforms />
      <MediumBlocks />
    </>
  );
}
