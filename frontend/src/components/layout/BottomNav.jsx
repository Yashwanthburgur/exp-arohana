/**
 * BottomNav - Chess.com style bottom navigation bar
 * Fixed bottom bar with 5 tabs: Board, Moves, Chat, Learn, More
 */

const TABS = [
  {
    id: 'board',
    label: 'Board',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-brand-gold)' : 'var(--color-text-muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="3" y="3" width="6" height="6" fill={active ? 'var(--color-brand-gold)' : 'none'} />
        <rect x="15" y="3" width="6" height="6" fill={active ? 'var(--color-brand-gold)' : 'none'} />
        <rect x="9" y="9" width="6" height="6" fill={active ? 'var(--color-brand-gold)' : 'none'} />
        <rect x="3" y="15" width="6" height="6" fill={active ? 'var(--color-brand-gold)' : 'none'} />
        <rect x="15" y="15" width="6" height="6" fill={active ? 'var(--color-brand-gold)' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'moves',
    label: 'Moves',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-brand-gold)' : 'var(--color-text-muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2.5" />
        <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2.5" />
        <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-brand-gold)' : 'var(--color-text-muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-brand-gold)' : 'var(--color-text-muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: 'more',
    label: 'More',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-brand-gold)' : 'var(--color-text-muted)'}>
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </svg>
    ),
  },
]

function BottomNav({ activeTab = 'board', onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface-primary)] border-t border-[var(--color-brand-gold-dim)]/20" style={{ paddingBottom: 'var(--sab, 0px)' }}>
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`
                flex flex-col items-center justify-center gap-0.5 w-14 h-full transition-colors touch-target
                ${isActive ? 'text-[var(--color-brand-gold)]' : 'text-[var(--color-text-muted)]'}
              `}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon(isActive)}
              <span className={`
                text-[10px] font-bold tracking-wider
                ${isActive ? 'text-[var(--color-brand-gold)]' : 'text-[var(--color-text-muted)]'}
              `}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav