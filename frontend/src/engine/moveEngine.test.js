import { describe, it, expect } from "vitest";
import { getLegalTargets } from "../engine/moveEngine.js";

// ────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────
function makePiece(type, color, square, extra = {}) {
  return {
    id: `${color}-${type}-${square}`,
    type,
    color,
    square,
    powerUsed: false,
    ...extra,
  };
}

function squaresOf(targets) {
  return targets.map((t) => t.square);
}

function kindsOf(targets, square) {
  return targets.filter((t) => t.square === square).map((t) => t.kind);
}

// ────────────────────────────────────────────────────────
// WARRIOR (King movement)
// ────────────────────────────────────────────────────────
describe("WARRIOR moves", () => {
  it("can slide in all 8 directions (Queen movement) when unblocked", () => {
    const w = makePiece("WARRIOR", "WHITE", "e5");
    const targets = getLegalTargets(w, [w]);
    // WARRIOR is a Queen — should have many more than 8 targets from center
    expect(targets.length).toBeGreaterThan(8);
  });

  it("cannot land on a friendly piece", () => {
    const w = makePiece("WARRIOR", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "e6");
    const targets = getLegalTargets(w, [w, ally]);
    const squares = squaresOf(targets);
    expect(squares).not.toContain("e6");
  });

  it("can capture an enemy piece", () => {
    const w = makePiece("WARRIOR", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "e6");
    const targets = getLegalTargets(w, [w, enemy]);
    expect(kindsOf(targets, "e6")).toContain("capture");
  });
});

// ────────────────────────────────────────────────────────
// ELEPHANT (Rook — slides, no jump)
// ────────────────────────────────────────────────────────
describe("ELEPHANT moves", () => {
  it("slides along rank and file", () => {
    const e = makePiece("ELEPHANT", "WHITE", "e5");
    const targets = getLegalTargets(e, [e]);
    // Should reach many squares
    expect(targets.length).toBeGreaterThan(10);
  });

  it("is blocked by a friendly piece — cannot jump over", () => {
    const e = makePiece("ELEPHANT", "WHITE", "e5");
    const blocker = makePiece("BULL", "WHITE", "e7");
    const targets = getLegalTargets(e, [e, blocker]);
    const squares = squaresOf(targets);
    // e7 should be blocked (friendly) and e8, e9 should not be reachable
    expect(squares).not.toContain("e7");
    expect(squares).not.toContain("e8");
  });

  it("can capture an enemy that blocks the ray and stops there", () => {
    const e = makePiece("ELEPHANT", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "e7");
    const targets = getLegalTargets(e, [e, enemy]);
    const squares = squaresOf(targets);
    expect(squares).toContain("e7");
    // Cannot pass through the enemy
    expect(squares).not.toContain("e8");
  });
});

// ────────────────────────────────────────────────────────
// HORSE (Knight leap)
// ────────────────────────────────────────────────────────
describe("HORSE moves", () => {
  it("produces up to 8 L-shaped targets from center", () => {
    const h = makePiece("HORSE", "WHITE", "e5");
    const targets = getLegalTargets(h, [h]);
    expect(targets.length).toBe(8);
  });

  it("jumps over intervening pieces", () => {
    const h = makePiece("HORSE", "WHITE", "e5");
    const blocker = makePiece("BULL", "WHITE", "e6");
    const targets = getLegalTargets(h, [h, blocker]);
    // Horse should still reach d7
    const squares = squaresOf(targets);
    expect(squares).toContain("d7");
  });

  it("edge of board reduces options", () => {
    const h = makePiece("HORSE", "WHITE", "a1");
    const targets = getLegalTargets(h, [h]);
    expect(targets.length).toBeLessThanOrEqual(4);
  });
});

// ────────────────────────────────────────────────────────
// GAJASHVA (Elephant + Horse = Rook + Knight)
// ────────────────────────────────────────────────────────
describe("GAJASHVA moves", () => {
  it("combines Elephant and Horse targets", () => {
    const g = makePiece("GAJASHVA", "WHITE", "e5");
    const allTargets = getLegalTargets(g, [g]);
    // Should include Knight leaps + Rook rays
    expect(allTargets.length).toBeGreaterThan(16);
  });

  it("can reach g6 with a knight leap", () => {
    const g = makePiece("GAJASHVA", "WHITE", "e5");
    const targets = getLegalTargets(g, [g]);
    expect(squaresOf(targets)).toContain("g6");
  });
});

// ────────────────────────────────────────────────────────
// SOLDIER (pawn-like: forward move + diagonal capture)
// ────────────────────────────────────────────────────────
describe("SOLDIER moves", () => {
  it("WHITE soldier moves forward (increasing rank)", () => {
    const s = makePiece("SOLDIER", "WHITE", "e4");
    const targets = getLegalTargets(s, [s]);
    expect(squaresOf(targets)).toContain("e5");
  });

  it("BLACK soldier moves backward (decreasing rank)", () => {
    const s = makePiece("SOLDIER", "BLACK", "e6");
    const targets = getLegalTargets(s, [s]);
    expect(squaresOf(targets)).toContain("e5");
  });

  it("cannot move forward if blocked", () => {
    const s = makePiece("SOLDIER", "WHITE", "e4");
    const blocker = makePiece("BULL", "BLACK", "e5");
    const targets = getLegalTargets(s, [s, blocker]);
    expect(squaresOf(targets)).not.toContain("e5");
  });

  it("can capture diagonally", () => {
    const s = makePiece("SOLDIER", "WHITE", "e4");
    const enemy = makePiece("BULL", "BLACK", "f5");
    const targets = getLegalTargets(s, [s, enemy]);
    expect(kindsOf(targets, "f5")).toContain("capture");
  });

  it("cannot capture friendly diagonal pieces", () => {
    const s = makePiece("SOLDIER", "WHITE", "e4");
    const ally = makePiece("BULL", "WHITE", "f5");
    const targets = getLegalTargets(s, [s, ally]);
    expect(squaresOf(targets)).not.toContain("f5");
  });
});

// ────────────────────────────────────────────────────────
// SKUNK AURA — global restriction
// ────────────────────────────────────────────────────────
describe("SKUNK aura restriction", () => {
  it("prevents WARRIOR from landing on squares adjacent to a Skunk", () => {
    const skunk = makePiece("SKUNK", "BLACK", "g5");
    const warrior = makePiece("WARRIOR", "WHITE", "e5");
    const targets = getLegalTargets(warrior, [warrior, skunk]);
    const squares = squaresOf(targets);
    // f5 is adjacent to g5 (Skunk aura) — should be blocked
    expect(squares).not.toContain("f5");
    // f4 is also adjacent to skunk at g5 — blocked
    expect(squares).not.toContain("f4");
  });

  it("allows direct capture of the Skunk despite its own aura", () => {
    const skunk = makePiece("SKUNK", "BLACK", "f5");
    const warrior = makePiece("WARRIOR", "WHITE", "e5");
    const targets = getLegalTargets(warrior, [warrior, skunk]);
    // Warrior can directly step onto f5 to capture the Skunk
    expect(kindsOf(targets, "f5")).toContain("capture");
  });
});

// ────────────────────────────────────────────────────────
// ANTELOPE swap mechanic
// ────────────────────────────────────────────────────────
describe("ANTELOPE swap mechanic", () => {
  it("produces swap targets for non-adjacent enemies", () => {
    const antelope = makePiece("ANTELOPE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "a5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(antelope, [antelope, enemy], context);
    const swapTargets = targets.filter((t) => t.kind === "swap");
    expect(swapTargets.length).toBeGreaterThan(0);
  });

  it("does not show swap target for WOLF (invisible to Antelope)", () => {
    const antelope = makePiece("ANTELOPE", "WHITE", "e5");
    const wolf = makePiece("WOLF", "BLACK", "a5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(antelope, [antelope, wolf], context);
    const swapTargets = targets.filter((t) => t.kind === "swap");
    expect(swapTargets).toHaveLength(0);
  });

  it("no swap when powerUsed is true", () => {
    const antelope = makePiece("ANTELOPE", "WHITE", "e5", { powerUsed: true });
    const enemy = makePiece("BULL", "BLACK", "a5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(antelope, [antelope, enemy], context);
    const swapTargets = targets.filter((t) => t.kind === "swap");
    expect(swapTargets).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────
// CAMEL (Bishop-like diagonal slider)
// ────────────────────────────────────────────────────────
describe("CAMEL moves", () => {
  it("moves diagonally from center", () => {
    const c = makePiece("CAMEL", "WHITE", "e5");
    const targets = getLegalTargets(c, [c]);
    // From e5, diagonals reach d4, f4, d6, f6, c3, g3, c7, g7, b2, h2, b8, h8, a1, i1...
    expect(targets.length).toBeGreaterThan(8);
  });
});

// ────────────────────────────────────────────────────────
// Edge: piece not on board returns empty
// ────────────────────────────────────────────────────────
describe("getLegalTargets edge cases", () => {
  it("returns empty array for null piece", () => {
    expect(getLegalTargets(null, [])).toEqual([]);
  });

  it("returns empty array for unknown piece type", () => {
    const unknown = makePiece("CHIMERA", "WHITE", "e5");
    expect(getLegalTargets(unknown, [unknown])).toEqual([]);
  });
});
