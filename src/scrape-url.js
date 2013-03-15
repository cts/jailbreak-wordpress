/*
 * The main harness for the scrape URL script
 */

fs = require('fs');
path = require('path');
optimist = require('optimist');

BANNER = "Usage: scrape-url <URL> <Workspace> <ThemeName> <PageName>";


/*
 *
 * create directory Workspace/ThemeName if it doesn't already exist.
 * Save to PageName
 * Save all the assets of to the directory, and
 * Rewrite html to point to them
 */
exports.run = function() {
  var argv = optimist.usage(BANNER).argv;
  if (argv._.length < 2) {
    optimist.showHelp();
    return false;
  }
  
  var url = argv._[0];
  var workspaceDirectory = argv._[1];
  var themeName = argv._[2];
  var pageName = argv._[3];

  var themeDirectory = path.join(workspaceDirectory, themeName);

  // Create the Workspace directory if it doesn't exist
  if (! fs.existsSync(workspaceDirectory)) {
    fs.mkdirSync(workspaceDirectory);
  }
  if (! fs.existsSync(themeDirectory)) {
    fs.mkdirSync(themeDirectory);
  }

  // Now we know that <Workspace Directory>/<Theme Directory> exists.

  // TODO(jason): initialize the pipeline to tell it that we DONT want to 
  // run the third step.
  var pipeline = new Jailbreak.Pipeline.Pipeline();

  /*
   * TODO(jason): Create a content map PROGRAMMATICALLY
   */
  // Instead of this:
  //var contentMap = new Jailbreak.ContentMap("./content-maps/testmap.json");

  // We'll create this
  var ourCustomContentMapJson = { 
      name: "Single URL",
      // TODO(jason)
      // Parse out the domain from the URL
      // e.g. "people.csail.mit.edu"
      domain: "Domain from the URL variable",
      pages: [
        {
          "name": pageName,
          // TODO(jason):
          // Parse out the path from the url variable.
          // e.g. "/karger"
          "page": "path from the URL variable"
        }
      ]
    };

  // TODO(jason):
  // we want to be able to call the ContenMap constructor like this.
  // You'll need to modify the ContentMap constructor in src/model/contentmap.js to enable this.
  var contentMap = new Jailbreak.ContentMap(outCustomContentMapJson, "json");
  // Note that the old way, we just pass it a FILENAME to the JSON object
  // like this:
  // var contentMap = new Jailbreak.ContentMap("./content-maps/testmap.json");

  var theme = new Jailbreak.Theme(themeName, themeDirectory, contentMap);

  pipeline.run(theme);
};

