interface Props {
  onReturn: () => void;
}

export function ReturnButton({ onReturn }: Props) {
  return (
    <div className="return-btn-wrap" aria-label="Return to scroll position">
      <div className="mtoggle-row return-btn-row">
        <button
          className="mtoggle-side return-btn-active"
          onClick={onReturn}
          title="Return — fly back to where you were"
        >
          <svg viewBox="0 0 22 20" fill="none" className="mtoggle-icon" aria-hidden="true">
            <line x1="16" y1="4" x2="7.5" y2="12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <polyline points="6,9 7.5,12.5 11,12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M2 17 C5 13.5 8 13.5 11 17 C14 20.5 17 20.5 20 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7"/>
          </svg>
        </button>
      </div>
      <div className="mtoggle-label">RETURN</div>
    </div>
  );
}
