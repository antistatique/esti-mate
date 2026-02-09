# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Esti'mate is a browser extension for Firefox and Chrome that enhances Harvest's estimate functionality. It uses WebExtensions API (Manifest V3) and provides features like project management calculations, description templates, todo/reminder lists, and summary tables.

## Architecture

The extension follows a modular architecture:

### Core Structure
- **Content Script (`src/content/`)**: Injected into Harvest estimate pages to provide UI enhancements
- **Background Script (`src/background/`)**: Handles extension lifecycle and storage
- **Options Page (`src/options/`)**: Extension configuration interface
- **Components (`src/content/components/`)**: Modular UI components for specific features

### Key Components
- **App.js**: Main application controller that orchestrates all components
- **Summary.js**: Generates summary tables of estimate data
- **PMTools.js**: Project management calculation tools with configurable percentage
- **AirtableIntegration.js**: Integrates with Airtable API for template functionality

### Target Pages
The extension activates on:
- `*://*.harvestapp.com/estimates/*/edit` (editing estimates)
- `*://*.harvestapp.com/estimates/*/duplicate` (duplicating estimates)  
- `*://*.harvestapp.com/estimates/new` (creating new estimates)
- `*://*.harvestapp.com/estimates/*` (viewing estimates)
- Local HTML files for development/testing

## Development Commands

### Building
- `npm run build`: Build the extension using Rollup
- `npm run watch`: Build in watch mode for development
- `npm run prepare-release`: Build and package extension (.zip) for distribution

### Development
- `npm run start`: Run extension in Firefox using web-ext
- `web-ext run --source-dir ./dist/`: Alternative Firefox development command

### Quality Assurance
- `npm run lint`: Lint the built extension files (requires build first)
- `npm run lint:fix`: Auto-fix ESLint issues in source files
- ESLint configuration uses modern flat config format (eslint.config.js)

### Testing
No automated tests currently exist. Manual testing should cover:
- All extension features on both Firefox and Chrome
- Different Harvest estimate scenarios
- Cross-browser compatibility

## Build System

Uses Rollup with multiple entry points:
- **content.js**: Content script bundle (IIFE format)
- **background.js**: Background script bundle (IIFE format)  
- **options.js**: Options page bundle (IIFE format)
- Static assets are copied from `src/` and `assets/` to `dist/`

## Storage & Configuration

Extension uses `browser.storage.local` for:
- `airtableWorkspace`: Airtable workspace identifier
- `airtableKey`: Airtable API key
- `pmPercentage`: Project management percentage (default: 25%)
 - `serverUrl`: Local proxy server base URL for spellcheck (e.g., http://localhost:3000)

## Key Files to Understand

- `manifest.json`: Extension manifest defining permissions and entry points
- `rollup.config.mjs`: Build configuration with multiple bundles
- `src/content/index.js`: Content script entry point with DOM ready detection
- `src/content/App.js`: Main application logic and component coordination

## Development Notes

- Extension uses ES modules throughout the codebase
- Content script injection happens after DOM ready
- Components are designed to be reinitialized when Harvest UI changes
- Event listeners are properly managed to avoid memory leaks
- Uses browser polyfill for cross-browser compatibility

## Future Development

- **Spelling Check Feature**: See `./todos/check-speller.md` for detailed implementation plan and the `server/` proxy implementation. Language is auto-detected by the AI; no per-user language setting is required.

## Publication & Release - Self-Distribution Model

The extension is **self-distributed** for internal use, not published to public app stores.

### Distribution Setup

**Download Page**: https://esti-mate.antistatique.io
- Hosted on Vercel (`server/` directory)
- Serves static download page (`server/public/index.html`)
- Fetches latest version from GitHub Releases API
- Provides auto-update manifest for Firefox

**Auto-Update Endpoints**:
- Firefox: `https://esti-mate.antistatique.io/updates.xml`
- Chrome: No auto-update (manual reinstall required)

### Release Process

#### 1. Version Management

```bash
npm run version:patch     # 3.0.4 → 3.0.5 (syncs package.json + manifest.json)
npm run version:minor     # 3.0.4 → 3.1.0
npm run version:major     # 3.0.4 → 4.0.0
```

The `scripts/sync-manifest-version.cjs` script ensures versions stay synchronized.

#### 2. Firefox Signing (Required for Distribution)

**Setup** (one-time):
1. Get API credentials from https://addons.mozilla.org/en-US/developers/addon/api/key/
2. Create `.env.local` with:
   ```bash
   export WEB_EXT_API_KEY=user:12345678:123
   export WEB_EXT_API_SECRET=your-secret-here
   export WEB_EXT_CHANNEL=unlisted
   ```

**Sign Extension**:
```bash
source .env.local
npm run sign:firefox
```

This creates: `releases/esti-mate-vX.X.X.xpi` (signed, ready for distribution)

**Notes**:
- Signing uses `web-ext sign` with `--channel=unlisted`
- Creates unlisted version (not searchable on AMO)
- Signing can take 2-10 minutes depending on AMO server load
- Signed XPI is required for Firefox to install the extension

#### 3. Chrome Package

```bash
npm run build
cd dist && zip -r ../releases/esti-mate-vX.X.X.zip . && cd ..
```

Creates: `releases/esti-mate-vX.X.X.zip` (unsigned, for manual "Load unpacked")

#### 4. GitHub Release

Tag, push, and create the release:
```bash
git tag vX.X.X
git push origin vX.X.X
gh release create vX.X.X \
  releases/esti-mate-vX.X.X.xpi \
  releases/esti-mate-vX.X.X.zip \
  --title "vX.X.X" \
  --notes "Release notes"
```

The download page and `/updates.xml` automatically pick up new releases via the GitHub API.

### Auto-Update Configuration

**Firefox** (manifest.json):
```json
"browser_specific_settings": {
  "gecko": {
    "id": "{34c1674f-f75a-4a65-9282-a3ea1a92dcf6}",
    "update_url": "https://esti-mate.antistatique.io/updates.xml"
  }
}
```

**Update Manifest** (`/updates.xml` endpoint in `server/index.js`):
- Dynamically fetches latest version from GitHub Releases
- Returns XML with XPI download URL
- Firefox checks for updates automatically

**Chrome**:
- No auto-update for self-distributed extensions
- Users must manually download and reinstall from https://esti-mate.antistatique.io

### Important Notes

- Version numbers are automatically synchronized - never edit manually
- Firefox requires signed XPI for distribution (Mozilla signature)
- Chrome has no signature requirement for "Load unpacked"
- `.env.local` contains sensitive API keys and is gitignored
- The download page is static and deployed on Vercel
- Auto-updates only work for Firefox (Chrome requires manual updates)
