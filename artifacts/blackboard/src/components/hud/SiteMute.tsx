import { useLocation } from 'wouter';
import { SITE_MODE } from '../../config/siteMode';
import { MiniAudio } from './MiniAudio';

/**
 * One mute control, top right, on every Blackboard page: the NurCLI page's
 * icon-only glass square, made sitewide. It replaces the per-page copies
 * (CLI, Observatory, Resume) so there is never a second one, and the page it
 * sits on is named in a class so a page with its own top-right chrome
 * (MODKEYS, Observatory) can make room for it.
 *
 * The Digital Sea keeps its own score control; this stays out of it. So does
 * the home view, whose BlackboardPlayer already carries a mute button and a
 * volume slider — a sitewide copy in the top right would be a second control
 * for the same audio.
 */
export function SiteMute() {
  const [location] = useLocation();
  if (SITE_MODE !== 'blackboard') return null;
  const top = location.replace(/^\/+/, '').split(/[/?#]/)[0].toLowerCase();
  // /home and /identity render that same home view, so they lose it too.
  if (!top || top === 'home' || top === 'identity') return null;
  if (top === 'sea' || top === 'socials' || top === 'projects' || top === 'fin') return null;
  return <div className={`site-mute site-mute--${top}`}><MiniAudio /></div>;
}
