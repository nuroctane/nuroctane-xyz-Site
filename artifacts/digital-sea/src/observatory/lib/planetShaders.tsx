import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple atmospheric glow via Fresnel — lightweight
export function AtmosphereGlow({
  size,
  color = '#38bdf8',
  strength = 0.7,
  power = 2.2,
}: {
  size: number;
  color?: string;
  strength?: number;
  power?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  return (
    <mesh scale={[1.08, 1.08, 1.08]}>
      <sphereGeometry args={[size, 32, 32]} />
      <shaderMaterial
        ref={matRef as any}
        side={THREE.BackSide}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{
          glowColor: { value: new THREE.Color(color) },
          strength: { value: strength },
          power: { value: power },
        }}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 glowColor;
          uniform float strength;
          uniform float power;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
            gl_FragColor = vec4(glowColor, intensity * strength);
          }
        `}
      />
    </mesh>
  );
}

export function SunCorona({ size }: { size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.08;
  });
  return (
    <group>
      {/* Inner corona */}
      <mesh scale={[1.25, 1.25, 1.25]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Outer corona w/ noise */}
      <mesh ref={ref} scale={[1.55, 1.55, 1.55]}>
        <sphereGeometry args={[size, 32, 32]} />
        <shaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
          uniforms={{ time: { value: 0 } }}
          vertexShader={`varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
          fragmentShader={`
            varying vec3 vP;
            uniform float time;
            void main(){
              float n = sin(vP.x*3.0)*cos(vP.y*2.5)*sin(vP.z*2.0)*0.5+0.5;
              float f = pow(0.6 - dot(normalize(vP), vec3(0.0,0.0,1.0)), 2.2);
              vec3 col = mix(vec3(1.0,0.75,0.2), vec3(1.0,0.4,0.05), n);
              gl_FragColor = vec4(col, f*0.25);
            }
          `}
        />
      </mesh>
      {/* Far glow */}
      <mesh scale={[2.1, 2.1, 2.1]}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

export function RingGlow({ inner, outer, color = '#fde68a' }: { inner: number; outer: number; color?: string }) {
  return (
    <mesh rotation={[Math.PI / 2.55, 0, 0]}>
      <ringGeometry args={[inner * 1.02, outer * 0.98, 128]} />
      <shaderMaterial
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{ col: { value: new THREE.Color(color) } }}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`
          varying vec2 vUv;
          uniform vec3 col;
          void main(){
            float r = vUv.y;
            float alpha = smoothstep(0.0,0.15,r)*smoothstep(1.0,0.85,r);
            // banded rings
            float bands = fract(r*18.0);
            float ring = smoothstep(0.4,0.6,bands)*0.35+0.65;
            gl_FragColor = vec4(col, alpha*ring*0.55);
          }
        `}
      />
    </mesh>
  );
}

export function CloudLayer({ size, texture, speed = 0.08 }: { size: number; texture: THREE.Texture; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return (
    <mesh ref={ref} scale={[1.012, 1.012, 1.012]}>
      <sphereGeometry args={[size, 48, 48]} />
      <meshStandardMaterial map={texture} transparent opacity={0.42} roughness={1} metalness={0} depthWrite={false} />
    </mesh>
  );
}

export function CityLightsLayer({ size, texture }: { size: number; texture: THREE.Texture }) {
  return (
    <mesh scale={[1.001, 1.001, 1.001]}>
      <sphereGeometry args={[size, 48, 48]} />
      <meshBasicMaterial map={texture} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export function Aurora({ size, color = '#22d3ee' }: { size: number; color?: string }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  useFrame((state) => {
    if (ref.current) {
      (ref.current.uniforms as any).time.value = state.clock.elapsedTime;
    }
  });
  return (
    <mesh scale={[1.08, 1.08, 1.08]}>
      <sphereGeometry args={[size, 32, 32, 64, 1, 0, Math.PI * 0.42]} />
      <shaderMaterial
        ref={ref as any}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{ time: { value: 0 }, col: { value: new THREE.Color(color) } }}
        vertexShader={`varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`
          uniform float time;
          uniform vec3 col;
          varying vec3 vP;
          void main(){
            float lat = atan(vP.y, length(vP.xz));
            float curtain = sin(vP.x*0.08 + time*0.4)*cos(vP.z*0.08 + time*0.3)*0.5+0.5;
            float fade = smoothstep(0.6,0.95, sin(lat*3.0));
            gl_FragColor = vec4(col, curtain*fade*0.35);
          }
        `}
      />
    </mesh>
  );
}
