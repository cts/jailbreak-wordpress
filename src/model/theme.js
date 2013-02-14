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
    this.mockups = {},

    // URL -> Treesheets Contents Map
    this.treesheets = {},

    // URL -> Stylesheet Contents Map
    this.stylesheets = {},

    // URL -> Javascript Map
    this.javascripts = {},

    // Pipeline name
    this.pipelineStatus = {}
  };

  this.initialize();
};

Jailbreak.Theme.prototype.initialize = function(args) {
  // TODO(eob).
  // Tries to load the theme a file.
};

Jailbreak.Theme.prototype.loadFromFile = function() {
  var json = "";
  this.data = JSON.parse(json);
};

Jailbreak.Theme.prototype.saveToFile = function() {
  var json = JSON.stringify(this.data);
};
