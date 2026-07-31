import { useState } from "react";
import { authApi, ApiError } from "../utils/apiClient.js";


// ╔══════════════════════════════╗
// ✅ AUTH SCREEN (Login + Register)
// ╚══════════════════════════════╝
//
// Shown when no JWT token is present.
// Tabs between Login and Register form.
// On success, calls onAuth({ token, playerId, username, displayName, rating })

function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState("login"); // "login" | "register"

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;

      if (tab === "login") {
        result = await authApi.login(email, password);
      } else {
        result = await authApi.register(username, displayName, email, password);
      }

      onAuth(result);
    } catch (err) {
      if (err instanceof ApiError) {
        // Show validation details if present
        if (err.body?.errors) {
          const msgs = Object.values(err.body.errors).join(" • ");
          setError(msgs);
        } else {
          setError(err.message);
        }
      } else {
        setError("Network error — is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-950 p-8 shadow-2xl">
        {/* Logo / title */}
        <div className="mb-6 text-center">
          <div className="mb-1 text-3xl font-black tracking-tight text-amber-300">
            Ārohaṇa-rana
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">
            Online Strategy
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-xl bg-slate-800 p-1">
          {["login", "register"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className={`
                flex-1 rounded-lg py-2 text-sm font-bold capitalize transition-all
                ${tab === t
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-white"}
              `}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {tab === "register" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={32}
                  pattern="^[a-zA-Z0-9_]+$"
                  placeholder="your_handle"
                  className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-slate-700 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={64}
                  placeholder="Your Name"
                  className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-slate-700 focus:ring-cyan-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-slate-700 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-slate-700 focus:ring-cyan-500"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-950/60 px-3 py-2 text-xs text-red-300 border border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-cyan-600 py-2.5 text-sm font-bold text-white shadow hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? "Please wait…"
              : tab === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-slate-600">
          Play offline without an account — just close this screen.
        </div>

        {/* Offline mode skip */}
        <button
          type="button"
          onClick={() => onAuth(null)}
          className="mt-2 w-full rounded-lg py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Continue offline (local only)
        </button>
      </div>
    </div>
  );
}

export default AuthScreen;
