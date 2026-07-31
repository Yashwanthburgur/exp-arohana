import { useState, useCallback } from "react";
import { createHomeClaim, resolveHomeClaim } from "../engine/homeClaimEngine.js";
import { HOME_SQUARES } from "../constants/boardConfig.js";

// ╔══════════════════════════════╗
// ✅ HOME SYSTEM HOOK
// ╚══════════════════════════════╝
//
// Manages home square assignment, pending home attacks, and home relocation.
// Extracted from App.jsx to reduce God-object size.
//
// Contract:
//   assignHomes()               — randomly assigns 2 of 3 center squares
//   buildHomeClaimFromOccupant  — creates a HomeClaim if piece is on home sq
//   relocateHome(color, pieces) — reassigns home after it's been claimed
//   resolvePendingHomeClaim     — resolves defender's response to an attack
//   createNewHomeClaimIfNeeded  — checks if a moved piece triggered a claim

function useHomeSystem({
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
}) {
  const [whiteHome, setWhiteHome] = useState(null);
  const [blackHome, setBlackHome] = useState(null);
  const [pendingHomeAttack, setPendingHomeAttack] = useState(null);

  // ╔══════════════════════════════╗
  // ✅ ASSIGNMENT
  // ╚══════════════════════════════╝
  function assignHomes() {
    const shuffled = [...HOME_SQUARES].sort(() => Math.random() - 0.5);
    setWhiteHome(shuffled[0]);
    setBlackHome(shuffled[1]);
  }

  function resetHomes() {
    setWhiteHome(null);
    setBlackHome(null);
    setPendingHomeAttack(null);
  }

  // ╔══════════════════════════════╗
  // ✅ CLAIM BUILDER
  // ╚══════════════════════════════╝
  function buildHomeClaimFromOccupant(homeOwner, occupyingPiece, homeSquare) {
    if (!occupyingPiece) return null;

    const isOwnHome = occupyingPiece.color === homeOwner;

    return {
      attacker: occupyingPiece.color,
      homeOwner,
      square: homeSquare,
      pieceId: occupyingPiece.id,
      reward: isOwnHome ? SCORE_VALUES.OWN_HOME : SCORE_VALUES.ENEMY_HOME,
      stealPenalty: isOwnHome ? 0 : SCORE_VALUES.ENEMY_HOME_PENALTY,
    };
  }

  // ╔══════════════════════════════╗
  // ✅ HOME RELOCATION
  // ╚══════════════════════════════╝
  function relocateHome(homeColor, currentPieces) {
    let newHomeSquare = null;

    if (homeColor === "WHITE") {
      const available = HOME_SQUARES.filter(
        (sq) => sq !== whiteHome && sq !== blackHome
      );
      if (available.length > 0) {
        newHomeSquare = available[Math.floor(Math.random() * available.length)];
        setWhiteHome(newHomeSquare);
      }
    }

    if (homeColor === "BLACK") {
      const available = HOME_SQUARES.filter(
        (sq) => sq !== blackHome && sq !== whiteHome
      );
      if (available.length > 0) {
        newHomeSquare = available[Math.floor(Math.random() * available.length)];
        setBlackHome(newHomeSquare);
      }
    }

    if (!newHomeSquare) return null;

    const occupyingPiece = currentPieces.find(
      (piece) => piece.square === newHomeSquare
    );

    return buildHomeClaimFromOccupant(homeColor, occupyingPiece, newHomeSquare);
  }

  // ╔══════════════════════════════╗
  // ✅ NEW CLAIM CHECK
  // ╚══════════════════════════════╝
  function createNewHomeClaimIfNeeded(movedPiece, square) {
    const whiteOnBlackHome = square === blackHome && movedPiece.color === "WHITE";
    const blackOnWhiteHome = square === whiteHome && movedPiece.color === "BLACK";
    const onOwnHome =
      (movedPiece.color === "WHITE" && square === whiteHome) ||
      (movedPiece.color === "BLACK" && square === blackHome);

    const homeOwner = whiteOnBlackHome
      ? "BLACK"
      : blackOnWhiteHome
        ? "WHITE"
        : onOwnHome
          ? movedPiece.color
          : null;

    if (!homeOwner) return;

    const claim = createHomeClaim(movedPiece, square, whiteHome, blackHome);

    if (claim) {
      setPendingHomeAttack(claim);

      addMatchLog((meta) =>
        createHomeClaimCreatedLog({
          ...meta,
          claim,
          piece: movedPiece,
        })
      );
    }
  }

  // ╔══════════════════════════════╗
  // ✅ RESOLVE PENDING CLAIM
  // ╚══════════════════════════════╝
  // Returns { piecesAfterClaim, winnerFound }
  function resolvePendingHomeClaim(movedPiece, currentPieces) {
    if (!pendingHomeAttack) {
      return { piecesAfterClaim: currentPieces, winnerFound: false };
    }

    const attacker = pendingHomeAttack.attacker;
    const defender = attacker === "WHITE" ? "BLACK" : "WHITE";
    const defenderMoved = movedPiece.color === defender;

    if (!defenderMoved) {
      return { piecesAfterClaim: currentPieces, winnerFound: false };
    }

    const defended = movedPiece.square === pendingHomeAttack.square;

    const lockedPiece =
      currentPieces.find((p) => p.id === pendingHomeAttack.pieceId);

    if (defended) {
      addMatchLog((meta) =>
        createHomeClaimDefendedLog({
          ...meta,
          claim: pendingHomeAttack,
          defenderPiece: movedPiece,
        })
      );

      sendToQueue(lockedPiece);

      const newPieces = currentPieces.filter(
        (p) => p.id !== pendingHomeAttack.pieceId
      );

      setPendingHomeAttack(null);

      return { piecesAfterClaim: newPieces, winnerFound: false };
    }

    // Claim succeeds
    let gameState = {
      whiteScore,
      blackScore,
      TARGET_SCORE,
      pendingHomeAttack,
      winner,
    };

    gameState = resolveHomeClaim({
      state: gameState,
      pendingHomeAttack,
      movedPiece,
    });

    addMatchLog((meta) =>
      createHomeClaimSuccessLog({
        ...meta,
        claim: pendingHomeAttack,
        whiteScore: gameState.whiteScore,
        blackScore: gameState.blackScore,
      })
    );

    setWhiteScore(gameState.whiteScore);
    setBlackScore(gameState.blackScore);
    setPendingHomeAttack(gameState.pendingHomeAttack);

    if (gameState.winner) {
      setWinner(gameState.winner);

      addMatchLog((meta) =>
        createWinLog({
          ...meta,
          winner: gameState.winner,
          whiteScore: gameState.whiteScore,
          blackScore: gameState.blackScore,
        })
      );

      return { piecesAfterClaim: currentPieces, winnerFound: true };
    }

    sendToQueue(lockedPiece);

    let newPieces = currentPieces.filter(
      (p) => p.id !== pendingHomeAttack.pieceId
    );

    const nextClaim = relocateHome(pendingHomeAttack.homeOwner, newPieces);
    setPendingHomeAttack(nextClaim);

    return { piecesAfterClaim: newPieces, winnerFound: false };
  }

  return {
    whiteHome,
    blackHome,
    setWhiteHome,
    setBlackHome,
    pendingHomeAttack,
    setPendingHomeAttack,

    assignHomes,
    resetHomes,
    buildHomeClaimFromOccupant,
    relocateHome,
    createNewHomeClaimIfNeeded,
    resolvePendingHomeClaim,
  };
}

export default useHomeSystem;
