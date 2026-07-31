// ╔══════════════════════╗
// ✅ CHAMBER SEIZURE TIMER ENGINE
// ╚══════════════════════╝

export const TURN_LIMIT_SECONDS = 30

export const RESERVE_OPTIONS = {
  NONE: 'NONE',
  TWO_MIN: 'TWO_MIN',
  FIVE_MIN: 'FIVE_MIN',
  CUSTOM: 'CUSTOM',
}

export const TIMER_TIMEOUT_REASONS = {
  CHAMBER_SEIZURE_READY: 'CHAMBER_SEIZURE_READY',
}

export function getReserveSeconds(option, customMinutes = 5) {
  if (option === RESERVE_OPTIONS.TWO_MIN) return 2 * 60
  if (option === RESERVE_OPTIONS.FIVE_MIN) return 5 * 60

  if (option === RESERVE_OPTIONS.CUSTOM) {
    const minutes = Number(customMinutes)

    if (!Number.isFinite(minutes) || minutes <= 0) return 0

    return Math.floor(minutes * 60)
  }

  return 0
}

export function createTimerState(reserveSeconds = 0) {
  return {
    turnRemaining: {
      WHITE: TURN_LIMIT_SECONDS,
      BLACK: TURN_LIMIT_SECONDS,
    },

    reserveRemaining: {
      WHITE: reserveSeconds,
      BLACK: reserveSeconds,
    },

    lastTimeout: null,
  }
}

export function resetTurnClock(timerState, color) {
  if (!color) return timerState

  return {
    ...timerState,
    turnRemaining: {
      ...timerState.turnRemaining,
      [color]: TURN_LIMIT_SECONDS,
    },
    lastTimeout: null,
  }
}

export function clearTimerTimeout(timerState) {
  return {
    ...timerState,
    lastTimeout: null,
  }
}

export function tickChamberTimer(timerState, activeColor, settings = {}) {
  const enabled = Boolean(settings.enabled)
  const hasReserve = Boolean(settings.hasReserve)

  if (!enabled || !activeColor) {
    return {
      state: timerState,
      timeout: false,
      timeoutInfo: null,
    }
  }

  if (timerState.lastTimeout?.color === activeColor) {
    return {
      state: timerState,
      timeout: false,
      timeoutInfo: timerState.lastTimeout,
    }
  }

  const next = {
    ...timerState,
    turnRemaining: {
      ...timerState.turnRemaining,
    },
    reserveRemaining: {
      ...timerState.reserveRemaining,
    },
    lastTimeout: null,
  }

  const turnLeft = next.turnRemaining?.[activeColor] ?? TURN_LIMIT_SECONDS
  const reserveLeft = next.reserveRemaining?.[activeColor] ?? 0

  if (turnLeft > 0) {
    next.turnRemaining[activeColor] = turnLeft - 1

    return {
      state: next,
      timeout: false,
      timeoutInfo: null,
    }
  }

  if (hasReserve && reserveLeft > 0) {
    next.reserveRemaining[activeColor] = reserveLeft - 1

    return {
      state: next,
      timeout: false,
      timeoutInfo: null,
    }
  }

  const timeoutInfo = {
    color: activeColor,
    reason: TIMER_TIMEOUT_REASONS.CHAMBER_SEIZURE_READY,
  }

  next.lastTimeout = timeoutInfo

  return {
    state: next,
    timeout: true,
    timeoutInfo,
  }
}

export function formatClock(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0)

  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  const minuteText = String(minutes).padStart(2, '0')
  const secondText = String(seconds).padStart(2, '0')

  return `${minuteText}:${secondText}`
}