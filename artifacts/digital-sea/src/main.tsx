import { Router, useLocation } from 'wouter';
import { lazy, Suspense, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import { AudioProvider } from './hooks/AudioContext';
import './index.css';

const QuotesPage = lazy(() => import('./pages/QuotesPage'));
const BooksPage  = lazy(() => import('./pages/BooksPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const ModkeysPage = lazy(() => import('./pages/ModkeysPage'));

function Fallback() {
  return <div className="page-loading"><div className="page-loading-dot" /></div>;
}

/** Normalize wouter location to a pathname Vercel can attribute (SPA routes). */
function normalizePath(location: string): string {
  if (!location || location === '/') return '/';
  const withSlash = location.startsWith('/') ? location : `/${location}`;
  // Drop trailing slash except root; lowercase for stable grouping
  const trimmed = withSlash.replace(/\/+$/, '') || '/';
  return trimmed.toLowerCase();
}

/**
 * Strip share-hash noise from pageviews before they leave the browser.
 * Build state lives in the hash fragment and must not inflate unique URLs.
 * Keep an absolute URL (origin + path) — relative paths can fail Vercel intake.
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz';
    const u = new URL(event.url, origin);
    u.hash = '';
    return { ...event, url: u.href };
  } catch {
    return event;
  }
}

/** Speed Insights beforeSend — same hash strip / absolute URL as Analytics. */
function speedBeforeSend(event: { url: string; type?: string; route?: string }) {
  try {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz';
    const u = new URL(event.url, origin);
    u.hash = '';
    return { ...event, url: u.href };
  } catch {
    return event;
  }
}

function Telemetry() {
  const [location] = useLocation();
  const path = useMemo(() => normalizePath(location), [location]);
  // path + route keep SPA client navigations attributed (Wouter pushState).
  // When Analytics `route` is set, auto-track is off — both path and route must be truthy.
  // mode=production: Vite does not always expose NODE_ENV the way Next does.
  // SpeedInsights: @vercel/speed-insights v2 + route for SPA grouping (quickstart).
  return (
    <>
      <Analytics
        path={path}
        route={path}
        framework="react"
        mode="production"
        beforeSend={beforeSend}
      />
      <SpeedInsights
        route={path}
        framework="react"
        beforeSend={speedBeforeSend}
      />
    </>
  );
}

function Root() {
  const [location] = useLocation();
  const path = location.replace(/^\//, '').toLowerCase();

  if (path === 'quotes') return <Suspense fallback={<Fallback />}><QuotesPage /></Suspense>;
  if (path === 'books')  return <Suspense fallback={<Fallback />}><BooksPage /></Suspense>;
  if (path === 'resume') return <Suspense fallback={<Fallback />}><ResumePage /></Suspense>;
  if (path === 'modkeys') return <Suspense fallback={<Fallback />}><ModkeysPage /></Suspense>;

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <Router>
    <AudioProvider>
      <Root />
      <Telemetry />
    </AudioProvider>
  </Router>,
);
