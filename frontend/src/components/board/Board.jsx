import BoardSquare from "./BoardSquare.jsx";
import Piece from "../piece/Piece.jsx";
import {
  FILES,
  LAUNCH_FILES,
  WHITE_LAUNCH_PADS,
  BLACK_LAUNCH_PADS,
} from "../../constants/boardConfig.js";

const mainRanks = [9, 8, 7, 6, 5, 4, 3, 2, 1];

function Board({
  pieces,
  selectedPieceId,
  legalTargets = [],
  onSquareClick,
  whiteHome,
  blackHome,
  isFlipped = false,
  // Optional launch-row gap timers — desktop layout passes these so the
  // empty 3-square gaps beside the launch pads show the clocks.
  timerEnabled = false,
  timerState = null,
  hasReserveEnabled = () => false,
  formatClock = (s) => `${s}s`,
  activeTimerColor = null,
  topColor = "BLACK",
  bottomColor = "WHITE",
}) {
  const displayRanks = isFlipped ? [...mainRanks].reverse() : mainRanks;
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;
  const displayLaunchFiles = isFlipped
    ? [...LAUNCH_FILES].reverse()
    : LAUNCH_FILES;

  const topRank = isFlipped ? 0 : 10;
  const bottomRank = isFlipped ? 10 : 0;

  const topTurn = timerState?.turnRemaining?.[topColor] ?? 0;
  const topReserve = timerState?.reserveRemaining?.[topColor] ?? 0;
  const bottomTurn = timerState?.turnRemaining?.[bottomColor] ?? 0;
  const bottomReserve = timerState?.reserveRemaining?.[bottomColor] ?? 0;
  const reserveEnabled = hasReserveEnabled();

  // Square size is constrained by BOTH viewport width and height so the
  // board always fits on a single screen (design bible: board is the hero,
  // never clips, perfect aspect ratio).
  const squareSize =
    "clamp(1.4rem, min(7.5vw, calc((100vh - 210px) / 11)), 3rem)";

  function renderSquare(coordinate, rank, fileIndex) {
    const isDark = (rank + fileIndex) % 2 === 0;
    const piece = pieces.find((piece) => piece.square === coordinate);
    const isSelected = piece?.id === selectedPieceId;
    const highlight = legalTargets.find(
      (target) => target.square === coordinate,
    );

    const isWolf = piece?.type === "WOLF";

    // Wolf is always invisible.
    const shouldShowPiece = piece && !isWolf;

    return (
      <BoardSquare
        key={coordinate}
        isDark={isDark}
        isWhiteHome={coordinate === whiteHome}
        isBlackHome={coordinate === blackHome}
        isWhiteLaunchPad={WHITE_LAUNCH_PADS.includes(coordinate)}
        isBlackLaunchPad={BLACK_LAUNCH_PADS.includes(coordinate)}
        isSelected={isSelected}
        highlightKind={highlight?.kind}
        onClick={() => onSquareClick(coordinate)}
      >
        {shouldShowPiece && <Piece type={piece.type} color={piece.color} />}
      </BoardSquare>
    );
  }

  // Compact clock chip shown inside the empty launch-row gaps.
  // Left gap = turn timer, right gap = reserve timer.
  function GapTimer({ label, seconds, isActive, hasValue = true }) {
    if (!timerEnabled) return null;
    return (
      <div
        className={`h-full w-full flex flex-col items-center justify-center gap-0.5 px-0.5 ${
          isActive ? "bg-slate-800/70" : "bg-slate-900/50"
        }`}
      >
        <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500 leading-none">
          {label}
        </span>
        <span
          className={`text-[13px] font-black tabular-nums leading-none ${
            isActive ? "text-emerald-300" : "text-slate-400"
          }`}
        >
          {hasValue ? formatClock(seconds) : "—"}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center max-w-full overflow-hidden"
      style={{ "--sq": squareSize }}
    >
      {/* Top launch row - rank 10/0 */}
      <div className="grid grid-cols-[20px_repeat(9,var(--sq))]">
        <div className="flex items-center justify-center text-[10px] text-[var(--color-text-muted)]/50 font-medium">
          {isFlipped ? 0 : 10}
        </div>

        {/* Left gap (3 empty squares) → turn timer */}
        <div className="col-span-3 h-[var(--sq)]">
          <GapTimer
            label="Turn"
            seconds={topTurn}
            isActive={activeTimerColor === topColor}
          />
        </div>

        {/* Launch pads (d/e/f) */}
        {displayLaunchFiles.map((file, i) =>
          renderSquare(`${file}${topRank}`, topRank, 3 + i),
        )}

        {/* Right gap (3 empty squares) → reserve timer */}
        <div className="col-span-3 h-[var(--sq)]">
          <GapTimer
            label="Rsv"
            seconds={topReserve}
            isActive={activeTimerColor === topColor}
            hasValue={reserveEnabled}
          />
        </div>
      </div>

      {/* Main grid */}
      <div>
        {displayRanks.map((rank) => (
          <div key={rank} className="grid grid-cols-[20px_repeat(9,var(--sq))]">
            <div className="flex items-center justify-center text-[10px] text-[var(--color-text-muted)]/50 font-medium">
              {rank}
            </div>

            {displayFiles.map((file, fileIndex) => {
              const coordinate = `${file}${rank}`;
              return renderSquare(coordinate, rank, fileIndex);
            })}
          </div>
        ))}
      </div>

      {/* Bottom launch row - rank 0/10 */}
      <div className="grid grid-cols-[20px_repeat(9,var(--sq))]">
        <div className="flex items-center justify-center text-[10px] text-[var(--color-text-muted)]/50 font-medium">
          {isFlipped ? 10 : 0}
        </div>

        {/* Left gap (3 empty squares) → turn timer */}
        <div className="col-span-3 h-[var(--sq)]">
          <GapTimer
            label="Turn"
            seconds={bottomTurn}
            isActive={activeTimerColor === bottomColor}
          />
        </div>

        {/* Launch pads (d/e/f) */}
        {displayLaunchFiles.map((file, i) =>
          renderSquare(`${file}${bottomRank}`, bottomRank, 3 + i),
        )}

        {/* Right gap (3 empty squares) → reserve timer */}
        <div className="col-span-3 h-[var(--sq)]">
          <GapTimer
            label="Rsv"
            seconds={bottomReserve}
            isActive={activeTimerColor === bottomColor}
            hasValue={reserveEnabled}
          />
        </div>
      </div>

      {/* File labels */}
      <div className="mt-0.5 grid grid-cols-[20px_repeat(9,var(--sq))]">
        <div />

        {displayFiles.map((file) => (
          <div
            key={file}
            className="text-center text-[10px] text-[var(--color-text-muted)]/50 font-medium uppercase"
          >
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Board;
