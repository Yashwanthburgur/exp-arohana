import {
  squareToPosition,
  positionToSquare,
  isPlayableSquare,
} from "./coordinates.js";
import { HOME_SQUARES } from "../constants/boardConfig.js";

// ╔══════════════════════╗
// ✅ BASIC BOARD HELPERS
// ╚══════════════════════╝
function getPieceAt(square, pieces) {
  return pieces.find((piece) => piece.square === square);
}

function classifyTarget(square, movingPiece, pieces) {
  const occupant = getPieceAt(square, pieces);

  if (!occupant) {
    return {
      square,
      kind: "move",
    };
  }

  if (occupant.color !== movingPiece.color) {
    return {
      square,
      kind: "capture",
    };
  }

  return null;
}

function isPathClear(fromX, fromY, toX, toY, pieces) {
  const dx = Math.sign(toX - fromX);
  const dy = Math.sign(toY - fromY);

  let currentX = fromX + dx;
  let currentY = fromY + dy;

  while (currentX !== toX || currentY !== toY) {
    const square = positionToSquare(currentX, currentY);

    if (square && getPieceAt(square, pieces)) {
      return false;
    }

    currentX += dx;
    currentY += dy;
  }

  return true;
}

function isSquareEmpty(x, y, pieces) {
  const square = positionToSquare(x, y);

  if (!square) return false;

  return !getPieceAt(square, pieces);
}

// ╔══════════════════════╗
// ✅ GENERIC MOVE HELPERS
// ╚══════════════════════╝
function getSlidingMoves(piece, pieces, directions) {
  const { x, y } = squareToPosition(piece.square);
  const results = [];

  for (const [dx, dy] of directions) {
    let step = 1;

    while (true) {
      const targetX = x + dx * step;
      const targetY = y + dy * step;

      if (!isPlayableSquare(targetX, targetY)) break;

      const targetSquare = positionToSquare(targetX, targetY);
      const target = classifyTarget(targetSquare, piece, pieces);

      if (!target) break;

      results.push(target);

      if (target.kind === "capture") break;

      step++;
    }
  }

  return results;
}

function getLimitedSlidingMoves(piece, pieces, directions, maxSteps) {
  const { x, y } = squareToPosition(piece.square);
  const results = [];

  for (const [dx, dy] of directions) {
    for (let step = 1; step <= maxSteps; step++) {
      const targetX = x + dx * step;
      const targetY = y + dy * step;

      if (!isPlayableSquare(targetX, targetY)) break;

      if (!isPathClear(x, y, targetX, targetY, pieces)) break;

      const targetSquare = positionToSquare(targetX, targetY);
      const target = classifyTarget(targetSquare, piece, pieces);

      if (!target) break;

      results.push(target);

      if (target.kind === "capture") break;
    }
  }

  return results;
}

function getLeaperMoves(piece, pieces, offsets) {
  const { x, y } = squareToPosition(piece.square);
  const results = [];

  for (const [dx, dy] of offsets) {
    const targetX = x + dx;
    const targetY = y + dy;

    if (!isPlayableSquare(targetX, targetY)) continue;

    const targetSquare = positionToSquare(targetX, targetY);
    const target = classifyTarget(targetSquare, piece, pieces);

    if (target) {
      results.push(target);
    }
  }

  return results;
}

function wrapHorizontal(x) {
  const boardWidth = 9;

  if (x < 0) {
    return ((x % boardWidth) + boardWidth) % boardWidth;
  }

  if (x >= boardWidth) {
    return x % boardWidth;
  }

  return x;
}

// ╔══════════════════════╗
// ✅ WARRIOR — QUEEN, NO JUMP
// ╚══════════════════════╝
function getWarriorMoves(piece, pieces) {
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  return getSlidingMoves(piece, pieces, directions);
}

// ╔══════════════════════╗
// ✅ NINJA — 1 TO 3 ANY DIRECTION, JUMPS
// ╚══════════════════════╝
function getNinjaMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square);

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  const results = [];

  for (const [dx, dy] of directions) {
    for (let step = 1; step <= 3; step++) {
      const targetX = x + dx * step;
      const targetY = y + dy * step;

      if (!isPlayableSquare(targetX, targetY)) continue;

      const targetSquare = positionToSquare(targetX, targetY);
      const target = classifyTarget(targetSquare, piece, pieces);

      if (target) {
        results.push(target);
      }
    }
  }

  return results;
}

// ╔══════════════════════╗
// ✅ SAGITTARIUS — 1 TO 3 ANY DIRECTION NO JUMP + HORSE JUMP
// ╚══════════════════════╝
function getSagittariusMoves(piece, pieces) {
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  return [
    ...getLimitedSlidingMoves(piece, pieces, directions, 3),
    ...getHorseMoves(piece, pieces),
  ];
}

// ╔══════════════════════╗
// ✅ ELEPHANT — ROOK, NO JUMP
// ╚══════════════════════╝
function getElephantMoves(piece, pieces) {
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  return getSlidingMoves(piece, pieces, directions);
}

// ╔══════════════════════╗
// ✅ CAMEL — BISHOP, NO JUMP
// ╚══════════════════════╝
function getCamelMoves(piece, pieces) {
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  return getSlidingMoves(piece, pieces, directions);
}

// ╔══════════════════════╗
// ✅ RHINO — BISHOP + KING MOVE, NO JUMP
// ╚══════════════════════╝
function getRhinoMoves(piece, pieces) {
  return [...getCamelMoves(piece, pieces), ...getKingMoves(piece, pieces)];
}

// ╔══════════════════════╗
// ✅ HORSE — NORMAL KNIGHT, JUMPS
// ╚══════════════════════╝
function getHorseMoves(piece, pieces) {
  const offsets = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  return getLeaperMoves(piece, pieces, offsets);
}

// ╔═════════════════════╗
// ✅ AIRAVATA — ELEPHANT (ROOK, NO JUMP) + HORSE (KNIGHT LEAP)
// ╚═════════════════════╝
function getAiravataMoves(piece, pieces) {
  return [...getElephantMoves(piece, pieces), ...getHorseMoves(piece, pieces)];
}

// ╔═════════════════════╗
// ✅ JATAYU — CAMEL (BISHOP SLIDE, NO JUMP) + HORSE (KNIGHT LEAP)
// ╚═════════════════════╝
function getJatayuMoves(piece, pieces) {
  return [...getCamelMoves(piece, pieces), ...getHorseMoves(piece, pieces)];
}

// ╔══════════════════════╗
// ✅ BULL — FORWARD/BACKWARD MOVE, FORWARD CAPTURE
// ╚══════════════════════╝
function getBullMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square);
  const direction = piece.color === "WHITE" ? 1 : -1;
  const results = [];

  const forwardSquare = positionToSquare(x, y + direction);
  if (forwardSquare && isSquareEmpty(x, y + direction, pieces)) {
    const moveTarget = classifyTarget(forwardSquare, piece, pieces);
    if (moveTarget && moveTarget.kind === "move") {
      results.push(moveTarget);
    }
  }

  const backwardSquare = positionToSquare(x, y - direction);
  if (backwardSquare && isSquareEmpty(x, y - direction, pieces)) {
    const moveTarget = classifyTarget(backwardSquare, piece, pieces);
    if (moveTarget && moveTarget.kind === "move") {
      results.push(moveTarget);
    }
  }

  const captureOffsets = [
    [0, direction],
    [-1, direction],
    [1, direction],
  ];

  for (const [dx, dy] of captureOffsets) {
    const targetX = x + dx;
    const targetY = y + dy;
    if (!isPlayableSquare(targetX, targetY)) continue;

    const targetSquare = positionToSquare(targetX, targetY);
    const target = classifyTarget(targetSquare, piece, pieces);
    if (target && target.kind === "capture") {
      results.push(target);
    }
  }

  return results;
}

// ╔══════════════════════╗
// ✅ SKUNK — KING MOVE
// ╚══════════════════════╝
function getSkunkMoves(piece, pieces) {
  return getKingMoves(piece, pieces);
}

// ╔══════════════════════╗
// ✅ DONKEY — HORSE MOVE BUT CANNOT JUMP
// ╚══════════════════════╝
function getDonkeyMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square);

  const offsets = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  const results = [];

  for (const [dx, dy] of offsets) {
    const targetX = x + dx;
    const targetY = y + dy;

    if (!isPlayableSquare(targetX, targetY)) continue;

    const pathClear = isNonJumpingLPathClear(x, y, targetX, targetY, pieces);

    if (!pathClear) continue;

    const targetSquare = positionToSquare(targetX, targetY);
    const target = classifyTarget(targetSquare, piece, pieces);

    if (target) {
      results.push(target);
    }
  }

  return results;
}

// ╔══════════════════════╗
// ✅ NON-JUMPING L PATH CHECK
// ╚══════════════════════╝
function isNonJumpingLPathClear(fromX, fromY, toX, toY, pieces) {
  const dx = toX - fromX;
  const dy = toY - fromY;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (!((absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2))) {
    return false;
  }

  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);

  let pathOne;

  if (absDx === 2) {
    pathOne = [
      [fromX + stepX, fromY],
      [fromX + stepX * 2, fromY],
    ];
  } else {
    pathOne = [
      [fromX, fromY + stepY],
      [fromX, fromY + stepY * 2],
    ];
  }

  let pathTwo;

  if (absDx === 2) {
    pathTwo = [
      [fromX, fromY + stepY],
      [fromX + stepX, fromY + stepY],
    ];
  } else {
    pathTwo = [
      [fromX + stepX, fromY],
      [fromX + stepX, fromY + stepY],
    ];
  }

  const isPathOneClear = pathOne.every(([pathX, pathY]) =>
    isSquareEmpty(pathX, pathY, pieces),
  );

  const isPathTwoClear = pathTwo.every(([pathX, pathY]) =>
    isSquareEmpty(pathX, pathY, pieces),
  );

  return isPathOneClear || isPathTwoClear;
}

// ╔══════════════════════╗
// ✅ DRAGON — 3+1 LEAPER WITH HORIZONTAL EDGE WRAP
// ╚══════════════════════╝
function getDragonMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square);

  const offsets = [
    [3, 1],
    [3, -1],
    [-3, 1],
    [-3, -1],
    [1, 3],
    [1, -3],
    [-1, 3],
    [-1, -3],
  ];

  const results = [];

  for (const [dx, dy] of offsets) {
    const targetX = wrapHorizontal(x + dx);
    const targetY = y + dy;

    if (!isPlayableSquare(targetX, targetY)) continue;

    const targetSquare = positionToSquare(targetX, targetY);
    const target = classifyTarget(targetSquare, piece, pieces);

    if (target) {
      results.push(target);
    }
  }

  return results;
}

// ╔══════════════════════╗
// ✅ GIRAFFE — 2 OR 3 STRAIGHT LEAPER
// ╚══════════════════════╝
function getGiraffeMoves(piece, pieces) {
  const offsets = [
    [3, 0],
    [-3, 0],
    [0, 3],
    [0, -3],
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
  ];

  return getLeaperMoves(piece, pieces, offsets);
}

// ╔══════════════════════╗
// ✅ UNICORN — 3+1 LEAPER
// ╚══════════════════════╝
function getUnicornMoves(piece, pieces) {
  const offsets = [
    [3, 1],
    [3, -1],
    [-3, 1],
    [-3, -1],
    [1, 3],
    [1, -3],
    [-1, 3],
    [-1, -3],
  ];

  return getLeaperMoves(piece, pieces, offsets);
}

// ╔══════════════════════╗
// ✅ SNAKE — 1-STEP DIAGONAL, COLOUR-BOUND
// ╚══════════════════════╝
function getSnakeMoves(piece, pieces) {
  const offsets = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  return getLeaperMoves(piece, pieces, offsets);
}

// ╔══════════════════════╗
// ✅ KING MOVE
// ╚══════════════════════╝
function getKingMoves(piece, pieces) {
  const offsets = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  return getLeaperMoves(piece, pieces, offsets);
}

// ╔══════════════════════╗
// ✅ MONKEY — 1-STEP KING WRAP LEAPER (HORIZONTAL ONLY)
// ╚══════════════════════╝
//
// Monkey moves one square in any direction, like a king.
// The FILE coordinate wraps horizontally across the a/i edge.
// The RANK does NOT wrap: moves that leave ranks 1–9 or the
// d/e/f launch pads are rejected by the playable-square filter.
//
// Example:
// a1 left wraps to i1.
// a1 down (rank 0, file a) is not a launch pad, so it is filtered.
// e0 down (rank −1) is rejected; e0 never teleports to e10.

function getMonkeyMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square);

  const offsets = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  const results = [];
  const seenSquares = new Set();

  for (const [dx, dy] of offsets) {
    const targetX = wrapHorizontal(x + dx);
    const targetY = y + dy;

    if (!isPlayableSquare(targetX, targetY)) continue;

    const targetSquare = positionToSquare(targetX, targetY);

    if (seenSquares.has(targetSquare)) continue;
    seenSquares.add(targetSquare);

    const target = classifyTarget(targetSquare, piece, pieces);

    if (!target) continue;

    results.push(target);
  }

  return results;
}

// ╔══════════════════════╗
// ✅ WOLF — KING MOVE, INVISIBILITY HANDLED IN BOARD
// ╚══════════════════════╝
function getWolfMoves(piece, pieces) {
  return getKingMoves(piece, pieces);
}

// ╔══════════════════════╗
// ✅ ANTELOPE — KING MOVE + FAR ENEMY SWAP
// ╚══════════════════════╝
function getAntelopeMoves(piece, pieces, context = {}) {
  const { x, y } = squareToPosition(piece.square);

  // Antelope always has normal king movement.
  // Adjacent enemies are captured normally through kingMoves.
  const kingMoves = getKingMoves(piece, pieces);

  const teamMoveCount = context.teamMoveCount ?? 0;
  const moveLimit = context.moveLimit ?? 8;

  // Swap is unavailable on the final two moves of the eight-move cycle
  // (teamMoveCount 6 → move 7, teamMoveCount 7 → move 8 / arrival move).
  const isFinalTwoMoves = teamMoveCount >= moveLimit - 2;

  // If horns are already used, Antelope only has normal movement.
  if (piece.powerUsed) {
    return kingMoves;
  }

  // If team is at 7/8 moves, Antelope cannot swap.
  // Normal movement is still allowed.
  if (isFinalTwoMoves) {
    return kingMoves;
  }

  const swapTargets = pieces
    .filter((otherPiece) => {
      if (!otherPiece.square) return false;
      if (otherPiece.color === piece.color) return false;

      // Wolf cannot be detected by Antelope radar and cannot be swapped.
      if (otherPiece.type === "WOLF") return false;

      // A swap can never land on a home square. Homes must be defended by
      // being physically near them — the Antelope cannot teleport onto a
      // home (d5/e5/f5) from far away to claim or defend it.
      if (HOME_SQUARES.includes(otherPiece.square)) return false;

      const targetPosition = squareToPosition(otherPiece.square);

      const distanceX = Math.abs(targetPosition.x - x);
      const distanceY = Math.abs(targetPosition.y - y);

      const isReachableByKingMove = distanceX <= 1 && distanceY <= 1;

      // If Antelope can capture normally, do not show swap.
      if (isReachableByKingMove) return false;

      return true;
    })
    .map((otherPiece) => ({
      square: otherPiece.square,
      kind: "swap",
    }));

  return [...kingMoves, ...swapTargets];
}

// ╔══════════════════════╗
// ✅ SOLDIER — FORWARD 1, DIAGONAL CAPTURE
// ╚══════════════════════╝
function getSoldierMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square);
  const direction = piece.color === "WHITE" ? 1 : -1;
  const results = [];

  // Forward 1 (empty only)
  const forwardX = x;
  const forwardY = y + direction;

  if (isPlayableSquare(forwardX, forwardY)) {
    const forwardSquare = positionToSquare(forwardX, forwardY);

    if (!getPieceAt(forwardSquare, pieces)) {
      results.push({
        square: forwardSquare,
        kind: "move",
      });
    }
  }

  // Diagonal capture (forward only)
  const captureOffsets = [
    [-1, direction],
    [1, direction],
  ];

  for (const [dx, dy] of captureOffsets) {
    const targetX = x + dx;
    const targetY = y + dy;

    if (!isPlayableSquare(targetX, targetY)) continue;

    const targetSquare = positionToSquare(targetX, targetY);
    const targetPiece = getPieceAt(targetSquare, pieces);

    if (targetPiece && targetPiece.color !== piece.color) {
      results.push({
        square: targetSquare,
        kind: "capture",
      });
    }
  }

  return results;
}

// ╔══════════════════════════╗
// ✅ SKUNK AURA RESTRICTION
// ╚══════════════════════════╝
//
// Every Skunk on the board creates a zone of 8 surrounding squares
// that no piece (friendly or enemy) may legally land on — EXCEPT:
//   • An enemy may still directly capture the Skunk by landing on its square.
//   • A piece already on a restricted square is not moved off; restriction
//     only prevents new landings.
// When multiple Skunks exist, their auras are unioned.

function getSkunkRestrictedSquares(pieces, excludePiece = null) {
  const restricted = new Set();

  for (const p of pieces) {
    // Skip the moving piece itself (a Skunk is never blocked by its OWN
    // aura — it can always move one square in any direction).
    if (p.type !== "SKUNK" || !p.square) continue;
    if (excludePiece && p.id === excludePiece.id) continue;

    const { x, y } = squareToPosition(p.square);
    const offsets = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dx, dy] of offsets) {
      const tx = x + dx;
      const ty = y + dy;

      if (!isPlayableSquare(tx, ty)) continue;

      const sq = positionToSquare(tx, ty);
      if (sq) restricted.add(sq);
    }
  }

  return restricted;
}

function applySkunkAuraFilter(targets, movingPiece, pieces) {
  // The moving Skunk is NOT restricted by its own aura — it can move one
  // square in any direction like a king. Its aura only restricts OTHER
  // pieces from landing adjacent to it. Also, a Skunk itself may freely
  // step onto squares adjacent to OTHER Skunks' squares (its own mobility
  // is king-like; the aura is a landing restriction for other pieces).
  const restricted = getSkunkRestrictedSquares(pieces, movingPiece);

  if (restricted.size === 0) return targets;

  return targets.filter((target) => {
    // A Skunk's own movement is never blocked by any aura.
    if (movingPiece.type === "SKUNK") return true;

    // Not restricted — always allowed
    if (!restricted.has(target.square)) return true;

    // Direct capture of a Skunk on the restricted square is permitted
    // (long-range or step pieces may land directly on a Skunk square).
    const occupant = pieces.find((p) => p.square === target.square);
    if (
      occupant &&
      occupant.type === "SKUNK" &&
      occupant.color !== movingPiece.color &&
      target.kind === "capture"
    ) {
      return true;
    }

    return false;
  });
}

// ╔══════════════════════════╗
// ✅ LEGAL TARGETS ROUTER
// ╚══════════════════════════╝

function dedupeTargets(targets) {
  const seen = new Set();

  return targets.filter((target) => {
    if (seen.has(target.square)) return false;
    seen.add(target.square);
    return true;
  });
}

export function getLegalTargets(piece, pieces, context = {}) {
  if (!piece) return [];

  let rawTargets;

  switch (piece.type) {
    case "WARRIOR":
      rawTargets = getWarriorMoves(piece, pieces);
      break;

    case "NINJA":
      rawTargets = getNinjaMoves(piece, pieces);
      break;

    case "SAGITTARIUS":
      rawTargets = getSagittariusMoves(piece, pieces);
      break;

    case "AIRAVATA":
      rawTargets = getAiravataMoves(piece, pieces);
      break;

    case "JATAYU":
      rawTargets = getJatayuMoves(piece, pieces);
      break;

    case "ELEPHANT":
      rawTargets = getElephantMoves(piece, pieces);
      break;

    case "RHINO":
      rawTargets = getRhinoMoves(piece, pieces);
      break;

    case "CAMEL":
      rawTargets = getCamelMoves(piece, pieces);
      break;

    case "HORSE":
      rawTargets = getHorseMoves(piece, pieces);
      break;

    case "DONKEY":
      rawTargets = getDonkeyMoves(piece, pieces);
      break;

    case "DRAGON":
      rawTargets = getDragonMoves(piece, pieces);
      break;

    case "GIRAFFE":
      rawTargets = getGiraffeMoves(piece, pieces);
      break;

    case "UNICORN":
      rawTargets = getUnicornMoves(piece, pieces);
      break;

    case "SKUNK":
      rawTargets = getSkunkMoves(piece, pieces);
      break;

    case "MONKEY":
      rawTargets = getMonkeyMoves(piece, pieces);
      break;

    case "WOLF":
      rawTargets = getWolfMoves(piece, pieces);
      break;

    case "ANTELOPE":
      rawTargets = getAntelopeMoves(piece, pieces, context);
      break;

    case "SNAKE":
      rawTargets = getSnakeMoves(piece, pieces);
      break;

    case "BULL":
      rawTargets = getBullMoves(piece, pieces);
      break;

    case "SOLDIER":
      rawTargets = getSoldierMoves(piece, pieces);
      break;

    default:
      rawTargets = [];
  }

  // Apply Skunk aura restriction to every piece's movement,
  // then drop any duplicate square entries (e.g. Rhino's king
  // diagonal overlapping its bishop slide).
  const filtered = applySkunkAuraFilter(rawTargets, piece, pieces);

  return dedupeTargets(filtered);
}
