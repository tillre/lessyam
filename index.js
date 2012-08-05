//
// less css middleware
//
// only recompiles when requested file changed, does not check imports
//

var less = require('less'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    winston = require('winston');

//
// @srcDir folder with less files
// @options {
//   @recompile recompile css on every request
//   @lessOptions options to pass to the less compiler
// }
//
module.exports = function(srcDir, options) {
  if (!srcDir) {
    winston.warn('no source dir for less stylesheets defined');
  }
  options = options || {};
  options.lessOptions = options.lessOptions
                     || { compress: false, yuicompress: false };

  var dstExt = /\.css$/,
      srcExt = '.less',
      cache = {};

  return function compileAndSend(req, res, next) {
    if ('GET' !== req.method) return next();

    // build an absolute path with .css replaced with .less
    var pathname = url.parse(req.url).pathname,
        srcFile = path.join(srcDir, pathname).replace(dstExt, srcExt);

    if (!pathname.match(dstExt)) return next();

    render(srcFile, function(err, c) {
      if (err) return next(err);
      res.setHeader('Date', new Date().toUTCString());
      res.setHeader('Last-Modified', c.mtime.toUTCString());
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Content-Length', c.css.length);
      res.end(c.css);
    });
  };

  function render(file, callback) {
    if (!options.recompile && cache[file]) {
      callback(null, cache[file]);
    }
    fs.stat(file, function(err, stats) {
      if (err) return callback(err);
      renderLess(file, function(err, css) {
        if (err) return callback(err);
        var c = {
          css: css,
          mtime: stats.mtime
        };
        cache[file] = c;
        return callback(null, c);
      });
    });
  }

  function renderLess(file, callback) {
    winston.verbose('rendering css: ' + file);
    fs.readFile(file, 'utf8', function(err, str) {
      if (err) return callback(err);
      var opts = options.lessOptions;
      opts.paths = [ path.dirname(file) ];
      less.render(str, opts, function(err, css) {
        if (err) {
          err.file = file;
          err.toString = function() {
            return 'less error: ' + this.message + '\n' + '   parsing: ' + this.file;
          };
          less.writeError(err);
          return callback(err);
        }
        callback(null, css);
      });
    });
  }
};


//
// overwrite the importer function of less
// @paths will never contain more than 1 element
//
less.Parser.importer = function (file, paths, callback, env) {
  if (!paths || paths.length === 0) return callback(new Error('no paths defined'));
  var pathname = path.join(paths[0], file);
  fs.stat(pathname, function(err, stats) {
    if (err) return callback(err);
    fs.readFile(pathname, 'utf8', function(e, data) {
      if (e) return callback(e);
      new(less.Parser)({
        paths: [path.dirname(pathname)].concat(paths),
        filename: pathname
      }).parse(data, function (e, root) {
        callback(e, root, data);
      });
    });
  });
};
