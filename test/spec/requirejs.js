/*
 * Test Module: RequireJS
 * Ensures that the loader loads and functions in RequireJS.
 *
 */
QUnit.module("requirejs");

require.config({
  baseUrl: "/test",

  packages: [{
    name: "tmpl",
    main: "loader",
    location: ".."
  }],

  paths: {
    combyne: "../node_modules/combyne/dist/combyne.legacy",
    "visit-combyne": "../node_modules/visit-combyne/index"
  }
});

asyncTest("AMD support", 1, function() {
  require(["tmpl!fixtures/template"], function(template) {
    equal(template.render().trim(), "It works!");

    start();
  });
});

asyncTest("change extension", 1, function() {
  require({
    combyneLoader: {
      ext: ".ext"
    }
  }, ["tmpl!fixtures/different"], function(template) {
    equal(template.render().trim(), "It works!");

    start();
  });
});

asyncTest("templateSettings", 1, function() {
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
  require(["fixtures/nested/module"], function(exports) {
    equal(exports.template.render().trim(), "It works!");

    start();
  });
});

asyncTest("plugin works with r.js optimizer", 1, function() {
  // Load the module containing the build.
  require(["build_tools/_output/r"], function() {
    // Request the template.
    require(["tmpl!fixtures/basic"], function(template) {
      template.registerFilter("upper", function(val) {
        return val.toUpperCase();
      });

      equal(template.render().trim(), "HELLO WORLD!");

      start();
    });
  });
});

asyncTest("plugin works with root set", 1, function() {
  require({ root: "/test" }, ["fixtures/nested/module"], function(template) {
    equal(template.template.render().trim(), "It works!");

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
