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

## Ownership patience

Positive heat changes use scrutiny = 1 − 0.8 × max(0, 1 − tenure / 2)², where tenure = season − 1 + completed regular-season games / 10. This rises smoothly from 20% to 80% entering year two and 100% entering year three. Heat changes are rounded to one decimal place. Offseason reviews use all ten completed games, so scrutiny does not jump at a season boundary. Win cooling and successful owner reviews are unchanged. Game reports show the grace discount; trades and owner reviews use the same weighting. Existing saves keep accumulated heat and use the new rules on their next action.

## Offseason-first season flow

New runs open in the season-one offseason with pick #3. Trades and free agency are available before or after drafting. Complete the draft, then explicitly choose Start season; kickoff itself does not simulate a game. Following owner review, the next season budget is granted, contracts age, and earned picks are preserved before standings reset. The new draft then happens within that upcoming season, so newly drafted rookies do not immediately age or lose a contract year.

First-year rookie salaries ($3M per selection) are reserved from discretionary spending and charged at selection. There is one veteran trade per season: before drafting its extra selection joins the current class, afterward it belongs to the next offseason. Training has two offseason slots and resets for Week 1.

Existing saves retain progress. In-progress seasons finish normally. Older pending drafts finish before entering the next offseason with that draft marked complete. Existing week-zero seasons open the offseason; an already-funded/finished draft is not duplicated. A year-one save with enough unspent rookie funds gets the new initial draft; otherwise its prior spending is preserved and drafting begins next offseason.

## Full draft board

The Draft board tab shows all 44 prospects before and during the draft, with rank, position, overall, potential, current starter comparison, and availability. Trade up before entering the draft or before your first selection; the offer names the exact existing prospects it unlocks. Selecting players never removes them from the full board, while the selectable pool still shrinks as rivals pick between your selections. All remaining prospects can be selected, rather than only the first ten. Older saves retain their available prospects; missing historical ranks are filled once on migration without changing gameplay RNG.
