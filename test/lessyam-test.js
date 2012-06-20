var vows = require('vows'),
    assert = require('assert'),
    lessyam = require('../index.js'),
    path = require('path'),
    fs = require('fs'),
    srcDir = path.join(__dirname, 'data'),
    cssFile = path.join(srcDir, 'test.css');


vows.describe('less css').addBatch({
  "The lessyam module": {
    topic: lessyam,
    "should be a function": function(topic) {
      assert.isFunction(topic);
    },
    "when called": {
      topic: function() {
        return lessyam(srcDir);
      },
      "should return a function": function(topic) {
        assert.isFunction(topic);
      },
      "should render test.less": {
        topic: function() {
          var self = this,
              next = self.callback,
              req = {
                method: 'GET',
                url: 'test.css'
              },
              res = {
                setHeader: function() {},
                end: function(src) { self.callback(null, src); }
              };
          lessyam(srcDir)(req, res, next);
        },
        "that is": {
          topic: function(src) {
            var self = this;
            fs.readFile(cssFile, function(err, data) {
              self.callback(err, src, data.toString());
            });
          },
          "comparable to test.css": function(err, a, b) {
            assert.isNull(err);
            assert.equal(a, b);
          }
        }
      }
    }
  }
}).export(module);