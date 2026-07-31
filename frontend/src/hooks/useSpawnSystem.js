import { useState } from 'react'

function useSpawnSystem({
  setPieces,
  winner,
  getArmy,
  getFrontQueuePiece,
  isSupportType,
  getSupportSpawnSquares,
  getLaunchPads,
  getPieceAt,
  createPieceData,
  shiftQueue,
  sendToQueue,
  restartActionClock,
  addSpawnLog,
}) {
  const [pendingSpawnColor, setPendingSpawnColor] = useState(null)
  const [pendingSpawnQueue, setPendingSpawnQueue] = useState([])
  const [initialSpawnOrder, setInitialSpawnOrder] = useState([])

  function requestSpawn(color, options = {}) {
    if (winner) return false

    const { force = false } = options
    const army = getArmy(color)

    if (!force && army.length === 0) return false
    if (army.length === 0) return false

    if (!pendingSpawnColor) {
      setPendingSpawnColor(color)
    } else {
      setPendingSpawnQueue(prev => [...prev, color])
    }

    restartActionClock()
    return true
  }

  function activateNextSpawnOrClear() {
    setPendingSpawnQueue(prev => {
      if (prev.length === 0) {
        setPendingSpawnColor(null)
        return []
      }

      const [next, ...rest] = prev
      setPendingSpawnColor(next)
      return rest
    })
  }

  function getSpawnSquareInfo(color, square) {
    const occupant = getPieceAt(square)

    if (!occupant) {
      return {
        square,
        kind: 'move',
      }
    }

    if (occupant.color !== color) {
      return {
        square,
        kind: 'capture',
      }
    }

    return null
  }

  function getSpawnTargets() {
    if (!pendingSpawnColor) return []

    const frontType = getFrontQueuePiece(pendingSpawnColor)

    if (!frontType) return []

    const spawnSquares = isSupportType(frontType)
      ? getSupportSpawnSquares(pendingSpawnColor)
      : getLaunchPads(pendingSpawnColor)

    return spawnSquares
      .map(square => getSpawnSquareInfo(pendingSpawnColor, square))
      .filter(Boolean)
  }

  function isValidSpawnSquare(color, square) {
    const frontType = getFrontQueuePiece(color)

    if (!frontType) return false

    const allowedSquares = isSupportType(frontType)
      ? getSupportSpawnSquares(color)
      : getLaunchPads(color)

    if (!allowedSquares.includes(square)) return false

    return Boolean(getSpawnSquareInfo(color, square))
  }

  function spawnPendingPieceAt(square) {
    if (!pendingSpawnColor) return
    if (!isValidSpawnSquare(pendingSpawnColor, square)) return

    const army = getArmy(pendingSpawnColor)

    if (army.length === 0) {
      activateNextSpawnOrClear()
      restartActionClock()
      return
    }

    const type = army[0]
    const occupant = getPieceAt(square)

    if (addSpawnLog) {
      addSpawnLog({
        color: pendingSpawnColor,
        piece: type,
        square,
        capturedPiece:
          occupant && occupant.color !== pendingSpawnColor
            ? occupant
            : null,
      })
    }

    if (occupant && occupant.color !== pendingSpawnColor) {
      sendToQueue(occupant)
    }

    const spawnedPiece = createPieceData(type, pendingSpawnColor, square)

    setPieces(prev => [
      ...prev.filter(piece => piece.square !== square),
      spawnedPiece,
    ])

    shiftQueue(pendingSpawnColor)
    activateNextSpawnOrClear()
    restartActionClock()
  }

  function resetSpawnSystem() {
    setPendingSpawnColor(null)
    setPendingSpawnQueue([])
    setInitialSpawnOrder([])
  }

  return {
    pendingSpawnColor,
    setPendingSpawnColor,

    pendingSpawnQueue,
    setPendingSpawnQueue,

    initialSpawnOrder,
    setInitialSpawnOrder,

    requestSpawn,
    activateNextSpawnOrClear,
    getSpawnSquareInfo,
    getSpawnTargets,
    isValidSpawnSquare,
    spawnPendingPieceAt,

    resetSpawnSystem,
  }
}

export default useSpawnSystem