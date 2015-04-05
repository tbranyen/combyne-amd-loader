/* Combyne AMD Loader v0.1.1
 * Copyright 2013, Tim Branyen (@tbranyen).
 * loader.js may be freely distributed under the MIT license.
 */
(function(global) {
"use strict";

var extendsCache = {};

/**
 * Recursively traverses nodes returning those passing the truth function.
 *
 * @private
 * @param {Array} nodes
 * @param {Function} test
 * @returns {Array} An array of nodes.
 */
function recurse(nodes, test) {
  var memo = [];

  if (!nodes) {
    return memo;
  }

  nodes.forEach(function(node) {
    if (!node) {
      return;
    }

    if (test(node)) {
      memo.push(node);
    }

    if (node.conditions) {
      memo.push.apply(memo, recurse(node.conditions.map(function(node) {
        return node.value;
      }), test, memo));
    }

    memo.push.apply(memo, recurse(node.nodes, test, memo));
  });

  return memo;
}

// Cache used to map configuration options between load and write.
var buildMap = {};

// Alias the correct `nodeRequire` method.
var nodeRequire = typeof requirejs === "function" && requirejs.nodeRequire;

// Define the plugin using the CommonJS syntax.
define(function(require, exports) {
  var combyne = require("combyne");

  exports.version = "0.1.1";

  // Invoked by the AMD builder, passed the path to resolve, the require
  // function, done callback, and the configuration options.
  exports.load = function(name, req, load, config) {
    var isDojo;

    var nName = name;

    // Dojo provides access to the config object through the req function.
    if (!config) {
      config = require.rawConfig;
      isDojo = true;
    }

    var contents = "";
    var settings = configure(config);

    // Mimic how the actual Combyne stores.
    settings._filters = {};
    settings._partials = {};

    // Only use root if baseUrl and root differ: toUrl() will choke on
    // virtual path config
    var root = settings.root.replace(/(\/$)/,'') !==
               config.baseUrl.replace(/(\/$)/,'') ? settings.root:'';

    var prefix = isDojo ? "/" : root;
    var url = require.toUrl(name + settings.ext);

    // Builds with r.js require Node.js to be installed.
    if (config.isBuild) {
      // If in Node, get access to the filesystem.
      var fs = nodeRequire("fs");

      try {
        // First try reading the filepath as-is.
        contents = String(fs.readFileSync(url));
      } catch(ex) {
        // If it failed, it's most likely because of a leading `/` and not an
        // absolute path.  Remove the leading slash and try again.
        if (url[0] === "/") {
          url = url.slice(1);
        }

        // Try reading again with the leading `/`.
        contents = String(fs.readFileSync(url));
      }

      // Read in the file synchronously, as RequireJS expects, and return the
      // contents.  Process as a Lo-Dash template.
      buildMap[name] = combyne(contents);

      return load();
    }

    // Create a basic XHR.
    var xhr = new XMLHttpRequest();

    // Wait for it to load.
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var template = combyne(xhr.responseText);

        // Find all extend.
        var extend = recurse(template.tree.nodes, function(node) {
          return node.type === "ExtendExpression";
        }).map(function(node) { return node.value; });

        // Find all partials.
        var partials = recurse(template.tree.nodes, function(node) {
          return node.type === "PartialExpression" && !extendsCache[node.value];
        }).map(function(node) { return node.value; });

        // Find all filters.
        var filters = recurse(template.tree.nodes, function(node) {
          return node.filters && node.filters.length;
        }).map(function(node) {
          return node.filters.map(function(filter) {
            return filter.value;
          }).join(" ");
        });

        // Flatten the array.
        if (filters.length) {
          filters = filters.join(" ").split(" ");
        }

        // Map all filters to functions.
        filters = filters.map(function(filterName) {
          // Filters cannot be so easily inferred location-wise, so assume they are
          // preconfigured or exist in a filters directory.
          var filtersDir = settings.filtersDir || "filters";
          var filtersPath = require.relative(name, filtersDir + '/' + filterName);

          return require.load(filtersPath).then(function(filter) {
            // Register the exported function.
            template.registerFilter(filterName, filter);
            return filter;
          });
        });

        // Process as a Lo-Dash template and cache.
        buildMap[name] = template;

        // Wait for all filters, then partials, and finally extends to load and
        // then pass back control.
        Promise.all(filters).then(function(filters) {
          // Map all partials to functions.
          partials = partials.map(function(name) {
            return new Promise(function(resolve, reject) {
              // The last argument of this call is the noparse option that
              // specifies the virtual partial should not be loaded.
              require.load(name + '.html').then(function(render) {
                template.registerPartial(name, render);
                resolve(render);
              });
            });
          });

          return Promise.all(partials);
        }).then(function() {
          // Map all extend to functions.
          var list = extend.map(function(render) {
            return new Promise(function(resolve, reject) {
              var name = render.template;

              // Pre-cache this template.
              extendsCache[render.partial] = true;

              // The last argument of this call is the noparse option that
              // specifies the virtual partial should not be loaded.
              require([name + '.html'], function(render) {
                render.registerPartial(render.partial, template);
                template.registerPartial(name, render);
                resolve(render);
              });
            });
          });

          return Promise.all(list);
        }).then(function() {
          // Return the compiled template.
          load(template);
        });
      }
    };

    // Initiate the fetch.
    xhr.open("GET", url, true);
    xhr.send(null);
  };

  // Also invoked by the AMD builder, this writes out a compatible define
  // call that will work with loaders such as almond.js that cannot read
  // the configuration data.
  exports.write = function(pluginName, moduleName, write) {
    var template = buildMap[moduleName].source;

    // Write out the actual definition
    write(strDefine(pluginName, moduleName, template));
  };

  // This is for curl.js/cram.js build-time support.
  exports.compile = function(pluginName, moduleName, req, io, config) {
    configure(config);

    // Ask cram to fetch the template file (resId) and pass it to `write`.
    io.read(moduleName, write, io.error);

    function write(template) {
      // Write-out define(id,function(){return{/* template */}});
      io.write(strDefine(pluginName, moduleName, template));
    }
  };

  // Crafts the written definition form of the module during a build.
  function strDefine(pluginName, moduleName, template) {
    return [
      "define('", pluginName, "!", moduleName, "', ", template, ");\n"
    ].join("");
  }

  function configure(config) {
    // Default settings point to the project root and using html files.
    var settings = config.combyneLoader || {};

    settings.__proto__ = {
      ext: ".html",
      root: "/" + config.baseUrl,
      templateSettings: {}
    };

    // Ensure the root has been properly configured with a trailing slash,
    // unless it's an empty string or undefined, in which case work off the
    // baseUrl.
    if (settings.root && settings.root[settings.root.length-1] !== "/") {
      settings.root += "/";
    }

    // Mix in the passed options into the Combyne template settings.
    for (var key in settings.templateSettings) {
      if (!settings.templateSettings.hasOwnProperty(key)) {
        continue;
      }

      combyne.settings[key] = settings.templateSettings[key];
    }

    return settings;
  }
});

})(typeof global === "object" ? global : this);
