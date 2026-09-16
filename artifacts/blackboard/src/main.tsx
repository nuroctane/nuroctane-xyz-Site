import { Router, useLocation } from 'wouter';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import Blackboard from './blackboard/Blackboard';
import { WallpaperProvider } from './blackboard/WallpaperProvider';
import { SITE_MODE } from './config/siteMode';
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
const CurriculumPage = lazy(() => import('./pages/CurriculumPage'));
const BlackboardBooksPage = lazy(() => import('./pages/BlackboardPages').then(module => ({ default: module.BlackboardBooksPage })));
const BlackboardQuotesPage = lazy(() => import('./pages/BlackboardPages').then(module => ({ default: module.BlackboardQuotesPage })));
const BlackboardBlogPage = lazy(() => import('./pages/BlackboardPages').then(module => ({ default: module.BlackboardBlogPage })));
// Retain the Digital Sea and its deep links without loading it on the Blackboard.
const App = lazy(() => import('./App'));

function Fallback() {
  return <div className="page-loading"><div className="page-loading-dot" /></div>;
}

function BlackboardFallback() {
  return <div className="bb-loading" role="status" aria-label="Loading Blackboard"><span className="bb-loading-mark"><img src="/assets/nodes/site-logo.png" alt="" /></span><span className="bb-loading-line" /></div>;
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

  const fallback = SITE_MODE === 'blackboard' && top !== 'sea' ? <BlackboardFallback /> : <Fallback />;
  if (top === 'quotes') return <Suspense fallback={fallback}>{SITE_MODE === 'blackboard' ? <BlackboardQuotesPage /> : <QuotesPage />}</Suspense>;
  if (top === 'books')  return <Suspense fallback={fallback}>{SITE_MODE === 'blackboard' ? <BlackboardBooksPage /> : <BooksPage />}</Suspense>;
  if (top === 'blog') return <Suspense fallback={fallback}>{SITE_MODE === 'blackboard' ? <BlackboardBlogPage /> : <App />}</Suspense>;
  if (top === 'resume') return <Suspense fallback={fallback}><ResumePage /></Suspense>;
  if (top === 'modkeys') return <Suspense fallback={fallback}><ModkeysPage /></Suspense>;
  if (top === 'cli') return <Suspense fallback={fallback}><CliPage /></Suspense>;
  if (top === 'observatory') {
    return <Suspense fallback={fallback}><ObservatoryPage /></Suspense>;
  }
  if (top === 'curriculum') {
    return <Suspense fallback={fallback}><CurriculumPage /></Suspense>;
  }

  if (!top && SITE_MODE === 'blackboard') return <Blackboard />;
  if (top === 'sea' && SITE_MODE === 'blackboard') return <Suspense fallback={<Fallback />}><App /></Suspense>;
  return <Suspense fallback={fallback}><App /></Suspense>;
}

createRoot(document.getElementById('root')!).render(
  <Router>
    <AudioProvider>
      <WallpaperProvider>
        <Root />
      </WallpaperProvider>
      <Telemetry />
    </AudioProvider>
  </Router>,
);
