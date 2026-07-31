/**
 * MoveLogBar - Inline horizontal bar showing the last move
 * Chess.com style move display below player panel
 */
import { PIECE_CATALOG } from '../../engine/pieceCatalog.js'
import { getPieceIconComponent } from '../piece/PieceSvgIcons.jsx'

function MoveLogBar({ 
  matchLog = [], 
  onViewAll = null 
}) {
  const lastMove = matchLog.length > 0 ? matchLog[matchLog.length - 1] : null
  
  if (!lastMove) return null

  // Try to extract move info from the log entry
  const moveText = typeof lastMove === 'string' 
    ? lastMove 
    : lastMove.text || lastMove.message || ''
  
  // Extract piece name and squares if possible
  const pieceMatch = moveText.match(/(White|Black)\s+(\w+)\s+(\w+\d+)\s*[→➡️]\s*(\w+\d+)/i)
  
  const color = pieceMatch?.[1]?.toLowerCase() === 'black' ? 'BLACK' : 'WHITE'
  const pieceName = pieceMatch?.[2] || 'Piece'
  const from = pieceMatch?.[3] || ''
  const to = pieceMatch?.[4] || ''
  
  // Find piece type from catalog
  const pieceType = Object.keys(PIECE_CATALOG).find(
    key => PIECE_CATALOG[key].name.toLowerCase() === pieceName.toLowerCase()
  )
  
  const IconComponent = pieceType ? getPieceIconComponent(pieceType) : null

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[var(--color-surface-card)] border-t border-[var(--color-brand-gold-dim)]/20">
      {/* Move Log label */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[var(--color-brand-gold)] uppercase tracking-wider">
          Move Log
        </span>
        
        {IconComponent && (
          <IconComponent color={color} size={20} />
        )}
        
        <span className="text-xs text-[var(--color-text-secondary)] truncate max-w-[200px]">
          {color === 'white' ? 'White' : 'Black'} {pieceName}
          {from && to && (
            <span className="text-[var(--color-brand-gold)]"> {from} → {to}</span>
          )}
        </span>
      </div>
      
      {/* View All button */}
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-[var(--color-brand-gold)] hover:text-[var(--color-brand-gold-bright)] transition-colors"
        >
          View All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default MoveLogBar