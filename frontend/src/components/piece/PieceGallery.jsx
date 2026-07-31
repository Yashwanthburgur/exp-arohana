import PiecePreview from './PiecePreview.jsx'
import { PIECE_TYPES } from '../../engine/pieceCatalog.js'

const pieceOrder = [
  // S tier Classic
  PIECE_TYPES.WARRIOR,
  PIECE_TYPES.GAJASHVA,
  // S tier Magical
  PIECE_TYPES.NINJA,
  PIECE_TYPES.SAGITTARIUS,

  // A tier
  PIECE_TYPES.RHINO,
  PIECE_TYPES.ELEPHANT,

  // B tier Classic
  PIECE_TYPES.GIRAFFE,
  PIECE_TYPES.CAMEL,
  PIECE_TYPES.HORSE,
  PIECE_TYPES.UNICORN,
  PIECE_TYPES.DONKEY,
  // B tier Magical
  PIECE_TYPES.DRAGON,

  // C tier Magical (all)
  PIECE_TYPES.WOLF,
  PIECE_TYPES.MONKEY,
  PIECE_TYPES.ANTELOPE,
  PIECE_TYPES.SKUNK,

  // D tier
  PIECE_TYPES.SNAKE,
  PIECE_TYPES.BULL,
  PIECE_TYPES.SOLDIER,
]

function PieceGallery() {
  return (
    <aside className="flex max-h-[90vh] w-72 flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-950/80 p-4 shadow-2xl">
      <h2 className="text-lg font-bold text-slate-100">
        Characters
      </h2>

      <p className="text-xs text-slate-400">
        Piece catalog preview
      </p>

      <div className="mt-2 flex flex-col gap-2">
        {pieceOrder.map((type) => (
          <PiecePreview key={type} type={type} />
        ))}
      </div>
    </aside>
  )
}

export default PieceGallery