import { Router, useLocation } from 'wouter';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AudioProvider } from './hooks/AudioContext';
import { resolveAnalytics } from './lib/analytics';
import { initPostHog, capturePageview } from './lib/posthog';
import { applyDocumentMeta, resolvePageMeta } from './lib/pageMeta';
import './index.css';

const QuotesPage = lazy(() => import('./pages/QuotesPage'));
const BooksPage  = lazy(() => import('./pages/BooksPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const ModkeysPage = lazy(() => import('./pages/ModkeysPage'));
const CliPage    = lazy(() => import('./pages/CliPage'));
const ObservatoryPage = lazy(() => import('./pages/ObservatoryPage'));

function Fallback() {
  return <div className="page-loading"><div className="page-loading-dot" /></div>;
}

/**
 * Reports one pageview per resolved SPA route (incl. /resume, /socials/:id,
 * /blog/:slug, …) so Top Pages groups by route rather than raw URL.
 *
 * The Vercel integration needed two `beforeSend` hooks to rewrite the URL after
 * the fact. resolveAnalytics() already yields the resolved path, and
 * capturePageview() reports exactly that — so there is nothing left to rewrite.
 */
function Telemetry() {
  const [location] = useLocation();
  const { path, route } = useMemo(() => resolveAnalytics(location), [location]);

  useEffect(() => {
    initPostHog();
  }, []);

  // Re-fires on wouter pushState navigations, keeping SPA routes attributed.
  useEffect(() => {
    capturePageview(path, route);
  }, [path, route]);

  return null;
}

/** Route-aware document chrome (title + OG/meta for SPA navigations). */
function useRouteMeta(path: string) {
  useEffect(() => {
    applyDocumentMeta(resolvePageMeta(path));
  }, [path]);
}

function Root() {
  const [location] = useLocation();
  const { path } = useMemo(() => resolveAnalytics(location), [location]);
  useRouteMeta(path);

  const top = path === '/' ? '' : path.slice(1).split('/')[0];

  if (top === 'quotes') return <Suspense fallback={<Fallback />}><QuotesPage /></Suspense>;
  if (top === 'books')  return <Suspense fallback={<Fallback />}><BooksPage /></Suspense>;
  if (top === 'resume') return <Suspense fallback={<Fallback />}><ResumePage /></Suspense>;
  if (top === 'modkeys') return <Suspense fallback={<Fallback />}><ModkeysPage /></Suspense>;
  if (top === 'cli') return <Suspense fallback={<Fallback />}><CliPage /></Suspense>;
  if (top === 'observatory') {
    return <Suspense fallback={<Fallback />}><ObservatoryPage /></Suspense>;
  }

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
