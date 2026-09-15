import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function AtmosphereGlow({
  size,
  color = '#38bdf8',
  strength = 0.7,
  power = 2.4,
}: {
  size: number;
  color?: string;
  strength?: number;
  power?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.elapsedTime;
      // subtle breathe
      (matRef.current.uniforms as any).strength.value = strength * (1 + Math.sin(t * 0.45) * 0.07);
    }
  });
  return (
    <mesh scale={[1.11, 1.11, 1.11]}>
      <sphereGeometry args={[size, 40, 40]} />
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
          varying vec3 vPos;
          void main(){
            vNormal = normalize(normalMatrix*normal);
            vPos = position;
            gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 glowColor;
          uniform float strength;
          uniform float power;
          varying vec3 vNormal;
          varying vec3 vPos;
          void main(){
            float fres = pow(0.7 - dot(vNormal, vec3(0.0,0.0,1.0)), power);
            // slight latitude falloff for aurora-ish
            float latMask = 1.0 - 0.25*abs(vPos.y)/length(vPos);
            gl_FragColor = vec4(glowColor, fres*strength*latMask);
          }
        `}
      />
    </mesh>
  );
}

export function SunCorona({ size }: { size: number }) {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.ShaderMaterial>(null);
  const midRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.06;
      innerRef.current.rotation.x = Math.sin(t * 0.07) * 0.1;
    }
    if (outerRef.current) (outerRef.current.uniforms as any).time.value = t;
    if (midRef.current) (midRef.current.uniforms as any).time.value = t;
  });
  return (
    <group>
      {/* dense inner photosphere glow */}
      <mesh scale={[1.22, 1.22, 1.22]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.20} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* mid corona with Gargantua-like turbulent noise */}
      <mesh scale={[1.55, 1.55, 1.55]}>
        <sphereGeometry args={[size, 48, 48]} />
        <shaderMaterial
          ref={midRef as any}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
          uniforms={{ time: { value: 0 } }}
          vertexShader={`varying vec3 vP; varying vec3 vN; void main(){ vP=position; vN=normal; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
          fragmentShader={`
            varying vec3 vP;
            varying vec3 vN;
            uniform float time;
            float noise(vec3 p){
              return sin(p.x*3.7+time*0.55)*cos(p.y*2.9+time*0.4)*sin(p.z*2.3+time*0.35)*0.5+0.5;
            }
            void main(){
              float n = noise(vP*1.2);
              float fres = pow(0.62 - dot(normalize(vN), vec3(0.0,0.0,1.0)), 2.1);
              float flare = pow(n,2.2);
              vec3 col = mix(vec3(1.0,0.82,0.32), vec3(1.0,0.45,0.08), flare*0.85);
              // subtle pulsing threads
              float threads = sin(vP.x*8.0+time*1.2)*0.5+0.5;
              col += vec3(1.0,0.7,0.2)*threads*0.18*fres;
              gl_FragColor = vec4(col, fres*(0.22+flare*0.18));
            }
          `}
        />
      </mesh>
      {/* far outer corona Gargantua halo */}
      <mesh scale={[2.05, 2.05, 2.05]}>
        <sphereGeometry args={[size, 32, 32]} />
        <shaderMaterial
          ref={outerRef as any}
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
              float dist = length(vP);
              float n = sin(vP.x*1.8+time*0.3)*cos(vP.y*1.6+time*0.25)*0.5+0.5;
              float alpha = (1.0 - smoothstep(0.0, 2.5, dist)) * 0.09 * (0.6+n*0.6);
              vec3 col = vec3(1.0,0.78,0.35);
              // lens flare streak
              float flare = pow(max(0.0, sin(vP.y*0.4+time*0.4))*0.5+0.5, 8.0)*0.15;
              col += vec3(1.0,0.9,0.6)*flare;
              gl_FragColor = vec4(col, alpha);
            }
          `}
        />
      </mesh>
      {/* extra far glow */}
      <mesh scale={[2.6, 2.6, 2.6]}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

export function RingGlow({ inner, outer, color = '#fde68a' }: { inner: number; outer: number; color?: string }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.uniforms as any).time.value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[Math.PI / 2.62, 0, 0.18]}>
      <ringGeometry args={[inner * 1.01, outer * 0.99, 160]} />
      <shaderMaterial
        ref={ref as any}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{ col: { value: new THREE.Color(color) }, time: { value: 0 } }}
        vertexShader={`varying vec2 vUv; varying vec3 vP; void main(){ vUv=uv; vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vP;
          uniform vec3 col;
          uniform float time;
          void main(){
            float r = vUv.y;
            float alpha = smoothstep(0.0,0.12,r)*smoothstep(1.0,0.88,r);
            // Cassini division + banding
            float bands = fract(r*22.0 + sin(time*0.05)*0.02);
            float ring = 0.72 + 0.28*smoothstep(0.35,0.65,bands);
            float cassini = smoothstep(0.44,0.46,r)*smoothstep(0.54,0.52,r);
            cassini = 1.0 - cassini*0.85;
            // subtle shimmer
            float shimmer = sin(vP.x*0.6+time*0.7)*0.5+0.5;
            float a = alpha*ring*cassini*(0.62+shimmer*0.18);
            gl_FragColor = vec4(col, a);
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
    <mesh ref={ref} scale={[1.015, 1.015, 1.015]}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial map={texture} transparent opacity={0.48} roughness={1} metalness={0} depthWrite={false} />
    </mesh>
  );
}

export function CityLightsLayer({ size, texture, opacity = 0.92 }: { size: number; texture: THREE.Texture; opacity?: number }) {
  return (
    <mesh scale={[1.0018, 1.0018, 1.0018]}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// Night side blend: mixes day base + city lights based on sun dir - lightweight Gargantua-inspired terminator
export function EarthNightShader({
  size,
  dayTexture,
  nightTexture,
  sunDir = [1, 0, 0] as [number, number, number],
}: {
  size: number;
  dayTexture: THREE.Texture;
  nightTexture: THREE.Texture;
  sunDir?: [number, number, number];
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const sunVec = useRef(new THREE.Vector3(...sunDir));
  useFrame(({ clock }) => {
    if (matRef.current) {
      // slow sun move for demo unless updated
      sunVec.current.x = Math.cos(clock.elapsedTime * 0.03);
      sunVec.current.z = Math.sin(clock.elapsedTime * 0.03);
      (matRef.current.uniforms as any).sunDir.value.copy(sunVec.current).normalize();
    }
  });
  return (
    <mesh>
      <sphereGeometry args={[size, 64, 64]} />
      <shaderMaterial
        ref={matRef as any}
        uniforms={{
          dayTex: { value: dayTexture },
          nightTex: { value: nightTexture },
          sunDir: { value: new THREE.Vector3(...sunDir) },
        }}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          void main(){
            vUv=uv;
            vNormal=normalize(normalMatrix*normal);
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D dayTex;
          uniform sampler2D nightTex;
          uniform vec3 sunDir;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main(){
            vec3 day = texture2D(dayTex, vUv).rgb;
            vec3 night = texture2D(nightTex, vUv).rgb;
            // sunDir is world space, approximate with view
            float ndl = dot(vNormal, normalize(sunDir));
            float dayMix = smoothstep(-0.25, 0.25, ndl);
            // terminator soft + city lights only on night
            float nightMask = smoothstep(0.25, -0.25, ndl);
            vec3 nightContrib = night * nightMask * 1.45;
            vec3 color = mix(day*0.12 + nightContrib, day, dayMix);
            // subtle atmospheric rim on day side
            float fres = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0,0.0,1.0))), 2.0);
            color += vec3(0.22,0.55,0.95)*fres*0.12*dayMix;
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function Aurora({ size, color = '#22d3ee' }: { size: number; color?: string }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  useFrame((state) => {
    if (ref.current) (ref.current.uniforms as any).time.value = state.clock.elapsedTime;
  });
  return (
    <>
      {/* North */}
      <mesh scale={[1.09, 1.09, 1.09]} position={[0, size * 0.82, 0]}>
        <sphereGeometry args={[size * 0.44, 36, 36, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
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
              float ang = atan(vP.x, vP.z);
              float curtain = sin(ang*4.0 + time*0.9)*cos(vP.y*0.06 + time*0.6)*0.5+0.5;
              float height = smoothstep(0.0, 0.35, sin(vP.y*0.08));
              float fade = pow(curtain,1.6)*height;
              gl_FragColor = vec4(col, fade*0.42);
            }
          `}
        />
      </mesh>
      {/* South mirrored */}
      <mesh scale={[1.09, 1.09, 1.09]} position={[0, -size * 0.82, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[size * 0.38, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
        <shaderMaterial
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uniforms={{ time: { value: 0 }, col: { value: new THREE.Color('#a78bfa') } }}
          vertexShader={`varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
          fragmentShader={`
            uniform float time;
            uniform vec3 col;
            varying vec3 vP;
            void main(){
              float ang = atan(vP.x, vP.z);
              float curtain = sin(ang*3.2 - time*0.7)*cos(vP.y*0.05 + time*0.4)*0.5+0.5;
              float fade = pow(curtain,1.8)*0.9;
              gl_FragColor = vec4(col, fade*0.28);
            }
          `}
        />
      </mesh>
    </>
  );
}

// Gargantua-like thin accretion disk for Sun as optional stylized effect (not physically accurate but beautiful)
export function SunDisk({ size }: { size: number }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.uniforms as any).time.value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[Math.PI / 2.2, 0, 0]}>
      <ringGeometry args={[size * 1.42, size * 2.35, 128]} />
      <shaderMaterial
        ref={ref as any}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{ time: { value: 0 } }}
        vertexShader={`varying vec2 vUv; varying vec3 vP; void main(){ vUv=uv; vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vP;
          uniform float time;
          void main(){
            float r = vUv.y;
            float alpha = smoothstep(0.0,0.18,r)*smoothstep(1.0,0.74,r);
            float ang = atan(vP.y, vP.x);
            float swirl = sin(ang*3.0 + r*8.0 - time*1.1)*0.5+0.5;
            float beaming = 0.6 + 0.4*sin(ang - time*0.3); // Doppler-ish
            float intensity = pow(swirl,2.0)*alpha*beaming;
            vec3 col = mix(vec3(1.0,0.65,0.1), vec3(1.0,0.88,0.45), r*0.8+swirl*0.2);
            col *= intensity*1.2;
            gl_FragColor = vec4(col, intensity*0.42);
          }
        `}
      />
    </mesh>
  );
}
