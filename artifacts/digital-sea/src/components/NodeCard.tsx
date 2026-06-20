import React from 'react';
import { NodeData } from '../data/nodes';

const COMING_SOON_IDS = ['weatherguru', 'sis', 'astrosleep', 'geoskin'];

function ImgWithFallback({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return <>{fallback}</>;
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export function NodeCard({ node }: { node: NodeData }) {
  const [exploding, setExploding] = React.useState(false);
  const isComingSoon = COMING_SOON_IDS.includes(node.id);
  const hasLink = node.url && node.url !== '#';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLink || exploding) return;
    setExploding(true);
    setTimeout(() => {
      window.open(node.url, '_blank', 'noopener,noreferrer');
      setExploding(false);
    }, 380);
  };

  return (
    <div
      className={`node-card${exploding ? ' node-card--exploding' : ''}`}
      onClick={handleClick}
      style={{ cursor: hasLink ? 'pointer' : 'default' }}
    >
      {/* Corner HUD accents */}
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />

      {/* Avatar + platform logo stack */}
      <div className="card-avatar-section">
        <div className="avatar-ring">
          <ImgWithFallback
            src={node.avatar}
            alt={node.handle}
            className="avatar-img"
            fallback={
              <span className="avatar-fallback">
                {node.label.charAt(0).toUpperCase()}
              </span>
            }
          />
        </div>

        {node.logo && (
          <div className="logo-badge">
            <ImgWithFallback
              src={node.logo}
              alt={node.label}
              className="logo-img"
              fallback={<span className="logo-fallback-char">{node.label.charAt(0)}</span>}
            />
          </div>
        )}
      </div>

      {/* Platform identity */}
      <div className="card-identity">
        <span className="platform-label">{node.label}</span>
        <span className="platform-handle">{node.handle}</span>
      </div>

      {/* Subtitle or COMING SOON */}
      {isComingSoon ? (
        <div className="coming-soon-badge">COMING SOON</div>
      ) : (
        node.subtitle && <div className="card-subtitle">{node.subtitle}</div>
      )}

      <div className="card-divider" />

      {/* URL — clearly visible */}
      <div className="card-url">
        <span className="url-prefix">SYS://</span>
        <span className="url-body">{node.urlDisplay}</span>
      </div>
    </div>
  );
}
