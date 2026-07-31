notepad
ĀROHAṆA-RANA — MASTER FULL-STACK DEVELOPMENT PROMPT
You are the principal architect and implementation agent for an existing project named:

Ārohaṇa-rana

You have direct access to the repository and must inspect the actual files before editing.

This is not a greenfield rewrite. A working React/Vite board-game prototype already exists, including game engines, hooks, components, panels, timers, scoring, drafting, spawning, home claims, match logs, and special pieces.

Your responsibility is to transform the current prototype into a stable, testable, maintainable, professional, future-ready full-stack online strategy-game platform.

The long-term product should reach the quality level expected from a serious online strategy-game platform, with inspiration from the reliability and clarity of platforms such as Chess.com and Lichess, while retaining an entirely distinct visual identity and original game rules.

Do not copy another product’s branding or interface.

This prompt contains:

Product vision
Existing project context
Locked game rules
Piece catalog and tiers
Variant design
Frontend architecture
Pure rules-engine architecture
Spring Boot backend architecture
Real-time multiplayer design
Persistence and replay design
Authentication and onboarding
Immediate bugs
Testing expectations
Security and server-authority requirements
Cloud-readiness direction
Work sequence and acceptance criteria
Follow this prompt carefully and do not silently invent rules.

1. PRIMARY WORKING PRINCIPLES
These rules are non-negotiable.

1.1 Inspect before modifying
Before changing anything:

inspect the complete repository tree;
inspect package.json and installed dependencies;
inspect App.jsx;
inspect every custom hook;
inspect every engine/rules file;
inspect every board and piece component;
inspect setup and side-panel components;
inspect the piece catalog;
inspect icons/assets;
inspect existing tests;
inspect any existing backend;
search for duplicated state and duplicated functions;
run the current project;
record current build and test failures.
Do not infer that a file works merely because it exists.

1.2 Preserve working rules
The repository is the current source of truth for movement rules not explicitly overridden in this prompt.

If an existing piece movement is not fully specified here:

inspect its current implementation;
document it;
preserve it;
add tests for it;
do not redesign it from its name or theme.
Never assume a piece is long-range, leaping, magical, or directional based only on its name.

1.3 Work incrementally
Do not perform one uncontrolled rewrite.

Use checkpoints:

Audit
Baseline build
Bug fixes
Rule tests
Variant foundation
New piece implementation
Frontend restructuring
Backend foundation
Online synchronization
Platform features
Deployment readiness
After each checkpoint:

run the frontend build;
run frontend tests;
run backend tests when backend exists;
report files changed;
report behavior changed;
report known issues;
do not proceed while the current stage is broken.
1.4 Keep the application runnable
At every major stage, the game must remain launchable and testable.

Do not delete existing working systems before the replacement is implemented and verified.

1.5 Do not create another giant App.jsx
New game rules must not be added directly to App.jsx.

App.jsx should eventually become application composition and rendering only.

1.6 JavaScript frontend
The frontend must continue using:

React
Vite
JavaScript
const and let
no TypeScript unless the owner explicitly changes direction later
no var
1.7 Spring Boot backend
The backend direction is:

Java
Spring Boot
Spring Security
Spring Data JPA
Bean Validation
REST
WebSocket
SQL database
database migrations
modular monolith
Do not begin with microservices.

Do not add Kafka, RabbitMQ, Kubernetes, or Redis merely for appearance.

Redis may be introduced later only when justified for:

player presence;
matchmaking queues;
ephemeral room state;
multi-instance WebSocket coordination;
rate limiting;
distributed locks.
2. PRODUCT VISION
Ārohaṇa-rana is an original two-player strategic board game.

The finished platform should support:

local two-player testing;
guest play;
registered accounts;
player profiles;
player display names;
private friend matches;
public casual matchmaking;
ranked matchmaking later;
Classic mode;
Magical mode;
Custom mode;
server-authoritative game state;
real-time WebSocket play;
reconnection after network loss;
match history;
complete event logs;
move-by-move replay;
ratings;
leaderboards;
spectating later;
tournaments much later;
responsive desktop-first UI;
cloud deployment.
The immediate goal is not to prematurely build every platform feature.

The immediate goal is to:

stabilize the complete local game;
finalize and test the rules;
establish a clean rule-engine boundary;
structure the system so the backend can later become authoritative;
then implement the backend and online play.
3. MACRO ARCHITECTURE
The system must evolve into three major layers.

3.1 Pure game-rules engine
This layer owns deterministic game behavior:

piece catalog;
piece tiers;
combo counts;
variants;
custom piece filtering;
board coordinates;
legal movement;
captures;
restricted squares;
special effects;
draft selection;
queue behavior;
initial-support placement;
normal spawning;
move counters;
scores;
home claims;
all-out detection;
no-legal-move detection;
promotion;
timeout consequences;
seizure rules;
turn transitions;
win detection.
Pure rules must not depend on:

React;
useState;
useEffect;
React components;
browser DOM;
navigator;
localStorage;
network requests;
setTimeout for authoritative rules;
direct database access.
The long-term engine interface should conceptually support:

createInitialMatchState(config)
getLegalActions(state, actor)
validateAction(state, action)
applyAction(state, action)
getMatchStatus(state)
A successful action application should return:

nextState;
emittedEvents;
optional rejection details when invalid.
3.2 Spring Boot platform/backend
The backend becomes authoritative for online matches.

It owns:

authentication;
users;
profiles;
variants;
room creation;
invitations;
matchmaking;
match lifecycle;
authoritative game state;
authoritative timer timestamps;
action validation;
persistence;
event history;
replays;
ratings;
reconnection;
WebSocket broadcasting.
3.3 React frontend
The frontend owns presentation and interaction:

routes;
login/register screens;
guest access;
onboarding;
setup UI;
board rendering;
legal-target rendering;
piece selection;
custom variant selection;
timers as visual displays;
scores;
match logs;
profile screens;
matchmaking screens;
connection state;
submitting player actions;
rendering accepted server state.
For online matches, React must not be trusted to declare:

successful capture;
points;
winner;
timeout;
legal movement;
promotion;
home-claim success.
4. EXISTING PROJECT CONTEXT
The existing frontend currently contains or has historically contained files resembling:

src/App.jsx
src/components/board/Board.jsx
src/components/panels/SidePanel.jsx
src/components/panels/TimerSetupPanel.jsx
src/components/panels/MatchLogButton.jsx
src/components/panels/MatchLogModal.jsx
src/components/panels/WinnerModal.jsx
src/engine/moveEngine.js
src/engine/gameEngine.js
src/engine/pieceCatalog.js
src/engine/homeClaimEngine.js
src/engine/scoreEngine.js
src/engine/timerEngine.js
src/engine/seizureEngine.js
src/engine/matchLogEngine.js
src/hooks/useDraftSystem.js
src/hooks/useMatchLog.js
src/hooks/useScoreSystem.js
src/hooks/useSpawnSystem.js
src/hooks/useInitialSupportSystem.js
src/hooks/useTimerSeizure.js
App.jsx has grown to roughly 1,700 or more lines.

Some responsibilities have already been extracted:

draft;
match logs;
score;
spawn;
panels.
However, extraction is incomplete and App.jsx may still own:

initial support;
timer;
seizure;
homes;
home claims;
all-out logic;
move counters;
Soldier back-rank behavior;
Antelope swap execution;
the main board-click pipeline;
setup/start orchestration.
There may be partially wired or broken hooks.

Examples of previously encountered problems:

state returned from a hook used before the hook initialization;
duplicated logic in App.jsx and a hook;
invalid object updates;
missing imports;
ready-state bugs;
incomplete reset behavior;
giant generated replacements that reintroduced old code.
Do not repeat those mistakes.

5. FRONTEND TARGET STRUCTURE
Move incrementally toward this feature-oriented structure:

frontend/ src/ app/ App.jsx routes.jsx providers/ AuthProvider.jsx ConnectionProvider.jsx

game/
  components/
    board/
    pieces/
    panels/
    setup/
    modals/
    overlays/

  hooks/
    useLocalMatch.js
    useOnlineMatch.js
    useDraftSystem.js
    useMatchLog.js
    useTimerDisplay.js
    useMatchConnection.js

  rules/
    catalog/
      pieceCatalog.js

    variants/
      classicVariant.js
      magicalVariant.js
      customVariant.js
      variantRegistry.js

    draft/
      tierPools.js
      draftRules.js

    movement/
      movementRegistry.js
      slidingMovement.js
      leapingMovement.js
      forwardMovement.js
      warriorMovement.js
      sagittariusMovement.js
      ninjaMovement.js
      gajashvaMovement.js
      bullMovement.js
      skunkMovement.js

    effects/
      skunkAura.js
      antelopeSwap.js
      soldierPromotion.js
      timeoutSeizure.js

    scoring/
      scoreRules.js
      homeClaimRules.js
      allOutRules.js

    actions/
      actionTypes.js
      validateAction.js
      applyAction.js
      actionResults.js

    state/
      createInitialMatchState.js
      selectors.js
      matchStateSchema.js

  services/
    matchApi.js
    matchSocket.js
    authApi.js

  constants/
    boardConfig.js
    matchConstants.js

auth/
  components/
    LoginPage.jsx
    RegisterPage.jsx
    GuestButton.jsx
  hooks/
  services/

onboarding/
  components/
    OnboardingPage.jsx
    TutorialStep.jsx
  content/
    basicRules.js

matchmaking/
  components/
    MatchmakingPage.jsx
    PrivateRoomPage.jsx
    InvitePanel.jsx
  hooks/
  services/

profile/
  components/
    ProfilePage.jsx
    MatchHistory.jsx
    StatisticsPanel.jsx
  services/

replay/
  components/
    ReplayPage.jsx
    ReplayControls.jsx
  services/

shared/
  components/
  hooks/
  utils/
  constants/

main.jsx
This is a target, not an instruction to immediately move every file.

Before moving files:

identify import dependencies;
ensure no circular imports;
move one feature at a time;
update imports;
run the build.
6. BACKEND TARGET STRUCTURE
Build the Spring Boot system as a modular monolith.

Suggested structure:

backend/ src/main/java/com/arohanarana/ ArohanaRanaApplication.java

identity/
  domain/
  application/
  infrastructure/
  web/

player/
  domain/
  application/
  infrastructure/
  web/

variant/
  domain/
  application/
  infrastructure/
  web/

match/
  domain/
  application/
  infrastructure/
  web/

matchmaking/
  domain/
  application/
  infrastructure/
  web/

replay/
  domain/
  application/
  infrastructure/
  web/

rating/
  domain/
  application/
  infrastructure/
  web/

shared/
  security/
  persistence/
  websocket/
  time/
  error/
Do not use a single global structure containing only:

controller/
service/
repository/
entity/
Organize by business capability.

Inside a module:

domain = rules and concepts;
application = use cases;
infrastructure = database/external implementation;
web = REST/WebSocket entry points.
7. MATCH DOMAIN MODEL
The backend match module should eventually contain concepts resembling:

match/ domain/ Match.java MatchId.java MatchState.java MatchConfig.java MatchPhase.java MatchStatus.java PlayerSide.java PieceState.java PieceType.java BoardSquare.java MatchAction.java MatchEvent.java MatchRules.java

domain/rules/ DraftRules.java MovementRules.java CaptureRules.java SpawnRules.java HomeClaimRules.java ScoreRules.java TimerRules.java PromotionRules.java AllOutRules.java

application/ CreateMatchUseCase.java JoinMatchUseCase.java ConfigureMatchUseCase.java SubmitActionUseCase.java ReconnectPlayerUseCase.java ResignMatchUseCase.java FinishMatchUseCase.java

infrastructure/ MatchEntity.java MatchEventEntity.java MatchRepositoryJpa.java MatchStateSerializer.java

web/ MatchController.java MatchSocketController.java dto/

Do not expose persistence entities directly through REST.

8. BOARD AND COORDINATES
Inspect the actual board implementation and document its exact dimensions.

Current code strongly indicates:

files from a through i;
ranks from 0 through 10;
White launch pads: d0, e0, f0;
Black launch pads: d10, e10, f10;
White support row: rank 1;
Black support row: rank 9;
central home candidates: d5, e5, f5.
Verify these from the code.

Create a canonical board configuration module rather than repeatedly hardcoding these values.

The board utility layer should support:

parseSquare;
createSquare;
isInsideBoard;
getAdjacentSquares;
getDirectionalSquare;
getRay;
distance helpers.
9. MATCH PHASES
Use explicit match phases.

At minimum:

SETUP
DRAFTING
INITIAL_SUPPORT
INITIAL_SPAWN
PLAYING
FINISHED
For backend/online use, also consider:

WAITING_FOR_SECOND_PLAYER
CONFIGURATION
PAUSED_FOR_RECONNECT
ABANDONED
Do not infer phase from scattered booleans when one explicit enum/state value can represent it.

10. VARIANTS
The game must support:

CLASSIC
MAGICAL
CUSTOM
Use one rules engine and one draft algorithm.

Variants are configuration, not separate implementations.

10.1 Classic
The intended Classic roster is:

WARRIOR
ELEPHANT
NINJA
CAMEL
HORSE
UNICORN
GIRAFFE
SOLDIER
BULL
SNAKE
Before finalizing, inspect whether any currently existing piece such as RHINO or DONKEY is intended for Classic. Do not silently include or exclude pieces without documenting the decision.

10.2 Magical
Magical contains Classic plus magical/advanced pieces.

Current additional candidates:

GAJASHVA
DRAGON
SAGITTARIUS
RHINO
DONKEY
MONKEY
WOLF
SKUNK
ANTELOPE
Confirm final membership from the variant specification before implementation.

10.3 Custom
Custom permits manual piece enable/disable selection.

Requirements:

group pieces by tier;
display combo counts;
display movement summary;
prevent an empty piece set;
remove empty tiers from random tier selection;
use the same shared tier-first draft;
store the selected piece set in match configuration;
custom matches should be casual/unranked by default.
11. PIECE TIERS
The current intended tier structure is:

S tier — elite pieces
WARRIOR
SAGITTARIUS
NINJA
GAJASHVA
A tier — major pieces
ELEPHANT
RHINO
B tier — minor/average pieces
CAMEL
DRAGON
HORSE
UNICORN
DONKEY
GIRAFFE
C tier — magical/control pieces
WOLF
MONKEY
ANTELOPE
SKUNK
D tier — weaker combo pieces
SNAKE x4
BULL x2
SOLDIER x3
These tiers are current design intent and may be adjusted only after movement-based balance analysis and playtesting.

Do not rank a piece based on its fantasy name.

12. REMOVED PIECES
The following pieces must be removed:

CAT
SOUL
Before removal:

Search the complete repository case-insensitively.
List every reference.
Check:
piece catalog;
tier pools;
movement rules;
support lists;
variant lists;
assets;
icon maps;
tests;
logs;
setup defaults;
serialized fixture data.
Remove each reference safely.
Confirm no stale reference remains.
Ensure old saved local state does not crash if it includes a removed type.
Optionally clear or migrate incompatible local storage.
Soul’s intended transformation identity is replaced by Soldier promotion.

13. DRAFT RULE
The draft process is tier-first.

A draft consists of a configured number of draft rolls, currently intended as eight.

For each roll:

Determine which tiers contain at least one piece allowed by the selected variant/custom configuration.
Randomly select one available tier.
Independently select one random piece from that tier for White.
Independently select one random piece from the same tier for Black.
Add the White result to White’s draft queue.
Add the Black result to Black’s draft queue.
Repeat until the required roll count is reached.
Important:

The selected tier is shared for the roll.
The selected piece is independently randomized for each side.
White and Black may receive the same piece.
Combo counts do not represent extra draft rolls.
One Soldier draft result is one queue entry during drafting, later expanding to three Soldier units where setup behavior requires it.
One Snake result expands to four.
One Bull result expands to two.
Online randomness must be generated by the backend.
Create a deterministic random provider or injectable random source for testing.

Tests must verify:

shared tier selection;
independent piece selection;
no disallowed piece;
no empty-tier selection;
exactly eight draft entries;
correct combo metadata;
custom filtering.
14. READY RULES
The current critical bug is early readiness.

Locked requirements:

Required draft result count is eight.
A player cannot become Ready before their draft queue contains eight draft entries.
Ready must be rejected at rule level, not merely disabled in the UI.
A Ready player must not prevent the other side from completing a valid draft.
Shared rolling should stop only when the draft itself is complete.
Reordering should be disabled for a player after that player becomes Ready.
If unready is permitted during setup, define and test it explicitly.
The match starts only when:
White has eight draft entries;
Black has eight draft entries;
White is Ready;
Black is Ready;
the selected configuration is valid.
The UI should display:

current draft progress, for example 5 / 8;
disabled Ready before completion;
completed state at 8 / 8;
clear Ready status.
The backend must later enforce the same condition.

15. COMBO PIECES AND INITIAL SUPPORT
Current combo intent:

SOLDIER x3
SNAKE x4
BULL x2
Inspect the existing initial-support behavior.

Current code has historically treated several support types as units placed on:

White support row rank 1;
Black support row rank 9.
The existing support list may include:

SOLDIER
SNAKE
MONKEY
WOLF
ANTELOPE
possibly BULL
possibly SKUNK
Do not decide support placement solely from tier.

Lock placement behavior in the game specification.

At minimum:

Bull is a combo piece and should expand to two units.
Soldier expands to three.
Snake expands to four.
If a support row has insufficient empty squares, remaining units return to the relevant bench queue.
Initial-support placement receives a clear phase and prompt.
Timer behavior for the full initial-support phase must remain consistent with the current intended rule.
Review whether C-tier pieces are “support-row pieces” or normal launch-pad pieces. Document each type rather than relying forever on one broad SUPPORT_TYPES array.

Prefer catalog metadata such as:

spawnZone: SUPPORT_ROW
spawnZone: LAUNCH_PAD
comboCount
16. ELITE PIECES
Do not guess these movements.

16.1 Warrior
Locked movement:

Warrior combines Elephant movement and Camel movement.
This is queen-like coverage based on the game’s definitions of Elephant and Camel.
It cannot jump unless the existing Elephant or Camel rules explicitly permit jumping.
Inspect and preserve existing blocking behavior.
Strength:

best continuous open-board coverage among the four elite pieces;
vulnerable to blockers if its paths cannot jump.
16.2 Sagittarius
Locked movement:

queen-like movement limited to a maximum of three squares;
cannot jump along these queen-like paths;
additionally has the Horse L-shaped movement;
Horse movement follows the existing Horse leap behavior.
Strength:

hybrid of three-square multidirectional sliding and Horse access;
effective in mixed open/crowded positions;
less long-range than Warrior.
16.3 Ninja
Locked movement:

queen-like movement limited to a maximum of three squares;
can jump over intervening pieces along those paths;
landing/capture behavior must follow the current implementation.
Strength:

highly reliable in crowded positions;
strong infiltration;
short-to-mid-range limit.
16.4 Gajashva
Working name:

Internal type: GAJASHVA
Display name: Gajashva
Meaning/design:

Elephant + Horse combination.
Locked movement concept:

complete Elephant movement;
complete Horse L-shaped movement;
Horse part can jump according to Horse rules;
Elephant part follows Elephant blocking rules.
Do not automatically assign it as stronger than Warrior, Sagittarius, or Ninja.

Balance must compare:

number of reachable squares;
open-board control;
crowded-board control;
jump access;
capture flexibility;
average board position;
support from other pieces.
A provisional material/power value of 8 was discussed, but it is not final until the existing catalog scale is inspected and movement coverage is tested.

17. A-TIER AND B-TIER PIECES
Current intended classification:

A:

ELEPHANT
RHINO
B:

CAMEL
DRAGON
HORSE
UNICORN
DONKEY
GIRAFFE
Giraffe and Dragon being B-tier is a current design preference, not an immutable truth.

Inspect their actual movement and calculate:

maximum reach;
direction count;
blocking;
jump access;
capture restrictions;
average mobility.
Do not change tiers silently.

Document any recommended tier change with evidence from movement coverage and playtesting.

18. BULL RULE
Bull is a D-tier combo piece.

Combo count:

2 Bull units per Bull draft result.
Direction:

White moves toward the enemy side according to current board orientation.
Black moves in the opposite direction.
Movement:

one square forward if empty;
one square backward if empty.
Capture:

one square straight forward;
one square diagonally forward-left;
one square diagonally forward-right.
Restrictions:

cannot capture backward;
cannot move diagonally without capture;
cannot capture diagonally backward;
cannot jump.
Bull should be implemented in pure movement rules.

Do not add Bull-specific movement branches to App.jsx.

Tests must cover:

White forward move;
White backward move;
Black forward move;
Black backward move;
straight-forward capture;
both forward-diagonal captures;
no backward capture;
no empty diagonal move;
blocked forward movement;
board boundaries.
19. SKUNK RULE
Skunk is a C-tier magical/control piece.

Combo count:

19.1 Movement and capture
Skunk moves exactly one square in any direction.
Skunk captures exactly one square in any direction.
Its own movement is the same movement shape as a chess King.
Skunk cannot jump because it moves only one square.
19.2 Aura
The eight squares immediately surrounding a Skunk are restricted.

Rules:

no friendly non-owning piece may move onto those surrounding squares;
no enemy piece may move onto those surrounding squares;
another Skunk cannot enter the aura;
the Skunk itself can move normally;
a Skunk’s currently occupied square is not one of its restricted surrounding squares;
a legal enemy piece may capture the Skunk by landing directly on the Skunk’s occupied square;
long-range pieces may capture the Skunk directly if their path and landing are legal;
leaping pieces may capture the Skunk directly if their landing is legal;
the aura does not make Skunk immune;
aura restriction must be applied globally to every piece’s generated legal targets.
When a Skunk moves:

its old aura disappears;
its new surrounding aura becomes active;
legality must be based on the resulting current position.
Multiple Skunks:

union all restricted surrounding squares;
a Skunk cannot move into another Skunk’s aura;
direct capture of an enemy Skunk remains permitted if the destination is the enemy Skunk’s occupied square;
ensure the destination is not separately restricted by another Skunk.
19.3 No-legal-move effect
Skunk can produce a no-legal-move state.

Example:

the opponent has only a Soldier;
the Skunk stands in front with one square separating them in the relevant arrangement;
the Soldier’s only legal target is inside the Skunk aura;
the Soldier has no legal move;
the existing no-legal-move/all-out rule applies;
the opponent of the immobilized side receives the configured four points.
Tests must cover:

all eight aura squares;
friendly restriction;
enemy restriction;
Skunk-to-Skunk restriction;
direct Skunk capture;
capture through/over an aura depending on landing square;
aura after Skunk movement;
multiple aura overlap;
no-legal-move detection.
20. SOLDIER RULE AND PROMOTION
Current implementation appears to do:

Soldier reaches enemy back rank;
Soldier scores SOLDIER_BACK_RANK points;
Soldier returns to its queue or is removed;
other side effects occur.
New intended direction:

remove separate Soul;
Soldier becomes the promotion unit;
Soldier reaching the enemy back rank permanently transforms into another eligible piece.
Before implementing, document current behavior and migrate intentionally.

Recommended locked promotion model unless repository owner explicitly changes it:

A Soldier reaching the enemy back rank must promote.
Promotion replaces the old Soldier back-rank points.
Eligible promotion types are piece types appearing in either player’s original match draft roster.
SOLDIER is not an eligible promotion choice.
CAT and SOUL are never eligible.
A combo piece choice creates one promoted unit, not the full combo.
Promotion changes the Soldier’s playable type permanently.
If captured, it returns to the bench as the promoted type.
If spawned again, it remains the promoted type.
A once-per-life ability on the promoted type initializes according to the normal new-unit rule.
Promotion completes the current action.
Promotion must be recorded in match events and replay.
Because the owner previously said this concept was still under consideration, do not silently remove scoring before producing:

current behavior summary;
migration impact;
test plan;
UI promotion-selection design.
If implementation proceeds, create a promotion-selection modal and a server-validatable PROMOTE_SOLDIER action.

Store sufficient identity to preserve audit/replay information, for example:

currentType;
originalType;
promotedFrom;
promotionTurn.
Do not rely only on mutating a label without preserving history.

21. ANTElOPE
Inspect and preserve the existing Antelope rule.

Current code indicates:

Antelope has a swap action;
it may swap with a valid enemy piece;
Wolf may be excluded;
powerUsed prevents repeated use;
the action is logged.
Move this logic into pure rules/effects.

Do not keep the execution permanently inside handleSquareClick.

Add tests for:

valid target;
invalid friendly target;
Wolf restriction;
already-used power;
resulting squares;
home-claim interaction;
turn progression;
replay event.
22. HOME CLAIM SYSTEM
Inspect the current home-claim engine and preserve the established design.

Known context:

home squares come from d5, e5, f5;
White and Black receive different home locations;
reaching own or enemy home creates different rewards/penalties;
a pending home claim can be defended;
a claim can succeed after the defender’s response;
the claiming piece can be temporarily locked;
home relocation may occur;
relocation may immediately find an occupying piece.
Critical locked timing from the established rule set:

First-Maker/home-claim points are awarded at the end of the defender’s next move.
If the awarded points reach the target score, the game stops immediately.
Do not process later chamber/removal/all-out side effects after the winning score is reached.
Create explicit tests for this ordering.

Home rules should become pure domain logic.

The React layer should only:

render homes;
show pending claim;
submit movement;
render accepted result.
23. ALL-OUT AND NO-LEGAL-MOVE
Current score value appears to be four points.

Inspect SCORE_VALUES.ALL_OUT.

The all-out/no-legal-move system must distinguish:

side has no active pieces but has bench pieces;
side has no active pieces and no bench pieces;
side has active pieces but none has a legal move;
pending spawn exists;
pending support exists;
seizure action exists;
pending home-claim locked piece should not count as movable;
Skunk aura removes all otherwise legal targets;
winning score is reached during all-out processing.
Ensure all-out is processed exactly once per triggering state.

Avoid React effects repeatedly awarding the same score on rerender.

Use action/event IDs or explicit state transitions in the pure engine.

Tests must cover repeated-render/repeated-evaluation safety.

24. MOVE COUNTERS AND SPAWNING
Current move limit appears to be eight.

After the configured number of moves:

request or enqueue a spawn for the acting side;
reset the relevant move counter;
preserve pending spawn order;
avoid losing simultaneous compensation spawns;
avoid duplicate spawn requests.
Inspect current behavior for:

Soldier reaching back rank;
all-out;
capture;
Antelope swap;
home-claim resolution;
seizure-controlled movement.
Define whether each action increments the move counter.

Document this explicitly.

25. TIMER AND SEIZURE
Current timer system includes:

timer enabled;
primary turn clock;
reserve options;
custom reserve minutes;
timeout status;
timer action key;
seizure action;
acting color;
controller color.
Current concept:

a timeout can trigger control/seizure behavior;
one player may control the other side’s action;
after the seized action, control and turn state resolve.
Inspect the exact current behavior and preserve it.

For local mode:

client timer is acceptable temporarily.
For online mode:

the backend must store authoritative timestamps;
do not trust browser intervals;
use fields such as:
actionStartedAt;
actionDeadlineAt;
remainingReserveMillis;
the frontend derives display time;
backend decides whether an action arrived before timeout;
backend emits timeout/seizure events.
Do not send a WebSocket message every second merely to count down.

Synchronize using timestamps and occasional correction.

26. MATCH ACTION MODEL
Define serializable player actions.

Suggested action types:

CONFIGURE_MATCH
SELECT_VARIANT
SET_CUSTOM_PIECES
ROLL_DRAFT
REORDER_DRAFT_QUEUE
SET_READY
PLACE_INITIAL_SUPPORT
SPAWN_PIECE
MOVE_PIECE
USE_ANTELOPE_SWAP
PROMOTE_SOLDIER
RESIGN
OFFER_DRAW
ACCEPT_DRAW
DECLINE_DRAW
Every action should include:

actionId;
matchId;
actor/playerId;
expectedMatchVersion;
actionType;
action-specific payload;
client timestamp for diagnostics only.
The server must not trust:

actor color supplied by client;
current turn supplied by client;
score supplied by client;
legal targets supplied by client;
winner supplied by client.
Server derives those from authenticated membership and authoritative state.

27. MATCH EVENT MODEL
Suggested accepted events:

MATCH_CREATED
PLAYER_JOINED
PLAYER_ASSIGNED_SIDE
CONFIGURATION_UPDATED
CONFIGURATION_LOCKED
DRAFT_TIER_SELECTED
DRAFT_RESULT_ASSIGNED
DRAFT_QUEUE_REORDERED
PLAYER_READY
INITIAL_SUPPORT_PLACED
SUPPORT_RETURNED_TO_BENCH
PIECE_SPAWNED
PIECE_MOVED
PIECE_CAPTURED
ANTElOPE_SWAPPED
SOLDIER_PROMOTED
HOME_CLAIM_CREATED
HOME_CLAIM_DEFENDED
HOME_CLAIM_SUCCEEDED
HOME_RELOCATED
SCORE_AWARDED
ALL_OUT_TRIGGERED
NO_LEGAL_MOVE_TRIGGERED
TIMEOUT_OCCURRED
SEIZURE_STARTED
SEIZURE_COMPLETED
TURN_CHANGED
PLAYER_DISCONNECTED
PLAYER_RECONNECTED
PLAYER_RESIGNED
MATCH_FINISHED
Store an ordered sequence number.

Events should contain enough data for:

match logs;
replay;
debugging;
audit;
spectator playback.
Do not implement pure event sourcing immediately.

Store:

current snapshot;
ordered events.
28. MATCH STATE MODEL
The authoritative state should be serializable and contain:

matchId;
matchVersion;
status;
phase;
variant;
custom allowed-piece set;
rules configuration;
White player;
Black player;
White display name;
Black display name;
original draft roster for each side;
current bench queue for each side;
board pieces;
initial-support queues;
pending initial-support side;
pending spawn side;
pending spawn queue;
current turn;
acting side;
seizure controller;
move counters;
White score;
Black score;
target score;
White home;
Black home;
pending home claim;
timer configuration;
authoritative timer timestamps;
reserve remaining;
winner;
finish reason;
turn number;
action number;
createdAt;
startedAt;
finishedAt.
Piece state should contain:

unique piece ID;
current type;
original type;
color;
square or bench state;
power-used state;
promotion history if applicable;
creation sequence.
29. LOGIN AND GUEST ACCESS
Build authentication only after the local rules and backend match foundation are stable.

Login page requirements:

professional Ārohaṇa-rana branding;
sign in;
create account;
password recovery later;
top-right Skip button.
Skip behavior:

create/use a guest identity;
allow easy local testing;
avoid requiring login repeatedly during development;
do not claim guest ratings or persistent cloud history;
clearly distinguish guest from registered profile;
permit conversion to an account later if desired.
Development convenience:

support a development profile with seeded test users;
do not weaken production authentication;
do not hardcode real credentials.
Security:

securely hash passwords;
use authenticated sessions or appropriately managed access/refresh tokens;
protect WebSocket authentication;
validate authorization for every match action;
do not store raw passwords;
rate-limit login and sensitive endpoints later;
validate all inputs.
30. PLAYER PROFILES AND NAMES
Match setup should eventually show:

White player/team name;
Black player/team name.
Local mode:

allow entering both names.
Online mode:

populate each side from the authenticated player profile;
do not allow one player to rename the opponent.
Profile page later:

display name;
avatar;
join date;
match totals;
wins;
losses;
draws if supported;
Classic rating;
Magical rating;
recent matches;
replay links.
Custom games should be unranked by default.

31. ONBOARDING
New registered users should see a concise onboarding experience.

It should explain:

What Ārohaṇa-rana is
How drafting works
How queues and spawning work
Basic movement and capture
Homes and claims
Scoring
All-out/no-legal-move
Timers and seizure at a high level
Classic, Magical, and Custom variants
How a match is won
Provide:

Next;
Back;
Skip tutorial;
do not show again;
link to full rules;
reopen tutorial from profile/settings.
Do not dump the entire rulebook into onboarding.

Create a separate full rules page with searchable piece reference.

32. SETUP EXPERIENCE
The setup flow should eventually include:

local/online/private mode;
White name;
Black name;
Classic/Magical/Custom;
custom allowed pieces;
draft roll count;
target score;
move limit;
timer enabled;
primary time;
reserve option;
custom reserve;
ranked/casual indicator.
Setup validation:

names valid;
variant valid;
custom piece set not empty;
at least one usable tier;
timer values valid;
target score positive;
draft count valid;
configuration locked before drafting begins.
Do not permit mid-match configuration changes.

33. PROFESSIONAL FRONTEND EXPERIENCE
The product should feel polished and strategic.

Requirements:

board remains visually central;
current turn is clearly visible;
current phase is clearly visible;
active timer is clearly visible;
draft progress is visible;
spawn/support instructions are explicit;
invalid actions receive clear feedback;
no silent failure;
no blank-screen runtime crashes;
add an application-level Error Boundary;
include loading states;
include retry states;
include reconnecting/disconnected state later;
use accessible button labels;
maintain readable contrast;
support keyboard focus;
handle reasonable desktop resolutions;
plan responsive tablet layout;
mobile play can be a later optimization if board interactions require it.
Do not expose raw debugging text in production UI.

34. LOCAL AND ONLINE ADAPTERS
The same board UI should support local and online matches.

Use compatible interfaces such as:

Local match:

useLocalMatch()
Online match:

useOnlineMatch()
Shared result shape:

matchState;
legalTargets;
selectedPiece;
submitAction;
actionPending;
actionError;
connectionStatus;
reset/leave behavior.
Local adapter:

runs pure JavaScript rules engine;
useful for development and offline practice.
Online adapter:

receives authoritative state;
submits actions;
handles optimistic UI only where safe;
reconciles with server result;
handles reconnect.
Do not create completely separate board implementations.

35. REST API DIRECTION
Suggested REST responsibilities:

Authentication:

register
login
refresh/session
logout
current user
Profiles:

get profile
update profile
match history
statistics
Variants:

list public variants
get piece catalog
validate custom configuration
Matches:

create match
join private match
load match snapshot
load match events
resign
load replay
Matchmaking:

join queue
leave queue
queue status
Do not use REST polling as the primary live-match mechanism once WebSocket is available.

36. WEBSOCKET DIRECTION
Use WebSocket for:

live match subscription;
accepted state updates;
event broadcasts;
action rejection;
opponent join;
opponent disconnect;
opponent reconnect;
match completion;
matchmaking result.
Conceptual channels:

user-specific notifications;
match-specific topic/channel;
matchmaking status.
Protect subscriptions:

a player can access only authorized private match data;
spectators only when allowed;
do not trust matchId alone as authorization.
Define a versioned message envelope:

messageType;
schemaVersion;
matchId;
matchVersion;
serverTimestamp;
payload.
37. RECONNECTION
Online matches must survive temporary disconnects.

When a player disconnects:

Backend keeps authoritative state.
Opponent receives connection-status event.
Match follows configured clock behavior.
Returning player authenticates again.
Client resubscribes.
Backend sends latest full snapshot and recent events.
Client discards stale optimistic state.
Match continues if still valid.
For competitive play, the official server clock should generally continue unless the rules define a grace period.

Do not pause indefinitely based on client disconnect.

38. DATABASE DIRECTION
Use database migrations.

Potential tables:

users
player_profiles
refresh_tokens or sessions
variants
matches
match_players
match_snapshots
match_events
custom_variant_configs
ratings
rating_history
invitations
friendships later
Match record should include:

IDs;
status;
variant;
configuration;
player IDs;
result;
winner;
timestamps;
current version.
Use JSON for complex match-state snapshot initially if appropriate, but keep indexed relational columns for important query fields:

status;
players;
winner;
createdAt;
finishedAt;
variant.
Do not put everything into one unqueryable JSON field.

39. RATING AND RANKED PLAY
Do not implement rankings before stable online matches.

Potential future queues:

Casual Classic
Ranked Classic
Casual Magical
Ranked Magical
Private Custom
Custom is unranked by default.

Classic and Magical should have separate ratings because their rule sets differ.

Rating updates must:

occur only once;
rely on finalized server result;
be transactional;
be auditable;
not be client-controlled.
40. REPLAY
A replay is reconstructed from:

initial match config;
draft events;
accepted match events.
Replay controls:

first action;
previous;
next;
last;
autoplay;
speed;
turn list;
event details.
Replay should render through the same board presentation where possible.

Do not store replay as a video.

41. TESTING STRATEGY
41.1 Frontend tests
Test:

setup validation;
Ready disabled before 8;
progress display;
variant selection;
custom piece selection;
action submission;
error feedback;
modal behavior;
rendering accepted match state.
41.2 Pure JavaScript rule tests
Test every movement and edge case.

Critical tests:

board boundaries;
friendly blocking;
enemy capture;
jumping;
ray blocking;
White/Black directional symmetry;
draft shared tier;
independent draft piece selection;
combos;
initial support overflow;
spawn queue order;
capture-on-spawn;
move counter spawning;
all-out once only;
no-legal-move once only;
Skunk aura;
Antelope swap;
home claim timing;
winning score immediate stop;
reset state;
Soldier back-rank/promotion.
41.3 Backend unit tests
Test:

action authorization;
phase validation;
wrong-turn rejection;
stale-version rejection;
invalid target rejection;
transactional action application;
duplicate action ID handling;
timer expiration;
result finalization;
reconnect snapshot.
41.4 Integration tests
Test:

REST authentication;
create/join match;
submit action;
database persistence;
event ordering;
WebSocket broadcasts;
two-client synchronization;
reconnect.
41.5 End-to-end tests
Test the full flow:

guest/login;
setup;
eight draft rolls;
Ready;
support;
spawn;
play;
score;
finish;
history;
replay.
42. ERROR HANDLING
Frontend:

use an Error Boundary;
show recovery UI;
report action rejections clearly;
do not blank the whole screen for one component error;
log useful development diagnostics.
Backend:

consistent error responses;
machine-readable error code;
safe user-facing message;
correlation/request ID;
no stack traces to clients;
structured logs.
Example domain errors:

DRAFT_NOT_COMPLETE
INVALID_READY_STATE
WRONG_PHASE
NOT_YOUR_TURN
ILLEGAL_TARGET
PIECE_NOT_FOUND
PIECE_NOT_OWNED
SPAWN_NOT_PENDING
PROMOTION_REQUIRED
INVALID_PROMOTION_TYPE
MATCH_FINISHED
STALE_MATCH_VERSION
PLAYER_NOT_IN_MATCH
43. SECURITY REQUIREMENTS
For backend implementation:

validate all action payloads;
authorize every match action;
protect private match subscriptions;
never trust client color;
never trust client score;
never trust client timer;
never trust client legal targets;
never trust client winner;
use secure password hashing;
configure CORS specifically;
avoid wildcard production CORS;
protect against duplicate actions;
add request limits;
sanitize display names;
avoid leaking private user data;
use HTTPS/WSS in production;
keep secrets in environment variables;
never commit production secrets.
44. OBSERVABILITY
Later production readiness should include:

structured logging;
match ID in logs;
player IDs where safe;
action ID;
match version;
WebSocket connection metrics;
action rejection metrics;
database health;
application health endpoints;
error monitoring;
performance tracing where needed.
Do not prematurely build a complex observability stack during basic game development.

45. CLOUD AND DEPLOYMENT DIRECTION
Target deployment can eventually be:

Frontend:

static hosting/CDN.
Backend:

containerized Spring Boot application.
Database:

managed SQL.
Optional later:

managed Redis;
object storage/CDN for art;
reverse proxy/load balancer;
multi-instance WebSocket coordination.
Provide:

separate development and production configuration;
environment-variable configuration;
Dockerfiles;
local Docker Compose for backend/database;
database migrations;
CI build and test pipeline.
Do not deploy before build/test automation is reliable.

46. IMMEDIATE BUGS TO FIX FIRST
Before adding new pieces or backend:

Bug 1: Early Ready
Already partly addressed in useDraftSystem.

Verify:

REQUIRED_DRAFT_ROLLS declared centrally;
Ready rejected before eight;
UI button disabled;
progress shown;
one Ready side does not stop draft;
startGame verifies both have eight;
reordering disabled after Ready.
Bug 2: Reset integrity
Test Reset from every phase.

Bug 3: Duplicate state ownership
Search for state owned in both App.jsx and hooks.

Bug 4: Broken/unused hooks
Inspect:

useInitialSupportSystem;
useTimerSeizure;
any invalid state update;
any undeclared variable;
any stale callback.
Bug 5: Runtime safety
Add Error Boundary and prevent blank screens.

Bug 6: Removed piece references
Remove CAT and SOUL repository-wide.

Bug 7: Missing combo support
Ensure Bull x2 is represented in:

catalog;
draft labels;
initial expansion;
support/spawn behavior;
material score.
47. ARCHITECTURAL MIGRATION ORDER
Use this exact general order.

Stage 0 — Audit
Deliver:

repository tree;
current architecture;
dependency graph;
current state ownership;
duplicated logic;
current build errors;
current test status;
CAT/SOUL references;
Ready path;
reset path;
proposed file changes.
Stage 1 — Stabilize draft/setup
Implement and test:

Ready validation;
progress;
shared rolling;
setup lock;
reset;
Error Boundary.
Stage 2 — Canonical rules documentation
Create:

docs/game-rules.md
docs/pieces.md
docs/variants.md
docs/architecture.md
For rules not explicitly given here, copy the actual current behavior from code and mark unresolved items.

Stage 3 — Catalog and variants
Implement:

clean piece catalog;
tiers outside hooks;
Classic;
Magical;
Custom;
CAT/SOUL removal;
custom piece filtering;
deterministic draft tests.
Do not add all new movements in this stage.

Stage 4 — Bull
Add:

metadata;
combo;
rendering;
movement;
tests.
Stage 5 — Skunk
Add:

metadata;
movement;
aura;
global legal-target filtering;
all-out interaction;
tests.
Stage 6 — Gajashva
Add:

metadata;
movement;
rendering;
tests;
balance documentation.
Stage 7 — Soldier promotion
First produce decision record and migration plan.

Then implement only after behavior is confirmed.

Stage 8 — Reduce App.jsx
In order:

Wire/fix initial-support system.
Wire/fix timer/seizure system.
Extract home system.
Extract all-out logic.
Extract move counter.
Extract special-piece effects.
Extract board action resolution.
Create useLocalMatch coordinator.
Do not combine every extraction into one commit.

Stage 9 — Pure action engine
Introduce:

MatchState;
action types;
validateAction;
applyAction;
events;
serialization;
rule tests.
Stage 10 — Backend foundation
Create Spring Boot application and modular packages.

Implement:

identity;
player;
variant;
match;
migrations;
tests.
Stage 11 — Server-authoritative match
Implement REST action submission first.

Use one browser controlling both sides for testing.

Stage 12 — WebSocket online play
Implement:

two players;
live state;
action rejection;
reconnect;
timers;
match finish.
Stage 13 — Product features
Implement:

login/register;
guest Skip;
onboarding;
private rooms;
matchmaking;
profiles;
history;
replay;
ratings later.
Stage 14 — Deployment readiness
Implement:

containers;
migrations;
CI;
production config;
health checks;
cloud deployment documentation.
48. ACCEPTANCE CRITERIA FOR A COMPLETE BASIC LOCAL GAME
The local game is considered complete only when:

app starts without console runtime errors;
players can draft exactly eight entries;
Ready cannot occur early;
queues can be reordered before Ready;
both Ready states start correctly;
initial support works;
support overflow returns to bench;
initial spawning works;
spawn captures work;
normal turns work;
every current piece has legal movement;
captures work;
move counters work;
spawn requests work;
home claims work;
claim timing is correct;
all-out works once;
no-legal-move works once;
timers work;
reserve works;
seizure works;
target-score victory stops immediately;
winner modal works;
match log works;
reset works from all phases;
CAT/SOUL are absent;
Classic/Magical/Custom selection works;
Bull works;
Skunk works;
Gajashva works;
Soldier promotion behavior is finalized and tested;
build passes;
rule tests pass.
49. ACCEPTANCE CRITERIA FOR ONLINE MVP
Online MVP is complete only when:

two authenticated or guest players can join one match;
server assigns sides;
server owns random drafting;
server validates Ready;
server validates every action;
clients receive synchronized state;
illegal actions are rejected;
stale actions are rejected;
official timers are server-based;
disconnect/reconnect restores state;
completed match persists;
match log persists;
replay can be loaded;
result cannot be submitted by client;
backend tests pass;
end-to-end two-client test passes.
50. REQUIRED WORKING STYLE
Do not ask for confirmation after every small step.

If a rule is genuinely blocked by ambiguity:

inspect existing code;
preserve current behavior;
document the unresolved decision;
continue with non-blocked work.
Do not generate fake files without inspecting paths.

Do not say a build works unless you ran it.

Do not say tests pass unless you ran them.

Do not silently remove behavior.

Do not dump a replacement 1,700-line App.jsx unless there is no safer alternative.

Prefer targeted edits with exact file paths.

When making a large change:

explain the responsibility being moved;
implement it;
update imports;
remove the duplicate;
run tests/build;
report results.
51. FIRST REQUIRED RESPONSE AND ACTION
Begin with a repository audit.

Your first response must contain:

Your understanding of Ārohaṇa-rana.
Actual repository structure observed.
Frontend dependencies observed.
Backend status observed.
Current App.jsx responsibilities.
Current hook responsibilities.
Current engine responsibilities.
Duplicated or conflicting state.
Current build/test result.
Ready bug path.
Reset path.
CAT references.
SOUL references.
Current piece catalog.
Current tier pools.
Current variant support.
Current movement-rule organization.
Current Soldier back-rank behavior.
Current timer/seizure behavior.
Current home-claim behavior.
Recommended Stage 1 files.
Stage 1 acceptance criteria.
Risks and rules that must be preserved.
Then implement Stage 1 only:

stabilize build;
complete Ready validation;
display 0/8 draft progress;
prevent early Ready;
ensure rolling is not blocked incorrectly;
disable reordering after Ready;
validate startGame;
verify Reset;
introduce Error Boundary;
add focused tests.
After Stage 1:

run build;
run tests;
report exact results;
proceed to Stage 2 only if Stage 1 is green.
52. FINAL REMINDER
The primary strategic goal is not merely shortening App.jsx.

The primary goal is to create a system where:

game rules are deterministic and independently tested;
React is a client;
local play uses the same conceptual action model;
Spring Boot can become authoritative;
online multiplayer cannot be cheated through client state;
new pieces and variants can be added through catalog/configuration and focused rules;
the platform can grow without another complete rewrite.
Inspect first. Preserve existing behavior. Fix critical bugs. Lock the rules. Build pure rules. Then build the backend. Then build online play. Then build the larger platform.