import { useEffect, useState } from 'react'

function useInitialSupportSystem({
  phase,
  pieces,
  getSupportSpawnSquares,
  getComboCount,
  isSupportType,
  createPieceData,
  sendManyToQueue,
  addInitialSupportLog,
  startInitialNormalSpawn,
  restartActionClock,
}) {
  const [pendingInitialSupportColor, setPendingInitialSupportColor] = useState(null)

  const [initialSupportQueues, setInitialSupportQueues] = useState({
    WHITE: [],
    BLACK: [],
  })

  function getInitialSupportCount(type) {
    if (!isSupportType(type)) return 0
    return getComboCount(type)
  }

  function expandInitialSupportQueue(army) {
    const supportUnits = []
    const normalQueue = []

    for (const type of army) {
      if (isSupportType(type)) {
        const count = getInitialSupportCount(type)

        for (let i = 0; i < count; i++) {
          supportUnits.push(type)
        }
      } else {
        normalQueue.push(type)
      }
    }

    return {
      supportUnits,
      normalQueue,
    }
  }

  function getInitialSupportTargets() {
    if (!pendingInitialSupportColor) return []

    return getSupportSpawnSquares(pendingInitialSupportColor)
      .filter(square => !pieces.some(piece => piece.square === square))
      .map(square => ({
        square,
        kind: 'move',
      }))
  }

  function finishInitialSupportStep() {
    if (pendingInitialSupportColor === 'WHITE') {
      if (initialSupportQueues.BLACK.length > 0) {
        setPendingInitialSupportColor('BLACK')
        restartActionClock()
        return
      }

      setPendingInitialSupportColor(null)
      startInitialNormalSpawn()
      return
    }

    if (pendingInitialSupportColor === 'BLACK') {
      setPendingInitialSupportColor(null)
      startInitialNormalSpawn()
    }
  }

  function placeInitialSupportAt(square, setPieces) {
    if (!pendingInitialSupportColor) return

    const validSquares = getSupportSpawnSquares(pendingInitialSupportColor)

    if (!validSquares.includes(square)) return
    if (pieces.some(piece => piece.square === square)) return

    const queue = initialSupportQueues[pendingInitialSupportColor]

    if (!queue || queue.length === 0) {
      finishInitialSupportStep()
      return
    }

    const type = queue[0]
    const newPiece = createPieceData(type, pendingInitialSupportColor, square)

    if (addInitialSupportLog) {
      addInitialSupportLog({
        color: pendingInitialSupportColor,
        piece: type,
        square,
      })
    }

    setPieces(prev => [...prev, newPiece])

    const remainingQueue = queue.slice(1)

    setInitialSupportQueues(prev => ({
      ...prev,
      [pendingInitialSupportColor]: remainingQueue,
    }))

    // Do NOT restart the clock here.
    // One timer covers the full support setup for that player.

    if (remainingQueue.length === 0) {
      finishInitialSupportStep()
    }
  }

  useEffect(() => {
    if (phase !== 'INITIAL_SUPPORT') return
    if (!pendingInitialSupportColor) return

    const queue = initialSupportQueues[pendingInitialSupportColor]

    if (!queue || queue.length === 0) return

    const availableSquares = getInitialSupportTargets()

    if (availableSquares.length > 0) return

    // No available squares — send remaining support units to queue
    sendManyToQueue(pendingInitialSupportColor, queue)

    setInitialSupportQueues(prev => ({
      ...prev,
      [pendingInitialSupportColor]: [],
    }))

    finishInitialSupportStep()
  }, [
    phase,
    pendingInitialSupportColor,
    initialSupportQueues,
    pieces,
  ])

  function resetInitialSupportSystem() {
    setPendingInitialSupportColor(null)
    setInitialSupportQueues({
      WHITE: [],
      BLACK: [],
    })
  }

  return {
    pendingInitialSupportColor,
    setPendingInitialSupportColor,

    initialSupportQueues,
    setInitialSupportQueues,

    getInitialSupportCount,
    expandInitialSupportQueue,
    getInitialSupportTargets,
    placeInitialSupportAt,
    finishInitialSupportStep,
    resetInitialSupportSystem,
  }
}

export default useInitialSupportSystem