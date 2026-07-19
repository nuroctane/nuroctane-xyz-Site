import { Suspense, lazy } from 'react';
import { ObservatoryHud } from './components/ObservatoryHud';
import { ObservatoryProvider, useObservatory } from './state/ObservatoryContext';
import { EarthSatellitesMode } from './modes/EarthSatellitesMode';
import './observatory.css';

const SolarSystemMode = lazy(() =>
  import('./modes/SolarSystemMode').then((m) => ({ default: m.SolarSystemMode })),
);
const SkyChartMode = lazy(() =>
  import('./modes/SkyChartMode').then((m) => ({ default: m.SkyChartMode })),
);
const MissionsMode = lazy(() =>
  import('./modes/MissionsMode').then((m) => ({ default: m.MissionsMode })),
);
const EarthExploreMode = lazy(() =>
  import('./modes/EarthExploreMode').then((m) => ({ default: m.EarthExploreMode })),
);

function ModeStage() {
  const { mode, earthSubmode } = useObservatory();

  if (mode === 'earth') {
    if (earthSubmode === 'explore') {
      return (
        <Suspense fallback={<div className="obs-loading">Loading globe…</div>}>
          <EarthExploreMode />
        </Suspense>
      );
    }
    return <EarthSatellitesMode />;
  }

  if (mode === 'solar') {
    return (
      <Suspense fallback={<div className="obs-loading">Computing heliocentric vectors…</div>}>
        <SolarSystemMode />
      </Suspense>
    );
  }

  if (mode === 'sky') {
    return (
      <Suspense fallback={<div className="obs-loading">Projecting celestial sphere…</div>}>
        <SkyChartMode />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="obs-loading">Loading mission catalog…</div>}>
      <MissionsMode />
    </Suspense>
  );
}

function Shell() {
  const { mode, earthSubmode } = useObservatory();
  const hideSidePanels = mode === 'earth' && earthSubmode === 'satellites';

  return (
    <div className={`obs-root${hideSidePanels ? ' obs-root--sat' : ''}`}>
      <ModeStage />
      <ObservatoryHud />
    </div>
  );
}

export default function ObservatoryApp() {
  return (
    <ObservatoryProvider>
      <Shell />
    </ObservatoryProvider>
  );
}
