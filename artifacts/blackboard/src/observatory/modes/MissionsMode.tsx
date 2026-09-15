import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, Stars } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import { MISSIONS } from '../data/missions';
import { useObservatory } from '../state/ObservatoryContext';
import type { MissionEntry } from '../lib/types';

function missionPosition(m: MissionEntry, i: number) {
  const ring =
    m.domain === 'earth' ? 3.2 : m.domain === 'rover' ? 5.2 : m.domain === 'telescope' ? 7 : 9;
  const a = (i / Math.max(1, MISSIONS.length)) * Math.PI * 2;
  const y = m.domain === 'rover' ? -0.6 : m.domain === 'earth' ? 0.4 : 0.1 * Math.sin(i);
  return [Math.cos(a) * ring, y, Math.sin(a) * ring] as [number, number, number];
}

type HorizonsSample = {
  label: string;
  x?: number;
  y?: number;
  z?: number;
  raw?: string;
  error?: string;
};

async function fetchHorizons(id: string): Promise<HorizonsSample> {
  // JPL Horizons API — vectors relative to solar system barycenter, AU/day
  const url =
    `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${encodeURIComponent(id)}'` +
    `&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTORS'&CENTER='500@0'` +
    `&START_TIME='${new Date().toISOString().slice(0, 10)}'` +
    `&STOP_TIME='${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}'` +
    `&STEP_SIZE='1d'&VEC_TABLE='1'`;
  try {
    const res = await fetch(url);
    if (!res.ok) return { label: id, error: `HTTP ${res.status}` };
    const data = (await res.json()) as { result?: string };
    const text = data.result ?? '';
    // Parse first X Y Z line in AU
    const m = text.match(/X\s*=\s*([-\d.E+]+)\s*Y\s*=\s*([-\d.E+]+)\s*Z\s*=\s*([-\d.E+]+)/i);
    if (!m) return { label: id, raw: text.slice(0, 400), error: 'No vector block' };
    return {
      label: id,
      x: Number(m[1]),
      y: Number(m[2]),
      z: Number(m[3]),
      raw: text.slice(0, 600),
    };
  } catch (e) {
    return { label: id, error: e instanceof Error ? e.message : String(e) };
  }
}

async function fetchRoverPhotos(rover: 'curiosity' | 'perseverance'): Promise<{ img?: string; status: string }> {
  try {
    const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=DEMO_KEY`;
    const res = await fetch(url);
    if (!res.ok) return { status: `NASA photos HTTP ${res.status}` };
    const data = (await res.json()) as { latest_photos?: { img_src: string; earth_date: string; camera: { name: string } }[] };
    const photo = data.latest_photos?.[0];
    if (!photo) return { status: 'No latest photos' };
    return { img: photo.img_src, status: `${photo.camera.name} · ${photo.earth_date}` };
  } catch (e) {
    return { status: e instanceof Error ? e.message : String(e) };
  }
}

function MissionMarks() {
  const { selectedMission, setSelectedMission, layers, query } = useObservatory();
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MISSIONS.filter(
      (m) => !q || m.name.toLowerCase().includes(q) || m.target?.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.1, 3.25, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} side={2} />
      </mesh>
      {layers.missions &&
        list.map((m, i) => {
          const p = missionPosition(m, i);
          const selected = selectedMission === m.id;
          return (
            <group key={m.id} position={p}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMission(m.id);
                }}
              >
                <octahedronGeometry args={[selected ? 0.22 : 0.14, 0]} />
                <meshStandardMaterial
                  color={m.color}
                  emissive={selected ? m.color : '#000'}
                  emissiveIntensity={selected ? 0.5 : 0}
                />
              </mesh>
              {layers.labels && (
                <Html distanceFactor={14} style={{ pointerEvents: 'none' }}>
                  <div className="obs-label">{m.name}</div>
                </Html>
              )}
            </group>
          );
        })}
    </group>
  );
}

function MissionsScene() {
  return (
    <>
      <color attach="background" args={['#04060a']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} />
      <Stars radius={100} depth={50} count={4500} factor={3} fade speed={0.35} />
      <MissionMarks />
      <OrbitControls makeDefault minDistance={3} maxDistance={30} />
    </>
  );
}

export function MissionsMode() {
  const { selectedMission, setSelectedMission, query, setEarthSubmode, setMode } = useObservatory();
  const q = query.trim().toLowerCase();
  const list = MISSIONS.filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.agency.toLowerCase().includes(q),
  );
  const active = MISSIONS.find((m) => m.id === selectedMission) ?? null;
  const [horizons, setHorizons] = useState<HorizonsSample | null>(null);
  const [rover, setRover] = useState<{ img?: string; status: string } | null>(null);
  const [follow, setFollow] = useState(false);

  useEffect(() => {
    if (!active?.horizonsId) {
      setHorizons(null);
      return;
    }
    let cancelled = false;
    setHorizons({ label: active.horizonsId, error: 'Loading Horizons…' });
    fetchHorizons(active.horizonsId).then((r) => {
      if (!cancelled) setHorizons(r);
    });
    return () => {
      cancelled = true;
    };
  }, [active?.horizonsId]);

  useEffect(() => {
    if (!active || active.domain !== 'rover') {
      setRover(null);
      return;
    }
    const name = active.id.includes('curiosity')
      ? 'curiosity'
      : active.id.includes('perseverance') || active.id.includes('ingenuity')
        ? 'perseverance'
        : null;
    if (!name) return;
    fetchRoverPhotos(name).then(setRover);
  }, [active]);

  return (
    <div className="obs-missions">
      <div className="obs-canvas-host obs-missions-canvas">
        <Canvas camera={{ position: [0, 6, 14], fov: 50 }} dpr={[1, 1.75]}>
          <MissionsScene />
        </Canvas>
      </div>
      <aside className="obs-missions-list" aria-label="Mission catalog">
        <div className="obs-panel-hd">MISSIONS · EYES + HORIZONS</div>
        <p className="obs-muted">
          Catalog with NASA Eyes deep links, JPL Horizons vectors, and Mars rover photo hooks.
        </p>
        <ul>
          {list.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={selectedMission === m.id ? 'is-active' : ''}
                onClick={() => setSelectedMission(m.id)}
              >
                <span className="dot" style={{ background: m.color }} />
                <span className="meta">
                  <strong>{m.name}</strong>
                  <span>
                    {m.domain} · {m.status}
                    {m.target ? ` · ${m.target}` : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {active && (
          <div className="obs-mission-detail">
            <h3>{active.name}</h3>
            <p>{active.summary}</p>
            <p className="obs-muted">{active.agency}</p>
            <div className="obs-mission-actions">
              {active.eyesUrl && (
                <a href={active.eyesUrl} target="_blank" rel="noreferrer">
                  NASA Eyes ↗
                </a>
              )}
              {active.domain === 'earth' && active.id === 'iss' && (
                <button
                  type="button"
                  className="obs-mini"
                  onClick={() => {
                    setMode('earth');
                    setEarthSubmode('satellites');
                  }}
                >
                  Follow in Earth satellites
                </button>
              )}
              <button type="button" className={`obs-mini ${follow ? 'is-active' : ''}`} onClick={() => setFollow((v) => !v)}>
                {follow ? 'Following' : 'Follow target'}
              </button>
            </div>
            {horizons && (
              <div className="obs-horizons">
                <div className="obs-panel-hd">JPL HORIZONS</div>
                {horizons.error && !horizons.x && <p className="obs-muted">{horizons.error}</p>}
                {typeof horizons.x === 'number' && (
                  <p className="obs-mono">
                    X={horizons.x.toFixed(6)} AU
                    <br />
                    Y={horizons.y?.toFixed(6)} AU
                    <br />
                    Z={horizons.z?.toFixed(6)} AU
                  </p>
                )}
              </div>
            )}
            {rover && (
              <div className="obs-rover">
                <div className="obs-panel-hd">ROVER DATA</div>
                <p className="obs-muted">{rover.status}</p>
                {rover.img && (
                  <a href={rover.img} target="_blank" rel="noreferrer">
                    <img src={rover.img} alt="Latest rover photo" className="obs-rover-img" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
