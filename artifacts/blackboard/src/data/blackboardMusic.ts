import { refreshShuffledChoice } from '../lib/refreshChoice';

/* ═══════════════════════════════════════════════════════════════════════════
   BLACKBOARD MUSIC — the blackboard's own library.

   Deliberately separate from the digital-sea score in AudioContext: none of
   these tracks belong to that soundtrack, and that one is not reachable from
   here.

   Each entry is an asset pair under public/assets/nodes/music/:

     <id>.mp3  128 kbps, transcoded from the verified source recording
     <id>.jpg  512x512 artwork, centre-cropped from the file's own cover

   That tree lives under /assets/nodes/ on purpose: worker/index.ts range-serves
   *.mp3 there, because Workers Static Assets ignore Range and the player's
   scrub bar needs real 206 responses.

   No outbound links are carried here, and none should be added. The player
   shows metadata only — nothing that leads back to a source.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface BlackboardTrack {
  /** Also the asset basename, so keep it a URL-safe slug. */
  id: string;
  artist: string;
  title: string;
}

export const BLACKBOARD_MUSIC: readonly BlackboardTrack[] = [
  { id: 'difference-interlude', artist: 'XXXTENTACION', title: 'difference (interlude)' },
  { id: 'the-interlude-that-never-ends', artist: 'XXXTENTACION', title: 'the interlude that never ends/Ugly' },
  { id: 'love-yourself-interlude', artist: 'XXXTENTACION', title: 'love yourself (interlude) (Instrumental)' },
  { id: 'girl-next-door', artist: 'Heavenly Snow', title: 'Girl next door' },
  { id: 'poison-tree', artist: 'Grouper', title: 'Poison Tree' },
  { id: 'about-yesterday', artist: 'Greaf', title: 'About Yesterday' },
  { id: 'surrounded', artist: 'Greaf', title: 'Surrounded' },
  { id: 'leave-your-dreams-behind', artist: 'Greaf', title: 'Leave Your Dreams Behind' },
  { id: 'gates', artist: 'Greaf', title: 'Gates' },
  { id: 'hey-nightmare', artist: 'Greaf', title: 'Hey Nightmare' },
  { id: 'i-dont-know-where-im-going', artist: "Greaf", title: "I Don't Know Where I'm Going" },
  { id: 'its-inevitable', artist: 'COCAINEJESUS', title: "Its inevitable, but I wish it could've lasted longer (W/Lion's Maneライオンのたてがみ)" },
  { id: 'boot-struggle', artist: 'Tyler Bates', title: 'Boot Struggle' },
  { id: 'pearl-jam-jam', artist: 'Circa Survive', title: 'Pearl Jam Jam' },
  { id: 'whatever-i-say-is-royal-ocean', artist: 'Dance Gavin Dance', title: 'Whatever I Say is Royal Ocean' },
  { id: 'thats-allwekando', artist: 'Knxwledge', title: 'thats allwekando.' },
  { id: 'directions', artist: 'Knumears', title: 'Directions' },
  { id: 'nuts-slowed', artist: 'Lil Peep', title: 'Nuts (Slowed)' },
  { id: 'recovery-2814', artist: '2814', title: '恢复' },
  { id: 'honshirabe', artist: 'Adrian Freedman', title: 'Honshirabe' },
  { id: 'alameda-vieja', artist: 'Moraíto', title: 'Alameda Vieja' },
  { id: 'colors-speak-true', artist: 'Tides of Man', title: 'Colors Speak True' },
  { id: 'under-the-house', artist: 'Greaf', title: 'Under The House' },
  { id: 'untitled-instrumental', artist: 'Dance Gavin Dance', title: 'Untitled (Instrumental)' },
  { id: 'the-backwards-pumpkin-song-instrumental', artist: 'Dance Gavin Dance', title: 'The Backwards Pumpkin Song (Instrumental)' },
  { id: 'connector-instrumental', artist: 'A Lot Like Birds', title: 'Connector (Instrumental)' },
  { id: 'david', artist: 'Animals as Leaders', title: 'David' },
  { id: 'in-deep-at-your-expense', artist: 'Manacle', title: 'In Deep At Your Expense' },
  { id: 'discoveries', artist: 'Northlane', title: 'Discoveries' },
  { id: 'horizon', artist: 'Nujabes', title: 'Horizon' },
  { id: 'dawn-on-the-side', artist: 'Nujabes', title: 'Dawn on the Side' },
];

/** Path relative to /assets/nodes/ — AudioContext resolves it against BASE_URL. */
export function blackboardAudioPath(track: BlackboardTrack): string {
  return `music/${track.id}.mp3`;
}

export function blackboardArtworkSrc(track: BlackboardTrack): string {
  return `${import.meta.env.BASE_URL}assets/nodes/music/${track.id}.jpg`;
}

let resolvedTrack: BlackboardTrack | null = null;

/**
 * Which track this page view plays.
 *
 * A shuffled full-library rotation excluding the last five tracks in this tab,
 * including across rotation boundaries. History survives refreshes; the module
 * memo keeps route changes on the same track.
 *
 * There is deliberately no way to move off the draw once it is made: no skip,
 * no next, no chooser. The visitor commits to one piece of music for the visit.
 *
 * Memoised at module scope so React re-invoking the initialiser (StrictMode)
 * cannot burn two draws in a single load.
 */
export function blackboardMusicPick(): BlackboardTrack {
  if (resolvedTrack) return resolvedTrack;
  resolvedTrack = refreshShuffledChoice('bb:last-track', BLACKBOARD_MUSIC, track => track.id);
  return resolvedTrack;
}
