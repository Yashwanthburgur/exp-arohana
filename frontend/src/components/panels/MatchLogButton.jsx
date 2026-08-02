function MatchLogButton({ isGameStarted, matchLog, onOpen }) {
  if (!isGameStarted && matchLog.length === 0) return null;

  const latestEntry = matchLog[matchLog.length - 1];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        flex w-full items-center gap-2 rounded-xl border border-slate-700
        bg-slate-950/95 px-3 py-2 text-left text-xs shadow
        hover:border-cyan-400 transition-colors cursor-pointer
      "
    >
      <span className="text-lg">📝</span>

      <span className="min-w-0 flex-1">
        <span className="block font-black text-amber-300">Match Log</span>

        <span className="block truncate text-slate-300">
          {latestEntry
            ? `#${latestEntry.number} ${latestEntry.text}`
            : "No events yet"}
        </span>
      </span>

      <span className="flex-shrink-0 rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-cyan-300">
        View All ➤
      </span>
    </button>
  );
}

export default MatchLogButton;
