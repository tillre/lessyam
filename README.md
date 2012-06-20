lessyam
========
yet another less css middleware for connect or union

usage
=====

   var lessyam = require('lessyam')

express(connect):

    app.use(lessyam(lessDir))

flatiron:

    app.use(flatiron.plugins.http, {
      before: [
        lessyam(lessDir)
      ]
    }

lessyam(path, options)
path - path to the folder containing the less files
options - see source file for options
    

license
=======
MIT License

install with npm
================
    npm install lessyam

run tests
=========
    npm test