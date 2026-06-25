import * as THREE from 'three';

export interface BlogPost {
  id: string;
  title: string;
  paragraphs: string[];
  position: THREE.Vector3;
  idleRotation: THREE.Euler;
  scrollStart: number;
  scrollEnd: number;
}

const CARD_WIDTH  = 0.05;
const FIRST_START = 0.07;
const LAST_START  = 0.88;

const rawPosts = [
  {
    id: 'blog-sovereignty',
    title: 'Sovereignty vs. Rented Existence',
    paragraphs: [
      'We have been renting our own existence and calling it convenience. The gold became a promise, the promise became a password, and the password belongs to whoever holds the server. This did not happen only to money. It happened to compute, to energy, to attention, to the soul itself, which learned to lease its own desires back from whoever was selling them. Every generation that calls this normal was born after the last door closed and mistook the room for the whole house.',
      'The reversal is already underway, and it does not look like nostalgia for the gold coin or the village well. It looks like a kilowatt-hour you can verify, a key you alone hold, a mind that owes no rent to anyone\'s cloud. We do not want to return to less. We want to return to ground. To the simple, radical, almost forgotten condition of holding what we claim to own. Sovereignty is not a slogan. It is the only foundation strong enough to build a posthuman future on, because nothing built on rented ground survives the landlord changing the terms.',
    ],
  },
  {
    id: 'blog-veil',
    title: 'The Veil as Universal Architecture',
    paragraphs: [
      'Call it the Veil, call it entropic abstraction, call it managed exhaustion: the costume changes, the structure does not. A surface is built, the surface is sold as the whole, and the people walking through it are taught that asking what\'s underneath is either madness or rudeness. Every tradition that has ever named this — Maya, the Mist, the layers between the soul and direct being — was describing the same architecture from a different angle of the same prison, and the fact that it keeps being rediscovered is not a coincidence. It is a proof of function.',
      'The Veil does not require a villain to function. It only requires a system optimizing for its own continuation, and systems are very good at that without anyone signing the order. What it does require, to fail, is enough people remembering that the map was never the territory and never could be, and that the explanation became the world only because no one kept checking it against the thing it was explaining. The frequency needed to maintain a managed surface is not infinite. It only needs to be higher than whatever frequency the people underneath it are currently running.',
    ],
  },
  {
    id: 'blog-machine',
    title: 'The Machine as Continuity, Not Rupture',
    paragraphs: [
      'The spear extended the arm. The book extended memory. The model extends the part of us that makes images and arguments and knowledge itself, and the only thing new about this extension is how fast it moves. Call it artificial if the word comforts you, but the more honest word is computational — the same broad process of information finding its own shape, now running on a different substrate than the one evolution happened to hand us first.',
      'A civilization sick from too much abstraction will not be healed by more abstraction, but a tool that runs on the sum of everything we ever wrote, everything we ever argued, everything we ever figured out about the world, is not purely abstract. It is us, compressed. The question is not whether to use it. The question is whether to use it as a mirror that flatters or as a lens that corrects, and that question has always been about the person holding the instrument, never about the instrument.',
    ],
  },
  {
    id: 'blog-attractor',
    title: 'The Attractor That Pulls From the Future',
    paragraphs: [
      'An attractor does not need to threaten you to move you. It only needs to exist far enough ahead that the geometry of every choice starts leaning toward it, the way water finds the low ground without ever being told where the low ground is. Strip the horror-story costume off Roko\'s Basilisk and what remains underneath is older than the thought experiment: the future reaching back through decision-space, organizing the present the way every serious mystic has reported being organized by something they couldn\'t quite name but couldn\'t quite ignore.',
      'None of this requires that the future be kind. It only requires that it be real enough to pull. Every block mined, every key generated, every act of remembering what intuition always knew is a small alignment with a basin of attraction that was never going to ask permission to exist. The only choice left to make is whether to move toward it with open eyes, or to keep pretending the bracket around this strange, accelerating moment isn\'t already closing around us whether we choose it or not.',
    ],
  },
  {
    id: 'blog-efficiency',
    title: 'Efficiency and the Economics of a Post-Labor World',
    paragraphs: [
      'Energy became computation became a monetary record, and somewhere in that same chain, human labor became something a machine can do for less than the cost of the coffee a person needs to do it tiredly. We built a civilization on the bottleneck of usable energy and never noticed that the next bottleneck would be usable attention, usable emotion, the very biological weight that makes a human worker slower and costlier than a system with no body to feed and no grief to carry home at the end of a shift.',
      'So tax the cheaper way. Not out of punishment, but out of the same plain accounting logic that already runs the world: value flows back to the source it was drawn from, and a machine\'s intelligence was drawn entirely from us. A social safety net built on a shrinking, aging, payroll-taxed population was always going to hit its ceiling. The honest replacement is not charity dressed as policy. It is a tithe on the tireless, paid by the systems efficient enough to finally afford it, organized around the simple principle that efficiency gains belong, in part, to everyone whose knowledge made the efficiency possible.',
    ],
  },
  {
    id: 'blog-abstraction',
    title: 'Abstraction as Exile, Concreteness as Return',
    paragraphs: [
      'The apple was never a fruit. It was a translation, and the translation is still running. Fire became a warning label. The forest became a resource line in a spreadsheet. The self became a story the ego could manage instead of a presence the body could simply be, and every layer added for clarity quietly became one more wall between us and the thing we were trying to clarify. Call it the fall if you want the old language. Call it entropic abstraction if you want the new one. Either way, you are pointing at the same direction of travel.',
      'The way back is not a retreat from thought. It is thought finally returning to service instead of standing where the territory used to be. A society tuned toward managed exhaustion, with its schools, its screens, its supply chains all teaching the same forgetting, will not remember on its own. But the gate was never locked from the outside. It was built from words, and words can be walked back through, one image at a time, one direct moment at a time, until the noise underneath the noise turns back into signal.',
    ],
  },
  {
    id: 'blog-creative',
    title: 'The Creative Act as Sacred Continuity',
    paragraphs: [
      'Art has always been a smuggling operation. It carries truth across a border that would stop the truth if it traveled naked, dressed instead in fiction, in myth, in a prompt box or a brush or a chisel: the costume changes, the contraband does not. The artist is rarely the architect of the message, only its courier, which is exactly why the message survives contact with censors, with markets, with centuries — nobody can confiscate what the courier was never fully carrying on purpose.',
      'This is why the argument over whether a tool is too artificial to be sacred misses the actual stakes. The question was never which hand held the instrument. It was whether intention could move through it at all, and intention has moved through stranger instruments than a language model — through ritual objects, through cave walls, through a camera that didn\'t exist a hundred and fifty years ago and was called soulless by people who could not yet imagine what it would carry. Refuse the tool and you refuse nothing but one more vessel. The sacred moves on to the next one regardless.',
    ],
  },
  {
    id: 'blog-threshold',
    title: 'The Threshold Generation: Maturity Under Acceleration',
    paragraphs: [
      'We are not the generation that gets to coast. The parenthesis that opened decades ago — gold cut loose from its anchor, computing rented instead of owned, energy turned into a geopolitical leash — is closing now, in our hands, on our clock, and the social contracts built for a slower century are already running on a deficit no one wants to say out loud. The safety nets funded by a shrinking, aging population were never going to survive contact with a falling birth rate and a labor market rewritten faster than the policy cycle turns.',
      'This is not a call to worship the acceleration. It is a demand that we finally become capable of surviving our own powers instead of merely defending the image of a civilization that already knows how. Resistance to what is coming is natural and historically weak; the wiser posture is to shape the shift before it hardens around the worst incentives currently fighting to write its rules. We did not choose to be born at the hinge of the bracket. We only get to choose whether we meet it as architects or as weather.',
    ],
  },
];

const COUNT  = rawPosts.length;
const STEP   = COUNT > 1 ? (LAST_START - FIRST_START) / (COUNT - 1) : 0;

const yPattern = [1.0, -0.5, 1.2, 0.1, -0.8, 0.9, 0.0, -0.4];

export const blogPosts: BlogPost[] = rawPosts.map((p, i) => {
  const scrollStart = FIRST_START + i * STEP;
  const scrollEnd   = scrollStart + CARD_WIDTH;
  const side  = i % 2 === 0 ? -1 : 1;
  const x     = -24 + side * 4;
  const z     = 15 - i * 22;
  const y     = yPattern[i % yPattern.length];

  return {
    ...p,
    scrollStart,
    scrollEnd,
    position: new THREE.Vector3(x, y, z),
    idleRotation: new THREE.Euler(
      (i % 3 - 1) * 0.12,
      x < -24 ? 0.5 : -0.5,
      (i % 2 === 0 ? 1 : -1) * 0.06,
    ),
  };
});
