import { useState, useEffect, useRef } from "react";
import Board from "./components/board/Board.jsx";

import { getLegalTargets } from "./engine/moveEngine.js";
import { applyMove, switchTurn } from "./engine/gameEngine.js";
import { PIECE_CATALOG } from "./engine/pieceCatalog.js";
import { createHomeClaim, resolveHomeClaim } from "./engine/homeClaimEngine.js";
import { TARGET_SCORE, SCORE_VALUES } from "./engine/scoreEngine.js";

import {
  RESERVE_OPTIONS,
  createTimerState,
  getReserveSeconds,
  resetTurnClock,
  tickChamberTimer,
  formatClock,
} from "./engine/timerEngine.js";

import {
  createNormalAction,
  createTimeoutSeizureAction,
} from "./engine/seizureEngine.js";

import {
  createGameStartLog,
  createInitialSupportLog,
  createSpawnLog,
  createMoveLog,
  createCaptureLog,
  createAntelopeSwapLog,
  createHomeClaimCreatedLog,
  createHomeClaimDefendedLog,
  createHomeClaimSuccessLog,
  createSoldierScoreLog,
  createPromotionLog,
  createAllOutLog,
  createTimeoutLog,
  createSeizureStartLog,
  createSeizureCompleteLog,
  createWinLog,
} from "./engine/matchLogEngine.js";

import { DEFAULT_VARIANT } from "./constants/variantConfig.js";
import {
  MOVE_LIMIT,
  getLaunchPads,
  getSupportSpawnSquares,
  isSupportType,
} from "./constants/boardConfig.js";

import useDraftSystem from "./hooks/useDraftSystem.js";
import useMatchLog from "./hooks/useMatchLog.js";
import useScoreSystem from "./hooks/useScoreSystem.js";
import useSpawnSystem from "./hooks/useSpawnSystem.js";
import useHomeSystem from "./hooks/useHomeSystem.js";
import useAuthSession from "./hooks/useAuthSession.js";
import useMatchSocket from "./hooks/useMatchSocket.js";

import SidePanel from "./components/panels/SidePanel.jsx";
import TimerSetupPanel from "./components/panels/TimerSetupPanel.jsx";
import VariantSetupPanel from "./components/panels/VariantSetupPanel.jsx";
import MatchLogButton from "./components/panels/MatchLogButton.jsx";
import MatchLogModal from "./components/panels/MatchLogModal.jsx";
import WinnerModal from "./components/panels/WinnerModal.jsx";
import PromotionModal from "./components/panels/PromotionModal.jsx";

import AuthScreen from "./screens/AuthScreen.jsx";
import MainMenuScreen from "./screens/MainMenuScreen.jsx";
import MatchmakerScreen from "./screens/MatchmakerScreen.jsx";
import MatchHistoryScreen from "./screens/MatchHistoryScreen.jsx";

function App() {
  const authSession = useAuthSession();
  const [currentScreen, setCurrentScreen] = useState(() => {
    return localStorage.getItem("arohana_session") ? "MENU" : "AUTH";
  });
  const [onlineMatch, setOnlineMatch] = useState(null);
  const remoteUpdateRef = useRef(false);
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

  // ╔══════════════════════╗
  // ✅ VARIANT STATE
  // ╚══════════════════════╝
  const [variant, setVariant] = useState(DEFAULT_VARIANT);
  const [customPieces, setCustomPieces] = useState(null);
  const [setupConfirmed, setSetupConfirmed] = useState(false);

  // ╔══════════════════════╗
  // ✅ DRAFT / BENCH SYSTEM
  // ╚══════════════════════╝
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
    canSetReady,
  } = useDraftSystem({ variant, customPieces });

  // ╔══════════════════════╗
  // ✅ MATCH LOG SYSTEM
  // ╚══════════════════════╝
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

  // ╔══════════════════════╗
  // ✅ SCORE SYSTEM
  // ╚══════════════════════╝
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
  } = useScoreSystem({
    targetScore: TARGET_SCORE,
  });

  // ╔══════════════════════╗
  // ✅ CORE GAME STATE
  // ╚══════════════════════╝
  const [pieces, setPieces] = useState([]);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("WHITE");

  const [whiteMoves, setWhiteMoves] = useState(0);
  const [blackMoves, setBlackMoves] = useState(0);

  // SETUP | INITIAL_SUPPORT | PLAYING
  const [phase, setPhase] = useState("SETUP");
  const isGameStarted = phase !== "SETUP";

  // ╔══════════════════════╗
  // ✅ TIMER / SEIZURE STATE
  // ╚══════════════════════╝
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [reserveOption, setReserveOption] = useState(RESERVE_OPTIONS.NONE);
  const [customReserveMinutes, setCustomReserveMinutes] = useState(5);

  const [timerState, setTimerState] = useState(() => createTimerState(0));
  const [timeoutStatus, setTimeoutStatus] = useState(null);
  const [timerActionKey, setTimerActionKey] = useState(0);
  const [seizureAction, setSeizureAction] = useState(null);

  // ╔══════════════════════╗
  // ✅ INITIAL SUPPORT STATE
  // ╚══════════════════════╝
  const [pendingInitialSupportColor, setPendingInitialSupportColor] =
    useState(null);

  const [initialSupportQueues, setInitialSupportQueues] = useState({
    WHITE: [],
    BLACK: [],
  });

  // ╔══════════════════════╗
  // ✅ PROMOTION STATE
  // ╚══════════════════════╝
  // When a Soldier reaches the enemy back rank, we store the pending
  // promotion here and show a modal. The board action is paused.
  const [pendingPromotion, setPendingPromotion] = useState(null);
  // null | { pieceId, square, color, piecesAfterMove }

  // Original armies saved at game start — used to build the promotion pool
  const [originalWhiteArmy, setOriginalWhiteArmy] = useState([]);
  const [originalBlackArmy, setOriginalBlackArmy] = useState([]);

  // ╔══════════════════════╗
  // ✅ HOME SYSTEM HOOK
  // ╚══════════════════════╝
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
    createHomeClaimCreatedLog,
    createHomeClaimDefendedLog,
    createHomeClaimSuccessLog,
    createWinLog,
    setWinner,
    setWhiteScore,
    setBlackScore,
    sendToQueue,
    TARGET_SCORE,
    SCORE_VALUES,
  });

  // ╔══════════════════════╗
  // ✅ BASIC HELPERS
  // ╚══════════════════════╝
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

  // ╔══════════════════════╗
  // ✅ MATCH LOG HELPERS
  // ╚══════════════════════╝
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

  function logWinIfNeeded(color, nextWhiteScore, nextBlackScore) {
    addMatchLog((meta) =>
      createWinLog({
        ...meta,
        winner: color,
        whiteScore: nextWhiteScore,
        blackScore: nextBlackScore,
      }),
    );
  }

  function addSpawnLog(details) {
    addMatchLog((meta) =>
      createSpawnLog({
        ...meta,
        ...details,
      }),
    );
  }

  // ╔══════════════════════╗
  // ✅ ACTION CLOCK
  // ╚══════════════════════╝
  function restartActionClock() {
    setTimerActionKey((prev) => prev + 1);
  }

  // ╔══════════════════════╗
  // ✅ SPAWN SYSTEM
  // ╚══════════════════════╝
  const {
    pendingSpawnColor,
    setPendingSpawnColor,

    pendingSpawnQueue,
    setPendingSpawnQueue,

    initialSpawnOrder,
    setInitialSpawnOrder,

    requestSpawn,
    getSpawnTargets,
    spawnPendingPieceAt,

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
    addSpawnLog,
  });

  // ╔══════════════════════╗
  // ✅ TIMER / SEIZURE HELPERS
  // ╚══════════════════════╝
  function getCurrentReserveSeconds() {
    return getReserveSeconds(reserveOption, customReserveMinutes);
  }

  function hasReserveEnabled() {
    return getCurrentReserveSeconds() > 0;
  }

  function getActingColor() {
    if (seizureAction) {
      return seizureAction.actingColor;
    }

    if (phase === "INITIAL_SUPPORT") {
      return pendingInitialSupportColor;
    }

    if (phase === "PLAYING") {
      if (pendingSpawnColor && getSpawnTargets().length > 0) {
        return pendingSpawnColor;
      }

      return currentTurn;
    }

    return null;
  }

  function getControllerColor() {
    if (!timerEnabled) return null;
    if (winner) return null;

    if (seizureAction) {
      return seizureAction.controller;
    }

    if (phase === "INITIAL_SUPPORT") {
      return pendingInitialSupportColor;
    }

    if (phase === "PLAYING") {
      if (pendingSpawnColor && getSpawnTargets().length > 0) {
        return pendingSpawnColor;
      }

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

  // ╔══════════════════════╗
  // ✅ SCORE HELPERS
  // ╚══════════════════════╝
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

        logWinIfNeeded(winningColor, nextWhiteScore, nextBlackScore);
      },
    });
  }

  // Relocated home functions are now handled by useHomeSystem hook.

  // ╔══════════════════════╗
  // ✅ INITIAL SUPPORT
  // ╚══════════════════════╝
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

        for (let i = 0; i < count; i++) {
          supportUnits.push(type);
        }
      } else {
        normalQueue.push(type);
      }
    }

    return {
      supportUnits,
      normalQueue,
    };
  }

  function getInitialSupportTargets() {
    if (!pendingInitialSupportColor) return [];

    return getSupportSpawnSquares(pendingInitialSupportColor)
      .filter((square) => !pieces.some((piece) => piece.square === square))
      .map((square) => ({
        square,
        kind: "move",
      }));
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

    if (pendingInitialSupportColor === "WHITE") {
      setInitialSupportQueues((prev) => ({
        ...prev,
        WHITE: remainingQueue,
      }));
    }

    if (pendingInitialSupportColor === "BLACK") {
      setInitialSupportQueues((prev) => ({
        ...prev,
        BLACK: remainingQueue,
      }));
    }

    if (remainingQueue.length === 0) {
      finishInitialSupportStep();
    }
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

  // ╔══════════════════════╗
  // ✅ START / COMPENSATION
  // ╚══════════════════════╝
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

    // Save original armies for the promotion pool
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

    if (compensation.weaker === "WHITE") {
      setWhiteMoves(compensation.remainder);
    }

    if (compensation.weaker === "BLACK") {
      setBlackMoves(compensation.remainder);
    }

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
    setInitialSpawnOrder([]);
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

  // ╔══════════════════════╗
  // ✅ EFFECTS
  // ╚══════════════════════╝
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

  useEffect(() => {
    if (winner) return;

    if (whiteScore >= TARGET_SCORE) {
      setWinner("WHITE");
    }

    if (blackScore >= TARGET_SCORE) {
      setWinner("BLACK");
    }
  }, [whiteScore, blackScore, winner]);

  useEffect(() => {
    if (phase !== "INITIAL_SUPPORT") return;
    if (!pendingInitialSupportColor) return;

    const queue = initialSupportQueues[pendingInitialSupportColor];

    if (!queue || queue.length === 0) return;

    const availableSquares = getInitialSupportTargets();

    if (availableSquares.length > 0) return;

    sendManyToQueue(pendingInitialSupportColor, queue);

    if (pendingInitialSupportColor === "WHITE") {
      setInitialSupportQueues((prev) => ({
        ...prev,
        WHITE: [],
      }));
    }

    if (pendingInitialSupportColor === "BLACK") {
      setInitialSupportQueues((prev) => ({
        ...prev,
        BLACK: [],
      }));
    }

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

  // ╔══════════════════════╗
  // ✅ RESET
  // ╚══════════════════════╝
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
    setInitialSupportQueues({
      WHITE: [],
      BLACK: [],
    });

    resetHomes();
    setPendingPromotion(null);
    setOriginalWhiteArmy([]);
    setOriginalBlackArmy([]);
  }

  function enterInviteMatch(room) {
    resetGame();
    setOnlineMatch(room);
    setVariant(room.variant ?? DEFAULT_VARIANT);
    setCustomPieces(room.customPieces?.length ? room.customPieces : null);
    setTimerEnabled(Boolean(room.timerEnabled));
    if (room.reserveSeconds === 120) setReserveOption(RESERVE_OPTIONS.TWO_MIN);
    else if (room.reserveSeconds === 300)
      setReserveOption(RESERVE_OPTIONS.FIVE_MIN);
    else if (room.reserveSeconds > 0) {
      setReserveOption(RESERVE_OPTIONS.CUSTOM);
      setCustomReserveMinutes(room.reserveSeconds / 60);
    }
    setSetupConfirmed(true);
    setCurrentScreen("GAME");
  }

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

  // ╔══════════════════════╗
  // ✅ ALL-OUT / MOVE COUNTERS
  // ╚══════════════════════╝
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

      if (didWin) {
        return {
          piecesAfterAllOut: newPieces,
          winnerFound: true,
        };
      }

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

      if (didWin) {
        return {
          piecesAfterAllOut: newPieces,
          winnerFound: true,
        };
      }

      requestSpawn("BLACK", { force: true });
      setBlackMoves(0);
    }

    return {
      piecesAfterAllOut: newPieces,
      winnerFound: false,
    };
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

  // ╔══════════════════════╗
  // ✅ SOLDIER PROMOTION
  // ╚══════════════════════╝
  //
  // When a Soldier reaches the enemy back rank, the old score-and-return
  // mechanic is replaced by permanent promotion. The Soldier's type is
  // changed for the rest of the match. When captured, it returns to the
  // bench as the promoted type.

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

  // Returns { needsPromotion: true } if soldier reached back rank.
  // Returns { piecesAfterSoldier, soldierScored, winnerFound } for other cases.
  function resolveSoldierBackRankIfNeeded(
    selectedPiece,
    square,
    currentPieces,
  ) {
    if (!isSoldierBackRank(selectedPiece, square)) {
      return {
        piecesAfterSoldier: currentPieces,
        soldierScored: false,
        winnerFound: false,
        needsPromotion: false,
      };
    }

    // Promotion: store state and show modal — do not advance turn yet
    setPendingPromotion({
      pieceId: selectedPiece.id,
      square,
      color: selectedPiece.color,
      piecesAfterMove: currentPieces,
    });

    return {
      piecesAfterSoldier: currentPieces,
      soldierScored: false,
      winnerFound: false,
      needsPromotion: true,
    };
  }

  function handlePromotion(promotedType) {
    if (!pendingPromotion) return;

    const { pieceId, square, color, piecesAfterMove } = pendingPromotion;

    // Transform the Soldier permanently into the chosen type
    let newPieces = piecesAfterMove.map((p) =>
      p.id === pieceId
        ? { ...p, type: promotedType, promotedFrom: "SOLDIER" }
        : p,
    );

    addMatchLog((meta) =>
      createPromotionLog({
        ...meta,
        color,
        square,
        promotedType,
      }),
    );

    // Check if the promoted piece is now on a home square
    const promotedPiece = newPieces.find((p) => p.id === pieceId);
    if (promotedPiece) {
      createNewHomeClaimIfNeeded(promotedPiece, square);
    }

    const allOutResult = handleAllOut(newPieces, null);
    newPieces = allOutResult.piecesAfterAllOut;

    applyMoveCounter(color);

    setPendingPromotion(null);
    setPieces(newPieces);
    clearSelection();

    if (!allOutResult.winnerFound) {
      completeCurrentAction();
    }
  }

  // Home claim resolution functions are now encapsulated in the useHomeSystem hook.

  // ╔══════════════════════╗
  // ✅ ANTELOPE SWAP
  // ╚══════════════════════╝
  function applyAntelopeSwap(currentPieces, antelopePiece, targetSquare) {
    const enemyPiece = currentPieces.find(
      (piece) =>
        piece.square === targetSquare &&
        piece.color !== antelopePiece.color &&
        piece.type !== "WOLF",
    );

    if (!enemyPiece) {
      return currentPieces;
    }

    const antelopeOriginalSquare = antelopePiece.square;

    return currentPieces.map((piece) => {
      if (piece.id === antelopePiece.id) {
        return {
          ...piece,
          square: targetSquare,
          powerUsed: true,
        };
      }

      if (piece.id === enemyPiece.id) {
        return {
          ...piece,
          square: antelopeOriginalSquare,
        };
      }

      return piece;
    });
  }

  // ╔══════════════════════╗
  // ✅ MAIN CLICK LOGIC
  // ╚══════════════════════╝

  function handleSquareClick(square) {
    if (winner) return;

    // Strict enforcement: A player can ONLY act on their own turn/phase.
    if (onlineMatch?.assignedColor) {
      // activeTimerColor controls seizures. If a seizure is happening, the controller can click.
      // Otherwise, actingColor is the one who should be making the move/spawn/support.
      const expectedColor = seizureAction
        ? seizureAction.controller
        : actingColor;
      if (expectedColor && expectedColor !== onlineMatch.assignedColor) {
        return;
      }
    }

    // Promotion modal is blocking — no board clicks until resolved
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
      ) || {
        ...selectedPiece,
        square,
      };

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
        // Modal shown — board is frozen until player selects promotion type
        setPieces(newPieces);
        clearSelection();
        return;
      }

      if (moved && !soldierResult.soldierScored) {
        const stillExistingMovedPiece =
          newPieces.find((piece) => piece.id === selectedPiece.id) ||
          movedPiece;

        createNewHomeClaimIfNeeded(stillExistingMovedPiece, square);
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

      if (!causedAllOut && !soldierResult.soldierScored) {
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

  if (currentScreen === "AUTH") {
    return (
      <AuthScreen
        onAuth={(session) => {
          authSession.login(session);
          setCurrentScreen("MENU");
        }}
      />
    );
  }

  if (currentScreen === "MENU") {
    return (
      <MainMenuScreen
        session={authSession.session}
        onPlayLocal={() => {
          resetGame();
          setCurrentScreen("GAME");
        }}
        onPlayOnline={() => setCurrentScreen("MATCHMAKER")}
        onViewHistory={() => setCurrentScreen("HISTORY")}
        onLogout={() => {
          authSession.logout();
          setCurrentScreen("AUTH");
        }}
        onLogin={() => setCurrentScreen("AUTH")}
      />
    );
  }

  if (currentScreen === "MATCHMAKER") {
    return (
      <MatchmakerScreen
        token={authSession.token}
        session={authSession.session}
        onBack={() => setCurrentScreen("MENU")}
        onMatchFound={enterInviteMatch}
      />
    );
  }

  if (currentScreen === "HISTORY") {
    return (
      <MatchHistoryScreen
        token={authSession.token}
        onBack={() => setCurrentScreen("MENU")}
      />
    );
  }

  const localColor = onlineMatch?.assignedColor || "WHITE";

  return (
    <main className="relative h-dvh w-full bg-slate-900 text-white overflow-hidden flex flex-col">
      {/* Back to main menu header button in game */}
      <div className="absolute top-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setCurrentScreen("MENU")}
          className="rounded-lg bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
        >
          Exit to Menu
        </button>
      </div>

      <VariantSetupPanel
        isGameStarted={isGameStarted}
        isConfirmed={setupConfirmed}
        variant={variant}
        setVariant={setVariant}
        customPieces={customPieces}
        setCustomPieces={setCustomPieces}
        onConfirm={() => setSetupConfirmed(true)}
      />

      <TimerSetupPanel
        isGameStarted={isGameStarted}
        isConfirmed={setupConfirmed}
        timerEnabled={timerEnabled}
        setTimerEnabled={setTimerEnabled}
        reserveOption={reserveOption}
        setReserveOption={setReserveOption}
        customReserveMinutes={customReserveMinutes}
        setCustomReserveMinutes={setCustomReserveMinutes}
        RESERVE_OPTIONS={RESERVE_OPTIONS}
        formatClock={formatClock}
        currentReserveSeconds={getCurrentReserveSeconds()}
        onConfirm={() => setSetupConfirmed(true)}
      />

      {onlineMatch && (
        <div className="absolute left-3 top-4 z-30 rounded-full border border-cyan-400/30 bg-slate-950/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
          Room {onlineMatch.roomCode} · {socketStatus}
        </div>
      )}

      {isGameStarted ? (
        <div className="mx-auto flex h-fit w-full max-w-[480px] flex-col gap-0.5 px-2 pt-14 md:pt-0">
          {/* Opponent panel (top) — black on top, like chess.com/lichess */}
          <section aria-label="Opponent panel" className="flex-shrink-0">
            <SidePanel
              color={localColor === "WHITE" ? "BLACK" : "WHITE"}
              army={localColor === "WHITE" ? blackArmy : whiteArmy}
              isReady={localColor === "WHITE" ? blackReady : whiteReady}
              setReady={localColor === "WHITE" ? setBlackReady : setWhiteReady}
              score={localColor === "WHITE" ? blackScore : whiteScore}
              moves={localColor === "WHITE" ? blackMoves : whiteMoves}
              MOVE_LIMIT={MOVE_LIMIT}
              isGameStarted={isGameStarted}
              isWhitePanel={localColor !== "WHITE"}
              whiteArmy={whiteArmy}
              blackArmy={blackArmy}
              rollPiece={rollPiece}
              moveUp={moveUp}
              moveDown={moveDown}
              getQueueLabel={getQueueLabel}
              calculateMaterialTotal={calculateMaterialTotal}
              timerEnabled={timerEnabled}
              activeTimerColor={activeTimerColor}
              timerState={timerState}
              hasReserveEnabled={hasReserveEnabled}
              formatClock={formatClock}
              seizureAction={seizureAction}
              timeoutStatus={timeoutStatus}
              pendingInitialSupportColor={pendingInitialSupportColor}
              initialSupportQueues={initialSupportQueues}
              pendingSpawnColor={pendingSpawnColor}
              getSpawnTargets={getSpawnTargets}
              pendingHomeAttack={pendingHomeAttack}
              isDraftComplete={isDraftComplete}
              readOnly={true}
            />
          </section>

          {/* Board (center) — hero; launch-row gaps show turn/reserve clocks */}
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Board
              pieces={pieces}
              selectedPieceId={selectedPieceId}
              legalTargets={boardLegalTargets}
              onSquareClick={handleSquareClick}
              whiteHome={whiteHome}
              blackHome={blackHome}
              isFlipped={localColor === "BLACK"}
              timerEnabled={timerEnabled}
              timerState={timerState}
              hasReserveEnabled={hasReserveEnabled}
              formatClock={formatClock}
              activeTimerColor={activeTimerColor}
              topColor={localColor === "WHITE" ? "BLACK" : "WHITE"}
              bottomColor={localColor}
            />
          </div>

          {/* Player panel (bottom) — white/player on bottom */}
          <section aria-label="Your player panel" className="flex-shrink-0">
            <SidePanel
              color={localColor}
              army={localColor === "WHITE" ? whiteArmy : blackArmy}
              isReady={localColor === "WHITE" ? whiteReady : blackReady}
              setReady={localColor === "WHITE" ? setWhiteReady : setBlackReady}
              score={localColor === "WHITE" ? whiteScore : blackScore}
              moves={localColor === "WHITE" ? whiteMoves : blackMoves}
              MOVE_LIMIT={MOVE_LIMIT}
              isGameStarted={isGameStarted}
              isWhitePanel={localColor === "WHITE"}
              whiteArmy={whiteArmy}
              blackArmy={blackArmy}
              rollPiece={rollPiece}
              moveUp={moveUp}
              moveDown={moveDown}
              getQueueLabel={getQueueLabel}
              calculateMaterialTotal={calculateMaterialTotal}
              timerEnabled={timerEnabled}
              activeTimerColor={activeTimerColor}
              timerState={timerState}
              hasReserveEnabled={hasReserveEnabled}
              formatClock={formatClock}
              seizureAction={seizureAction}
              timeoutStatus={timeoutStatus}
              pendingInitialSupportColor={pendingInitialSupportColor}
              initialSupportQueues={initialSupportQueues}
              pendingSpawnColor={pendingSpawnColor}
              getSpawnTargets={getSpawnTargets}
              pendingHomeAttack={pendingHomeAttack}
              isDraftComplete={isDraftComplete}
              readOnly={false}
            />
          </section>

          {/* Existing Match Log button — placed at the bottom, single row,
              shows the latest event; clicking opens the full match log modal */}
          <div className="flex-shrink-0">
            <MatchLogButton
              isGameStarted={isGameStarted}
              matchLog={matchLog}
              onOpen={openMatchLog}
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-[1500px] gap-3 px-2 pt-14 md:h-full md:grid-cols-[260px_minmax(0,1fr)_260px] md:items-center md:gap-4 md:px-4 md:pt-0">
          <section
            aria-label="Opponent panel"
            className="order-1 flex flex-col justify-center min-w-0"
          >
            <SidePanel
              color={localColor === "WHITE" ? "BLACK" : "WHITE"}
              army={localColor === "WHITE" ? blackArmy : whiteArmy}
              isReady={localColor === "WHITE" ? blackReady : whiteReady}
              setReady={localColor === "WHITE" ? setBlackReady : setWhiteReady}
              score={localColor === "WHITE" ? blackScore : whiteScore}
              moves={localColor === "WHITE" ? blackMoves : whiteMoves}
              MOVE_LIMIT={MOVE_LIMIT}
              isGameStarted={isGameStarted}
              isWhitePanel={localColor !== "WHITE"}
              whiteArmy={whiteArmy}
              blackArmy={blackArmy}
              rollPiece={rollPiece}
              moveUp={moveUp}
              moveDown={moveDown}
              getQueueLabel={getQueueLabel}
              calculateMaterialTotal={calculateMaterialTotal}
              timerEnabled={timerEnabled}
              activeTimerColor={activeTimerColor}
              timerState={timerState}
              hasReserveEnabled={hasReserveEnabled}
              formatClock={formatClock}
              seizureAction={seizureAction}
              timeoutStatus={timeoutStatus}
              pendingInitialSupportColor={pendingInitialSupportColor}
              initialSupportQueues={initialSupportQueues}
              pendingSpawnColor={pendingSpawnColor}
              getSpawnTargets={getSpawnTargets}
              pendingHomeAttack={pendingHomeAttack}
              isDraftComplete={isDraftComplete}
              readOnly={false}
            />
          </section>

          <div className="order-2 flex min-w-0 items-center justify-center py-1 md:py-0">
            <Board
              pieces={pieces}
              selectedPieceId={selectedPieceId}
              legalTargets={boardLegalTargets}
              onSquareClick={handleSquareClick}
              whiteHome={whiteHome}
              blackHome={blackHome}
              isFlipped={localColor === "BLACK"}
            />
          </div>

          <section
            aria-label="Your player panel"
            className="order-3 flex flex-col justify-center min-w-0"
          >
            <SidePanel
              color={localColor}
              army={localColor === "WHITE" ? whiteArmy : blackArmy}
              isReady={localColor === "WHITE" ? whiteReady : blackReady}
              setReady={localColor === "WHITE" ? setWhiteReady : setBlackReady}
              score={localColor === "WHITE" ? whiteScore : blackScore}
              moves={localColor === "WHITE" ? whiteMoves : blackMoves}
              MOVE_LIMIT={MOVE_LIMIT}
              isGameStarted={isGameStarted}
              isWhitePanel={localColor === "WHITE"}
              whiteArmy={whiteArmy}
              blackArmy={blackArmy}
              rollPiece={rollPiece}
              moveUp={moveUp}
              moveDown={moveDown}
              getQueueLabel={getQueueLabel}
              calculateMaterialTotal={calculateMaterialTotal}
              timerEnabled={timerEnabled}
              activeTimerColor={activeTimerColor}
              timerState={timerState}
              hasReserveEnabled={hasReserveEnabled}
              formatClock={formatClock}
              seizureAction={seizureAction}
              timeoutStatus={timeoutStatus}
              pendingInitialSupportColor={pendingInitialSupportColor}
              initialSupportQueues={initialSupportQueues}
              pendingSpawnColor={pendingSpawnColor}
              getSpawnTargets={getSpawnTargets}
              pendingHomeAttack={pendingHomeAttack}
              isDraftComplete={isDraftComplete}
              readOnly={false}
            />
          </section>
        </div>
      )}

      <PromotionModal
        promotionPending={pendingPromotion}
        eligibleTypes={getSoldierPromotionEligibleTypes()}
        onSelectPromotion={handlePromotion}
      />

      <WinnerModal
        winner={winner}
        blackScore={blackScore}
        whiteScore={whiteScore}
        onViewLog={openMatchLog}
        onRestart={resetGame}
      />

      <MatchLogModal
        isOpen={isMatchLogOpen}
        matchLog={matchLog}
        onClose={closeMatchLog}
        onCopy={copyMatchLogText}
      />
    </main>
  );
}

export default App;
