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
  // ✅ SHARED TIER SEQUENCE (BALANCED)
  // ╚══════════════════════════════╝
  // One sequence of REQUIRED_DRAFT_ROLLS tiers is generated ONCE for the
  // whole match. BOTH sides draw their slot-i piece from the SAME tier at
  // slot i — so the two armies always have an identical tier mix (e.g.
  // S,S,A,D,B,C,C,D) and neither side can get all-powerful or all-weak.
  const [sharedTierSequence, setSharedTierSequence] = useState([]);

  function ensureSharedTierSequence() {
    if (sharedTierSequence.length === REQUIRED_DRAFT_ROLLS) {
      return sharedTierSequence;
    }

    const activePools = getActiveTierPools(variant, customPieces);
    const tierKeys = Object.keys(activePools);

    if (tierKeys.length === 0) return [];

    const sequence = Array.from(
      { length: REQUIRED_DRAFT_ROLLS },
      () => tierKeys[Math.floor(Math.random() * tierKeys.length)],
    );

    setSharedTierSequence(sequence);
    return sequence;
  }

  // Picks one random piece for a side from the SHARED tier at slotIndex.
  function pickFromSharedSlot(slotIndex) {
    const sequence = ensureSharedTierSequence();
    const tier = sequence[slotIndex];

    if (!tier) return null;

    const activePools = getActiveTierPools(variant, customPieces);
    const pool = activePools[tier];

    if (!pool || pool.length === 0) return null;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Rolls ONE slot. Only THAT side gets the roll (each player's button
  // rolls only their own army), but the piece is picked from the shared
  // tier at that slot so balance is preserved.
  function rollPiece(color) {
    if (color === "WHITE") {
      setWhiteArmy((prev) => {
        if (prev.length >= REQUIRED_DRAFT_ROLLS) return prev;
        return [...prev, pickFromSharedSlot(prev.length)];
      });
      return;
    }

    if (color === "BLACK") {
      setBlackArmy((prev) => {
        if (prev.length >= REQUIRED_DRAFT_ROLLS) return prev;
        return [...prev, pickFromSharedSlot(prev.length)];
      });
      return;
    }

    // Legacy: no color → shared tier, one piece for each side.
    const bothComplete =
      whiteArmy.length >= REQUIRED_DRAFT_ROLLS &&
      blackArmy.length >= REQUIRED_DRAFT_ROLLS;

    if (bothComplete) return;

    const slotIndex = Math.max(whiteArmy.length, blackArmy.length);
    const tier = ensureSharedTierSequence()[slotIndex];

    if (!tier) return;

    const activePools = getActiveTierPools(variant, customPieces);
    const pool = activePools[tier];

    if (!pool || pool.length === 0) return;

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
  // ✅ DEPLOY FULL ARMY (ONE CLICK)
  // ╚══════════════════════════════╝
  // Fills the entire 8-slot army in one click from the SHARED tier
  // sequence. When a color is given, ONLY that side's army is deployed
  // (each player deploys their own) — but both get the same tier mix.
  function autoRollFullArmy(color) {
    const sequence = ensureSharedTierSequence();

    if (color === "WHITE" || color === "BLACK") {
      const rolls = Array.from({ length: REQUIRED_DRAFT_ROLLS }, (_, i) => {
        const tier = sequence[i];

        if (!tier) return null;

        const activePools = getActiveTierPools(variant, customPieces);
        const pool = activePools[tier];

        if (!pool || pool.length === 0) return null;

        return pool[Math.floor(Math.random() * pool.length)];
      });

      if (color === "WHITE") {
        setWhiteArmy(rolls);
      } else {
        setBlackArmy(rolls);
      }
      return;
    }

    // No color → deploy both armies from the same shared sequence.
    const whiteRolls = [];
    const blackRolls = [];

    for (let i = 0; i < REQUIRED_DRAFT_ROLLS; i++) {
      const tier = sequence[i];

      if (!tier) break;

      const activePools = getActiveTierPools(variant, customPieces);
      const pool = activePools[tier];

      if (!pool || pool.length === 0) break;

      whiteRolls.push(pool[Math.floor(Math.random() * pool.length)]);
      blackRolls.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    setWhiteArmy(whiteRolls);
    setBlackArmy(blackRolls);
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
    // Fresh shared tier sequence for the next match.
    setSharedTierSequence([]);
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
    autoRollFullArmy,
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
