import { lazy, Suspense, useRef, useState, type ReactNode } from 'react';
import { BookOpen, FileText, Quote } from 'lucide-react';
import { Link } from 'wouter';
import { BlackboardQuickNav } from './BlackboardQuickNav';
import { BlackboardPlayer } from './BlackboardPlayer';
import { BlackboardWallpaper } from './BlackboardWallpaper';
import { BlackboardWallpaperToggle } from './BlackboardWallpaperToggle';
import { GithubGlyph, StatsGlyph } from './marks';
import { useAdaptiveInk, useWallpaper } from './WallpaperProvider';
import './blackboard.css';
import './blackboard-github.css';
import './blackboard-stats.css';

// The graph only loads on /github; the home view never pays for it.
const GithubContributions = lazy(() => import('./GithubContributions'));
const SiteStats = lazy(() => import('./SiteStats'));

export type BlackboardView = 'home' | 'github' | 'stats';
const BTC_ADDR = 'bc1qmsexp4nygxcw0gklw346hds4gxctfley2tvn40';
const ETH_ADDR = '0xf5386e680d5629a6e1c04bb2bfd1b79a794467f5';

function WalletAddress({ address, chain, onCopy }: { address: string; chain: string; onCopy: (address: string, chain: string) => void }) {
  const copy = () => {
    onCopy(address, chain);
  };
  return <button className="bb-wallet-address" type="button" onClick={copy} aria-label={`Copy ${chain} address`}>
    {[...address].map((char, index) => <span key={`${chain}-${index}`}>{char}</span>)}
  </button>;
}

// Each tab measures the wallpaper behind itself. One measurement for the whole
// row averaged a split plate (black left, white right) into a single polarity,
// leaving whichever tab sat on the other pole dark-on-dark.
function LibraryTab({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const [ref, ink] = useAdaptiveInk<HTMLAnchorElement>();
  return <Link href={href} ref={ref} data-ink={ink}>{icon}<span>{label}</span></Link>;
}

// Drawn in currentColor rather than shipped as a white raster, so the mark
// takes whichever pole the wallpaper behind it calls for. It measures its own
// patch for the same reason the tabs do: the sweep can put a different pole
// under a 20px glyph than under the column centre the identity ink reads.
function GithubLink({ active }: { active: boolean }) {
  const [ref, ink] = useAdaptiveInk<HTMLAnchorElement>();
  return <Link href="/github" ref={ref} data-ink={ink} className="bb-mark bb-github" aria-label="GitHub contributions" aria-current={active ? 'page' : undefined}>
    <GithubGlyph />
  </Link>;
}

// The stats mark: the same size, weight, ink and active dot as the GitHub
// mark beside it (both drawn in ./marks).
function StatsLink({ active }: { active: boolean }) {
  const [ref, ink] = useAdaptiveInk<HTMLAnchorElement>();
  return <Link href="/stats" ref={ref} data-ink={ink} className="bb-mark bb-stats-link" aria-label="Site statistics" aria-current={active ? 'page' : undefined}>
    <StatsGlyph />
  </Link>;
}

async function copyAddress(address: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(address);
      return true;
    } catch {
      // Clipboard access can be unavailable in an embedded or insecure context.
      return false;
    }
}

/**
 * The Blackboard shell. `/` and `/github` render this same component, so going
 * between them keeps the wallpaper, header and dock mounted and only swaps
 * what stands in the middle: the player, or the contribution graph.
 */
export default function Blackboard({ view = 'home' }: { view?: BlackboardView }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copyTimer = useRef<number | undefined>(undefined);
  const { variant } = useWallpaper();

  // Ink is resolved per surface, not per page: the wallpaper is a photograph
  // whose top is near-black sky and whose bottom is brilliant white cloud, so
  // the identity column and the wallet rail need opposite poles. The player,
  // dock and toast sit on dark glass and stay pinned to the light pole.
  const [rootRef, rootInk] = useAdaptiveInk<HTMLElement>();
  const [identityRef, identityInk] = useAdaptiveInk<HTMLDivElement>();
  const [walletsRef, walletsInk] = useAdaptiveInk<HTMLDivElement>();

  const handleCopy = (address: string, chain: string) => {
    void copyAddress(address).then(success => {
      // Silence on failure read as a dead button, so say so.
      setCopied(success ? `${chain} address copied` : `Couldn't copy the ${chain} address`);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(null), 1400);
    });
  };

  return <main className="blackboard" data-wallpaper={variant} data-view={view} data-ink={rootInk} ref={rootRef}>
    <BlackboardWallpaper />
    <h1 className="sr-only">NUROCTANE</h1>
    <header className="bb-header">
      <div className="bb-header-row">
        <div className="bb-identity" data-ink={identityInk} ref={identityRef}>
          <Link href="/" className="bb-avatar" aria-label="Nuroctane home">
            <img src="/assets/nodes/site-logo-avatar.webp" alt="" width="56" height="64" fetchPriority="high" />
          </Link>
          <a className="bb-cal" href="https://cal.com/nuroctane/meeting-nuroctane" target="_blank" rel="noreferrer" aria-label="Book a meeting on Cal.com">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="1.5" y1="6.5" x2="14.5" y2="6.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="5" y1="1.5" x2="5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="11" y1="1.5" x2="11" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </a>
          <GithubLink active={view === 'github'} />
          <StatsLink active={view === 'stats'} />
          <div className="bb-wallets" data-ink={walletsInk} ref={walletsRef} aria-label="Cryptocurrency addresses">
            <div className="bb-wallet"><WalletAddress address={BTC_ADDR} chain="Bitcoin" onCopy={handleCopy} /></div>
            <div className="bb-wallet"><WalletAddress address={ETH_ADDR} chain="Ethereum" onCopy={handleCopy} /></div>
          </div>
        </div>
        <div className="bb-top-tabs" aria-label="Library links">
          <LibraryTab href="/books" icon={<BookOpen aria-hidden="true" />} label="Books" />
          <LibraryTab href="/quotes" icon={<Quote aria-hidden="true" />} label="Quotes" />
          <LibraryTab href="/blog" icon={<FileText aria-hidden="true" />} label="Blog" />
        </div>
      </div>
    </header>

    {/* The switcher is its own element centred beneath the player rather than
        inside its panel: the panel stays a pure player, and this wrapper is a
        plain layout div, so it adds no second region. /github keeps the same
        arrangement with the graph standing where the player was. */}
    {view === 'stats'
      ? <div className="bb-stats-stack">
        <div className="bb-stats-inner">
          <Suspense fallback={<div className="bb-stats-placeholder" aria-hidden="true" />}>
            <SiteStats />
          </Suspense>
          <BlackboardWallpaperToggle />
        </div>
      </div>
      : view === 'github'
      ? <div className="bb-gh-stack">
        <Suspense fallback={<div className="bb-gh-placeholder" aria-hidden="true" />}>
          <GithubContributions />
        </Suspense>
        <BlackboardWallpaperToggle />
      </div>
      : <div className="bb-player-stack">
        <BlackboardPlayer />
        <BlackboardWallpaperToggle />
      </div>}
    <div className="bb-copy-toast" data-ink="light" role="status" aria-live="polite" data-visible={Boolean(copied)}>{copied ?? ''}</div>

    <BlackboardQuickNav />
  </main>;
}
