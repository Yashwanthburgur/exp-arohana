// ╔══════════════════════╗
// ✅ CHAMBER MATCH LOG ENGINE
// ╚══════════════════════╝
//
// This file only creates log entries.
// It should NOT mutate game state.

export const LOG_TYPES = {
  GAME_START: 'GAME_START',

  INITIAL_SUPPORT: 'INITIAL_SUPPORT',
  SPAWN: 'SPAWN',

  MOVE: 'MOVE',
  CAPTURE: 'CAPTURE',
  ANTELOPE_SWAP: 'ANTELOPE_SWAP',

  HOME_CLAIM_CREATED: 'HOME_CLAIM_CREATED',
  HOME_CLAIM_DEFENDED: 'HOME_CLAIM_DEFENDED',
  HOME_CLAIM_SUCCESS: 'HOME_CLAIM_SUCCESS',
  HOME_RELOCATED: 'HOME_RELOCATED',

  SOLDIER_SCORE: 'SOLDIER_SCORE',
  SOLDIER_PROMOTION: 'SOLDIER_PROMOTION',
  ALL_OUT: 'ALL_OUT',
  NO_LEGAL_MOVE: 'NO_LEGAL_MOVE',

  TIMEOUT: 'TIMEOUT',
  SEIZURE_START: 'SEIZURE_START',
  SEIZURE_COMPLETE: 'SEIZURE_COMPLETE',

  DRAW_OFFER: 'DRAW_OFFER',
  RESIGN: 'RESIGN',

  SCORE: 'SCORE',
  WIN: 'WIN',
}

function createLogId() {
  return `log-${Date.now()}-${Math.random()}`
}

export function createLogEntry({
  number,
  turn,
  phase,
  type,
  actor = null,
  controller = null,
  actingColor = null,
  piece = null,
  from = null,
  to = null,
  targetPiece = null,
  scoreAfter = null,
  data = {},
  text,
}) {
  return {
    id: createLogId(),
    number,
    turn,
    phase,
    type,
    actor,
    controller,
    actingColor,
    piece,
    from,
    to,
    targetPiece,
    scoreAfter,
    data,
    text,
    createdAt: new Date().toISOString(),
  }
}

export function formatPieceName(pieceType) {
  if (!pieceType) return 'Piece'

  return pieceType
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function createGameStartLog({ number, turn, phase, whiteArmy, blackArmy }) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.GAME_START,
    data: {
      whiteArmy,
      blackArmy,
    },
    text: `Game started. WHITE army: ${whiteArmy.join(', ')}. BLACK army: ${blackArmy.join(', ')}.`,
  })
}

export function createInitialSupportLog({
  number,
  turn,
  phase,
  color,
  piece,
  square,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.INITIAL_SUPPORT,
    actor: color,
    actingColor: color,
    piece,
    to: square,
    text: `${color} placed initial support ${formatPieceName(piece)} at ${square}.`,
  })
}

export function createSpawnLog({
  number,
  turn,
  phase,
  color,
  piece,
  square,
  capturedPiece = null,
}) {
  if (capturedPiece) {
    return createLogEntry({
      number,
      turn,
      phase,
      type: LOG_TYPES.SPAWN,
      actor: color,
      actingColor: color,
      piece,
      to: square,
      targetPiece: capturedPiece.type,
      data: {
        capturedColor: capturedPiece.color,
        capturedPieceId: capturedPiece.id,
      },
      text: `${color} spawned ${formatPieceName(piece)} at ${square}, replacing ${capturedPiece.color} ${formatPieceName(capturedPiece.type)}.`,
    })
  }

  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.SPAWN,
    actor: color,
    actingColor: color,
    piece,
    to: square,
    text: `${color} spawned ${formatPieceName(piece)} at ${square}.`,
  })
}

export function createMoveLog({
  number,
  turn,
  phase,
  actor,
  controller,
  actingColor,
  piece,
  from,
  to,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.MOVE,
    actor,
    controller,
    actingColor,
    piece,
    from,
    to,
    text: `${controller || actor} moved ${actingColor || actor} ${formatPieceName(piece)} ${from} → ${to}.`,
  })
}

export function createCaptureLog({
  number,
  turn,
  phase,
  actor,
  controller,
  actingColor,
  piece,
  from,
  to,
  capturedPiece,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.CAPTURE,
    actor,
    controller,
    actingColor,
    piece,
    from,
    to,
    targetPiece: capturedPiece?.type ?? null,
    data: {
      capturedColor: capturedPiece?.color ?? null,
      capturedPieceId: capturedPiece?.id ?? null,
    },
    text: `${controller || actor} moved ${actingColor || actor} ${formatPieceName(piece)} ${from} → ${to}, capturing ${capturedPiece?.color} ${formatPieceName(capturedPiece?.type)}.`,
  })
}

export function createAntelopeSwapLog({
  number,
  turn,
  phase,
  controller,
  actingColor,
  antelopeFrom,
  antelopeTo,
  enemyPiece,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.ANTELOPE_SWAP,
    actor: actingColor,
    controller,
    actingColor,
    piece: 'ANTELOPE',
    from: antelopeFrom,
    to: antelopeTo,
    targetPiece: enemyPiece?.type ?? null,
    data: {
      swappedEnemyColor: enemyPiece?.color ?? null,
      swappedEnemyPieceId: enemyPiece?.id ?? null,
      swappedEnemyType: enemyPiece?.type ?? null,
    },
    text: `${controller || actingColor} used ${actingColor} Antelope swap: ${antelopeFrom} ↔ ${antelopeTo} with ${enemyPiece?.color} ${formatPieceName(enemyPiece?.type)}.`,
  })
}

export function createHomeClaimCreatedLog({
  number,
  turn,
  phase,
  claim,
  piece,
}) {
  const claimKind =
    claim.attacker === claim.homeOwner
      ? 'own home'
      : `${claim.homeOwner} home`

  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.HOME_CLAIM_CREATED,
    actor: claim.attacker,
    actingColor: claim.attacker,
    piece: piece?.type ?? null,
    to: claim.square,
    data: {
      claim,
    },
    text: `${claim.attacker} ${formatPieceName(piece?.type)} started a claim on ${claimKind} at ${claim.square}.`,
  })
}

export function createHomeClaimDefendedLog({
  number,
  turn,
  phase,
  claim,
  defenderPiece,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.HOME_CLAIM_DEFENDED,
    actor: claim.homeOwner,
    actingColor: claim.homeOwner,
    piece: defenderPiece?.type ?? null,
    to: claim.square,
    data: {
      claim,
    },
    text: `${claim.homeOwner} defended the home claim at ${claim.square} with ${formatPieceName(defenderPiece?.type)}.`,
  })
}

export function createHomeClaimSuccessLog({
  number,
  turn,
  phase,
  claim,
  whiteScore,
  blackScore,
}) {
  const penaltyText =
    claim.stealPenalty > 0
      ? ` ${claim.homeOwner} -${claim.stealPenalty}.`
      : ''

  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.HOME_CLAIM_SUCCESS,
    actor: claim.attacker,
    actingColor: claim.attacker,
    to: claim.square,
    scoreAfter: {
      WHITE: whiteScore,
      BLACK: blackScore,
    },
    data: {
      claim,
    },
    text: `${claim.attacker} claim succeeded at ${claim.square}: ${claim.attacker} +${claim.reward}.${penaltyText} Score WHITE ${whiteScore} - BLACK ${blackScore}.`,
  })
}

export function createSoldierScoreLog({
  number,
  turn,
  phase,
  color,
  square,
  scoreAfter,
  points,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.SOLDIER_SCORE,
    actor: color,
    actingColor: color,
    piece: 'SOLDIER',
    to: square,
    scoreAfter,
    data: {
      points,
    },
    text: `${color} Soldier reached enemy back rank at ${square}: +${points}. Score WHITE ${scoreAfter.WHITE} - BLACK ${scoreAfter.BLACK}.`,
  })
}

export function createPromotionLog({
  number,
  turn,
  phase,
  color,
  square,
  promotedType,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.SOLDIER_PROMOTION,
    actor: color,
    actingColor: color,
    piece: promotedType,
    to: square,
    data: { promotedType },
    text: `${color} Soldier at ${square} permanently promoted to ${formatPieceName(promotedType)}.`,
  })
}

export function createAllOutLog({
  number,
  turn,
  phase,
  scoringColor,
  targetColor,
  points,
  scoreAfter,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.ALL_OUT,
    actor: scoringColor,
    actingColor: scoringColor,
    scoreAfter,
    data: {
      targetColor,
      points,
    },
    text: `${targetColor} has no active pieces. ${scoringColor} gains +${points}. Score WHITE ${scoreAfter.WHITE} - BLACK ${scoreAfter.BLACK}.`,
  })
}

export function createTimeoutLog({
  number,
  turn,
  phase,
  timedOutColor,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.TIMEOUT,
    actor: timedOutColor,
    controller: timedOutColor,
    text: `${timedOutColor} timed out.`,
  })
}

export function createSeizureStartLog({
  number,
  turn,
  phase,
  controller,
  actingColor,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.SEIZURE_START,
    controller,
    actingColor,
    text: `${controller} seized control of ${actingColor}'s move.`,
  })
}

export function createSeizureCompleteLog({
  number,
  turn,
  phase,
  controller,
  actingColor,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.SEIZURE_COMPLETE,
    controller,
    actingColor,
    text: `${controller} completed the seized ${actingColor} move.`,
  })
}

export function createWinLog({
  number,
  turn,
  phase,
  winner,
  whiteScore,
  blackScore,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.WIN,
    actor: winner,
    scoreAfter: {
      WHITE: whiteScore,
      BLACK: blackScore,
    },
    text: `${winner} wins. Final score WHITE ${whiteScore} - BLACK ${blackScore}.`,
  })
}

export function createDrawOfferLog({
  number,
  turn,
  phase,
  offeredBy,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.DRAW_OFFER,
    actor: offeredBy,
    text: `${offeredBy} offers a draw.`,
  })
}

export function createResignLog({
  number,
  turn,
  phase,
  resignedBy,
  winner,
  whiteScore,
  blackScore,
}) {
  return createLogEntry({
    number,
    turn,
    phase,
    type: LOG_TYPES.RESIGN,
    actor: resignedBy,
    scoreAfter: {
      WHITE: whiteScore,
      BLACK: blackScore,
    },
    text: `${resignedBy} resigns. ${winner} wins by resignation.`,
  })
}

export function exportMatchLogAsText(matchLog) {
  return matchLog
    .map(entry => `${entry.number}. ${entry.text}`)
    .join('\n')
}

export function exportMatchLogAsJson(matchLog) {
  return JSON.stringify(matchLog, null, 2)
}