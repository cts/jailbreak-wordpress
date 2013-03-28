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

  this.content = {};

  if (typeof config == "string") {
    this.loadFromFile(config);
  } else {
    this.loadFromJson(config);
  }
  this.buildLookups();
};

Jailbreak.ContentMap.prototype.reset = function() {
  this.pages = [];
  this.name = null;
  this.domain = null;
  this.content = {};
  this.forward = {};
  this.backward = {};
};

/*
 * Returns a key or null
 */
Jailbreak.ContentMap.prototype.keypathForValue = function(value) {
  if (value in this.backward) {
    return this.backward[value];
  } else {
    return null;
  }
};

Jailbreak.ContentMap.prototype.cssClassForKeypath = function(value) {
  return "CLASS";
};

Jailbreak.ContentMap.prototype.buildLookups = function(content) {
  this.forward = {};
  this.backward = {};
  var objects = [["", this.content]];
  var self = this;

  var chunkOne = function() {
    var thisObject = objects.pop();
    var prefix = thisObject[0];
    var obj = thisObject[1];

    _.each(obj, function(v, k) {
      var path = k;
      if (prefix !== "") {
        path = prefix + "." + path;
      }

      if (_.isArray(v)) {
        for (var i = 0; i < v.length; i++) {
          var np = path + ".[" + i + "]";
          objects.push([np, v[i]]);
        }
      } else if (_.isObject(v)) {
        objects.push([path, v]);
      } else {
        if (_.contains(this.backward, v)) {
          Jailbreak.Pipeline.log(self, "WARNING: Backward lookup already has value " + v);
        }
        if (_.contains(this.forward, path)) {
          Jailbreak.Pipeline.log(self, "WARNING: Backward lookup already has value " + k);
        }
        this.forward[path] = v;
        this.backward[v] = path;
      }
    });
  };

  while (objects.length > 0) {
    chunkOne();
  }

  console.log("[ContentMap] Forward Content Map");
  console.log("[ContentMap] ===================");
    _.each(this.forward, function(v, k) {
      console.log("[ContentMap] " + k + " ==> " + v);
  });
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

  if (typeof json.content != "undefined") {
    this.content = json.content;
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
