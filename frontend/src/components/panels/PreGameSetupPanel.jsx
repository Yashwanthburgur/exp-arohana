import React from "react";
import {
  VARIANTS,
  VARIANT_LABELS,
  VARIANT_DESCRIPTIONS,
  MAGICAL_PIECES,
  MAGICAL_ONLY_PIECES,
  CLASSIC_PIECES,
  VARIANT_TIER_POOLS,
} from "../../constants/variantConfig.js";
import { PIECE_CATALOG } from "../../engine/pieceCatalog.js";

// ╔══════════════════════════════╗
// ✅ PRE-GAME SETUP PANEL
// ╚══════════════════════════════╝
// One combined panel: Chamber Clock + Game Variant + Point Goal,
// with a SINGLE "Done" button that confirms the whole setup at once.
// Replaces the separate VariantSetupPanel + TimerSetupPanel flow.

const TIER_DISPLAY_ORDER = ["S", "A", "B", "C", "D"];
const TIER_COLORS = {
  S: "text-yellow-400",
  A: "text-blue-400",
  B: "text-emerald-400",
  C: "text-purple-400",
  D: "text-slate-400",
};

const GOAL_OPTIONS = [
  { label: "Sprint", value: 15 },
  { label: "Standard", value: 25 },
  { label: "Marathon", value: 50 },
];

function PreGameSetupPanel({
  variant,
  setVariant,
  customPieces,
  setCustomPieces,
  timerEnabled,
  setTimerEnabled,
  reserveOption,
  setReserveOption,
  customReserveMinutes,
  setCustomReserveMinutes,
  RESERVE_OPTIONS,
  formatClock,
  currentReserveSeconds,
  winGoal,
  setWinGoal,
  onConfirm,
}) {
  const allPools = VARIANT_TIER_POOLS[VARIANTS.MAGICAL];

  function toggleCustomPiece(type) {
    setCustomPieces((prev) => {
      if (!prev) {
        const base = CLASSIC_PIECES.filter((p) => p !== type);
        return base;
      }
      if (prev.includes(type)) {
        return prev.filter((p) => p !== type);
      }
      return [...prev, type];
    });
  }

  function handleVariantChange(v) {
    setVariant(v);
    if (v === VARIANTS.CUSTOM) {
      setCustomPieces((prev) => prev ?? [...CLASSIC_PIECES]);
    } else {
      setCustomPieces(null);
    }
  }

  const activePieces =
    variant === VARIANTS.MAGICAL
      ? MAGICAL_PIECES
      : variant === VARIANTS.CUSTOM && customPieces
        ? customPieces
        : CLASSIC_PIECES;

  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs shadow-xl">
      {/* ── CHAMBER CLOCK ─────────────────────────── */}
      <div className="mb-2 rounded-lg border border-slate-800 bg-slate-900/60 p-2">
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
      </div>

      {/* ── GAME VARIANT ──────────────────────────── */}
      <div className="mb-2 rounded-lg border border-slate-800 bg-slate-900/60 p-2">
        <div className="mb-2 text-center text-sm font-bold text-cyan-300">
          Game Variant
        </div>

        <div className="mb-3 flex gap-1">
          {Object.values(VARIANTS).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleVariantChange(v)}
              className={`
                flex-1 rounded-lg py-1.5 text-xs font-bold transition-all
                ${
                  variant === v
                    ? "bg-cyan-600 text-white shadow"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }
              `}
            >
              {VARIANT_LABELS[v]}
            </button>
          ))}
        </div>

        <div className="mb-2 text-center text-[11px] text-slate-400">
          {VARIANT_DESCRIPTIONS[variant]}
        </div>

        {variant === VARIANTS.CUSTOM && (
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-2">
            {TIER_DISPLAY_ORDER.map((tier) => {
              const tierPieces = allPools[tier] ?? [];
              if (tierPieces.length === 0) return null;

              return (
                <div key={tier} className="mb-2">
                  <div
                    className={`mb-1 text-[10px] font-black uppercase tracking-widest ${TIER_COLORS[tier]}`}
                  >
                    Tier {tier}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tierPieces.map((type) => {
                      const name = PIECE_CATALOG[type]?.name ?? type;
                      const selected = customPieces?.includes(type) ?? true;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleCustomPiece(type)}
                          className={`
                            rounded px-2 py-0.5 text-[10px] font-semibold transition-all
                            ${
                              selected
                                ? "bg-cyan-700 text-white"
                                : "bg-slate-800 text-slate-500 line-through"
                            }
                          `}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {variant !== VARIANTS.CUSTOM && (
          <div className="mt-1 text-center text-[10px] text-slate-500">
            {activePieces.length} piece types available
            {variant === VARIANTS.MAGICAL && (
              <span className="ml-1 text-purple-400">
                (+{MAGICAL_ONLY_PIECES.length} magical)
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── POINT GOAL ────────────────────────────── */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
        <div className="mb-1 text-center text-sm font-bold text-emerald-300">
          Point Goal
        </div>

        <div className="mb-1 flex gap-1">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => setWinGoal(goal.value)}
              className={`
                flex-1 rounded-lg py-1.5 text-xs font-bold transition-all
                ${
                  winGoal === goal.value
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }
              `}
            >
              {goal.label}
            </button>
          ))}
        </div>

        <div className="text-center text-[10px] text-slate-500">
          Match length — first to {winGoal} points wins
        </div>
      </div>

      {/* ── SINGLE DONE ───────────────────────────── */}
      <button
        type="button"
        onClick={() => onConfirm?.()}
        className="mt-3 w-full rounded-lg bg-emerald-600 px-2 py-2 text-sm font-black text-white transition hover:bg-emerald-500"
      >
        Done
      </button>
    </div>
  );
}

export default PreGameSetupPanel;
