import { Suspense, lazy } from 'react';
import { ObservatoryHud } from './components/ObservatoryHud';
import { ObservatoryProvider } from './state/ObservatoryContext';
import './observatory.css';

const UnifiedMode = lazy(() =>
  import('./modes/UnifiedMode').then((m) => ({ default: m.UnifiedMode })),
);

function Shell() {
  return (
    <div className="obs-root obs-root--unified">
      <Suspense fallback={<div className="obs-loading">Loading unified 3D dashboard — Cesium + solar system models…</div>}>
        <UnifiedMode />
      </Suspense>
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
