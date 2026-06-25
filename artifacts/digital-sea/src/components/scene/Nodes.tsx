import { useRef, useMemo, useEffect, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { nodes, NodeData } from '../../data/nodes';
import { NodeCard } from './NodeCard';
import { useCardDrag } from '../../hooks/useCardDrag';
import { DragWake } from './DragWake';
import { secondaryMediaByNode } from '../../data/secondaryNodes';
import { SecondaryOrbit } from './SecondaryNodes';
import type { Mode, Track } from '../../types';

const _mat4    = new THREE.Matrix4();
const _up      = new THREE.Vector3(0, 1, 0);
const _qIdle   = new THREE.Quaternion();
const _qFace   = new THREE.Quaternion();
const _qResult = new THREE.Quaternion();
const _euler   = new THREE.Euler();
const _flipQ   = new THREE.Quaternion(0, 1, 0, 0);

function computeProximity(node: NodeData, t: number): number {
  const mid = (node.scrollStart + node.scrollEnd) / 2;
  // +0.052 padding (vs old +0.032) keeps each card visible for a wider scroll
  // range so successive cards fade into each other rather than flashing briefly
  // one-at-a-time when scrolling backward through the project section.
  const halfRange = (node.scrollEnd - node.scrollStart) / 2 + 0.052;
  return Math.max(0, Math.min(1, 1 - Math.abs(t - mid) / halfRange));
}

// Only fires in the absolute last sliver of scroll (t=0.992 → 1.0) to clean
// up any card geometry at the true scroll terminus. Does NOT affect normal
// backward scrolling or the portal window.
function endFadeMultiplier(t: number): number {
  return Math.max(0, Math.min(1, (1.0 - t) / 0.008));
}

function descOffset(index: number): [number, number, number] {
  return index % 2 === 0 ? [0, 1.9, 0] : [0, -1.9, 0];
}

interface SingleNodeProps {
  node:           NodeData;
  scrollProgress: MutableRefObject<number>;
  index:          number;
  mode:           Mode;
  activeTrack:    Track;
}

function SingleNode({ node, scrollProgress, index, mode, activeTrack }: SingleNodeProps) {
  const groupRef          = useRef<THREE.Group>(null);
  const wrapperRef        = useRef<HTMLDivElement>(null);
  const descWrapperRef    = useRef<HTMLDivElement>(null);
  const hoverRef          = useRef(false);
  const ringRef           = useRef<THREE.Mesh>(null);
  const hoverParticlesRef = useRef<THREE.Points>(null);

  const centerRef    = useRef(new THREE.Vector3());
  const proximityRef = useRef(0);
  const media        = secondaryMediaByNode[node.id];

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const activeTrackRef = useRef(activeTrack);
  activeTrackRef.current = activeTrack;

  const drag        = useCardDrag(mode);
  const dragWrapRef = useRef<HTMLDivElement>(null);

  const phase  = index * 1.374;
  const offset = descOffset(index);

  const hoverGeo = useMemo(() => {
    const count = 36;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle     = (i / count) * Math.PI * 2;
      const r         = 0.7 + Math.random() * 0.6;
      pos[i * 3 + 0] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      pos[i * 3 + 2] = Math.sin(angle) * r * 0.25;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const hoverMat = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color('#bdeff2'),
    size: 0.04, sizeAttenuation: true,
    transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }), []);

  useEffect(() => () => { hoverGeo.dispose(); hoverMat.dispose(); }, [hoverGeo, hoverMat]);

  useFrame(({ camera: cam, clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const onMainTrack =
      modeRef.current === 'scroll' ||
      (modeRef.current === 'camera' && activeTrackRef.current === 'main');

    if (!onMainTrack) {
      group.scale.setScalar(0);
      proximityRef.current = 0;

      const el = wrapperRef.current;
      if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }

      const descEl = descWrapperRef.current;
      if (descEl) descEl.style.opacity = '0';

      const ring = ringRef.current;
      if (ring) (ring.material as THREE.MeshBasicMaterial).opacity = 0;

      const hp = hoverParticlesRef.current;
      if (hp) (hp.material as THREE.PointsMaterial).opacity = 0;

      return;
    }

    const rawT    = scrollProgress.current;
    const p       = computeProximity(node, rawT);

    if (modeRef.current !== 'camera' && p < 0.001 && proximityRef.current < 0.001) return;

    const elapsed = clock.elapsedTime;

    const wobble = 1 - p * 0.80;
    const wobX   = Math.sin(elapsed * 0.52 + phase) * 0.18 * wobble;
    const wobZ   = Math.cos(elapsed * 0.38 + phase * 1.21) * 0.12 * wobble;
    const floatY = Math.sin(elapsed * 0.31 + phase * 0.88) * 0.35 * wobble;

    const ox = drag.offset.current.x;
    const oy = drag.offset.current.y;
    const oz = drag.offset.current.z;
    group.position.set(node.position.x + ox, node.position.y + floatY + oy, node.position.z + oz);
    centerRef.current.copy(group.position);

    _euler.set(node.idleRotation.x + wobX, node.idleRotation.y, node.idleRotation.z + wobZ);
    _qIdle.setFromEuler(_euler);

    _mat4.lookAt(group.position, cam.position, _up);
    _qFace.setFromRotationMatrix(_mat4);

    const isCam   = modeRef.current === 'camera';
    const faceAmt = Math.max(Math.pow(p, 0.55), 0.9);
    _qResult.slerpQuaternions(_qIdle, _qFace, faceAmt);
    _qResult.multiply(_flipQ);
    group.quaternion.copy(_qResult);

    // endFadeMultiplier only fires in the last 0.8% of scroll — no impact on
    // normal backward scrolling or portal zone navigation.
    const eFade      = isCam ? 1 : endFadeMultiplier(rawT);
    const effectiveP = (isCam ? Math.max(p, 0.62) : p) * eFade;
    proximityRef.current = effectiveP;
    group.scale.setScalar(0.5 + effectiveP * 0.5);

    const el = wrapperRef.current;
    if (el) {
      el.style.opacity = String(effectiveP);
      // Threshold 0.22 keeps the last creative card clickable through its full
      // scroll window; effectiveP ensures it disables once end-fade kicks in.
      el.style.pointerEvents = isCam ? 'auto' : (effectiveP > 0.22 ? 'auto' : 'none');
    }

    const descEl = descWrapperRef.current;
    if (descEl) {
      let descP = Math.max(0, Math.min(1, (p - 0.15) / 0.85));
      if (isCam) descP = Math.max(descP, 0.32);
      descEl.style.opacity = String(descP * eFade);
    }

    if (dragWrapRef.current && !drag.isDragging.current) {
      dragWrapRef.current.style.cursor = isCam ? 'grab' : '';
    }

    const ring = ringRef.current;
    if (ring) {
      const mat    = ring.material as THREE.MeshBasicMaterial;
      const target = hoverRef.current ? 0.75 * effectiveP : 0;
      mat.opacity += (target - mat.opacity) * 0.10;
    }

    const hp = hoverParticlesRef.current;
    if (hp) {
      const mat           = hp.material as THREE.PointsMaterial;
      const targetOpacity = hoverRef.current ? 0.85 * effectiveP : 0;
      mat.opacity        += (targetOpacity - mat.opacity) * 0.12;
      hp.rotation.z      += 0.008;
    }
  });

  return (
    <>
      <group ref={groupRef} position={node.position}>
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.88, 0.022, 8, 64]} />
          <meshBasicMaterial
            color="#5de8f0" transparent opacity={0}
            depthWrite={false} blending={THREE.AdditiveBlending}
          />
        </mesh>

        <points ref={hoverParticlesRef} geometry={hoverGeo} material={hoverMat} />

        <DragWake dirRef={drag.dragDir} activeRef={drag.dragActive} velRef={drag.dragVel} />

        <Html transform distanceFactor={4.5} zIndexRange={[100, 0]}>
          <div
            ref={dragWrapRef}
            {...drag.handlers}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <div
              ref={wrapperRef}
              style={{ opacity: 0, pointerEvents: 'none' }}
              onMouseEnter={() => { hoverRef.current = true; }}
              onMouseLeave={() => { hoverRef.current = false; }}
            >
              <NodeCard node={node} />
            </div>
          </div>
        </Html>

        {node.description && (
          <Html
            transform
            distanceFactor={4.5}
            zIndexRange={[90, 0]}
            position={offset}
          >
            <div ref={descWrapperRef} style={{ opacity: 0, pointerEvents: 'none' }}>
              <div className="node-desc-card">
                <p className="node-desc-text">{node.description}</p>
              </div>
            </div>
          </Html>
        )}
      </group>

      {media && media.length > 0 && (
        <SecondaryOrbit
          nodeId={node.id}
          media={media}
          centerRef={centerRef}
          proximityRef={proximityRef}
        />
      )}
    </>
  );
}

export function Nodes({
  scrollProgress,
  mode,
  activeTrack,
}: {
  scrollProgress: MutableRefObject<number>;
  mode: Mode;
  activeTrack: Track;
}) {
  return (
    <>
      {nodes.map((node, i) => (
        <SingleNode
          key={node.id}
          node={node}
          scrollProgress={scrollProgress}
          index={i}
          mode={mode}
          activeTrack={activeTrack}
        />
      ))}
    </>
  );
}
