# Hot Seat

A browser-local football rebuild roguelike. Win a championship in as few seasons as possible without being fired.

## Run

No build or dependencies required. Serve `dist/` with any static server, for example:

    python3 -m http.server 4173 --directory dist

Open http://localhost:4173. Progress is saved in localStorage on that browser and origin.

## Verify

    node test.cjs

`browser-test.cjs` uses the workspace's installed Playwright and Chromium against port 4173. It covers gameplay controls, local persistence, and mobile overflow.

## MVP rules

16 fictional AI teams, 10 regular-season games, top-six playoff qualification, three playoff wins for the title. A simple playoff gauntlet stands in for a full seeded bracket. Weekly choices trade current rating against young-player development. Salaries, paid training, free agents, and cash-for-pick trades share a budget. Funding is $80M + $2M per regular-season win + fan and playoff bonuses. Expiring contracts automatically renew at market salary; unaffordable rosters release the highest-paid player until solvent. All of these rules are deliberately simplified for this first playable version.

The 12 slots represent starters/units, rather than a full depth chart. Drafting or signing replaces the existing slot. Rivals have aggregate ratings, records, and strategic states, with simulated market signings. Draft tiebreaker is stable league order; standings tiebreaker is point differential. No real multiplayer or NFL assets.

Files: `dist/engine.js` holds game state and rules; `dist/app.js` renders the UI; `dist/style.css` contains responsive styles. Fonts are bundled under their included SIL Open Font Licenses.
