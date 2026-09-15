import { Suspense, lazy } from 'react';
import { ObservatoryProvider } from './state/ObservatoryContext';
import { ObservatoryHud } from './components/ObservatoryHud';
import './observatory.css';

const UnifiedWorld = lazy(() => import('./modes/UnifiedWorld').then((m) => ({ default: m.UnifiedWorld })));

function Shell() {
  return (
    <div className="obs-root obs-root--unified">
      <Suspense fallback={<div className="obs-loading">Loading observatory — one unified world…</div>}>
        <UnifiedWorld />
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
