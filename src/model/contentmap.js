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
Jailbreak.ContentMap = function(config) {

  /* A list of ContentPage objects */
  this.pages = [];

  /* A name for this map */
  this.name = null;

  /* The base domain + path for this content map.
     All pages are specified relative to this path. */
  this.domain = null;

  if (typeof config == "string") {
    this.loadFromFile(config);
  } else {
    this.loadFromJson(config);
  }
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
