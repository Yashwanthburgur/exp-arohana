import { useState } from 'react'
import { exportMatchLogAsText } from '../engine/matchLogEngine.js'

function useMatchLog() {
  const [matchLog, setMatchLog] = useState([])
  const [turnNumber, setTurnNumber] = useState(1)
  const [isMatchLogOpen, setIsMatchLogOpen] = useState(false)

  function addMatchLog(buildEntry, meta = {}) {
    setMatchLog(prev => {
      const number = prev.length + 1

      const entry = buildEntry({
        number,
        turn: turnNumber,
        ...meta,
      })

      return [...prev, entry]
    })
  }

  function replaceMatchLog(entries = []) {
    setMatchLog(entries)
  }

  function copyMatchLogText() {
    const text = exportMatchLogAsText(matchLog)

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  function openMatchLog() {
    setIsMatchLogOpen(true)
  }

  function closeMatchLog() {
    setIsMatchLogOpen(false)
  }

  function nextTurnNumber() {
    setTurnNumber(prev => prev + 1)
  }

  function resetMatchLog() {
    setMatchLog([])
    setTurnNumber(1)
    setIsMatchLogOpen(false)
  }

  return {
    matchLog,
    setMatchLog,
    replaceMatchLog,

    turnNumber,
    setTurnNumber,
    nextTurnNumber,

    isMatchLogOpen,
    setIsMatchLogOpen,
    openMatchLog,
    closeMatchLog,

    addMatchLog,
    copyMatchLogText,
    resetMatchLog,
  }
}

export default useMatchLog