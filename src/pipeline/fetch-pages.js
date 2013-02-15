/*
 * Walks every URL in the contentmap and scrapes it.
 */
Jailbreak.Pipeline.FetchPages = function(theme, opts) {
  this.name = "Fetch Pages";
};

Jailbreak.Pipeline.FetchPages.prototype.run = function(theme) {
  for (var i = 0; i < theme.contentMap.pages.length; i++) {
    var name = theme.contentMap.pages[i].name;
    var url = theme.contentMap.pages[i].url;
    Jailbreak.Pipeline.log(this, "Scraping " + name + ": " + url);
    // TODO(sscodel): scrape page HTML, put it in theme object.
  }

  // Return a status object
  // TODO(sscodel): possibly return error if the scrape fails
  // error -> false success value and a message explaining error
  return { success: true };
};
