import { useState, useEffect } from "react";
import { matchApi } from "../utils/apiClient.js";


// ╔══════════════════════════════╗
// ✅ MATCH HISTORY SCREEN
// ╚══════════════════════════════╝
//
// Shown from the main menu when user clicks "History".
// Lists all matches for the authenticated player.

function MatchHistoryScreen({ token, onBack }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    matchApi
      .getMyMatches(token)
      .then(setMatches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const statusColors = {
    PLAYING: "text-cyan-400",
    COMPLETED: "text-emerald-400",
    ABANDONED: "text-red-400",
    DRAFTING: "text-amber-400",
    WAITING: "text-slate-400",
  };

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold hover:bg-slate-700 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-black text-amber-300">Match History</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && (
          <div className="mt-16 text-center text-slate-500 animate-pulse">
            Loading matches…
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-800 bg-red-950/40 p-4 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="mt-16 text-center text-slate-500">
            No matches yet. Start playing!
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="flex flex-col gap-3">
            {matches.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-4"
              >
                {/* Left: players */}
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold text-white">
                    WHITE {m.whiteScore} – {m.blackScore} BLACK
                  </div>
                  <div className="text-xs text-slate-500">
                    {m.variant} •{" "}
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleDateString()
                      : "—"}
                  </div>
                </div>

                {/* Right: status + winner */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${statusColors[m.status] ?? "text-slate-400"}`}
                  >
                    {m.status}
                  </span>
                  {m.winnerColor && (
                    <span className="text-[11px] text-amber-300 font-semibold">
                      {m.winnerColor} wins
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchHistoryScreen;
