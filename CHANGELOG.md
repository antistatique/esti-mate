*Unreleased*
 - 🌐 New "Translate to English" entry in the IA Tools menu — translates line-item descriptions via the server proxy with per-row review (Accept/Reject). Translation is shown as clean readable text in the floating panel; preserves *bold*, _italic_ and em-dash bullets; also fixes spelling/grammar during translation
 - ⚡ IA Tools (Spell check + Translate) now stream results progressively: the review panel opens as soon as the first row is ready and fills in as remaining batches return — no more waiting for the slowest request. The header counter shows animated dots while batches are still pending, and the Next button enters a loading state at the frontier instead of misleadingly wrapping to row #1
 - ✏️ Inline "Edit" button on project edit task table to rename tasks without leaving the page
 - 🗂️ New "Hide archived" checkbox on project budget pages to filter out archived tasks and mask totals
 - 🏷️ Non-billable badge now coexists with Harvest's Archived badge on the same row

*4.0.1* (2026-02-09)
 - 📊 Capacity meter segments now show a tooltip on hover with category name and percentage
 - 🐛 Fix PM hours calculation that summed unit prices alongside quantities, and incorrectly included the PM row itself in the total
 - 🔒 Upgrade Express to v5 to fix qs DoS vulnerability (Dependabot #74)

*4.0.0* (2026-01-21)
 - 🧮 Estimate totals footer now sticks to the viewport, showing only the grand total while scrolled so you never lose sight of the final amount.
 - 📊 Selection summary now shows what percentage of the total budget the checked items represent.

*3.0.3* (2025-11-09)
 - 📦 Release pipeline cleanup: removed the dummy Rollup bundle and legacy `lib/` polyfills so dist/source zips match what Firefox reviews expect.
 - 🛡️ Manifest now declares `"data_collection_permissions": { "required": ["none"] }` to satisfy Firefox’s new consent requirement (extension still collects no data).

*3.0.2* (2025-11-09)
 - 🔧 Simplified ESLint toolchain to the native @eslint/js config so `npm install` no longer fails on peer dependency issues.
 - 📦 Reworked `npm run source-code` to use `git archive`, producing a clean, reviewer-friendly source zip even with a dirty working tree (excludes AGENTS.md and other internal folders).

*3.0.1* (2025-09-18)
 - ✨ Click-to-copy on quantities and amounts with subtle flash

*3.0.0* (2025-09-18)
 - ✨ AI Spell Check (production ready)
   - New "✨ IA Tools → Spell check" in edit/new views only
   - Floating review panel with per-row Accept/Reject, Next/Prev, close (✕)
   - Client-side word-level diff: bold additions, strike deletions; preserves newlines
   - Keyboard shortcuts: J/K (next/prev), A/Enter (accept), R/Backspace (reject), F (focus), Esc (close)
   - Auto-scroll to the row and smart panel positioning near the textarea
   - Hidden by default; toast when no issues; panel hides when all resolved
   - Progress feedback in the button label: "Checking X/N…"
 - 🖥️ Server proxy (./server)
   - POST /check-spelling with OpenAI support and FR/EN local fallback
   - Strict JSON output (no original echo) and runtime logging (mode, time, tokens)
   - CORS with preflight cache (Access-Control-Max-Age), domain wildcards
   - Simple auth via X-API-Key header (reuses Airtable key); enable by setting ESTI_SECRET in server/.env
   - Prompt preserves lightweight formatting (*text*, _text_) and em-dash bullets (—); forbids AI change markers
 - ⚙️ Developer experience
   - npm run dev (Rollup watch + web-ext run) with live reload
   - Build copies content.css on writeBundle; options/settings updates
   - Request batching (2-by-2) with concurrency and timeouts for faster checks
 - 🧰 UI/Options
   - IA Tools button prefixed with ✨; no analytics attrs on extension UI
   - Removed language setting (auto-detected by AI); added serverUrl option
 - 📊 Summary improvements
   - Swiss number formatting (e.g., 26'250.00)
   - Wider table (760px) to reduce wraps

*2.0.2* (2025-09-09)
 - ✨ Add selective sum calculation to summary table with checkboxes
 - ✨ Add clickable Item Type names to toggle selections
 - ✨ Add "Select All" checkbox for bulk operations
 - 🐛 Fix Airtable pagination to load all templates (was missing templates beyond #100)
 - 🐛 Fix view mode bug where selection totals increased abnormally
 - 🐛 Fix Summary table not updating on quantity/price changes
 - 🔧 Improve PMTools with better error handling and rounded calculations
 - 🔧 Fix critical bugs in dynamic row handling and event management
 - 🧹 Remove debug console.log statements for cleaner production build

*2.0.1* (2025-09-09)
 - 🔧 Fix Firefox compatibility and simplify packaging
 - 🔧 Add complete publication automation and update documentation  
 - 🔧 Fix v2 extension issues and update branding
 - 🔧 Complete extension refactoring with modern ESLint and improved components
 - 📦 Major refactoring to modern JavaScript architecture with Manifest V3 compatibility
 - 📦 Migrate to Rollup build system with ES modules
 - 📦 Update from Manifest V2 to Manifest V3 for Chrome and Firefox compatibility

*1.6.1* (2021-06-11)
 - Remove webRequest permissions

*1.6.0* (2021-06-11)
 - Adaptation to the new harvest estimate HTML markup
 - refactor code to not use innerHTML / insertAdjacentHTML and only the DOM API. See #5
 - get rxjs from github source instead of unpkg.com CDN. See #5
 - add instruction for extension reviewer about the external library

*1.5.0* (2021-04-28)
 - update dependencies

*1.3.0* (2019-03-17)
 - Display the summary table on the estimate view page.
 - Support the new Harvest Estimate Design Form.

*1.2.1* (2018-08-28)
  - Remove any minified files to facilite Firefox reviews.

*1.2.0* (2018-08-28)
  - ✨ Changed the default value of the Project Management rate to 25%
  - ✨ Added an option to hide the PM rate field

*1.1.1* (2018-07-02)
  - 🔨 refactor PM tools and total setup approach (d306ac6)
*3.0.0-beta* (2025-09-10)
 - ✨ AI Spell Check (beta)
   - New “✨ IA Tools → Spell check” in edit/new views only
   - Floating review panel with per-row Accept/Reject, Next/Prev, close (✕)
   - Client-side word-level diff: bold additions, strike deletions; preserves newlines
   - Keyboard shortcuts: J/K (next/prev), A/Enter (accept), R/Backspace (reject), F (focus), Esc (close)
   - Auto-scroll to the row and smart panel positioning near the textarea
   - Hidden by default; toast when no issues; panel hides when all resolved
   - Progress feedback in the button label: “Checking X/N…”
 - 🖥️ Server proxy (./server)
   - POST /check-spelling with OpenAI support and FR/EN local fallback
   - Strict JSON output (no original echo) and runtime logging (mode, time, tokens)
   - CORS with preflight cache (Access-Control-Max-Age), domain wildcards
   - Simple auth via X-API-Key header (reuses Airtable key); enable by setting ESTI_SECRET in server/.env
   - Prompt preserves lightweight formatting (*text*, _text_) and em-dash bullets (—); forbids AI change markers
 - ⚙️ Developer experience
   - npm run dev (Rollup watch + web-ext run) with live reload
   - Build copies content.css on writeBundle; options/settings updates
   - Request batching (2-by-2) with concurrency and timeouts for faster checks
 - 🧰 UI/Options
   - IA Tools button prefixed with ✨; no analytics attrs on extension UI
   - Removed language setting (auto-detected by AI); added serverUrl option
 - 📊 Summary improvements
   - Swiss number formatting (e.g., 26’250.00)
   - Wider table (760px) to reduce wraps
   - Click-to-copy on quantities and amounts with subtle flash
