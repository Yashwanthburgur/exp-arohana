// ╔══════════════════════════════╗
// ✅ CANONICAL BOARD CONFIGURATION
// ╚══════════════════════════════╝
//
// Single source of truth for board dimensions, special squares,
// and gameplay constants. Import from here — never hardcode elsewhere.

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
export const LAUNCH_FILES = ['d', 'e', 'f']

// Support row file order (center-first for placement priority)
export const SUPPORT_ROW_FILES = ['e', 'd', 'f', 'c', 'g', 'b', 'h', 'a', 'i']

// Launch pad squares (spawn zone for non-support pieces)
export const WHITE_LAUNCH_PADS = ['d0', 'e0', 'f0']
export const BLACK_LAUNCH_PADS = ['d10', 'e10', 'f10']

// Support row ranks (spawn zone for support-type pieces)
export const WHITE_SUPPORT_RANK = 1
export const BLACK_SUPPORT_RANK = 9

// Home squares (3 center squares; 2 are randomly assigned each match)
export const HOME_SQUARES = ['d5', 'e5', 'f5']

// Move limit before a spawn is triggered
export const MOVE_LIMIT = 8

// Required draft rolls before a player can set Ready
export const REQUIRED_DRAFT_ROLLS = 8

// ╔══════════════════════════════╗
// ✅ SUPPORT TYPE REGISTRY
// ╚══════════════════════════════╝
//
// Pieces tagged here spawn from the support row (rank 1/9)
// rather than launch pads. C-tier pieces (Wolf, Monkey, Antelope, Skunk)
// are on the support row; non-tagged pieces use launch pads.

export const SUPPORT_TYPES = [
  'SOLDIER',   // D-tier combo x3
  'SNAKE',     // D-tier combo x4
  'BULL',      // D-tier combo x2
  'MONKEY',    // C-tier magical
  'WOLF',      // C-tier magical (invisible)
  'ANTELOPE',  // C-tier magical (swap)
  'SKUNK',     // C-tier magical (aura)
]

// ╔══════════════════════════════╗
// ✅ BOARD UTILITY HELPERS
// ╚══════════════════════════════╝

export function getSupportSpawnSquares(color) {
  const rank = color === 'WHITE' ? WHITE_SUPPORT_RANK : BLACK_SUPPORT_RANK
  return SUPPORT_ROW_FILES.map(file => `${file}${rank}`)
}

export function getLaunchPads(color) {
  return color === 'WHITE' ? WHITE_LAUNCH_PADS : BLACK_LAUNCH_PADS
}

export function isSupportType(type) {
  return SUPPORT_TYPES.includes(type)
}
