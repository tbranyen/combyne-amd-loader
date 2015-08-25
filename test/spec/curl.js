/*
 * Test Module: Curl
 * Ensures that the loader loads and functions in Curl.
 *
 */
 /*global QUnit curl */
QUnit.module("curl");

curl.config({
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
  curl(["tmpl!fixtures/template"]).then(
    function(template) {
      t.equal(template.render().trim(), "It works!");

      done();
    },
    function(ex) {
      t.ok(false, ex.message);
      done();
    }
  );
});

QUnit.test("change extension", function(t) {
  var done = t.async();
  t.expect(1);
  curl({
    combyneLoader: {
      ext: ".ext"
    }
  }, ["tmpl!fixtures/different"]).then(
    function(template) {
      t.equal(template.render().trim(), "It works!");

      done();
    },
    function(ex) {
      t.ok(false, ex.message);
      done();
    }
  );
});

QUnit.test("templateSettings", function(t) {
  var done = t.async();
  t.expect(1);
  curl({
    combyneLoader: {
      templateSettings: {
        delimiters: {
          START_PROP: "[[",
          END_PROP: "]]"
        }
      }
    }
  }, ["tmpl!fixtures/interpolate"]).then(
    function(template) {
      t.equal(template.render({ msg: "It works!" }).trim(), "It works!");

      done();
    },
    function(ex) {
      t.ok(false, ex.message);
      done();
    }
  );
});

QUnit.test("relative paths", function(t) {
  var done = t.async();
  t.expect(1);
  curl(["fixtures/nested/module"], function(exports) {
    t.equal(exports.template.render().trim(), "It works!");

    done();
  });
});

QUnit.test("virtual paths defined via paths config", function(t) {
  var done = t.async();
  t.expect(1);
  curl(["tmpl!nested/template"], function(template) {
    t.equal(template.render().trim(), "It works!");

    done();
  });
});
