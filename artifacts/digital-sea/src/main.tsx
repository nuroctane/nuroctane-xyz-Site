import { Router, useLocation } from 'wouter';
import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const QuotesPage = lazy(() => import('./pages/QuotesPage'));
const BooksPage  = lazy(() => import('./pages/BooksPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));

function Fallback() {
  return <div className="page-loading"><div className="page-loading-dot" /></div>;
}

function Root() {
  const [location] = useLocation();
  const path = location.replace(/^\//, '').toLowerCase();

  if (path === 'quotes') return <Suspense fallback={<Fallback />}><QuotesPage /></Suspense>;
  if (path === 'books')  return <Suspense fallback={<Fallback />}><BooksPage /></Suspense>;
  if (path === 'resume') return <Suspense fallback={<Fallback />}><ResumePage /></Suspense>;

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <Router><Root /></Router>,
);
