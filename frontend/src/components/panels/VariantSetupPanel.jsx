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
// ✅ VARIANT SETUP PANEL
// ╚══════════════════════════════╝
//
// Shown during SETUP phase only (hidden once game starts).
// Positioned at the top-left, similar to TimerSetupPanel.
// Allows players to select Classic / Magical / Custom before rolling.

const TIER_DISPLAY_ORDER = ["S", "A", "B", "C", "D"];
const TIER_COLORS = {
  S: "text-yellow-400",
  A: "text-blue-400",
  B: "text-emerald-400",
  C: "text-purple-400",
  D: "text-slate-400",
};

function VariantSetupPanel({
  isGameStarted,
  variant,
  setVariant,
  customPieces,
  setCustomPieces,
  onConfirm,
  isConfirmed = false,
}) {
  if (isGameStarted || isConfirmed) return null;

  // Build grouped display for Custom mode
  const allPools = VARIANT_TIER_POOLS[VARIANTS.MAGICAL];

  function toggleCustomPiece(type) {
    setCustomPieces((prev) => {
      if (!prev) {
        // Default to Classic pieces when first entering Custom
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
      // Initialize custom selection to Classic pieces
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
      {/* Title */}
      <div className="mb-2 text-center text-sm font-bold text-cyan-300">
        Game Variant
      </div>

      {/* Variant selector */}
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

      {/* Description */}
      <div className="mb-2 text-center text-[11px] text-slate-400">
        {VARIANT_DESCRIPTIONS[variant]}
      </div>

      {/* Custom piece selector */}
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

      {/* Piece count badge for non-custom */}
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

      <button
        type="button"
        onClick={() => onConfirm?.()}
        className="mt-3 w-full rounded-lg bg-cyan-600 px-2 py-1.5 text-sm font-bold text-white transition hover:bg-cyan-500"
      >
        Done
      </button>
    </div>
  );
}

export default VariantSetupPanel;
