# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Source code
  - `content/`: UI injection and features (`index.js`, components/)
  - `background/`: background script entry (`index.js`)
  - `options/`: options page (`index.html`, `options.js`, `options.css`)
  - `lib/`: utilities (e.g., `airtable.js`)
- `assets/`: icons and static files copied to `dist/`
- `dist/`: build output consumed by the browsers
- `manifest.json`: WebExtension manifest
- `rollup.config.mjs`: build pipeline

## Build, Test, and Development Commands
- `npm run build`: bundle scripts and copy assets into `dist/`.
- `npm run watch`: build in watch mode for faster local iteration.
- `npm run start`: run the extension in Firefox via `web-ext` using `dist/`.
- `npm run lint`: lint the built bundle with `web-ext`.
- `npm run lint:fix`: run ESLint autofix on `src/`.
- Versioning/Release: `npm run version:(patch|minor|major)` syncs `manifest.json`; `npm run prepare-release` builds and creates versioned zip packages; `npm run package` creates `esti-mate.zip` from `dist/`; `npm run source-code` zips source for Firefox review.

## Coding Style & Naming Conventions
- JavaScript (ES modules), browser globals; 2‑space indent, semicolons, single quotes.
- Classes: `PascalCase`; variables/functions: `camelCase`.
- Lint with ESLint flat config (`eslint.config.js`); prefer small, focused modules under `src/`.

## Testing Guidelines
- No automated tests yet. Perform manual testing after each change:
  - Firefox: `npm run build`, then `npm run start` (or load `dist/` via `about:debugging`).
  - Chrome: `npm run build`, then load unpacked `dist/` in `chrome://extensions`.
- Run `npm run lint` and exercise features on Harvest estimate pages (edit/view/new).

## Commit & Pull Request Guidelines
- Commits: imperative mood, short and descriptive (e.g., "Fix Chrome content script race"). Group related changes.
- PRs: include summary, rationale, test steps (Chrome/Firefox), and screenshots/GIFs when UI changes. Link issues and mention risk areas.
- Ensure `npm run build` and `npm run lint` pass; update docs when behavior changes.

## Security & Configuration Tips
- Do not hardcode secrets or API keys; use the Options page for Airtable settings. Never commit `dist/` artifacts or local environment files.
- Version numbers are auto‑synced (`scripts/sync-manifest-version.cjs`); bump via `npm run version:*`.

## Agent-Specific Notes
- See `CLAUDE.md` for architecture, target pages, and release workflow; use only scripts present in `package.json` (e.g., no `build:ext`).
- Spell check feature plan: `todos/check-speller.md`. Backend proxy under `server/`; UI components under `src/content/components/` (e.g., `SpellChecker`, `CorrectionPanel`).
- Keep content scripts re‑initializable and guard event listeners to prevent duplicates (pattern used in `Summary.js`).

### Spell Check Feature (Implemented)
- Trigger: "IA Tools → Spell check" dispatches `estiMate:spell-check` handled by `SpellChecker`.
- UI: Floating `CorrectionPanel` anchors near the row textarea; hidden by default; Next/Prev navigation; Accept/Reject. Panel hides when all issues resolved. Shows a toast if first pass finds no issues.
- Diff: Computed client‑side against the live textarea (no server markup). Word‑level LCS highlighting: `<b>` additions/changes (bold + light magenta), `<del>` deletions (strike + light red). Accept applies clean corrected text.
- Options: Only `serverUrl`; language auto‑detected by AI; no language setting.
- CSS: All styles in `src/content/content.css`, injected via `manifest.json`. Floating container id: `#esti-spell-floating-panel` (absolute positioning).
- Server: `server/` Express proxy `POST /check-spelling` with OpenAI support and FR/EN local fallback. CORS allows `https://*.harvestapp.com`, `moz-extension://*`, `chrome-extension://*`. Use `.env` with `PORT`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`.
- Dev workflow: `npm run dev` runs Rollup watch + `web-ext run` (Firefox) with live reload. Server has its own `npm run dev`.
