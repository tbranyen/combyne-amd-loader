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
  }
});

QUnit.test("AMD support", function(t) {
  var done = t.async();
  t.expect(1);

  require(["tmpl!fixtures/template"], function(template) {
    t.equal(template.render().trim(), "It works!");

    done();
  });
});

QUnit.test("change extension", function(t) {
  var done = t.async();
  t.expect(1);

  require({
    combyneLoader: {
      ext: ".ext"
    }
  }, ["tmpl!fixtures/different"], function(template) {
    t.equal(template.render().trim(), "It works!");

    done();
  });
});

QUnit.test("templateSettings", function(t) {
  var done = t.async();
  t.expect(1);

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
    t.equal(template.render({ msg: "It works!" }).trim(), "It works!");

    done();
  });
});

QUnit.test("relative paths", function(t) {
  var done = t.async();
  t.expect(1);

  require(["fixtures/nested/module"], function(exports) {
    t.equal(exports.template.render().trim(), "It works!");

    done();
  });
});

QUnit.test("plugin works with r.js optimizer", function(t) {
  var done = t.async();
  t.expect(1);

  // Load the module containing the build.
  require(["build_tools/_output/r"], function() {
    // Request the template.
    require(["tmpl!fixtures/basic"], function(template) {
      template.registerFilter("upper", function(val) {
        return val.toUpperCase();
      });

      t.equal(template.render().trim(), "HELLO WORLD!");

      done();
    });
  });
});

QUnit.test("plugin works with root set", function(t) {
  var done = t.async();
  t.expect(1);

  require({ root: "/test" }, ["fixtures/nested/module"], function(template) {
    t.equal(template.template.render().trim(), "It works!");

    done();
  });
});

QUnit.test("virtual paths defined via paths config", function(t) {
  var done = t.async();
  t.expect(1);

  require({
    paths: {
      "nested": "fixtures/nested"
    }
  }, ["tmpl!nested/template"], function(template) {
    t.equal(template.render().trim(), "It works!");

    done();
  });
});
