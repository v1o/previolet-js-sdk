# Previolet

[Previolet][home] provides the interface, infrastructure and tools you need to build, manage and grow your application. Featuring a realtime database, powerful authentication and cloud functions, teams also use Previolet to organize their work.

This SDK is intended for end-user client access for Web, mobile Web (e.g. React Native, VueJs, Angular), Node.js desktop or IoT devices.

## Get the code

### NPM bundler

The Previolet JavaScript npm package contains code that can be run in the browser after combining the modules you use with a package bundler.

Install the Previolet npm module:

```
$ npm init
$ npm install --save previolet
```

In your code, you can initialize the SDK using:

```js
var PrevioletSDK = require('previolet')
var sdk = new PrevioletSDK({
  instance: 'cXXXXXXXX',
  region: 'eu.west1',         // Application region (optional)
  tokenFallback: 'tk-XXXXXX', // Permanent token (optional)
  appVersion: '1.0.0',        // Your custom app version (optional)
})
```

### Script include

Include Previolet in your web application via a `<script>` tag:

```html
<body>
  <script src="https://cdn.jsdelivr.net/npm/previolet/dist/previolet-sdk.min.js"></script>

  <script>
    // Initialize Previolet
    var sdk = new PrevioletSDK({ ... })
  </script>
</body>
```

[home]: https://previolet.com
