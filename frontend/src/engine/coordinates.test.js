import { describe, it, expect } from "vitest";
import {
  files,
  launchFiles,
  squareToPosition,
  positionToSquare,
  isMainBoardSquare,
  isLaunchSquare,
  isPlayableSquare,
} from "./coordinates.js";

// ────────────────────────────────────────────────────────
// Board geometry contract (from documentation.md §3):
//   • Files a–i (9 columns), main ranks 1–9 (9×9 main board)
//   • Launch pads: d0/e0/f0 (White) and d10/e10/f10 (Black)
//   • No other rank 0 or rank 10 squares are playable
// ────────────────────────────────────────────────────────

describe("coordinates — files and squares", () => {
  it("defines nine files a through i", () => {
    expect(files).toEqual(["a", "b", "c", "d", "e", "f", "g", "h", "i"]);
  });

  it("defines d, e, f as launch files", () => {
    expect(launchFiles).toEqual(["d", "e", "f"]);
  });

  it("converts a square to x/y position", () => {
    expect(squareToPosition("a0")).toEqual({ x: 0, y: 0 });
    expect(squareToPosition("e5")).toEqual({ x: 4, y: 5 });
    expect(squareToPosition("i10")).toEqual({ x: 8, y: 10 });
  });

  it("round-trips every playable square through positionToSquare", () => {
    for (let x = 0; x < 9; x++) {
      for (let y = 0; y <= 10; y++) {
        const square = positionToSquare(x, y);
        if (!square) continue;
        const { x: rx, y: ry } = squareToPosition(square);
        expect(rx).toBe(x);
        expect(ry).toBe(y);
      }
    }
  });
});

describe("coordinates — isMainBoardSquare", () => {
  it("accepts ranks 1–9 on all files", () => {
    for (const file of files) {
      for (let rank = 1; rank <= 9; rank++) {
        const x = files.indexOf(file);
        expect(isMainBoardSquare(x, rank)).toBe(true);
      }
    }
  });

  it("rejects rank 0 and rank 10", () => {
    expect(isMainBoardSquare(0, 0)).toBe(false);
    expect(isMainBoardSquare(4, 0)).toBe(false);
    expect(isMainBoardSquare(8, 10)).toBe(false);
    expect(isMainBoardSquare(4, 10)).toBe(false);
  });

  it("rejects out-of-range files", () => {
    expect(isMainBoardSquare(-1, 5)).toBe(false);
    expect(isMainBoardSquare(9, 5)).toBe(false);
  });
});

describe("coordinates — isLaunchSquare", () => {
  it("accepts only d/e/f on ranks 0 and 10", () => {
    const pads = ["d0", "e0", "f0", "d10", "e10", "f10"];
    for (const pad of pads) {
      const { x, y } = squareToPosition(pad);
      expect(isLaunchSquare(x, y)).toBe(true);
    }
  });

  it("rejects non-launch files on ranks 0 and 10", () => {
    // a0, b0, c0, g0, h0, i0, a10 … i10 (except d/e/f) are NOT playable
    const nonPads = [
      "a0",
      "b0",
      "c0",
      "g0",
      "h0",
      "i0",
      "a10",
      "b10",
      "c10",
      "g10",
      "h10",
      "i10",
    ];
    for (const square of nonPads) {
      const { x, y } = squareToPosition(square);
      expect(isLaunchSquare(x, y)).toBe(false);
    }
  });

  it("rejects launch pads on main ranks", () => {
    const { x, y } = squareToPosition("d5");
    expect(isLaunchSquare(x, y)).toBe(false);
  });
});

describe("coordinates — isPlayableSquare and positionToSquare", () => {
  it("returns null for non-playable positions", () => {
    expect(positionToSquare(-1, 5)).toBeNull();
    expect(positionToSquare(9, 5)).toBeNull();
    expect(positionToSquare(0, 0)).toBeNull(); // a0 not a pad
    expect(positionToSquare(0, 10)).toBeNull(); // a10 not a pad
    expect(positionToSquare(4, 11)).toBeNull();
    expect(positionToSquare(4, -1)).toBeNull();
  });

  it("returns squares for all main-board positions", () => {
    for (let x = 0; x < 9; x++) {
      for (let rank = 1; rank <= 9; rank++) {
        expect(positionToSquare(x, rank)).toBe(`${files[x]}${rank}`);
      }
    }
  });

  it("returns squares only for the six launch pads at ranks 0 and 10", () => {
    const pads = ["d0", "e0", "f0", "d10", "e10", "f10"];
    for (const pad of pads) {
      const { x, y } = squareToPosition(pad);
      expect(positionToSquare(x, y)).toBe(pad);
    }

    for (const file of ["a", "b", "c", "g", "h", "i"]) {
      const x = files.indexOf(file);
      expect(positionToSquare(x, 0)).toBeNull();
      expect(positionToSquare(x, 10)).toBeNull();
    }
  });

  it("isPlayableSquare matches positionToSquare validity", () => {
    for (let x = -2; x <= 11; x++) {
      for (let y = -2; y <= 13; y++) {
        expect(isPlayableSquare(x, y)).toBe(positionToSquare(x, y) !== null);
      }
    }
  });

  it("never generates a square outside valid coordinates", () => {
    for (let x = -5; x <= 15; x++) {
      for (let y = -5; y <= 15; y++) {
        const square = positionToSquare(x, y);
        if (square === null) continue;
        const { x: rx, y: ry } = squareToPosition(square);
        // Must be a valid file and a valid rank (0–10)
        expect(files.indexOf(square[0])).toBeGreaterThanOrEqual(0);
        expect(rx).toBeGreaterThanOrEqual(0);
        expect(rx).toBeLessThanOrEqual(8);
        expect(ry).toBeGreaterThanOrEqual(0);
        expect(ry).toBeLessThanOrEqual(10);
        // Must be main board or a launch pad
        expect(isPlayableSquare(rx, ry)).toBe(true);
      }
    }
  });
});
