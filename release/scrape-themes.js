(function() {

var _ = require("underscore");

if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}
if (typeof Jailbreak.Scraper == "undefined") {
  Jailbreak.Scraper = {};
}

Jailbreak.Scraper.WordpressOrgScraper = function(workspace) {
  this.workspace = workspace;
  this.filename = path.join(workspace, scraper + ".json");
  this.data = {
  };
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.initialize = function(args) {
  console.log("[Theme] Initializing: ", this.name);
  this.loadFromFile();
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.loadFromFile = function() {
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

Jailbreak.Scraper.WordpressOrgScraper.prototype.saveToFile = function() {
  try {
    var json = JSON.stringify(this.data);
    fs.writeFileSync(this.filename, json, "utf8");
  } catch (e) {
    console.log("Could not write file", this.filename);
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

BANNER = "Usage: scrape-themes <IntoDirectory>";

exports.run = function() {
  var argv = optimist.usage(BANNER).argv;
  if (argv._.length < 1) {
    optimist.showHelp();
    return false;
  }
  
  var workspaceDirectory = argv._[0];

  // Create the Workspace directory if it doesn't exist
  if (! fs.existsSync(workspaceDirectory)) {
    fs.mkdirSync(workspaceDirectory);
  }
 
  var scraper = new Jailbreak.Scraper.WordpressOrgScraper(workspaceDirectory);
  scraper.scrape();
};
