import { useState, useCallback } from "react";

// ╔══════════════════════════════╗
// ✅ AUTH SESSION HOOK
// ╚══════════════════════════════╝
//
// Manages the JWT token and player profile in localStorage.
// Provides login/logout helpers.
//
// Session shape: { token, playerId, username, displayName, rating }

const STORAGE_KEY = "arohana_session";

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function useAuthSession() {
  const [session, setSession] = useState(() => readSession());

  const login = useCallback((authResponse) => {
    if (!authResponse) {
      // Offline mode: null session
      setSession(null);
      return;
    }

    const s = {
      token: authResponse.token,
      playerId: authResponse.playerId,
      username: authResponse.username,
      displayName: authResponse.displayName,
      rating: authResponse.rating,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return {
    session,
    isAuthenticated: session !== null && session.token != null,
    token: session?.token ?? null,
    playerId: session?.playerId ?? null,
    username: session?.username ?? null,
    displayName: session?.displayName ?? null,
    rating: session?.rating ?? 1200,
    login,
    logout,
  };
}

export default useAuthSession;
