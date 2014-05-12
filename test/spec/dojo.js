/* 
 * Test Module: Dojo
 * Ensures that the loader loads and functions in Dojo.
 *
 */
QUnit.module("dojo");

require({
  baseUrl: "/test",

  paths: {
    "combyne": "../bower_components/combyne/dist/combyne",
    "tmpl": "../loader",
    "nested": "fixtures/nested"
  }
});

asyncTest("AMD support", 1, function() {
  require(["tmpl!fixtures/template"], function(template) {
    ok(template.render(), "It works!");

    start();
  });
});

asyncTest("change extension", function() {
  require({
    combyneLoader: {
      ext: ".ext"
    }
  }, ["tmpl!fixtures/different"], function(template) {
    ok(template.render(), "It works!");

    start();
  });
});

asyncTest("templateSettings", function() {
  require({
    combyneLoader: {
      templateSettings: {
        delimiters: {
          START_PROP: "[[",
          END_PROP: "]]"
        }
      }
    }
  }, ["tmpl!fixtures/interpolate"], function(template) {
    ok(template.render({ msg: "It works!" }), "It works!");

    start();
  });
});

asyncTest("relative paths", 1, function() {
  require(["./fixtures/nested/module.js"], function(exports) {
    ok(exports.template.render(), "It works!");

    start();
  });
});

asyncTest("virtual paths defined via paths config", 1, function() {
  require({
    paths: {
      "nested": "fixtures/nested"
    }
  }, ["tmpl!nested/template"], function(template) {
    ok(template.render(), "It works!");

    start();
  });
});
