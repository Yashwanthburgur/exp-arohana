import { describe, it, expect } from "vitest";
import {
  VARIANTS,
  VARIANT_TIER_POOLS,
  getActiveTierPools,
  CLASSIC_PIECES,
  MAGICAL_PIECES,
  MAGICAL_ONLY_PIECES,
} from "../constants/variantConfig.js";

describe("variantConfig", () => {
  // ────────────────────────────────────────────────
  // Classic variant tier pools
  // ────────────────────────────────────────────────
  describe("CLASSIC variant pools", () => {
    const pools = VARIANT_TIER_POOLS[VARIANTS.CLASSIC];

    it("has WARRIOR and GAJASHVA in S tier", () => {
      expect(pools.S).toContain("WARRIOR");
      expect(pools.S).toContain("GAJASHVA");
    });

    it("does NOT contain LANCER (renamed to GAJASHVA)", () => {
      Object.values(pools).forEach((tier) => {
        expect(tier).not.toContain("LANCER");
      });
    });

    it("has no C-tier pieces in Classic", () => {
      expect(pools.C).toHaveLength(0);
    });

    it("has SNAKE, BULL, SOLDIER in D tier", () => {
      expect(pools.D).toContain("SNAKE");
      expect(pools.D).toContain("BULL");
      expect(pools.D).toContain("SOLDIER");
    });

    it("has GIRAFFE in B tier", () => {
      expect(pools.B).toContain("GIRAFFE");
    });
  });

  // ────────────────────────────────────────────────
  // Magical variant tier pools
  // ────────────────────────────────────────────────
  describe("MAGICAL variant pools", () => {
    const pools = VARIANT_TIER_POOLS[VARIANTS.MAGICAL];

    it("has SAGITTARIUS and NINJA in S tier", () => {
      expect(pools.S).toContain("SAGITTARIUS");
      expect(pools.S).toContain("NINJA");
    });

    it("has WOLF in C tier (Magical only)", () => {
      expect(pools.C).toContain("WOLF");
    });

    it("has MONKEY, ANTELOPE, SKUNK in C tier", () => {
      expect(pools.C).toContain("MONKEY");
      expect(pools.C).toContain("ANTELOPE");
      expect(pools.C).toContain("SKUNK");
    });

    it("has DRAGON in B tier", () => {
      expect(pools.B).toContain("DRAGON");
    });
  });

  // ────────────────────────────────────────────────
  // getActiveTierPools
  // ────────────────────────────────────────────────
  describe("getActiveTierPools", () => {
    it("returns non-empty tiers for CLASSIC (no C tier)", () => {
      const active = getActiveTierPools(VARIANTS.CLASSIC);
      expect("C" in active).toBe(false);
      expect("S" in active).toBe(true);
      expect("D" in active).toBe(true);
    });

    it("returns C tier for MAGICAL", () => {
      const active = getActiveTierPools(VARIANTS.MAGICAL);
      expect("C" in active).toBe(true);
      expect(active.C).toContain("WOLF");
    });

    it("builds correct custom pools from a selection", () => {
      const customPieces = ["WARRIOR", "ELEPHANT", "SKUNK"];
      const active = getActiveTierPools(VARIANTS.CUSTOM, customPieces);
      expect(active.S).toContain("WARRIOR");
      expect(active.A).toContain("ELEPHANT");
      expect(active.C).toContain("SKUNK");
      // No B tier selected
      expect("B" in active).toBe(false);
    });

    it("excludes a tier from custom pools if no pieces selected from it", () => {
      // Only select D-tier pieces
      const customPieces = ["SNAKE", "BULL"];
      const active = getActiveTierPools(VARIANTS.CUSTOM, customPieces);
      expect("S" in active).toBe(false);
      expect("A" in active).toBe(false);
      expect("D" in active).toBe(true);
    });
  });

  // ────────────────────────────────────────────────
  // Piece list helpers
  // ────────────────────────────────────────────────
  describe("piece lists", () => {
    it("CLASSIC_PIECES does not include magical pieces", () => {
      MAGICAL_ONLY_PIECES.forEach((p) => {
        expect(CLASSIC_PIECES).not.toContain(p);
      });
    });

    it("MAGICAL_PIECES includes all CLASSIC_PIECES", () => {
      CLASSIC_PIECES.forEach((p) => {
        expect(MAGICAL_PIECES).toContain(p);
      });
    });

    it("MAGICAL_PIECES includes all MAGICAL_ONLY_PIECES", () => {
      MAGICAL_ONLY_PIECES.forEach((p) => {
        expect(MAGICAL_PIECES).toContain(p);
      });
    });

    it("WOLF is in MAGICAL_ONLY and not in CLASSIC", () => {
      expect(MAGICAL_ONLY_PIECES).toContain("WOLF");
      expect(CLASSIC_PIECES).not.toContain("WOLF");
    });
  });
});
