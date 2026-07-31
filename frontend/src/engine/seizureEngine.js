// ╔══════════════════════╗
// ✅ CHAMBER SEIZURE ENGINE
// ╚══════════════════════╝
//
// controller = player choosing the move
// actingColor = side whose pieces are being moved
//
// Normal:
// controller: WHITE
// actingColor: WHITE
//
// Seized:
// controller: BLACK
// actingColor: WHITE
// meaning BLACK controls one WHITE move.

export function getOpponentColor(color) {
  return color === 'WHITE' ? 'BLACK' : 'WHITE'
}

export function createNormalAction(color) {
  return {
    controller: color,
    actingColor: color,
    type: 'NORMAL',
  }
}

export function createSeizedAction(controller, actingColor) {
  return {
    controller,
    actingColor,
    type: 'SEIZED',
  }
}

export function createTimeoutSeizureAction(activeAction) {
  if (!activeAction) return null

  const nextController = getOpponentColor(activeAction.controller)

  // Normal timeout:
  // WHITE controlling WHITE times out
  // BLACK controls WHITE
  if (activeAction.type === 'NORMAL') {
    return createSeizedAction(
      nextController,
      activeAction.actingColor
    )
  }

  // Seized timeout:
  // BLACK controlling WHITE times out
  // WHITE controls BLACK
  if (activeAction.type === 'SEIZED') {
    return createSeizedAction(
      nextController,
      activeAction.controller
    )
  }

  return null
}