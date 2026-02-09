# Esti'mate ![icon](assets/icon@2x.png)

Esti'mate is a browser extension (tested on recent Firefox and Chrome) based on the [**WebExtensions API**](https://developer.mozilla.org/en-US/Add-ons/WebExtensions). It provides cool new features for making estimates on [Harvest](https://getharvest.com/):

- Project management calculation
- Description templates
- Todo/Reminder list
- Summary table

## Download

Download the latest version from our [official download page](https://esti-mate.antistatique.io):

- **Firefox**: Self-distributed signed `.xpi` with auto-updates
- **Chrome/Edge/Brave**: Unsigned `.zip` for manual installation

For historical reference:
- [Firefox Add-ons (archived)](https://addons.mozilla.org/fr/firefox/addon/esti-mate/)
- [Chrome Web Store (archived)](https://chrome.google.com/webstore/detail/estimate/ahhoegjbkdhoembpkmnnghkmfinkkaog)

## Developer Guide

### Prerequisites

- Node.js 22 LTS (required for reproducible builds)
- npm 10.x (comes with Node.js 22)

**Note for Mozilla reviewers**: This project uses Node.js 22 LTS. An `.nvmrc` file is included. Run `nvm use` to switch to the correct version.

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/antistatique/esti-mate.git
   cd esti-mate
   ```

2. Install dependencies (use npm to ensure reproducible builds via package-lock.json):
   ```
   npm ci
   ```

### Building the Extension

Build the extension using Rollup:

```bash
npm run build
```

This compiles all source files and copies assets to the `dist/` directory, ready for browser loading.

### Reproducible Build (for Mozilla Reviewers)

To reproduce the exact build:

1. **Environment**: Ubuntu 24.04 LTS (or compatible Linux), Node.js 22 LTS, npm 10.x
2. **Extract** the source code package
3. **Install dependencies** with locked versions:
   ```bash
   npm ci
   ```
4. **Build**:
   ```bash
   npm run build
   ```
5. **Compare**: The `dist/` directory should match the extension package contents

### Development

#### Development Mode
```bash
npm run watch    # Build with file watching for development
npm run start    # Run extension in Firefox (requires web-ext installed globally)
```

#### Manual Testing

**Firefox:**
1. Build the extension: `npm run build`
2. Go to `about:debugging` → This Firefox → Load Temporary Add-on
3. Select any file in the `dist/` folder

**Chrome:**
1. Build the extension: `npm run build`
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder

### Testing

Currently, the project doesn't have automated tests. Manual testing should be performed:

1. Test each feature of the extension thoroughly
2. Test on both Firefox and Chrome to ensure cross-browser compatibility
3. Test with different Harvest estimates to cover various scenarios

### Code Quality

**Linting:**
```bash
npm run lint:fix    # Fix auto-fixable ESLint issues
```

**Building for stores:**
```bash
npm run lint        # Lint the built extension (web-ext lint)
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Airtable Settings

Check the [full documentation](https://github.com/antistatique/esti-mate/blob/master/doc/airtable.md) to see how to setup the **Airtable's template feature**.

## Publication & Release

### Self-Distribution Model

This extension is **self-distributed** for internal use. It's no longer published to public stores.

### Release Process

#### 1. Version Management

Bump the version (automatically syncs `package.json` and `manifest.json`):
```bash
npm run version:patch     # 3.0.4 → 3.0.5
npm run version:minor     # 3.0.4 → 3.1.0
npm run version:major     # 3.0.4 → 4.0.0
```

#### 2. Firefox Signing (Required)

Set up environment variables in `.env.local`:
```bash
export WEB_EXT_API_KEY=user:12345678:123
export WEB_EXT_API_SECRET=your-secret-here
export WEB_EXT_CHANNEL=unlisted
```

Get API credentials from: https://addons.mozilla.org/en-US/developers/addon/api/key/

Sign the extension:
```bash
source .env.local
npm run sign:firefox
```

This creates: `releases/esti-mate-vX.X.X.xpi` (signed by Mozilla, ready for distribution)

**Note**: Signing can take 2-10 minutes depending on AMO server load.

#### 3. Chrome Package

Build the Chrome package:
```bash
npm run build
cd dist && zip -r ../releases/esti-mate-vX.X.X.zip . && cd ..
```

This creates: `releases/esti-mate-vX.X.X.zip` (unsigned, for manual installation)

#### 4. Create GitHub Release

Tag, push, and create the release:
```bash
git tag vX.X.X
git push origin vX.X.X
gh release create vX.X.X \
  releases/esti-mate-vX.X.X.xpi \
  releases/esti-mate-vX.X.X.zip \
  --title "vX.X.X" \
  --notes "Release notes here"
```

#### 5. Auto-Update

**Firefox**: Users automatically get updates via `https://esti-mate.antistatique.io/updates.xml`

**Chrome**: No auto-update. Users must manually download and reinstall from https://esti-mate.antistatique.io

### Distribution

Users download from: **https://esti-mate.antistatique.io**

This page automatically fetches the latest release from GitHub and provides download links.

**Note**: Version numbers are automatically synchronized between `package.json` and `manifest.json`.

## Privacy

See [PRIVACY.md](PRIVACY.md) for our privacy policy.

**TL;DR**:
- No tracking or analytics
- Optional features (Airtable, spellcheck) transmit data only if you configure them
- All data storage is local to your browser

## License

This project is licensed under the MIT License.
