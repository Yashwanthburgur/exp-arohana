import { PIECE_CATALOG } from "../../engine/pieceCatalog.js";

function PieceIcon({ type, color, revealWolf = false, className = "" }) {
  if (type === "WOLF" && !revealWolf) return null;

  const catalog = PIECE_CATALOG[type];
  const name = catalog?.name ?? type;
  const tier = catalog?.tier ?? "D";
  const label = catalog?.shortName || name.slice(0, 2);
  const isDark = color === "BLACK";

  return (
    <div
      role="img"
      aria-label={`${color === "BLACK" ? "Black" : "White"} ${name}`}
      title={`${name} · Tier ${tier}`}
      className={`
        piece-token relative h-full w-full flex items-center justify-center
        select-none overflow-hidden
        transition-transform duration-100 hover:-translate-y-0.5 hover:scale-[1.03]
        ${className}
      `}
    >
      <span
        className={`
          flex items-center justify-center rounded-full text-[10px] font-bold leading-none
          w-7 h-7 shadow-sm
          ${isDark ? "bg-gray-800 text-gray-100 ring-1 ring-gray-600" : "bg-gray-100 text-gray-900 ring-1 ring-gray-300"}
        `}
      >
        {label}
      </span>
    </div>
  );
}

export default PieceIcon;
