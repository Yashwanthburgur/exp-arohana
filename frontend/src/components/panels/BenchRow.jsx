/**
 * BenchRow - Modern horizontal card carousel for bench/draft queue
 * Feels like Instagram Stories / Apple Wallet — smooth horizontal scrolling
 * Each piece shows a styled short-name badge (like a CSS profile initial)
 * Piece name appears on hover/tap via PieceTooltip
 *
 * Shows ◀ ▶ scroll arrows when there are more pieces than fit in the row.
 * The row expands to fill its parent (board width on desktop).
 */
import { useRef, useState } from "react";
import { PIECE_CATALOG } from "../../engine/pieceCatalog.js";
import PieceTooltip from "../tooltip/PieceTooltip.jsx";

const ITEM_WIDTH = 48;
const GAP = 6; // 0.375rem gap-1.5

function BenchRow({
  pieces = [],
  color = "WHITE",
  onSelectPiece = null,
  selectedPieceIndex = -1,
  isReadOnly = false,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isDark = color === "BLACK";
  const badgeBg = isDark ? "bg-gray-700" : "bg-gray-200";
  const badgeText = isDark ? "text-gray-100" : "text-gray-900";

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  // Compute arrows on first render so overflow is detected immediately
  // even before the user scrolls.
  if (typeof window !== "undefined") {
    requestAnimationFrame(updateArrows);
  }

  function scrollBy(dir) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (ITEM_WIDTH + GAP) * 3, behavior: "smooth" });
    // Re-check arrows after the smooth scroll settles
    setTimeout(updateArrows, 350);
  }

  return (
    <div className="relative w-full flex items-center">
      {/* Left scroll arrow */}
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll bench left"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 z-10 -ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white shadow-md hover:bg-black/90 transition-colors cursor-pointer"
        >
          ◀
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-snap-x items-end pb-0.5 snap-mandatory gap-1.5 w-full max-w-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          contain: "layout style",
          // Show up to 6 items; anything beyond requires scrolling.
          // maxWidth 100% ensures it never overflows its parent panel.
          maxWidth: "min(calc(6 * 48px + 5 * 0.375rem), 100%)",
        }}
        onScroll={updateArrows}
      >
        {pieces.map((pieceType, index) => {
          const catalog = PIECE_CATALOG[pieceType];
          const shortName =
            catalog?.shortName || catalog?.name?.slice(0, 2) || "??";
          const isSelected = selectedPieceIndex === index;

          return (
            <PieceTooltip
              key={`tooltip-${pieceType}-${index}`}
              pieceType={catalog?.name || pieceType}
            >
              <button
                type="button"
                onClick={() => !isReadOnly && onSelectPiece?.(index)}
                disabled={isReadOnly}
                className={`
                  flex-shrink-0 flex flex-col items-center justify-center
                  rounded-lg transition-all duration-200
                  ${isReadOnly ? "cursor-default" : "cursor-pointer active:scale-95"}
                  snap-start
                `}
                style={{
                  width: `${ITEM_WIDTH}px`,
                  height: "40px",
                  flexShrink: 0,
                  minWidth: `${ITEM_WIDTH}px`,
                }}
              >
                {/* Short name badge — styled like a CSS profile initial */}
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold
                    ${badgeBg} ${badgeText}
                    ${isSelected ? "ring-2 ring-[var(--color-brand-gold)]" : ""}
                    shadow-sm
                  `}
                >
                  {shortName}
                </div>
              </button>
            </PieceTooltip>
          );
        })}
      </div>

      {/* Right scroll arrow */}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll bench right"
          onClick={() => scrollBy(1)}
          className="absolute right-0 z-10 -mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white shadow-md hover:bg-black/90 transition-colors cursor-pointer"
        >
          ▶
        </button>
      )}
    </div>
  );
}

export default BenchRow;
