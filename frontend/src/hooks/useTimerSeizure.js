import { useEffect, useState } from "react";
import {
  createTimerState,
  getReserveSeconds,
  resetTurnClock,
  tickChamberTimer,
} from "../engine/timerEngine.js";
import {
  createNormalAction,
  createTimeoutSeizureAction,
  ABANDONMENT_DRAW_THRESHOLD,
} from "../engine/seizureEngine.js";

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
  // Strict abandonment rule: called with the missed-duty counter when it
  // reaches ABANDONMENT_DRAW_THRESHOLD → match ends as a DRAW.
  onAbandonmentDraw,
}) {
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerState, setTimerState] = useState(() => createTimerState(0));

  // Number of consecutive timeouts where the player whose duty it was did
  // NOT complete their move. Reset to 0 whenever a duty is completed.
  const [missedDutyCount, setMissedDutyCount] = useState(0);

  function getCurrentReserveSeconds() {
    return getReserveSeconds(reserveOption, customReserveMinutes);
  }

  function hasReserveEnabled() {
    return getCurrentReserveSeconds() > 0;
  }

  function initializeTimer() {
    setTimerState(createTimerState(getCurrentReserveSeconds()));
  }

  function resetTimerSystem() {
    setTimerEnabled(false);
    setTimerState(createTimerState(0));
    setMissedDutyCount(0);
  }

  // Called whenever a move is actually completed — the duty was fulfilled,
  // so the missed-duty streak resets.
  function clearMissedDuties() {
    setMissedDutyCount(0);
  }

  function triggerTimeoutSeizure() {
    const currentAction = seizureAction || createNormalAction(actingColor);

    if (!currentAction) return;

    const nextAction = createTimeoutSeizureAction(currentAction);

    if (!nextAction) return;

    if (addTimeoutLog) {
      addTimeoutLog(activeTimerColor);
    }

    if (addSeizureStartLog) {
      addSeizureStartLog(nextAction);
    }

    setSelectedPieceId(null);
    setLegalTargets([]);
    setSeizureAction(nextAction);

    setTimeoutStatus({
      color: nextAction.controller,
      message: `${nextAction.controller} controls ${nextAction.actingColor}'s move`,
    });

    // Strict rule: increment the missed-duty counter on every timeout.
    // When it hits the threshold (4), the match is abandoned as a draw.
    setMissedDutyCount((prev) => {
      const next = prev + 1;
      if (next >= ABANDONMENT_DRAW_THRESHOLD && onAbandonmentDraw) {
        onAbandonmentDraw(next);
      }
      return next;
    });

    restartActionClock();
  }

  useEffect(() => {
    if (!timerEnabled) return;
    if (!activeTimerColor) return;
    if (winner) return;
    if (phase === "SETUP") return;

    setTimerState((prev) => resetTurnClock(prev, activeTimerColor));

    if (!seizureAction) {
      setTimeoutStatus(null);
    }
  }, [
    timerEnabled,
    activeTimerColor,
    timerActionKey,
    phase,
    winner,
    seizureAction,
    setTimeoutStatus,
  ]);

  useEffect(() => {
    if (!timerEnabled) return;
    if (!activeTimerColor) return;
    if (winner) return;
    if (phase === "SETUP") return;

    const intervalId = setInterval(() => {
      setTimerState((prev) => {
        const result = tickChamberTimer(prev, activeTimerColor, {
          enabled: timerEnabled,
          hasReserve: hasReserveEnabled(),
        });

        if (result.timeout) {
          triggerTimeoutSeizure();
        }

        return result.state;
      });
    }, 1000);

    return () => clearInterval(intervalId);
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
  ]);

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
    clearMissedDuties,
  };
}

export default useTimerSeizure;
