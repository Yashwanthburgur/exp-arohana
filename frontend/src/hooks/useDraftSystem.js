import { useState } from "react";
import { PIECE_CATALOG } from "../engine/pieceCatalog.js";
import {
  VARIANTS,
  VARIANT_TIER_POOLS,
  getActiveTierPools,
} from "../constants/variantConfig.js";
import { REQUIRED_DRAFT_ROLLS } from "../constants/boardConfig.js";

// ╔══════════════════════════════╗
// ✅ DRAFT SYSTEM HOOK
// ╚══════════════════════════════╝
//
// Manages army queues, draft rolls, ready state, and queue reordering.
// Accepts variant and customPieces to filter available pieces per mode.
//
// Draft rule: tier-first selection.
//   1. Pick a random tier from non-empty tiers for this variant.
//   2. Independently pick one piece for White, one for Black from that tier.
//   3. Both sides may receive the same piece.
//   4. Repeat until REQUIRED_DRAFT_ROLLS entries per side.

function getPieceMaterial(type) {
  return PIECE_CATALOG[type]?.materialScore ?? 0;
}

function getDraftMaterial(type) {
  return PIECE_CATALOG[type]?.comboTotal ?? getPieceMaterial(type);
}

function calculateMaterialTotal(army) {
  return army.reduce((total, type) => total + getDraftMaterial(type), 0);
}

function getQueueLabel(piece, index, isGameStartedView) {
  const catalog = PIECE_CATALOG[piece];

  if (!catalog) return piece;

  if (!isGameStartedView && catalog.comboCount > 1) {
    return `${catalog.name} x${catalog.comboCount}`;
  }

  return catalog.name ?? piece;
}

function useDraftSystem({
  variant = VARIANTS.CLASSIC,
  customPieces = null,
} = {}) {
  const [whiteArmy, setWhiteArmy] = useState([]);
  const [blackArmy, setBlackArmy] = useState([]);

  const [whiteReady, setWhiteReady] = useState(false);
  const [blackReady, setBlackReady] = useState(false);

  // ╔══════════════════════════════╗
  // ✅ DRAFT ROLL
  // ╚══════════════════════════════╝
  function rollPiece() {
    const bothComplete =
      whiteArmy.length >= REQUIRED_DRAFT_ROLLS &&
      blackArmy.length >= REQUIRED_DRAFT_ROLLS;

    if (bothComplete) return;

    // Get tier pools filtered for current variant
    const activePools = getActiveTierPools(variant, customPieces);
    const tierKeys = Object.keys(activePools);

    if (tierKeys.length === 0) return;

    // 1. Shared tier selection
    const pickedTier = tierKeys[Math.floor(Math.random() * tierKeys.length)];
    const pool = activePools[pickedTier];

    // 2. Independent piece selection per side
    const whitePick = pool[Math.floor(Math.random() * pool.length)];
    const blackPick = pool[Math.floor(Math.random() * pool.length)];

    setWhiteArmy((prev) => {
      if (prev.length >= REQUIRED_DRAFT_ROLLS) return prev;
      return [...prev, whitePick];
    });

    setBlackArmy((prev) => {
      if (prev.length >= REQUIRED_DRAFT_ROLLS) return prev;
      return [...prev, blackPick];
    });
  }

  // ╔══════════════════════════════╗
  // ✅ READY VALIDATION
  // ╚══════════════════════════════╝
  function canSetReady(color) {
    const army = color === "WHITE" ? whiteArmy : blackArmy;
    return army.length === REQUIRED_DRAFT_ROLLS;
  }

  function isDraftComplete() {
    return (
      whiteArmy.length >= REQUIRED_DRAFT_ROLLS &&
      blackArmy.length >= REQUIRED_DRAFT_ROLLS
    );
  }

  function setWhiteReadyFlag(value) {
    if (value && !isDraftComplete()) return;
    setWhiteReady(value);
  }

  function setBlackReadyFlag(value) {
    if (value && !isDraftComplete()) return;
    setBlackReady(value);
  }

  // ╔══════════════════════════════╗
  // ✅ QUEUE OPERATIONS
  // ╚══════════════════════════════╝
  function moveUp(color, index) {
    const army = color === "WHITE" ? [...whiteArmy] : [...blackArmy];

    if (index === 0) return;
    [army[index - 1], army[index]] = [army[index], army[index - 1]];

    if (color === "WHITE") {
      setWhiteArmy(army);
    } else {
      setBlackArmy(army);
    }
  }

  function moveDown(color, index) {
    const army = color === "WHITE" ? [...whiteArmy] : [...blackArmy];

    if (index === army.length - 1) return;
    [army[index + 1], army[index]] = [army[index], army[index + 1]];

    if (color === "WHITE") {
      setWhiteArmy(army);
    } else {
      setBlackArmy(army);
    }
  }

  function shiftQueue(color) {
    if (color === "WHITE") {
      setWhiteArmy((prev) => prev.slice(1));
    }

    if (color === "BLACK") {
      setBlackArmy((prev) => prev.slice(1));
    }
  }

  function sendToQueue(piece) {
    if (!piece) return;

    if (piece.color === "WHITE") {
      setWhiteArmy((prev) => [...prev, piece.type]);
    }

    if (piece.color === "BLACK") {
      setBlackArmy((prev) => [...prev, piece.type]);
    }
  }

  function sendManyToQueue(color, pieceTypes) {
    if (!pieceTypes || pieceTypes.length === 0) return;

    if (color === "WHITE") {
      setWhiteArmy((prev) => [...prev, ...pieceTypes]);
    }

    if (color === "BLACK") {
      setBlackArmy((prev) => [...prev, ...pieceTypes]);
    }
  }

  // ╔══════════════════════════════╗
  // ✅ RESET
  // ╚══════════════════════════════╝
  function resetDraft() {
    setWhiteArmy([]);
    setBlackArmy([]);
    setWhiteReady(false);
    setBlackReady(false);
  }

  return {
    whiteArmy,
    setWhiteArmy,
    blackArmy,
    setBlackArmy,

    whiteReady,
    setWhiteReady: setWhiteReadyFlag,
    blackReady,
    setBlackReady: setBlackReadyFlag,

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
  };
}

export default useDraftSystem;
