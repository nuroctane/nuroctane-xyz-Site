import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '../hooks/use-mobile';
import type { SecondaryMedia } from '../data/secondaryNodes';

// Module-level scratch — never allocate inside useFrame.
const _ringOffset = new THREE.Vector3();
const _worldPos = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _up = new THREE.Vector3(0, 1, 0);
const _qFace = new THREE.Quaternion();
const _qFlip = new THREE.Quaternion(0, 1, 0, 0); // 180° about Y — same convention as main cards
const _qLean = new THREE.Quaternion();
const _zAxis = new THREE.Vector3(0, 0, 1);
const _euler = new THREE.Euler();
const _qRing = new THREE.Quaternion();

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const MOUNT_AT = 0.3;
const UNMOUNT_AT = 0.18;
const RADIUS = 1.75;

interface Props {
  nodeId: string;
  media: SecondaryMedia[];
  centerRef: MutableRefObject<THREE.Vector3>;
  proximityRef: MutableRefObject<number>;
}

export function SecondaryOrbit({ nodeId, media, centerRef, proximityRef }: Props) {
  const isMobile = useIsMobile();

  // A single 90MB gif can decode to far more than its file size, so skip gifs on
  // mobile/low-power devices and show only the static media there.
  const items = useMemo(
    () => (isMobile ? media.filter((m) => !m.isGif) : media),
    [isMobile, media],
  );
  const count = items.length;

  // Deterministic per-node ring orientation + tumble velocities, and per-tile lean.
  const params = useMemo(() => {
    const rnd = mulberry32(hashStr(nodeId));
    const sign = () => (rnd() < 0.5 ? -1 : 1);
    return {
      spinSpeed: (0.12 + rnd() * 0.22) * sign(),
      baseTilt: new THREE.Euler(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI),
      tumbleX: (0.05 + rnd() * 0.16) * sign(),
      tumbleY: (0.05 + rnd() * 0.16) * sign(),
      tumbleZ: (0.05 + rnd() * 0.16) * sign(),
      tiles: Array.from({ length: count }, () => ({
        lean: (rnd() * 2 - 1) * (Math.PI / 4), // ±45° roll — never upright
        radius: RADIUS + (rnd() * 2 - 1) * 0.25,
        phase: rnd() * Math.PI * 2,
      })),
    };
  }, [nodeId, count]);

  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const tileRefs = useRef<(THREE.Group | null)[]>([]);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useFrame(({ camera, clock }) => {
    const p = proximityRef.current;
    // Hysteresis: mount the (potentially heavy) media only when the card is near,
    // unmount once it recedes — so distant gifs never get fetched.
    if (!activeRef.current && p > MOUNT_AT) {
      activeRef.current = true;
      setActive(true);
    } else if (activeRef.current && p < UNMOUNT_AT) {
      activeRef.current = false;
      setActive(false);
    }
    if (!activeRef.current) return;

    const t = clock.elapsedTime;
    // The whole ring plane slowly flips/rotates in every axis.
    _euler.set(
      params.baseTilt.x + t * params.tumbleX,
      params.baseTilt.y + t * params.tumbleY,
      params.baseTilt.z + t * params.tumbleZ,
    );
    _qRing.setFromEuler(_euler);

    const center = centerRef.current;
    const opacity = Math.max(0, Math.min(1, (p - 0.06) / 0.5));

    for (let i = 0; i < count; i++) {
      const g = tileRefs.current[i];
      if (!g) continue;
      const tile = params.tiles[i];
      const angle = (i / count) * Math.PI * 2 + tile.phase + t * params.spinSpeed;
      _ringOffset.set(Math.cos(angle) * tile.radius, Math.sin(angle) * tile.radius, 0);
      _ringOffset.applyQuaternion(_qRing);
      _worldPos.copy(center).add(_ringOffset);
      g.position.copy(_worldPos);

      // Billboard each tile to the camera, then apply a fixed lean so it's never upright.
      _mat4.lookAt(_worldPos, camera.position, _up);
      _qFace.setFromRotationMatrix(_mat4);
      _qFace.multiply(_qFlip);
      _qLean.setFromAxisAngle(_zAxis, tile.lean);
      _qFace.multiply(_qLean);
      g.quaternion.copy(_qFace);

      const w = wrapRefs.current[i];
      if (w) w.style.opacity = String(opacity);
    }
  });

  if (count === 0) return null;

  return (
    <group>
      {active &&
        items.map((m, i) => (
          <group
            key={m.file}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
          >
            <Html transform distanceFactor={4.5} zIndexRange={[30, 0]} prepend>
              <div
                ref={(el) => {
                  wrapRefs.current[i] = el;
                }}
                className="secondary-card"
                style={{ opacity: 0, pointerEvents: 'none' }}
              >
                <img
                  src={m.url}
                  alt=""
                  className="secondary-card-img"
                  draggable={false}
                />
              </div>
            </Html>
          </group>
        ))}
    </group>
  );
}
