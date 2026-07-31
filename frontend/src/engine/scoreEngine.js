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

export const TARGET_SCORE = 20

export const SCORE_VALUES = {
  OWN_HOME: 2,

  ENEMY_HOME: 3,
  ENEMY_HOME_PENALTY: 1,

  ALL_OUT: 4,
  NO_LEGAL_MOVE: 4,

  SOLDIER_BACK_RANK: 2,
}

export function applyScore(state, color, amount) {
  const next = { ...state }

  if (color === 'WHITE') {
    next.whiteScore += amount

    if (next.whiteScore >= TARGET_SCORE) {
      next.winner = 'WHITE'
    }
  }

  if (color === 'BLACK') {
    next.blackScore += amount

    if (next.blackScore >= TARGET_SCORE) {
      next.winner = 'BLACK'
    }
  }

  return next
}

export function applyScoreDelta(state, whiteDelta, blackDelta) {
  const next = { ...state }

  next.whiteScore += whiteDelta
  next.blackScore += blackDelta

  // First-Maker rule:
  // In normal Chamber Chess scoring, only one side should newly reach target
  // from one event. If both somehow reach, WHITE is checked first here.
  // Avoid using this for simultaneous winner logic unless intentionally needed.
  if (next.whiteScore >= TARGET_SCORE) {
    next.winner = 'WHITE'
    return next
  }

  if (next.blackScore >= TARGET_SCORE) {
    next.winner = 'BLACK'
    return next
  }

  return next
}

export function hasReachedTarget(score) {
  return score >= TARGET_SCORE
}

export function getWinnerFromScores(whiteScore, blackScore) {
  if (whiteScore >= TARGET_SCORE) return 'WHITE'
  if (blackScore >= TARGET_SCORE) return 'BLACK'

  return null
}

export function isGameOver(state) {
  return Boolean(state.winner)
}