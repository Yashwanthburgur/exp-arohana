/**
 * TimerDisplay - Chess.com style large centered timer
 * Layout: big timer → gold progress bar → "Your Turn" text
 * Active state: bright text + breathing animation + progress bar
 * Passive state: muted text, no animation
 */
function TimerDisplay({ 
  timeRemaining = 30, 
  isActive = false, 
  isExpired = false,
  label = '',
  formatClock 
}) {
  const formatted = formatClock ? formatClock(timeRemaining) : '00:30'
  const maxTime = 30
  const progress = Math.min(100, Math.max(0, (timeRemaining / maxTime) * 100))
  
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      {/* Main timer display — largest typography element */}
      <div
        className={`
          text-3xl md:text-4xl font-black tracking-wider tabular-nums leading-none
          transition-colors duration-200
          ${isExpired
            ? 'text-[var(--color-status-danger)]'
            : isActive
              ? 'text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-muted)]'
          }
          ${isActive && !isExpired ? 'animate-[breathe_3s_ease-in-out_infinite]' : ''}
        `}
      >
        {formatted}
      </div>
      
      {/* Gold progress bar — always visible when timer is active */}
      <div className="w-full max-w-[160px] h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
        <div
          className={`
            h-full rounded-full transition-all duration-1000 ease-linear
            ${isExpired
              ? 'bg-[var(--color-status-danger)]'
              : isActive
                ? 'bg-[var(--color-brand-gold)]'
                : 'bg-[var(--color-text-muted)]/40'
            }
          `}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* "Your Turn" indicator — text below the bar */}
      {isActive && !isExpired && (
        <span className="text-[11px] font-bold text-[var(--color-brand-gold)] uppercase tracking-wide mt-0.5 animate-[breathe_3s_ease-in-out_infinite]">
          Your Turn
        </span>
      )}
      
      {/* Expired warning */}
      {isExpired && (
        <span className="text-[11px] font-bold text-[var(--color-status-danger)] uppercase tracking-wide mt-0.5">
          Time!
        </span>
      )}
    </div>
  )
}

export default TimerDisplay