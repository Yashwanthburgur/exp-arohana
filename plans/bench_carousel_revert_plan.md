# Bench Queue Carousel — Minimal Change Plan

## Problem
I over-engineered the change and replaced the entire [`SidePanel`](frontend/src/components/panels/SidePanel.jsx) + [`App.jsx`](frontend/src/App.jsx) layout with a new [`PlayerPanelCard`](frontend/src/components/panels/PlayerPanelCard.jsx) component. The user only wants **one section** changed: the **"Bench Queue"** vertical list (lines 181-202 of [`SidePanel.jsx`](frontend/src/components/panels/SidePanel.jsx)) replaced with a horizontal Instagram-Stories-style carousel.

Everything else — board size, roll button, draft queue, ready button, timer, score/moves display — must remain **exactly as it was**.

## Current State
- [`App.jsx:59`](frontend/src/App.jsx:59) imports `PlayerPanelCard` instead of `SidePanel`
- [`App.jsx:1754-1812`](frontend/src/App.jsx:1754) renders `PlayerPanelCard` for both players (wrong layout)
- [`GameScreen.jsx:13`](frontend/src/screens/GameScreen.jsx:13) imports `PlayerPanelCard` from separate file (correct for mobile, can stay)
- [`SidePanel.jsx:74-344`](frontend/src/components/panels/SidePanel.jsx:74) — the original side panel with full draft/game UI
- [`SidePanel.jsx:181-202`](frontend/src/components/panels/SidePanel.jsx:181) — the "Bench Queue" vertical list to replace
- [`BenchRow.jsx:8`](frontend/src/components/panels/BenchRow.jsx:8) already imports `PieceTooltip` correctly (`../tooltip/PieceTooltip.jsx`)
- [`PieceTooltip.jsx`](frontend/src/components/tooltip/PieceTooltip.jsx) — already created and working

## Changes Required

### 1. `frontend/src/App.jsx` — Restore SidePanel
- Line 59: Change `import PlayerPanelCard from "./components/panels/PlayerPanelCard.jsx";` → `import SidePanel from "./components/panels/SidePanel.jsx";`
- Lines 1750-1775: Replace `<PlayerPanelCard>` for opponent with `<SidePanel>` using proper props
- Lines 1789-1812: Replace `<PlayerPanelCard>` for local player with `<SidePanel>` using proper props

### 2. `frontend/src/components/panels/SidePanel.jsx` — Replace lines 181-202
- Add import: `import BenchRow from "./BenchRow.jsx";`
- Lines 181-202 (the `Bench Queue` div): Replace the vertical list (`<div className="min-h-0 flex-1 rounded-xl...">...`) with a `<BenchRow>` component

### 3. `frontend/src/components/panels/BenchRow.jsx` — Already correct
- Import path `../tooltip/PieceTooltip.jsx` ✅
- Already uses `PIECE_CATALOG` and `getPieceIconComponent` directly ✅
- No changes needed

### 4. `frontend/src/screens/GameScreen.jsx` — No changes needed
- Uses `PlayerPanelCard` for mobile layout, which works fine ✅

### 5. `frontend/src/components/panels/PlayerPanelCard.jsx` — No changes needed
- Created as reusable component, not modified ✅

## SidePanel Props (for App.jsx restoration)

```jsx
<SidePanel
  color={color}
  army={army}
  isReady={isReady}
  setReady={setReady}
  score={score}
  moves={moves}
  MOVE_LIMIT={MOVE_LIMIT}
  isGameStarted={isGameStarted}
  isWhitePanel={isWhitePanel}
  whiteArmy={whiteArmy}
  blackArmy={blackArmy}
  rollPiece={rollPiece}
  moveUp={moveUp}
  moveDown={moveDown}
  getQueueLabel={getQueueLabel}
  calculateMaterialTotal={calculateMaterialTotal}
  timerEnabled={timerEnabled}
  activeTimerColor={activeTimerColor}
  timerState={timerState}
  hasReserveEnabled={hasReserveEnabled}
  formatClock={formatClock}
  seizureAction={seizureAction}
  timeoutStatus={timeoutStatus}
  pendingInitialSupportColor={pendingInitialSupportColor}
  initialSupportQueues={initialSupportQueues}
  pendingSpawnColor={pendingSpawnColor}
  getSpawnTargets={getSpawnTargets}
  pendingHomeAttack={pendingHomeAttack}
  isDraftComplete={isDraftComplete}
  readOnly={readOnly}
/>
```

## Visual Result

Same exact layout as before, **except**:

```
Before:                           After:
┌─────────────────────┐           ┌─────────────────────┐
│  Bench Queue        │           │  Bench Queue        │
│  1. Gajashva        │           │  [icon][icon][icon] │
│  2. Giraffe         │    →      │  [icon][icon][ ← →]│
│  3. Donkey          │           │  (horizontal scroll)│
│  4. Gajashva        │           └─────────────────────┘
│  5. Soldier          │
│  6. Soldier          │
└─────────────────────┘
```

- **Score/Moves** numbers stay  
- **TIMER** stays  
- **Draft queue** with roll/up/down/ready stays  
- **Board** size/design stays  
- **Only** the "Bench Queue" list becomes a horizontal scrollable icon carousel  
- Hover/tap piece icons to see their name
