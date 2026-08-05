// ╔══════════════════════╗
// ✅ SCORE ENGINE
// ╚══════════════════════╝
//
// Chamber Chess integer scoring system.
// This is the old decimal system multiplied by 2.
//
// Old:
// Own home: +1
// Enemy home: +1.5 / -0.5
// All-out: +2
// Soldier back-rank: +1
// Target: 10
//
// New:
// Own home: +2
// Enemy home: +3 / -1
// All-out: +4
// Soldier back-rank: +2
// Target: 20

// Default winning score (Standard goal). The user can pick Sprint (15),
// Standard (25), or Marathon (50) in pre-game setup; the chosen value
// overrides this default via getWinningScore(config).
export const TARGET_SCORE = 25;
export const DEFAULT_WIN_GOAL = 25;

export function getWinningScore(config = {}) {
  if (config && typeof config === "object") {
    const goal = config.winGoal ?? config.targetScore ?? DEFAULT_WIN_GOAL;
    if (typeof goal === "number" && goal > 0) return goal;
  }
  return DEFAULT_WIN_GOAL;
}

export const SCORE_VALUES = {
  OWN_HOME: 2,

  ENEMY_HOME: 3,
  ENEMY_HOME_PENALTY: 1,

  ALL_OUT: 5,
  NO_LEGAL_MOVE: 5,

  SOLDIER_BACK_RANK: 2,
};

export function applyScore(state, color, amount) {
  const next = { ...state };
  const target = getWinningScore(next);

  if (color === "WHITE") {
    next.whiteScore += amount;

    if (next.whiteScore >= target) {
      next.winner = "WHITE";
    }
  }

  if (color === "BLACK") {
    next.blackScore += amount;

    if (next.blackScore >= target) {
      next.winner = "BLACK";
    }
  }

  return next;
}

export function applyScoreDelta(state, whiteDelta, blackDelta) {
  const next = { ...state };
  const target = getWinningScore(next);

  next.whiteScore += whiteDelta;
  next.blackScore += blackDelta;

  // First-Maker rule:
  // In normal Chamber Chess scoring, only one side should newly reach target
  // from one event. If both somehow reach, WHITE is checked first here.
  // Avoid using this for simultaneous winner logic unless intentionally needed.
  if (next.whiteScore >= target) {
    next.winner = "WHITE";
    return next;
  }

  if (next.blackScore >= target) {
    next.winner = "BLACK";
    return next;
  }

  return next;
}

export function hasReachedTarget(score) {
  return score >= TARGET_SCORE;
}

export function getWinnerFromScores(whiteScore, blackScore) {
  if (whiteScore >= TARGET_SCORE) return "WHITE";
  if (blackScore >= TARGET_SCORE) return "BLACK";

  return null;
}

export function isGameOver(state) {
  return Boolean(state.winner);
}
