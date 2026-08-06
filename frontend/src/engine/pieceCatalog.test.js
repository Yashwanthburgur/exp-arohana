import { describe, it, expect } from "vitest";
import { PIECE_CATALOG, PIECE_TYPES } from "../engine/pieceCatalog.js";

describe("pieceCatalog", () => {
  // ────────────────────────────────────────────────
  // AIRAVATA (renamed from GAJASHVA/LANCER)
  // ────────────────────────────────────────────────
  describe("AIRAVATA", () => {
    it("exists in PIECE_TYPES", () => {
      expect(PIECE_TYPES.AIRAVATA).toBe("AIRAVATA");
    });

    it("does not have GAJASHVA or LANCER in PIECE_TYPES", () => {
      expect(PIECE_TYPES.GAJASHVA).toBeUndefined();
      expect(PIECE_TYPES.LANCER).toBeUndefined();
    });

    it("is S-tier with materialScore 9", () => {
      expect(PIECE_CATALOG.AIRAVATA.tier).toBe("S");
      expect(PIECE_CATALOG.AIRAVATA.materialScore).toBe(9);
    });

    it("has correct name", () => {
      expect(PIECE_CATALOG.AIRAVATA.name).toBe("Airavata");
    });

    it("has canJump true (Knight component)", () => {
      expect(PIECE_CATALOG.AIRAVATA.canJump).toBe(true);
    });
  });

  // ────────────────────────────────────────────────
  // JATAYU (S-tier Camel + Horse)
  // ────────────────────────────────────────────────
  describe("JATAYU", () => {
    it("exists in PIECE_TYPES", () => {
      expect(PIECE_TYPES.JATAYU).toBe("JATAYU");
    });

    it("is S-tier with materialScore 8 and comboCount 1", () => {
      expect(PIECE_CATALOG.JATAYU.tier).toBe("S");
      expect(PIECE_CATALOG.JATAYU.materialScore).toBe(8);
      expect(PIECE_CATALOG.JATAYU.comboCount).toBe(1);
      expect(PIECE_CATALOG.JATAYU.comboTotal).toBe(8);
    });

    it("has correct name and abbreviation", () => {
      expect(PIECE_CATALOG.JATAYU.name).toBe("Jatayu");
      expect(PIECE_CATALOG.JATAYU.shortName).toBe("Jt");
    });

    it("has canJump true (Knight component)", () => {
      expect(PIECE_CATALOG.JATAYU.canJump).toBe(true);
    });

    it("movement mentions Camel and Horse", () => {
      expect(PIECE_CATALOG.JATAYU.movement).toMatch(/Camel/i);
      expect(PIECE_CATALOG.JATAYU.movement).toMatch(/Horse/i);
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
    const requiredFields = [
      "name",
      "shortName",
      "tier",
      "materialScore",
      "comboCount",
      "movement",
    ];

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
