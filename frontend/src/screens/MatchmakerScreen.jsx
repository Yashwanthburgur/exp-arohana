import { useEffect, useMemo, useState } from "react";
import { roomApi } from "../utils/apiClient.js";
import { VARIANTS, VARIANT_LABELS } from "../constants/variantConfig.js";

const RESERVES = [
  { label: "No reserve", value: 0 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
];

function displayNameFrom(session) {
  return session?.displayName || session?.username || "Guest player";
}

function MatchmakerScreen({ token, session, onBack, onMatchFound }) {
  const [mode, setMode] = useState("CHOOSE");
  const [name, setName] = useState(() => displayNameFrom(session));
  const [variant, setVariant] = useState(VARIANTS.CLASSIC);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [reserveSeconds, setReserveSeconds] = useState(300);
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  useEffect(() => {
    if (mode !== "WAITING" || !room?.roomCode) return undefined;
    const poll = async () => {
      try {
        const latest = await roomApi.get(room.roomCode, token);
        setRoom((prev) => ({ ...latest, assignedColor: prev?.assignedColor || latest.assignedColor }));
        if (latest.status === "DRAFTING") onMatchFound({ ...latest, assignedColor: room.assignedColor });
      } catch (requestError) {
        setError(requestError.message);
      }
    };
    const interval = setInterval(poll, 1500);
    poll();
    return () => clearInterval(interval);
  }, [mode, room?.roomCode, token, onMatchFound]);

  async function createRoom() {
    if (!canSubmit) return;
    setBusy(true); setError(null);
    try {
      const created = await roomApi.create({
        displayName: name.trim(), variant, timerEnabled,
        reserveSeconds: timerEnabled ? reserveSeconds : 0,
      }, token);
      setRoom(created); setMode("WAITING");
    } catch (requestError) {
      setError(requestError.message || "Could not create the room.");
    } finally { setBusy(false); }
  }

  async function joinRoom() {
    if (!canSubmit || roomCode.trim().length !== 6) return;
    setBusy(true); setError(null);
    try {
      const joined = await roomApi.join(roomCode.trim().toUpperCase(), { displayName: name.trim() }, token);
      onMatchFound(joined);
    } catch (requestError) {
      setError(requestError.message || "That room could not be joined.");
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-6 text-white sm:flex sm:items-center sm:justify-center">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl sm:p-8">
        <button type="button" onClick={onBack} className="text-xs font-semibold text-slate-400 hover:text-white">← Back</button>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">Private match</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-amber-300">Play with a friend</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Create a shareable room or enter a friend’s six-character code. Guests are welcome.</p>

        {mode === "CHOOSE" && <div className="mt-7 grid gap-3">
          <button type="button" onClick={() => setMode("CREATE")} className="rounded-2xl bg-cyan-500 px-4 py-4 text-left font-bold text-slate-950 transition hover:bg-cyan-400">
            Create match <span className="float-right">→</span><span className="mt-1 block text-xs font-medium opacity-75">Set the variant and invite a friend</span>
          </button>
          <button type="button" onClick={() => setMode("JOIN")} className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 text-left font-bold transition hover:border-slate-500">
            Join match <span className="float-right">→</span><span className="mt-1 block text-xs font-medium text-slate-400">Enter a friend’s room code</span>
          </button>
        </div>}

        {(mode === "CREATE" || mode === "JOIN") && <div className="mt-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">Your display name
            <input value={name} maxLength="64" onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-400" />
          </label>
          {mode === "CREATE" ? <>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">Game variant
              <select value={variant} onChange={(event) => setVariant(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-400">
                {Object.values(VARIANTS).map((key) => <option key={key} value={key}>{VARIANT_LABELS[key]}</option>)}
              </select>
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm font-semibold">Use chamber timer
              <input type="checkbox" checked={timerEnabled} onChange={(event) => setTimerEnabled(event.target.checked)} className="h-4 w-4 accent-cyan-400" />
            </label>
            {timerEnabled && <select value={reserveSeconds} onChange={(event) => setReserveSeconds(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-400">
              {RESERVES.map((option) => <option key={option.value} value={option.value}>{option.label} reserve</option>)}
            </select>}
            <button type="button" disabled={!canSubmit || busy} onClick={createRoom} className="w-full rounded-xl bg-cyan-500 py-3 font-black text-slate-950 disabled:opacity-50">{busy ? "Creating…" : "Create private match"}</button>
          </> : <>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">Room code
              <input value={roomCode} maxLength="6" onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="ABC123" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-center font-mono text-xl font-black tracking-[0.3em] outline-none focus:border-cyan-400" />
            </label>
            <button type="button" disabled={!canSubmit || roomCode.length !== 6 || busy} onClick={joinRoom} className="w-full rounded-xl bg-cyan-500 py-3 font-black text-slate-950 disabled:opacity-50">{busy ? "Joining…" : "Join private match"}</button>
          </>}
          <button type="button" onClick={() => { setMode("CHOOSE"); setError(null); }} className="w-full text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
        </div>}

        {mode === "WAITING" && room && <div className="mt-7 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-5 text-center">
          <div className="mx-auto mb-4 h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
          <p className="text-sm font-bold">Waiting for your friend</p>
          <p className="mt-1 text-xs text-slate-400">Share this room code. We’ll begin drafting when they join.</p>
          <div className="my-5 rounded-xl bg-slate-950 px-3 py-4 font-mono text-3xl font-black tracking-[0.3em] text-amber-300">{room.roomCode}</div>
          <p className="text-xs text-slate-500">{VARIANT_LABELS[room.variant]} · {room.timerEnabled ? "Timer enabled" : "Untimed"}</p>
        </div>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-xs text-red-200">{error}</p>}
      </section>
    </main>
  );
}

export default MatchmakerScreen;
