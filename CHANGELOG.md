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
