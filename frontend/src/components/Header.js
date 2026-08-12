function Header() {
    return (
        <header className="tracer-header">
            <div className="tracer-logo">
        <span className="tracer-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11l18-8-8 18-2-8-8-2z" />
          </svg>
        </span>
                <span>Tracer</span>
            </div>
            <div className="tracer-live-badge">
                <span className="live-dot" /> Live
            </div>
        </header>
    );
}

export default Header;