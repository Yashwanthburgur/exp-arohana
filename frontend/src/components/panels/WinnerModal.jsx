function WinnerModal({
  winner,
  blackScore,
  whiteScore,
  onViewLog,
  onRestart,
}) {
  if (!winner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="rounded-2xl bg-[var(--color-surface-card)] p-8 text-center shadow-2xl animate-scale-in border border-[var(--color-brand-gold-dim)]/30">
        {/* Trophy icon */}
        <div className="flex justify-center mb-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-[var(--color-brand-gold)]">
            <path d="M12 15C12 15 3 15 3 9V4H21V9C21 15 12 15 12 15Z" fill="currentColor" />
            <path d="M9 4V2H15V4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M3 4H1V9C1 12 3 14 5 15" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M21 4H23V9C23 12 21 14 19 15" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="5" y="15" width="14" height="3" rx="1" fill="currentColor" />
          </svg>
        </div>

        <div
          className="text-3xl font-black text-[var(--color-brand-gold)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {winner} Wins!
        </div>

        <div className="mt-3 text-sm text-[var(--color-text-secondary)]">
          Final Score — BLACK: {blackScore} | WHITE: {whiteScore}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onViewLog}
            className="rounded-lg bg-[var(--color-brand-gold)] px-5 py-2.5 font-bold text-[var(--color-surface-primary)] hover:bg-[var(--color-brand-gold-bright)] transition-colors touch-target"
          >
            View Match Log
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="rounded-lg bg-[var(--color-surface-elevated)] px-5 py-2.5 font-bold text-white border border-[var(--color-brand-gold-dim)]/30 hover:bg-[var(--color-surface-card-hover)] transition-colors touch-target"
          >
            Start Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default WinnerModal
