import BenchRow from "./BenchRow.jsx";

function TimerStatusPanel({
  color,
  timerEnabled,
  activeTimerColor,
  timerState,
  hasReserveEnabled,
  formatClock,
}) {
  if (!timerEnabled) return null;

  const isActive = activeTimerColor === color;
  const turnSeconds = timerState.turnRemaining?.[color] ?? 30;
  const reserveSeconds = timerState.reserveRemaining?.[color] ?? 0;

  const isTurnExpired = turnSeconds <= 0;
  const reserveEnabled = hasReserveEnabled();

  return (
    <div
      className={`
        flex items-center gap-2 rounded-xl border px-2 py-1 shadow
        ${
          isActive
            ? "border-amber-400 bg-slate-800"
            : "border-slate-700 bg-slate-900"
        }
      `}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        Clock
      </span>

      <span
        className={`
          text-xl font-black tabular-nums
          ${
            isActive && isTurnExpired
              ? "text-red-400"
              : isActive
                ? "text-emerald-300"
                : "text-slate-500"
          }
        `}
      >
        {formatClock(turnSeconds)}
      </span>

      {reserveEnabled && (
        <span
          className={`
            text-xs font-semibold
            ${isActive && isTurnExpired ? "text-red-300" : "text-slate-400"}
          `}
        >
          R {formatClock(reserveSeconds)}
        </span>
      )}

      {isActive && isTurnExpired && (
        <span className="text-[9px] font-bold uppercase tracking-wide text-red-400">
          {reserveEnabled && reserveSeconds > 0 ? "Draining" : "Seizure"}
        </span>
      )}
    </div>
  );
}

function SidePanel({
  color,
  army,
  isReady,
  setReady,
  score,
  moves,
  MOVE_LIMIT,
  isGameStarted,
  isWhitePanel,
  whiteArmy,
  blackArmy,
  rollPiece,
  moveUp,
  moveDown,
  getQueueLabel,
  calculateMaterialTotal,
  timerEnabled,
  activeTimerColor,
  timerState,
  hasReserveEnabled,
  formatClock,
  seizureAction,
  timeoutStatus,
  pendingInitialSupportColor,
  initialSupportQueues,
  pendingSpawnColor,
  getSpawnTargets,
  pendingHomeAttack,
  isDraftComplete,
  readOnly = false,
}) {
  const frontPiece = army[0];

  return (
    <div
      className={
        isGameStarted
          ? "w-full rounded-xl bg-slate-950/50 px-2 py-1.5 shadow border border-white/[0.06]"
          : "flex max-h-[96vh] w-full flex-col gap-2 overflow-hidden rounded-2xl bg-slate-950/40 p-2"
      }
    >
      {!isGameStarted && (
        <h2 className="text-center text-base font-black tracking-wide">
          {color}
        </h2>
      )}

      {isGameStarted ? (
        <div className="flex items-center gap-2 w-full">
          {/* Color chip */}
          <div
            className={`flex-shrink-0 rounded-lg px-2 py-1.5 text-center shadow ${
              color === "WHITE"
                ? "bg-slate-100 text-slate-900"
                : "bg-slate-800 text-slate-100"
            }`}
          >
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">
              {color === "WHITE" ? "White" : "Black"}
            </div>
          </div>

          {/* Status badges (compact inline) */}
          {(seizureAction?.controller === color ||
            seizureAction?.actingColor === color ||
            timeoutStatus?.color === color ||
            pendingInitialSupportColor === color ||
            pendingSpawnColor === color ||
            pendingHomeAttack) && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {seizureAction && seizureAction.controller === color && (
                <span className="rounded bg-red-800 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  Seizing
                </span>
              )}
              {seizureAction &&
                seizureAction.actingColor === color &&
                seizureAction.controller !== color && (
                  <span className="rounded bg-red-950 px-1.5 py-0.5 text-[10px] font-bold leading-none text-red-200">
                    Seized
                  </span>
                )}
              {timeoutStatus?.color === color && (
                <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {timeoutStatus.message}
                </span>
              )}
              {pendingInitialSupportColor === color && (
                <span className="rounded bg-purple-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  Support {initialSupportQueues[color]?.[0]}
                </span>
              )}
              {pendingSpawnColor === color && (
                <span className="rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {getSpawnTargets().length > 0
                    ? `Spawn ${frontPiece}`
                    : `Wait ${frontPiece}`}
                </span>
              )}
              {pendingHomeAttack && (
                <span className="rounded bg-yellow-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  Claim {pendingHomeAttack.square}
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="h-7 w-px bg-white/10 flex-shrink-0" />

          {/* Score */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Score
            </span>
            <span className="text-base font-black leading-tight text-amber-300 tabular-nums">
              {score}
            </span>
          </div>

          {/* Divider */}
          <div className="h-7 w-px bg-white/10 flex-shrink-0" />

          {/* Moves */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Moves
            </span>
            <span className="text-base font-black leading-tight text-cyan-300 tabular-nums">
              {moves}/{MOVE_LIMIT}
            </span>
          </div>

          {/* Divider */}
          <div className="h-7 w-px bg-white/10 flex-shrink-0" />

          {/* Bench label */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Bench
            </span>
            <span className="text-[10px] font-bold leading-tight text-slate-300">
              (Next)
            </span>
          </div>

          {/* Bench carousel — takes remaining space, expands to board width */}
          <div className="flex-1 min-w-0">
            {army.length === 0 ? (
              <div className="rounded bg-slate-900 p-1.5 text-center text-xs text-slate-400">
                Empty
              </div>
            ) : (
              <BenchRow pieces={army} color={color} isReadOnly={true} />
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-800 p-2 text-center text-xs">
              <div className="text-slate-400">Drafted</div>
              <div className="text-lg font-black text-amber-300">
                {army.length}/8
              </div>
            </div>

            <div className="rounded-lg bg-slate-800 p-2 text-center text-xs">
              <div className="text-slate-400">Material</div>
              <div className="text-lg font-black text-cyan-300">
                {calculateMaterialTotal(army).toFixed(1)}
              </div>
            </div>
          </div>

          <button
            onClick={rollPiece}
            disabled={readOnly || isReady || isDraftComplete()}
            className={`rounded-lg p-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 ${
              isWhitePanel
                ? "bg-cyan-500 text-black hover:bg-cyan-400"
                : "bg-red-500 text-white hover:bg-red-400"
            }`}
          >
            Roll Both
          </button>

          <div className="min-h-0 flex-1 rounded-xl bg-slate-800 p-2 shadow">
            <div className="mb-2 text-center text-xs font-black uppercase tracking-wide text-slate-300">
              Draft Queue
            </div>

            <div className="flex max-h-full flex-col gap-1 overflow-y-auto pr-1">
              {Array.from({ length: 8 }).map((_, slotIndex) => {
                const piece = army[slotIndex];
                const isFirst = slotIndex === 0;
                const isLastFilled = slotIndex === army.length - 1;
                const isEmpty = !piece;

                return (
                  <div
                    key={`${color}-slot-${slotIndex}`}
                    className={`
                      flex h-9 items-center justify-between gap-2
                      rounded-lg border px-2 text-xs shadow-sm
                      ${
                        isEmpty
                          ? "border-dashed border-slate-700 bg-slate-900 text-slate-500"
                          : "border-slate-700 bg-slate-900 text-slate-100"
                      }
                    `}
                  >
                    <div className="min-w-0">
                      {piece ? (
                        <>
                          <div className="truncate font-semibold">
                            {slotIndex + 1}.{" "}
                            {getQueueLabel(piece, slotIndex, false)}
                          </div>

                          {slotIndex === 0 && (
                            <div className="text-[9px] uppercase tracking-wide text-amber-300">
                              Next starter
                            </div>
                          )}
                        </>
                      ) : (
                        <div>{slotIndex + 1}. Empty</div>
                      )}
                    </div>

                    {piece && (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => moveUp(color, slotIndex)}
                          disabled={readOnly || isReady || isFirst}
                          title="Move up"
                          className={`
                            flex h-7 w-7 items-center justify-center rounded-md
                            text-xs font-black shadow
                            ${
                              readOnly || isReady || isFirst
                                ? "cursor-not-allowed bg-slate-700 text-slate-500"
                                : "bg-emerald-500 text-black hover:bg-emerald-400"
                            }
                          `}
                        >
                          ▲
                        </button>

                        <button
                          type="button"
                          onClick={() => moveDown(color, slotIndex)}
                          disabled={readOnly || isReady || isLastFilled}
                          title="Move down"
                          className={`
                            flex h-7 w-7 items-center justify-center rounded-md
                            text-xs font-black shadow
                            ${
                              readOnly || isReady || isLastFilled
                                ? "cursor-not-allowed bg-slate-700 text-slate-500"
                                : "bg-red-500 text-white hover:bg-red-400"
                            }
                          `}
                        >
                          ▼
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setReady(true)}
            disabled={
              readOnly || isReady || army.length < 8 || !isDraftComplete()
            }
            className={`
              rounded-lg p-2 text-sm font-black
              disabled:cursor-not-allowed disabled:opacity-50
              ${
                isReady
                  ? "bg-slate-700 text-slate-300"
                  : "bg-green-600 text-white hover:bg-green-500"
              }
            `}
          >
            {isReady ? "LOCKED" : "READY"}
          </button>
        </>
      )}
    </div>
  );
}

export default SidePanel;
