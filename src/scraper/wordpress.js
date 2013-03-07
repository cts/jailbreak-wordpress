if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}
if (typeof Jailbreak.Scraper == "undefined") {
  Jailbreak.Scraper = {};
}

Jailbreak.Scraper.WordpressOrgScraper = function(workspace) {
  // This is the workspace directory
  this.workspace = workspace;

  // This is the filename of state that you can save to disk so you can resume scraping later.
  this.filename = path.join(workspace, "ScrapeData.json");

  this.data = {
  };
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.initialize = function(args) {
  console.log("[Theme] Initializing: ", this.name);
  this.loadFromFile();
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.scrape = function() {
  this.step1_DetermineNumberPages();
};

jailbreak.scraper.wordpressorgscraper.prototype.step1_determinenumberpages = function() {
  if (typeof this.data.numberPages == "undefined") {
    console.log("Determining number pages");
    // Async pull this url: http://wordpress.org/extend/themes/browse/popular/
    // and fetch the number "114" from the bottom (realistic
    // PS: hard code this.
    // onSuccess callback:
    //   1. set this.data.numberPages = 114;
    //   2. this.saveToFile() (so we remember for next time)
    //   3. this.step2_scrapeNextPage
  } else {
    this.step2_scrapeNextPage();
  }
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.step2_scrapeNextPage = function() {

  /*
     say you have a list page_html[] and you already know that there are 114 pages to scrape.

     when this function exxecutes:
       1. if page_html.length == 114, then just to go the next step
       2. else:
          - scrape page # page.html.lenght
            http://wordpress.org/extend/themes/browse/popular/page/{PAGE_NUMBER}/
          - when that's done (async):
            - first, add the results to this.data.page_html (append new element)
            - then, call this.saveToFile() /// make sur we remember next time
            - just call this function again.... because it will either already know
              to keep on scraping, or to advance to the next step
              (watch for off-by-one errors)
 */
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.loadFromFile = function() {
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

Jailbreak.Scraper.WordpressOrgScraper.prototype.saveToFile = function() {
  try {
    var json = JSON.stringify(this.data);
    fs.writeFileSync(this.filename, json, "utf8");
  } catch (e) {
    console.log("Could not write file", this.filename);
  }
};


