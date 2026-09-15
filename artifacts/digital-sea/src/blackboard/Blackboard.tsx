import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BookOpen, ChevronUp, FileText, Grid2X2, Network, Quote } from 'lucide-react';
import { directoryEntries } from '../data/directory';
import { LOGO_MAP } from '../data/navLogos';
import malLogo from '../assets/secondary-nodes/anilist-mal-logo-sidecard.png';
import './blackboard.css';

type Destination = { id: string; label: string; url: string; logo?: string; icon?: typeof Quote; secondary?: Destination };
const destinations: Destination[] = directoryEntries.map(entry => ({
  id: entry.id,
  label: entry.navLabel ?? entry.label,
  url: entry.url.replace(/^https?:\/\/(www\.)?nuroctane\.xyz(?=\/|$)/, '') || '/',
  logo: LOGO_MAP[entry.id] || entry.avatar || entry.logo,
}));
const find = (id: string) => destinations.find(entry => entry.id === id)!;
const soonProjects: Destination[] = [
  { id: 'starsleep', label: 'StarSleep', url: '#', logo: find('starsleep').logo },
  { id: 'blackjack', label: 'Blackjack', url: '#', logo: find('blackjack').logo },
  { id: 'geoskin', label: 'CS Skin Creations', url: '#', logo: find('geoskin').logo },
];
const orderedProjects = ['nur-cli', 'hoodstock', 'atxtunerz', 'observatory', 'modkeys', 'miyamaker', 'sis'].map(find).reverse();
const groups = {
  projects: [find('webutils'), ...soonProjects, ...orderedProjects],
  socials: ['instagram', 'x', 'discord', 'substack', 'remilia', 'glasp', 'steam', 'anilist', 'goodreads', 'letterboxd', 'reddit', 'kick', 'twitch', 'youtube', 'soundcloud']
    .map(find)
    .map(entry => entry.id === 'anilist' ? { ...entry, secondary: { id: 'mal', label: 'MAL', logo: malLogo, url: 'https://myanimelist.net/profile/nuroctane' } } : entry),
};
const BTC_ADDR = 'bc1qmsexp4nygxcw0gklw346hds4gxctfley2tvn40';
const ETH_ADDR = '0xf5386e680d5629a6e1c04bb2bfd1b79a794467f5';
type Group = keyof typeof groups;

function DestinationLink({ entry }: { entry: Destination }) {
  const [imageFailed, setImageFailed] = useState(false);
  const content = <>
    <span className={`bb-link-mark${entry.id === 'mal' ? ' bb-link-mark--mal' : ''}`}>
      {imageFailed ? <span>{entry.label.slice(0, 2)}</span> :
        (entry.icon ? <entry.icon aria-hidden="true" /> : entry.logo ? <img src={entry.logo} alt="" width="24" height="24" onError={() => setImageFailed(true)} /> : <span>{entry.label.slice(0, 2)}</span>)}
    </span>
    <span className="bb-link-label">{entry.label}</span>
    {entry.url === '#' ? <span className="bb-soon">Soon</span> :
      entry.url.startsWith('/') ? <ArrowDownRight aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
  </>;
  return entry.url === '#' ?
    <span className="bb-link bb-link--disabled" aria-disabled="true">{content}</span> :
    <a className="bb-link" href={entry.url}>{content}</a>;
}

function DestinationRow({ entry }: { entry: Destination }) {
  return <li className={entry.secondary ? 'bb-link-row' : undefined}>
    <div className="bb-link-row-main"><DestinationLink entry={entry} /></div>
    {entry.secondary && <div className="bb-link-row-secondary"><DestinationLink entry={entry.secondary} /></div>}
  </li>;
}

function WalletAddress({ address, chain, onCopy }: { address: string; chain: string; onCopy: (address: string, chain: string) => void }) {
  const copy = () => {
    onCopy(address, chain);
  };
  return <button className="bb-wallet-address" type="button" onClick={copy} aria-label={`Copy ${chain} address`}>
    {[...address].map((char, index) => <span key={`${chain}-${index}`}>{char}</span>)}
  </button>;
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

export default function Blackboard() {
  const [open, setOpen] = useState<Group | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const nav = useRef<HTMLElement>(null);
  const triggers = useRef<Partial<Record<Group, HTMLButtonElement | null>>>({});
  const copyTimer = useRef<number | undefined>(undefined);

  const handleCopy = (address: string, chain: string) => {
    void copyAddress(address).then(success => {
      if (!success) return;
      setCopied(chain);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(null), 1400);
    });
  };

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  return <main className="blackboard">
    <h1 className="sr-only">NUROCTANE</h1>
    <header className="bb-header">
      <div className="bb-header-row">
        <div className="bb-identity">
          <a href="/" className="bb-avatar" aria-label="Nuroctane home">
            <img src="/assets/nodes/site-logo.png" alt="" width="56" height="64" fetchPriority="high" />
          </a>
          <a className="bb-cal" href="https://cal.com/nuroctane/meeting-nuroctane" target="_blank" rel="noreferrer" aria-label="Book a meeting on Cal.com">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="1.5" y1="6.5" x2="14.5" y2="6.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="5" y1="1.5" x2="5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="11" y1="1.5" x2="11" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </a>
          <a className="bb-github" href="https://github.com/nuroctane" target="_blank" rel="noreferrer" aria-label="Nuroctane on GitHub">
            <img src={LOGO_MAP.github} alt="" width="20" height="20" />
          </a>
          <div className="bb-wallets" aria-label="Cryptocurrency addresses">
            <div className="bb-wallet"><WalletAddress address={BTC_ADDR} chain="Bitcoin" onCopy={handleCopy} /></div>
            <div className="bb-wallet"><WalletAddress address={ETH_ADDR} chain="Ethereum" onCopy={handleCopy} /></div>
          </div>
        </div>
        <div className="bb-top-tabs" aria-label="Library links">
          <a href="/books"><BookOpen aria-hidden="true" /><span>Books</span></a>
          <a href="/quotes"><Quote aria-hidden="true" /><span>Quotes</span></a>
          <a href="/blog"><FileText aria-hidden="true" /><span>Blog</span></a>
        </div>
      </div>
    </header>

    <div className="bb-copy-toast" role="status" aria-live="polite" data-visible={Boolean(copied)}>{copied ? `${copied} address copied` : ''}</div>

    <nav className="bb-nav" aria-label="Quick navigation" ref={nav} data-keyboard={keyboard}
      onPointerDown={() => setKeyboard(false)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(null);
      }}
      onKeyDown={event => {
        setKeyboard(true);
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          triggers.current[open]?.focus();
          setOpen(null);
        }
      }}>
      <div className="bb-dock">
        {(Object.keys(groups) as Group[]).map(group => {
          const expanded = open === group;
          const Icon = group === 'projects' ? Grid2X2 : Network;
          return <div className="bb-group" key={group}>
            <button className="bb-trigger" type="button"
              ref={element => { triggers.current[group] = element; }}
              aria-expanded={expanded} aria-controls={`bb-${group}`}
              id={`bb-${group}-trigger`}
              onClick={event => {
                setKeyboard(event.detail === 0);
                setOpen(expanded ? null : group);
              }}>
              <Icon aria-hidden="true" />
              <span>{group === 'projects' ? 'Projects' : 'Socials'}</span>
              <ChevronUp className="bb-chevron" aria-hidden="true" />
            </button>
            <section id={`bb-${group}`} className="bb-panel" aria-labelledby={`bb-${group}-trigger`}
              inert={!expanded} aria-hidden={!expanded} data-open={expanded}>
              <div className="bb-panel-heading">
                <span>{group === 'projects' ? 'Projects' : 'Socials'}</span>
                <span>{String(groups[group].length).padStart(2, '0')}</span>
              </div>
              <ul className="bb-links">{groups[group].map(entry => <DestinationRow key={entry.id} entry={entry} />)}</ul>
            </section>
          </div>;
        })}
      </div>
    </nav>
  </main>;
}
