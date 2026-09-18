/* ═══════════════════════════════════════════════════════════════════════════
   BLACKBOARD MUSIC — the blackboard's own library.

   Deliberately separate from the digital-sea score in AudioContext: none of
   these tracks belong to that soundtrack, and that one is not reachable from
   here.

   Each entry is an asset pair under public/assets/nodes/music/:

     <id>.mp3  128 kbps, transcoded from the lossless originals
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
  /**
   * Only where the release is genuinely known. Uploader-supplied tags for the
   * re-upload sources were junk (playlist names, channel names), so those
   * tracks carry no album at all rather than a wrong one, and the player hides
   * the line when it is absent.
   */
  album?: string;
}

export const BLACKBOARD_MUSIC: readonly BlackboardTrack[] = [
  { id: 'difference-interlude', artist: 'XXXTENTACION', title: 'difference (interlude)', album: 'SKINS' },
  { id: 'the-interlude-that-never-ends', artist: 'XXXTENTACION', title: 'the interlude that never ends/Ugly' },
  { id: 'love-yourself-interlude', artist: 'XXXTENTACION', title: 'love yourself (interlude) (Instrumental)' },
  { id: 'girl-next-door', artist: 'Heavenly Snow', title: 'Girl next door', album: 'Girl next door' },
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
  { id: 'nuts-slowed', artist: 'diorelic', title: 'Nuts (Slowed)' },
];

/** Path relative to /assets/nodes/ — AudioContext resolves it against BASE_URL. */
export function blackboardAudioPath(track: BlackboardTrack): string {
  return `music/${track.id}.mp3`;
}

export function blackboardArtworkSrc(track: BlackboardTrack): string {
  return `${import.meta.env.BASE_URL}assets/nodes/music/${track.id}.jpg`;
}

const SESSION_KEY = 'bb-track-shown';

function readShownTrack(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    // Private mode / blocked storage: treat it as a fresh session.
    return null;
  }
}

function rememberShownTrack(id: string) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, id);
  } catch {
    /* storage unavailable — the next load simply draws freely */
  }
}

let resolvedTrack: BlackboardTrack | null = null;

/**
 * Which track this page view plays.
 *
 * A tab's FIRST view draws uniformly from the whole library, so separate
 * visitors open on different scores. Every later load — a refresh, a URL entry
 * — draws again from the library *minus* the one already shown, so a reload
 * always audibly changes the music and can never hand back the same track
 * twice in a row.
 *
 * There is deliberately no way to move off the draw once it is made: no skip,
 * no next, no chooser. The visitor commits to one piece of music for the visit.
 *
 * sessionStorage, not localStorage: tabs stay independent of each other and
 * the history resets when the tab closes, which is the granularity wanted.
 * Memoised at module scope so React re-invoking the initialiser (StrictMode)
 * cannot burn two draws in a single load.
 */
export function blackboardMusicPick(): BlackboardTrack {
  if (resolvedTrack) return resolvedTrack;
  const shown = readShownTrack();
  const unseen = BLACKBOARD_MUSIC.filter(track => track.id !== shown);
  const pool = unseen.length > 0 ? unseen : BLACKBOARD_MUSIC;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  rememberShownTrack(chosen.id);
  resolvedTrack = chosen;
  return chosen;
}
