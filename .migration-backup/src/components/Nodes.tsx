import { useRef, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { nodes, NodeData } from '../data/nodes';
import { NodeCard } from './NodeCard';

// Pre-allocated objects to avoid per-frame allocations
const _mat4 = new THREE.Matrix4();
const _up = new THREE.Vector3(0, 1, 0);
const _qIdle = new THREE.Quaternion();
const _qFace = new THREE.Quaternion();
const _qResult = new THREE.Quaternion();
const _euler = new THREE.Euler();

// 180° around Y — corrects drei's Html front face to point TOWARD the camera
// (Html renders in the local +Z direction; lookAt makes -Z face camera, so +Z faces away)
const _flipQ = new THREE.Quaternion(0, 1, 0, 0);

function computeProximity(node: NodeData, t: number): number {
  const mid = (node.scrollStart + node.scrollEnd) / 2;
  const halfRange = (node.scrollEnd - node.scrollStart) / 2 + 0.015;
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

  // Stagger wobble phases so nodes move independently
  const phase = index * 1.374; // golden-ratio-ish step

  useFrame(({ camera, clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const t = scrollProgress.current;
    const p = computeProximity(node, t);
    const elapsed = clock.elapsedTime;

    // Wobble amplitude fades as card faces camera (so it steadies when active)
    const wobble = 1 - p * 0.75;
    const wobX = Math.sin(elapsed * 0.50 + phase) * 0.09 * wobble;
    const wobZ = Math.cos(elapsed * 0.37 + phase * 1.21) * 0.06 * wobble;
    const floatY = Math.sin(elapsed * 0.29 + phase * 0.88) * 0.18 * wobble;

    // Floating position
    group.position.set(node.position.x, node.position.y + floatY, node.position.z);

    // Idle rotation (tilted away from camera, with wobble)
    _euler.set(node.idleRotation.x + wobX, node.idleRotation.y, node.idleRotation.z + wobZ);
    _qIdle.setFromEuler(_euler);
    _qIdle.multiply(_flipQ); // flip so text face is outward even at idle tilt

    // Face-camera rotation (+flip so HTML front faces camera)
    _mat4.lookAt(node.position, camera.position, _up);
    _qFace.setFromRotationMatrix(_mat4);
    _qFace.multiply(_flipQ);

    // Slerp from idle tilt → facing camera as proximity rises
    _qResult.slerpQuaternions(_qIdle, _qFace, Math.pow(p, 0.55));
    group.quaternion.copy(_qResult);
    group.scale.setScalar(0.5 + p * 0.5);

    // HTML wrapper: opacity + pointer-events driven from this useFrame
    const el = wrapperRef.current;
    if (el) {
      el.style.opacity = String(p);
      el.style.pointerEvents = p > 0.42 ? 'auto' : 'none';
    }

    // Hover ring: glowing torus that becomes visible when hovered + card is active
    const ring = ringRef.current;
    if (ring) {
      const mat = ring.material as THREE.MeshBasicMaterial;
      const target = hoverRef.current ? 0.7 * p : 0;
      mat.opacity += (target - mat.opacity) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={node.position}>
      {/* Hover aura ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.02, 8, 64]} />
        <meshBasicMaterial
          color="#4ab0ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

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

interface Props {
  scrollProgress: MutableRefObject<number>;
}

export function Nodes({ scrollProgress }: Props) {
  return (
    <>
      {nodes.map((node, i) => (
        <SingleNode key={node.id} node={node} scrollProgress={scrollProgress} index={i} />
      ))}
    </>
  );
}
