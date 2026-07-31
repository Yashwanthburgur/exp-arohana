import { useEffect, useRef, useState } from "react";

import { getLegalTargets } from "../engine/moveEngine.js";
import { applyMove, switchTurn } from "../engine/gameEngine.js";
import { PIECE_CATALOG } from "../engine/pieceCatalog.js";
import { TARGET_SCORE, SCORE_VALUES } from "../engine/scoreEngine.js";

import {
  RESERVE_OPTIONS,
  createTimerState,
  formatClock,
  getReserveSeconds,
  resetTurnClock,
  tickChamberTimer,
} from "../engine/timerEngine.js";

import {
  createNormalAction,
  createTimeoutSeizureAction,
} from "../engine/seizureEngine.js";

import {
  createAllOutLog,
  createAntelopeSwapLog,
  createCaptureLog,
  createGameStartLog,
  createInitialSupportLog,
  createMoveLog,
  createPromotionLog,
  createSeizureCompleteLog,
  createSeizureStartLog,
  createSpawnLog,
  createTimeoutLog,
  createWinLog,
} from "../engine/matchLogEngine.js";

import { DEFAULT_VARIANT } from "../constants/variantConfig.js";
import {
  MOVE_LIMIT,
  getLaunchPads,
  getSupportSpawnSquares,
  isSupportType,
} from "../constants/boardConfig.js";

import useDraftSystem from "./useDraftSystem.js";
import useHomeSystem from "./useHomeSystem.js";
import useMatchLog from "./useMatchLog.js";
import useMatchSocket from "./useMatchSocket.js";
import useScoreSystem from "./useScoreSystem.js";
import useSpawnSystem from "./useSpawnSystem.js";

function useGameController({ onlineMatch }) {
  const remoteUpdateRef = useRef(false);

  const [variant, setVariant] = useState(DEFAULT_VARIANT);
  const [customPieces, setCustomPieces] = useState(null);
  const [setupConfirmed, setSetupConfirmed] = useState(false);

  const {
    whiteArmy,
    setWhiteArmy,
    blackArmy,
    setBlackArmy,

    whiteReady,
    setWhiteReady,
    blackReady,
    setBlackReady,

    rollPiece,
    isDraftComplete,
    moveUp,
    moveDown,
    shiftQueue,
    sendToQueue,
    sendManyToQueue,
    resetDraft,

    calculateMaterialTotal,
    getQueueLabel,
    REQUIRED_DRAFT_ROLLS,
  } = useDraftSystem({ variant, customPieces });

  const {
    matchLog,
    replaceMatchLog,

    setTurnNumber,
    nextTurnNumber,

    isMatchLogOpen,
    openMatchLog,
    closeMatchLog,

    addMatchLog: addMatchLogFromHook,
    copyMatchLogText,
    resetMatchLog,
  } = useMatchLog();

  const {
    whiteScore,
    setWhiteScore,
    blackScore,
    setBlackScore,

    winner,
    setWinner,

    getScore: getScoreFromHook,
    getScoreSnapshot: getScoreSnapshotFromHook,
    awardScore: awardScoreFromHook,
    resetScoreSystem,
  } = useScoreSystem({ targetScore: TARGET_SCORE });

  const [pieces, setPieces] = useState([]);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("WHITE");
  const [whiteMoves, setWhiteMoves] = useState(0);
  const [blackMoves, setBlackMoves] = useState(0);

  const [phase, setPhase] = useState("SETUP");
  const isGameStarted = phase !== "SETUP";

  const [timerEnabled, setTimerEnabled] = useState(false);
  const [reserveOption, setReserveOption] = useState(RESERVE_OPTIONS.NONE);
  const [customReserveMinutes, setCustomReserveMinutes] = useState(5);
  const [timerState, setTimerState] = useState(() => createTimerState(0));
  const [timeoutStatus, setTimeoutStatus] = useState(null);
  const [timerActionKey, setTimerActionKey] = useState(0);
  const [seizureAction, setSeizureAction] = useState(null);

  const [pendingInitialSupportColor, setPendingInitialSupportColor] =
    useState(null);
  const [initialSupportQueues, setInitialSupportQueues] = useState({
    WHITE: [],
    BLACK: [],
  });

  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [originalWhiteArmy, setOriginalWhiteArmy] = useState([]);
  const [originalBlackArmy, setOriginalBlackArmy] = useState([]);

  function addMatchLog(buildEntry) {
    addMatchLogFromHook(buildEntry, {
      phase,
      whiteScore,
      blackScore,
    });
  }

  function getScoreSnapshot(white = whiteScore, black = blackScore) {
    return getScoreSnapshotFromHook(white, black);
  }

  function getArmy(color) {
    return color === "WHITE" ? whiteArmy : blackArmy;
  }

  function getScore(color) {
    return getScoreFromHook(color);
  }

  function getMoves(color) {
    return color === "WHITE" ? whiteMoves : blackMoves;
  }

  function getOpponent(color) {
    return color === "WHITE" ? "BLACK" : "WHITE";
  }

  function getPieceAt(square, currentPieces = pieces) {
    return currentPieces.find((piece) => piece.square === square);
  }

  function getFrontQueuePiece(color) {
    return getArmy(color)[0];
  }

  function getComboCount(type) {
    return PIECE_CATALOG[type]?.comboCount ?? 1;
  }

  function createPieceData(type, color, square) {
    return {
      id: `${color.toLowerCase()}-${type.toLowerCase()}-${Date.now()}-${Math.random()}`,
      type,
      color,
      square,
      powerUsed: false,
    };
  }

  function clearSelection() {
    setSelectedPieceId(null);
    setLegalTargets([]);
  }

  function getActivePieces(color) {
    return pieces.filter(
      (piece) =>
        piece.color === color &&
        piece.square !== null &&
        (!pendingHomeAttack || piece.id !== pendingHomeAttack.pieceId),
    );
  }

  function teamHasAnyLegalMove(color) {
    return getActivePieces(color).some(
      (piece) =>
        getLegalTargets(piece, pieces, {
          teamMoveCount: getMoves(color),
          moveLimit: MOVE_LIMIT,
        }).length > 0,
    );
  }

  function restartActionClock() {
    setTimerActionKey((prev) => prev + 1);
  }

  const {
    whiteHome,
    blackHome,
    setWhiteHome,
    setBlackHome,
    pendingHomeAttack,
    setPendingHomeAttack,
    assignHomes,
    resetHomes,
    createNewHomeClaimIfNeeded,
    resolvePendingHomeClaim,
  } = useHomeSystem({
    whiteScore,
    blackScore,
    winner,
    addMatchLog,
    createWinLog,
    setWinner,
    setWhiteScore,
    setBlackScore,
    sendToQueue,
    TARGET_SCORE,
    SCORE_VALUES,
  });

  const {
    pendingSpawnColor,
    setPendingSpawnColor,
    pendingSpawnQueue,
    setPendingSpawnQueue,
    getSpawnTargets,
    spawnPendingPieceAt,
    requestSpawn,
    resetSpawnSystem,
  } = useSpawnSystem({
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
    addSpawnLog: (details) =>
      addMatchLog((meta) => createSpawnLog({ ...meta, ...details })),
  });

  function getCurrentReserveSeconds() {
    return getReserveSeconds(reserveOption, customReserveMinutes);
  }

  function hasReserveEnabled() {
    return getCurrentReserveSeconds() > 0;
  }

  function getActingColor() {
    if (seizureAction) return seizureAction.actingColor;
    if (phase === "INITIAL_SUPPORT") return pendingInitialSupportColor;
    if (phase === "PLAYING") {
      if (pendingSpawnColor && getSpawnTargets().length > 0)
        return pendingSpawnColor;
      return currentTurn;
    }
    return null;
  }

  function getControllerColor() {
    if (!timerEnabled) return null;
    if (winner) return null;
    if (seizureAction) return seizureAction.controller;
    if (phase === "INITIAL_SUPPORT") return pendingInitialSupportColor;
    if (phase === "PLAYING") {
      if (pendingSpawnColor && getSpawnTargets().length > 0)
        return pendingSpawnColor;
      return currentTurn;
    }
    return null;
  }

  const activeTimerColor = getControllerColor();
  const actingColor = getActingColor();

  function completeCurrentAction() {
    if (seizureAction) {
      addMatchLog((meta) =>
        createSeizureCompleteLog({
          ...meta,
          controller: seizureAction.controller,
          actingColor: seizureAction.actingColor,
        }),
      );
      const controller = seizureAction.controller;
      setSeizureAction(null);
      setCurrentTurn(controller);
      nextTurnNumber();
      restartActionClock();
      return;
    }

    setCurrentTurn((prev) => switchTurn(prev));
    nextTurnNumber();
    restartActionClock();
  }

  function triggerTimeoutSeizure() {
    const currentAction = seizureAction || createNormalAction(actingColor);
    if (!currentAction) return;
    const nextAction = createTimeoutSeizureAction(currentAction);
    if (!nextAction) return;

    addMatchLog((meta) =>
      createTimeoutLog({
        ...meta,
        timedOutColor: activeTimerColor,
      }),
    );
    addMatchLog((meta) =>
      createSeizureStartLog({
        ...meta,
        controller: nextAction.controller,
        actingColor: nextAction.actingColor,
      }),
    );

    setSelectedPieceId(null);
    setLegalTargets([]);
    setSeizureAction(nextAction);
    setTimeoutStatus({
      color: nextAction.controller,
      message: `${nextAction.controller} controls ${nextAction.actingColor}'s move`,
    });
    restartActionClock();
  }

  function awardScore(color, amount) {
    return awardScoreFromHook(color, amount, {
      onWin: ({
        winner: winningColor,
        whiteScore: nextWhiteScore,
        blackScore: nextBlackScore,
      }) => {
        clearSelection();
        setPendingSpawnColor(null);
        setPendingSpawnQueue([]);
        setPendingInitialSupportColor(null);
        addMatchLog((meta) =>
          createWinLog({
            ...meta,
            winner: winningColor,
            whiteScore: nextWhiteScore,
            blackScore: nextBlackScore,
          }),
        );
      },
    });
  }

  function getInitialSupportCount(type) {
    if (!isSupportType(type)) return 0;
    return getComboCount(type);
  }

  function expandInitialSupportQueue(army) {
    const supportUnits = [];
    const normalQueue = [];

    for (const type of army) {
      if (isSupportType(type)) {
        const count = getInitialSupportCount(type);
        for (let i = 0; i < count; i++) supportUnits.push(type);
      } else {
        normalQueue.push(type);
      }
    }

    return { supportUnits, normalQueue };
  }

  function getInitialSupportTargets() {
    if (!pendingInitialSupportColor) return [];

    return getSupportSpawnSquares(pendingInitialSupportColor)
      .filter((square) => !pieces.some((piece) => piece.square === square))
      .map((square) => ({ square, kind: "move" }));
  }

  function placeInitialSupportAt(square) {
    if (!pendingInitialSupportColor) return;

    const validSquares = getSupportSpawnSquares(pendingInitialSupportColor);
    if (!validSquares.includes(square)) return;
    if (pieces.some((piece) => piece.square === square)) return;

    const queue = initialSupportQueues[pendingInitialSupportColor];
    if (!queue || queue.length === 0) {
      finishInitialSupportStep();
      return;
    }

    const type = queue[0];
    const newPiece = createPieceData(type, pendingInitialSupportColor, square);

    addMatchLog((meta) =>
      createInitialSupportLog({
        ...meta,
        color: pendingInitialSupportColor,
        piece: type,
        square,
      }),
    );

    setPieces((prev) => [...prev, newPiece]);

    const remainingQueue = queue.slice(1);
    setInitialSupportQueues((prev) => ({
      ...prev,
      [pendingInitialSupportColor]: remainingQueue,
    }));

    if (remainingQueue.length === 0) finishInitialSupportStep();
  }

  function finishInitialSupportStep() {
    if (pendingInitialSupportColor === "WHITE") {
      if (initialSupportQueues.BLACK.length > 0) {
        setPendingInitialSupportColor("BLACK");
        restartActionClock();
        return;
      }
      setPendingInitialSupportColor(null);
      startInitialNormalSpawn();
      return;
    }

    if (pendingInitialSupportColor === "BLACK") {
      setPendingInitialSupportColor(null);
      startInitialNormalSpawn();
    }
  }

  function calculateCompensation(whiteTotal, blackTotal) {
    if (whiteTotal === blackTotal) {
      return {
        weaker: null,
        compensationMoves: 0,
        bonusSpawns: 0,
        remainder: 0,
      };
    }

    const weaker = whiteTotal < blackTotal ? "WHITE" : "BLACK";
    const gap = Math.abs(whiteTotal - blackTotal);
    const compensationMoves = Math.floor(gap * 2);

    return {
      weaker,
      compensationMoves,
      bonusSpawns: Math.floor(compensationMoves / MOVE_LIMIT),
      remainder: compensationMoves % MOVE_LIMIT,
    };
  }

  function startGame() {
    if (!whiteReady || !blackReady) return;
    if (!isDraftComplete()) return;

    assignHomes();
    setOriginalWhiteArmy([...whiteArmy]);
    setOriginalBlackArmy([...blackArmy]);

    const reserveSeconds = getCurrentReserveSeconds();
    setTimerState(createTimerState(reserveSeconds));
    setTimeoutStatus(null);
    setTimerActionKey(0);
    setSeizureAction(null);

    replaceMatchLog([
      createGameStartLog({
        number: 1,
        turn: 1,
        phase: "SETUP",
        whiteArmy,
        blackArmy,
      }),
    ]);
    setTurnNumber(1);

    const originalWhiteMaterial = calculateMaterialTotal(whiteArmy);
    const originalBlackMaterial = calculateMaterialTotal(blackArmy);
    const compensation = calculateCompensation(
      originalWhiteMaterial,
      originalBlackMaterial,
    );

    if (compensation.weaker === "WHITE") setWhiteMoves(compensation.remainder);
    if (compensation.weaker === "BLACK") setBlackMoves(compensation.remainder);

    const compensationQueue = compensation.weaker
      ? Array.from(
          { length: compensation.bonusSpawns },
          () => compensation.weaker,
        )
      : [];

    const whiteStart = expandInitialSupportQueue(whiteArmy);
    const blackStart = expandInitialSupportQueue(blackArmy);

    setPieces([]);
    setWhiteArmy(whiteStart.normalQueue);
    setBlackArmy(blackStart.normalQueue);

    setPendingSpawnQueue(compensationQueue);

    setInitialSupportQueues({
      WHITE: whiteStart.supportUnits,
      BLACK: blackStart.supportUnits,
    });

    setCurrentTurn("WHITE");

    if (whiteStart.supportUnits.length > 0) {
      setPhase("INITIAL_SUPPORT");
      setPendingInitialSupportColor("WHITE");
      return;
    }

    if (blackStart.supportUnits.length > 0) {
      setPhase("INITIAL_SUPPORT");
      setPendingInitialSupportColor("BLACK");
      return;
    }

    startInitialNormalSpawn(
      whiteStart.normalQueue,
      blackStart.normalQueue,
      compensationQueue,
    );
  }

  function startInitialNormalSpawn(
    whiteQueue = whiteArmy,
    blackQueue = blackArmy,
    extraSpawnQueue = pendingSpawnQueue,
  ) {
    const order = [];
    if (whiteQueue.length > 0) order.push("WHITE");
    if (blackQueue.length > 0) order.push("BLACK");

    const fullOrder = [...order, ...extraSpawnQueue];

    setPhase("PLAYING");
    setPendingSpawnQueue([]);

    if (fullOrder.length > 0) {
      const [first, ...rest] = fullOrder;
      setPendingSpawnColor(first);
      setPendingSpawnQueue(rest);
    } else {
      setPendingSpawnColor(null);
    }

    setCurrentTurn("WHITE");
    restartActionClock();
  }

  useEffect(() => {
    if (onlineMatch && onlineMatch.hostColor !== onlineMatch.assignedColor)
      return;
    if (
      whiteReady &&
      blackReady &&
      phase === "SETUP" &&
      whiteArmy.length >= REQUIRED_DRAFT_ROLLS &&
      blackArmy.length >= REQUIRED_DRAFT_ROLLS
    ) {
      startGame();
    }
  }, [
    whiteReady,
    blackReady,
    phase,
    whiteArmy.length,
    blackArmy.length,
    onlineMatch,
  ]);

  useEffect(() => {
    if (!timerEnabled) return;
    if (!activeTimerColor) return;
    if (winner) return;
    if (phase === "SETUP") return;
    setTimerState((prev) => resetTurnClock(prev, activeTimerColor));
    if (!seizureAction) setTimeoutStatus(null);
  }, [
    timerEnabled,
    activeTimerColor,
    timerActionKey,
    phase,
    winner,
    seizureAction,
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

        if (result.timeout) triggerTimeoutSeizure();
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

  useEffect(() => {
    if (winner) return;
    if (whiteScore >= TARGET_SCORE) setWinner("WHITE");
    if (blackScore >= TARGET_SCORE) setWinner("BLACK");
  }, [whiteScore, blackScore, winner]);

  useEffect(() => {
    if (phase !== "INITIAL_SUPPORT") return;
    if (!pendingInitialSupportColor) return;

    const queue = initialSupportQueues[pendingInitialSupportColor];
    if (!queue || queue.length === 0) return;

    const availableSquares = getInitialSupportTargets();
    if (availableSquares.length > 0) return;

    sendManyToQueue(pendingInitialSupportColor, queue);
    setInitialSupportQueues((prev) => ({
      ...prev,
      [pendingInitialSupportColor]: [],
    }));
    finishInitialSupportStep();
  }, [phase, pendingInitialSupportColor, initialSupportQueues, pieces]);

  useEffect(() => {
    if (winner) return;
    if (phase !== "PLAYING") return;
    if (pendingInitialSupportColor) return;
    if (seizureAction) return;

    if (pendingSpawnColor && getSpawnTargets().length > 0) return;

    const activePieces = getActivePieces(currentTurn);
    const opponent = getOpponent(currentTurn);
    const currentArmy = getArmy(currentTurn);

    if (activePieces.length === 0) {
      if (currentArmy.length > 0) {
        const nextWhiteScore =
          opponent === "WHITE" ? whiteScore + SCORE_VALUES.ALL_OUT : whiteScore;

        const nextBlackScore =
          opponent === "BLACK" ? blackScore + SCORE_VALUES.ALL_OUT : blackScore;

        addMatchLog((meta) =>
          createAllOutLog({
            ...meta,
            scoringColor: opponent,
            targetColor: currentTurn,
            points: SCORE_VALUES.ALL_OUT,
            scoreAfter: getScoreSnapshot(nextWhiteScore, nextBlackScore),
          }),
        );

        const didWin = awardScore(opponent, SCORE_VALUES.ALL_OUT);
        if (didWin) return;

        requestSpawn(currentTurn, { force: true });

        if (currentTurn === "WHITE") {
          setWhiteMoves(0);
        } else {
          setBlackMoves(0);
        }
      } else {
        setCurrentTurn(opponent);
        restartActionClock();
      }

      clearSelection();
      return;
    }

    const hasLegalMove = teamHasAnyLegalMove(currentTurn);
    if (hasLegalMove) return;

    const nextWhiteScore =
      opponent === "WHITE" ? whiteScore + SCORE_VALUES.ALL_OUT : whiteScore;

    const nextBlackScore =
      opponent === "BLACK" ? blackScore + SCORE_VALUES.ALL_OUT : blackScore;

    addMatchLog((meta) =>
      createAllOutLog({
        ...meta,
        scoringColor: opponent,
        targetColor: currentTurn,
        points: SCORE_VALUES.ALL_OUT,
        scoreAfter: getScoreSnapshot(nextWhiteScore, nextBlackScore),
      }),
    );

    const didWin = awardScore(opponent, SCORE_VALUES.ALL_OUT);
    if (didWin) return;

    if (currentArmy.length > 0) {
      requestSpawn(currentTurn, { force: true });

      if (currentTurn === "WHITE") {
        setWhiteMoves(0);
      } else {
        setBlackMoves(0);
      }
    } else {
      setCurrentTurn(opponent);
      restartActionClock();
    }

    clearSelection();
  }, [
    currentTurn,
    pieces,
    phase,
    pendingSpawnColor,
    pendingInitialSupportColor,
    winner,
    whiteArmy,
    blackArmy,
    pendingHomeAttack,
    seizureAction,
  ]);

  function resetGame() {
    setSetupConfirmed(false);
    setTimerEnabled(false);
    setReserveOption(RESERVE_OPTIONS.NONE);
    setCustomReserveMinutes(5);
    setTimerState(createTimerState(0));
    setTimeoutStatus(null);
    setTimerActionKey(0);
    setSeizureAction(null);

    resetMatchLog();
    resetScoreSystem();
    resetSpawnSystem();
    resetDraft();

    setPieces([]);
    setSelectedPieceId(null);
    setLegalTargets([]);
    setCurrentTurn("WHITE");

    setWhiteMoves(0);
    setBlackMoves(0);

    setPhase("SETUP");
    setPendingInitialSupportColor(null);
    setInitialSupportQueues({ WHITE: [], BLACK: [] });

    resetHomes();
    setPendingPromotion(null);
    setOriginalWhiteArmy([]);
    setOriginalBlackArmy([]);
  }

  useEffect(() => {
    if (!onlineMatch) return;
    resetGame();
    setVariant(onlineMatch.variant ?? DEFAULT_VARIANT);
    setCustomPieces(
      onlineMatch.customPieces?.length ? onlineMatch.customPieces : null,
    );
    setTimerEnabled(Boolean(onlineMatch.timerEnabled));
    if (onlineMatch.reserveSeconds === 120)
      setReserveOption(RESERVE_OPTIONS.TWO_MIN);
    else if (onlineMatch.reserveSeconds === 300)
      setReserveOption(RESERVE_OPTIONS.FIVE_MIN);
    else if (onlineMatch.reserveSeconds > 0) {
      setReserveOption(RESERVE_OPTIONS.CUSTOM);
      setCustomReserveMinutes(onlineMatch.reserveSeconds / 60);
    }
    setSetupConfirmed(true);
  }, [onlineMatch?.matchId]);

  function handleAllOut(updatedPieces, capturedPiece = null) {
    const whiteAlive = updatedPieces.some(
      (piece) => piece.color === "WHITE" && piece.square !== null,
    );
    const blackAlive = updatedPieces.some(
      (piece) => piece.color === "BLACK" && piece.square !== null,
    );

    const whiteQueueCount =
      whiteArmy.length + (capturedPiece?.color === "WHITE" ? 1 : 0);
    const blackQueueCount =
      blackArmy.length + (capturedPiece?.color === "BLACK" ? 1 : 0);

    let newPieces = [...updatedPieces];

    if (!whiteAlive && whiteQueueCount > 0) {
      const nextBlackScore = blackScore + SCORE_VALUES.ALL_OUT;
      addMatchLog((meta) =>
        createAllOutLog({
          ...meta,
          scoringColor: "BLACK",
          targetColor: "WHITE",
          points: SCORE_VALUES.ALL_OUT,
          scoreAfter: getScoreSnapshot(whiteScore, nextBlackScore),
        }),
      );

      const didWin = awardScore("BLACK", SCORE_VALUES.ALL_OUT);
      if (didWin) return { piecesAfterAllOut: newPieces, winnerFound: true };

      requestSpawn("WHITE", { force: true });
      setWhiteMoves(0);
    }

    if (!blackAlive && blackQueueCount > 0) {
      const nextWhiteScore = whiteScore + SCORE_VALUES.ALL_OUT;
      addMatchLog((meta) =>
        createAllOutLog({
          ...meta,
          scoringColor: "WHITE",
          targetColor: "BLACK",
          points: SCORE_VALUES.ALL_OUT,
          scoreAfter: getScoreSnapshot(nextWhiteScore, blackScore),
        }),
      );

      const didWin = awardScore("WHITE", SCORE_VALUES.ALL_OUT);
      if (didWin) return { piecesAfterAllOut: newPieces, winnerFound: true };

      requestSpawn("BLACK", { force: true });
      setBlackMoves(0);
    }

    return { piecesAfterAllOut: newPieces, winnerFound: false };
  }

  function applyMoveCounter(color) {
    if (color === "WHITE") {
      const next = whiteMoves + 1;
      if (next >= MOVE_LIMIT) {
        requestSpawn("WHITE");
        setWhiteMoves(0);
      } else {
        setWhiteMoves(next);
      }
    }

    if (color === "BLACK") {
      const next = blackMoves + 1;
      if (next >= MOVE_LIMIT) {
        requestSpawn("BLACK");
        setBlackMoves(0);
      } else {
        setBlackMoves(next);
      }
    }
  }

  function getSoldierPromotionEligibleTypes() {
    const all = [...new Set([...originalWhiteArmy, ...originalBlackArmy])];
    return all.filter((type) => type !== "SOLDIER");
  }

  function isSoldierBackRank(piece, square) {
    if (piece.type !== "SOLDIER") return false;
    const rank = Number(square.slice(1));
    if (piece.color === "WHITE") return rank === 9;
    if (piece.color === "BLACK") return rank === 1;
    return false;
  }

  function resolveSoldierBackRankIfNeeded(
    selectedPiece,
    square,
    currentPieces,
  ) {
    if (!isSoldierBackRank(selectedPiece, square)) {
      return {
        piecesAfterSoldier: currentPieces,
        winnerFound: false,
        needsPromotion: false,
      };
    }

    setPendingPromotion({
      pieceId: selectedPiece.id,
      square,
      color: selectedPiece.color,
      piecesAfterMove: currentPieces,
    });

    return {
      piecesAfterSoldier: currentPieces,
      winnerFound: false,
      needsPromotion: true,
    };
  }

  function handlePromotion(promotedType) {
    if (!pendingPromotion) return;
    const { pieceId, square, color, piecesAfterMove } = pendingPromotion;

    let newPieces = piecesAfterMove.map((p) =>
      p.id === pieceId
        ? { ...p, type: promotedType, promotedFrom: "SOLDIER" }
        : p,
    );

    addMatchLog((meta) =>
      createPromotionLog({ ...meta, color, square, promotedType }),
    );

    const promotedPiece = newPieces.find((p) => p.id === pieceId);
    if (promotedPiece) createNewHomeClaimIfNeeded(promotedPiece, square);

    const allOutResult = handleAllOut(newPieces, null);
    newPieces = allOutResult.piecesAfterAllOut;

    applyMoveCounter(color);

    setPendingPromotion(null);
    setPieces(newPieces);
    clearSelection();

    if (!allOutResult.winnerFound) completeCurrentAction();
  }

  function applyAntelopeSwap(currentPieces, antelopePiece, targetSquare) {
    const enemyPiece = currentPieces.find(
      (piece) =>
        piece.square === targetSquare &&
        piece.color !== antelopePiece.color &&
        piece.type !== "WOLF",
    );

    if (!enemyPiece) return currentPieces;

    const antelopeOriginalSquare = antelopePiece.square;

    return currentPieces.map((piece) => {
      if (piece.id === antelopePiece.id) {
        return { ...piece, square: targetSquare, powerUsed: true };
      }
      if (piece.id === enemyPiece.id) {
        return { ...piece, square: antelopeOriginalSquare };
      }
      return piece;
    });
  }

  function handleSquareClick(square) {
    if (winner) return;

    if (onlineMatch?.assignedColor) {
      const expectedColor = seizureAction
        ? seizureAction.controller
        : actingColor;
      if (expectedColor && expectedColor !== onlineMatch.assignedColor) return;
    }

    if (pendingPromotion) return;

    if (pendingInitialSupportColor) {
      placeInitialSupportAt(square);
      return;
    }

    if (pendingSpawnColor && getSpawnTargets().length > 0) {
      spawnPendingPieceAt(square);
      return;
    }

    if (phase !== "PLAYING") return;

    const clickedPiece = pieces.find((piece) => piece.square === square);
    const selectedPiece = pieces.find((piece) => piece.id === selectedPieceId);
    const selectedTarget = legalTargets.find(
      (target) => target.square === square,
    );

    if (selectedPiece && selectedTarget) {
      if (
        selectedPiece.type === "ANTELOPE" &&
        selectedTarget.kind === "swap" &&
        !selectedPiece.powerUsed
      ) {
        const enemyPieceForSwap = pieces.find(
          (piece) =>
            piece.square === square && piece.color !== selectedPiece.color,
        );
        const antelopeOriginalSquare = selectedPiece.square;

        let newPieces = applyAntelopeSwap(pieces, selectedPiece, square);

        addMatchLog((meta) =>
          createAntelopeSwapLog({
            ...meta,
            controller: seizureAction?.controller || selectedPiece.color,
            actingColor: selectedPiece.color,
            antelopeFrom: antelopeOriginalSquare,
            antelopeTo: square,
            enemyPiece: enemyPieceForSwap,
          }),
        );

        const movedPiece = newPieces.find(
          (piece) => piece.id === selectedPiece.id,
        ) || {
          ...selectedPiece,
          square,
          powerUsed: true,
        };

        const claimResult = resolvePendingHomeClaim(movedPiece, newPieces);
        newPieces = claimResult.piecesAfterClaim;
        if (claimResult.winnerFound) {
          setPieces(newPieces);
          clearSelection();
          return;
        }

        createNewHomeClaimIfNeeded(movedPiece, movedPiece.square);
        applyMoveCounter(selectedPiece.color);

        setPieces(newPieces);
        clearSelection();
        completeCurrentAction();
        return;
      }

      const originalSquare = selectedPiece.square;
      const capturedPiece = pieces.find(
        (piece) =>
          piece.square === square && piece.color !== selectedPiece.color,
      );

      let newPieces = applyMove(pieces, selectedPiece, square);

      if (capturedPiece) {
        addMatchLog((meta) =>
          createCaptureLog({
            ...meta,
            actor: selectedPiece.color,
            controller: seizureAction?.controller || selectedPiece.color,
            actingColor: selectedPiece.color,
            piece: selectedPiece.type,
            from: originalSquare,
            to: square,
            capturedPiece,
          }),
        );
        sendToQueue(capturedPiece);
      } else {
        addMatchLog((meta) =>
          createMoveLog({
            ...meta,
            actor: selectedPiece.color,
            controller: seizureAction?.controller || selectedPiece.color,
            actingColor: selectedPiece.color,
            piece: selectedPiece.type,
            from: originalSquare,
            to: square,
          }),
        );
      }

      const moved = originalSquare !== square;

      const movedPiece = newPieces.find(
        (piece) => piece.id === selectedPiece.id,
      ) || { ...selectedPiece, square };

      const claimResult = resolvePendingHomeClaim(movedPiece, newPieces);
      newPieces = claimResult.piecesAfterClaim;
      if (claimResult.winnerFound) {
        setPieces(newPieces);
        clearSelection();
        return;
      }

      const soldierResult = resolveSoldierBackRankIfNeeded(
        movedPiece,
        square,
        newPieces,
      );
      newPieces = soldierResult.piecesAfterSoldier;

      if (soldierResult.winnerFound) {
        setPieces(newPieces);
        clearSelection();
        return;
      }

      if (soldierResult.needsPromotion) {
        setPieces(newPieces);
        clearSelection();
        return;
      }

      if (moved) {
        createNewHomeClaimIfNeeded(movedPiece, square);
      }

      const allOutResult = handleAllOut(newPieces, capturedPiece);
      newPieces = allOutResult.piecesAfterAllOut;

      if (allOutResult.winnerFound) {
        setPieces(newPieces);
        clearSelection();
        return;
      }

      const whiteAliveAfter = newPieces.some(
        (piece) => piece.color === "WHITE" && piece.square !== null,
      );

      const blackAliveAfter = newPieces.some(
        (piece) => piece.color === "BLACK" && piece.square !== null,
      );

      const causedAllOut = !whiteAliveAfter || !blackAliveAfter;

      if (!causedAllOut) {
        applyMoveCounter(selectedPiece.color);
      }

      setPieces(newPieces);
      clearSelection();
      completeCurrentAction();
      return;
    }

    if (clickedPiece) {
      if (clickedPiece.color !== actingColor) return;

      const localColor = onlineMatch?.assignedColor || "WHITE";
      if (onlineMatch?.assignedColor && clickedPiece.color !== localColor)
        return;

      if (pendingHomeAttack && clickedPiece.id === pendingHomeAttack.pieceId) {
        return;
      }

      setSelectedPieceId(clickedPiece.id);
      setLegalTargets(
        getLegalTargets(clickedPiece, pieces, {
          teamMoveCount: getMoves(clickedPiece.color),
          moveLimit: MOVE_LIMIT,
        }),
      );
      return;
    }

    clearSelection();
  }

  const spawnTargets =
    pendingSpawnColor && getSpawnTargets().length > 0 ? getSpawnTargets() : [];
  const boardLegalTargets = pendingInitialSupportColor
    ? getInitialSupportTargets()
    : spawnTargets.length > 0
      ? spawnTargets
      : legalTargets;

  function handleRemoteMatchMessage(message) {
    if (
      message.type !== "SNAPSHOT" ||
      message.actorColor === onlineMatch?.assignedColor
    )
      return;
    const snapshot = message.payload;
    if (!snapshot || typeof snapshot !== "object") return;

    remoteUpdateRef.current = true;
    setPieces(snapshot.pieces ?? []);
    setWhiteArmy(snapshot.whiteArmy ?? []);
    setBlackArmy(snapshot.blackArmy ?? []);
    setWhiteReady(Boolean(snapshot.whiteReady));
    setBlackReady(Boolean(snapshot.blackReady));
    setWhiteScore(snapshot.whiteScore ?? 0);
    setBlackScore(snapshot.blackScore ?? 0);
    setWhiteMoves(snapshot.whiteMoves ?? 0);
    setBlackMoves(snapshot.blackMoves ?? 0);
    setCurrentTurn(snapshot.currentTurn ?? "WHITE");
    setPhase(snapshot.phase ?? "SETUP");
    setPendingInitialSupportColor(snapshot.pendingInitialSupportColor ?? null);
    setInitialSupportQueues(
      snapshot.initialSupportQueues ?? { WHITE: [], BLACK: [] },
    );
    setPendingSpawnColor(snapshot.pendingSpawnColor ?? null);
    setPendingSpawnQueue(snapshot.pendingSpawnQueue ?? []);
    setWinner(snapshot.winner ?? null);
    setWhiteHome(snapshot.whiteHome ?? null);
    setBlackHome(snapshot.blackHome ?? null);
    setSelectedPieceId(null);
    setLegalTargets([]);
    setTimeout(() => {
      remoteUpdateRef.current = false;
    }, 0);
  }

  const { status: socketStatus, send: sendMatchAction } = useMatchSocket(
    onlineMatch?.matchId,
    handleRemoteMatchMessage,
  );

  useEffect(() => {
    if (!onlineMatch?.matchId || socketStatus !== "connected") return;
    sendMatchAction({
      version: 1,
      type: "PLAYER_CONNECTED",
      matchId: onlineMatch.matchId,
      actorColor: onlineMatch.assignedColor,
      actionId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      sequence: 0,
      phase,
      payload: { roomCode: onlineMatch.roomCode },
    });
  }, [onlineMatch?.matchId, socketStatus]);

  useEffect(() => {
    if (
      !onlineMatch?.matchId ||
      socketStatus !== "connected" ||
      remoteUpdateRef.current
    )
      return;
    sendMatchAction({
      version: 1,
      type: "SNAPSHOT",
      matchId: onlineMatch.matchId,
      actorColor: onlineMatch.assignedColor,
      actionId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      sequence: Date.now(),
      phase,
      payload: {
        phase,
        pieces,
        whiteArmy,
        blackArmy,
        whiteReady,
        blackReady,
        whiteScore,
        blackScore,
        whiteMoves,
        blackMoves,
        currentTurn,
        winner,
        whiteHome,
        blackHome,
        pendingInitialSupportColor,
        initialSupportQueues,
        pendingSpawnColor,
        pendingSpawnQueue,
      },
    });
  }, [
    pieces,
    whiteArmy,
    blackArmy,
    whiteReady,
    blackReady,
    whiteScore,
    blackScore,
    whiteMoves,
    blackMoves,
    currentTurn,
    phase,
    winner,
    whiteHome,
    blackHome,
    pendingInitialSupportColor,
    initialSupportQueues,
    pendingSpawnColor,
    pendingSpawnQueue,
    onlineMatch?.matchId,
    socketStatus,
  ]);

  const localColor = onlineMatch?.assignedColor || "WHITE";

  return {
    variant,
    setVariant,
    customPieces,
    setCustomPieces,
    setupConfirmed,
    setSetupConfirmed,

    timerEnabled,
    setTimerEnabled,
    reserveOption,
    setReserveOption,
    customReserveMinutes,
    setCustomReserveMinutes,
    RESERVE_OPTIONS,
    formatClock,
    currentReserveSeconds: getCurrentReserveSeconds(),
    hasReserveEnabled,
    timerState,
    activeTimerColor,
    seizureAction,
    timeoutStatus,

    matchLog,
    isMatchLogOpen,
    openMatchLog,
    closeMatchLog,
    copyMatchLogText,

    pieces,
    selectedPieceId,
    boardLegalTargets,
    handleSquareClick,
    whiteHome,
    blackHome,
    isFlipped: localColor === "BLACK",

    whiteArmy,
    blackArmy,
    whiteReady,
    blackReady,
    setWhiteReady,
    setBlackReady,
    rollPiece,
    moveUp,
    moveDown,
    getQueueLabel,
    calculateMaterialTotal,
    isDraftComplete,

    whiteScore,
    blackScore,
    whiteMoves,
    blackMoves,
    MOVE_LIMIT,
    isGameStarted,

    pendingInitialSupportColor,
    initialSupportQueues,
    pendingSpawnColor,
    getSpawnTargets,
    pendingHomeAttack,

    pendingPromotion,
    getSoldierPromotionEligibleTypes,
    handlePromotion,

    winner,
    resetGame,

    socketStatus,
    onlineMatch,
    localColor,
  };
}

export default useGameController;
