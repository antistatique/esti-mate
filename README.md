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

We use ES modules directly without a bundler. To prepare the extension for use:

1. Ensure all files are in their correct locations as per the project structure.
2. If you've made changes to the manifest or other JSON files, validate them to ensure they're correct.

### Running the Extension

#### In Firefox

1. Install web-ext:
   ```
   npm install -g web-ext
   ```

2. Run the extension:
   ```
   web-ext run
   ```

This will open a new Firefox instance with the extension installed.

#### In Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the root directory of your project

### Testing

Currently, the project doesn't have automated tests. Manual testing should be performed:

1. Test each feature of the extension thoroughly
2. Test on both Firefox and Chrome to ensure cross-browser compatibility
3. Test with different Harvest estimates to cover various scenarios

### Linting

To maintain code quality, we use ESLint. Run the linter with:

```
npm run lint
```

or if you're using yarn:

```
yarn lint
```

Fix auto-fixable issues with:

```
npm run lint -- --fix
```

or

```
yarn lint --fix
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Airtable Settings

Check the [full documentation](https://github.com/antistatique/esti-mate/blob/master/doc/airtable.md) to see how to setup the **Airtable's template feature**.

## Release Process

1. Update the version in both `package.json` and `manifest.json`
2. Create a new Git tag with the version number
3. Push the tag to GitHub
4. Create a new release on GitHub, describing the changes
5. Submit the new version to Firefox and Chrome web stores

## License

This project is licensed under the MIT License.
