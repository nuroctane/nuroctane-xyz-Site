import React from 'react';
import { NodeData } from '../data/nodes';

const COMING_SOON_IDS = ['weatherguru', 'sis', 'astrosleep', 'geoskin'];

function ImgWithFallback({
  src, alt, className, fallback,
}: {
  src: string; alt: string; className: string; fallback: React.ReactNode;
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

    // Open window IMMEDIATELY (before animation) so popup blockers don't intercept it
    // setTimeout delays are what browsers flag as "not from user gesture"
    const win = window.open(node.url, '_blank', 'noopener,noreferrer');
    if (!win) {
      // Fallback if popup was blocked — try assigning via anchor
      const a = document.createElement('a');
      a.href = node.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    }

    // Run explosion animation separately (visual only, link already opened)
    setExploding(true);
    setTimeout(() => setExploding(false), 420);
  };

  return (
    <div
      className={`node-card${exploding ? ' node-card--exploding' : ''}`}
      onClick={handleClick}
      style={{ cursor: hasLink ? 'pointer' : 'default' }}
    >
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />

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

      <div className="card-identity">
        <span className="platform-label">{node.label}</span>
        <span className="platform-handle">{node.handle}</span>
      </div>

      {isComingSoon ? (
        <div className="coming-soon-badge">COMING SOON</div>
      ) : (
        node.subtitle && <div className="card-subtitle">{node.subtitle}</div>
      )}

      <div className="card-divider" />

      <div className="card-url">
        <span className="url-prefix">SYS://</span>
        <span className="url-body">{node.urlDisplay}</span>
      </div>
    </div>
  );
}
