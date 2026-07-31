function TimerSetupPanel({
  isGameStarted,
  timerEnabled,
  setTimerEnabled,
  reserveOption,
  setReserveOption,
  customReserveMinutes,
  setCustomReserveMinutes,
  RESERVE_OPTIONS,
  formatClock,
  currentReserveSeconds,
  onConfirm,
  isConfirmed = false,
}) {
  if (isGameStarted || isConfirmed) return null;

  return (
    <div className="absolute left-1/2 top-2 z-20 w-75 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-950/95 p-2 text-xs shadow-xl">
      <div className="mb-1 text-center text-sm font-bold text-amber-300">
        Chamber Clock
      </div>

      <label className="mb-2 flex items-center justify-center gap-2">
        <input
          type="checkbox"
          checked={timerEnabled}
          onChange={(event) => setTimerEnabled(event.target.checked)}
          className="h-4 w-4"
        />
        <span>Enable 30s timer</span>
      </label>

      {timerEnabled && (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-slate-300">Reserve</span>

            <select
              value={reserveOption}
              onChange={(event) => setReserveOption(event.target.value)}
              className="rounded bg-slate-900 p-1.5 text-white"
            >
              <option value={RESERVE_OPTIONS.NONE}>No reserve</option>
              <option value={RESERVE_OPTIONS.TWO_MIN}>2 minutes</option>
              <option value={RESERVE_OPTIONS.FIVE_MIN}>5 minutes</option>
              <option value={RESERVE_OPTIONS.CUSTOM}>Custom</option>
            </select>
          </label>

          <div className="rounded bg-slate-900 p-1.5 text-center text-slate-300">
            <div>Turn</div>
            <div className="font-bold text-white">00:30</div>
          </div>

          {reserveOption === RESERVE_OPTIONS.CUSTOM && (
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-slate-300">Custom minutes</span>

              <input
                type="number"
                min="1"
                value={customReserveMinutes}
                onChange={(event) =>
                  setCustomReserveMinutes(event.target.value)
                }
                className="rounded bg-slate-900 p-1.5 text-white"
              />
            </label>
          )}

          <div className="col-span-2 rounded bg-slate-900 p-1.5 text-center text-slate-300">
            Reserve:{" "}
            <span className="font-bold text-white">
              {formatClock(currentReserveSeconds)}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onConfirm?.()}
        className="mt-2 w-full rounded-lg bg-amber-600 px-2 py-1.5 text-sm font-bold text-white transition hover:bg-amber-500"
      >
        Done
      </button>
    </div>
  );
}

export default TimerSetupPanel;
