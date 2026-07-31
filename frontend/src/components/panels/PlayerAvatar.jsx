/**
 * PlayerAvatar - Chess.com style player card avatar
 * Shows a circular avatar with piece icon, online status dot,
 * player name, and rating with trophy icon.
 */
import { getPieceIconComponent } from '../piece/PieceSvgIcons.jsx'

function PlayerAvatar({ 
  playerName = 'Player', 
  rating = 1200, 
  isOnline = true, 
  pieceType = 'HORSE',
  color = 'WHITE'
}) {
  const AvatarIcon = getPieceIconComponent(pieceType)
  
  return (
    <div className="flex items-center gap-3">
      {/* Avatar circle */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-[var(--color-surface-card)] border-2 border-[var(--color-brand-gold-dim)] flex items-center justify-center overflow-hidden">
          <AvatarIcon 
            color={color} 
            size={48} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Online status dot */}
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-status-active)] border-2 border-[var(--color-surface-primary)]" />
        )}
      </div>
      
      {/* Player info */}
      <div className="flex flex-col">
        <div className="text-sm font-bold text-[var(--color-text-primary)]">
          {playerName}
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
          {/* Trophy icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[var(--color-brand-gold)]">
            <path d="M12 15C12 15 3 15 3 9V4H21V9C21 15 12 15 12 15Z" fill="currentColor" />
            <path d="M9 4V2H15V4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M3 4H1V9C1 12 3 14 5 15" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M21 4H23V9C23 12 21 14 19 15" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="5" y="15" width="14" height="3" rx="1" fill="currentColor" />
          </svg>
          <span className="font-semibold text-[var(--color-brand-gold)]">
            {rating}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PlayerAvatar