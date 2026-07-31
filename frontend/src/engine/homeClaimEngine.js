import { SCORE_VALUES, TARGET_SCORE } from './scoreEngine.js'

// ╔══════════════════════╗
// ✅ HOME CLAIM ENGINE — DELAYED SCORING
// ╚══════════════════════╝
//
// Important:
// Home claim points are NOT awarded when the piece lands.
// Defender gets exactly one move.
// At the END of defender's move:
// - if defender failed, claim score is awarded
// - if score reaches target, game ends immediately
// - only if no winner, later side effects happen

export function createHomeClaim(piece, square, whiteHome, blackHome) {
  const isWhiteOwn =
    square === whiteHome && piece.color === 'WHITE'

  const isBlackOwn =
    square === blackHome && piece.color === 'BLACK'

  const isWhiteAttack =
    square === blackHome && piece.color === 'WHITE'

  const isBlackAttack =
    square === whiteHome && piece.color === 'BLACK'

  if (isWhiteOwn) {
    return {
      attacker: 'WHITE',
      homeOwner: 'WHITE',
      square,
      pieceId: piece.id,
      reward: SCORE_VALUES.OWN_HOME,
      stealPenalty: 0,
    }
  }

  if (isBlackOwn) {
    return {
      attacker: 'BLACK',
      homeOwner: 'BLACK',
      square,
      pieceId: piece.id,
      reward: SCORE_VALUES.OWN_HOME,
      stealPenalty: 0,
    }
  }

  if (isWhiteAttack) {
    return {
      attacker: 'WHITE',
      homeOwner: 'BLACK',
      square,
      pieceId: piece.id,
      reward: SCORE_VALUES.ENEMY_HOME,
      stealPenalty: SCORE_VALUES.ENEMY_HOME_PENALTY,
    }
  }

  if (isBlackAttack) {
    return {
      attacker: 'BLACK',
      homeOwner: 'WHITE',
      square,
      pieceId: piece.id,
      reward: SCORE_VALUES.ENEMY_HOME,
      stealPenalty: SCORE_VALUES.ENEMY_HOME_PENALTY,
    }
  }

  return null
}

export function resolveHomeClaim({
  state,
  pendingHomeAttack,
  movedPiece,
}) {
  if (!pendingHomeAttack) return state

  const next = { ...state }

  const attacker = pendingHomeAttack.attacker
  const defender = attacker === 'WHITE' ? 'BLACK' : 'WHITE'

  const defenderMoved = movedPiece.color === defender
  const defended = movedPiece.square === pendingHomeAttack.square

  // Claim resolves only after defender's move.
  if (!defenderMoved) {
    return next
  }

  // Defender reached the claimed square.
  // Claim cancelled.
  if (defended) {
    next.pendingHomeAttack = null
    return next
  }

  // Defender failed.
  // Apply delayed claim score now.
  if (attacker === 'WHITE') {
    next.whiteScore += pendingHomeAttack.reward
    next.blackScore -= pendingHomeAttack.stealPenalty
  }

  if (attacker === 'BLACK') {
    next.blackScore += pendingHomeAttack.reward
    next.whiteScore -= pendingHomeAttack.stealPenalty
  }

  // ✅ FIRST-MAKER RULE
  // If claim score reaches target, stop immediately.
  if (next.whiteScore >= TARGET_SCORE) {
    next.winner = 'WHITE'
    return next
  }

  if (next.blackScore >= TARGET_SCORE) {
    next.winner = 'BLACK'
    return next
  }

  // Only clear claim if no winner.
  next.pendingHomeAttack = null

  return next
}