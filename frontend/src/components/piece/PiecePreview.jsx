import Piece from './Piece.jsx'
import { PIECE_CATALOG } from '../../engine/pieceCatalog.js'

function PiecePreview({ type }) {
  const pieceInfo = PIECE_CATALOG[type]

  if (!pieceInfo) {
    return (
      <div className="rounded-lg bg-red-900/60 p-2 text-xs text-red-100">
        Missing catalog entry: {type}
      </div>
    )
  }

  const materialDisplay = typeof pieceInfo.materialScore === 'number'
    ? `${pieceInfo.materialScore.toFixed(1)} pts`
    : '— pts'

  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-800/80 p-2 shadow hover:bg-slate-800 transition-colors">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        <Piece type={type} color="WHITE" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-100">
          {pieceInfo.name}
        </div>

        <div className="flex items-baseline gap-2 text-xs text-slate-400">
          <span>Tier {pieceInfo.tier}</span>
          <span className="text-slate-600">·</span>
          <span>{materialDisplay}</span>
          {pieceInfo.comboCount > 1 && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400">x{pieceInfo.comboCount}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PiecePreview
