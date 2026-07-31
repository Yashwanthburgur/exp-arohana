function MatchLogButton({
  isGameStarted,
  matchLog,
  onOpen,
}) {
  if (!isGameStarted && matchLog.length === 0) return null

  const latestEntry = matchLog[matchLog.length - 1]

  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        absolute right-3 top-3 z-30 flex max-w-[360px] items-center gap-2
        rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2
        text-left text-xs shadow-xl hover:border-cyan-400
      "
    >
      <span className="text-lg">📝</span>

      <span className="min-w-0">
        <span className="block font-black text-amber-300">
          Match Log
        </span>

        <span className="block truncate text-slate-300">
          {latestEntry
            ? `#${latestEntry.number} ${latestEntry.text}`
            : 'No events yet'}
        </span>
      </span>
    </button>
  )
}

export default MatchLogButton