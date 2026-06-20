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

function makeMat(color: string, opacity: number, emissive = '#000820') {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity: 0.22,
    metalness: 0.04,
    roughness: 0.1,
    transmission: 0.38,
    thickness: 1.0,
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

function InstanceGroup({
  specs,
  mat,
}: {
  specs: BlockSpec[];
  mat: THREE.Material;
}) {
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, specs.length]} material={mat}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

// ── Tall thin pillars ────────────────────────────────────────────────────────
function Pillars() {
  const mat = useMemo(() => makeMat('#0e3566', 0.78, '#050e2a'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(7);
    return Array.from({ length: 80 }, (_, i) => {
      const t = 0.01 + (i / 80) * 0.98;
      const pt = curve.getPoint(t);
      const side = rand() > 0.5 ? 1 : -1;
      const h = 4 + rand() * 14;
      const w = 0.2 + rand() * 0.7;
      return {
        x: pt.x + side * (3.0 + rand() * 6.5),
        y: pt.y + (rand() - 0.5) * 5 - h * 0.1,
        z: pt.z + (rand() - 0.5) * 3,
        w, h, d: w * (0.6 + rand() * 0.8),
        rotY: (rand() - 0.5) * 0.3, rotX: (rand() - 0.5) * 0.04,
      };
    });
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Wide flat platforms ──────────────────────────────────────────────────────
function Platforms() {
  const mat = useMemo(() => makeMat('#0a2a52', 0.70, '#04091a'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(13);
    return Array.from({ length: 50 }, (_, i) => {
      const t = 0.01 + (i / 50) * 0.98;
      const pt = curve.getPoint(t);
      const side = rand() > 0.5 ? 1 : -1;
      return {
        x: pt.x + side * (1.5 + rand() * 5.5),
        y: pt.y + (rand() - 0.5) * 7 - 2,
        z: pt.z + (rand() - 0.5) * 5,
        w: 1.5 + rand() * 5.0,
        h: 0.15 + rand() * 0.6,
        d: 0.8 + rand() * 3.0,
        rotY: (rand() - 0.5) * 0.5, rotX: (rand() - 0.5) * 0.06,
      };
    });
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Medium cubic blocks ──────────────────────────────────────────────────────
function MediumBlocks() {
  const mat = useMemo(() => makeMat('#122860', 0.82, '#050e24'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(29);
    return Array.from({ length: 70 }, (_, i) => {
      const t = 0.01 + (i / 70) * 0.98;
      const pt = curve.getPoint(t);
      const side = rand() > 0.5 ? 1 : -1;
      return {
        x: pt.x + side * (2.0 + rand() * 6.0) + (rand() - 0.5) * 1.5,
        y: pt.y + (rand() - 0.5) * 6,
        z: pt.z + (rand() - 0.5) * 5,
        w: 0.4 + rand() * 2.2,
        h: 0.6 + rand() * 4.5,
        d: 0.3 + rand() * 2.0,
        rotY: (rand() - 0.5) * Math.PI * 0.3, rotX: (rand() - 0.5) * 0.08,
      };
    });
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

// ── Massive deep background monoliths ────────────────────────────────────────
function Monoliths() {
  const mat = useMemo(() => makeMat('#071840', 0.58, '#030812'), []);
  const specs = useMemo<BlockSpec[]>(() => {
    const rand = mkRand(61);
    return Array.from({ length: 24 }, (_, i) => {
      const t = 0.02 + (i / 24) * 0.96;
      const pt = curve.getPoint(t);
      const side = rand() > 0.5 ? 1 : -1;
      const h = 10 + rand() * 22;
      return {
        x: pt.x + side * (6.0 + rand() * 9.0),
        y: pt.y - h * 0.3 + (rand() - 0.5) * 4,
        z: pt.z + (rand() - 0.5) * 2,
        w: 0.8 + rand() * 2.5,
        h,
        d: 0.2 + rand() * 1.2,
        rotY: (rand() - 0.5) * 0.15, rotX: 0,
      };
    });
  }, []);
  return <InstanceGroup specs={specs} mat={mat} />;
}

export function Blocks() {
  return (
    <>
      <Monoliths />
      <Pillars />
      <Platforms />
      <MediumBlocks />
    </>
  );
}
