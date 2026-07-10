import { Router, useLocation } from 'wouter';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import { AudioProvider } from './hooks/AudioContext';
import { resolveAnalytics } from './lib/analytics';
import './index.css';

const QuotesPage = lazy(() => import('./pages/QuotesPage'));
const BooksPage  = lazy(() => import('./pages/BooksPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const ModkeysPage = lazy(() => import('./pages/ModkeysPage'));

function Fallback() {
  return <div className="page-loading"><div className="page-loading-dot" /></div>;
}

/**
 * Strip share-hash noise and force the reported URL onto the resolved SPA path
 * so Top Pages groups by route (incl. /resume, /socials/:id, /blog/:slug, …).
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz';
    const u = new URL(event.url, origin);
    u.hash = '';
    // Prefer live wouter path when available (client SPA navigations)
    const live = typeof window !== 'undefined'
      ? resolveAnalytics(window.location.pathname + window.location.search)
      : resolveAnalytics(u.pathname);
    u.pathname = live.path;
    u.search = '';
    return { ...event, url: u.href };
  } catch {
    return event;
  }
}

/** Speed Insights v2 beforeSend — type must stay `vital`. */
function speedBeforeSend(event: { type: 'vital'; url: string; route?: string }) {
  try {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://www.nuroctane.xyz';
    const u = new URL(event.url, origin);
    u.hash = '';
    const live = typeof window !== 'undefined'
      ? resolveAnalytics(window.location.pathname)
      : resolveAnalytics(u.pathname);
    u.pathname = live.path;
    u.search = '';
    return { ...event, type: 'vital' as const, url: u.href, route: live.route };
  } catch {
    return event;
  }
}

function Telemetry() {
  const [location] = useLocation();
  const { path, route } = useMemo(() => resolveAnalytics(location), [location]);

  // path + route keep SPA client navigations attributed (Wouter pushState).
  // When Analytics `route` is set, auto-track is off — both path and route must be truthy.
  // mode=production: Vite does not always expose NODE_ENV the way Next does.
  return (
    <>
      <Analytics
        path={path}
        route={route}
        framework="react"
        mode="production"
        beforeSend={beforeSend}
      />
      <SpeedInsights
        route={route}
        framework="react"
        beforeSend={speedBeforeSend}
      />
    </>
  );
}

/** Route-aware document chrome (title). Favicon swap for modkeys lives in ModkeysPage. */
function useRouteTitle(path: string) {
  useEffect(() => {
    const top = path.replace(/^\//, '').split('/')[0] ?? '';
    if (top === 'modkeys') {
      document.title = 'MODKEYS';
      return;
    }
    if (top === 'quotes') {
      document.title = 'Quotes — NUROCTANE';
      return;
    }
    if (top === 'books') {
      document.title = 'Books — NUROCTANE';
      return;
    }
    if (top === 'resume') {
      document.title = 'Resume — NUROCTANE';
      return;
    }
    if (top === 'blog') {
      document.title = 'Writings — NUROCTANE';
      return;
    }
    if (top === 'socials') {
      document.title = 'Socials — NUROCTANE';
      return;
    }
    if (top === 'projects') {
      document.title = 'Projects — NUROCTANE';
      return;
    }
    if (top === 'fin') {
      document.title = 'Fin — NUROCTANE';
      return;
    }
    document.title = 'NUROCTANE';
  }, [path]);
}

function Root() {
  const [location] = useLocation();
  const { path } = useMemo(() => resolveAnalytics(location), [location]);
  useRouteTitle(path);

  const top = path === '/' ? '' : path.slice(1).split('/')[0];

  if (top === 'quotes') return <Suspense fallback={<Fallback />}><QuotesPage /></Suspense>;
  if (top === 'books')  return <Suspense fallback={<Fallback />}><BooksPage /></Suspense>;
  if (top === 'resume') return <Suspense fallback={<Fallback />}><ResumePage /></Suspense>;
  if (top === 'modkeys') return <Suspense fallback={<Fallback />}><ModkeysPage /></Suspense>;

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
