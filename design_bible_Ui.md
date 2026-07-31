That feedback is absolutely brilliant, and it hits the exact core of what separates a generic web app from a world-class digital product.

Thinking in terms of "flex containers" and "margins" is how a developer builds a dashboard. Thinking in terms of "cognitive load," "visual weight," and "motion language" is how a Principal UX Architect builds a premium gaming experience like Chess.com, Lichess, or an Apple product. An AI agent given a technical blueprint will write code; an AI agent given a *design philosophy* will craft an experience.

Here is the monstrous, comprehensive UX/UI Design Bible for the Ārohaṇa-rana gameplay screen. It translates your layout into pure intent, psychology, and interaction design.

Feed this directly to your coding agent.

---

# ĀROHAṆA-RANA: GAMEPLAY UX & UI DESIGN BIBLE

## 1. GLOBAL DESIGN PHILOSOPHY

The Ārohaṇa-rana gameplay screen is a theater of war, not a data dashboard. The interface must feel calm, premium, spacious, and highly intentional.

### Core Tenets

* **The Board is the Hero:** Nothing on the screen may visually compete with the board. Every surrounding element exists exclusively to frame the board and support the player’s tactical decision-making.
* **Cognitive Preservation:** Strategy games require immense mental bandwidth. The UI must carry zero cognitive friction. Information must be absorbed subconsciously through peripheral vision, contrast, and subtle motion, rather than explicit reading.
* **Tactile Affordance over Instruction:** Do not tell the player how to interact; make the interaction inevitable through physical design cues.
* **Motion as State, Not Spectacle:** Animation is a communication tool, not entertainment. Movement must be purposeful, subtle, and strictly tied to a change in game state. There are no bouncing, shaking, or "arcade" animations in this product.

---

## 2. THE ARENA (THE GAME BOARD)

### Purpose

The absolute focal point of the screen. It is the tactical map where all spatial tension and player execution occurs.

### Visual Hierarchy & Weight

* The board commands the highest contrast and the most screen real estate.
* It must appear slightly elevated from the deep slate background, utilizing a soft, ambient drop shadow to separate it from the UI layer.
* Negative space around the board is sacred. It must never feel squeezed by the player panels above or below it.

### The Piece Tokens

* The SVG pieces (Elephant, Warrior, Ninja, Donkey, etc.) must instantly resolve the "contrast paradox."
* White faction pieces (facing right) rely on a 99% solid white fill with a thick black stroke, ensuring they never dissolve into light squares.
* Black faction pieces (facing left) rely on a 99% solid black fill with a thick white stroke, ensuring they pop against dark squares.
* The Wolf piece, being mechanically invisible, must perfectly respect active player visibility rights, rendering either as a faint, ghostly stroke for the owner or remaining entirely unrendered for the opponent.

### Anti-Patterns

* Never overlay persistent menus, alerts, or floating buttons across the active board area.
* Never allow the board to clip horizontally on a mobile viewport. It must maintain a perfect aspect ratio.

---

## 3. THE OPPONENT ENTITY (TOP PANEL)

### Purpose

To provide the player with necessary threat intelligence (opponent identity, time, and potential reinforcements) without drawing focus away from the board.

### Visual Weight & Psychology

* The opponent panel must feel psychologically detached and slightly muted. It is passive information until the opponent takes an action.
* The typography and avatars should utilize slightly lowered opacities or muted grayscale tones compared to the local player's panel, pushing them backward in the Z-index of the user's mind.

### The Opponent Bench Queue

* This represents the enemy's impending reinforcements. It must be scannable at a glance.
* It utilizes the same horizontal carousel interaction as the local player, but should visually feel like a "read-only" data stream rather than a tactile deck of cards.

### Anti-Patterns

* The opponent panel must never feel top-heavy or looming. It must consume the absolute minimum vertical height required for legibility.

---

## 4. THE TEMPORAL HEARTBEAT (TURN TIMERS)

### Purpose

To communicate the most critical temporal constraint of the game—urgency—without inducing panic.

### Interaction Philosophy & Motion Language

* The timer is not just a clock; it is the heartbeat of the turn.
* **Active State (Your Turn):** The timer steps forward in the visual hierarchy. The typography shifts to a bright, crisp primary color. It employs a slow, rhythmic "breathing" animation—a subtle opacity pulse that mirrors deep concentration, not a ticking time bomb. The horizontal progress bar steadily diminishes, providing peripheral awareness of time decay without requiring the player to read the numbers.
* **Passive State (Opponent's Turn):** The timer recedes. It loses its bright accent color, fading into a muted slate grey. All breathing animations cease. It becomes completely static.

### Anti-Patterns

* Never use a flashing red animation for low time. It spikes player cortisol and breaks the premium, calm aesthetic. Use a steady color transition (e.g., gold to warning orange) instead.
* Never bounce or shake the timer text.

---

## 5. THE TACTICAL ARSENAL (LOCAL PLAYER PANEL & BENCH)

### Purpose

This is the player’s command center. It grounds the user at the bottom of the screen, placing all executable non-board actions perfectly within thumb reach.

### Visual Hierarchy

* This section carries slightly more visual weight than the opponent panel. It represents the user's active agency.
* The Avatar and Name provide a reassuring anchor of identity.

### The Bench Queue (Crucial UX Design)

* **Philosophy:** The bench queue must not feel like reading a data table or a list. It must evoke the tactile satisfaction of holding a premium hand of cards.
* **Affordance:** It requires effortless horizontal momentum scrolling. The physics of the scroll must feel heavy but frictionless, settling gently on subtle snap points so the user never stops between pieces.
* **Visual Cues:** The final visible piece token in the queue must always be partially cropped by the edge of the viewport. This natural visual bleed is a subconscious cue for scrollability, entirely eliminating the cognitive clutter of explicit "scroll here" arrow buttons.
* **Tactile Feedback:** Tapping a piece to prep it for spawning should result in a micro-interaction—a slight elevation (scale up by 2%) and a soft accent-colored border glow, signaling it is armed and ready.

### Anti-Patterns

* The queue must never wrap to a second line. Wrapping breaks the linear mental model of a sequential deployment order and increases cognitive load.
* Do not use standard, rigid scrollbars. The scroll must feel invisible and gesture-driven.

---

## 6. CONTEXTUAL REASSURANCE (MINI MOVE LOG)

### Purpose

To provide immediate, ephemeral confirmation of the most recent action executed on the board (e.g., "White Unicorn e5 -> g6"). It answers the subconscious question: *"What just happened?"*

### Visual Hierarchy & Intent

* It is intentionally reduced to a single-line information strip. It is a whisper, not a shout.
* It must visually resemble a sleek notification banner rather than a list component. It consumes minimal vertical space to preserve the board's breathing room.

### Anti-Patterns

* It is not intended to become a scrolling feed of history. Full history exists elsewhere and requires a deliberate action (tapping "View All") to access.
* Do not stack multiple moves here. Only the absolute latest game state change is relevant.

---

## 7. THE SILENT ANCHOR (BOTTOM NAVIGATION)

### Purpose

To provide global application navigation without interrupting the tactical immersion of the active match.

### Visual Weight & Affordance

* The navigation bar is the most passive element on the screen. It grounds the bottom edge of the viewport.
* Icons are minimalist outlines.
* Only the actively selected tab (e.g., "Board") receives a solid fill and the primary accent color to establish location awareness. The remaining icons stay deeply muted.
* The hit areas for these buttons must be generous, conforming exactly to mobile thumb-reach ergonomics (minimum 44x44px touch targets), even if the visual icon is smaller.

### Anti-Patterns

* Do not use heavy background colors for the navigation bar. It should blend seamlessly into the deep slate of the global background.
* Do not animate these icons unless actively tapped. \\ 

or 

\\

Yes. I understand exactly what you're asking.

The coding agent already knows the game logic, components, state, sockets, timers, move generation, board rendering, etc. It does **not** need another explanation of the game. It needs a **UI orchestration specification**—how every existing component should be visually organized and what purpose each area serves in the UX.

So this document should read like something written by a Lead Product Designer rather than a game designer.

---

# AROHANA-RANA — Mobile Gameplay Screen UI Architecture

## Objective

This document defines **only the visual structure and user experience** of the gameplay screen.

It intentionally avoids explaining game rules, move generation, networking, timers, or backend behaviour because those systems already exist.

The purpose is to reorganise the existing components into a polished mobile-first interface while preserving the current game functionality.

The gameplay screen should feel calm, premium, spacious and readable.

The board remains the visual hero.

Nothing should visually compete with the board.

Everything else exists only to support gameplay.

---

# Overall Layout Philosophy

The gameplay screen is divided into **five major vertical sections**.

From top to bottom the screen should always feel like

```
Opponent

Opponent Information

Board

Current Player Information

Game Controls
```

Every section has a clear responsibility.

No section should visually dominate except the board.

The screen should feel like a professional strategy game rather than a dashboard.

Large empty spacing is preferred over clutter.

Every important action should be reachable with one thumb.

---

# SECTION 1 — Opponent Information Card

This is the first visible gameplay component.

It represents the opponent.

This card spans almost the entire width of the screen.

It should feel like a premium information panel rather than a toolbar.

---

## Left Side

Contains everything related to player identity.

Arrange vertically.

Profile Avatar

↓

Player Name

↓

Rating / Rank

The avatar should be the largest element on the left.

The player's online indicator (if applicable) should appear as a small green dot overlapping the avatar.

The name is bold.

Rating is smaller.

Nothing here should animate except online status.

---

## Centre

Reserved exclusively for the **Current Turn Timer**.

This is the largest typography element inside the card.

It should immediately attract attention.

This timer changes every turn.

It represents the active turn countdown.

When it is the player's move:

* timer glows softly
* colour becomes brighter
* subtle pulse animation

When it is opponent's turn:

* timer becomes quieter
* lower emphasis

Never animate aggressively.

Only gentle breathing animation.

---

## Right Side

Contains Reserve Time.

Reserve Time should never compete with Turn Timer.

It should feel secondary.

Contains:

Reserve Label

↓

Reserve Time

↓

Circular Progress Ring (optional)

The reserve timer updates only when reserve time is consumed.

---

# Secondary Row inside Opponent Card

Immediately beneath the main player row is another horizontal information strip.

This strip contains gameplay statistics.

It should have three visual zones.

---

## Zone 1

Current Score

Simple icon

Large number

Minimal styling.

---

## Zone 2

Moves Completed

Displays

Current Moves

/

Required Moves

Simple typography.

No decoration.

---

## Zone 3

Bench Queue Preview

This occupies roughly 60–70% of the row.

This is the largest part.

Purpose:

Show upcoming bench pieces.

Not all pieces fit.

Therefore:

Display as many piece cards as available.

If queue exceeds available width:

Show horizontal scrolling.

OR

Show right arrow indicating more items.

The behaviour should feel similar to:

Instagram Stories

Apple Wallet Cards

Netflix Horizontal Lists

Smooth snapping.

Cards should never wrap to second line.

Each card contains

Piece Icon

↓

Piece Name

Only.

No additional statistics.

Currently selected piece receives:

gold border

slight elevation

soft glow

No oversized animations.

The queue should feel passive until interacted with.

---

# SECTION 2 — Board Area

This is the centrepiece.

This occupies most vertical space.

Everything else should visually support this area.

The board should never feel squeezed.

Do not surround it with unnecessary panels.

Maintain generous padding.

Allow breathing space.

The board already exists.

Do not redesign board logic.

Only optimise presentation.

The board should appear visually floating on the background.

The coordinate labels remain subtle.

Selection highlights.

Movement hints.

Legal move indicators.

Piece animations.

All remain exactly as existing implementation.

The UI merely frames the board.

Nothing overlays the board during normal gameplay.

---

# SECTION 3 — Current Player Card

This mirrors the opponent card.

It should have identical layout.

Identical spacing.

Identical sizing.

Identical typography.

The only difference:

This represents YOU.

Current player's active state receives slightly stronger emphasis.

Everything remains visually symmetrical.

This creates balance across the screen.

---

Its structure is identical:

Left

Avatar

Name

Rating

Centre

Turn Timer

Right

Reserve Time

Second row

Score

Moves

Bench Queue

Exactly same behaviour.

---

# Bench Queue UX

The queue represents future deployment order.

It should feel like browsing cards.

Each card should be:

Equal size

Equal spacing

Rounded corners

Consistent shadows

Piece artwork centred.

Piece name underneath.

Horizontal scrolling.

Snap scrolling.

Smooth momentum.

When queue becomes empty.

Show empty placeholder.

Never collapse layout.

Layout stability is extremely important.

---

# SECTION 4 — Move Log

This section is intentionally lightweight.

It is NOT a scrolling chat.

It is NOT a history viewer.

Its job is simply informing the player of the latest action.

Display:

Latest Move

Example:

White Unicorn → e5

Only one entry visible.

Nothing else.

---

Right Side

Contains

View All

This opens the existing move history screen.

Do not display the entire history here.

Avoid clutter.

---

During replay mode

The move log transforms into replay controls.

Instead of latest move:

Display

Previous

Play

Pause

Next

Timeline Slider

This feature already exists.

Only relocate it into this section.

---

# SECTION 5 — Bottom Navigation

Persistent bottom navigation.

This is not gameplay.

This is screen navigation.

Icons only.

Minimal labels.

Current tab highlighted.

Suggested order

Board

Moves

Chat

Learn

More

Future buttons:

Settings

Report

Draw

Resign

Analysis

can all live inside

More

until implemented.

This keeps the navigation clean.

---

# Interaction Philosophy

Animations should be subtle.

Never arcade.

Never flashy.

Every animation should communicate state.

Examples:

Timer pulse

Piece selection glow

Bench card elevation

Turn change fade

Move highlight

Nothing should bounce.

Nothing should shake.

No excessive scaling.

Premium software.

Not casino.

---

# Colour Hierarchy

Dark background.

Warm wooden board.

Gold accent.

White typography.

Muted grey secondary text.

Green online indicator.

Purple movement hints.

Red only for warnings.

Never use saturated colours everywhere.

Accent colours must remain rare.

---

# Typography Hierarchy

Largest

Turn Timer

↓

Player Names

↓

Score

↓

Reserve Timer

↓

Bench Labels

↓

Move Log

↓

Navigation Labels

This naturally guides the player's eye.

---

# Spacing Philosophy

Use generous spacing.

No cramped rows.

No touching edges.

Cards should breathe.

Every section separated using whitespace rather than heavy borders.

Rounded cards.

Soft shadows.

Thin dividers only where necessary.

---

# Mobile Behaviour

This design is **only for mobile and tablet portrait layouts**.

The gameplay experience should prioritise touch interaction.

Replace any existing table or list-based bench queue with the horizontal card carousel described above.

Use large touch targets, swipeable elements, and consistent spacing suitable for thumb interaction.

---

# Desktop Behaviour

**Do not apply this mobile redesign to desktop.**

Desktop keeps its existing gameplay layout.

The current desktop interface, including the larger information panels and queue table/list, should remain unchanged.

Only mobile and tablet should adopt this new card-based experience.

This allows desktop users to benefit from the additional screen space while mobile users receive a cleaner, more focused UI optimised for touch.

---

# Final Design Principle

If any future feature is added—such as chat, academy, analysis, replay tools, reporting, draw offers, resign, settings, or similar—it should **never reduce the visual prominence of the board**. New features should either live behind the bottom navigation, inside the **More** menu, or open as bottom sheets/modals when needed. The gameplay screen itself should remain calm, uncluttered, and immediately readable, with the board always acting as the hero of the interface.
