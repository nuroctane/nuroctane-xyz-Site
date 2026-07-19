import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { buildChart, getSwiss } from '../lib/ephemeris';
import { clampDate } from '../lib/math';
import {
  ASPECT_DEFS,
  DEFAULT_LAYERS,
  DEFAULT_OBSERVER,
  EPHEMERIS_MAX,
  EPHEMERIS_MIN,
  SATELLITE_GROUPS,
  defaultAspectEnabled,
  defaultBodyEnabled,
  defaultSatelliteEnabled,
  type AspectId,
  type BodyId,
  type ChartSnapshot,
  type ChartTypeId,
  type FortuneFormula,
  type HouseSystemId,
  type LayerState,
  type ObservatoryMode,
  type ZodiacMode,
  type NodeMode,
  type LilithMode,
  type SatelliteGroupId,
} from '../lib/types';
import type { SwissReady } from '../lib/swissEngine';

export type ObserverLoc = { lat: number; lon: number; alt?: number };

interface ObservatoryState {
  mode: ObservatoryMode;
  setMode: (m: ObservatoryMode) => void;
  time: Date;
  setTime: (d: Date) => void;
  speed: number;
  setSpeed: (s: number) => void;
  live: boolean;
  setLive: (v: boolean) => void;
  returnToLive: () => void;
  zodiac: ZodiacMode;
  setZodiac: (z: ZodiacMode) => void;
  ayanamsaId: number;
  setAyanamsaId: (id: number) => void;
  houseSystem: HouseSystemId;
  setHouseSystem: (h: HouseSystemId) => void;
  chartType: ChartTypeId;
  setChartType: (t: ChartTypeId) => void;
  birthDate: Date | null;
  setBirthDate: (d: Date | null) => void;
  secondDate: Date | null;
  setSecondDate: (d: Date | null) => void;
  secondObserver: ObserverLoc;
  setSecondObserver: (o: ObserverLoc) => void;
  fortuneFormula: FortuneFormula;
  setFortuneFormula: (f: FortuneFormula) => void;
  orbScale: number;
  setOrbScale: (n: number) => void;
  enabledBodies: Record<BodyId, boolean>;
  setBodyEnabled: (id: BodyId, on: boolean) => void;
  toggleBody: (id: BodyId) => void;
  enabledAspects: Record<AspectId, boolean>;
  setAspectEnabled: (id: AspectId, on: boolean) => void;
  toggleAspect: (id: AspectId) => void;
  enableAspectFamily: (family: 'ptolemaic' | 'minor' | 'harmonic' | 'declination', on: boolean) => void;
  layers: LayerState;
  toggleLayer: (k: keyof LayerState) => void;
  setLayer: (k: keyof LayerState, v: boolean) => void;
  observer: ObserverLoc;
  setObserver: (o: ObserverLoc) => void;
  chart: ChartSnapshot;
  selectedPlanet: string | null;
  setSelectedPlanet: (id: string | null) => void;
  selectedMission: string | null;
  setSelectedMission: (id: string | null) => void;
  query: string;
  setQuery: (q: string) => void;
  earthSubmode: 'satellites' | 'explore';
  setEarthSubmode: (m: 'satellites' | 'explore') => void;
  swissReady: boolean;
  swissVersion: string | null;
  hudOpen: boolean;
  setHudOpen: (v: boolean) => void;
  systemsPanel: 'layers' | 'zodiac' | 'houses' | 'bodies' | 'aspects' | 'chart' | 'observer' | 'advanced' | 'satellites' | 'anchors';
  setSystemsPanel: (p: ObservatoryState['systemsPanel']) => void;

  // Advanced system toggles — comprehensive Time Nomad parity
  topocentric: boolean;
  setTopocentric: (v: boolean) => void;
  heliocentric: boolean;
  setHeliocentric: (v: boolean) => void;
  nodeMode: NodeMode;
  setNodeMode: (m: NodeMode) => void;
  lilithMode: LilithMode;
  setLilithMode: (m: LilithMode) => void;

  // Satellite field — orbit veil full capacity
  enabledSatGroups: Record<SatelliteGroupId, boolean>;
  setSatGroupEnabled: (id: SatelliteGroupId, on: boolean) => void;
  toggleSatGroup: (id: SatelliteGroupId) => void;
  setAllSatGroups: (on: boolean) => void;
  selectedSatId: string | null;
  setSelectedSatId: (id: string | null) => void;
  satSearch: string;
  setSatSearch: (q: string) => void;
  followSat: boolean;
  setFollowSat: (v: boolean) => void;
  showGroundTrack: boolean;
  setShowGroundTrack: (v: boolean) => void;
  showOrbitTrail: boolean;
  setShowOrbitTrail: (v: boolean) => void;

  // Planet anchors — fly to any planet
  anchorPlanet: BodyId | 'Sun' | null;
  setAnchorPlanet: (id: BodyId | 'Sun' | null) => void;

  // Natal vs current comparison
  natalChart: ChartSnapshot | null;
}

const Ctx = createContext<ObservatoryState | null>(null);

export const SPEEDS = [-86400, -3600, -240, -60, -10, -1, 0, 1, 10, 60, 240, 3600, 86400, 604800];

export function ObservatoryProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ObservatoryMode>('sky');
  const [time, setTimeState] = useState(() => new Date());
  const [speed, setSpeed] = useState(1);
  const [live, setLive] = useState(true);
  const [zodiac, setZodiac] = useState<ZodiacMode>('sidereal');
  const [ayanamsaId, setAyanamsaId] = useState(1);
  const [houseSystem, setHouseSystem] = useState<HouseSystemId>('P');
  const [chartType, setChartType] = useState<ChartTypeId>('moment');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [secondDate, setSecondDate] = useState<Date | null>(null);
  const [secondObserver, setSecondObserverState] = useState<ObserverLoc>(DEFAULT_OBSERVER);
  const [fortuneFormula, setFortuneFormula] = useState<FortuneFormula>('auto');
  const [orbScale, setOrbScale] = useState(1);
  const [enabledBodies, setEnabledBodies] = useState(defaultBodyEnabled);
  const [enabledAspects, setEnabledAspects] = useState(defaultAspectEnabled);
  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS);
  const [observer, setObserverState] = useState<ObserverLoc>(DEFAULT_OBSERVER);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [earthSubmode, setEarthSubmode] = useState<'satellites' | 'explore'>('satellites');
  const [swiss, setSwiss] = useState<SwissReady | null>(null);
  const [swissVersion, setSwissVersion] = useState<string | null>(null);
  const [hudOpen, setHudOpen] = useState(true);
  const [systemsPanel, setSystemsPanel] = useState<ObservatoryState['systemsPanel']>('zodiac');
  const raf = useRef<number | null>(null);
  const last = useRef<number>(performance.now());

  // Exhaustive toggles
  const [topocentric, setTopocentric] = useState(false);
  const [heliocentric, setHeliocentric] = useState(false);
  const [nodeMode, setNodeMode] = useState<NodeMode>('mean');
  const [lilithMode, setLilithMode] = useState<LilithMode>('mean');

  // Satellite field — orbit veil full features
  const [enabledSatGroups, setEnabledSatGroups] = useState(defaultSatelliteEnabled);
  const [selectedSatId, setSelectedSatId] = useState<string | null>(null);
  const [satSearch, setSatSearch] = useState('');
  const [followSat, setFollowSat] = useState(false);
  const [showGroundTrack, setShowGroundTrack] = useState(true);
  const [showOrbitTrail, setShowOrbitTrail] = useState(true);
  const [anchorPlanet, setAnchorPlanet] = useState<BodyId | 'Sun' | null>('Earth');

  useEffect(() => {
    let cancelled = false;
    getSwiss()
      .then((s) => {
        if (cancelled) return;
        setSwiss(s);
        setSwissVersion(s.version);
      })
      .catch((err) => {
        console.warn('[observatory] Swiss init failed, using fallback', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setTime = useCallback((d: Date) => {
    setTimeState(clampDate(d, EPHEMERIS_MIN, EPHEMERIS_MAX));
    setLive(false);
  }, []);

  const returnToLive = useCallback(() => {
    setTimeState(new Date());
    setSpeed(1);
    setLive(true);
  }, []);

  const setObserver = useCallback((o: ObserverLoc) => {
    setObserverState({ lat: o.lat, lon: o.lon, alt: o.alt ?? 10 });
  }, []);

  const setSecondObserver = useCallback((o: ObserverLoc) => {
    setSecondObserverState({ lat: o.lat, lon: o.lon, alt: o.alt ?? 10 });
  }, []);

  const toggleLayer = useCallback((k: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [k]: !prev[k] }));
  }, []);

  const setLayer = useCallback((k: keyof LayerState, v: boolean) => {
    setLayers((prev) => ({ ...prev, [k]: v }));
  }, []);

  const setBodyEnabled = useCallback((id: BodyId, on: boolean) => {
    setEnabledBodies((prev) => ({ ...prev, [id]: on }));
  }, []);

  const toggleBody = useCallback((id: BodyId) => {
    setEnabledBodies((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setAspectEnabled = useCallback((id: AspectId, on: boolean) => {
    setEnabledAspects((prev) => ({ ...prev, [id]: on }));
  }, []);

  const toggleAspect = useCallback((id: AspectId) => {
    setEnabledAspects((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const enableAspectFamily = useCallback((family: 'ptolemaic' | 'minor' | 'harmonic' | 'declination', on: boolean) => {
    setEnabledAspects((prev) => {
      const next = { ...prev };
      for (const ad of ASPECT_DEFS) if (ad.family === family) (next as any)[ad.id] = on;
      return next;
    });
  }, []);

  const setSatGroupEnabled = useCallback((id: SatelliteGroupId, on: boolean) => {
    setEnabledSatGroups((prev) => ({ ...prev, [id]: on }));
  }, []);
  const toggleSatGroup = useCallback((id: SatelliteGroupId) => {
    setEnabledSatGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
  const setAllSatGroups = useCallback((on: boolean) => {
    const next = {} as Record<SatelliteGroupId, boolean>;
    for (const g of SATELLITE_GROUPS) next[g.id] = on;
    setEnabledSatGroups(next);
  }, []);

  useEffect(() => {
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      if (live) setTimeState(new Date());
      else if (speed !== 0) {
        setTimeState((t) =>
          clampDate(new Date(t.getTime() + dt * speed * 1000), EPHEMERIS_MIN, EPHEMERIS_MAX),
        );
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [live, speed]);

  const [chartTick, setChartTick] = useState(0);
  useEffect(() => {
    if (!live) {
      setChartTick((n) => n + 1);
      return;
    }
    const id = window.setInterval(() => setChartTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [
    live,
    time,
    zodiac,
    ayanamsaId,
    houseSystem,
    enabledBodies,
    enabledAspects,
    chartType,
    birthDate,
    secondDate,
    fortuneFormula,
    orbScale,
    observer,
    swiss,
    topocentric,
    heliocentric,
    nodeMode,
    lilithMode,
  ]);

  const chart = useMemo(
    () =>
      buildChart({
        date: time,
        zodiac,
        ayanamsaId,
        houseSystem,
        observer,
        enabledBodies,
        enabledAspects,
        fortuneFormula,
        chartType,
        birthDate,
        secondDate,
        secondObserver,
        orbScale,
        swiss,
        topocentric,
        heliocentric,
        trueNode: nodeMode === 'true',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chartTick, time, zodiac, ayanamsaId, houseSystem, observer, enabledBodies, enabledAspects, fortuneFormula, chartType, birthDate, secondDate, secondObserver, orbScale, swiss, topocentric, heliocentric, nodeMode, lilithMode],
  );

  const natalChart = useMemo<ChartSnapshot | null>(() => {
    if (!birthDate) return null;
    try {
      return buildChart({
        date: birthDate,
        zodiac,
        ayanamsaId,
        houseSystem,
        observer,
        enabledBodies,
        enabledAspects,
        fortuneFormula,
        chartType: 'natal',
        birthDate: null,
        secondDate: null,
        secondObserver,
        orbScale,
        swiss,
        topocentric,
        heliocentric: false,
        trueNode: nodeMode === 'true',
      });
    } catch {
      return null;
    }
  }, [birthDate, zodiac, ayanamsaId, houseSystem, observer, enabledBodies, enabledAspects, fortuneFormula, secondObserver, orbScale, swiss, topocentric, nodeMode, chartTick]);

  // Apply node/lilith mode side-effects to enabledBodies for UX (toggle shows which is active)
  useEffect(() => {
    setEnabledBodies((prev) => {
      const next = { ...prev };
      if (nodeMode === 'mean') {
        next['MeanNode'] = prev['MeanNode'] ?? true;
      } else {
        next['TrueNode'] = prev['TrueNode'] ?? true;
      }
      return next;
    });
  }, [nodeMode]);

  const value = useMemo<ObservatoryState>(
    () => ({
      mode,
      setMode,
      time,
      setTime,
      speed,
      setSpeed: (s: number) => {
        setSpeed(s);
        if (s !== 1) setLive(false);
      },
      live,
      setLive,
      returnToLive,
      zodiac,
      setZodiac,
      ayanamsaId,
      setAyanamsaId,
      houseSystem,
      setHouseSystem,
      chartType,
      setChartType,
      birthDate,
      setBirthDate,
      secondDate,
      setSecondDate,
      secondObserver,
      setSecondObserver,
      fortuneFormula,
      setFortuneFormula,
      orbScale,
      setOrbScale,
      enabledBodies,
      setBodyEnabled,
      toggleBody,
      enabledAspects,
      setAspectEnabled,
      toggleAspect,
      enableAspectFamily,
      layers,
      toggleLayer,
      setLayer,
      observer,
      setObserver,
      chart,
      selectedPlanet,
      setSelectedPlanet,
      selectedMission,
      setSelectedMission,
      query,
      setQuery,
      earthSubmode,
      setEarthSubmode,
      swissReady: !!swiss,
      swissVersion,
      hudOpen,
      setHudOpen,
      systemsPanel,
      setSystemsPanel,
      topocentric,
      setTopocentric,
      heliocentric,
      setHeliocentric,
      nodeMode,
      setNodeMode,
      lilithMode,
      setLilithMode,
      enabledSatGroups,
      setSatGroupEnabled,
      toggleSatGroup,
      setAllSatGroups,
      selectedSatId,
      setSelectedSatId,
      satSearch,
      setSatSearch,
      followSat,
      setFollowSat,
      showGroundTrack,
      setShowGroundTrack,
      showOrbitTrail,
      setShowOrbitTrail,
      anchorPlanet,
      setAnchorPlanet,
      natalChart,
    }),
    [
      mode, time, setTime, speed, live, returnToLive, zodiac, ayanamsaId, houseSystem,
      chartType, birthDate, secondDate, secondObserver, setSecondObserver, fortuneFormula, orbScale,
      enabledBodies, setBodyEnabled, toggleBody, enabledAspects, setAspectEnabled, toggleAspect,
      enableAspectFamily, layers, toggleLayer, setLayer, observer, setObserver, chart, selectedPlanet,
      selectedMission, query, earthSubmode, swiss, swissVersion, hudOpen, systemsPanel,
      topocentric, heliocentric, nodeMode, lilithMode,
      enabledSatGroups, setSatGroupEnabled, toggleSatGroup, setAllSatGroups,
      selectedSatId, satSearch, followSat, showGroundTrack, showOrbitTrail, anchorPlanet, natalChart,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useObservatory(): ObservatoryState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useObservatory outside provider');
  return ctx;
}
