import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── GPU-animated particles ───────────────────────────────────────────────────
// Each particle's trajectory is encoded as vertex attributes (seed position +
// velocity). The vertex shader computes current world position from elapsed time
// + those seeds — zero CPU loop, zero buffer upload per frame.
// ─────────────────────────────────────────────────────────────────────────────

const FALL_RANGE = 30.0;

const VERT = /* glsl */`
uniform float uTime;
uniform vec3  uCamPos;
uniform float uScale;

attribute float aVelocity;

void main() {
  float frameTime = uTime * aVelocity * 60.0;
  float yOffset   = mod(frameTime,       ${FALL_RANGE.toFixed(1)});
  float zOffset   = mod(frameTime * 0.3, 8.0);

  vec3 pos = vec3(
    position.x + uCamPos.x,
    position.y - yOffset + uCamPos.y,
    position.z + zOffset + uCamPos.z
  );

  vec4 mvPos    = modelViewMatrix * vec4(pos, 1.0);
  gl_Position   = projectionMatrix * mvPos;
  gl_PointSize  = max(0.5, 0.055 * uScale / (-mvPos.z));
}
`;

const FRAG = /* glsl */`
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float alpha  = 0.50 * smoothstep(0.5, 0.15, d);
  gl_FragColor = vec4(0.741, 0.937, 0.949, alpha);
}
`;

interface Props {
  count?: number;
}

export function Particles({ count = 3000 }: Props) {
  const sizeVec = useMemo(() => new THREE.Vector2(), []);

  const { geo, mat } = useMemo(() => {
    const positions  = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22 + 4;
      positions[i * 3 + 2] = -Math.random() * 200;
      velocities[i]         = 0.003 + Math.random() * 0.009;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position',  new THREE.BufferAttribute(positions,  3));
    g.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 1));

    const m = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:   { value: 0 },
        uCamPos: { value: new THREE.Vector3() },
        uScale:  { value: 540 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    return { geo: g, mat: m };
  }, [count]);

  useFrame(({ gl, clock, camera }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uCamPos.value.copy(camera.position);
    gl.getSize(sizeVec);
    mat.uniforms.uScale.value = sizeVec.y * 0.5;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} />;
}
