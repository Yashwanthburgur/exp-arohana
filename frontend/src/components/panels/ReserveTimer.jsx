/**
 * ReserveTimer - Circular SVG progress ring showing reserve time
 * Chess.com style compact reserve timer with circular progress indicator
 */
function ReserveTimer({ 
  reserveSeconds = 0, 
  maxReserveSeconds = 300,
  isActive = false 
}) {
  const percentage = maxReserveSeconds > 0 
    ? Math.min(100, Math.max(0, (reserveSeconds / maxReserveSeconds) * 100)) 
    : 0

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // SVG circular progress
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Label */}
      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
        Reserve
      </span>
      
      <div className="flex items-center gap-2">
        {/* Time display */}
        <span className="text-sm font-bold text-[var(--color-text-secondary)] tabular-nums">
          {formatTime(reserveSeconds)}
        </span>
        
        {/* Circular progress ring */}
        <div className="relative">
          <svg width="36" height="36" viewBox="0 0 36 36">
            {/* Background ring */}
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="var(--color-surface-card)"
              strokeWidth="3"
            />
            {/* Progress ring */}
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={isActive ? 'var(--color-brand-gold)' : 'var(--color-text-muted)'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 18 18)"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>
      </div>
      
      {/* Warning states */}
      {isActive && reserveSeconds <= 0 && (
        <div className="text-[9px] font-bold text-[var(--color-status-danger)] uppercase tracking-wide">
          Seizure ready
        </div>
      )}
      {isActive && reserveSeconds > 0 && reserveSeconds <= 30 && (
        <div className="text-[9px] font-bold text-[var(--color-status-warning)] uppercase tracking-wide">
          Reserve draining
        </div>
      )}
    </div>
  )
}

export default ReserveTimer