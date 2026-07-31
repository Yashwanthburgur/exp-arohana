/**
 * SVG-based piece icons for ĀROHAṆA - RAṆA
 * Chess.com / Lichess style — clean, instantly recognizable silhouettes
 * White pieces = cream fill with dark stroke; Black pieces = dark fill with light stroke
 */

const WHITE_FILL = '#f5f0e8'
const WHITE_STROKE = '#2a2a2a'
const BLACK_FILL = '#1a1a1a'
const BLACK_STROKE = '#e8d5b5'

function PieceSvgBase({ children, size = 40, className = '', color = 'WHITE' }) {
  const fill = color === 'BLACK' ? BLACK_FILL : WHITE_FILL
  const stroke = color === 'BLACK' ? BLACK_STROKE : WHITE_STROKE

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {children({ fill, stroke })}
    </svg>
  )
}

/* ── Elephant ──
   Clean side-profile: large body, curved trunk, visible tusks, big ear, stubby legs. */
export function ElephantIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M72 44 C72 30 64 22 54 22 C46 22 38 26 34 32 C30 26 22 24 18 30 C14 36 16 44 20 48 L18 72 C18 76 22 80 26 80 L34 80 L34 68 C34 66 36 64 38 64 L46 64 C48 64 50 66 50 68 L50 80 L58 80 L58 68 C58 66 60 64 62 64 L70 64 C72 64 74 66 74 68 L74 80 L78 80 C82 80 84 76 84 72 L82 48 C86 44 86 36 82 32 C80 30 76 32 74 36"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M24 36 C20 42 16 50 18 56 C20 60 24 58 26 54" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M28 44 C24 50 28 56 32 52" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M48 26 C44 22 38 24 40 34 C42 38 46 36 48 32" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="38" cy="34" r="2" fill={stroke} />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Unicorn ──
   Horse profile with single prominent horn, flowing mane. */
export function UnicornIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M62 18 C60 16 56 16 54 18 L50 26 C46 22 40 22 36 26 C30 32 28 42 30 50 L28 68 C28 72 32 76 36 76 L42 76 L42 64 C42 62 44 60 46 60 L54 60 C56 60 58 62 58 64 L58 76 L64 76 L64 64 C64 62 66 60 68 60 L76 60 C78 60 80 62 80 64 L80 76 L84 76 C88 76 90 72 90 68 L88 44 C88 36 84 30 78 28 C74 26 68 24 64 20"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M56 18 L52 4 L60 14 Z" fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M64 18 L68 10 L70 20" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="60" cy="24" r="2" fill={stroke} />
          <path d="M54 22 C50 26 48 32 50 38 M52 24 C48 28 46 34 48 40" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M30 50 C26 48 22 50 20 56 C18 60 20 64 24 62" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Warrior ──
   Two crossed swords with pommels and crossguards + center shield emblem. */
export function WarriorIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <line x1="24" y1="18" x2="76" y2="70" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="28" x2="38" y2="20" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <circle cx="24" cy="18" r="3" fill={stroke} />
          <line x1="76" y1="18" x2="24" y2="70" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="28" x2="62" y2="20" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <circle cx="76" cy="18" r="3" fill={stroke} />
          <path d="M50 42 L58 46 L58 54 C58 58 54 62 50 64 C46 62 42 58 42 54 L42 46 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <line x1="50" y1="44" x2="50" y2="62" stroke={stroke} strokeWidth="1.5" opacity="0.5" />
          <line x1="43" y1="52" x2="57" y2="52" stroke={stroke} strokeWidth="1.5" opacity="0.5" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Rhino ──
   Stocky rhinoceros profile with prominent front horn, heavy body. */
export function RhinoIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M78 36 C78 28 72 22 64 22 C58 22 52 24 48 28 L40 26 C36 24 30 26 26 30 L22 38 C18 44 20 50 22 54 L20 68 C20 72 24 76 28 76 L36 76 L36 66 C36 64 38 62 40 62 L50 62 C52 62 54 64 54 66 L54 76 L62 76 L62 66 C62 64 64 62 66 62 L76 62 C78 62 80 64 80 66 L80 76 L84 76 C88 76 90 72 90 68 L88 40 C88 34 84 30 80 30"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M28 30 L22 14 L34 26 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M36 24 L34 18 L40 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="52" cy="32" r="2" fill={stroke} />
          <path d="M66 22 L70 16 L74 22" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Donkey ──
   Donkey/mule profile with long prominent ears. */
export function DonkeyIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M72 38 C72 28 66 22 58 22 C52 22 46 26 42 30 L38 28 C34 26 28 28 26 34 L24 44 C22 50 24 58 28 64 L26 72 C26 76 30 80 34 80 L42 80 L42 66 C42 64 44 62 46 62 L54 62 C56 62 58 64 58 66 L58 80 L66 80 L66 66 C66 64 68 62 70 62 L78 62 C80 62 82 64 82 66 L82 80 L86 80 C90 80 92 76 92 72 L90 44 C90 38 86 34 82 34"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M44 26 L38 6 L50 22" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M56 24 L62 6 L52 20" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="46" cy="32" r="2" fill={stroke} />
          <path d="M28 38 C24 40 22 44 24 48" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M26 52 C22 50 18 52 18 58 C18 62 22 60 24 58" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Horse ──
   Classic knight/horse head — regal, flowing mane. */
export function HorseIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M58 16 C54 14 48 16 46 22 L42 20 C38 18 32 20 28 26 C22 34 20 46 24 54 L22 68 C22 72 26 76 30 76 L38 76 L38 64 C38 62 40 60 42 60 L52 60 C54 60 56 62 56 64 L56 76 L64 76 L64 64 C64 62 66 60 68 60 L78 60 C80 60 82 62 82 64 L82 76 L86 76 C90 76 92 72 92 68 L90 42 C90 34 86 28 80 26 C76 24 68 20 62 18"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M54 16 L50 6 L58 14" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="52" cy="24" r="2" fill={stroke} />
          <path d="M48 18 C44 22 42 28 44 34 M46 20 C42 24 40 30 42 36 M44 22 C40 26 38 32 40 38" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="30" cy="32" r="1.5" fill={stroke} opacity="0.6" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Soldier (pawn) ──
   Simple foot soldier with helmet, tunic, spear tip, base. */
export function SoldierIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <circle cx="50" cy="26" r="10" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <path d="M50 16 C48 12 52 12 50 16 C50 10 50 10 50 16" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M38 40 L42 36 L50 38 L58 36 L62 40 L66 62 L34 62 Z" fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M46 46 L50 44 L54 46 L54 52 L50 54 L46 52 Z" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" opacity="0.5" />
          <rect x="30" y="62" width="40" height="5" rx="2.5" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="50" y1="6" x2="50" y2="0" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M47 2 L50 -2 L53 2" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Wolf ──
   Wolf/dog profile — pointed ears, sharp snout, lean body, bushy tail. */
export function WolfIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M76 36 C76 26 70 20 62 20 C56 20 50 24 46 28 L38 22 C34 18 26 20 22 26 L18 36 C14 44 18 52 24 56 L22 68 C22 72 26 76 30 76 L38 76 L38 64 C38 62 40 60 42 60 L52 60 C54 60 56 62 56 64 L56 76 L64 76 L64 64 C64 62 66 60 68 60 L78 60 C80 60 82 62 82 64 L82 76 L86 76 C90 76 92 72 92 68 L90 40 C90 32 86 28 82 28"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M40 24 L34 8 L46 20" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M52 22 L58 8 L48 18" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M24 36 L16 40 L14 44 L22 44 L24 42" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="44" cy="30" r="2" fill={stroke} />
          <path d="M24 52 C18 48 14 50 12 56 C10 62 14 66 20 62" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Antelope ──
   Graceful antelope with long curved horns. */
export function AntelopeIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M74 38 C74 28 68 22 60 22 C54 22 48 26 44 30 L38 26 C34 22 26 24 22 30 L20 38 C16 46 20 54 26 58 L24 68 C24 72 28 76 32 76 L40 76 L40 64 C40 62 42 60 44 60 L52 60 C54 60 56 62 56 64 L56 76 L64 76 L64 64 C64 62 66 60 68 60 L78 60 C80 60 82 62 82 64 L82 76 L86 76 C90 76 92 72 92 68 L90 40 C90 34 86 30 82 30"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M42 24 C38 16 34 8 30 4" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M52 22 C56 14 60 8 64 4" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="48" cy="32" r="2" fill={stroke} />
          <path d="M26 50 C22 48 18 50 18 54" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Giraffe ──
   Tall neck, small head, ossicones. */
export function GiraffeIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M62 52 C62 44 58 38 50 36 L44 36 C36 36 30 42 28 50 L26 64 C26 68 30 72 34 72 L42 72 L42 62 C42 60 44 58 46 58 L54 58 C56 58 58 60 58 62 L58 72 L66 72 C70 72 72 68 72 64 L70 48 C70 42 66 38 62 38"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M50 36 C48 28 48 18 50 12 C52 8 56 10 54 16 C52 22 52 30 52 36" fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="50" cy="10" rx="8" ry="6" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="46" y1="6" x2="44" y2="0" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <circle cx="44" cy="0" r="1.5" fill={stroke} />
          <line x1="54" y1="6" x2="56" y2="0" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <circle cx="56" cy="0" r="1.5" fill={stroke} />
          <circle cx="54" cy="10" r="1.5" fill={stroke} />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Monarch (king/queen generic fallback) ──
   Crown shape — recognizable as royalty piece. */
export function MonarchIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path d="M30 70 L34 42 L24 50 L50 28 L76 50 L66 42 L70 70 Z" fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="28" y="70" width="44" height="6" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="50" cy="28" r="3" fill={stroke} />
          <circle cx="24" cy="50" r="2" fill={stroke} />
          <circle cx="76" cy="50" r="2" fill={stroke} />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Ninja ──
   4-pointed shuriken / throwing star. */
export function NinjaIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path d="M50 12 L56 40 L88 50 L56 60 L50 88 L44 60 L12 50 L44 40 Z" fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="10" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="50" cy="50" r="3" fill={stroke} />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Sagittarius ──
   Bow and arrow — drawn bow with arrow nocked. */
export function SagittariusIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path d="M32 16 C14 32 14 68 32 84" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="16" x2="32" y2="84" stroke={stroke} strokeWidth="1.5" />
          <line x1="32" y1="50" x2="88" y2="50" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M80 44 L92 50 L80 56" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M36 44 L32 50 L36 56" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── CAMEL ──
   Camel profile — humped back, long neck. */
export function CamelIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M72 42 C72 34 66 28 58 28 C52 28 46 30 42 34 L36 28 C32 24 26 26 22 30 L20 36 C16 42 18 50 22 54 L20 66 C20 70 24 74 28 74 L36 74 L36 62 C36 60 38 58 40 58 L50 58 C52 58 54 60 54 62 L54 74 L62 74 L62 62 C62 60 64 58 66 58 L76 58 C78 58 80 60 80 62 L80 74 L84 74 C88 74 90 70 90 66 L88 44 C88 38 84 34 80 34"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M52 28 C52 22 60 20 64 24 C68 28 68 34 66 36" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M24 34 C20 30 14 28 12 32 C10 36 14 40 18 38" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="18" cy="32" r="1.5" fill={stroke} />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── DRAGON ──
   Stylized dragon head silhouette with horns and flame. */
export function DragonIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M72 32 C72 22 64 16 54 16 C46 16 38 20 34 26 L24 22 C18 20 12 24 14 30 L12 40 C10 48 16 54 22 56 L20 66 C20 70 24 74 28 74 L36 74 L36 62 C36 60 38 58 40 58 L50 58 C52 58 54 60 54 62 L54 74 L62 74 L62 62 C62 60 64 58 66 58 L76 58 C78 58 80 60 80 62 L80 74 L84 74 C88 74 90 70 90 66 L88 38 C88 30 82 24 76 24"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M58 16 L54 6 L62 14" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M48 18 L42 8 L52 16" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="44" cy="26" r="2.5" fill={stroke} />
          <path d="M14 32 C8 28 4 32 8 36 C4 36 6 42 12 40" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── MONKEY ──
   Playful monkey silhouette with round head, ears, curly tail. */
export function MonkeyIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <circle cx="50" cy="28" r="14" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="36" cy="28" r="6" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="36" cy="28" r="3" fill="none" stroke={stroke} strokeWidth="1" opacity="0.4" />
          <circle cx="64" cy="28" r="6" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="64" cy="28" r="3" fill="none" stroke={stroke} strokeWidth="1" opacity="0.4" />
          <ellipse cx="50" cy="32" rx="8" ry="6" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.4" />
          <circle cx="45" cy="26" r="2" fill={stroke} />
          <circle cx="55" cy="26" r="2" fill={stroke} />
          <path d="M46 34 C48 36 52 36 54 34" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M38 42 L36 60 C36 64 40 68 44 68 L56 68 C60 68 64 64 64 60 L62 42" fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M38 56 C30 52 24 56 24 64 C24 70 30 72 34 68" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── SKUNK ──
   Skunk with distinctive striped tail. */
export function SkunkIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M68 38 C68 28 62 22 54 22 C48 22 42 26 38 30 L30 24 C24 20 16 24 18 32 L16 44 C14 52 20 58 26 58 L24 66 C24 70 28 74 32 74 L40 74 L40 62 C40 60 42 58 44 58 L54 58 C56 58 58 60 58 62 L58 74 L66 74 L66 62 C66 60 68 58 70 58 L80 58 C82 58 84 60 84 62 L84 74 L88 74 C92 74 94 70 94 66 L92 42 C92 34 88 30 84 30"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M26 52 C20 44 14 38 10 34 C6 30 2 32 4 38 C2 44 8 50 14 50 C18 50 22 48 24 46" fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M68 30 C64 26 58 24 52 24" fill="none" stroke={fill} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          <circle cx="44" cy="30" r="2" fill={stroke} />
          <circle cx="30" cy="26" r="1.5" fill={stroke} />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── SNAKE ──
   Coiled snake with tongue. */
export function SnakeIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path d="M50 80 C30 80 16 70 16 56 C16 42 30 32 44 32 C58 32 70 40 70 54 C70 68 58 78 46 78 C34 78 26 70 26 60 C26 50 34 44 44 44 C54 44 62 50 62 58 C62 66 56 72 48 72" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="50" cy="80" rx="6" ry="4" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="47" cy="79" r="1.2" fill={stroke} />
          <circle cx="53" cy="79" r="1.2" fill={stroke} />
          <path d="M50 84 L48 88 M50 84 L52 88" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── BULL ──
   Bull/ox silhouette with curved horns and nose ring. */
export function BullIcon({ color = 'WHITE', size = 40, className = '' }) {
  return (
    <PieceSvgBase color={color} size={size} className={className}>
      {({ fill, stroke }) => (
        <>
          <path
            d="M74 38 C74 28 68 22 60 22 C54 22 48 26 44 30 L36 26 C30 22 22 26 20 32 L18 42 C16 50 20 56 26 58 L24 68 C24 72 28 76 32 76 L40 76 L40 64 C40 62 42 60 44 60 L54 60 C56 60 58 62 58 64 L58 76 L66 76 L66 64 C66 62 68 60 70 60 L80 60 C82 60 84 62 84 64 L84 76 L88 76 C92 76 94 72 94 68 L92 40 C92 34 88 30 84 30"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M36 28 C30 20 22 16 18 18" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M52 22 C58 14 66 12 70 14" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <circle cx="46" cy="32" r="2" fill={stroke} />
          <circle cx="22" cy="38" r="3" fill="none" stroke={stroke} strokeWidth="1.5" />
        </>
      )}
    </PieceSvgBase>
  )
}

/* ── Icon Registry ── */
export const PIECE_ICON_MAP = {
  WARRIOR: WarriorIcon,
  SAGITTARIUS: SagittariusIcon,
  NINJA: NinjaIcon,
  GAJASHVA: ElephantIcon,
  ELEPHANT: ElephantIcon,
  RHINO: RhinoIcon,
  GIRAFFE: GiraffeIcon,
  CAMEL: CamelIcon,
  DRAGON: DragonIcon,
  HORSE: HorseIcon,
  UNICORN: UnicornIcon,
  DONKEY: DonkeyIcon,
  WOLF: WolfIcon,
  MONKEY: MonkeyIcon,
  ANTELOPE: AntelopeIcon,
  SKUNK: SkunkIcon,
  SNAKE: SnakeIcon,
  BULL: BullIcon,
  SOLDIER: SoldierIcon,
}

/**
 * Get the appropriate SVG icon component for a piece type
 */
export function getPieceIconComponent(type) {
  return PIECE_ICON_MAP[type] || MonarchIcon
}