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
