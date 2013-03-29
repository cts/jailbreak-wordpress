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

var shortZipName = function(name) {
  var ind = name.indexOf("download");
   var zip = name.substring(ind+9, name.length);
   ind = zip.indexOf(".");
   return zip.substring(0, ind);
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

  // Create the Workspace directory if it doesn't exist
  if (! fs.existsSync(workspaceDirectory)) {
    fs.mkdirSync(workspaceDirectory);
  }

  var options = {
    FetchPages: true,
    FetchAssets: true,
    AnnotateDom: true,
    OutputFiles: true
  };

  var pipeline = new Jailbreak.Pipeline.Pipeline();
  console.log("theme name: " + themeName);
  var json = fs.readFileSync(themeName, "utf-8");
  var data = JSON.parse(json);
  var done = 0;
  var toDO = data.zip_urls.length;
  var maybeScrapeTheme = function() {
    if (done < toDO) {
      scrapeTheme(done++);
    }
  };
  var scrapeTheme = function(i) {
    var contentMap2 = new Jailbreak.ContentMap(contentMapFile);
    var name = shortZipName(data.zip_urls[i]);
    var themeDirectory2 = path.join(workspaceDirectory, name);
    console.log("name: " + name);
    if (! fs.existsSync(themeDirectory2)) {
      fs.mkdirSync(themeDirectory2);
    }
    for (var x=0; x < contentMap2.pages.length; x++) {
      var page = contentMap2.pages[x];
      page.queryparams = _.extend({'preview_theme':name}, page.queryparams);
    }
    //must create directory
    var newDirectory = path.join(workspaceDirectory, name);
    var theme2 = new Jailbreak.Theme(name, themeDirectory2, contentMap2);
    pipeline.options.onComplete = maybeScrapeTheme;
    pipeline.run(theme2);
  };
  maybeScrapeTheme();

};
