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
