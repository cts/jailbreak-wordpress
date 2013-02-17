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

var _ = require("underscore");

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
    pipelineStatus: {},
    
    images: {}
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
  this.path = null;
};

Jailbreak.ContentPage.prototype.loadFromJson = function(json, contentMap) {
  this.reset();
  if (typeof json.path != "undefined") {
    this.path = json.path;
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
  this.self = this;
};

Jailbreak.Pipeline.FetchPages.prototype.run = function(theme, pipeline) {

  var domain = theme.contentMap.domain;
  var paths = [];
  var self = this;

  for (var i = 0; i < theme.contentMap.pages.length; i++) {
    var pageName = theme.contentMap.pages[i].name;
    var path = theme.contentMap.pages[i].path;
    paths.push(path);
    Jailbreak.Pipeline.log(self, "Scraping " + pageName + ": " + path);
  }

  var util = require('util');
  var url2 = require('url');
  var httpAgent = require('http-agent');
  var jsdom = require('jsdom').jsdom;
  var agent = httpAgent.create(domain, paths);

  count = 0;
  agent.addListener('next', function (e, agent) {
     if (e) {
       Jailbreak.Pipeline.log(self, 'error: ' + e);
       pipeline.advance(self, theme, {success:false});
     }
    //Not sure what the mapping should be
    theme.data.sources[theme.contentMap.pages[count].name]=agent.body;
    count++;
    agent.next();
  });
  
  agent.addListener('stop', function (err, agent) {
    // Jailbreak.Pipeline.log(self, "length im middle: " + theme.data.sources.post);
    //Jailbreak.Pipeline.log(self, "length im middle: " + theme.data.sources.index);
    pipeline.advance(self, theme, { success: true });
  });
  // Start the agent
  agent.start();
};

/**
 * Takes a theme object and downloads all assets (JS, CSS, IMG, etc),
 * placing them into the respective dictionary cache in the Theme
 * object.
 */

Jailbreak.Pipeline.FetchAssets = function(opts) {
  this.name = "Fetch Assets";

};

Jailbreak.Pipeline.FetchAssets.prototype.run = function(theme, pipeline) {
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

  var self = this;
  
  var fetch = function() {
    var scrapeLink = function(link, mapping) {
      var request = require('request');
      request(link, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        mapping[link]=body;
        //Jailbreak.Pipeline.log(self, "mapping: " + mapping[link]);
        }
      });
    };
    
    var mapData=function(html) {
      var jsdom = require('jsdom').jsdom;
      var window =jsdom(html).createWindow();
      var $ = require('jquery').create(window);
    
      $('img').map(function() { theme.data.images[this.src]=true; });
      $("link[type*=css]").map(function() { scrapeLink(this.href, theme.data.stylesheets);});
      $("script[type*=javascript]").map(function() { 
        if (this.src) {
          scrapeLink(this.src, theme.data.javascripts);
        }
      });
    };
    

    for (var x in theme.data.sources) {
      if(theme.data.sources.hasOwnProperty(x)){
        mapData(theme.data.sources[x]);
      }
    }
   
  };


  setTimeout(fetch,2000);
  var print = function() {
    Jailbreak.Pipeline.log(self,  "see this at end"); 
    for (var key in theme.data.stylesheets) {
      if(theme.data.stylesheets.hasOwnProperty(key)){
      Jailbreak.Pipeline.log(self, key); 
      }
    }
  };
  
  setTimeout(print,4000);
  // Return a status object
  pipeline.advance(self, theme, { success: true });
};

/**
 * Takes a theme object with assets already fetched and re-writes
 * the HTML so that it references local project structure.
 */

Jailbreak.Pipeline.FixAssets = function(theme, opts) {
  this.name = "Fix Assets";
};

Jailbreak.Pipeline.FixAssets.prototype.run = function(theme, pipeline) {
  pipeline.advance(this, theme, { success: true });
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
  Jailbreak.Pipeline.log(this, "Running Stage: " + this.stages[0].name);
  this.stages[0].run(theme, this);
};

Jailbreak.Pipeline.Pipeline.prototype.advance = function(stage, theme, result) {
  theme.data.pipelineStatus[stage.name] = result;
  theme.saveToFile();
  if (result.success) {
    var nextStage = _.indexOf(this.stages, stage) + 1;
    if (nextStage == -1) {
      Jailbreak.Pipeline.log(this, "Error: can't figure out where I am");
    } else if (nextStage < this.stages.length) {
      Jailbreak.Pipeline.log(this, "Running Stage: " + this.stages[nextStage].name);
      this.stages[nextStage].run(theme, this);
    } else {
      Jailbreak.Pipeline.log(this, "Pipeline complete");
    }
  } else {
    Jailbreak.Pipeline.log(this, "Aborting pipeline because of bad result.");
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
