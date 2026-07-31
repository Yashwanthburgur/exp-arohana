// ╔══════════════════════════════════╗
// ✅ AROHANA API CLIENT
// ╚══════════════════════════════════╝
//
// Thin HTTP client for the Spring Boot backend.
// All methods return the JSON body or throw an ApiError.
//
// Base URL is read from VITE_API_URL env var; falls back to localhost:8080.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// ────────────────────────────────────────────────────────
// ApiError — carries HTTP status + parsed body
// ────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.detail ?? body?.title ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

// ────────────────────────────────────────────────────────
// Core fetch wrapper
// ────────────────────────────────────────────────────────
async function request(path, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let body = null;
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json") || contentType.includes("application/problem")) {
    body = await res.json();
  }

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }

  return body;
}

// ────────────────────────────────────────────────────────
// Auth API
// ────────────────────────────────────────────────────────
export const authApi = {
  /**
   * Register a new player account.
   * @returns {{ token, playerId, username, displayName, rating }}
   */
  register(username, displayName, email, password) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, displayName, email, password }),
    });
  },

  /**
   * Login with email + password.
   * @returns {{ token, playerId, username, displayName, rating }}
   */
  login(email, password) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};

// ────────────────────────────────────────────────────────
// Player API
// ────────────────────────────────────────────────────────
export const playerApi = {
  /** Get own profile (requires token). */
  getMe(token) {
    return request("/api/players/me", {}, token);
  },

  /** Get any player's public profile by username. */
  getProfile(username) {
    return request(`/api/players/${encodeURIComponent(username)}`);
  },
};

// ────────────────────────────────────────────────────────
// Match API
// ────────────────────────────────────────────────────────
export const matchApi = {
  /**
   * Create a new match.
   * @param {{ opponentId, variant, customPieces, timerEnabled, reserveSeconds }} body
   */
  create(body, token) {
    return request("/api/matches", {
      method: "POST",
      body: JSON.stringify(body),
    }, token);
  },

  /** Get match summary by ID. */
  getMatch(matchId, token) {
    return request(`/api/matches/${matchId}`, {}, token);
  },

  /** Get all matches for the authenticated player. */
  getMyMatches(token) {
    return request("/api/matches/my", {}, token);
  },

  /** Get full event log for a match (replay). */
  getMatchEvents(matchId, token) {
    return request(`/api/matches/${matchId}/events`, {}, token);
  },
};

// Invite rooms intentionally work for signed-in and guest players. The room
// response contains public lobby data only; player IDs stay server-side.
export const roomApi = {
  create(body, token) {
    return request("/api/rooms", { method: "POST", body: JSON.stringify(body) }, token);
  },
  get(roomCode, token) {
    return request(`/api/rooms/${encodeURIComponent(roomCode)}`, {}, token);
  },
  join(roomCode, body, token) {
    return request(`/api/rooms/${encodeURIComponent(roomCode)}/join`, {
      method: "POST", body: JSON.stringify(body),
    }, token);
  },
};

// ────────────────────────────────────────────────────────
// Health check (no auth needed)
// ────────────────────────────────────────────────────────
export function checkHealth() {
  return request("/health");
}
