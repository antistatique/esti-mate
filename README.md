# Esti'mate ![icon](assets/icon@2x.png)

Esti'mate is a browser extension (tested on recent Firefox and Chrome) based on the [**WebExtensions API**](https://developer.mozilla.org/en-US/Add-ons/WebExtensions). It provides cool new features for making estimates on [Harvest](https://getharvest.com/):

- Project management calculation
- Description templates
- Todo/Reminder list
- Summary table

## Download

- [🔥🦊 Firefox](https://addons.mozilla.org/fr/firefox/addon/esti-mate/)
- [🍭 Chrome](https://chrome.google.com/webstore/detail/estimate/ahhoegjbkdhoembpkmnnghkmfinkkaog)

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

### Automated Release Process

**Quick Store Package (current version):**
```bash
npm run package:store     # Creates esti-mate.zip ready for Chrome Web Store
```

**Complete Release (version bump + packages):**
```bash
npm run prepare-release   # Bumps patch version, builds, and creates release packages
```

This creates:
- `releases/esti-mate-v2.0.X.zip` - Chrome Web Store ready
- `releases/esti-mate-source-v2.0.X.zip` - Firefox add-on review package

### Manual Version Management

```bash
npm run version:patch     # 2.0.0 → 2.0.1 (automatically syncs manifest.json)
npm run version:minor     # 2.0.0 → 2.1.0 (automatically syncs manifest.json)
npm run version:major     # 2.0.0 → 3.0.0 (automatically syncs manifest.json)
```

### Individual Browser Packages

```bash
npm run package:chrome    # Chrome-specific package
npm run package:firefox   # Firefox-specific package
```

### Store Submission Process

1. Run `npm run prepare-release` to create versioned packages
2. **Chrome Web Store**: Upload `releases/esti-mate-v2.0.X.zip`
3. **Firefox Add-ons**: Upload both the extension zip and source code zip
4. Create GitHub release with version tag
5. Update store descriptions if needed

**Note**: Version numbers are automatically synchronized between `package.json` and `manifest.json`.

## License

This project is licensed under the MIT License.
