function MatchLogModal({
  isOpen,
  matchLog,
  onClose,
  onCopy,
}) {
  if (!isOpen) return null

  const recentLogs = [...matchLog].reverse()

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/75">
      {/* Bottom sheet on mobile, centered on desktop */}
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-t-2xl md:rounded-2xl border border-[var(--color-brand-gold-dim)]/20 bg-[var(--color-surface-card)] p-4 shadow-2xl animate-slide-up md:animate-scale-in">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center mb-2 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--color-text-muted)]/40" />
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div
              className="text-xl font-black text-[var(--color-brand-gold)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Match Log
            </div>

            <div className="text-xs text-[var(--color-text-secondary)]">
              {matchLog.length} recorded event{matchLog.length === 1 ? '' : 's'}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="rounded-lg bg-[var(--color-brand-gold)] px-3 py-2 text-xs font-black text-[var(--color-surface-primary)] hover:bg-[var(--color-brand-gold-bright)] transition-colors touch-target"
            >
              Copy
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2 text-xs font-black text-white hover:bg-[var(--color-surface-card-hover)] transition-colors touch-target"
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-[var(--color-surface-primary)] p-3">
          {recentLogs.length === 0 && (
            <div className="rounded bg-[var(--color-surface-card)] p-3 text-sm text-[var(--color-text-muted)]">
              No events recorded yet.
            </div>
          )}

          <div className="flex flex-col gap-2">
            {recentLogs.map(entry => (
              <div
                key={entry.id}
                className="rounded-lg border border-[var(--color-brand-gold-dim)]/20 bg-[var(--color-surface-card)] p-3 text-sm text-[var(--color-text-primary)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-[var(--color-text-muted)]">
                  <span>
                    #{entry.number} · Turn {entry.turn} · {entry.type}
                  </span>

                  <span>
                    {entry.phase}
                  </span>
                </div>

                <div className="leading-snug">
                  {entry.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchLogModal
