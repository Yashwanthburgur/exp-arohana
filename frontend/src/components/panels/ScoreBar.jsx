/**
 * ScoreBar - Compact horizontal bar showing score, moves, and piece count
 * Displayed inline below the timer area
 */
function ScoreBar({ 
  score = 0, 
  moves = 0, 
  moveLimit = 10, 
  pieceCount = 0,
  label = '' 
}) {
  return (
    <div className="flex items-center justify-center gap-4 px-3 py-1.5 bg-[var(--color-surface-card)] rounded-lg">
      {/* Score */}
      <div className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--color-brand-gold)]">
          <path d="M12 15C12 15 3 15 3 9V4H21V9C21 15 12 15 12 15Z" fill="currentColor" />
          <rect x="5" y="15" width="14" height="3" rx="1" fill="currentColor" />
        </svg>
        <span className="text-lg font-black text-[var(--color-brand-gold)] tabular-nums">
          {score}
        </span>
      </div>
      
      {/* Divider */}
      <div className="w-px h-4 bg-[var(--color-brand-gold-dim)]/30" />
      
      {/* Moves */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          Moves
        </span>
        <span className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
          {moves} / {moveLimit}
        </span>
      </div>
      
      {/* Divider */}
      <div className="w-px h-4 bg-[var(--color-brand-gold-dim)]/30" />
      
      {/* Bench/Next */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          Bench
        </span>
        <span className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
          (Next) {pieceCount}
        </span>
      </div>
    </div>
  )
}

export default ScoreBar