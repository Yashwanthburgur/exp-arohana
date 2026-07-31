import { PIECE_CATALOG } from '../../engine/pieceCatalog.js'
import PieceIcon from './PieceIcon.jsx'

function Piece({ type, color, revealWolf = false }) {
  const pieceInfo = PIECE_CATALOG[type]

  if (!pieceInfo) {
    return <div title={`Missing catalog entry: ${type}`} className="flex h-[78%] w-[78%] items-center justify-center rounded-full bg-[var(--color-status-danger)] text-[10px] font-bold text-white shadow-md">??</div>
  }

  return (
    <div title={`${pieceInfo.name} · Tier ${pieceInfo.tier}`} className="flex h-[80%] w-[80%] min-h-6 min-w-6 select-none items-center justify-center">
      <PieceIcon type={type} color={color} revealWolf={revealWolf} />
    </div>
  )
}

export default Piece
