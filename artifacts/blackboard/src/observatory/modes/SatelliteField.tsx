import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useObservatory } from '../state/ObservatoryContext';
import { SATELLITE_GROUPS, type SatelliteGroupId } from '../lib/types';
import { gmstOf, loadObservatoryCatalog, propagateGeodetic, writeSatellitePosition, type LiveSat, type CatalogSource } from '../lib/tle';

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function SatelliteField({
  earthRadius,
  earthWorldPos,
  earthRotRef,
  enabledGroups,
  search,
  selectedId,
  setSelectedId,
  showGroundTrack,
  showOrbitTrail,
  satPosRef,
}: {
  earthRadius: number;
  earthWorldPos: THREE.Vector3;
  earthRotRef: React.MutableRefObject<number>;
  enabledGroups: Record<SatelliteGroupId, boolean>;
  search: string;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  showGroundTrack: boolean;
  showOrbitTrail: boolean;
  satPosRef: React.MutableRefObject<Map<string, THREE.Vector3>>;
}) {
  const { time, live } = useObservatory();
  const [sats, setSats] = useState<LiveSat[]>([]);
  const [source, setSource] = useState<'loading' | CatalogSource>('loading');
  const timeRef = useRef(time);
  const liveRef = useRef(live);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { liveRef.current = live; }, [live]);

  const groupKey = SATELLITE_GROUPS.map((g) => (enabledGroups[g.id] ? g.id : '')).join('|');

  useEffect(() => {
    const ctrl = new AbortController();
    setSource('loading');
    loadObservatoryCatalog(enabledGroups, ctrl.signal)
      .then((cat) => {
        if (ctrl.signal.aborted) return;
        setSats(cat.sats);
        setSource(cat.source);
      })
      .catch((err: { name?: string }) => {
        if (err?.name === 'AbortError' || ctrl.signal.aborted) return;
        setSats([]);
        setSource('snapshot');
      });
    return () => ctrl.abort();
    // groupKey is the enabled-set identity; the object itself is stable per toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupKey]);

  useEffect(() => {
    (window as any).__OBS_SATS__ = sats;
    (window as any).__OBS_SAT_META__ = { count: sats.length, source };
    window.dispatchEvent(new CustomEvent('obs-sat-catalog', { detail: { count: sats.length, source } }));
    return () => { satPosRef.current.clear(); };
  }, [sats, source]);

  useEffect(() => () => {
    satPosRef.current.clear();
    delete (window as any).__OBS_SATS__;
    delete (window as any).__OBS_SAT_META__;
    window.dispatchEvent(new CustomEvent('obs-sat-catalog', { detail: { count: 0, source: 'snapshot' } }));
  }, [satPosRef]);

  const geomRef = useRef<THREE.BufferGeometry>(null);
  const positions = useRef<Float32Array>(new Float32Array(0));
  const cursor = useRef(0);
  const cycleDate = useRef(new Date());
  const markerRef = useRef<THREE.Group>(null);

  useEffect(() => {
    positions.current = new Float32Array(sats.length * 3).fill(9999);
    cursor.current = 0;
  }, [sats]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = Math.max(sats.length, 1);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < sats.length; i++) {
      const c = new THREE.Color(sats[i]!.color);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      pos[i * 3] = 9999;
      pos[i * 3 + 1] = 9999;
      pos[i * 3 + 2] = 9999;
    }
    if (!sats.length) {
      pos[0] = 9999;
      pos[1] = 9999;
      pos[2] = 9999;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    // Positions change in place. A sphere calculated from the initial 9999
    // sentinels would keep culling the satellites after real positions arrive.
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), earthRadius * (1 + 90_000 / 6371));
    return geo;
  }, [sats, earthRadius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const selectedIndex = useMemo(
    () => (selectedId ? sats.findIndex((sat) => sat.id === selectedId) : -1),
    [sats, selectedId],
  );

  useFrame(() => {
    if (!geomRef.current || !sats.length) return;
    const attr = geomRef.current.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const cache = positions.current;
    if (cache.length < sats.length * 3) return;
    if (cursor.current === 0) cycleDate.current = liveRef.current ? new Date() : timeRef.current;
    const date = cycleDate.current;
    const gmst = gmstOf(date);
    const q = search.toLowerCase().trim();
    const batch = 160;
    const start = cursor.current;
    const end = Math.min(sats.length, start + batch);
    for (let i = start; i < end; i++) {
      const s = sats[i]!;
      const hidden = !enabledGroups[s.group] || (q.length > 0 && !s.name.toLowerCase().includes(q) && !s.group.includes(q) && !s.id.includes(q));
      if (hidden) {
        cache[i * 3] = 9999;
        cache[i * 3 + 1] = 9999;
        cache[i * 3 + 2] = 9999;
      } else {
        writeSatellitePosition(s, date, gmst, earthRadius, cache, i * 3);
      }
      arr[i * 3] = cache[i * 3]!;
      arr[i * 3 + 1] = cache[i * 3 + 1]!;
      arr[i * 3 + 2] = cache[i * 3 + 2]!;
    }
    attr.needsUpdate = true;
    cursor.current = end >= sats.length ? 0 : end;

    const map = satPosRef.current;
    if (selectedIndex < 0 && map.size) map.clear();
    if (selectedIndex >= 0) {
      const i = selectedIndex;
      if (!enabledGroups[sats[i]!.group] || Math.abs(cache[i * 3]!) > 9000) {
        if (map.size) map.clear();
      } else {
        const lx = cache[i * 3]!;
        const ly = cache[i * 3 + 1]!;
        const lz = cache[i * 3 + 2]!;
        const rot = earthRotRef.current;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const rx = lx * cos + lz * sin;
        const rz = -lx * sin + lz * cos;
        let world = map.get(sats[i]!.id);
        if (!world) {
          map.clear();
          world = new THREE.Vector3();
          map.set(sats[i]!.id, world);
        }
        world.set(earthWorldPos.x + rx, earthWorldPos.y + ly, earthWorldPos.z + rz);
      }
    }

    if (markerRef.current) {
      if (selectedIndex < 0 || Math.abs(cache[selectedIndex * 3] ?? 9999) > 9000) {
        markerRef.current.visible = false;
      } else {
        markerRef.current.visible = true;
        markerRef.current.position.set(
          cache[selectedIndex * 3]!,
          cache[selectedIndex * 3 + 1]!,
          cache[selectedIndex * 3 + 2]!,
        );
      }
    }
  });

  const selected = selectedIndex >= 0 ? sats[selectedIndex]! : null;
  const minute = Math.floor(time.getTime() / 60_000);

  const groundTrack = useMemo(() => {
    if (!selected || !showGroundTrack || !selected.satrec.no) return null;
    const periodMs = ((Math.PI * 2) / selected.satrec.no) * 60_000;
    const base = minute * 60_000;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 72; i++) {
      const g = propagateGeodetic(selected.satrec, new Date(base + (i / 72) * periodMs));
      if (!g) continue;
      const v = latLonToVector3(g.lat, g.lon, earthRadius * 1.004);
      pts.push([v.x, v.y, v.z]);
    }
    return pts.length > 2 ? pts : null;
  }, [selected, showGroundTrack, earthRadius, minute]);

  const orbitTrail = useMemo(() => {
    if (!selected || !showOrbitTrail || !selected.satrec.no) return null;
    const periodMs = ((Math.PI * 2) / selected.satrec.no) * 60_000;
    const base = minute * 60_000;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 72; i++) {
      const g = propagateGeodetic(selected.satrec, new Date(base + (i / 72) * periodMs));
      if (!g) continue;
      const radius = earthRadius * ((6371 + g.altKm) / 6371);
      const v = latLonToVector3(g.lat, g.lon, radius);
      pts.push([v.x, v.y, v.z]);
    }
    return pts.length > 2 ? pts : null;
  }, [selected, showOrbitTrail, earthRadius, minute]);

  const handlePointPick = (e: { index?: number; faceIndex?: number; stopPropagation: () => void }) => {
    const idx = typeof e.index === 'number' ? e.index : typeof e.faceIndex === 'number' ? e.faceIndex : null;
    if (idx == null) return;
    const s = sats[idx];
    if (!s || !enabledGroups[s.group]) return;
    e.stopPropagation();
    setSelectedId(s.id);
  };

  if (!sats.length) return null;

  return (
    <>
      <points
        onPointerDown={handlePointPick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <primitive object={geometry} ref={geomRef as any} attach="geometry" />
        <pointsMaterial vertexColors size={0.034} sizeAttenuation transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      {groundTrack && <Line points={groundTrack} color={selected?.color || '#d5dde6'} transparent opacity={0.88} lineWidth={1.5} />}
      {orbitTrail && <Line points={orbitTrail} color={selected?.color || '#f4f7fb'} transparent opacity={0.58} lineWidth={1.2} />}
      {selected && (
        <group ref={markerRef}>
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={selected.color} emissive={selected.color} emissiveIntensity={1.2} />
          </mesh>
          <mesh scale={[2.1, 2.1, 2.1]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color={selected.color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <Html zIndexRange={[0, 5]} style={{ pointerEvents: 'none' }}>
            <div className="obs-label obs-label--planet is-active" style={{ borderColor: selected.color }}>
              <span className="obs-label-dot" style={{ background: selected.color, boxShadow: `0 0 10px ${selected.color}` }} />
              {selected.name}
            </div>
          </Html>
        </group>
      )}
    </>
  );
}
