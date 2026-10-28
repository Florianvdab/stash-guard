# Stash Guard

A static website to keep a list of Diablo 3 items you're hunting (legendaries, set items, legendary gems),
shown with icon and quality colour, so you recognise them when they drop and don't salvage them.
Public repo, hosted as a static site (GitHub Pages). English, PC.

Out of scope: reading the real stash/inventory (the Blizzard API can't), trading, build planning.

## Structure

```
index.html, css/style.css     the page
js/app.js                     wiring: state, events, render calls (no logic of its own)
js/catalog.js                 item lookup + search            ┐
js/my-list.js                 pure list operations            │ pure, unit tested,
js/quality.js                 filter + counts                 │ no DOM
js/backup.js                  export/import file format       │
js/selection.js, shortcuts.js keyboard navigation + shortcuts ┘
js/storage.js, js/files.js    browser side effects (localStorage, download)
js/views/*                    DOM rendering only, one view per file (search-palette is the command-palette search,
                              embers the background canvas, transition the View Transitions wrapper)
scripts/fetch-items.js        builds data/items.json + icons/ from the Blizzard API
scripts/lib/*                 API client, item rules (pure, tested), cache, icons
scripts/check-secrets.js      fails if .env or its values are tracked
test/*.test.js                node:test unit tests
```

## Commands

- `npm run fetch-items`: regenerate the item data (needs `.env`, ~1 min, cached in `.cache/`). Re-run per new season.
- `npm run check`: lint + tests + secret scan. The pre-push hook runs it.
- `npm run serve`: local server on :8099 (ES modules and `fetch` don't work over `file://`).

## Data notes

- `.env` holds `CLIENT_ID` / `CLIENT_SECRET` (the `BLIZZARD_` prefixed names work too). Never committed, never used by the site.
- The API's item lists have no quality; the per-item detail has `color` (orange/green). Gems are type `UpgradeableJewel`.
  Ids don't reveal quality (follower legendaries `x1_FollowerItem_*`, Necromancer sets `P6_Necro_Set_*`), so every item's detail is fetched.
- The API returns a persistent 500 for ~23 items (mostly Season Ethereals); they're skipped and listed in the script output.
- The API lists old copies of items (`_x1` next to `_p2`, `_PTR`); `keepNewestPerName` keeps one per name.
- The list in localStorage stores `{ id, name, addedAt }`. `reconcile` re-maps by name when ids change after a data refresh.
- Blizzard's icon CDN is http-only, so icons are downloaded into `icons/` and committed.

## UI

Single centred column; the list is the hero. Search is a command palette (`<dialog>`) opened by the top-bar pill,
`/`, Ctrl/Cmd+K, typing any letter, or the floating + button on touch screens; full screen on phones.
Tiles animate with View Transitions (skipped while the palette is open and with reduced motion). Dark only, by design.

## Code standard: Clean Code (non-negotiable)

The code should be something to be proud of. Uncle Bob's rules, applied:

- **Names reveal intent.** No abbreviations, no `data`/`tmp`/`x`. A reader shouldn't need a comment to know what something is.
- **Small functions that do one thing**, at one level of abstraction. Enforced: ≤ 20 lines, ≤ 3 parameters, nesting ≤ 2, complexity ≤ 6.
- **Small files with one responsibility** (≤ 150 lines). Split by reason to change: logic, side effects and DOM never mix.
- **Pure where possible.** Logic takes input and returns new values; no mutation of arguments. Side effects live at the edges.
- **Comments explain why, never what.** Few of them. No commented-out code, no dead code, no TODO left behind.
- **No duplication.** Extract it the second time it appears.
- **Tests for every piece of logic**, readable as a specification (`it('keeps the newest patch of an item')`).
- **Boy Scout rule.** Leave every file you touch a bit cleaner than you found it.
- No dependencies in the site itself; plain ES modules. Dev tooling only (ESLint).

## Before every push

Automatic (`.githooks/pre-push`, enabled by `npm install` via `core.hooksPath`): **`npm run check` must pass.**
ESLint enforces the limits above, `node --test` runs the specs, the secret scan blocks `.env` leaks.

Then review the diff (`git diff origin/main`) against this checklist and fix before pushing:

1. Every name says what it is or does.
2. Every function does one thing; nothing would read better split up or inlined.
3. No duplication, dead code, debug logging or commented-out code.
4. New logic has tests; changed behaviour has updated tests.
5. Comments only where the *why* isn't obvious.
6. The page works in a browser: search, add/remove, filter, reload, export → import. No console errors. Check phone width too.
7. No secret, token or `.env` content in the diff.
