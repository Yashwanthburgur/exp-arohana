import { squareToPosition, positionToSquare, isPlayableSquare } from './coordinates.js'

// ╔══════════════════════╗
// ✅ BASIC BOARD HELPERS
// ╚══════════════════════╝
function getPieceAt(square, pieces) {
  return pieces.find(piece => piece.square === square)
}

function classifyTarget(square, movingPiece, pieces) {
  const occupant = getPieceAt(square, pieces)

  if (!occupant) {
    return {
      square,
      kind: 'move',
    }
  }

  if (occupant.color !== movingPiece.color) {
    return {
      square,
      kind: 'capture',
    }
  }

  return null
}

function isPathClear(fromX, fromY, toX, toY, pieces) {
  const dx = Math.sign(toX - fromX)
  const dy = Math.sign(toY - fromY)

  let currentX = fromX + dx
  let currentY = fromY + dy

  while (currentX !== toX || currentY !== toY) {
    const square = positionToSquare(currentX, currentY)

    if (square && getPieceAt(square, pieces)) {
      return false
    }

    currentX += dx
    currentY += dy
  }

  return true
}

function isSquareEmpty(x, y, pieces) {
  const square = positionToSquare(x, y)

  if (!square) return false

  return !getPieceAt(square, pieces)
}

// ╔══════════════════════╗
// ✅ GENERIC MOVE HELPERS
// ╚══════════════════════╝
function getSlidingMoves(piece, pieces, directions) {
  const { x, y } = squareToPosition(piece.square)
  const results = []

  for (const [dx, dy] of directions) {
    let step = 1

    while (true) {
      const targetX = x + dx * step
      const targetY = y + dy * step

      if (!isPlayableSquare(targetX, targetY)) break

      const targetSquare = positionToSquare(targetX, targetY)
      const target = classifyTarget(targetSquare, piece, pieces)

      if (!target) break

      results.push(target)

      if (target.kind === 'capture') break

      step++
    }
  }

  return results
}

function getLimitedSlidingMoves(piece, pieces, directions, maxSteps) {
  const { x, y } = squareToPosition(piece.square)
  const results = []

  for (const [dx, dy] of directions) {
    for (let step = 1; step <= maxSteps; step++) {
      const targetX = x + dx * step
      const targetY = y + dy * step

      if (!isPlayableSquare(targetX, targetY)) break

      if (!isPathClear(x, y, targetX, targetY, pieces)) break

      const targetSquare = positionToSquare(targetX, targetY)
      const target = classifyTarget(targetSquare, piece, pieces)

      if (!target) break

      results.push(target)

      if (target.kind === 'capture') break
    }
  }

  return results
}

function getLeaperMoves(piece, pieces, offsets) {
  const { x, y } = squareToPosition(piece.square)
  const results = []

  for (const [dx, dy] of offsets) {
    const targetX = x + dx
    const targetY = y + dy

    if (!isPlayableSquare(targetX, targetY)) continue

    const targetSquare = positionToSquare(targetX, targetY)
    const target = classifyTarget(targetSquare, piece, pieces)

    if (target) {
      results.push(target)
    }
  }

  return results
}

function wrapHorizontal(x) {
  const boardWidth = 9

  if (x < 0) {
    return ((x % boardWidth) + boardWidth) % boardWidth
  }

  if (x >= boardWidth) {
    return x % boardWidth
  }

  return x
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
  ]

  return getSlidingMoves(piece, pieces, directions)
}

// ╔══════════════════════╗
// ✅ NINJA — 1 TO 3 ANY DIRECTION, JUMPS
// ╚══════════════════════╝
function getNinjaMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square)

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]

  const results = []

  for (const [dx, dy] of directions) {
    for (let step = 1; step <= 3; step++) {
      const targetX = x + dx * step
      const targetY = y + dy * step

      if (!isPlayableSquare(targetX, targetY)) continue

      const targetSquare = positionToSquare(targetX, targetY)
      const target = classifyTarget(targetSquare, piece, pieces)

      if (target) {
        results.push(target)
      }
    }
  }

  return results
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
  ]

  return [
    ...getLimitedSlidingMoves(piece, pieces, directions, 3),
    ...getHorseMoves(piece, pieces),
  ]
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
  ]

  return getSlidingMoves(piece, pieces, directions)
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
  ]

  return getSlidingMoves(piece, pieces, directions)
}

// ╔══════════════════════╗
// ✅ RHINO — BISHOP + KING MOVE, NO JUMP
// ╚══════════════════════╝
function getRhinoMoves(piece, pieces) {
  return [
    ...getCamelMoves(piece, pieces),
    ...getKingMoves(piece, pieces),
  ]
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
  ]

  return getLeaperMoves(piece, pieces, offsets)
}

// ╔═════════════════════╗
// ✅ GAJASHVA — ELEPHANT (ROOK, NO JUMP) + HORSE (KNIGHT LEAP)
// ╚═════════════════════╝
function getGajashvaMoves(piece, pieces) {
  return [
    ...getElephantMoves(piece, pieces),
    ...getHorseMoves(piece, pieces),
  ]
}

// ╔══════════════════════╗
// ✅ BULL — FORWARD/BACKWARD MOVE, FORWARD CAPTURE
// ╚══════════════════════╝
function getBullMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square)
  const direction = piece.color === 'WHITE' ? 1 : -1
  const results = []

  const forwardSquare = positionToSquare(x, y + direction)
  if (forwardSquare && isSquareEmpty(x, y + direction, pieces)) {
    const moveTarget = classifyTarget(forwardSquare, piece, pieces)
    if (moveTarget && moveTarget.kind === 'move') {
      results.push(moveTarget)
    }
  }

  const backwardSquare = positionToSquare(x, y - direction)
  if (backwardSquare && isSquareEmpty(x, y - direction, pieces)) {
    const moveTarget = classifyTarget(backwardSquare, piece, pieces)
    if (moveTarget && moveTarget.kind === 'move') {
      results.push(moveTarget)
    }
  }

  const captureOffsets = [
    [0, direction],
    [-1, direction],
    [1, direction],
  ]

  for (const [dx, dy] of captureOffsets) {
    const targetX = x + dx
    const targetY = y + dy
    if (!isPlayableSquare(targetX, targetY)) continue

    const targetSquare = positionToSquare(targetX, targetY)
    const target = classifyTarget(targetSquare, piece, pieces)
    if (target && target.kind === 'capture') {
      results.push(target)
    }
  }

  return results
}

// ╔══════════════════════╗
// ✅ SKUNK — KING MOVE
// ╚══════════════════════╝
function getSkunkMoves(piece, pieces) {
  return getKingMoves(piece, pieces)
}

// ╔══════════════════════╗
// ✅ DONKEY — HORSE MOVE BUT CANNOT JUMP
// ╚══════════════════════╝
function getDonkeyMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square)

  const offsets = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ]

  const results = []

  for (const [dx, dy] of offsets) {
    const targetX = x + dx
    const targetY = y + dy

    if (!isPlayableSquare(targetX, targetY)) continue

    const pathClear = isNonJumpingLPathClear(x, y, targetX, targetY, pieces)

    if (!pathClear) continue

    const targetSquare = positionToSquare(targetX, targetY)
    const target = classifyTarget(targetSquare, piece, pieces)

    if (target) {
      results.push(target)
    }
  }

  return results
}

// ╔══════════════════════╗
// ✅ NON-JUMPING L PATH CHECK
// ╚══════════════════════╝
function isNonJumpingLPathClear(fromX, fromY, toX, toY, pieces) {
  const dx = toX - fromX
  const dy = toY - fromY

  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (!(
    (absDx === 2 && absDy === 1) ||
    (absDx === 1 && absDy === 2)
  )) {
    return false
  }

  const stepX = Math.sign(dx)
  const stepY = Math.sign(dy)

  let pathOne = []

  if (absDx === 2) {
    pathOne = [
      [fromX + stepX, fromY],
      [fromX + stepX * 2, fromY],
    ]
  } else {
    pathOne = [
      [fromX, fromY + stepY],
      [fromX, fromY + stepY * 2],
    ]
  }

  let pathTwo = []

  if (absDx === 2) {
    pathTwo = [
      [fromX, fromY + stepY],
      [fromX + stepX, fromY + stepY],
    ]
  } else {
    pathTwo = [
      [fromX + stepX, fromY],
      [fromX + stepX, fromY + stepY],
    ]
  }

  const isPathOneClear = pathOne.every(([pathX, pathY]) =>
    isSquareEmpty(pathX, pathY, pieces)
  )

  const isPathTwoClear = pathTwo.every(([pathX, pathY]) =>
    isSquareEmpty(pathX, pathY, pieces)
  )

  return isPathOneClear || isPathTwoClear
}

// ╔══════════════════════╗
// ✅ DRAGON — 3+1 LEAPER WITH HORIZONTAL EDGE WRAP
// ╚══════════════════════╝
function getDragonMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square)

  const offsets = [
    [3, 1],
    [3, -1],
    [-3, 1],
    [-3, -1],
    [1, 3],
    [1, -3],
    [-1, 3],
    [-1, -3],
  ]

  const results = []

  for (const [dx, dy] of offsets) {
    const targetX = wrapHorizontal(x + dx)
    const targetY = y + dy

    if (!isPlayableSquare(targetX, targetY)) continue

    const targetSquare = positionToSquare(targetX, targetY)
    const target = classifyTarget(targetSquare, piece, pieces)

    if (target) {
      results.push(target)
    }
  }

  return results
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
  ]

  return getLeaperMoves(piece, pieces, offsets)
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
  ]

  return getLeaperMoves(piece, pieces, offsets)
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
  ]

  return getLeaperMoves(piece, pieces, offsets)
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
  ]

  return getLeaperMoves(piece, pieces, offsets)
}

// ╔══════════════════════╗
// ✅ MONKEY — 1-STEP KING WRAP LEAPER
// ╚══════════════════════╝
//
// Monkey moves one square in any direction, like a king.
// If a direction goes beyond the board edge,
// it wraps around to the opposite side.
//
// Example:
// a0 left wraps to i0.
// a0 down wraps to a10.
// a0 down-left wraps to i10.

function wrapCoordinate(value, size) {
  return ((value % size) + size) % size
}

function getMonkeyMoves(piece, pieces) {
  const BOARD_WIDTH = 9
  const BOARD_HEIGHT = 11

  const { x, y } = squareToPosition(piece.square)

  const offsets = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]

  const results = []
  const seenSquares = new Set()

  for (const [dx, dy] of offsets) {
    const targetX = wrapCoordinate(x + dx, BOARD_WIDTH)
    const targetY = wrapCoordinate(y + dy, BOARD_HEIGHT)

    if (!isPlayableSquare(targetX, targetY)) continue

    const targetSquare = positionToSquare(targetX, targetY)

    if (seenSquares.has(targetSquare)) continue
    seenSquares.add(targetSquare)

    const target = classifyTarget(targetSquare, piece, pieces)

    if (!target) continue

    results.push(target)
  }

  return results
}

// ╔══════════════════════╗
// ✅ WOLF — KING MOVE, INVISIBILITY HANDLED IN BOARD
// ╚══════════════════════╝
function getWolfMoves(piece, pieces) {
  return getKingMoves(piece, pieces)
}

// ╔══════════════════════╗
// ✅ ANTELOPE — KING MOVE + FAR ENEMY SWAP
// ╚══════════════════════╝
function getAntelopeMoves(piece, pieces, context = {}) {
  const { x, y } = squareToPosition(piece.square)

  // Antelope always has normal king movement.
  // Adjacent enemies are captured normally through kingMoves.
  const kingMoves = getKingMoves(piece, pieces)

  const teamMoveCount = context.teamMoveCount ?? 0
  const moveLimit = context.moveLimit ?? 8

  const isArrivalMove = teamMoveCount === moveLimit - 1

  // If horns are already used, Antelope only has normal movement.
  if (piece.powerUsed) {
    return kingMoves
  }

  // If team is at 7/8 moves, Antelope cannot swap.
  // Normal movement is still allowed.
  if (isArrivalMove) {
    return kingMoves
  }

  const swapTargets = pieces
    .filter(otherPiece => {
      if (!otherPiece.square) return false
      if (otherPiece.color === piece.color) return false

      // Wolf cannot be detected by Antelope radar and cannot be swapped.
      if (otherPiece.type === 'WOLF') return false

      const targetPosition = squareToPosition(otherPiece.square)

      const distanceX = Math.abs(targetPosition.x - x)
      const distanceY = Math.abs(targetPosition.y - y)

      const isReachableByKingMove =
        distanceX <= 1 &&
        distanceY <= 1

      // If Antelope can capture normally, do not show swap.
      if (isReachableByKingMove) return false

      return true
    })
    .map(otherPiece => ({
      square: otherPiece.square,
      kind: 'swap',
    }))

  return [
    ...kingMoves,
    ...swapTargets,
  ]
}

// ╔══════════════════════╗
// ✅ SOLDIER — FORWARD 1, DIAGONAL CAPTURE
// ╚══════════════════════╝
function getSoldierMoves(piece, pieces) {
  const { x, y } = squareToPosition(piece.square)
  const direction = piece.color === 'WHITE' ? 1 : -1
  const results = []

  // Forward 1 (empty only)
  const forwardX = x
  const forwardY = y + direction

  if (isPlayableSquare(forwardX, forwardY)) {
    const forwardSquare = positionToSquare(forwardX, forwardY)

    if (!getPieceAt(forwardSquare, pieces)) {
      results.push({
        square: forwardSquare,
        kind: 'move',
      })
    }
  }

  // Diagonal capture (forward only)
  const captureOffsets = [
    [-1, direction],
    [1, direction],
  ]

  for (const [dx, dy] of captureOffsets) {
    const targetX = x + dx
    const targetY = y + dy

    if (!isPlayableSquare(targetX, targetY)) continue

    const targetSquare = positionToSquare(targetX, targetY)
    const targetPiece = getPieceAt(targetSquare, pieces)

    if (targetPiece && targetPiece.color !== piece.color) {
      results.push({
        square: targetSquare,
        kind: 'capture',
      })
    }
  }

  return results
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

function getSkunkRestrictedSquares(pieces) {
  const restricted = new Set()

  for (const p of pieces) {
    if (p.type !== 'SKUNK' || !p.square) continue

    const { x, y } = squareToPosition(p.square)
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0,  -1],           [0,  1],
      [1,  -1], [1,  0], [1,  1],
    ]

    for (const [dx, dy] of offsets) {
      const tx = x + dx
      const ty = y + dy

      if (!isPlayableSquare(tx, ty)) continue

      const sq = positionToSquare(tx, ty)
      if (sq) restricted.add(sq)
    }
  }

  return restricted
}

function applySkunkAuraFilter(targets, movingPiece, pieces) {
  const restricted = getSkunkRestrictedSquares(pieces)

  if (restricted.size === 0) return targets

  return targets.filter(target => {
    // Not restricted — always allowed
    if (!restricted.has(target.square)) return true

    // Direct capture of a Skunk on the restricted square is permitted
    const occupant = pieces.find(p => p.square === target.square)
    if (
      occupant &&
      occupant.type === 'SKUNK' &&
      occupant.color !== movingPiece.color &&
      target.kind === 'capture'
    ) {
      return true
    }

    return false
  })
}

// ╔══════════════════════════╗
// ✅ LEGAL TARGETS ROUTER
// ╚══════════════════════════╝
export function getLegalTargets(piece, pieces, context = {}) {
  if (!piece) return []

  let rawTargets = []

  switch (piece.type) {
    case 'WARRIOR':
      rawTargets = getWarriorMoves(piece, pieces)
      break

    case 'NINJA':
      rawTargets = getNinjaMoves(piece, pieces)
      break

    case 'SAGITTARIUS':
      rawTargets = getSagittariusMoves(piece, pieces)
      break

    case 'GAJASHVA':
      rawTargets = getGajashvaMoves(piece, pieces)
      break

    case 'ELEPHANT':
      rawTargets = getElephantMoves(piece, pieces)
      break

    case 'RHINO':
      rawTargets = getRhinoMoves(piece, pieces)
      break

    case 'CAMEL':
      rawTargets = getCamelMoves(piece, pieces)
      break

    case 'HORSE':
      rawTargets = getHorseMoves(piece, pieces)
      break

    case 'DONKEY':
      rawTargets = getDonkeyMoves(piece, pieces)
      break

    case 'DRAGON':
      rawTargets = getDragonMoves(piece, pieces)
      break

    case 'GIRAFFE':
      rawTargets = getGiraffeMoves(piece, pieces)
      break

    case 'UNICORN':
      rawTargets = getUnicornMoves(piece, pieces)
      break

    case 'SKUNK':
      rawTargets = getSkunkMoves(piece, pieces)
      break

    case 'MONKEY':
      rawTargets = getMonkeyMoves(piece, pieces)
      break

    case 'WOLF':
      rawTargets = getWolfMoves(piece, pieces)
      break

    case 'ANTELOPE':
      rawTargets = getAntelopeMoves(piece, pieces, context)
      break

    case 'SNAKE':
      rawTargets = getSnakeMoves(piece, pieces)
      break

    case 'BULL':
      rawTargets = getBullMoves(piece, pieces)
      break

    case 'SOLDIER':
      rawTargets = getSoldierMoves(piece, pieces)
      break

    default:
      rawTargets = []
  }

  // Apply Skunk aura restriction to every piece's movement
  return applySkunkAuraFilter(rawTargets, piece, pieces)
}