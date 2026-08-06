# Bottom Action Bar — Chess.com Style Game Controls

## Goal

Add a professional bottom action bar (like chess.com) with 5 actions:
**Home | Chat | Learn | Draw | Resign** — replacing the current top-right "Exit to Menu" button.

## The 5 actions

### 1. Home (🏠) — exit via surrender

- Removes the current top-right "Exit to Menu" button
- Clicking **Home** opens a **confirm dialog**: "Surrender and exit to menu? The match will be counted as a loss."
- Confirm → the match ends as a **LOSS** for the local player (opponent wins), the `WinnerModal` shows the result, then returns to the main menu.
- Cancel → stays in the match.

### 2. Chat (💬) — placeholder

- Renders the icon button; clicking shows a small "Chat coming soon" toast. No functionality yet (user will build it later).

### 3. Learn / Academy (📚) — placeholder

- Icon button; clicking shows "Academy coming soon" toast. No functionality yet.

### 4. Draw (🤝) — offer draw with accept/decline

- Clicking **Draw** sends a draw offer (handshake icon).
- The opponent sees a notification overlay: **"Opponent offers a draw — [Accept] [Decline]"**.
- **Accept** → match ends as a **DRAW** (`winner = "DRAW"`), `WinnerModal` shows "Match Drawn".
- **Decline** → notification closes; match continues.
- (Online: would be sent via socket; for local pass-and-play the "opponent" is simulated so the flow is testable.)

### 5. Resign (🏳️) — surrender

- Clicking **Resign** shows a confirm dialog: "Resign? The match will be counted as a loss."
- Confirm → local player **loses** (`winner = opponent`), `WinnerModal` shows the loss, match log recorded, "Start Again" available.
- Cancel → stays.

## Files to create/modify

| File                                                          | Change                                                                                                                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frontend/src/components/panels/GameActionBar.jsx` (NEW)      | The bottom bar with 5 icon buttons                                                                                                                                                                     |
| `frontend/src/components/panels/DrawOfferModal.jsx` (NEW)     | Accept/Decline draw overlay                                                                                                                                                                            |
| `frontend/src/components/panels/ConfirmActionModal.jsx` (NEW) | Reusable confirm dialog (Home/Resign)                                                                                                                                                                  |
| `frontend/src/components/panels/WinnerModal.jsx`              | Already handles DRAW & WIN — minor: add "resigned" wording                                                                                                                                             |
| `frontend/src/App.jsx`                                        | State: `drawOffer`, `pendingDraw`, `confirmAction`; handlers: `offerDraw`, `acceptDraw`, `declineDraw`, `resign`, `surrenderAndExit`; remove top-right Exit button; render GameActionBar at the bottom |
| `frontend/src/engine/matchLogEngine.js`                       | Add `RESIGN` / `DRAW_OFFER` log types + creators                                                                                                                                                       |

## State in App.jsx

```js
// Draw flow
const [drawOfferedBy, setDrawOfferedBy] = useState(null); // "WHITE" | "BLACK" | null
const [drawOfferPending, setDrawOfferPending] = useState(false); // opponent hasn't responded

// Confirmation dialog
const [confirmAction, setConfirmAction] = useState(null); // { type: 'home' | 'resign' }

// End-match helper
function endMatchAs(winner, { resignedBy }) {
  // log, setWinner(winner), setPieces freeze, show WinnerModal
}
```

## Draw flow (local pass-and-play)

1. Player clicks **Draw** → `setDrawOfferedBy(localColor)`, `setDrawOfferPending(true)`
2. `DrawOfferModal` appears: "Opponent offers a draw" (the other side)
3. **Accept** → `endMatchAs("DRAW")` → WinnerModal "Match Drawn"
4. **Decline** → close modal, clear state, resume
5. Only one pending offer at a time; clicking Draw while pending shows "Offer already sent"

## Home/Resign flow

- Both use the same `ConfirmActionModal`
- **Home** confirm → `endMatchAs(opponent)` (loss) → after WinnerModal's "Start Again" / "View Log", the user can also return to menu. Actually: Home = loss + **auto-return to menu** after the modal's "OK" (or immediately set currentScreen to MENU after ending the match).
- **Resign** confirm → `endMatchAs(opponent)` (loss) → WinnerModal shown with "Start Again" + "View Match Log"

## Layout

```
┌───────────────────────────────┐
│ [Black] Score Moves Bench ▶    │
│       ▲ Spawn Rhino (floats)   │
├───────────────────────────────┤
│             BOARD              │
├───────────────────────────────┤
│       ▲ Spawn Rhino (floats)   │
│ [White] Score Moves Bench ▶    │
│ 📝 Match Log #11 ... ▶         │
├───────────────────────────────┤
│ 🏠  💬  📚  🤝  🏳️         │  ← NEW bottom action bar
│ Home Chat Learn Draw Resign    │
└───────────────────────────────┘
```

- Fixed at the bottom of the game container (same board-width), compact 40px height
- Icons are stroke SVGs (like the existing BottomNav), hover highlight, gold active state
- Badge dot on Draw when a draw offer is pending

## Acceptance

- Home shows surrender-confirm → loss → menu
- Chat/Learn show "coming soon" toast
- Draw offer → accept = DRAW / decline = continue
- Resign → confirm → loss → WinnerModal with Start Again
- Build passes, board/panels untouched, single-page view preserved
