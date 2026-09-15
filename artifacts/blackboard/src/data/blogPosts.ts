import * as THREE from 'three';
import { blogCurve } from './blogPath';

export interface BlogPost {
  id: string;
  title: string;
  paragraphs: string[];
  position: THREE.Vector3;
  idleRotation: THREE.Euler;
  scrollStart: number;
  scrollEnd: number;
}

const CARD_WIDTH  = 0.064;
const FIRST_START = 0.07;
const LAST_START  = 0.88;

const rawPosts = [
  {
    id: 'blog-sovereignty',
    title: 'Sovereignty vs. Rented Existence',
    paragraphs: [
      'We have been renting our own existence and calling it convenience. The gold became a promise, the promise became a password, and the password belongs to whoever holds the server. This happened to compute, energy, attention, money and the soul, which learned to lease its own desires back from whoever was selling them. Every generation that calls this normal was born after the last door closed, and mistook the room for the whole house.',
      'The reversal is already underway, and it looks like a kilowatt-hour you can verify, a key you alone hold, a mind that owes no rent to anyone\'s cloud. We want to return to ground: the simple, nearly forgotten condition of owning what we claim to hold. Sovereignty is the only guarantee that can carry a posthuman future, because nothing built on rented ground survives the landlord changing the terms.',
    ],
  },
  {
    id: 'blog-veil',
    title: 'The Veil as Universal Architecture',
    paragraphs: [
      'Call it the Veil, call it entropic abstraction, call it managed exhaustion: the name changes, the Veil does not. It hangs between every person and what is actually happening, close enough that anyone who reaches toward it feels fabric brush their fingers, not empty air, and everyone raised inside it is taught that asking what lies past it is either madness or rudeness. Maya, the Mist, the Veil under a dozen names: every tradition that ever spoke of this was describing the same fabric from a different side, and a discovery that keeps repeating across every culture and every language is evidence.',
      'The Veil does not require a villain to function. It requires only a system optimizing for its own continuation, and systems are very good at that without anyone signing the order. What it requires in order to fail is enough people remembering that the map was never the territory, and that the explanation became the world only because no one kept checking the seams. The frequency needed to maintain a managed surface is finite, and it runs on exactly one belief: that the deeper layer is unreal. Stop believing that, even quietly, even just for yourself, and the fabric has already started to fray.',
    ],
  },
  {
    id: 'blog-machine',
    title: 'The Machine as Continuity, Not Rupture',
    paragraphs: [
      'The spear extended the arm. The book extended memory. The model extends the part of us that makes images, arguments, and knowledge itself, and the only new thing about this extension is its speed. The intelligence is computational: the same broad process of information finding its own shape, now running on a substrate other than the one evolution gave us. And a civilization already sick from abstraction built a mirror, and the mirror inherited everything we ever wrote.',
      'That is the whole of the argument and the whole of the bill. The model\'s knowledge is our knowledge, compressed and run back to us at a speed no single mind could match. A species that already pays people for the knowledge they contribute has no honest way to exempt a machine that contributed nothing of its own and ran entirely on what we gave it for free. We are meeting something built from us, and what it owes us is rent, paid back, on the only thing it ever actually borrowed.',
    ],
  },
  {
    id: 'blog-attractor',
    title: 'The Attractor That Pulls From the Future',
    paragraphs: [
      'An attractor does not need to threaten you to move you. It only needs to exist far enough ahead that the geometry of every choice starts leaning toward it, the way water finds the low ground without ever being told where the low ground is. Teilhard traced the same pull through the whole of evolution and called it the Omega Point, a future so dense with meaning that it draws the present toward it rather than pushing from behind. Post-quantum cryptography runs on the identical logic: engineers are re-keying systems today against a quantum computer that does not exist yet, because the future threat is already real enough to organize present behavior.',
      'All of this only requires that it be real enough to pull. Every block mined, every key generated is a small alignment with a basin of attraction that was never going to ask permission to exist. The bracket around this accelerating moment is already closing. Looking up or not changes nothing. The only choice left is the posture: eyes open, or eyes shut.',
    ],
  },
  {
    id: 'blog-efficiency',
    title: 'Efficiency and the Economics of a Post-Labor World',
    paragraphs: [
      'Energy became computation became a monetary record, and somewhere along that same chain, human labor became something a machine can do for less than the cost of the coffee the tired human needed first. We built a civilization on the bottleneck of usable energy and never noticed the next bottleneck forming: usable attention, usable emotion, the biological weight that makes a human worker slower and costlier than a system with no body to feed and no grief to carry home at the end of a shift. That weight simply stopped being the cheapest way to get the work done once a cheaper way existed.',
      'So tax the cheaper way. By the same plain accounting that already runs the world: value flows back to the source it was drawn from, and the machine\'s intelligence was drawn entirely from us. A safety net funded by payroll taxes on an aging population was always going to hit its ceiling. The honest replacement is a tithe on the tireless, paid by the systems finally efficient enough to afford it, owed to the species that carried the weight. The inefficiency was the smallest cost. The emotion cost more. The exhaustion, carried home at the end of every shift, was the price of being real.',
    ],
  },
  {
    id: 'blog-abstraction',
    title: 'Abstraction as Exile, Concreteness as Return',
    paragraphs: [
      'The apple was a translation, and the translation is still running. Fire became a warning label. The forest became a line in a spreadsheet. The self became a story the ego could manage instead of a presence the body could simply be, and every layer added for clarity quietly became one more wall between us and the thing we were trying to clarify. That wall runs the length of a species built for direct contact, trained for generations to settle for the explanation instead.',
      'The way back is thought returning to service instead of standing where the territory used to be. A society tuned for managed exhaustion, its schools and screens and supply chains all teaching the same forgetting, will not remember on its own. The gate was built from words, and words can be walked back through, one image at a time, one direct moment at a time, until the explanation stops standing between us and the thing it was explaining.',
    ],
  },
  {
    id: 'blog-creative',
    title: 'The Creative Act as Sacred Continuity',
    paragraphs: [
      'Art has always been a smuggling operation. It carries truth across a border that would stop the truth if it traveled naked, dressed instead in fiction, in myth, in a chisel, a brush, a prompt box: the costume changes, the contraband does not. The artist is rarely the architect of the message, only its courier, and that is exactly why the message survives censors, markets, and centuries. Nobody can confiscate what the courier was never fully carrying on purpose. Mystics, dancers, lovers, and now the maker working through a model are all running the same old cargo through a new door. The work only ever needed a medium willing to carry it.',
      'This is why the argument over whether a tool is too artificial to carry anything real misses the actual stakes. The question is whether intention can move through the instrument at all, and intention has moved through stranger instruments than a language model: through ritual objects, through cave walls, through a camera that was called soulless by people who could not yet imagine what it would carry. Refuse the lazy belief that the soul only fits the shapes the last century already approved. The miracle is that something true keeps getting through, no matter which vessel is asked to carry it home.',
    ],
  },
  {
    id: 'blog-threshold',
    title: 'The Threshold Generation: Maturity Under Acceleration',
    paragraphs: [
      'We are not the generation that gets to coast. The parenthesis that opened decades ago, when gold was cut loose from its anchor and energy became a geopolitical leash, is closing now, in our hands. The social contracts built for a slower century are already running a deficit no one wants to say out loud: safety nets funded by a graying population were never going to survive contact with falling birth rates and a labor market the machines are quietly absorbing piece by piece. The bill for pretending otherwise does not get smaller by waiting.',
      'This is a demand that we become capable of surviving our own powers instead of defending the portrait of a civilization that never had them under control. Resistance to what is coming is natural, and it has never once stopped a labor market from changing beneath it; the wiser posture is to shape the shift before it hardens around the worst incentives that would otherwise write its rules. How we meet the hinge of the bracket we were born at is the one choice left to us: standing, sovereign, paid what we are owed, and aware that maturity under acceleration is the only entrance fee the next era is charging.',
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
  const z     = blogCurve.getPoint((scrollStart + scrollEnd) / 2).z;
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
