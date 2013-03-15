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

    // Sources with any asset urls fixex to relative paths.
    // This is done in the fetch-assets pipeline stage.
    fixedSources: {},
 
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
    
    images: {},
    
    newClasses : {}
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
  this.data = null;
};

Jailbreak.ContentPage.prototype.loadFromJson = function(json, contentMap) {
  this.reset();
  if (typeof json.path != "undefined") {
    this.path = json.path;
  }
  if (typeof json.name != "undefined") {
    this.name = json.name;
  }
    if (typeof json.data != "undefined") {
    this.data= json.data;
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
//comment
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
    //console.log("theme.data.sources set with length",
    //            theme.data.sources[theme.contentMap.pages[count].name].length,
    //            agent.body.length);
   count++;
    agent.next();
  });
  
  agent.addListener('stop', function (err, agent) {
   pipeline.advance(self, theme, { success: true });
  });

  // Start the agent
  agent.start();
};

/**
 * Takes a theme object and downloads all assets (JS, CSS, IMG, etc),
 * placing them into the respective dictionary cache in the Theme
 * object .
 */

Jailbreak.Pipeline.FetchAssets = function(opts) {
  this.name = "Fetch Assets";
  this.pageQueue = {};
  this.assetQueue = {};
};

Jailbreak.Pipeline.FetchAssets.prototype.run = function(theme, pipeline) {
  this.queuePages(theme, pipeline);
};

Jailbreak.Pipeline.FetchAssets.prototype.queuePages = function(theme, pipeline) {
  _.each(theme.data.sources, function(html, name) {
    Jailbreak.Pipeline.log(this, "Queueing page asset fetch for: " + name);
    this.pageQueue[name] = html;
  }, this);

  // Advance to the next stage of the pipeline
  this.queueAssets(theme, pipeline);
};

Jailbreak.Pipeline.FetchAssets.prototype.queueAssets = function(theme, pipeline) {
  var self = this;

  var fixUrl = function(url) {
    if (url.substring(0,2) == "//") {
      url = "http:" + url;
    }
    return url;
  };

  var Uri = require("jsuri");

  var filenameForUrl = function(url) {
    var uri = new Uri(url);
    var parts = uri.path().split("/");
    var filename = parts[parts.length - 1];
    if ((filename === null) || (filename.length === 0)) {
      var d = new Date();
      filename = "AutoGen_" + d.getTime() + ".js";
    }
    return filename;
  };

  _.each(_.clone(this.pageQueue), function(html, name) {
    var jsdom = require('jsdom');
    jsdom.env({
      html: html,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
        console.log(errors);
        var $ = window.$;

        $('img').map(function() {
          Jailbreak.Pipeline.log(self, "Queueing asset fetch for: " + name + ": " + this.src);
          var url = fixUrl(this.src);
          var fname = filenameForUrl(url);
          self.assetQueue[url] = {
            filename: fname,
            type: 'img'
          };
          this.sec = "images/" + fname;
        });

        $("link[type*=css]").map(function() { 
          if (this.href) {
            Jailbreak.Pipeline.log(self, "Queueing asset fetch for: " + name + ": " + this.href);
            var url = fixUrl(this.href);
            var fname = filenameForUrl(url);
            self.assetQueue[url] = { 
              filename: fname,
              type: 'css' 
            };
            this.href = "stylesheets/" + fname;
          }
        });

        $("script[type*=javascript]").map(function() { 
           if (this.src) {
             Jailbreak.Pipeline.log(self, "Queueing asset fetch for: " + name + ": " + this.src);
             var url = fixUrl(this.src);
             var fname = filenameForUrl(url);
             self.assetQueue[url] = {
               filename: fname,
               type: 'js' 
             };
             this.src = "javascripts/" + fname;
             console.log("SRC:", this.src);
           }
        });

        theme.data.fixedSources[name] = window.document.documentElement.innerHTML;

        // Now remove this name from the object
        delete self.pageQueue[name];

        if (_.keys(self.pageQueue).length === 0) {
          self.fetchAssets(theme, pipeline);
        }
      } // done
    });
  }, this);
};

Jailbreak.Pipeline.FetchAssets.prototype.fetchAssets = function(theme, pipeline) {
  var self = this;

  var maybeFinish = function(url) {
    // Now remove this name from the object
    delete self.assetQueue[url];

    if (_.keys(self.assetQueue).length === 0) {
      // Finish for real.
      Jailbreak.Pipeline.log(self, "Finished fetching assets!");
      pipeline.advance(self, theme, { success: true });
    } 
  };

  _.each(_.clone(this.assetQueue), function(info, url) {
    var request = require('request');
    request({uri:url}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body) {
          info.data = body;
        } else {
          info.data = "";
        }
        Jailbreak.Pipeline.log(self, "Fetched " + url);
        if (info.type == "js") {
          theme.data.javascripts[url] = info;
        } else if (info.type == "css") {
          theme.data.stylesheets[url] = info;
        } else if (info.type == "img") {
          theme.data.images[url] = info;
        } else {
          Jailbreak.Pipeline.log(self, "Warning: unknown content type: " + info.type);
        }
        maybeFinish(url);
      } else {
        Jailbreak.Pipeline.log(self, "error " + e);
        pipeline.advance(self, theme, {success:false});
      }
    });
  }, this);
};

/**
 * Walks through each node and attribute in the DOM of all pages in sources and, * applies the appropirate class name.
 * Saves this modified HTML (with the classes added) to this.data.mockups[name]. * in the theme object which can be used as a mockup.
 * For every class we added, keep a data structure in theme.data that records
 * we've done this and whether it was an attribute or the innerHTML. This 
*/

Jailbreak.Pipeline.AnnotateDom = function(opts) {
  this.name = "Annotate Dom";
  this.self = this;
  this.pageDataQueue = {};

};

Jailbreak.Pipeline.AnnotateDom.prototype.run = function(theme, pipeline) {
  var self = this;
  for (var i = 0; i < theme.contentMap.pages.length; i++) {
    var page = theme.contentMap.pages[i];
    var data = page.data;
    var newClasses = {};
    if (data) {
      for (var x=0; x < _.keys(data).length; x++ ){
        var k = _.keys(data)[x];
        newClasses[k] = null;        
      }
      newClasses.repeats = [];
     this.pageDataQueue[page.name] = data;
     theme.data.newClasses[page.name] = newClasses;
    }
  }
  this.queuePages(theme, pipeline);
};

Jailbreak.Pipeline.AnnotateDom.prototype.queuePages= function(theme, pipeline) {
  var self = this;

  _.each(_.clone(this.pageDataQueue), function(data, name) {
    var html = theme.data.sources[name];
    var jsdom = require('jsdom');
    jsdom.env({
      html: html,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
         console.log(errors);
        var $ = window.$;

        var childNodes = $("*").filter(function(index) { 
          var isLeaf = $(this).children().length <= 1;
          return isLeaf;})
          .map(function() { 
            for (var x=0; x < _.pairs(data).length; x++ ){
              var k = _.pairs(data)[x][0];
              var v = _.pairs(data)[x][1];
              if (this.innerHTML===v) {
                this.className = k;
               // Jailbreak.Pipeline.log(self, "found in html: " + this.innerHTML+ " className: " + this.className + ", key: " + k);
                theme.data.newClasses[name][k] = "innerHTML";
              }
              for (var g=0; g <this.attributes.length; g++ ) {
                if (this.attributes[g].value ==v) {
                this.className =k;
               // Jailbreak.Pipeline.log(self, "found inattributes val: " + this.attributes[g].value+ " attr name: " + this.attributes[g].name + ", key: " + k + " this.className: "  + this.className);
                theme.data.newClasses[name][k] = this.attributes[g].name;            
                }
              } 
            }
          });
    
        var repeats = data.repeats;
        if (repeats) {
          for (var i = 0; i < repeats.length; i++ ) {
            var repeat = repeats[i];
            var dict = {};
            var offset = 0;
            var step = 1;
            if (repeat.offset) {
              offset = Number(repeat.offset);
            }
            if (repeat.step) {
              step = Number(repeat.step);
            }
            $(repeat.selector).addClass(repeat.newClass);
            dict.name = repeat.newClass;
            dict.offset = offset;
            dict.step= step;
            dict.content = [];
           for (var l=0; l < _.pairs(repeat.content).length; l++ ){
            var c  = _.pairs(repeat.content)[l][0];
            var f  = _.pairs(repeat.content)[l][1];
            $(repeat.selector).find(f).addClass(c);
            dict.content.push(c);
           }
            theme.data.newClasses[name].repeats.push(dict);
          }
        }
        theme.data.mockups[name] = window.document.innerHTML;

        delete self.pageDataQueue[name];

        if (_.keys(self.pageDataQueue).length === 0) {
          pipeline.advance(self, theme, {success:true});
        }
      } // done
    });
  }, this);
};

/*
 * Outputs the files from the theme object at the very end
 */
Jailbreak.Pipeline.OutputFiles = function(theme, opts) {
  this.name = "Output Files";
  this.self = this;
};

Jailbreak.Pipeline.OutputFiles.prototype.writeFiles = function(theme, files, toDir) {
 var directory = path.join(theme.directory, toDir);
  if (! fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  _.each(files, function(obj, url) {
    var data = "";
    var filename = "";

    if (typeof obj == "object") {
      filename = obj.filename;
      data = obj.date;
     // console.log("is object, filename: " + filename + " , data: " + data);
    } else {
      filename = url + ".html";
      data = obj;
      //console.log("is not object, url: " + filename);
     // console.log("is not object, filename: " + filename + " , data: " + data);
    }

    try {
      var fullfilename = path.join(directory, filename);
      Jailbreak.Pipeline.log(this, "Writing " + fullfilename);
      fs.writeFileSync(fullfilename, data, "utf8");
    } catch (e) {
      console.log("Could not write file", fullfilename, e);
    }

  }, this);
};

Jailbreak.Pipeline.OutputFiles.prototype.writeCTSSheets = function(theme, files, toDir) {
  var ctsString = function(key, attr) {
    var rule = "";
    if (key==="repeats") {
       var repeatList = attr;
       for (var i = 0; i < repeatList.length; i++) {
         var repeat = repeatList[i];
         rule += "." + repeat.name + " { \n";
         rule+="  repeat: " + repeat.name + "\n";
         rule+= "  repeat-offset: " + repeat.offset + "\n";
         rule+= "  repeat-step: " + repeat.step + "\n";
         rule += "}" + "\n";
         for (var g=0; g < repeat.content.length; g++) {
            rule += "." + repeat.name + " ." + repeat.content[g] + " { \n";
            rule += "  value: " + repeat.content[g] + "\n";
            rule += "} \n";
         }
       }
    } else if (attr==="innerHTML") {
      rule = "." + key + " { \n";
      rule+= "  value: " + key + " \n";
      rule += "} \n";
    } else if (attr) {
      rule = "." + key + " { \n";
      rule += "  value(@" + attr+ "): " + key +" \n";
      rule+= "} \n";
    }
    console.log("adding rule: " + rule);
    return rule;
 };
 var directory = path.join(theme.directory, toDir);
  if (! fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  _.each(files, function(obj, url) {
    var data = "";
    var filename = url + ".cts";
    try {
      var fullfilename = path.join(directory, filename);
      Jailbreak.Pipeline.log(this, "Writing " + fullfilename);
      _.each(obj, function(val, name) {
        data+=ctsString(name, val);
      }, this);
      fs.writeFileSync(fullfilename, data, "utf8");
    } catch (e) {
      console.log("Could not write file", fullfilename, e);
    }
  }, this);
};

Jailbreak.Pipeline.OutputFiles.prototype.run = function(theme, pipeline) {

  //pipeline.printTheme(theme);
  this.writeFiles(theme, theme.data.sources, "sources");
  this.writeFiles(theme, theme.data.fixedSources, "fixedSources");
  this.writeFiles(theme, theme.data.images, "images");
  this.writeFiles(theme, theme.data.javascripts, "javascripts");
  this.writeFiles(theme, theme.data.mockups, "mockups");
  this.writeFiles(theme, theme.data.stylesheets, "stylesheets");
  this.writeCTSSheets(theme, theme.data.newClasses, "ctsSheets");
  pipeline.advance(this, theme, { success: true });
};

/**
 * Takes a theme object with assets already fetched and re-writes
 * the HTML so that it references local project structure.
 */


Jailbreak.Pipeline.Pipeline = function(options) {
  /*
   * TODO(jason):
   *  let user use the options variable to specify which stages to process
   */
  this.name = "Pipeline";
  this.stages = [
    new Jailbreak.Pipeline.FetchPages(),  // Fetches the HTML (need)
    new Jailbreak.Pipeline.FetchAssets(), // Fetches the images, javascript, css, etc (need)
    new Jailbreak.Pipeline.AnnotateDom(), // Does lightweight wrapper induction (jason: this is the one we don't need)
    new Jailbreak.Pipeline.OutputFiles()  // Writes out files (need)
  ];
};


// TODO(jason):
// You'll need to CREATE this theme object to pass in that specifies what to pull down.
Jailbreak.Pipeline.Pipeline.prototype.run = function(theme) {
  Jailbreak.Pipeline.log(this, "Running Stage: " + this.stages[0].name);
  this.stages[0].run(theme, this);
};

Jailbreak.Pipeline.Pipeline.prototype.printTheme = function(theme) {
 Jailbreak.Pipeline.log(this, "Printing keys from sources");
  for (var source in theme.data.sources) {
    if(theme.data.sources.hasOwnProperty(source)){
      Jailbreak.Pipeline.log(this, "sources file: " + source);
    }
  }
 Jailbreak.Pipeline.log(this, "Printing keys from images");
  for (var img in theme.data.images) {
    if(theme.data.images.hasOwnProperty(img)){
      Jailbreak.Pipeline.log(this, "image  file: " + img);
    }
  }
 Jailbreak.Pipeline.log(this, "Printing keys from javascripts");
  for (var j in theme.data.javascripts) {
    if(theme.data.javascripts.hasOwnProperty(j)){
      Jailbreak.Pipeline.log(this, "javascript file: " + j);
    }
  }

 Jailbreak.Pipeline.log(this, "Printing keys from stylesheets");
  for (var key in theme.data.stylesheets) {
    if(theme.data.stylesheets.hasOwnProperty(key)){
      Jailbreak.Pipeline.log(this, "stylesheet file: " + key);
    }
  }

};

Jailbreak.Pipeline.Pipeline.prototype.printData = function(data) {
 Jailbreak.Pipeline.log(this, "printing data from " + data);
 for (var key in data) {
    if (data.hasOwnProperty(key)) {
      Jailbreak.Pipeline.log(this, key);
    }
  }
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
