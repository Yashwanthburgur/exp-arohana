export const PIECE_TYPES = {
  WARRIOR: "WARRIOR",
  SAGITTARIUS: "SAGITTARIUS",
  NINJA: "NINJA",

  AIRAVATA: "AIRAVATA",
  JATAYU: "JATAYU",

  ELEPHANT: "ELEPHANT",
  RHINO: "RHINO",
  GIRAFFE: "GIRAFFE",

  CAMEL: "CAMEL",
  DRAGON: "DRAGON",
  HORSE: "HORSE",
  UNICORN: "UNICORN",
  DONKEY: "DONKEY",

  WOLF: "WOLF",
  MONKEY: "MONKEY",
  ANTELOPE: "ANTELOPE",
  SKUNK: "SKUNK",

  SNAKE: "SNAKE",
  BULL: "BULL",
  SOLDIER: "SOLDIER",
};

export const PIECE_CATALOG = {
  [PIECE_TYPES.WARRIOR]: {
    name: "Warrior",
    shortName: "Wr",
    tier: "S",
    materialScore: 9,
    comboCount: 1,
    comboTotal: 9,
    movement: "Queen movement; unlimited straight/diagonal; no jump",
    canJump: false,
  },

  [PIECE_TYPES.SAGITTARIUS]: {
    name: "Sagittarius",
    shortName: "Sg",
    tier: "S",
    materialScore: 9,
    comboCount: 1,
    comboTotal: 9,
    movement: "1–3 any direction without jump + knight move with jump",
    canJump: true,
  },

  [PIECE_TYPES.NINJA]: {
    name: "Ninja",
    shortName: "Nj",
    tier: "S",
    materialScore: 9,
    comboCount: 1,
    comboTotal: 9,
    movement: "1–3 any direction, always jumps",
    canJump: true,
  },

  [PIECE_TYPES.AIRAVATA]: {
    name: "Airavata",
    shortName: "Ar",
    tier: "S",
    materialScore: 9,
    comboCount: 1,
    comboTotal: 9,
    movement: "Elephant (Rook, no jump) + Horse (2+1 leap, jumps)",
    canJump: true,
  },

  [PIECE_TYPES.JATAYU]: {
    name: "Jatayu",
    shortName: "Jt",
    tier: "S",
    materialScore: 8,
    comboCount: 1,
    comboTotal: 8,
    movement: "Camel (diagonal slide, no jump) + Horse (2+1 leap, jumps)",
    canJump: true,
  },

  [PIECE_TYPES.ELEPHANT]: {
    name: "Elephant",
    shortName: "El",
    tier: "A",
    materialScore: 5.5,
    comboCount: 1,
    comboTotal: 5.5,
    movement: "Rook movement; no jump",
    canJump: false,
  },

  [PIECE_TYPES.RHINO]: {
    name: "Rhino",
    shortName: "Rh",
    tier: "A",
    materialScore: 5,
    comboCount: 1,
    comboTotal: 5,
    movement: "Bishop movement + king move; no jump",
    canJump: false,
  },

  [PIECE_TYPES.GIRAFFE]: {
    name: "Giraffe",
    shortName: "Gf",
    tier: "B",
    materialScore: 4,
    comboCount: 1,
    comboTotal: 4,
    movement: "2–3 squares straight; jumps",
    canJump: true,
  },

  [PIECE_TYPES.CAMEL]: {
    name: "Camel",
    shortName: "Cm",
    tier: "B",
    materialScore: 4,
    comboCount: 1,
    comboTotal: 4,
    movement: "Bishop movement; no jump; colour-bound",
    canJump: false,
  },

  [PIECE_TYPES.DRAGON]: {
    name: "Dragon",
    shortName: "Dg",
    tier: "B",
    materialScore: 4,
    comboCount: 1,
    comboTotal: 4,
    movement: "3+1 knight move with horizontal edge-leap; jumps",
    canJump: true,
  },

  [PIECE_TYPES.HORSE]: {
    name: "Horse",
    shortName: "Hs",
    tier: "B",
    materialScore: 3.5,
    comboCount: 1,
    comboTotal: 3.5,
    movement: "Knight 2+1; jumps",
    canJump: true,
  },

  [PIECE_TYPES.UNICORN]: {
    name: "Unicorn",
    shortName: "Un",
    tier: "B",
    materialScore: 3.5,
    comboCount: 1,
    comboTotal: 3.5,
    movement: "Knight 3+1; jumps",
    canJump: true,
  },

  [PIECE_TYPES.DONKEY]: {
    name: "Donkey",
    shortName: "Dk",
    tier: "B",
    materialScore: 2.5,
    comboCount: 1,
    comboTotal: 2.5,
    movement: "Knight 2+1; no jump",
    canJump: false,
  },

  [PIECE_TYPES.WOLF]: {
    name: "Wolf",
    shortName: "Wf",
    tier: "C",
    materialScore: 2.5,
    comboCount: 1,
    comboTotal: 2.5,
    movement: "Invisible to both players",
    canJump: false,
  },

  [PIECE_TYPES.MONKEY]: {
    name: "Monkey",
    shortName: "Mk",
    tier: "C",
    materialScore: 2.5,
    comboCount: 1,
    comboTotal: 2.5,
    movement: "King move + horizontal edge-leap",
    canJump: true,
  },

  [PIECE_TYPES.ANTELOPE]: {
    name: "Antelope",
    shortName: "An",
    tier: "C",
    materialScore: 2.5,
    comboCount: 1,
    comboTotal: 2.5,
    movement: "Once per spawn: swap with adjacent enemy",
    canJump: false,
  },

  [PIECE_TYPES.SKUNK]: {
    name: "Skunk",
    shortName: "Sk",
    tier: "C",
    materialScore: 2.5,
    comboCount: 1,
    comboTotal: 2.5,
    movement: "Stench aura; no piece may stop next to it",
    canJump: false,
  },

  [PIECE_TYPES.SNAKE]: {
    name: "Snake",
    shortName: "Sn",
    tier: "D",
    materialScore: 1,
    comboCount: 4,
    comboTotal: 4,
    movement: "1-step diagonal; colour-bound",
    canJump: false,
  },

  [PIECE_TYPES.BULL]: {
    name: "Bull",
    shortName: "Bu",
    tier: "D",
    materialScore: 1.5,
    comboCount: 2,
    comboTotal: 3,
    movement: "Forward/backward; captures all 3 forward",
    canJump: false,
  },

  [PIECE_TYPES.SOLDIER]: {
    name: "Soldier",
    shortName: "So",
    tier: "D",
    materialScore: 1,
    comboCount: 3,
    comboTotal: 3,
    movement:
      "Forward 1 + diagonal capture; promotes on reaching enemy back rank",
    canJump: false,
  },
};
