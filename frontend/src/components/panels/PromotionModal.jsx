import { PIECE_CATALOG } from '../../engine/pieceCatalog.js'
import { getPieceIconComponent } from '../piece/PieceSvgIcons.jsx'

// ╔══════════════════════════════╗
// ✅ SOLDIER PROMOTION MODAL
// ╚══════════════════════════════╝
//
// Shown when a Soldier reaches the enemy back rank.
// Player picks any piece type from the match roster (both sides combined)
// excluding SOLDIER itself. The Soldier becomes that piece permanently.

function PromotionModal({
  promotionPending,
  eligibleTypes,
  onSelectPromotion,
}) {
  if (!promotionPending) return null

  const { color, square } = promotionPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-brand-gold-dim)]/30 bg-[var(--color-surface-card)] p-6 shadow-2xl animate-scale-in">

        {/* Header */}
        <div
          className="mb-1 text-center text-2xl font-black text-[var(--color-brand-gold)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ⚔ Promotion
        </div>
        <div className="mb-5 text-center text-sm text-[var(--color-text-secondary)]">
          {color} Soldier at{' '}
          <span className="font-bold text-[var(--color-text-primary)]">{square}</span>{' '}
          reached the back rank. Choose a promotion:
        </div>

        {/* Piece grid */}
        <div className="grid grid-cols-3 gap-3">
          {eligibleTypes.map(type => {
            const catalog = PIECE_CATALOG[type]
            if (!catalog) return null

            const tier = catalog.tier ?? '?'
            const tierColors = {
              S: 'border-yellow-500/60 bg-yellow-950/40',
              A: 'border-blue-500/60 bg-blue-950/40',
              B: 'border-emerald-600/60 bg-emerald-950/40',
              C: 'border-purple-500/60 bg-purple-950/40',
              D: 'border-slate-500/60 bg-[var(--color-surface-elevated)]',
            }

            const IconComponent = getPieceIconComponent(type)

            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectPromotion(type)}
                className={`
                  flex flex-col items-center rounded-xl border p-3
                  text-sm font-semibold transition-all touch-target
                  hover:scale-105 hover:brightness-125
                  ${tierColors[tier] ?? 'border-[var(--color-brand-gold-dim)]/30 bg-[var(--color-surface-elevated)]'}
                `}
              >
                <div className="mb-1">
                  <IconComponent color={color} size={40} />
                </div>
                <div className="text-xs text-[var(--color-text-primary)]">
                  {catalog.name}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                  Tier {tier}
                </div>
              </button>
            )
          })}
        </div>

        {/* Hint */}
        <div className="mt-5 text-center text-[11px] text-[var(--color-text-muted)]">
          The promoted piece remains in your queue when captured and will
          return to board as the promoted type — permanently for this match.
        </div>
      </div>
    </div>
  )
}

export default PromotionModal
