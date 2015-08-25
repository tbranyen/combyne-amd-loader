/*
 * Test Module: Dojo
 * Ensures that the loader loads and functions in Dojo.
 *
 */
QUnit.module("dojo");

require({
  baseUrl: "/test",

  packages: [{
    name: "tmpl",
    main: "loader",
    location: ".."
  }],

  paths: {
    "combyne": "../node_modules/combyne/dist/combyne",
    "nested": "fixtures/nested"
  }
});

asyncTest("AMD support", 1, function() {
  require(["tmpl!fixtures/template"], function(template) {
    equal(template.render().trim(), "It works!");

    start();
  });
});

asyncTest("change extension", function() {
  require({
    combyneLoader: {
      ext: ".ext"
    }
  }, ["tmpl!fixtures/different"], function(template) {
    equal(template.render().trim(), "It works!");

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
    equal(template.render({ msg: "It works!" }).trim(), "It works!");

    start();
  });
});

asyncTest("relative paths", 1, function() {
  require(["./fixtures/nested/module.js"], function(exports) {
    equal(exports.template.render().trim(), "It works!");

    start();
  });
});

asyncTest("virtual paths defined via paths config", 1, function() {
  require({
    paths: {
      "nested": "fixtures/nested"
    }
  }, ["tmpl!nested/template"], function(template) {
    equal(template.render().trim(), "It works!");

    start();
  });
});
