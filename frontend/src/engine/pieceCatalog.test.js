import { describe, it, expect } from "vitest";
import { PIECE_CATALOG, PIECE_TYPES } from "../engine/pieceCatalog.js";

describe("pieceCatalog", () => {
  // ────────────────────────────────────────────────
  // GAJASHVA (renamed from LANCER)
  // ────────────────────────────────────────────────
  describe("GAJASHVA", () => {
    it("exists in PIECE_TYPES", () => {
      expect(PIECE_TYPES.GAJASHVA).toBe("GAJASHVA");
    });

    it("does not have LANCER in PIECE_TYPES", () => {
      expect(PIECE_TYPES.LANCER).toBeUndefined();
    });

    it("is S-tier with materialScore 9", () => {
      expect(PIECE_CATALOG.GAJASHVA.tier).toBe("S");
      expect(PIECE_CATALOG.GAJASHVA.materialScore).toBe(9);
    });

    it("has correct name", () => {
      expect(PIECE_CATALOG.GAJASHVA.name).toBe("Gajashva");
    });

    it("has canJump true (Knight component)", () => {
      expect(PIECE_CATALOG.GAJASHVA.canJump).toBe(true);
    });
  });

  // ────────────────────────────────────────────────
  // WARRIOR
  // ────────────────────────────────────────────────
  describe("WARRIOR", () => {
    it("is S-tier", () => {
      expect(PIECE_CATALOG.WARRIOR.tier).toBe("S");
    });
  });

  // ────────────────────────────────────────────────
  // SOLDIER
  // ────────────────────────────────────────────────
  describe("SOLDIER", () => {
    it("is D-tier with comboCount 3", () => {
      expect(PIECE_CATALOG.SOLDIER.tier).toBe("D");
      expect(PIECE_CATALOG.SOLDIER.comboCount).toBe(3);
    });

    it("has correct promotion description in movement", () => {
      expect(PIECE_CATALOG.SOLDIER.movement).toMatch(/promot/i);
    });
  });

  // ────────────────────────────────────────────────
  // SKUNK
  // ────────────────────────────────────────────────
  describe("SKUNK", () => {
    it("is C-tier", () => {
      expect(PIECE_CATALOG.SKUNK.tier).toBe("C");
    });
  });

  // ────────────────────────────────────────────────
  // WOLF
  // ────────────────────────────────────────────────
  describe("WOLF", () => {
    it("is C-tier", () => {
      expect(PIECE_CATALOG.WOLF.tier).toBe("C");
    });
  });

  // ────────────────────────────────────────────────
  // All pieces have required fields
  // ────────────────────────────────────────────────
  describe("schema integrity", () => {
    const requiredFields = ["name", "shortName", "tier", "materialScore", "comboCount", "movement"];

    Object.entries(PIECE_CATALOG).forEach(([type, entry]) => {
      it(`${type} has all required fields`, () => {
        requiredFields.forEach((field) => {
          expect(entry).toHaveProperty(field);
        });
      });

      it(`${type} has valid tier (S/A/B/C/D)`, () => {
        expect(["S", "A", "B", "C", "D"]).toContain(entry.tier);
      });
    });
  });
});
