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

- Node.js (LTS version recommended)
- npm (comes with Node.js) or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/antistatique/esti-mate.git
   cd esti-mate
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or if you're using yarn:
   ```
   yarn
   ```

### Building the Extension

Build the extension using Rollup:

```bash
npm run build
```

This compiles all source files and copies assets to the `dist/` directory, ready for browser loading.

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

Upload both files to a new GitHub Release:
```bash
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
