/**
 * GameActionBar - Chess.com style bottom action bar during gameplay.
 * Actions: Home (surrender+exit) | Chat | Learn | Draw (offer) | Resign
 */
function GameActionBar({
  onHome,
  onChat,
  onLearn,
  onDraw,
  onResign,
  drawOfferPending = false,
}) {
  const btnBase =
    "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors cursor-pointer hover:bg-white/[0.06]";

  return (
    <div className="flex items-stretch h-11 w-full bg-slate-950/60 border-t border-white/10 rounded-b-lg">
      {/* Home — surrender & exit */}
      <button type="button" onClick={onHome} className={btnBase} title="Home (surrender & exit)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[9px] font-bold text-slate-400">Home</span>
      </button>

      {/* Chat — placeholder */}
      <button type="button" onClick={onChat} className={btnBase} title="Chat (coming soon)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-[9px] font-bold text-slate-400">Chat</span>
      </button>

      {/* Learn / Academy — placeholder */}
      <button type="button" onClick={onLearn} className={btnBase} title="Academy (coming soon)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <span className="text-[9px] font-bold text-slate-400">Learn</span>
      </button>

      {/* Draw — offer draw (handshake) */}
      <button
        type="button"
        onClick={onDraw}
        className={btnBase}
        title={drawOfferPending ? "Draw offer sent" : "Offer draw"}
      >
        <div className="relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
            <path d="M17 6.1a3 3 0 0 0-4.2 0L9 9.9l1.1 1.1a3 3 0 0 0 4.2 0" />
            <path d="M12.1 11.1 11 12l5.7 5.7a2 2 0 0 0 2.8 0l.9-.9a2 2 0 0 0 0-2.8" />
            <path d="M6.1 17 3 20.1" />
            <path d="M9.9 17l-3 3" />
            <path d="M8.6 8.6 5.9 11.3a2 2 0 0 0 0 2.8l.8.8a2 2 0 0 0 2.8 0L13 11.5" />
          </svg>
          {drawOfferPending && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
        <span className={`text-[9px] font-bold ${drawOfferPending ? "text-emerald-300" : "text-slate-400"}`}>
          Draw
        </span>
      </button>

      {/* Resign — surrender */}
      <button type="button" onClick={onResign} className={btnBase} title="Resign (surrender)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        <span className="text-[9px] font-bold text-slate-400">Resign</span>
      </button>
    </div>
  );
}

export default GameActionBar;
