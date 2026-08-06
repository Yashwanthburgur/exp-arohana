import { describe, it, expect } from "vitest";
import { getLegalTargets } from "./moveEngine.js";
import {
  squareToPosition,
  positionToSquare,
  isPlayableSquare,
} from "./coordinates.js";

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

function sorted(targets) {
  return squaresOf(targets).sort();
}

// Board geometry (documentation.md §3):
//   • Files a–i (x 0–8), main ranks 1–9
//   • Launch pads only: d0/e0/f0 and d10/e10/f10
const KING_E5 = ["d4", "d5", "d6", "e4", "e6", "f4", "f5", "f6"];

// ────────────────────────────────────────────────────────
// Global audit — every piece, every square, no bad output
// ────────────────────────────────────────────────────────
const ALL_TYPES = [
  "WARRIOR",
  "SAGITTARIUS",
  "NINJA",
  "GAJASHVA",
  "ELEPHANT",
  "RHINO",
  "GIRAFFE",
  "CAMEL",
  "DRAGON",
  "HORSE",
  "UNICORN",
  "DONKEY",
  "WOLF",
  "MONKEY",
  "ANTELOPE",
  "SKUNK",
  "SNAKE",
  "BULL",
  "SOLDIER",
];

describe("global coordinate validity audit", () => {
  it("never generates a target outside the playable board for any piece on any square", () => {
    for (const type of ALL_TYPES) {
      for (let x = 0; x < 9; x++) {
        for (let y = 0; y <= 10; y++) {
          const square = positionToSquare(x, y);
          if (!square) continue;

          const piece = makePiece(type, "WHITE", square);
          const targets = getLegalTargets(piece, [piece]);

          for (const target of targets) {
            // Round-trip must reproduce the exact square string
            const { x: tx, y: ty } = squareToPosition(target.square);
            expect(positionToSquare(tx, ty)).toBe(target.square);
            expect(isPlayableSquare(tx, ty)).toBe(true);
            // Ranks must stay within 0–10 and files within a–i
            expect(ty).toBeGreaterThanOrEqual(0);
            expect(ty).toBeLessThanOrEqual(10);
            expect(tx).toBeGreaterThanOrEqual(0);
            expect(tx).toBeLessThanOrEqual(8);
          }
        }
      }
    }
  });

  it("never returns the piece's own square and never duplicates a target", () => {
    for (const type of ALL_TYPES) {
      for (const square of ["a1", "e5", "i9", "d0", "e10", "f0"]) {
        const piece = makePiece(type, "WHITE", square);
        const targets = getLegalTargets(piece, [piece]);
        const list = squaresOf(targets);
        expect(list).not.toContain(square);
        expect(new Set(list).size).toBe(list.length);
      }
    }
  });
});

// ────────────────────────────────────────────────────────
// WARRIOR — Queen slide, no jump
// ────────────────────────────────────────────────────────
describe("WARRIOR moves", () => {
  it("slides in all 8 directions from the center — exactly 34 squares (incl. e0/e10 launch pads)", () => {
    const w = makePiece("WARRIOR", "WHITE", "e5");
    const targets = getLegalTargets(w, [w]);
    expect(sorted(targets)).toEqual([
      "a1",
      "a5",
      "a9",
      "b2",
      "b5",
      "b8",
      "c3",
      "c5",
      "c7",
      "d4",
      "d5",
      "d6",
      "e0",
      "e1",
      "e10",
      "e2",
      "e3",
      "e4",
      "e6",
      "e7",
      "e8",
      "e9",
      "f4",
      "f5",
      "f6",
      "g3",
      "g5",
      "g7",
      "h2",
      "h5",
      "h8",
      "i1",
      "i5",
      "i9",
    ]);
  });

  it("stops at a friendly blocker and never passes through it", () => {
    const w = makePiece("WARRIOR", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "e7");
    const targets = getLegalTargets(w, [w, ally]);
    const squares = squaresOf(targets);
    expect(squares).not.toContain("e7");
    expect(squares).not.toContain("e8");
    expect(squares).not.toContain("e9");
  });

  it("captures the first enemy on a ray and stops there", () => {
    const w = makePiece("WARRIOR", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "e7");
    const targets = getLegalTargets(w, [w, enemy]);
    expect(kindsOf(targets, "e7")).toContain("capture");
    expect(squaresOf(targets)).not.toContain("e8");
  });

  it("reaches the launch pad e0 from e1", () => {
    const w = makePiece("WARRIOR", "WHITE", "e1");
    const targets = getLegalTargets(w, [w]);
    expect(squaresOf(targets)).toContain("e0");
  });

  it("is fully bounded at a corner — exactly 24 squares from a1", () => {
    const w = makePiece("WARRIOR", "WHITE", "a1");
    const targets = getLegalTargets(w, [w]);
    expect(sorted(targets)).toEqual([
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
      "a9",
      "b1",
      "b2",
      "c1",
      "c3",
      "d1",
      "d4",
      "e1",
      "e5",
      "f1",
      "f6",
      "g1",
      "g7",
      "h1",
      "h8",
      "i1",
      "i9",
    ]);
  });
});

// ────────────────────────────────────────────────────────
// NINJA — 1–3 any direction, jumps
// ────────────────────────────────────────────────────────
describe("NINJA moves", () => {
  it("reaches exactly 24 squares (8 directions × 3 steps) from e5", () => {
    const n = makePiece("NINJA", "WHITE", "e5");
    const targets = getLegalTargets(n, [n]);
    expect(sorted(targets)).toEqual([
      "b2",
      "b5",
      "b8",
      "c3",
      "c5",
      "c7",
      "d4",
      "d5",
      "d6",
      "e2",
      "e3",
      "e4",
      "e6",
      "e7",
      "e8",
      "f4",
      "f5",
      "f6",
      "g3",
      "g5",
      "g7",
      "h2",
      "h5",
      "h8",
    ]);
  });

  it("jumps over intervening friendly pieces", () => {
    const n = makePiece("NINJA", "WHITE", "e5");
    const b1 = makePiece("BULL", "WHITE", "e6");
    const b2 = makePiece("BULL", "WHITE", "e7");
    const targets = getLegalTargets(n, [n, b1, b2]);
    expect(squaresOf(targets)).toContain("e8");
  });

  it("cannot land on friendly squares even when jumping", () => {
    const n = makePiece("NINJA", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "g5");
    const targets = getLegalTargets(n, [n, ally]);
    expect(squaresOf(targets)).not.toContain("g5");
    expect(squaresOf(targets)).toContain("h5");
  });
});

// ────────────────────────────────────────────────────────
// SAGITTARIUS — 1–3 no-jump slide + horse leap
// ────────────────────────────────────────────────────────
describe("SAGITTARIUS moves", () => {
  it("combines a 1–3 limited slide with horse leaps — exactly 32 from e5", () => {
    const s = makePiece("SAGITTARIUS", "WHITE", "e5");
    const targets = getLegalTargets(s, [s]);
    expect(sorted(targets)).toEqual([
      "b2",
      "b5",
      "b8",
      "c3",
      "c4",
      "c5",
      "c6",
      "c7",
      "d3",
      "d4",
      "d5",
      "d6",
      "d7",
      "e2",
      "e3",
      "e4",
      "e6",
      "e7",
      "e8",
      "f3",
      "f4",
      "f5",
      "f6",
      "f7",
      "g3",
      "g4",
      "g5",
      "g6",
      "g7",
      "h2",
      "h5",
      "h8",
    ]);
  });

  it("slide part is blocked by a friendly piece but horse part still leaps", () => {
    const s = makePiece("SAGITTARIUS", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "d5");
    const targets = getLegalTargets(s, [s, ally]);
    const squares = squaresOf(targets);
    expect(squares).not.toContain("d5");
    expect(squares).not.toContain("c5"); // beyond blocker on that ray
    expect(squares).toContain("d7"); // horse leap still works
  });
});

// ────────────────────────────────────────────────────────
// ELEPHANT — Rook slide, no jump
// ────────────────────────────────────────────────────────
describe("ELEPHANT moves", () => {
  it("slides along rank and file — exactly 18 from e5 (incl. e0/e10 launch pads)", () => {
    const e = makePiece("ELEPHANT", "WHITE", "e5");
    const targets = getLegalTargets(e, [e]);
    expect(sorted(targets)).toEqual([
      "a5",
      "b5",
      "c5",
      "d5",
      "e0",
      "e1",
      "e10",
      "e2",
      "e3",
      "e4",
      "e6",
      "e7",
      "e8",
      "e9",
      "f5",
      "g5",
      "h5",
      "i5",
    ]);
  });

  it("stops at a friendly blocker", () => {
    const e = makePiece("ELEPHANT", "WHITE", "e5");
    const blocker = makePiece("BULL", "WHITE", "e7");
    const targets = getLegalTargets(e, [e, blocker]);
    expect(squaresOf(targets)).not.toContain("e7");
    expect(squaresOf(targets)).not.toContain("e8");
  });

  it("captures an enemy that blocks the ray and stops there", () => {
    const e = makePiece("ELEPHANT", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "e7");
    const targets = getLegalTargets(e, [e, enemy]);
    expect(kindsOf(targets, "e7")).toContain("capture");
    expect(squaresOf(targets)).not.toContain("e8");
  });

  it("reaches the launch pads e0 and e10 from e1", () => {
    const e = makePiece("ELEPHANT", "WHITE", "e1");
    const targets = getLegalTargets(e, [e]);
    const squares = squaresOf(targets);
    expect(squares).toContain("e0");
    expect(squares).toContain("e10");
    expect(squares).toHaveLength(18); // 16 main + e0 + e10
  });
});

// ────────────────────────────────────────────────────────
// CAMEL — Bishop slide, no jump, colour-bound
// ────────────────────────────────────────────────────────
describe("CAMEL moves", () => {
  it("slides diagonally — exactly 16 from e5, all same colour", () => {
    const c = makePiece("CAMEL", "WHITE", "e5");
    const targets = getLegalTargets(c, [c]);
    const squares = squaresOf(targets);
    expect(squares).toHaveLength(16);
    expect(sorted(targets)).toEqual([
      "a1",
      "a9",
      "b2",
      "b8",
      "c3",
      "c7",
      "d4",
      "d6",
      "f4",
      "f6",
      "g3",
      "g7",
      "h2",
      "h8",
      "i1",
      "i9",
    ]);
    // Colour-bound: every reachable square has the same parity as e5
    for (const square of squares) {
      const { x, y } = squareToPosition(square);
      expect((x + y) % 2).toBe((4 + 5) % 2);
    }
  });

  it("is blocked by a friendly piece on the diagonal", () => {
    const c = makePiece("CAMEL", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "g7");
    const targets = getLegalTargets(c, [c, ally]);
    const squares = squaresOf(targets);
    expect(squares).not.toContain("g7");
    expect(squares).not.toContain("h8");
    expect(squares).not.toContain("i9");
  });
});

// ────────────────────────────────────────────────────────
// RHINO — Bishop slide + king move
// ────────────────────────────────────────────────────────
describe("RHINO moves", () => {
  it("combines Camel diagonals with king steps — exactly 20 from e5", () => {
    const r = makePiece("RHINO", "WHITE", "e5");
    const targets = getLegalTargets(r, [r]);
    expect(sorted(targets)).toEqual([
      "a1",
      "a9",
      "b2",
      "b8",
      "c3",
      "c7",
      "d4",
      "d5",
      "d6",
      "e4",
      "e6",
      "f4",
      "f5",
      "f6",
      "g3",
      "g7",
      "h2",
      "h8",
      "i1",
      "i9",
    ]);
  });

  it("diagonal slide stops at blockers", () => {
    const r = makePiece("RHINO", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "d6");
    const targets = getLegalTargets(r, [r, ally]);
    const squares = squaresOf(targets);
    expect(squares).not.toContain("d6");
    expect(squares).not.toContain("c7");
  });
});

// ────────────────────────────────────────────────────────
// HORSE — 2+1 knight leap, jumps
// ────────────────────────────────────────────────────────
describe("HORSE moves", () => {
  it("produces exactly 8 L-shaped targets from the center", () => {
    const h = makePiece("HORSE", "WHITE", "e5");
    const targets = getLegalTargets(h, [h]);
    expect(sorted(targets)).toEqual([
      "c4",
      "c6",
      "d3",
      "d7",
      "f3",
      "f7",
      "g4",
      "g6",
    ]);
  });

  it("jumps over intervening pieces", () => {
    const h = makePiece("HORSE", "WHITE", "e5");
    const blocker = makePiece("BULL", "WHITE", "e6");
    const targets = getLegalTargets(h, [h, blocker]);
    expect(squaresOf(targets)).toContain("d7");
  });

  it("respects board limits at the corner — exactly 2 from a1", () => {
    const h = makePiece("HORSE", "WHITE", "a1");
    const targets = getLegalTargets(h, [h]);
    expect(sorted(targets)).toEqual(["b3", "c2"]);
  });
});

// ────────────────────────────────────────────────────────
// GAJASHVA — Elephant + Horse
// ────────────────────────────────────────────────────────
describe("GAJASHVA moves", () => {
  it("combines Elephant and Horse targets — exactly 26 from e5 (incl. launch pads)", () => {
    const g = makePiece("GAJASHVA", "WHITE", "e5");
    const targets = getLegalTargets(g, [g]);
    expect(sorted(targets)).toEqual([
      "a5",
      "b5",
      "c4",
      "c5",
      "c6",
      "d3",
      "d5",
      "d7",
      "e0",
      "e1",
      "e10",
      "e2",
      "e3",
      "e4",
      "e6",
      "e7",
      "e8",
      "e9",
      "f3",
      "f5",
      "f7",
      "g4",
      "g5",
      "g6",
      "h5",
      "i5",
    ]);
  });

  it("horse part leaps over a friendly blocker on the rook ray", () => {
    const g = makePiece("GAJASHVA", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "e7");
    const targets = getLegalTargets(g, [g, ally]);
    const squares = squaresOf(targets);
    expect(squares).not.toContain("e7");
    expect(squares).not.toContain("e8"); // rook ray blocked
    expect(squares).toContain("f7"); // knight leap still works
  });
});

// ────────────────────────────────────────────────────────
// GIRAFFE — 2 or 3 orthogonal leaper, jumps
// ────────────────────────────────────────────────────────
describe("GIRAFFE moves", () => {
  it("leaps exactly 2 or 3 orthogonally — 8 from e5", () => {
    const g = makePiece("GIRAFFE", "WHITE", "e5");
    const targets = getLegalTargets(g, [g]);
    expect(sorted(targets)).toEqual([
      "b5",
      "c5",
      "e2",
      "e3",
      "e7",
      "e8",
      "g5",
      "h5",
    ]);
  });

  it("ignores blockers on the leap path", () => {
    const g = makePiece("GIRAFFE", "WHITE", "e5");
    const b1 = makePiece("BULL", "WHITE", "e6");
    const b2 = makePiece("BULL", "WHITE", "e7");
    const targets = getLegalTargets(g, [g, b1, b2]);
    expect(squaresOf(targets)).toContain("e8");
  });

  it("respects rank limits — 6 targets from e1", () => {
    const g = makePiece("GIRAFFE", "WHITE", "e1");
    const targets = getLegalTargets(g, [g]);
    expect(sorted(targets)).toEqual(["b1", "c1", "e3", "e4", "g1", "h1"]);
  });
});

// ────────────────────────────────────────────────────────
// UNICORN — 3+1 leaper, no wrap, jumps
// ────────────────────────────────────────────────────────
describe("UNICORN moves", () => {
  it("leaps 3+1 — exactly 8 from e5", () => {
    const u = makePiece("UNICORN", "WHITE", "e5");
    const targets = getLegalTargets(u, [u]);
    expect(sorted(targets)).toEqual([
      "b4",
      "b6",
      "d2",
      "d8",
      "f2",
      "f8",
      "h4",
      "h6",
    ]);
  });

  it("ignores blockers", () => {
    const u = makePiece("UNICORN", "WHITE", "e5");
    const blocker = makePiece("BULL", "WHITE", "f6");
    const targets = getLegalTargets(u, [u, blocker]);
    expect(squaresOf(targets)).toContain("h6");
  });

  it("does NOT wrap at the a-file edge — exactly 4 from a5", () => {
    const u = makePiece("UNICORN", "WHITE", "a5");
    const targets = getLegalTargets(u, [u]);
    expect(sorted(targets)).toEqual(["b2", "b8", "d4", "d6"]);
  });

  it("can leap onto the d0 launch pad from a1", () => {
    const u = makePiece("UNICORN", "WHITE", "a1");
    const targets = getLegalTargets(u, [u]);
    expect(sorted(targets)).toEqual(["b4", "d0", "d2"]);
  });
});

// ────────────────────────────────────────────────────────
// DRAGON — 3+1 leaper with horizontal edge wrap
// ────────────────────────────────────────────────────────
describe("DRAGON moves", () => {
  it("leaps 3+1 from the center — same as Unicorn, exactly 8", () => {
    const d = makePiece("DRAGON", "WHITE", "e5");
    const targets = getLegalTargets(d, [d]);
    expect(sorted(targets)).toEqual([
      "b4",
      "b6",
      "d2",
      "d8",
      "f2",
      "f8",
      "h4",
      "h6",
    ]);
  });

  it("wraps horizontally across the a/i edge from a5", () => {
    const d = makePiece("DRAGON", "WHITE", "a5");
    const targets = getLegalTargets(d, [d]);
    expect(sorted(targets)).toEqual([
      "b2",
      "b8",
      "d4",
      "d6",
      "g4",
      "g6",
      "i2",
      "i8",
    ]);
  });

  it("wraps horizontally from h5 to the b-file", () => {
    const d = makePiece("DRAGON", "WHITE", "h5");
    const targets = getLegalTargets(d, [d]);
    expect(sorted(targets)).toEqual([
      "b4",
      "b6",
      "e4",
      "e6",
      "g2",
      "g8",
      "i2",
      "i8",
    ]);
  });

  it("never generates an invalid rank when wrapping", () => {
    const d = makePiece("DRAGON", "WHITE", "e9");
    const targets = getLegalTargets(d, [d]);
    expect(sorted(targets)).toEqual(["b8", "d6", "f6", "h8"]);
  });

  it("ignores blockers", () => {
    const d = makePiece("DRAGON", "WHITE", "e5");
    const blocker = makePiece("BULL", "WHITE", "f6");
    const targets = getLegalTargets(d, [d, blocker]);
    expect(squaresOf(targets)).toContain("h6");
  });
});

// ────────────────────────────────────────────────────────
// DONKEY — knight destination but no jump (L-path clearance)
// ────────────────────────────────────────────────────────
describe("DONKEY moves", () => {
  it("reaches the same 8 knight squares from e5 when paths are clear", () => {
    const d = makePiece("DONKEY", "WHITE", "e5");
    const targets = getLegalTargets(d, [d]);
    expect(sorted(targets)).toEqual([
      "c4",
      "c6",
      "d3",
      "d7",
      "f3",
      "f7",
      "g4",
      "g6",
    ]);
  });

  it("still reaches c4 when only ONE of the two L-path interpretations is blocked (partial block)", () => {
    const d = makePiece("DONKEY", "WHITE", "e5");
    // To reach c4 (dx=-2, dy=-1):
    //   path one: d5, c5   (horizontal first)
    //   path two: e4, d4   (vertical first)
    const blockPathOne = makePiece("BULL", "WHITE", "c5");
    const targets = getLegalTargets(d, [d, blockPathOne]);
    expect(squaresOf(targets)).toContain("c4");
  });

  it("is blocked from c4 when BOTH L-path interpretations are blocked", () => {
    const d = makePiece("DONKEY", "WHITE", "e5");
    const blockPathOne = makePiece("BULL", "WHITE", "c5");
    const blockPathTwo = makePiece("BULL", "WHITE", "d4");
    const targets = getLegalTargets(d, [d, blockPathOne, blockPathTwo]);
    expect(squaresOf(targets)).not.toContain("c4");
  });

  it("cannot land on a friendly destination square", () => {
    const d = makePiece("DONKEY", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "c4");
    const targets = getLegalTargets(d, [d, ally]);
    expect(squaresOf(targets)).not.toContain("c4");
  });

  it("ignores a friendly piece sitting at the corner of the L", () => {
    const d = makePiece("DONKEY", "WHITE", "e5");
    const corner = makePiece("BULL", "WHITE", "d5"); // in path one only
    const targets = getLegalTargets(d, [d, corner]);
    expect(squaresOf(targets)).toContain("c4"); // path two (e4, d4) still clear
  });
});

// ────────────────────────────────────────────────────────
// WOLF — king movement (invisibility is presentation-only)
// ────────────────────────────────────────────────────────
describe("WOLF moves", () => {
  it("moves like a king — exactly 8 from e5", () => {
    const w = makePiece("WOLF", "WHITE", "e5");
    const targets = getLegalTargets(w, [w]);
    expect(sorted(targets)).toEqual(KING_E5);
  });

  it("captures adjacent enemies", () => {
    const w = makePiece("WOLF", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "f6");
    const targets = getLegalTargets(w, [w, enemy]);
    expect(kindsOf(targets, "f6")).toContain("capture");
  });
});

// ────────────────────────────────────────────────────────
// MONKEY — king move + horizontal wrap only (NO rank wrap)
// ────────────────────────────────────────────────────────
describe("MONKEY moves", () => {
  it("moves like a king from the center — exactly 8", () => {
    const m = makePiece("MONKEY", "WHITE", "e5");
    const targets = getLegalTargets(m, [m]);
    expect(sorted(targets)).toEqual(KING_E5);
  });

  it("wraps horizontally from a5 to the i-file", () => {
    const m = makePiece("MONKEY", "WHITE", "a5");
    const targets = getLegalTargets(m, [m]);
    expect(sorted(targets)).toEqual([
      "a4",
      "a6",
      "b4",
      "b5",
      "b6",
      "i4",
      "i5",
      "i6",
    ]);
  });

  it("wraps horizontally from i5 to the a-file", () => {
    const m = makePiece("MONKEY", "WHITE", "i5");
    const targets = getLegalTargets(m, [m]);
    expect(sorted(targets)).toEqual([
      "a4",
      "a5",
      "a6",
      "h4",
      "h5",
      "h6",
      "i4",
      "i6",
    ]);
  });

  it("on launch pad e0 reaches 5 squares and does NOT teleport to e10", () => {
    const m = makePiece("MONKEY", "WHITE", "e0");
    const targets = getLegalTargets(m, [m]);
    expect(sorted(targets)).toEqual(["d0", "d1", "e1", "f0", "f1"]);
    expect(squaresOf(targets)).not.toContain("e10");
  });

  it("on launch pad e10 reaches 5 squares and does NOT teleport to e0", () => {
    const m = makePiece("MONKEY", "BLACK", "e10");
    const targets = getLegalTargets(m, [m]);
    expect(sorted(targets)).toEqual(["d10", "d9", "e9", "f10", "f9"]);
    expect(squaresOf(targets)).not.toContain("e0");
  });

  it("does not wrap vertically on the a-file: a1 cannot reach a10", () => {
    const m = makePiece("MONKEY", "WHITE", "a1");
    const targets = getLegalTargets(m, [m]);
    const squares = squaresOf(targets);
    expect(squares).not.toContain("a10");
    expect(squares).not.toContain("a0");
  });
});

// ────────────────────────────────────────────────────────
// ANTELOPE — king move + far-enemy swap
// ────────────────────────────────────────────────────────
describe("ANTELOPE swap mechanic", () => {
  it("shows a swap target for a non-adjacent enemy", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "a5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemy], context);
    expect(kindsOf(targets, "a5")).toContain("swap");
  });

  it("still has full king movement alongside the swap", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "a5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemy], context);
    expect(targets).toHaveLength(9); // 8 king + 1 swap
    for (const square of KING_E5) {
      expect(squaresOf(targets)).toContain(square);
    }
  });

  it("does not show a swap for an ADJACENT enemy (captured via king move instead)", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "e6");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemy], context);
    expect(kindsOf(targets, "e6")).toContain("capture");
    expect(kindsOf(targets, "e6")).not.toContain("swap");
  });

  it("does not show swap targets for WOLF (invisible to Antelope radar)", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const wolf = makePiece("WOLF", "BLACK", "a5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, wolf], context);
    expect(targets.filter((t) => t.kind === "swap")).toHaveLength(0);
  });

  it("no swap when powerUsed is true", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5", { powerUsed: true });
    const enemy = makePiece("BULL", "BLACK", "a5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemy], context);
    expect(targets.filter((t) => t.kind === "swap")).toHaveLength(0);
  });

  it("swap is available on move 6 (teamMoveCount 5)", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "a5");
    const context = { teamMoveCount: 5, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemy], context);
    expect(kindsOf(targets, "a5")).toContain("swap");
  });

  it("swap is BLOCKED on move 7 (teamMoveCount 6)", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "a5");
    const context = { teamMoveCount: 6, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemy], context);
    expect(targets.filter((t) => t.kind === "swap")).toHaveLength(0);
    expect(targets).toHaveLength(8); // king moves still present
  });

  it("swap is BLOCKED on move 8 (teamMoveCount 7)", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "a5");
    const context = { teamMoveCount: 7, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemy], context);
    expect(targets.filter((t) => t.kind === "swap")).toHaveLength(0);
    expect(targets).toHaveLength(8);
  });

  it("can swap with an enemy on a launch pad", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "e0");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemy], context);
    expect(kindsOf(targets, "e0")).toContain("swap");
  });

  it("cannot swap from far away onto a HOME square (d5/e5/f5)", () => {
    const a = makePiece("ANTELOPE", "WHITE", "a1");
    const enemyOnHome = makePiece("BULL", "BLACK", "d5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemyOnHome], context);
    // d5 is a home candidate, far from a1 — swap must be suppressed
    expect(targets.filter((t) => t.kind === "swap")).toHaveLength(0);
    expect(squaresOf(targets)).not.toContain("d5");
  });

  it("cannot swap onto ANY of the three home candidate squares from afar", () => {
    const a = makePiece("ANTELOPE", "WHITE", "a1");
    const enemyOnD = makePiece("BULL", "BLACK", "d5");
    const enemyOnE = makePiece("BULL", "BLACK", "e5");
    const enemyOnF = makePiece("BULL", "BLACK", "f5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(
      a,
      [a, enemyOnD, enemyOnE, enemyOnF],
      context,
    );
    const swaps = targets.filter((t) => t.kind === "swap");
    expect(swaps).toHaveLength(0);
    for (const home of ["d5", "e5", "f5"]) {
      expect(squaresOf(targets)).not.toContain(home);
    }
  });

  it("still captures an ADJACENT enemy that happens to sit on a home square (normal king move)", () => {
    const a = makePiece("ANTELOPE", "WHITE", "e5");
    const enemyOnAdjacentHome = makePiece("BULL", "BLACK", "d5");
    const context = { teamMoveCount: 0, moveLimit: 8 };
    const targets = getLegalTargets(a, [a, enemyOnAdjacentHome], context);
    // Physically adjacent — the Antelope may step onto d5 to capture it.
    expect(kindsOf(targets, "d5")).toContain("capture");
    expect(kindsOf(targets, "d5")).not.toContain("swap");
  });
});

// ────────────────────────────────────────────────────────
// SKUNK — king move + aura landing restriction
// ────────────────────────────────────────────────────────
describe("SKUNK moves", () => {
  it("moves like a king — exactly 8 from e5", () => {
    const s = makePiece("SKUNK", "WHITE", "e5");
    const targets = getLegalTargets(s, [s]);
    expect(sorted(targets)).toEqual(KING_E5);
  });

  it("a moving Skunk is never blocked by its own aura or another Skunk's aura", () => {
    const skunk = makePiece("SKUNK", "WHITE", "e5");
    const other = makePiece("SKUNK", "BLACK", "f5");
    const targets = getLegalTargets(skunk, [skunk, other]);
    expect(sorted(targets)).toEqual(KING_E5);
  });
});

describe("SKUNK aura restriction (applies to every other piece)", () => {
  it("prevents a WARRIOR from landing on squares adjacent to an enemy Skunk", () => {
    const skunk = makePiece("SKUNK", "BLACK", "g5");
    const warrior = makePiece("WARRIOR", "WHITE", "e5");
    const targets = getLegalTargets(warrior, [warrior, skunk]);
    const squares = squaresOf(targets);
    // Restricted squares around g5: f4, f5, f6, g4, g6, h4, h5, h6
    for (const square of ["f4", "f5", "f6", "h5"]) {
      expect(squares).not.toContain(square);
    }
  });

  it("still allows direct capture of the Skunk itself despite its aura", () => {
    const skunk = makePiece("SKUNK", "BLACK", "g5");
    const warrior = makePiece("WARRIOR", "WHITE", "e5");
    const targets = getLegalTargets(warrior, [warrior, skunk]);
    expect(kindsOf(targets, "g5")).toContain("capture");
  });

  it("allows a NINJA to leap past the aura but not land on an aura square", () => {
    const skunk = makePiece("SKUNK", "BLACK", "g5");
    const ninja = makePiece("NINJA", "WHITE", "e5");
    const targets = getLegalTargets(ninja, [ninja, skunk]);
    const squares = squaresOf(targets);
    // Restricted squares around g5 that Ninja can also reach: f4, f5, f6, h5
    expect(squares).not.toContain("f5");
    expect(squares).not.toContain("f6");
    expect(squares).not.toContain("f4");
    expect(squares).not.toContain("h5");
    // Squares past the aura remain reachable (Ninja jumps)
    expect(squares).toContain("g7");
    expect(squares).toContain("h8");
    // Direct capture of the Skunk is still legal
    expect(kindsOf(targets, "g5")).toContain("capture");
  });

  it("lets a UNICORN directly capture an enemy Skunk it can leap onto", () => {
    const skunk = makePiece("SKUNK", "BLACK", "h6");
    const unicorn = makePiece("UNICORN", "WHITE", "e5");
    const targets = getLegalTargets(unicorn, [unicorn, skunk]);
    expect(kindsOf(targets, "h6")).toContain("capture");
  });

  it("unions the auras of multiple Skunks", () => {
    const skunk1 = makePiece("SKUNK", "BLACK", "f5");
    const skunk2 = makePiece("SKUNK", "BLACK", "h8");
    const warrior = makePiece("WARRIOR", "WHITE", "e5");
    const targets = getLegalTargets(warrior, [warrior, skunk1, skunk2]);
    const squares = squaresOf(targets);
    // Around f5: e4, e5, e6, f4, f6, g4, g5, g6
    expect(squares).not.toContain("e4");
    expect(squares).not.toContain("e6");
    expect(squares).not.toContain("f6");
    expect(squares).not.toContain("g6");
    // Around h8: g7, g8, g9, h7, h9, i7, i8, i9
    expect(squares).not.toContain("g7");
    expect(squares).not.toContain("g9");
    expect(squares).not.toContain("h9");
    expect(squares).not.toContain("i9");
    // Direct captures of both Skunks remain legal
    expect(kindsOf(targets, "f5")).toContain("capture");
    expect(kindsOf(targets, "h8")).toContain("capture");
  });

  it("does not restrict squares already occupied by friendly pieces", () => {
    // Restriction only prevents NEW landings; a friendly piece sitting
    // next to a Skunk is not forced off.
    const skunk = makePiece("SKUNK", "BLACK", "g5");
    const ally = makePiece("BULL", "WHITE", "f5");
    const warrior = makePiece("WARRIOR", "WHITE", "e5");
    const targets = getLegalTargets(warrior, [warrior, skunk, ally]);
    // f5 is occupied by the friendly Bull — it is not a landing square at all
    expect(squaresOf(targets)).not.toContain("f5");
  });
});

// ────────────────────────────────────────────────────────
// SNAKE — 1-step diagonal, colour-bound
// ────────────────────────────────────────────────────────
describe("SNAKE moves", () => {
  it("moves exactly one step diagonally — 4 from e5", () => {
    const s = makePiece("SNAKE", "WHITE", "e5");
    const targets = getLegalTargets(s, [s]);
    expect(sorted(targets)).toEqual(["d4", "d6", "f4", "f6"]);
  });

  it("captures diagonally but never moves straight", () => {
    const s = makePiece("SNAKE", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "f6");
    const targets = getLegalTargets(s, [s, enemy]);
    expect(kindsOf(targets, "f6")).toContain("capture");
    expect(squaresOf(targets)).not.toContain("e6");
  });
});

// ────────────────────────────────────────────────────────
// BULL — forward/backward move, forward capture
// ────────────────────────────────────────────────────────
describe("BULL moves", () => {
  it("WHITE Bull moves forward and backward into empty squares", () => {
    const b = makePiece("BULL", "WHITE", "e5");
    const targets = getLegalTargets(b, [b]);
    expect(sorted(targets)).toEqual(["e4", "e6"]);
  });

  it("BLACK Bull moves in the opposite direction", () => {
    const b = makePiece("BULL", "BLACK", "e5");
    const targets = getLegalTargets(b, [b]);
    expect(sorted(targets)).toEqual(["e4", "e6"]);
  });

  it("captures forward and on both forward diagonals", () => {
    const b = makePiece("BULL", "WHITE", "e5");
    const enemyF = makePiece("SOLDIER", "BLACK", "e6");
    const enemyD = makePiece("SOLDIER", "BLACK", "f6");
    const targets = getLegalTargets(b, [b, enemyF, enemyD]);
    expect(kindsOf(targets, "e6")).toContain("capture");
    expect(kindsOf(targets, "f6")).toContain("capture");
    // Backward move to e4 remains
    expect(squaresOf(targets)).toContain("e4");
  });

  it("cannot move forward into an occupied square", () => {
    const b = makePiece("BULL", "WHITE", "e5");
    const blocker = makePiece("SOLDIER", "BLACK", "e6");
    const targets = getLegalTargets(b, [b, blocker]);
    // e6 occupied: no plain move, and it IS a capture here
    expect(kindsOf(targets, "e6")).toContain("capture");
  });

  it("WHITE Bull on e9 reaches the e10 launch pad", () => {
    const b = makePiece("BULL", "WHITE", "e9");
    const targets = getLegalTargets(b, [b]);
    expect(sorted(targets)).toEqual(["e10", "e8"]);
  });

  it("BLACK Bull on e1 reaches the e0 launch pad", () => {
    const b = makePiece("BULL", "BLACK", "e1");
    const targets = getLegalTargets(b, [b]);
    expect(sorted(targets)).toEqual(["e0", "e2"]);
  });
});

// ────────────────────────────────────────────────────────
// SOLDIER — forward 1 + diagonal capture
// ────────────────────────────────────────────────────────
describe("SOLDIER moves", () => {
  it("WHITE Soldier moves forward one (increasing rank)", () => {
    const s = makePiece("SOLDIER", "WHITE", "e4");
    const targets = getLegalTargets(s, [s]);
    expect(sorted(targets)).toEqual(["e5"]);
  });

  it("BLACK Soldier moves forward one (decreasing rank)", () => {
    const s = makePiece("SOLDIER", "BLACK", "e6");
    const targets = getLegalTargets(s, [s]);
    expect(sorted(targets)).toEqual(["e5"]);
  });

  it("cannot move forward if blocked", () => {
    const s = makePiece("SOLDIER", "WHITE", "e4");
    const blocker = makePiece("BULL", "BLACK", "e5");
    const targets = getLegalTargets(s, [s, blocker]);
    expect(squaresOf(targets)).not.toContain("e5");
  });

  it("captures on both forward diagonals only", () => {
    const s = makePiece("SOLDIER", "WHITE", "e4");
    const enemyL = makePiece("BULL", "BLACK", "d5");
    const enemyR = makePiece("BULL", "BLACK", "f5");
    const targets = getLegalTargets(s, [s, enemyL, enemyR]);
    expect(kindsOf(targets, "d5")).toContain("capture");
    expect(kindsOf(targets, "f5")).toContain("capture");
    expect(squaresOf(targets)).not.toContain("d3");
    expect(squaresOf(targets)).not.toContain("f3");
  });

  it("cannot capture a friendly diagonal piece", () => {
    const s = makePiece("SOLDIER", "WHITE", "e4");
    const ally = makePiece("BULL", "WHITE", "f5");
    const targets = getLegalTargets(s, [s, ally]);
    expect(squaresOf(targets)).not.toContain("f5");
  });

  it("WHITE Soldier on e9 reaches the e10 launch pad", () => {
    const s = makePiece("SOLDIER", "WHITE", "e9");
    const targets = getLegalTargets(s, [s]);
    expect(sorted(targets)).toEqual(["e10"]);
  });

  it("BLACK Soldier on e1 reaches the e0 launch pad", () => {
    const s = makePiece("SOLDIER", "BLACK", "e1");
    const targets = getLegalTargets(s, [s]);
    expect(sorted(targets)).toEqual(["e0"]);
  });
});

// ────────────────────────────────────────────────────────
// Interaction: friendly vs enemy occupancy
// ────────────────────────────────────────────────────────
describe("occupancy interactions", () => {
  it("friendly pieces are never targets and never passed through by sliders", () => {
    const w = makePiece("WARRIOR", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "f5");
    const targets = getLegalTargets(w, [w, ally]);
    const squares = squaresOf(targets);
    expect(squares).not.toContain("f5");
    expect(squares).not.toContain("g5");
    expect(squares).not.toContain("h5");
    expect(squares).not.toContain("i5");
  });

  it("enemy pieces are capture targets and stop sliders", () => {
    const w = makePiece("WARRIOR", "WHITE", "e5");
    const enemy = makePiece("BULL", "BLACK", "f5");
    const targets = getLegalTargets(w, [w, enemy]);
    expect(kindsOf(targets, "f5")).toContain("capture");
    expect(squaresOf(targets)).not.toContain("g5");
  });

  it("jumpers can capture enemies on the far side of friendly blockers", () => {
    const h = makePiece("HORSE", "WHITE", "e5");
    const ally = makePiece("BULL", "WHITE", "f6");
    const enemy = makePiece("BULL", "BLACK", "f7");
    const targets = getLegalTargets(h, [h, ally, enemy]);
    expect(kindsOf(targets, "f7")).toContain("capture");
  });
});

// ────────────────────────────────────────────────────────
// getLegalTargets edge cases
// ────────────────────────────────────────────────────────
describe("getLegalTargets edge cases", () => {
  it("returns an empty array for a null piece", () => {
    expect(getLegalTargets(null, [])).toEqual([]);
  });

  it("returns an empty array for an unknown piece type", () => {
    const unknown = makePiece("CHIMERA", "WHITE", "e5");
    expect(getLegalTargets(unknown, [unknown])).toEqual([]);
  });
});
