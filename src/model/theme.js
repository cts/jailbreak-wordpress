if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}

/**
 * opts: options array
 */
Jailbreak.Theme = function(opts, args) {
  this.initialize(args);

  // HTML Sources representing the theme
  // Scraped from Wordpress
  this.sources = {};

  // HTML Mockups representing the theme
  this.mockups = {};

  // URL -> Treesheets Contents Map
  this.treesheets = {};

  // URL -> Stylesheet Contents Map
  this.stylesheets = {};

  // URL -> Javascript Map
  this.javascripts = {};

};

Jailbreak.Theme.prototype.initialize = function(args) {
};
