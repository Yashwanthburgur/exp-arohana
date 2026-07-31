const HIGHLIGHT_CLASSES = {
  capture: "ring-4 ring-[var(--color-board-capture)] ring-inset",
  swap: "ring-4 ring-[var(--color-board-swap)] ring-inset",
  move: "ring-4 ring-[var(--color-board-move)] ring-inset",
};

function BoardSquare({
  isDark,
  isSelected = false,
  highlightKind = null,
  isWhiteHome = false,
  isBlackHome = false,
  isWhiteLaunchPad = false,
  isBlackLaunchPad = false,
  onClick,
  children,
}) {
  const highlightClass = highlightKind
    ? (HIGHLIGHT_CLASSES[highlightKind] ?? "")
    : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative h-[var(--sq)] w-[var(--sq)] overflow-hidden
        ${isDark ? "bg-[var(--color-board-dark)]" : "bg-[var(--color-board-light)]"}
        ${isSelected ? "outline outline-3 outline-[var(--color-board-selected)] outline-offset-[-2px] shadow-[0_0_12px_rgba(240,208,96,0.4)]" : ""}
        ${highlightClass}
        transition-colors duration-100
      `}
    >
      {isWhiteHome && (
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full border-2 border-white bg-white/80 shadow-sm" />
      )}

      {isBlackHome && (
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full border-2 border-[var(--color-surface-primary)] bg-black/80 shadow-sm" />
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </button>
  );
}

export default BoardSquare;
