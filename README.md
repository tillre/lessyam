# lessyam
yet another less css middleware for connect or union

## usage
lessyam(path, options), see source for options

    var lessyam = require('lessyam')

**express(connect):**

    app.use(lessyam(lessDir))

**flatiron:**

    app.use(flatiron.plugins.http, {
      before: [
        lessyam(lessDir)
      ]
    }


## License
MIT License

## Install with npm
    npm install lessyam

## Run tests
    npm test