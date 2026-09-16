import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronUp, Grid2X2, Network } from 'lucide-react';
import { Link } from 'wouter';
import { directoryEntries } from '../data/directory';
import { LOGO_MAP } from '../data/navLogos';
import malLogo from '../assets/secondary-nodes/anilist-mal-logo-sidecard.png';
import './blackboard.css';

type Destination = { id: string; label: string; url: string; logo?: string; secondary?: Destination };

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
const orderedProjects = ['nur-cli', 'hoodstock', 'observatory', 'modkeys', 'miyamaker', 'sis'].map(find).reverse();
const groups = {
  projects: [find('webutils'), ...soonProjects, { id: 'ios-downloader', label: 'iOS Shortcut: Downloader', url: 'https://routinehub.co/shortcut/26384/', logo: '/assets/nodes/routinehub-logo.png' }, ...orderedProjects],
  socials: ['instagram', 'atxtunerz', 'x', 'discord', 'substack', 'remilia', 'glasp', 'steam', 'anilist', 'goodreads', 'letterboxd', 'reddit', 'kick', 'twitch', 'youtube', 'soundcloud']
    .map(find)
    .map(entry => entry.id === 'anilist' ? { ...entry, secondary: { id: 'mal', label: 'MAL', logo: malLogo, url: 'https://myanimelist.net/profile/nuroctane' } } : entry),
};
type Group = keyof typeof groups;

function DestinationLink({ entry }: { entry: Destination }) {
  const [imageFailed, setImageFailed] = useState(false);
  const content = <>
    <span className={`bb-link-mark${entry.id === 'mal' ? ' bb-link-mark--mal' : ''}`}>
      {imageFailed ? <span>{entry.label.slice(0, 2)}</span> : entry.logo ? <img src={entry.logo} alt="" width="24" height="24" onError={() => setImageFailed(true)} /> : <span>{entry.label.slice(0, 2)}</span>}
    </span>
    <span className="bb-link-label">{entry.label}</span>
    {entry.url === '#' ? <span className="bb-soon">Soon</span> : entry.url.startsWith('/') ? <ArrowDownRight aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
  </>;
  if (entry.url === '#') return <span className="bb-link bb-link--disabled" aria-disabled="true">{content}</span>;
  if (entry.url.startsWith('/')) return <Link className="bb-link" href={entry.url}>{content}</Link>;
  return <a className="bb-link" href={entry.url}>{content}</a>;
}

function DestinationRow({ entry }: { entry: Destination }) {
  return <li className={entry.secondary ? 'bb-link-row' : undefined}>
    <div className="bb-link-row-main"><DestinationLink entry={entry} /></div>
    {entry.secondary && <div className="bb-link-row-secondary"><DestinationLink entry={entry.secondary} /></div>}
  </li>;
}

export function BlackboardQuickNav({ standalone = false }: { standalone?: boolean }) {
  const [open, setOpen] = useState<Group | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const [visible, setVisible] = useState(!standalone);
  const nav = useRef<HTMLElement>(null);
  const triggers = useRef<Partial<Record<Group, HTMLButtonElement | null>>>({});

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  return <nav className={`bb-nav${standalone ? ` bb-standalone-nav${visible ? ' bb-standalone-nav--open' : ''}` : ''}`} aria-label="Quick navigation" ref={nav} data-keyboard={keyboard}
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
            aria-expanded={expanded} aria-controls={`bb-${group}`} id={`bb-${group}-trigger`}
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
    {standalone && <button className="bb-nav-reveal" type="button" aria-expanded={visible} aria-label={visible ? 'Hide site navigation' : 'Show site navigation'} onClick={() => { setVisible(value => !value); setOpen(null); }}>
      <ChevronUp aria-hidden="true" />
    </button>}
  </nav>;
}
