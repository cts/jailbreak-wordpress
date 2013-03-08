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
