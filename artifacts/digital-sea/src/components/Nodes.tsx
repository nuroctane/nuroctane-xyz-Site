import { useRef, useMemo, useCallback, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { nodes, NodeData } from '../data/nodes';
import { NodeCard } from './NodeCard';

const _mat4 = new THREE.Matrix4();
const _up = new THREE.Vector3(0, 1, 0);
const _qIdle = new THREE.Quaternion();
const _qFace = new THREE.Quaternion();
const _qResult = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _flipQ = new THREE.Quaternion(0, 1, 0, 0);
const _right = new THREE.Vector3();
const _camUp = new THREE.Vector3();

function computeProximity(node: NodeData, t: number): number {
  const mid = (node.scrollStart + node.scrollEnd) / 2;
  const halfRange = (node.scrollEnd - node.scrollStart) / 2 + 0.018;
  return Math.max(0, Math.min(1, 1 - Math.abs(t - mid) / halfRange));
}

function descOffset(index: number): [number, number, number] {
  return index % 2 === 0 ? [0, 1.65, 0] : [0, -1.65, 0];
}

interface SingleNodeProps {
  node: NodeData;
  scrollProgress: MutableRefObject<number>;
  index: number;
  mode: 'scroll' | 'camera';
}

function SingleNode({ node, scrollProgress, index, mode }: SingleNodeProps) {
  const { camera } = useThree();
  const groupRef        = useRef<THREE.Group>(null);
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const descWrapperRef  = useRef<HTMLDivElement>(null);
  const hoverRef        = useRef(false);
  const ringRef         = useRef<THREE.Mesh>(null);
  const hoverParticlesRef = useRef<THREE.Points>(null);

  // Keep mode accessible inside useFrame without stale closure
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Card drag state (explore mode only — resets on refresh)
  const cardOffset    = useRef(new THREE.Vector3());
  const isDragging    = useRef(false);
  const holdTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointer   = useRef({ x: 0, y: 0 });
  const didDrag       = useRef(false);
  const dragWrapRef   = useRef<HTMLDivElement>(null);

  const phase = index * 1.374;
  const offset = descOffset(index);

  const hoverGeo = useMemo(() => {
    const count = 36;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.7 + Math.random() * 0.6;
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

  // ── Card drag handlers (explore mode) ──────────────────────────────────────
  const onDragPointerDown = useCallback((e: React.PointerEvent) => {
    if (mode !== 'camera') return;
    e.stopPropagation();
    didDrag.current = false;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    // Capture refs before the timeout — currentTarget is null after handler returns
    const target = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    holdTimer.current = setTimeout(() => {
      isDragging.current = true;
      didDrag.current = true;
      // Capture pointer so move/up always fire on this element
      try { target.setPointerCapture(pointerId); } catch (_) { /* element may have unmounted */ }
      // Visual feedback: show grab cursor
      if (dragWrapRef.current) dragWrapRef.current.style.cursor = 'grabbing';
    }, 320);
  }, [mode]);

  const onDragPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };

    // Convert screen delta → world space using camera's right & up vectors
    const sensitivity = 0.009;
    camera.getWorldDirection(_right);
    _right.crossVectors(_right, camera.up).normalize();
    _camUp.copy(camera.up).normalize();

    cardOffset.current.addScaledVector(_right, dx * sensitivity);
    cardOffset.current.addScaledVector(_camUp, -dy * sensitivity);
  }, [camera]);

  const onDragPointerUp = useCallback((e: React.PointerEvent) => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    isDragging.current = false;
    if (dragWrapRef.current) dragWrapRef.current.style.cursor = mode === 'camera' ? 'grab' : '';
    // Suppress click if we actually dragged
    if (didDrag.current) e.stopPropagation();
  }, [mode]);

  useFrame(({ camera: cam, clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const t = scrollProgress.current;
    const p = computeProximity(node, t);
    const elapsed = clock.elapsedTime;

    const wobble = 1 - p * 0.80;
    const wobX = Math.sin(elapsed * 0.52 + phase) * 0.18 * wobble;
    const wobZ = Math.cos(elapsed * 0.38 + phase * 1.21) * 0.12 * wobble;
    const floatY = Math.sin(elapsed * 0.31 + phase * 0.88) * 0.35 * wobble;

    // In explore mode, apply the dragged offset to card position
    const ox = cardOffset.current.x;
    const oy = cardOffset.current.y;
    const oz = cardOffset.current.z;
    group.position.set(node.position.x + ox, node.position.y + floatY + oy, node.position.z + oz);

    _euler.set(node.idleRotation.x + wobX, node.idleRotation.y, node.idleRotation.z + wobZ);
    _qIdle.setFromEuler(_euler);

    _mat4.lookAt(group.position, cam.position, _up);
    _qFace.setFromRotationMatrix(_mat4);

    _qResult.slerpQuaternions(_qIdle, _qFace, Math.pow(p, 0.55));
    _qResult.multiply(_flipQ);
    group.quaternion.copy(_qResult);
    // In explore mode, boost scale slightly so all cards remain faintly visible
    const effectiveP = modeRef.current === 'camera' ? Math.max(p, 0.06) : p;
    group.scale.setScalar(0.5 + effectiveP * 0.5);

    // Main card wrapper
    const el = wrapperRef.current;
    if (el) {
      el.style.opacity = String(effectiveP);
      el.style.pointerEvents = p > 0.38 ? 'auto' : 'none';
    }

    // Description card
    const descEl = descWrapperRef.current;
    if (descEl) {
      const descP = Math.max(0, Math.min(1, (p - 0.15) / 0.85));
      descEl.style.opacity = String(descP);
    }

    // Drag wrapper cursor
    if (dragWrapRef.current && !isDragging.current) {
      dragWrapRef.current.style.cursor = mode === 'camera' ? 'grab' : '';
    }

    // Hover ring
    const ring = ringRef.current;
    if (ring) {
      const mat = ring.material as THREE.MeshBasicMaterial;
      const target = hoverRef.current ? 0.75 * p : 0;
      mat.opacity += (target - mat.opacity) * 0.10;
    }

    // Hover orbit particles
    const hp = hoverParticlesRef.current;
    if (hp) {
      const mat = hp.material as THREE.PointsMaterial;
      const targetOpacity = hoverRef.current ? 0.85 * p : 0;
      mat.opacity += (targetOpacity - mat.opacity) * 0.12;
      hp.rotation.z += 0.008;
    }
  });

  return (
    <group ref={groupRef} position={node.position}>
      {/* Hover aura ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.88, 0.022, 8, 64]} />
        <meshBasicMaterial
          color="#5de8f0" transparent opacity={0}
          depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Hover orbit particles */}
      <points ref={hoverParticlesRef} geometry={hoverGeo} material={hoverMat} />

      {/* ── Main card ── */}
      <Html transform distanceFactor={4.5} zIndexRange={[100, 0]}>
        {/* Drag wrapper (outer) — handles hold-to-drag in explore mode */}
        <div
          ref={dragWrapRef}
          onPointerDown={onDragPointerDown}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerUp}
          onPointerCancel={onDragPointerUp}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {/* Opacity wrapper (inner) — controlled by proximity */}
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

      {/* ── Description card ── */}
      {node.description && (
        <Html
          transform
          distanceFactor={4.5}
          zIndexRange={[90, 0]}
          position={offset}
        >
          <div
            ref={descWrapperRef}
            style={{ opacity: 0, pointerEvents: 'none' }}
          >
            <div className="node-desc-card">
              <p className="node-desc-text">{node.description}</p>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function Nodes({
  scrollProgress,
  mode,
}: {
  scrollProgress: MutableRefObject<number>;
  mode: 'scroll' | 'camera';
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
        />
      ))}
    </>
  );
}
