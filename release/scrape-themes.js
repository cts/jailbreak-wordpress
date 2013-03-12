(function() {

var _ = require("underscore");

if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}
if (typeof Jailbreak.Scraper == "undefined") {
  Jailbreak.Scraper = {};
}

Jailbreak.Scraper.WordpressOrgScraper = function(workspace) {
  // This is the workspace directory
  this.name = "WordpressOrgScraper";
  this.workspace = workspace;

  // This is the filename of state that you can save to disk so you can resume scraping later.
  this.filename = path.join(workspace, "ScrapeData.json");
  this.pageQueue = {};
  this.data = {
  };
  
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.initialize = function(args) {
  this.loadFromFile();
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.scrape = function() {
  this.loadFromFile();
  this.step1_DetermineNumberPages();
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.step1_DetermineNumberPages = function() {
  var self = this;
  if (typeof this.data.numberPages == "undefined") {
    console.log("Determining number pages");
    var request = require('request');
    var jsdom = require('jsdom');
    request({ uri:"http://wordpress.org/extend/themes/browse/popular/"},
      function (error, response, body) {
        if (error && response.statusCode !== 200) {
          console.log('Error when contacting wordpress');
        }                
        jsdom.env({
          html: body,
          scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
          done: function (err, window) {
            var $ = window.jQuery;
            var pages = $(".next.page-numbers").prev().html();
            self.data.numberPages = 5;
            self.saveToFile();
            self.step2_scrapeNextPage();
          }
        });
      });
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
  var self = this;

   if (typeof this.data.page_html=="undefined") {
     this.data.page_html = [];
     this.saveToFile();
   }
     console.log("step 2 scraping next page, this.data.numberPages: " + this.data.numberPages + " , this.data.page_html.length: " +this.data.page_html.length);
   if (this.data.page_html.length===this.data.numberPages) {
     this.step3_scrapeThemeUrls();
   } else {
    var pageNum = this.data.page_html.length +1;
    var pageUri = "http://wordpress.org/extend/themes/browse/popular/page/" + pageNum;
    var request = require('request');
    request({ uri: pageUri},
      function (error, response, body) {
        if (error && response.statusCode !== 200) {
          console.log('Error when contacting wordpress');
        }
        self.data.page_html.push(body);
        self.saveToFile();
        self.step2_scrapeNextPage();
      });
 
   }
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

Jailbreak.Scraper.WordpressOrgScraper.prototype.step3_scrapeThemeUrls = function() {
  var self = this;
   if (typeof this.data.theme_urls=="undefined") {
     this.data.theme_urls = [];
     this.data.numberOfThemes = 0;
     this.saveToFile();
   }
   if (this.data.theme_urls.length===this.data.numberPages) {
     this.step4_scrapeZipFiles();
   } else {
     var i = self.data.theme_urls.length;
     console.log("step 3 scraping theme urls length: " + self.data.theme_urls.length);
     var html = this.data.page_html[i];
     var urls = [];
     var jsdom = require('jsdom');
     jsdom.env({
       html: html,
       scripts: ["http://code.jquery.com/jquery.js"],
       done: function (errors, window) {
         if (errors) {
           console.log("errors: " + errors);
         }
         var $ = window.$;
         $('.plugin-block h3 a').map(function() {
           urls.push(this.href);
           self.data.numberOfThemes++;
           console.log("link: " + this.href);
         });
         self.data.theme_urls.push(urls);
         self.saveToFile();
         self.step3_scrapeThemeUrls();
       }
     });
   } 
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.step4_scrapeZipFiles = function() {
  var self = this;
  console.log("step 4 scraping zip files");
   if (typeof this.data.zip_urls=="undefined") {
     self.saveToFile();
     this.data.zip_urls = [];
     this.saveToFile();
   }
   if (this.data.zip_urls.length===_.flatten(this.data.theme_urls).length) {
     console.log("All DONE!!!!!");
   } else {
     var i = self.data.zip_urls.length;
     console.log("zip urls length: " + self.data.zip_urls.length);
     var themeUri = _.flatten(this.data.theme_urls)[i];
     var jsdom = require('jsdom');
     var request = require('request');
     var http = require('http');
     var fs = require('fs');
     request({ uri:themeUri},
      function (error, response, body) {
        if (error && response.statusCode !== 200) {
          console.log('Error when contacting wordpress');
        }                
        jsdom.env({
          html: body,
          scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
          done: function (errors, window) {
            if (errors) {
              console.log("errors: " + errors);
             }
             var $ = window.$;
             var zip = $('a.activatelink').attr('href');
             console.log("zip: " + zip);
             self.data.zip_urls.push(zip);
             var file =fs.createWriteStream(path.join(self.workspace,self.ShortZipName(zip)));
             var r = http.get(zip, function(response) {
             response.pipe(file);
             self.saveToFile();
             self.step4_scrapeZipFiles();
           });
         
         }
       });
     });
   } 
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
  
Jailbreak.Scraper.WordpressOrgScraper.prototype.ShortZipName = function(name) {
  var ind = name.indexOf("download");
  return name.substring(ind+9, name.length);
};

Jailbreak.Scraper.WordpressOrgScraper.prototype.saveToFile = function() {
  try {
    var json = JSON.stringify(this.data);
    fs.writeFileSync(this.filename, json, "utf8");
  } catch (e) {
    console.log("Could not write file", this.filename);
  }
};



}).call(this);

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

BANNER = "Usage: scrape-themes <IntoDirectory>";

exports.run = function() {
  var argv = optimist.usage(BANNER).argv;
  if (argv._.length < 1) {
    optimist.showHelp();
    return false;
  }
  
  var workspaceDirectory = argv._[0];

  // Create the Workspace directory if it doesn't exist
  if (! fs.existsSync(workspaceDirectory)) {
    fs.mkdirSync(workspaceDirectory);
  }
 
  var scraper = new Jailbreak.Scraper.WordpressOrgScraper(workspaceDirectory);
  scraper.scrape();
};
