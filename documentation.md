# Arohana-rana — Project and Game Handoff

> Last reviewed from the source tree on 2026-07-25. This is an implementation-oriented handoff: it distinguishes what the code does today from the intended online product.

## 1. One-minute orientation

**Arohana-rana** is a two-colour, turn-based tactical board game. Players first draft eight queue entries, arrange their spawn order, place support units, then play on a 9×9 main board with three launch-pad squares above and below its centre. Rather than winning by checkmate, players race to **20 score** through home claims, Soldiers reaching the far back rank, or clearing the opposing board / denying legal moves.

The repository is split into:

| Area | Stack | Role today |
| --- | --- | --- |
| `frontend/` | React 19, Vite 8, Tailwind 4 | The playable local/pass-and-play game; contains the authoritative implemented rules. |
| `backend/` | Java 21, Spring Boot 3.3, JPA, MySQL, Flyway, JWT, STOMP/SockJS | Authentication, player profiles, match records, matchmaking queue, event persistence/broadcast scaffolding. |
| `documentation.md` | Markdown | This source-of-truth handoff for humans and agents. |

## 2. What is playable now

### Complete local-game loop

The browser can run an offline two-player game on one machine:

1. Choose a variant and optional timer/reserve settings.
2. Roll eight draft entries for both colours, reorder each queue, and mark both armies ready.
3. The game expands support-type draft entries into their individual units and places those units on each side's support row.
4. The remaining first queue piece is spawned at a launch pad; play begins.
5. Players select their colour's piece, choose a highlighted legal destination, capture/swap where allowed, and complete actions.
6. Every eighth move by a side consumes/spawns its next queued piece. Captured pieces return to their owner's queue.
7. The game handles scoring, homes, Soldier promotion, optional timeouts/seizures, an in-memory match log, and a winner modal.

### Current online/product state — important caveat

Accounts and server APIs exist, but a networked game is **not yet integrated end to end**:

- Login/register and match-history requests are wired from the UI.
- The online match finder is presently a **five-second demo timeout** that returns hard-coded opponent data; it does not call the matchmaking API.
- `App.jsx` owns all gameplay state locally. It does not create a real match, subscribe to STOMP, send actions, restore events, or persist a completed result.
- The backend can create match rows, queue authenticated players, store received WebSocket action events, and broadcast them, but it does not validate game rules or advance/persist a server-authoritative board/match state.

Treat the frontend engine as the current game reference and the backend as integration groundwork, not as a finished multiplayer authority.

## 3. Board, coordinates, and core vocabulary

### Board geometry

- Files are `a` through `i` (nine columns).
- Main ranks are `1` through `9`, making a 9×9 main board.
- The only rank `0` squares are `d0`, `e0`, `f0`; White's launch pads are there.
- The only rank `10` squares are `d10`, `e10`, `f10`; Black's launch pads are there.
- White moves toward increasing ranks; Black moves toward decreasing ranks.
- White support row is rank `1`; Black support row is rank `9`. Placement priority is `e, d, f, c, g, b, h, a, i`.
- Home candidates are the central squares `d5`, `e5`, `f5`. At game start two different candidates are randomly assigned: one White home and one Black home.

`frontend/src/constants/boardConfig.js` is intended as canonical board configuration. `frontend/src/engine/coordinates.js` defines which coordinate positions are actually playable; agents should use it rather than assume a rectangular 9×11 board.

### State terms

- **Army / queue:** ordered array of piece type strings. It is both the drafted bench and the respawn/spawn queue.
- **Piece:** runtime object created by `createPieceData`: `{ id, type, color, square, powerUsed }`. The static catalog supplies its other properties.
- **Support type:** a piece type which initially places on ranks 1/9 rather than a launch pad.
- **Action:** normally the current colour controls and moves that colour's pieces. A timer seizure may make the opponent controller while the acting colour stays unchanged.
- **Turn:** the UI's action number. A side gets one movement/placement action; `completeCurrentAction` increments it and changes the normal acting colour.
- **Move count:** per-colour counter within the eight-move spawn cycle; it is not the match-log turn number.

## 4. Match lifecycle and rules as implemented

### 4.1 Setup and draft

Variants:

- **Classic**: Warrior, Gajashva, Elephant, Rhino, Camel, Horse, Unicorn, Donkey, Giraffe, Snake, Bull, Soldier.
- **Magical**: Classic plus Sagittarius, Ninja, Dragon, Wolf, Monkey, Antelope, Skunk.
- **Custom**: selected subset from the full Magical catalog. Empty tier selections make drafting impossible, so the UI must retain at least one available type.

Each click of **Roll Both** first chooses one non-empty tier uniformly, then independently chooses one type for White and one for Black from that tier. Therefore the two colours always roll the same tier but may get different pieces. Each needs exactly **8 draft entries** before it can be ready. Draft material displays `comboTotal`, so a Snake entry represents four units' total value rather than one unit's value. Players can reorder their queue before start.

### 4.2 Initial support placement

Support types are Soldier, Snake, Bull, Monkey, Wolf, Antelope, and Skunk. A drafted support entry expands by its `comboCount`: Soldier ×3, Snake ×4, Bull ×2, every other listed type ×1. Each expanded support unit is placed one at a time on an unoccupied square of its colour's support row. The remaining non-support entries form the normal queue.

After White's supports then Black's supports have been placed, the game starts the first normal launch-pad spawn. There is code for material compensation through queue additions; agents changing setup should inspect the `startGame` / initial-support path in `App.jsx` rather than infer a standard chess opening.

### 4.3 Spawn queue and eight-move cadence

Normal non-support spawns target that colour's three launch pads. A queued piece is removed from the queue when successfully spawned. Support types spawn on the side's support rank instead. A queued entry expands to its combo count when appropriate.

Each side tracks moves independently. On its eighth movement (`MOVE_LIMIT = 8`), that action becomes/initiates a required spawn sequence for the front queue piece and resets that side's counter. Capturing a piece returns its type to the captured piece owner's queue, so captures recycle units rather than destroy them permanently. Spawn may replace an enemy occupying a permitted spawn square, and this is logged.

### 4.4 Movement and captures

`getLegalTargets(piece, pieces, context)` in `frontend/src/engine/moveEngine.js` is the rule router. It returns `{ square, kind }`, where kind is `move`, `capture`, or Antelope-only `swap`. Friendly occupied squares are excluded. Sliding paths stop at blockers; jumping pieces ignore intermediate blockers. A global Skunk filter applies after a piece's individual movement is generated.

| Tier | Piece | Material / combo | Implemented movement and special rule |
| --- | --- | --- | --- |
| S | Warrior | 9 / ×1 | Unlimited orthogonal + diagonal slide (queen); cannot jump. |
| S | Sagittarius | 9 / ×1 | Up to 3 squares in any direction without jumping, plus normal Horse leaps. |
| S | Ninja | 9 / ×1 | 1–3 squares in any direction; may jump over blockers. |
| S | Gajashva | 9 / ×1 | Elephant's rook slide plus Horse leap. |
| A | Elephant | 5.5 / ×1 | Unlimited orthogonal slide. |
| A | Rhino | 5 / ×1 | Camel's diagonal slide plus a one-square king move. |
| B | Giraffe | 4 / ×1 | Leaps exactly 2 or 3 squares orthogonally. |
| B | Camel | 4 / ×1 | Unlimited diagonal slide; therefore stays on its starting square colour. |
| B | Dragon | 4 / ×1 | 3+1 leaper; horizontal coordinate wraps across the `a`/`i` edge. |
| B | Horse | 3.5 / ×1 | Standard 2+1 knight leap. |
| B | Unicorn | 3.5 / ×1 | 3+1 knight-like leap. |
| B | Donkey | 2.5 / ×1 | Horse destination, but an L-shaped route must be clear along at least one of two orthogonal path interpretations. |
| C | Wolf | 2.5 / ×1 | One-square king movement. It remains in internal state but is not rendered anywhere on the board. |
| C | Monkey | 2.5 / ×1 | One-square king movement with coordinate wrapping; invalid non-launch-pad rank 0/10 results are filtered. |
| C | Antelope | 2.5 / ×1 | Normal king movement/capture, plus one long-range swap with any non-adjacent enemy except Wolf. Swap is unavailable at move 7/8 and after `powerUsed`. |
| C | Skunk | 2.5 / ×1 | One-square king movement. Every Skunk blocks *all* new landings on its eight neighbouring squares. Direct capture of an enemy Skunk remains legal. |
| D | Snake | 1 / ×4 | One-square diagonal leap. |
| D | Bull | 1.5 / ×2 | Moves forward or backward one into an empty square; captures directly forward or on either forward diagonal. |
| D | Soldier | 1 / ×3 | Moves one forward into empty square; captures one forward-diagonal. |

Antelope swaps exchange the Antelope's and target enemy's squares, set `powerUsed: true`, and are logged. Wolf invisibility is a presentation rule in `Board.jsx`; its state still blocks squares, can move, and can be captured through a highlighted target. Antelope explicitly cannot identify or swap a Wolf.

### 4.5 Homes and scoring

The target is **20**. Point values in `scoreEngine.js` are integers (the previous decimal scoring system multiplied by two):

| Event | Score change |
| --- | --- |
| Hold/claim your own home successfully | claimant +2 |
| Claim opponent's home successfully | claimant +3; home owner −1 |
| Soldier reaches opponent's back rank | +2 |
| Opponent has no active pieces (`ALL_OUT`) | +4 |
| Opponent has no legal move | +4 |

Landing on either home creates a **pending claim**, not immediate points. The defender gets exactly its next move to move a piece onto that claimed square. If it does, the original claiming piece is removed from the board and returned to its owner's queue; the claim is cancelled. If it does not, the score is applied, the locked claimant returns to its queue, and the relevant home is relocated to a vacant candidate square. Reaching the target during resolution ends the game before further side effects. The code checks White first if a generic simultaneous score calculation ever occurs; normal home resolution should be one-sided.

### 4.6 Soldier back rank and promotion

When a Soldier reaches rank `10` (White) or `0` (Black), it scores +2. It then pauses play with `PromotionModal`. The player chooses a permanent new type from their original drafted army, excluding Soldier; the same piece ID is retained and its `type` changes. This means promotion options are constrained by the army that began this match, not by the global variant. The modal must be resolved before board interaction continues.

### 4.7 All-out / no-legal-move checks

After captures and after action transitions, `App.jsx` checks whether the opponent has no active pieces or no legal targets. Either awards +4 to the other side and may immediately end the match. These rules are implemented in the application coordinator rather than `scoreEngine.js`, so rule changes belong in `App.jsx` plus tests.

### 4.8 Optional clock and Chamber Seizure

Timer settings are local UI/game state:

- Base chamber clock is **30 seconds per action**.
- Reserve choices are none, 2 min, 5 min, or a positive custom minute value; each side receives the configured reserve.
- The chamber clock drains first, then reserve. On expiry, no automatic move is chosen.
- Instead, the opponent seizes control of a move for the timed-out side. The resulting action tracks `{ controller, actingColor, type: 'SEIZED' }`.
- If a normal White action times out, Black controls one White move. If the controller of a seized action times out, control passes back and the next seized action moves the previous controller's colour.
- Completing a seized action returns play to normal flow. Timer and seizure events are added to the in-memory log.

## 5. Frontend architecture

### Composition and state ownership

`frontend/src/App.jsx` is the current application coordinator and is intentionally large. It owns game state, phases, selection, action completion, gameplay side effects, screen routing, and hook composition. Key phases are `SETUP`, `INITIAL_SUPPORT`, and `PLAYING`.

```text
App.jsx
 ├─ auth/session and screen state: AUTH → MENU → MATCHMAKER/HISTORY/GAME
 ├─ drafting queue: useDraftSystem
 ├─ score + winner: useScoreSystem
 ├─ homes + delayed claims: useHomeSystem
 ├─ append-only local log: useMatchLog
 ├─ board state and action orchestration (still local to App)
 └─ presentation: Board, panels, screen and modal components
```

The separate engine files should remain mostly pure; hooks hold reusable React state; components should render/emit events. When extending rules, avoid duplicating `App.jsx` constants: some older duplicates are present there, while `boardConfig.js` is the intended canonical location.

### Important frontend directories

| Path | Responsibility |
| --- | --- |
| `src/engine/moveEngine.js` | Legal-target generation for every type and global Skunk restriction. |
| `src/engine/gameEngine.js` | Basic immutable move/capture application and colour switching. |
| `src/engine/homeClaimEngine.js` | Pure delayed-home claim construction/resolution. |
| `src/engine/scoreEngine.js` | Target, point constants, pure score helpers. |
| `src/engine/timerEngine.js` | Clock/reserve state, per-second tick, formatting. |
| `src/engine/seizureEngine.js` | Normal/seized action descriptors and timeout transition. |
| `src/engine/matchLogEngine.js` | Structured event construction and text/JSON export; no state mutation. |
| `src/engine/pieceCatalog.js` | Type metadata, display names, tiers, score values, images. |
| `src/hooks/useDraftSystem.js` | Draft rolls, queue order, material totals, queue return/reset. |
| `src/hooks/useHomeSystem.js` | Random home assignment, claim logging, queue-return and relocation orchestration. |
| `src/hooks/useInitialSupportSystem.js` | Reusable support-placement flow (note: `App.jsx` also retains related local state/logic). |
| `src/hooks/useSpawnSystem.js` | Spawn-oriented reusable logic. |
| `src/hooks/useTimerSeizure.js` | Reusable timer/seizure implementation; `App.jsx` currently keeps equivalent state/logic too. |
| `src/components/board/` | Board layout, home markers, legal-move highlights; Wolf concealment. |
| `src/components/panels/` | Player sidebars, variant/timer setup, log, winner and promotion overlays. |
| `src/screens/` | Authentication, menu, demo matchmaker, and history pages. |
| `src/utils/apiClient.js` | HTTP wrapper and typed-ish API groupings. |

### UI behavior and assets

The board shows a green ring for moves, red for captures, purple for Antelope swaps, cyan outline for selection, and colour-coded home circles. Piece rendering uses catalog image paths, then falls back to its two-character abbreviation when the image is absent or fails. At present `public/pieces/` contains only white/black Horse PNGs, while the catalog references images for every type; fallbacks are therefore expected for most pieces.

The match log is client-only during local play. It supports opening a modal and copying/exporting textual/JSON-style event data. Events carry a generated ID, number, turn, phase, actor/controller/acting colour, positional data, score snapshot, and timestamp.

### Authentication and screens

- `AuthScreen` calls `/api/auth/login` or `/api/auth/register`; successful response is stored in `localStorage` under `arohana_session` by `useAuthSession`.
- Offline continuation calls `login(null)`, allowing local play without a token. It does **not** persist an offline session, so refresh returns to authentication.
- `MainMenuScreen` exposes local play, online demo, and history. Online/history require a session.
- `MatchHistoryScreen` actually calls `GET /api/matches/my`.
- `MatchmakerScreen` imports a health helper but does not use it; it currently simulates a match found after 5 seconds.

## 6. Backend architecture and API surface

### Services and persistence

The backend defaults to MySQL at `jdbc:mysql://localhost:3306/arohana` and Flyway validates/runs `V1__init.sql`. H2 is configured for tests. `application.yml` uses development defaults for DB password and JWT secret; these must be overridden outside local development.

Main entities/tables:

- `player`: UUID, username, display name, rating (default 1200), W/L/D fields.
- `identity`: UUID, linked player ID, unique email, BCrypt password hash, verification flag.
- `match`: players, variant/custom types, lifecycle status, scores/winner, timer config, timestamps.
- `match_event`: match ID, turn, event type, actor colour, JSON payload, timestamp.
- `matchmaking_queue`: player, requested variant, rating, joined time.

`Match.create` starts a new record as `DRAFTING`. `Match.complete` exists but is not currently invoked by a public completion flow. `MatchWebSocketController` records events at turn `0` for all messages because future payload parsing is explicitly deferred.

### HTTP endpoints

| Endpoint | Auth | Current behavior |
| --- | --- | --- |
| `GET /health` | No | Health response. |
| `POST /api/auth/register` | No | Validate username/display/email/password; creates Player + Identity; returns JWT and player summary, HTTP 201. |
| `POST /api/auth/login` | No | Validates email/password; returns JWT and player summary. |
| `GET /api/players/me` | JWT | Current player's summary. |
| `GET /api/players/{username}` | JWT (due global rule) | Public-profile-style player summary. |
| `POST /api/matches` | JWT | Creates a `DRAFTING` match. Requires opponent UUID and variant; stores timer and optional custom types. |
| `GET /api/matches/{id}` | JWT | Returns match summary; does not currently enforce player membership. |
| `GET /api/matches/my` | JWT | Returns matches whose white or black player ID is the caller. |
| `GET /api/matches/{id}/events` | JWT | Returns ordered stored events; does not currently enforce player membership. |
| `POST /api/matchmaking/queue` | JWT | Pairs same-variant queued players whose rating lies within ±200; returns match or 202 `{ status: "QUEUED" }`. |
| `DELETE /api/matchmaking/queue` | JWT | Leaves queue. |
| `GET /api/matchmaking/queue/status` | JWT | Returns `{ inQueue }`. |

JWTs are stateless Bearer tokens (default 24-hour lifetime). Passwords are BCrypt-hashed. CORS defaults to Vite/React localhost origins.

### WebSocket protocol scaffold

The STOMP/SockJS endpoint is `/ws`; clients send a `MatchMessage` to `/app/match/{matchId}/action`. The server stores an event then broadcasts the original message to `/topic/match/{matchId}`. Matchmaking sends per-user pairing notifications to `/user/queue/matched` (via `convertAndSendToUser`). No frontend STOMP client dependency or subscription exists yet.

## 7. Tests, commands, and verification baseline

From `frontend/`:

```powershell
npm run test
npm run lint
npm run build
npm run dev
```

Tests currently cover key catalog/config, draft, move-engine, and variant-panel behavior. From `backend/`:

```powershell
mvn test
mvn spring-boot:run
```

Backend tests include Spring context and authentication integration coverage. A running backend additionally needs a reachable MySQL instance unless test configuration is used. The frontend reads `VITE_API_URL`, otherwise `http://localhost:8080`.

## 8. Known gaps and agent guardrails

1. **Do not claim online play is complete.** The UI matchmaker is mocked and gameplay has no network synchronization or server validation.
2. **Server events are not authoritative state.** They are unvalidated payload records, turn `0`, and the server does not update a match to `PLAYING`/`COMPLETED` or ratings.
3. **Authorization needs hardening.** Match fetch/events do not check that caller participates; WebSocket action handling does not authenticate/authorize a player against match or colour.
4. **Visual assets are incomplete.** Most catalog image paths reference files absent from `public/pieces`; short-name fallback is intentional but not final art.
5. **`App.jsx` is the highest-risk integration point.** It contains significant duplicate orchestration that overlaps some hooks/config constants. Refactor only with behavior-preserving tests.
6. **Rule edge cases need explicit tests.** Especially home relocation with occupied candidates, no-legal-move timing, seizure/action completion, queue expansion, Wolf interactions, and launch-pad/wrapping boundaries.
7. **Production secrets are not safe defaults.** Set `DB_PASS`, `JWT_SECRET`, database host/user, and CORS origins through deployment configuration.

## 9. Recommended implementation sequence for future agents

1. Add characterization tests around the existing local loop before moving logic out of `App.jsx`.
2. Define a serializable, versioned match-state/action schema shared by frontend and backend.
3. Make the backend validate actions against the rule engine (or a port of it), persist state/event turn numbers atomically, and enforce match membership.
4. Replace the demo matchmaker with queue REST calls plus STOMP connection/subscription and cancellation.
5. Hydrate a match from server state/events and reconcile remote actions in the UI.
6. Implement lifecycle updates, event replay, result persistence, and rating updates.
7. Add the full piece asset set and visual/regression tests.

## 10. Fast file map for an incoming agent

Start with these files in this order:

1. `frontend/src/App.jsx` — actual local gameplay orchestration and state transitions.
2. `frontend/src/engine/moveEngine.js` and `pieceCatalog.js` — precise movement/type rules.
3. `frontend/src/constants/boardConfig.js`, `variantConfig.js`, and `engine/scoreEngine.js` — canonical constants.
4. `frontend/src/hooks/useDraftSystem.js` and `useHomeSystem.js` — queues, setup, homes.
5. `frontend/src/components/board/Board.jsx` and panel components — player-visible behavior.
6. `frontend/src/utils/apiClient.js` and `screens/MatchmakerScreen.jsx` — current frontend/backend boundary and the deliberate demo gap.
7. `backend/src/main/java/com/arohana/match/`, `matchmaking/`, and `shared/security/` — online foundation.
8. `backend/src/main/resources/db/migration/V1__init.sql` — persistent data contract.

