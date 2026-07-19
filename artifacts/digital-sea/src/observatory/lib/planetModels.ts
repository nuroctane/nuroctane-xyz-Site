import * as THREE from 'three';

export type PlanetConfig = {
  id: string;
  baseColor: string;
  atmosphereColor?: string;
  cloudColor?: string;
  emissive?: string;
  hasRings?: boolean;
  ringColor?: string;
  hasClouds?: boolean;
  hasCityLights?: boolean;
  hasAurora?: boolean;
  atmosphereStrength?: number;
  rotationSpeed?: number;
  glowPower?: number;
  metalness?: number;
  roughness?: number;
};

export const PLANET_CONFIGS: Record<string, PlanetConfig> = {
  Sun: {
    id: 'Sun',
    baseColor: '#fde68a',
    emissive: '#f59e0b',
    atmosphereColor: '#fbbf24',
    atmosphereStrength: 1.2,
    rotationSpeed: 0.1,
    glowPower: 1.5,
    metalness: 0,
    roughness: 1,
  },
  Mercury: {
    id: 'Mercury',
    baseColor: '#a1a1aa',
    atmosphereColor: '#52525b',
    atmosphereStrength: 0.15,
    rotationSpeed: 0.05,
    metalness: 0.3,
    roughness: 0.85,
  },
  Venus: {
    id: 'Venus',
    baseColor: '#fcd34d',
    atmosphereColor: '#fde68a',
    cloudColor: '#fef3c7',
    hasClouds: true,
    atmosphereStrength: 0.9,
    rotationSpeed: -0.02,
    roughness: 0.9,
  },
  Earth: {
    id: 'Earth',
    baseColor: '#2563eb',
    atmosphereColor: '#38bdf8',
    cloudColor: '#ffffff',
    hasClouds: true,
    hasCityLights: true,
    hasAurora: true,
    atmosphereStrength: 0.85,
    rotationSpeed: 0.2,
    roughness: 0.7,
  },
  Moon: {
    id: 'Moon',
    baseColor: '#d6d3d1',
    atmosphereStrength: 0.05,
    rotationSpeed: 0.02,
    roughness: 0.95,
  },
  Mars: {
    id: 'Mars',
    baseColor: '#fb7185',
    atmosphereColor: '#fda4af',
    hasClouds: false,
    atmosphereStrength: 0.35,
    rotationSpeed: 0.18,
    roughness: 0.85,
  },
  Jupiter: {
    id: 'Jupiter',
    baseColor: '#fdba74',
    atmosphereColor: '#fed7aa',
    hasClouds: true,
    atmosphereStrength: 0.6,
    rotationSpeed: 0.4,
    roughness: 0.6,
  },
  Saturn: {
    id: 'Saturn',
    baseColor: '#fde68a',
    atmosphereColor: '#fef3c7',
    hasRings: true,
    ringColor: '#fde68a',
    atmosphereStrength: 0.55,
    rotationSpeed: 0.35,
    roughness: 0.55,
  },
  Uranus: {
    id: 'Uranus',
    baseColor: '#67e8f9',
    atmosphereColor: '#22d3ee',
    atmosphereStrength: 0.7,
    rotationSpeed: 0.25,
    roughness: 0.65,
  },
  Neptune: {
    id: 'Neptune',
    baseColor: '#818cf8',
    atmosphereColor: '#6366f1',
    atmosphereStrength: 0.75,
    rotationSpeed: 0.28,
    roughness: 0.6,
  },
  Pluto: {
    id: 'Pluto',
    baseColor: '#e9d5ff',
    atmosphereColor: '#ddd6fe',
    atmosphereStrength: 0.2,
    rotationSpeed: 0.08,
    roughness: 0.9,
  },
  // TNOs
  Eris: { id: 'Eris', baseColor: '#f9a8d4', atmosphereStrength: 0.15, roughness: 0.9 },
  Haumea: { id: 'Haumea', baseColor: '#c7d2fe', hasRings: true, ringColor: '#a5b4fc', atmosphereStrength: 0.2, roughness: 0.8 },
  Makemake: { id: 'Makemake', baseColor: '#bfdbfe', atmosphereStrength: 0.15, roughness: 0.85 },
  Sedna: { id: 'Sedna', baseColor: '#fca5a5', atmosphereStrength: 0.1, roughness: 0.9 },
  Quaoar: { id: 'Quaoar', baseColor: '#a7f3d0', atmosphereStrength: 0.12, roughness: 0.85 },
  Orcus: { id: 'Orcus', baseColor: '#ddd6fe', atmosphereStrength: 0.12, roughness: 0.85 },
  Ixion: { id: 'Ixion', baseColor: '#fecdd3', atmosphereStrength: 0.1, roughness: 0.9 },
  Varuna: { id: 'Varuna', baseColor: '#bae6fd', atmosphereStrength: 0.1, roughness: 0.9 },
  Ceres: { id: 'Ceres', baseColor: '#a7f3d0', atmosphereStrength: 0.1, roughness: 0.9 },
  Vesta: { id: 'Vesta', baseColor: '#fde68a', atmosphereStrength: 0.1, roughness: 0.9 },
  Chiron: { id: 'Chiron', baseColor: '#f0abfc', atmosphereStrength: 0.25, roughness: 0.8 },
};

export function getPlanetConfig(id: string): PlanetConfig {
  return PLANET_CONFIGS[id] ?? {
    id,
    baseColor: '#94a3b8',
    atmosphereStrength: 0.2,
    roughness: 0.8,
    metalness: 0.1,
  };
}

// Lightweight procedural canvas texture (512x512)
function canvasTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, size = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  draw(ctx, size, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function earthBaseTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    // Ocean base
    ctx.fillStyle = '#0f4c8a';
    ctx.fillRect(0, 0, w, h);
    // Continents blobs
    ctx.fillStyle = '#1a5d1a';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const rx = 20 + Math.random() * 90;
      const ry = 12 + Math.random() * 60;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      if (Math.random() > 0.5) {
        ctx.fillStyle = '#8b5a2b';
        ctx.beginPath();
        ctx.ellipse(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 20, rx * 0.6, ry * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a5d1a';
      }
    }
    // Ice caps
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, w, 18);
    ctx.fillRect(0, h - 18, w, 18);
  }, 512);
}

export function cloudTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 8 + Math.random() * 28;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      // blur via shadow
      ctx.shadowColor = 'rgba(255,255,255,0.4)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, 512);
}

export function gasGiantTexture(base: string, bands = 6): THREE.CanvasTexture {
  const baseCol = new THREE.Color(base);
  return canvasTexture((ctx, w, h) => {
    // bands
    for (let y = 0; y < h; y++) {
      const t = y / h;
      const band = Math.floor(t * bands);
      const v = 0.85 + Math.sin(band * 1.7) * 0.15;
      const col = baseCol.clone().multiplyScalar(v);
      ctx.fillStyle = `rgb(${Math.floor(col.r * 255)},${Math.floor(col.g * 255)},${Math.floor(col.b * 255)})`;
      ctx.fillRect(0, y, w, Math.ceil(h / bands) + 1);
    }
    // turbulence
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 2 + Math.random() * 18;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.8, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Great spot for Jupiter
    if (base.includes('fdba74') || base.includes('fd')) {
      ctx.fillStyle = 'rgba(220,38,38,0.55)';
      ctx.beginPath();
      ctx.ellipse(w * 0.65, h * 0.42, 42, 22, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,20,20,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, 512);
}

export function cityLightsTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,230,120,0.95)';
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      // avoid poles and oceans (simple: cluster near mid lats)
      if (Math.abs(y - h / 2) > h * 0.42) continue;
      if (Math.random() > 0.6) continue;
      const r = Math.random() * 1.8 + 0.6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // glow
      ctx.fillStyle = 'rgba(255,220,90,0.15)';
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,230,120,0.95)';
    }
  }, 512);
}
