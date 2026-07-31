import { useState } from "react";

// ╔══════════════════════════════╗
// ✅ MAIN MENU SCREEN
// ╚══════════════════════════════╝
//
// Allows players to:
//   - Play Local (Offline)
//   - Find Online Match (Matchmaking)
//   - View Match History
//   - Log Out or Sign In

function MainMenuScreen({
  session,
  onPlayLocal,
  onPlayOnline,
  onViewHistory,
  onLogout,
  onLogin,
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-8 shadow-2xl text-center">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-amber-300">
            ĀROHAṆA-RANA
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
            Tactical Board Game Platform
          </p>
        </div>

        {/* User Card */}
        {session ? (
          <div className="mb-6 rounded-xl bg-slate-800/50 p-4 border border-slate-700 text-left flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">
                {session.displayName}
              </div>
              <div className="text-xs text-slate-400">@{session.username}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase font-semibold">
                Rating
              </div>
              <div className="text-lg font-black text-cyan-400">
                {session.rating} ELO
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl bg-slate-800/30 p-4 border border-slate-800/80 text-left flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-400">Guest Mode</div>
              <div className="text-xs text-slate-600">Offline play only</div>
            </div>
            <button
              type="button"
              onClick={onLogin}
              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold hover:bg-cyan-500 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Buttons Menu */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onPlayLocal}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-bold shadow hover:from-amber-400 hover:to-orange-500 transition-all cursor-pointer"
          >
            Play Local Pass & Play
          </button>

          <button
            type="button"
            onClick={onPlayOnline}
            className={`
              w-full rounded-xl py-3 text-sm font-bold shadow transition-all cursor-pointer
              bg-cyan-600 text-white hover:bg-cyan-500
            `}
          >
            Play with a Friend
          </button>

          <button
            type="button"
            disabled={!session}
            onClick={onViewHistory}
            className={`
              w-full rounded-xl py-3 text-sm font-bold transition-all cursor-pointer
              ${session
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                : "bg-slate-850 text-slate-600 cursor-not-allowed"}
            `}
          >
            Match History
          </button>

          {session && (
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>

        <div className="mt-8 text-[10px] text-slate-600">
          Ārohaṇa-rana version 0.9.0 • Powered by Spring Boot & React
        </div>
      </div>
    </div>
  );
}

export default MainMenuScreen;
