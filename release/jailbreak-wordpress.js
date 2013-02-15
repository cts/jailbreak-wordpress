/**
* jailbreak-wordpress
 * Breaks themes out of jail.
 *
 * @author Ted Benson and Sarah Scodel
 * @copyright MIT CSAIL Haystack Group 2013
 * @license MIT <http://github.com/webcats/dscrape/blob/master/LICENSE.txt>
 * @link 
 * @module jailbreak-wordpress
 * @version 0.0.1
 */


(function() {

if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}

/**
 * opts: options array
 */
Jailbreak.Theme = function(name, directory, contentMap) {
  this.name = name;
  this.directory = directory;
  this.filename = path.join(directory, name + ".json");
  this.contentMap = contentMap;

  // Stores *all* data that is to be peristed to disk
  // and saved between pipeline stages.
  this.data = {
    // HTML Sources representing the theme
    // Scraped from Wordpress
    sources: {},
 
    // HTML Mockups representing the theme
    mockups: {},

    // URL -> Treesheets Contents Map
    treesheets: {},

    // URL -> Stylesheet Contents Map
    stylesheets: {},

    // URL -> Javascript Map
    javascripts: {},

    // Pipeline name
    pipelineStatus: {}
  };

  this.initialize();
};

Jailbreak.Theme.prototype.initialize = function(args) {
  console.log("[Theme] Initializing: ", this.name);
  this.loadFromFile();
};

Jailbreak.Theme.prototype.loadFromFile = function() {
  if (fs.existsSync(this.filename)) {
    try {
      var json = fs.readFileSync(this.filename, "utf-8");
      this.data = JSON.parse(json);
    } catch (e) {
      console.log("Could not fead file", this.filename);
    }
  } else {
    console.log("No existing themefile for", this.filename);
  } };

Jailbreak.Theme.prototype.saveToFile = function() {
  try {
    var json = JSON.stringify(this.data);
    fs.writeFileSync(this.filename, json, "utf8");
  } catch (e) {
    console.log("Could not write file", this.filename);
  }
};

if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
} 

Jailbreak.ContentPage = function() {

  /* The URL for this page. */
  this.url = null;

  /* The name for this page. Should be unique across the content map */
  this.name = null;
};

/*
 * Methods
 */

Jailbreak.ContentPage.prototype.reset = function() {
  this.name = null;
  this.url = null;
};

Jailbreak.ContentPage.prototype.loadFromJson = function(json, contentMap) {
  this.reset();
  if ((typeof json.path != "undefined") && (contentMap.domain !== null)) {
    this.url = contentMap.domain + json.path;
  }
  if (typeof json.name != "undefined") {
    this.name = json.name;
  }
};


if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
} 

/**
 * Janitor's key to the site.
 * 
 * the whole pipeline starts with:
 *  * theme name
 *  * contentmap (like a sitemap, but includes content references)
 *
 * opts: options array
 */
Jailbreak.ContentMap = function(contentMapFile) {

  /* A list of ContentPage objects */
  this.pages = [];

  /* A name for this map */
  this.name = null;

  /* The base domain + path for this content map.
     All pages are specified relative to this path. */
  this.domain = null;

  this.loadFromFile(contentMapFile);
};

Jailbreak.ContentMap.prototype.reset = function() {
  this.pages = [];
  this.name = null;
  this.domain = null;
};

Jailbreak.ContentMap.prototype.loadFromFile = function(filename) {
  if (fs.existsSync(filename)) {
    try {
      var json = fs.readFileSync(filename, "utf-8");
      this.loadFromJson(JSON.parse(json));
    } catch (e) {
      console.log("Could not read file", filename);
      console.log(e);
    }
  } else {
    console.log("No existing content map file for", filename);
  } 
};

Jailbreak.ContentMap.prototype.loadFromJson = function(json) {
  this.reset();
  
  if (typeof json.name != "undefined") {
    this.name = json.name;
  }

  if (typeof json.domain != "undefined") {
    this.domain = json.domain;
  }

  if (typeof json.pages != "undefined") {
    for (var i = 0; i < json.pages.length; i++) {
      var pageJson = json.pages[i];
      var page = new Jailbreak.ContentPage();
      page.loadFromJson(pageJson, this);
      this.pages[this.pages.length] = page;
    }
  }
};

if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}
if (typeof Jailbreak.Pipeline == "undefined") {
  Jailbreak.Pipeline = {};
}

Jailbreak.Pipeline.log = function(stage, message) {
  console.log("[" + stage.name + "] " + message);
};

/*
 * Walks every URL in the contentmap and scrapes it.
 */
Jailbreak.Pipeline.FetchPages = function(theme, opts) {
  this.name = "Fetch Pages";
};

Jailbreak.Pipeline.FetchPages.prototype.run = function(theme) {
  for (var i = 0; i < theme.contentMap.pages.length; i++) {
    var name = theme.contentMap.pages[i].name;
    var url = theme.contentMap.pages[i].url;
    Jailbreak.Pipeline.log(this, "Scraping " + name + ": " + url);
    // TODO(sscodel): scrape page HTML, put it in theme object.
  }

  // Return a status object
  // TODO(sscodel): possibly return error if the scrape fails
  // error -> false success value and a message explaining error
  return { success: true };
};

/**
 * Takes a theme object and downloads all assets (JS, CSS, IMG, etc),
 * placing them into the respective dictionary cache in the Theme
 * object.
 */

Jailbreak.Pipeline.FetchAssets = function(opts) {
  this.name = "Fetch Assets";

};

Jailbreak.Pipeline.FetchAssets.prototype.run = function(theme) {
  // http-agent and jsdom are useful for scraping
  // see:
  // https://gist.github.com/DTrejo/790580

  // for each page in theme.sources
  // find all img, css, and js links
  // scrape them and put then in the right slot in theme object
  // (you may need to create a new slot, e.g., for image data)

  // goal, by the way, is that the final stage in pipline will use 
  // the theme object to WRITE a new folder to disk containing the CTS theme.
  // e.g.:
  //   write mockup HTML
  //   write CSS files
  //   write IMG files ...etc

  // Return a status object
  return { success: true };
};

/**
 * Takes a theme object with assets already fetched and re-writes
 * the HTML so that it references local project structure.
 */

Jailbreak.Pipeline.FixAssets = function(theme, opts) {
  this.name = "Fix Assets";
};

Jailbreak.Pipeline.FixAssets.prototype.run = function(theme) {
  return { success: true };
};

/**
 * Takes a theme object with assets already fetched and re-writes
 * the HTML so that it references local project structure.
 */

Jailbreak.Pipeline.Pipeline = function() {
  this.name = "Pipeline";
  this.stages = [
    new Jailbreak.Pipeline.FetchPages(),
    new Jailbreak.Pipeline.FetchAssets()
  ];
};

Jailbreak.Pipeline.Pipeline.prototype.run = function(theme) {
  var looksGood = true;
  for (var i = 0; (looksGood && (i < this.stages.length)); i++) {
    Jailbreak.Pipeline.log(this, "Running Stage: " + this.stages[i].name);
    var result = this.stages[i].run(theme);
    looksGood = looksGood && result.success;
    theme.data.pipelineStatus[this.stages[i].name] = result;
    theme.saveToFile();
  }
};

}).call(this);

/*
 * The main harness for the jailbreak script
 */

fs = require('fs');
path = require('path');
optimist = require('optimist');

printLine = function(line) {
  process.stdout.write(line + "\n");
};

printError = function(line) {
  process.stderr.write(line + "\n");
};

BANNER = "Usage: jailbreak-wordpress <Workspace> <ThemeName> [ContentMap]";

exports.run = function() {
  var argv = optimist.usage(BANNER).argv;
  if (argv._.length < 2) {
    optimist.showHelp();
    return false;
  }
  
  var workspaceDirectory = argv._[0];
  var themeName = argv._[1];
  var contentMapFile = argv._[2];
  var themeDirectory = path.join(workspaceDirectory, themeName);

  // Create the Workspace directory if it doesn't exist
  if (! fs.existsSync(workspaceDirectory)) {
    fs.mkdirSync(workspaceDirectory);
  }
  if (! fs.existsSync(themeDirectory)) {
    fs.mkdirSync(themeDirectory);
  }

  var pipeline = new Jailbreak.Pipeline.Pipeline();
  var contentMap = new Jailbreak.ContentMap(contentMapFile);
  var theme = new Jailbreak.Theme(themeName, themeDirectory, contentMap);
  pipeline.run(theme);
};
