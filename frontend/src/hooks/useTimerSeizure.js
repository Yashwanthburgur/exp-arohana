import { useEffect, useState } from 'react'
import {
  createTimerState,
  getReserveSeconds,
  resetTurnClock,
  tickChamberTimer,
} from '../engine/timerEngine.js'
import {
  createNormalAction,
  createTimeoutSeizureAction,
} from '../engine/seizureEngine.js'

function useTimerSeizure({
  RESERVE_OPTIONS,
  phase,
  winner,
  actingColor,
  activeTimerColor,
  timerActionKey,
  reserveOption,
  customReserveMinutes,
  seizureAction,
  setSeizureAction,
  setSelectedPieceId,
  setLegalTargets,
  setTimeoutStatus,
  restartActionClock,
  addTimeoutLog,
  addSeizureStartLog,
}) {
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerState, setTimerState] = useState(() => createTimerState(0))

  function getCurrentReserveSeconds() {
    return getReserveSeconds(reserveOption, customReserveMinutes)
  }

  function hasReserveEnabled() {
    return getCurrentReserveSeconds() > 0
  }

  function initializeTimer() {
    setTimerState(createTimerState(getCurrentReserveSeconds()))
  }

  function resetTimerSystem() {
    setTimerEnabled(false)
    setTimerState(createTimerState(0))
  }

  function triggerTimeoutSeizure() {
    const currentAction = seizureAction || createNormalAction(actingColor)

    if (!currentAction) return

    const nextAction = createTimeoutSeizureAction(currentAction)

    if (!nextAction) return

    if (addTimeoutLog) {
      addTimeoutLog(activeTimerColor)
    }

    if (addSeizureStartLog) {
      addSeizureStartLog(nextAction)
    }

    setSelectedPieceId(null)
    setLegalTargets([])
    setSeizureAction(nextAction)

    setTimeoutStatus({
      color: nextAction.controller,
      message: `${nextAction.controller} controls ${nextAction.actingColor}'s move`,
    })

    restartActionClock()
  }

  useEffect(() => {
    if (!timerEnabled) return
    if (!activeTimerColor) return
    if (winner) return
    if (phase === 'SETUP') return

    setTimerState(prev =>
      resetTurnClock(prev, activeTimerColor)
    )

    if (!seizureAction) {
      setTimeoutStatus(null)
    }
  }, [
    timerEnabled,
    activeTimerColor,
    timerActionKey,
    phase,
    winner,
    seizureAction,
    setTimeoutStatus,
  ])

  useEffect(() => {
    if (!timerEnabled) return
    if (!activeTimerColor) return
    if (winner) return
    if (phase === 'SETUP') return

    const intervalId = setInterval(() => {
      setTimerState(prev => {
        const result = tickChamberTimer(
          prev,
          activeTimerColor,
          {
            enabled: timerEnabled,
            hasReserve: hasReserveEnabled(),
          }
        )

        if (result.timeout) {
          triggerTimeoutSeizure()
        }

        return result.state
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [
    timerEnabled,
    activeTimerColor,
    winner,
    phase,
    reserveOption,
    customReserveMinutes,
    seizureAction,
    actingColor,
    timerActionKey,
  ])

  return {
    timerEnabled,
    setTimerEnabled,

    timerState,
    setTimerState,

    getCurrentReserveSeconds,
    hasReserveEnabled,

    initializeTimer,
    resetTimerSystem,
    triggerTimeoutSeizure,
  }
}

export default useTimerSeizure