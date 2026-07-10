import React from 'react';
import { NodeData, PROJECT_THRESHOLD, nodeMid } from '../../data/nodes';
import { trackEvent } from '../../lib/analytics';

const COMING_SOON_IDS = ['weatherguru', 'sis', 'astrosleep', 'geoskin'];

function ImgWithFallback({
  src, alt, className, fallback,
}: {
  src: string; alt: string; className: string; fallback: React.ReactNode;
}) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return <>{fallback}</>;
  return <img src={src} alt={alt} className={className} draggable={false} onError={() => setFailed(true)} />;
}

export function NodeCard({ node }: { node: NodeData }) {
  const [exploding, setExploding] = React.useState(false);
  const isComingSoon = COMING_SOON_IDS.includes(node.id);
  const hasLink      = Boolean(node.url && node.url !== '#');

  const handleClick = (e: React.MouseEvent) => {
    if (!hasLink || exploding) { e.preventDefault(); return; }
    const section = nodeMid(node) < PROJECT_THRESHOLD ? 'socials' : 'projects';
    trackEvent('Sea Node Open', { id: node.id, section, label: node.label });
    setExploding(true);
    setTimeout(() => setExploding(false), 420);
  };

  // Native <a> tags open reliably in every context (including iframes)
  // where window.open may be blocked as a popup.
  const Tag = hasLink ? 'a' : 'div';
  const linkProps = hasLink
    ? { href: node.url, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Tag
      {...linkProps}
      draggable={false}
      className={`node-card${exploding ? ' node-card--exploding' : ''}`}
      onClick={handleClick}
      style={{ cursor: hasLink ? 'pointer' : 'default', display: 'block', textDecoration: 'none', color: 'inherit' }}
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
            fallback={<span className="avatar-fallback">{node.label.charAt(0).toUpperCase()}</span>}
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
    </Tag>
  );
}
