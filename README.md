# Esti'mate

![icon](assets/icon@2x.png)

Esti'mate is a cross browser extension (tested on recent Firefox and Chrome) based on the [**WebExtensions API**](https://developer.mozilla.org/en-US/Add-ons/WebExtensions). It provides cool new features for making estimates on [Harvest](https://getharvest.com/) :
- Project management calculation
- Description templates
- Todo/Reminder list
- Summary table

### Download on :
# [🔥🦊 Firefox](https://addons.mozilla.org/fr/firefox/addon/esti-mate/) | [🍭 Chrome](https://chrome.google.com/webstore/detail/estimate/ahhoegjbkdhoembpkmnnghkmfinkkaog)

## Airtable settings

Check the [full documentation](https://github.com/antistatique/esti-mate/blob/master/doc/airtable.md) to see how to setup **Airtable's template feature**.

## Contribution

You must install the NPM module for a fully working linter environment and the `web-ext` CLI by doing :

```bash
$ yarn
// or
$ npm install
```

Then, you can either manually upload and reload your code according to your browser or start the following command :

```bash
$ yarn start
```

## Release

First thing first, update the version (in `package.json` and `manifest.json`) and execute :

```bash
$ yarn build
```

Then, connect to the [Firefox](https://addons.mozilla.org/en-US/developers/addon/esti-mate) or [Chrome](https://chrome.google.com/webstore/developer/dashboard) developer console and upload the new version (`./esti_mate-X.X.zip`).

## For reviewers
This extension embed two js library:

 * `lib/browser-polyfill.js`
   * version: `0.8.0`
   * source (npm): https://unpkg.com/browse/webextension-polyfill@0.8.0/dist/browser-polyfill.js
   * Github: https://github.com/mozilla/webextension-polyfill/tree/0.8.0

 * `lib/rxjs-6.6.7.umd.min.js`
   * version: `6.6.7`
   * Github: https://github.com/ReactiveX/RxJS/tree/6.6.7 (no committed build, see below)
   * MD5 (lib/rxjs-6.6.7.umd.min.js) = `79364c51ff304af33a1dae2cc3144fbc`
   * instruction: `git clone git@github.com:ReactiveX/rxjs.git && cd rxjs && git checkout 6.6.7 && npm install && md5 dist/global/rxjs.umd.min.js`
