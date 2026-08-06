/**
 * DrawOfferModal - Shows an incoming draw offer with Accept / Decline.
 */
function DrawOfferModal({ open, opponentName = "Opponent", onAccept, onDecline }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[320px] rounded-2xl bg-[var(--color-surface-card)] p-6 text-center shadow-2xl border border-[var(--color-brand-gold-dim)]/30 animate-scale-in">
        <div className="text-4xl">🤝</div>

        <div className="mt-2 text-lg font-black text-white">
          Draw Offer
        </div>

        <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {opponentName} offers a draw. Accept?
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="rounded-lg bg-[var(--color-surface-elevated)] px-4 py-2 text-sm font-bold text-white border border-white/10 hover:bg-[var(--color-surface-card-hover)] transition-colors cursor-pointer"
          >
            Decline
          </button>

          <button
            type="button"
            onClick={onAccept}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            Accept Draw
          </button>
        </div>
      </div>
    </div>
  );
}

export default DrawOfferModal;
