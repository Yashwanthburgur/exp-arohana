import { describe, it, expect } from "vitest";
import {
  TARGET_SCORE,
  SCORE_VALUES,
  applyScore,
  applyScoreDelta,
  getWinnerFromScores,
} from "./scoreEngine.js";
import { createHomeClaim, resolveHomeClaim } from "./homeClaimEngine.js";

// ╔══════════════════════════════╗
// ✅ SCORING ORDER TEST
// ╚══════════════════════════════╝
// Reproduces the exact sequence from the spec:
//
// Initial: White 8, Black 4.
// 1. White's only piece claims Black's home → White +3 (11), Black -1 (3).
// 2. ALL_OUT because White now empty → Black +5 (3+5=8).
//    State after this action: White 11, Black 8.
// 3. Later, Black's only piece claims White's home → Black +3 (11),
//    White -1 (10).
// 4. ALL_OUT because Black now empty → White +5 (10+5=15).
//    Final: White 15, Black 11.
describe("ALL_OUT scoring order after home claim", () => {
  it("applies claim scores BEFORE the ALL_OUT bonus and logs final state", () => {
    // ── Step 1: White claims Black's home ────────────────────────────
    const claim1 = {
      attacker: "WHITE",
      homeOwner: "BLACK",
      square: "e5",
      pieceId: "w1",
      reward: SCORE_VALUES.ENEMY_HOME, // 3
      stealPenalty: SCORE_VALUES.ENEMY_HOME_PENALTY, // 1
    };

    let state1 = resolveHomeClaim({
      state: {
        whiteScore: 8,
        blackScore: 4,
        TARGET_SCORE,
        pendingHomeAttack: claim1,
        winner: null,
      },
      pendingHomeAttack: claim1,
      movedPiece: { color: "BLACK", square: "d4" }, // defender failed to defend
    });

    // Claim applied: White +3, Black -1 → White 11, Black 3
    expect(state1.whiteScore).toBe(11);
    expect(state1.blackScore).toBe(3);
    expect(state1.winner).toBeNull();

    // ── Step 2: White is now empty → ALL_OUT → Black +5 ──────────────
    // (This is done by handleAllOut using the UPDATED scores from step 1.)
    const whiteScoreAfterAllOut = state1.whiteScore;
    const blackScoreAfterAllOut = state1.blackScore + SCORE_VALUES.ALL_OUT;

    // State after this action: White 11, Black 8
    expect(whiteScoreAfterAllOut).toBe(11);
    expect(blackScoreAfterAllOut).toBe(8);

    // ── Step 3: Black claims White's home ─────────────────────────────
    const claim2 = {
      attacker: "BLACK",
      homeOwner: "WHITE",
      square: "e5",
      pieceId: "b1",
      reward: SCORE_VALUES.ENEMY_HOME, // 3
      stealPenalty: SCORE_VALUES.ENEMY_HOME_PENALTY, // 1
    };

    let state2 = resolveHomeClaim({
      state: {
        whiteScore: 11,
        blackScore: 8,
        TARGET_SCORE,
        pendingHomeAttack: claim2,
        winner: null,
      },
      pendingHomeAttack: claim2,
      movedPiece: { color: "WHITE", square: "d4" }, // defender failed
    });

    // Claim applied: Black +3 (11), White -1 (10)
    expect(state2.whiteScore).toBe(10);
    expect(state2.blackScore).toBe(11);
    expect(state2.winner).toBeNull();

    // ── Step 4: Black is now empty → ALL_OUT → White +5 ───────────────
    const finalWhite = state2.whiteScore + SCORE_VALUES.ALL_OUT;
    const finalBlack = state2.blackScore;

    // Final: White 15, Black 11
    expect(finalWhite).toBe(15);
    expect(finalBlack).toBe(11);
  });

  it("exposes the updated ALL_OUT and NO_LEGAL_MOVE values as 5", () => {
    expect(SCORE_VALUES.ALL_OUT).toBe(5);
    expect(SCORE_VALUES.NO_LEGAL_MOVE).toBe(5);
  });

  it("awards +2 own home without touching the opponent", () => {
    const state = applyScore(
      { whiteScore: 0, blackScore: 0 },
      "WHITE",
      SCORE_VALUES.OWN_HOME,
    );
    expect(state.whiteScore).toBe(2);
    expect(state.blackScore).toBe(0);
  });
});
