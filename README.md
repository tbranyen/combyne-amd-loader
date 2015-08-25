Combyne AMD Template Loader
---------------------------

[![Build Status](https://travis-ci.org/tbranyen/combyne-amd-loader.png?branch=master)](https://travis-ci.org/tbranyen/combyne-amd-loader)

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen)

RequireJS, Dojo, and Curl are excellent module loaders, but through the
flexibility of plugin architecture they should really be seen as resource
loaders.

We've come to expect our development environments to be raw and our builds to
be as optimized as possible.  This plugin will fetch your Combyne templates
during development and inline them in a production build.

Almost every single article and tutorial on using client side templates with
AMD, will advocate the use of the RequireJS text! plugin.  While this is a fine
tool for loading text, it is not optimized for templates.  It requires the
duplicative act of compiling the templates before use in production.

### Installing. ###

This plugin has been registered with NPM & Bower, install with:

``` bash
bower install combyne-amd-loader
```

or


``` bash
npm install combyne-amd-loader
```

Alternatively you can download the `loader.js` file and place anywhere in your
project.

### Loading the plugin. ###

``` javascript
require.config({
  packages: [{
    // You can change the plugin name to be whatever you want, maybe tpl?
    name: "tmpl",
    main: "loader",
    location: "path/to/combyne-amd-loader"
  }]
});
```

You must not end the path in `.js` unless you are providing a url.

Examples:

* `vendor/libraries/loader`
* `http://cdn.mysite.com/vendor/libraries/loader.js`

### Using. ###

Inside an AMD module you can now load templates like so:

``` javascript
// Omit the extension and root path.
define(["tmpl!path/to/template"], function(template) {
  var contents = template({
    // Some data.
  });
});
```

The path to your templates directory can be configured as well as the default
extension to search for.  More details below.

### Configuring templateSettings. ###

There are a few default settings in place to make consumption easier.

The extension appended by default is `.html`.  The default root path is your
configuration's `baseUrl`.  No `templateSettings` are configured by default.

To change these options, add the following to your configuration:

``` javascript
require.config({
  // The Combyne loader configuration.
  combyneLoader: {
    // This is the default extension, you can change to whatever you like.
    // Setting this to "" will disable automatic extensions.
    ext: ".html",

    // The path to where your templates live relative to the `baseUrl`.
    root: "/",

    // Globally configured template settings to be applied to any templates
    // loaded.  This correlates directly to `Combyne.settings`.
    templateSettings: {}
  }
});
```

### Working with filters. ###

It's recommended to separate your filters into separate files and require them
where needed.  A good organization structure is the following:

``` javascript
define(function(require, exports, module) {
  "use strict";

  var myTemplate = require("tmpl!./template");
  var uppercaseFilter = require("../filters/uppercase");

  // Register the filter to the template.
  myTemplate.registerFilter("uppercase", uppercaseFilter);
});
```

If you wanted to keep all filters together in a single file and export them
that'd be a good way to structure as well.

### Working with partials. ###

Partials are interesting as well to work with, as they are not bundled with
the template.

``` javascript
define(function(require, exports, module) {
  "use strict";

  var layout = require("tmpl!./layout");
  var child = require("tmpl!./partial");

  // Render the Combyne template as a partial for {%partial inner%}.
  layout.registerPartial("inner", child);
});
```

This allows means you can very easily mix template engines.

``` javascript
define(function(require, exports, module) {
  "use strict";

  var layout = require("tmpl!./layout");
  var handlebars = require("hbs!./partial");

  // Render the Handlebars template wherever {%partial hbs%} is inside the
  // layout.
  layout.registerPartial("hbs", {
    render: handlebars
  });
});
```

### Using with Dojo. ###

Ensure Dojo's loader is in `async` mode:

``` html
<script data-dojo-config="async:1" src="dojo/dojo.js"></script>
```

Set up your configuration:

``` javascript
require({
  packages: [{
    // You can change the plugin name to be whatever you want, maybe tpl?
    name: "tmpl",
    main: "loader",
    location: "path/to/combyne-amd-loader"
  }]
});
```

And Require in your template:

``` javascript
require(["tmpl!path/to/template"], function(template) {
  var contents = template({
    // Some data.
  });
});
```

### Using with Curl. ###

Set up your configuration:

``` javascript
curl.config({
  packages: [{
    // You can change the plugin name to be whatever you want, maybe tpl?
    name: "tmpl",
    main: "loader",
    location: "path/to/combyne-amd-loader"
  }]
});
```

And Curl in your template:

``` javascript
curl(["tmpl!path/to/template"], function(template) {
  var contents = template({
    // Some data.
  });
});
```

### Running tests. ###

You will need Node.js and Grunt installed to run tests.

Clone this project, open the directory in a terminal, and execute the following
commands:

``` bash
# Install dependencies.
npm install

# Run the tests.
grunt
```

You can also run an http-server in the root and hit the tests directly.  Since
XHR is used, tests must be run from a server.

### Release notes. ###

#### 0.1.1: ####

* Fixed NPM dependencies, removed bower requirement

#### 0.1.0: ####

* Open sourced on GitHub.
* Borrowed heavily from lodash-template-loader.
