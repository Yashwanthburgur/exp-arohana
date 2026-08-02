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
//
// ╔══════════════════════════════════════════════════╗
// ✅ STRICT TIMEOUT / ABANDONMENT RULE
// ╚══════════════════════════════════════════════════╝
// When a player's turn timer expires:
//   1. The current player loses control of THEIR OWN side's pieces.
//   2. Control shifts to the opponent — the opponent must now move the
//      timed-out side's pieces (SEIZED action), then their own.
//   3. Each timeout flips control back and forth.
//   4. After 4 consecutive timeouts with NO completed move by the player
//      who should have acted (i.e., both players failed their duty twice
//      in a row: WHITE→BLACK→WHITE→BLACK), the match is ABANDONED and
//      declared a DRAW.
//
// Concretely: the count increments on EVERY timeout. If the player whose
// duty it was completes their move before the next timeout, the count
// resets to 0. When the count reaches 4, the match ends in a draw.

export function getOpponentColor(color) {
  return color === "WHITE" ? "BLACK" : "WHITE";
}

export function createNormalAction(color) {
  return {
    controller: color,
    actingColor: color,
    type: "NORMAL",
  };
}

export function createSeizedAction(controller, actingColor) {
  return {
    controller,
    actingColor,
    type: "SEIZED",
  };
}

export function createTimeoutSeizureAction(activeAction) {
  if (!activeAction) return null;

  const nextController = getOpponentColor(activeAction.controller);

  // Normal timeout:
  // WHITE controlling WHITE times out
  // BLACK controls WHITE
  if (activeAction.type === "NORMAL") {
    return createSeizedAction(nextController, activeAction.actingColor);
  }

  // Seized timeout:
  // BLACK controlling WHITE times out
  // WHITE controls BLACK
  if (activeAction.type === "SEIZED") {
    return createSeizedAction(nextController, activeAction.controller);
  }

  return null;
}

// The strict abandonment threshold: 4 consecutive duty-misses ends the
// match as a draw (WHITE missed → BLACK missed → WHITE missed → BLACK
// missed, with nobody completing their duty).
export const ABANDONMENT_DRAW_THRESHOLD = 4;
