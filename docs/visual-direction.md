# Visual direction

Hot Seat is a football front-office roguelike: build a champion before ownership fires you. Preserve the existing dark green dashboard, lime primary actions, condensed sports typography, and literal flaming chair until a visual PR explicitly proposes a new direction.

## Editing boundaries

- `dist/js/game/engine.js`: simulation, budgets, drafts, progression, save migrations. Coordinate gameplay changes with the gameplay owner.
- `dist/js/ui/screens/`: presentation of individual screens. Render functions receive game state and return HTML. Do not mutate the supplied state.
- `dist/js/ui/components/`: shared presentation, including the hot seat, result report, buttons, and page layout.
- `dist/js/ui/app.js`: browser state, persistence, navigation, and action dispatch. Coordinate edits here because screens share it.
- `dist/js/ui/format.js`: small shared DOM/formatting helpers.
- `dist/styles/tokens.css`: font declarations and palette variables.
- `dist/styles/base.css`: element defaults, buttons, and interaction states.
- `dist/styles/components.css`: component styling and desktop layouts.
- `dist/styles/screens.css`: responsive layouts and screen-specific overrides.
- `dist/assets/`: bundled fonts, icons, and illustrations. Keep font licenses beside the fonts.

The application intentionally remains buildless. Classic scripts load in the order declared in `index.html`; they share function names, but only the controller owns mutable UI/game state. A new screen or component needs a script entry before the controller. Avoid duplicate global function names.

## Collaboration

Use an isolated Git worktree and feature branch for visual work. Submit focused PRs against `main`, with before/after desktop and mobile screenshots and a Vercel preview URL when available. Do not merge visual work automatically. Coordinate changes to the controller, page layout, or engine with other active work.

Visual PRs should preserve data-action values, game outcomes, localStorage key `hotseat-v1`, and save compatibility. Changes to gameplay or persistence should be called out explicitly, not hidden in a visual redesign.
