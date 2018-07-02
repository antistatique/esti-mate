# Esti'mate

![icon](assets/icon@2x.png)

Esti'mate is a cross browser extension (tested on recent Firefox and Chrome) based on the [**WebExtensions API**](https://developer.mozilla.org/en-US/Add-ons/WebExtensions). It provides cool new features for making estimates on [Harvest](https://getharvest.com/) :
- Project management calculation
- Description templates
- Todo/Reminder list
- Summary table

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

First thing first, update the version and execute :

```bash
$ yarn build
```