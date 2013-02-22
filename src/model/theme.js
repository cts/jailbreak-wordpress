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
