/**
 * PlayerPanelCard - Chess.com style horizontal player card
 * Two rows:
 *   Row 1: Avatar + Timer + Reserve (portrait identity area)
 *   Row 2: Score + Moves + Bench (single horizontal strip)
 *
 * isOpponent prop applies muted/detached styling per design bible
 */
import PlayerAvatar from "./PlayerAvatar.jsx";
import TimerDisplay from "./TimerDisplay.jsx";
import ReserveTimer from "./ReserveTimer.jsx";
import BenchRow from "./BenchRow.jsx";

function PlayerPanelCard({
  color,
  playerName,
  army,
  score,
  moves,
  MOVE_LIMIT,
  isGameStarted,
  timerEnabled,
  activeTimerColor,
  timerState,
  hasReserveEnabled,
  formatClock,
  currentReserveSeconds,
  isCurrentTurn,
  isOpponent = false,
}) {
  const isActive = activeTimerColor === color;
  const turnSeconds = timerState?.turnRemaining?.[color] ?? 30;
  const reserveSeconds = timerState?.reserveRemaining?.[color] ?? 0;
  const reserveEnabled = hasReserveEnabled();
  const isTurnExpired = turnSeconds <= 0;

  return (
    <div
      className={`
        w-full bg-[var(--color-surface-card)] rounded-xl p-2.5 border border-[var(--color-brand-gold-dim)]/20
        ${isOpponent ? "opacity-65" : ""}
        transition-opacity duration-300
      `}
    >
      {/* Row 1: Avatar + Timer + Reserve */}
      <div className="flex items-center justify-between gap-2">
        <PlayerAvatar
          playerName={playerName}
          rating={1200}
          isOnline={true}
          pieceType="HORSE"
          color={color}
        />

        {timerEnabled ? (
          <TimerDisplay
            timeRemaining={turnSeconds}
            isActive={isActive && !isTurnExpired}
            isExpired={isActive && isTurnExpired}
            formatClock={formatClock}
          />
        ) : (
          <div className="flex-1 flex justify-center">
            <span className="text-sm text-[var(--color-text-muted)]">
              No timer
            </span>
          </div>
        )}

        {timerEnabled && reserveEnabled && (
          <ReserveTimer
            reserveSeconds={reserveSeconds}
            maxReserveSeconds={currentReserveSeconds}
            isActive={isActive}
          />
        )}
      </div>

      {/* Row 2: Score + Moves + Bench — single horizontal strip matching image */}
      {isGameStarted && (
        <div className="mt-1.5 flex items-center gap-0 w-full">
          {/* Score zone */}
          <div className="flex items-center gap-1 flex-shrink-0 pl-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--color-brand-gold)]"
            >
              <path
                d="M12 15C12 15 3 15 3 9V4H21V9C21 15 12 15 12 15Z"
                fill="currentColor"
              />
              <rect
                x="5"
                y="15"
                width="14"
                height="3"
                rx="1"
                fill="currentColor"
              />
            </svg>
            <span className="text-base font-black text-[var(--color-brand-gold)] tabular-nums">
              {score}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/10 flex-shrink-0 mx-2" />

          {/* Moves zone */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider leading-none">
              Moves
            </span>
            <span className="text-[13px] font-bold text-[var(--color-text-primary)] tabular-nums leading-tight">
              {moves} / {MOVE_LIMIT}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/10 flex-shrink-0 mx-2" />

          {/* Bench label — vertical text like image */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider leading-none">
              Bench
            </span>
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] leading-tight">
              (Next)
            </span>
          </div>

          {/* Bench pieces — scrollable carousel, takes remaining space */}
          <div className="flex-1 min-w-0 ml-2">
            <BenchRow pieces={army} color={color} isReadOnly={true} />
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerPanelCard;
