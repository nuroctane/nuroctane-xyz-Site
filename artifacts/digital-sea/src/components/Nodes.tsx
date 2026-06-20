import { useRef, useMemo, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
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

// 180° around Y — applied ONCE to the final slerped quaternion so +Z faces camera
const _flipQ = new THREE.Quaternion(0, 1, 0, 0);

function computeProximity(node: NodeData, t: number): number {
  const mid = (node.scrollStart + node.scrollEnd) / 2;
  const halfRange = (node.scrollEnd - node.scrollStart) / 2 + 0.014;
  return Math.max(0, Math.min(1, 1 - Math.abs(t - mid) / halfRange));
}

interface SingleNodeProps {
  node: NodeData;
  scrollProgress: MutableRefObject<number>;
  index: number;
}

function SingleNode({ node, scrollProgress, index }: SingleNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const hoverParticlesRef = useRef<THREE.Points>(null);

  const phase = index * 1.374;

  // Hover particle geometry — 36 points orbiting the card
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
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame(({ camera, clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const t = scrollProgress.current;
    const p = computeProximity(node, t);
    const elapsed = clock.elapsedTime;

    // Wobble fades as card faces camera (steadies when active)
    const wobble = 1 - p * 0.80;
    // Bigger amplitudes than before
    const wobX = Math.sin(elapsed * 0.52 + phase) * 0.18 * wobble;
    const wobZ = Math.cos(elapsed * 0.38 + phase * 1.21) * 0.12 * wobble;
    const floatY = Math.sin(elapsed * 0.31 + phase * 0.88) * 0.35 * wobble;

    group.position.set(node.position.x, node.position.y + floatY, node.position.z);

    // Build idle quaternion (NO _flipQ yet)
    _euler.set(node.idleRotation.x + wobX, node.idleRotation.y, node.idleRotation.z + wobZ);
    _qIdle.setFromEuler(_euler);

    // Build face-camera quaternion — lookAt gives -Z toward camera, NO _flipQ yet
    _mat4.lookAt(node.position, camera.position, _up);
    _qFace.setFromRotationMatrix(_mat4);

    // Slerp idle → face-camera based on proximity
    _qResult.slerpQuaternions(_qIdle, _qFace, Math.pow(p, 0.55));

    // Apply flip ONCE to the final result so HTML +Z faces camera correctly
    _qResult.multiply(_flipQ);
    group.quaternion.copy(_qResult);

    group.scale.setScalar(0.5 + p * 0.5);

    // HTML wrapper opacity + pointer-events
    const el = wrapperRef.current;
    if (el) {
      el.style.opacity = String(p);
      el.style.pointerEvents = p > 0.38 ? 'auto' : 'none';
    }

    // Hover aura ring
    const ring = ringRef.current;
    if (ring) {
      const mat = ring.material as THREE.MeshBasicMaterial;
      const target = hoverRef.current ? 0.75 * p : 0;
      mat.opacity += (target - mat.opacity) * 0.10;
    }

    // Hover particles — slowly orbit, fade in on hover
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
        <torusGeometry args={[0.82, 0.022, 8, 64]} />
        <meshBasicMaterial
          color="#5de8f0"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Hover orbit particles */}
      <points ref={hoverParticlesRef} geometry={hoverGeo} material={hoverMat} />

      <Html
        transform
        distanceFactor={4.5}
        zIndexRange={[100, 0]}
      >
        <div
          ref={wrapperRef}
          style={{ opacity: 0, pointerEvents: 'none' }}
          onMouseEnter={() => { hoverRef.current = true; }}
          onMouseLeave={() => { hoverRef.current = false; }}
        >
          <NodeCard node={node} />
        </div>
      </Html>
    </group>
  );
}

export function Nodes({ scrollProgress }: { scrollProgress: MutableRefObject<number> }) {
  return (
    <>
      {nodes.map((node, i) => (
        <SingleNode key={node.id} node={node} scrollProgress={scrollProgress} index={i} />
      ))}
    </>
  );
}
