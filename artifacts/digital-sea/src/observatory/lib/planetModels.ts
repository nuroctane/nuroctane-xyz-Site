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
  Sun: { id: 'Sun', baseColor: '#fde68a', emissive: '#f59e0b', atmosphereColor: '#fbbf24', atmosphereStrength: 1.35, rotationSpeed: 0.06, glowPower: 1.6, metalness: 0, roughness: 1 },
  Mercury: { id: 'Mercury', baseColor: '#a8a29e', atmosphereColor: '#52525b', atmosphereStrength: 0.12, rotationSpeed: 0.04, metalness: 0.35, roughness: 0.88 },
  Venus: { id: 'Venus', baseColor: '#fcd34d', atmosphereColor: '#fde68a', cloudColor: '#fef3c7', hasClouds: true, atmosphereStrength: 0.95, rotationSpeed: -0.015, roughness: 0.92 },
  Earth: { id: 'Earth', baseColor: '#1d4ed8', atmosphereColor: '#38bdf8', cloudColor: '#ffffff', hasClouds: true, hasCityLights: true, hasAurora: true, atmosphereStrength: 0.9, rotationSpeed: 0.18, roughness: 0.68 },
  Moon: { id: 'Moon', baseColor: '#d6d3d1', atmosphereStrength: 0.04, rotationSpeed: 0.02, roughness: 0.95 },
  Mars: { id: 'Mars', baseColor: '#fb7185', atmosphereColor: '#fda4af', atmosphereStrength: 0.32, rotationSpeed: 0.17, roughness: 0.82 },
  Jupiter: { id: 'Jupiter', baseColor: '#fdba74', atmosphereColor: '#fed7aa', hasClouds: true, atmosphereStrength: 0.62, rotationSpeed: 0.42, roughness: 0.58 },
  Saturn: { id: 'Saturn', baseColor: '#fde68a', atmosphereColor: '#fef3c7', hasRings: true, ringColor: '#fde68a', atmosphereStrength: 0.58, rotationSpeed: 0.36, roughness: 0.52 },
  Uranus: { id: 'Uranus', baseColor: '#67e8f9', atmosphereColor: '#22d3ee', atmosphereStrength: 0.72, rotationSpeed: 0.24, roughness: 0.62 },
  Neptune: { id: 'Neptune', baseColor: '#818cf8', atmosphereColor: '#6366f1', atmosphereStrength: 0.78, rotationSpeed: 0.28, roughness: 0.58 },
  Pluto: { id: 'Pluto', baseColor: '#e9d5ff', atmosphereColor: '#ddd6fe', atmosphereStrength: 0.18, rotationSpeed: 0.07, roughness: 0.9 },
  // Dwarf / asteroids
  Eris: { id: 'Eris', baseColor: '#f9a8d4', atmosphereStrength: 0.14, roughness: 0.9 },
  Haumea: { id: 'Haumea', baseColor: '#c7d2fe', hasRings: true, ringColor: '#a5b4fc', atmosphereStrength: 0.22, roughness: 0.82 },
  Makemake: { id: 'Makemake', baseColor: '#bfdbfe', atmosphereStrength: 0.14, roughness: 0.85 },
  Sedna: { id: 'Sedna', baseColor: '#fca5a5', atmosphereStrength: 0.1, roughness: 0.9 },
  Quaoar: { id: 'Quaoar', baseColor: '#a7f3d0', atmosphereStrength: 0.12, roughness: 0.86 },
  Orcus: { id: 'Orcus', baseColor: '#ddd6fe', atmosphereStrength: 0.11, roughness: 0.86 },
  Ixion: { id: 'Ixion', baseColor: '#fecdd3', atmosphereStrength: 0.1, roughness: 0.9 },
  Varuna: { id: 'Varuna', baseColor: '#bae6fd', atmosphereStrength: 0.1, roughness: 0.9 },
  Ceres: { id: 'Ceres', baseColor: '#a7f3d0', atmosphereStrength: 0.1, roughness: 0.9 },
  Vesta: { id: 'Vesta', baseColor: '#fde68a', atmosphereStrength: 0.1, roughness: 0.9 },
  Chiron: { id: 'Chiron', baseColor: '#f0abfc', atmosphereStrength: 0.24, roughness: 0.82 },
  Pholus: { id: 'Pholus', baseColor: '#f0abfc', atmosphereStrength: 0.2 },
  Pallas: { id: 'Pallas', baseColor: '#a7f3d0', atmosphereStrength: 0.08 },
  Juno: { id: 'Juno', baseColor: '#fde68a', atmosphereStrength: 0.08 },
  // Uranian + others fallback via default
};

export function getPlanetConfig(id: string): PlanetConfig {
  return PLANET_CONFIGS[id] ?? { id, baseColor: '#94a3b8', atmosphereStrength: 0.22, roughness: 0.8, metalness: 0.1, rotationSpeed: 0.12 };
}

function canvasTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, size = 1024): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  draw(ctx, size, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// High quality Earth: ocean + continents + deserts + ice, 1024px
export function earthBaseTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    // Deep ocean gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b2a5c');
    g.addColorStop(0.2, '#0e3a7a');
    g.addColorStop(0.5, '#104c8a');
    g.addColorStop(0.8, '#0e3a7a');
    g.addColorStop(1, '#0b2a5c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Subtle ocean noise
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

    // continent generation - large landmasses approx positions (equirectangular)
    // Rough Afro-Eurasia blob
    const land = (cx: number, cy: number, scale: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      const points = 14;
      const rBase = 90 * scale;
      for (let i = 0; i <= points; i++) {
        const ang = (i / points) * Math.PI * 2;
        const r = rBase * (0.7 + Math.sin(ang * 2.3 + cx) * 0.2 + Math.random() * 0.2);
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r * 0.75;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // Africa-Eurasia
    land(w * 0.52, h * 0.48, 1.35, '#2a5a2a');
    land(w * 0.55, h * 0.42, 1.1, '#3a6a3a');
    land(w * 0.58, h * 0.35, 0.7, '#8a7a4a'); // Sahara
    land(w * 0.72, h * 0.38, 0.75, '#3d6d2a'); // Asia
    land(w * 0.68, h * 0.32, 0.45, '#e8e0c0'); // Siberian light

    // Americas
    land(w * 0.18, h * 0.38, 0.9, '#2f5e2f');
    land(w * 0.20, h * 0.60, 0.85, '#2a5a2a');
    land(w * 0.26, h * 0.64, 0.35, '#7a6a3a'); // south america desert

    // Australia
    land(w * 0.82, h * 0.72, 0.32, '#7a6a3a');

    // Add smaller islands + detail ellipses
    ctx.fillStyle = '#345a34';
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      if (Math.abs(y - h / 2) > h * 0.42) continue;
      if (Math.random() > 0.75) continue;
      const rx = 4 + Math.random() * 22;
      const ry = 3 + Math.random() * 16;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ice caps with gradient
    const iceGradN = ctx.createLinearGradient(0, 0, 0, 44);
    iceGradN.addColorStop(0, '#f0faff');
    iceGradN.addColorStop(1, 'rgba(200,230,255,0)');
    ctx.fillStyle = iceGradN;
    ctx.fillRect(0, 0, w, 44);
    ctx.fillStyle = '#e0f2fe';
    ctx.globalAlpha = 0.55;
    ctx.fillRect(0, 0, w, 18);
    ctx.globalAlpha = 1;
    const iceGradS = ctx.createLinearGradient(0, h - 44, 0, h);
    iceGradS.addColorStop(0, 'rgba(200,230,255,0)');
    iceGradS.addColorStop(1, '#f0faff');
    ctx.fillStyle = iceGradS;
    ctx.fillRect(0, h - 44, w, 44);
  }, 1024);
}

export function cloudTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // soft cloudy blobs
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 12 + Math.random() * 36;
      const alpha = 0.35 + Math.random() * 0.45;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.6, `rgba(255,255,255,${alpha * 0.35})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // add some storm swirls
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * w;
      const y = (0.15 + Math.random() * 0.7) * h;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const loops = 2 + Math.random() * 2;
      for (let a = 0; a < loops * Math.PI * 2; a += 0.12) {
        const rad = 4 + (a / (loops * Math.PI * 2)) * 18;
        const px = x + Math.cos(a) * rad;
        const py = y + Math.sin(a) * rad;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, 1024);
}

export function gasGiantTexture(base: string, bands = 7): THREE.CanvasTexture {
  const baseCol = new THREE.Color(base);
  return canvasTexture((ctx, w, h) => {
    // subtle vertical gradient bands like Jupiter/Saturn
    for (let y = 0; y < h; y++) {
      const t = y / h;
      const bandIdx = Math.floor(t * bands);
      const bandPhase = (t * bands) % 1;
      const isBoundary = bandPhase < 0.08 || bandPhase > 0.92;
      let v = isBoundary ? 0.78 : 0.86 + Math.sin(bandIdx * 1.9 + t * 6) * 0.12;
      if (bandIdx % 2 === 0) v -= 0.06;
      const col = baseCol.clone().multiplyScalar(v);
      // add hue variation
      if (bandIdx % 3 === 1) {
        col.r *= 1.05; col.g *= 0.98;
      }
      ctx.fillStyle = `rgb(${Math.floor(col.r * 255)},${Math.floor(col.g * 255)},${Math.floor(col.b * 255)})`;
      ctx.fillRect(0, y, w, Math.ceil(h / bands) + 2);
    }
    // turbulence & storms
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 420; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const rx = 2 + Math.random() * 26;
      const ry = rx * (0.35 + Math.random() * 0.5);
      ctx.fillStyle = Math.random() > 0.54 ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Great Red Spot / big storm for Jupiter-ish
    if (base.toLowerCase().includes('fdba') || base.toLowerCase().includes('fd')) {
      const cx = w * 0.68, cy = h * 0.44;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 56);
      grad.addColorStop(0, 'rgba(220,38,38,0.72)');
      grad.addColorStop(0.45, 'rgba(180,30,30,0.48)');
      grad.addColorStop(1, 'rgba(120,20,20,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 54, 28, -0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100,15,15,0.32)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 58, 30, -0.12, 0, Math.PI * 2);
      ctx.stroke();
    }
    // polar darkening
    const polarGrad = ctx.createLinearGradient(0, 0, 0, h);
    polarGrad.addColorStop(0, 'rgba(0,0,0,0.42)');
    polarGrad.addColorStop(0.14, 'rgba(0,0,0,0)');
    polarGrad.addColorStop(0.86, 'rgba(0,0,0,0)');
    polarGrad.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = polarGrad;
    ctx.fillRect(0, 0, w, h);
  }, 1024);
}

export function cityLightsTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, w, h);

    // cluster centers mimicking populated lat zones
    const clusters = [
      { x: 0.52, y: 0.42, n: 180 }, // Europe
      { x: 0.73, y: 0.43, n: 140 }, // East Asia
      { x: 0.62, y: 0.44, n: 90 }, // India/Middle east
      { x: 0.18, y: 0.42, n: 110 }, // US east
      { x: 0.12, y: 0.46, n: 60 }, // US west
      { x: 0.28, y: 0.66, n: 50 }, // Brazil coast
      { x: 0.81, y: 0.72, n: 35 }, // Australia east
    ];
    for (const cl of clusters) {
      for (let i = 0; i < cl.n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.85) * 0.12;
        const x = (cl.x + Math.cos(ang) * r * (0.6 + Math.random() * 0.8)) * w;
        const y = (cl.y + Math.sin(ang) * r * 0.75) * h;
        if (x < 0 || x >= w || y < 0 || y >= h) continue;
        const rr = 0.7 + Math.random() * 2.1;
        const alpha = 0.75 + Math.random() * 0.25;
        ctx.fillStyle = `rgba(255,${210 + Math.floor(Math.random() * 40)},${90 + Math.floor(Math.random() * 60)},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
        // soft glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, rr * 4.5);
        glow.addColorStop(0, `rgba(255,220,100,${alpha * 0.28})`);
        glow.addColorStop(1, 'rgba(255,220,100,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, rr * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // random sparse dots
    ctx.fillStyle = 'rgba(255,225,120,0.85)';
    for (let i = 0; i < 320; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      if (Math.abs(y - h / 2) > h * 0.42) continue;
      if (Math.random() > 0.55) continue;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.2 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 1024);
}

export function moonTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#c2bdb5';
    ctx.fillRect(0, 0, w, h);
    // craters
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 2 + Math.random() * 22;
      const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      grad.addColorStop(0, 'rgba(60,55,50,0.45)');
      grad.addColorStop(0.6, 'rgba(140,135,128,0.18)');
      grad.addColorStop(1, 'rgba(200,195,184,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // rim
      ctx.strokeStyle = 'rgba(90,85,78,0.22)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.88, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, 512);
}

export function marsTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#8a3a2a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#a85a3a';
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const rx = 12 + Math.random() * 70;
      const ry = 8 + Math.random() * 44;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // polar caps
    ctx.fillStyle = 'rgba(225,235,245,0.92)';
    ctx.fillRect(0, 0, w, 26);
    ctx.fillRect(0, h - 26, w, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(0, 0, w, 14);
    ctx.fillRect(0, h - 14, w, 14);
    // dark markings
    ctx.fillStyle = 'rgba(40,20,15,0.22)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w, y = Math.random() * h * 0.6 + h * 0.2;
      ctx.beginPath();
      ctx.ellipse(x, y, 20 + Math.random() * 60, 10 + Math.random() * 30, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 1024);
}

export function earthSpecularTexture(): THREE.CanvasTexture {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    // oceans white for specular
    ctx.fillStyle = '#ffffff';
    // cheap: same continents mask inverted - ocean bright
    // reuse ocean base bright
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    // paint continents black (low specular)
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const rx = 18 + Math.random() * 80, ry = 12 + Math.random() * 50;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 512);
}
