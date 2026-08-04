import { useMemo, useRef, type MutableRefObject, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useLocation } from 'wouter';
import { markNavigationIntent } from '../../lib/navIntent';
import * as THREE from 'three';
import type { SecondaryMedia } from '../../data/secondaryNodes';
import { GithubContribTerrain } from './GithubContribTerrain';

// Module-level scratch — never allocate inside useFrame
const _ringOffset = new THREE.Vector3();
const _worldPos   = new THREE.Vector3();
const _mat4       = new THREE.Matrix4();
const _up         = new THREE.Vector3(0, 1, 0);
const _qFace      = new THREE.Quaternion();
const _qFlip      = new THREE.Quaternion(0, 1, 0, 0);
const _qLean      = new THREE.Quaternion();
const _zAxis      = new THREE.Vector3(0, 0, 1);
const _euler      = new THREE.Euler();
const _qRing      = new THREE.Quaternion();

/** Local-space drop of a note tile under its parent logo (world units). */
const NOTE_BELOW = -0.26;

function isLogoSidecard(file: string) {
  return /\blogo\b/i.test(file);
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h  = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const BASE_RADIUS = 1.75;

function isExternalLink(link: string) {
  return /^https?:\/\//i.test(link);
}

interface Props {
  nodeId: string;
  media: SecondaryMedia[];
  centerRef: MutableRefObject<THREE.Vector3>;
  proximityRef: MutableRefObject<number>;
}

function SecondaryNote({ text }: { text: string }) {
  return <p className="secondary-card-note">{text}</p>;
}

function ImageTile({
  media,
  onInternalNav,
}: {
  media: SecondaryMedia;
  onInternalNav: (path: string) => void;
}) {
  const img = (
    <img
      src={media.url}
      alt={media.linkLabel || ''}
      className={`secondary-card-img${isLogoSidecard(media.file) ? ' secondary-card-img--logo' : ''}`}
      draggable={false}
    />
  );

  if (!media.link) return img;

  if (isExternalLink(media.link)) {
    return (
      <a
        className="secondary-card-anchor"
        href={media.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={media.linkLabel || 'Open link'}
      >
        {img}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="secondary-card-anchor"
      onClick={(e) => {
        e.preventDefault();
        onInternalNav(media.link!);
      }}
      aria-label={media.linkLabel || 'Open'}
    >
      {img}
    </button>
  );
}

function TileBody({
  media,
  contribWidth,
  onInternalNav,
}: {
  media: SecondaryMedia;
  contribWidth: number;
  onInternalNav: (path: string) => void;
}): ReactNode {
  if (media.kind === 'github-contrib') {
    return <GithubContribTerrain width={contribWidth - 8} />;
  }

  if (media.kind === 'note' && media.note) {
    return <SecondaryNote text={media.note} />;
  }

  if (media.kind === 'link' && media.link) {
    if (isExternalLink(media.link)) {
      return (
        <a
          className="secondary-card-link"
          href={media.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="secondary-card-link-prefix">SYS://</span>
          <span className="secondary-card-link-label">{media.linkLabel}</span>
        </a>
      );
    }
    return (
      <button
        type="button"
        className="secondary-card-link"
        onClick={(e) => {
          e.preventDefault();
          onInternalNav(media.link!);
        }}
      >
        <span className="secondary-card-link-prefix">SYS://</span>
        <span className="secondary-card-link-label">{media.linkLabel}</span>
      </button>
    );
  }

  return <ImageTile media={media} onInternalNav={onInternalNav} />;
}

export function SecondaryOrbit({ nodeId, media, centerRef, proximityRef }: Props) {
  const count  = media.length;
  const [, setLocation] = useLocation();

  // Scale orbit radius so denser orbits don't crowd each other
  const orbitRadius = Math.max(BASE_RADIUS, 1.0 + count * 0.25);
  // Per-tile CSS width: shrink slightly as count grows; contrib tile stays wider
  const cardWidth   = Math.max(72, 108 - count * 6);
  const contribWidth = Math.max(cardWidth + 28, 132);
  const logoWidth   = 48;
  const noteWidth   = 64;

  const widthFor = (m: SecondaryMedia) => {
    if (m.kind === 'github-contrib') return contribWidth;
    if (isLogoSidecard(m.file)) return logoWidth;
    return cardWidth;
  };

  const params = useMemo(() => {
    const rnd  = mulberry32(hashStr(nodeId));
    const sign = () => (rnd() < 0.5 ? -1 : 1);
    return {
      spinSpeed: (0.12 + rnd() * 0.22) * sign(),
      baseTilt:  new THREE.Euler(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI),
      tumbleX:   (0.05 + rnd() * 0.16) * sign(),
      tumbleY:   (0.05 + rnd() * 0.16) * sign(),
      tumbleZ:   (0.05 + rnd() * 0.16) * sign(),
      tiles: Array.from({ length: count }, () => ({
        lean:   (rnd() * 2 - 1) * (Math.PI / 4),
        radius: orbitRadius + (rnd() * 2 - 1) * 0.12,
        phase:  rnd() * Math.PI * 2,
      })),
    };
  }, [nodeId, count, orbitRadius]);

  const items = media;

  const tileRefs = useRef<(THREE.Group | null)[]>([]);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const noteWrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  const onInternalNav = (path: string) => {
    markNavigationIntent();
    setLocation(path);
  };

  useFrame(({ camera, clock }) => {
    const p = proximityRef.current;
    const t = clock.elapsedTime;
    _euler.set(
      params.baseTilt.x + t * params.tumbleX,
      params.baseTilt.y + t * params.tumbleY,
      params.baseTilt.z + t * params.tumbleZ,
    );
    _qRing.setFromEuler(_euler);

    const center  = centerRef.current;
    const opacity = Math.max(0, Math.min(1, (p - 0.06) / 0.5));

    for (let i = 0; i < count; i++) {
      const g = tileRefs.current[i];
      if (!g) continue;
      const tile  = params.tiles[i];
      const angle = (i / count) * Math.PI * 2 + tile.phase + t * params.spinSpeed;
      _ringOffset.set(Math.cos(angle) * tile.radius, Math.sin(angle) * tile.radius, 0);
      _ringOffset.applyQuaternion(_qRing);
      _worldPos.copy(center).add(_ringOffset);
      g.position.copy(_worldPos);

      _mat4.lookAt(_worldPos, camera.position, _up);
      _qFace.setFromRotationMatrix(_mat4);
      _qFace.multiply(_qFlip);
      _qLean.setFromAxisAngle(_zAxis, tile.lean);
      _qFace.multiply(_qLean);
      g.quaternion.copy(_qFace);

      const w = wrapRefs.current[i];
      if (w) {
        w.style.opacity = String(opacity);
        if (items[i].link) {
          w.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';
        }
      }
      const nw = noteWrapRefs.current[i];
      if (nw) nw.style.opacity = String(opacity);
    }
  });

  if (count === 0) return null;

  return (
    <group>
      {items.map((m, i) => (
          <group
            key={m.file}
            ref={(el) => { tileRefs.current[i] = el; }}
          >
            <Html transform distanceFactor={4.5} zIndexRange={[30, 0]} prepend>
              <div
                ref={(el) => { wrapRefs.current[i] = el; }}
                className={[
                  'secondary-card',
                  m.kind === 'github-contrib' ? 'secondary-card--contrib' : '',
                  isLogoSidecard(m.file) ? 'secondary-card--logo' : '',
                ].filter(Boolean).join(' ')}
                style={{
                  opacity: 0,
                  pointerEvents: 'none',
                  width: `${widthFor(m)}px`,
                }}
              >
                <TileBody
                  media={m}
                  contribWidth={contribWidth}
                  onInternalNav={onInternalNav}
                />
              </div>
            </Html>

            {/* Note rides as a child of the logo tile — identical orbit/lean/face physics. */}
            {m.note ? (
              <group position={[0, NOTE_BELOW, 0]}>
                <Html transform distanceFactor={4.5} zIndexRange={[29, 0]} prepend>
                  <div
                    ref={(el) => { noteWrapRefs.current[i] = el; }}
                    className="secondary-card secondary-card--note"
                    style={{
                      opacity: 0,
                      pointerEvents: 'none',
                      width: `${noteWidth}px`,
                    }}
                  >
                    <SecondaryNote text={m.note} />
                  </div>
                </Html>
              </group>
            ) : null}
          </group>
        ))}
    </group>
  );
}
