function HeaderBar({ onBack, title = "ĀROHAṆA - RAṆA", onSettings }) {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-surface-primary)] border-b border-[var(--color-brand-gold-dim)]/20">
      {/* Back Arrow */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--color-brand-gold)] hover:bg-[var(--color-surface-card)] transition-colors touch-target"
        aria-label="Back to menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Title */}
      <div className="flex items-center gap-2">
        {/* Chess piece icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--color-brand-gold)]">
          <path d="M12 2L8 6H16L12 2Z" fill="currentColor" />
          <path d="M8 6L6 10H18L16 6H8Z" fill="currentColor" />
          <rect x="6" y="10" width="12" height="3" rx="1" fill="currentColor" />
          <rect x="7" y="13" width="10" height="4" rx="0.5" fill="currentColor" />
          <rect x="5" y="17" width="14" height="3" rx="1" fill="currentColor" />
        </svg>
        <h1
          className="text-lg md:text-xl font-black tracking-wider text-[var(--color-brand-gold)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
      </div>

      {/* Settings Gear */}
      <button
        type="button"
        onClick={onSettings}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--color-brand-gold)] hover:bg-[var(--color-surface-card)] transition-colors touch-target"
        aria-label="Settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </header>
  )
}

export default HeaderBar