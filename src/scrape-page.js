/*
 * Scrapes a single web page and all its assets.
 *
 * Usage: scrape-page <Workspace> <ThemeName> <PageName> <URL>
 *
 * TODO(Jason):
 * Will place the contents of URL into
 *  <Workspace>/<ThemeName>/<PageName>.html
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

var shortZipName = function(name) {
  var ind = name.indexOf("download");
  var zip = name.substring(ind+9, name.length);
  ind = zip.indexOf(".");
  return zip.substring(0, ind);
};

BANNER = "Usage: scrape-page <Workspace> <ThemeName> <PageName> <URL>";

exports.run = function() {
  var argv = optimist.usage(BANNER).argv;
  if (argv._.length < 4) {
    optimist.showHelp();
    return false;
  }
  
  var workspaceDirectory = argv._[0];
  var themeName = argv._[1];
  var url = argv._[2];
  var pageName = argv._[3];

  if (! fs.existsSync(workspaceDirectory)) {
    fs.mkdirSync(workspaceDirectory);
  }

  var themeDirectory = path.join(workspaceDirectory, themeName);
  if (! fs.existsSync(themeDirectory)) {
     fs.mkdirSync(themeDirectory);
  }

  var options = {
    FetchPages: true,
    FetchAssets: true,
    AnnotateDom: false,
    OutputFiles: true
  };

  // TODO(Jason): Make sure the pipeline responds to the options passed in
  var pipeline = new Jailbreak.Pipeline.Pipeline(options);

  var contentMapJson = {
    // TODO(Jason): You'll need to create your own contentmap here
  };
  var contentMap = new Jailbreak.ContentMap(contentMapJson);

  var theme = new Jailbreak.Theme(themeName, themeDirectory, contentMap);

  pipeline.run(theme);
};
