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
- `npm run build:ext`: Build and package extension for distribution

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

## Publication & Release Automation

### Automated Release Workflow

The project includes a complete automated release system:

**One-Command Release:**
```bash
npm run prepare-release    # Complete release workflow
```
This command automatically:
1. Bumps patch version (2.0.0 → 2.0.1)
2. Syncs version between package.json and manifest.json
3. Builds the extension 
4. Creates versioned release packages in `releases/` directory
5. Generates source code package for Firefox review

**Quick Store Packaging:**
```bash
npm run package:store      # Chrome Web Store ready zip
npm run package:chrome     # Chrome-specific package
npm run package:firefox    # Firefox-specific package
```

### Version Management

**Automated Version Syncing:**
- `npm run version:patch` - Bumps patch version + syncs manifest
- `npm run version:minor` - Bumps minor version + syncs manifest  
- `npm run version:major` - Bumps major version + syncs manifest

The `scripts/sync-manifest-version.cjs` script ensures `package.json` and `manifest.json` versions always stay synchronized.

### Store Submission Files

**Generated Release Files:**
```
releases/
├── esti-mate-v2.0.X.zip           # Chrome Web Store upload
├── esti-mate-source-v2.0.X.zip    # Firefox source code (required)
```

### Important Notes

- Always use the automated scripts to avoid version mismatches
- Firefox requires both extension and source code packages
- Chrome Web Store only needs the extension package
- Version numbers are automatically managed - don't edit manually
- Source code package excludes build artifacts and dependencies

### Store Publishing Checklist

1. Run `npm run prepare-release` to create packages
2. Test extension functionality on both browsers
3. Upload `releases/esti-mate-v2.0.X.zip` to Chrome Web Store
4. Upload both packages to Firefox Add-ons (extension + source)
5. Create GitHub release with version tag
6. Update store descriptions if features changed