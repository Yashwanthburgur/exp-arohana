// ╔══════════════════════════════╗
// ✅ VARIANT CONFIGURATION
// ╚══════════════════════════════╝
//
// Classic  — standard strategic pieces; no magical abilities
// Magical  — Classic + magical/control pieces (Sagittarius, Ninja, Dragon, C-tier)
// Custom   — player-configured piece set
//
// Tier classification:
//   S Classic:  WARRIOR, GAJASHVA
//   S Magical:  + SAGITTARIUS, NINJA
//   A (both):   ELEPHANT, RHINO
//   B Classic:  CAMEL, HORSE, UNICORN, DONKEY, GIRAFFE
//   B Magical:  + DRAGON
//   C (Magical only): WOLF, MONKEY, ANTELOPE, SKUNK
//   D (both):   SNAKE x4, BULL x2, SOLDIER x3

export const VARIANTS = {
  CLASSIC: 'CLASSIC',
  MAGICAL: 'MAGICAL',
  CUSTOM:  'CUSTOM',
}

export const VARIANT_LABELS = {
  CLASSIC: 'Classic',
  MAGICAL: 'Magical',
  CUSTOM:  'Custom',
}

export const VARIANT_DESCRIPTIONS = {
  CLASSIC: 'Strategic pieces only — no magical abilities',
  MAGICAL: 'All pieces including magical and control',
  CUSTOM:  'Handpick your piece set',
}

export const DEFAULT_VARIANT = VARIANTS.CLASSIC

// ╔══════════════════════════════╗
// ✅ TIER POOLS PER VARIANT
// ╚══════════════════════════════╝
//
// Empty tier arrays are excluded from random tier selection during drafting.

export const VARIANT_TIER_POOLS = {
  [VARIANTS.CLASSIC]: {
    S: ['WARRIOR', 'GAJASHVA'],
    A: ['ELEPHANT', 'RHINO'],
    B: ['CAMEL', 'HORSE', 'UNICORN', 'DONKEY', 'GIRAFFE'],
    C: [],   // No C-tier in Classic
    D: ['SNAKE', 'BULL', 'SOLDIER'],
  },

  [VARIANTS.MAGICAL]: {
    S: ['WARRIOR', 'GAJASHVA', 'SAGITTARIUS', 'NINJA'],
    A: ['ELEPHANT', 'RHINO'],
    B: ['CAMEL', 'DRAGON', 'HORSE', 'UNICORN', 'DONKEY', 'GIRAFFE'],
    C: ['WOLF', 'MONKEY', 'ANTELOPE', 'SKUNK'],
    D: ['SNAKE', 'BULL', 'SOLDIER'],
  },
}

// ╔══════════════════════════════╗
// ✅ PIECE LISTS
// ╚══════════════════════════════╝

export const CLASSIC_PIECES = [
  'WARRIOR', 'GAJASHVA',
  'ELEPHANT', 'RHINO',
  'CAMEL', 'HORSE', 'UNICORN', 'DONKEY', 'GIRAFFE',
  'SNAKE', 'BULL', 'SOLDIER',
]

export const MAGICAL_ONLY_PIECES = [
  'SAGITTARIUS', 'NINJA',
  'DRAGON',
  'WOLF', 'MONKEY', 'ANTELOPE', 'SKUNK',
]

export const MAGICAL_PIECES = [...CLASSIC_PIECES, ...MAGICAL_ONLY_PIECES]

// ╔══════════════════════════════╗
// ✅ HELPERS
// ╚══════════════════════════════╝

/**
 * Get non-empty tier pools for a given variant (or custom piece set).
 * Used by the draft system to know which tiers are available.
 */
export function getActiveTierPools(variant, customPieces = null) {
  if (variant === VARIANTS.CUSTOM && customPieces) {
    return buildCustomTierPools(customPieces)
  }

  const pools = VARIANT_TIER_POOLS[variant] ?? VARIANT_TIER_POOLS[VARIANTS.CLASSIC]

  // Filter out empty tiers
  const active = {}
  for (const [tier, pieces] of Object.entries(pools)) {
    if (pieces.length > 0) {
      active[tier] = pieces
    }
  }
  return active
}

/**
 * Build tier pools from a custom piece set.
 * Only includes tiers that have at least one selected piece.
 */
function buildCustomTierPools(customPieces) {
  // We reference the Magical pools as the full catalog of tiers
  const magicalPools = VARIANT_TIER_POOLS[VARIANTS.MAGICAL]
  const active = {}

  for (const [tier, allPieces] of Object.entries(magicalPools)) {
    const allowed = allPieces.filter(p => customPieces.includes(p))
    if (allowed.length > 0) {
      active[tier] = allowed
    }
  }

  return active
}

/**
 * Returns all pieces available in a given variant.
 */
export function getVariantPieceList(variant, customPieces = null) {
  if (variant === VARIANTS.CUSTOM && customPieces) {
    return customPieces
  }
  if (variant === VARIANTS.MAGICAL) return MAGICAL_PIECES
  return CLASSIC_PIECES
}
