/* 
 * Test Module: Curl
 * Ensures that the loader loads and functions in Curl.
 *
 */
 /*global QUnit asyncTest curl ok start */
QUnit.module("curl");

curl.config({
  baseUrl: "/test",

  paths: {
    "combyne": "../bower_components/combyne/dist/combyne",
    "tmpl": "../loader",
    "nested": "fixtures/nested"
  }
});

asyncTest("AMD support", 1, function() {
  curl(["tmpl!fixtures/template"]).then(
    function(template) {
      equal(template.render().trim(), "It works!");

      start();
    },
    function(ex) {
      ok(false, ex.message);
      start();
    }
  );
});

asyncTest("change extension", function() {
  curl({
    combyneLoader: {
      ext: ".ext"
    }
  }, ["tmpl!fixtures/different"]).then(
    function(template) {
      equal(template.render().trim(), "It works!");

      start();
    },
    function(ex) {
      ok(false, ex.message);
      start();
    }
  );
});

asyncTest("templateSettings", function() {
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
      equal(template.render({ msg: "It works!" }).trim(), "It works!");

      start();
    },
    function(ex) {
      ok(false, ex.message);
      start();
    }
  );
});

asyncTest("relative paths", 1, function() {
  curl(["fixtures/nested/module"], function(exports) {
    equal(exports.template.render().trim(), "It works!");

    start();
  });
});

asyncTest("virtual paths defined via paths config", 1, function() {
  curl(["tmpl!nested/template"], function(template) {
    equal(template.render().trim(), "It works!");

    start();
  });
});
