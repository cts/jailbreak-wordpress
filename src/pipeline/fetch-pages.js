if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}
if (typeof Jailbreak.Pipeline == "undefined") {
  Jailbreak.Pipeline = {};
}

/*
 * Walks every URL in the contentmap and scrapes it.
 */
Jailbreak.Pipeline.FetchPages = function(theme, opts) {
  this.name = "Fetch Pages";

  // For each page in theme.contentmap
  // Scrape the page HTML
  // Store the page HTML (theme.sources[url] = html;)
};

Jailbreak.Pipeline.FetchPages.prototype.run = function(theme) {
};
