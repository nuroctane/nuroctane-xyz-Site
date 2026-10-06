import { useId, useRef, useState } from 'react';
import scan from '../data/nurArchitecture.json';
import './nur-architecture.css';

const columns = [
  { title: 'CONTROL', kinds: ['entry', 'agent'] },
  { title: 'RUNTIME', kinds: ['service', 'tool', 'store'] },
  { title: 'PROVIDERS', kinds: ['external'] },
  { title: 'MODELS', kinds: ['model'] },
];
const positions = new Map<string, { x: number; y: number }>();
let height = 0;
for (const [column, group] of columns.entries()) {
  const nodes = scan.graph.nodes.filter(node => group.kinds.includes(node.kind));
  nodes.forEach((node, index) => {
    const modelColumn = column === 3 ? Math.floor(index / 11) : 0;
    const row = column === 3 ? index % 11 : index;
    positions.set(node.id, { x: 28 + column * 300 + modelColumn * 260, y: 65 + row * 74 });
    height = Math.max(height, 150 + row * 74);
  });
}
const width = 1720;

export function NurArchitectureMap() {
  const marker = useId().replace(/:/g, '');
  const [selected, setSelected] = useState('agent_loop');
  const [zoom, setZoom] = useState(0.85);
  const shell = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const node = scan.graph.nodes.find(item => item.id === selected)!;
  const connected = scan.graph.edges.filter(edge => edge.from === selected || edge.to === selected);
  const neighbors = new Set(connected.flatMap(edge => [edge.from, edge.to]));

  return (
    <div className="nur-architecture cli-map-shell" ref={shell}>
      <div className="cli-term-bar cli-map-bar">
        <span className="cli-term-dots" aria-hidden><i /><i /><i /></span>
        <span className="cli-term-title">nur · request path + model map</span>
        <div className="nur-map-controls" aria-label="Map controls">
          <button type="button" aria-label="Zoom out" disabled={zoom <= 0.4} onClick={() => setZoom(value => Math.max(0.4, value - 0.15))}>−</button>
          <button type="button" onClick={() => { setZoom(0.85); stage.current?.scrollTo(0, 0); }}>Reset</button>
          <button type="button" aria-label="Zoom in" disabled={zoom >= 1.6} onClick={() => setZoom(value => Math.min(1.6, value + 0.15))}>+</button>
          <button type="button" onClick={() => {
            if (document.fullscreenElement === shell.current) void document.exitFullscreen();
            else void shell.current?.requestFullscreen?.().catch(() => {});
          }}>Fullscreen</button>
        </div>
      </div>
      <div className="nur-map-body">
        <div className="nur-map-canvas" ref={stage} tabIndex={0} aria-label="Architecture map. Scroll or drag to pan; select a node to inspect its connections."
          onPointerDown={event => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            const target = stage.current!;
            drag.current = { x: event.clientX, y: event.clientY, left: target.scrollLeft, top: target.scrollTop, moved: false };
          }}
          onPointerMove={event => {
            const start = drag.current;
            if (!start || !(event.buttons & 1)) { drag.current = null; return; }
            if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) start.moved = true;
            if (!start.moved) return;
            stage.current!.scrollLeft = start.left - (event.clientX - start.x);
            stage.current!.scrollTop = start.top - (event.clientY - start.y);
          }}
          onPointerUp={() => { window.setTimeout(() => { drag.current = null; }, 0); }}
          onPointerLeave={() => { drag.current = null; }}>
          <svg width={width * zoom} height={height * zoom} viewBox={`0 0 ${width} ${height}`} aria-label="NurCLI architecture connections">
            <defs><marker id={marker} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="currentColor" /></marker></defs>
            {columns.map((column, index) => <text className="nur-map-column" x={28 + index * 300} y={32} key={column.title}>{column.title}</text>)}
            {scan.graph.edges.map((edge, index) => {
              const from = positions.get(edge.from)!;
              const to = positions.get(edge.to)!;
              const active = edge.from === selected || edge.to === selected;
              const x1 = from.x + 226, y1 = from.y + 25, x2 = to.x, y2 = to.y + 25;
              return <path key={index} className={active ? 'nur-map-edge is-active' : 'nur-map-edge'} markerEnd={`url(#${marker})`}
                d={`M${x1} ${y1} C${x1 + 55} ${y1},${x2 - 55} ${y2},${x2} ${y2}`}><title>{edge.label}</title></path>;
            })}
            {scan.graph.nodes.map(item => {
              const position = positions.get(item.id)!;
              return <g key={item.id} transform={`translate(${position.x},${position.y})`} role="button" tabIndex={0}
                aria-label={`${item.label}: ${item.sub}`} aria-pressed={selected === item.id}
                className={`nur-map-node${selected === item.id ? ' is-selected' : ''}${neighbors.has(item.id) ? ' is-connected' : ''}`}
                onClick={() => { if (!drag.current?.moved) setSelected(item.id); }}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item.id); } }}>
                <title>{item.label}</title><rect width="226" height="53" rx="5" />
                <text x="12" y="22">{item.label.length > 27 ? item.label.slice(0, 25) + '…' : item.label}</text>
                <text className="nur-map-sub" x="12" y="41">{item.sub.length > 32 ? item.sub.slice(0, 30) + '…' : item.sub}</text>
              </g>;
            })}
          </svg>
        </div>
        <aside className="nur-map-detail" aria-live="polite">
          <span className="nur-map-kind">{node.kind}</span>
          <h3>{node.label}</h3><p>{node.detail || node.sub}</p>
          {node.sourceRef && <code>{node.sourceRef}</code>}
          <h4>Connections</h4>
          <ul>{connected.map((edge, index) => {
            const outgoing = edge.from === selected;
            const other = scan.graph.nodes.find(item => item.id === (outgoing ? edge.to : edge.from))!;
            return <li key={index}><button type="button" onClick={() => {
              setSelected(other.id);
              const position = positions.get(other.id)!;
              stage.current?.scrollTo({ left: Math.max(0, position.x * zoom - 60), top: Math.max(0, position.y * zoom - 60), behavior: 'auto' });
            }}><span>{outgoing ? '→' : '←'} {other.label}</span><small>{edge.label}</small></button></li>;
          })}</ul>
        </aside>
      </div>
      <div className="cli-map-foot"><span>Drag or scroll to pan · zoom · select a node to follow its edges</span><span>{scan.graph.nodes.length} nodes · {scan.graph.edges.length} connections</span></div>
    </div>
  );
}
