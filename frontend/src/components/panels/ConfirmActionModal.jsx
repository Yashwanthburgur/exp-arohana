/**
 * ConfirmActionModal - Reusable confirmation dialog
 * Used for Home (surrender & exit) and Resign actions.
 */
function ConfirmActionModal({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-[320px] rounded-2xl bg-[var(--color-surface-card)] p-6 text-center shadow-2xl border border-[var(--color-brand-gold-dim)]/30 animate-scale-in">
        <div className="text-lg font-black text-white">{title}</div>

        <div className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {message}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-[var(--color-surface-elevated)] px-4 py-2 text-sm font-bold text-white border border-white/10 hover:bg-[var(--color-surface-card-hover)] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmActionModal;
