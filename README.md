# Capstone Group 3

## Usage
```
$ npm install
$ npm start OR
$ npm run start:dev FOR DEV
```

FOR DEV:

Now you can browse to http://127.0.0.1:8080 and see it running.

If you decided to play around and make changes, you can trigger a rebuild anytime using
```
$ npm run webpack
```
You may have to do a hard refresh in the browser (Ctrl+F5), Chrome sometimes caches the old page and compiled index.ts.

## Project structure
* `index.ts` - the application's entry point, contains all sources
* `webpack.config.js` - Webpack configuration
* `tsconfig.json` - TypeScript compiler configuration
* `Resources/` - Resources folder for project data
  * `SampleMusic.xml` - the MusicXML file to be displayed

### Build artifacts
* `dist/` - directory containing all build artifacts, will be served from a local http server on `npm start`
