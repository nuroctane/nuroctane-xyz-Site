import { Suspense, lazy } from 'react';
import { ObservatoryProvider } from './state/ObservatoryContext';
import { ObservatoryHud } from './components/ObservatoryHud';
import './observatory.css';

const UnifiedWorld = lazy(() => import('./modes/UnifiedWorld').then((m) => ({ default: m.UnifiedWorld })));

// Displacement map for the liquid-glass lens: R encodes x-offset, G encodes y-offset,
// a blurred neutral-gray core keeps the center undistorted so only edges refract
// (same optics as liquidGL / liquid-glass-js, done with native backdrop-filter).
const LENS_MAP = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>" +
    "<defs>" +
    "<linearGradient id='gx' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>" +
    "<linearGradient id='gy' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>" +
    "</defs>" +
    "<rect width='300' height='300' fill='url(#gx)'/>" +
    "<rect width='300' height='300' fill='url(#gy)' style='mix-blend-mode:screen'/>" +
    "<rect x='18' y='18' width='264' height='264' rx='30' fill='#7f7f7f' style='filter:blur(16px)'/>" +
  '</svg>',
)}`;

function GlassFilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        <filter id="obs-lens" x="-12%" y="-12%" width="124%" height="124%" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
          <feImage href={LENS_MAP} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="52" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="obs-lens-soft" x="-12%" y="-12%" width="124%" height="124%" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
          <feImage href={LENS_MAP} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="24" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

function Shell() {
  return (
    <div className="obs-root obs-root--unified">
      <GlassFilterDefs />
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
