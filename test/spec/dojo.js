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
    "combyne": "../node_modules/combyne/dist/combyne.legacy",
    "nested": "fixtures/nested"
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
  require(["./fixtures/nested/module.js"], function(exports) {
    t.equal(exports.template.render().trim(), "It works!");

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
