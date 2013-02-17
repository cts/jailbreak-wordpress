/**
 * Takes a theme object and downloads all assets (JS, CSS, IMG, etc),
 * placing them into the respective dictionary cache in the Theme
 * object.
 */

Jailbreak.Pipeline.FetchAssets = function(opts) {
  this.name = "Fetch Assets";

};

Jailbreak.Pipeline.FetchAssets.prototype.run = function(theme) {
  // http-agent and jsdom are useful for scraping
  // see:
  // https://gist.github.com/DTrejo/790580

  // for each page in theme.sources
  // find all img, css, and js links
  // scrape them and put then in the right slot in theme object
  // (you may need to create a new slot, e.g., for image data)

  // goal, by the way, is that the final stage in pipline will use 
  // the theme object to WRITE a new folder to disk containing the CTS theme.
  // e.g.:
  //   write mockup HTML
  //   write CSS files
  //   write IMG files ...etc
  
  
  var fetch = function() {
    var scrapeLink = function(link, mapping) {
      var request = require('request');
      request(link, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        mapping[link]=body;
        //Jailbreak.Pipeline.log(this, "mapping: " + mapping[link]);
        }
      });
    };
    
    var mapData=function(html) {
      var jsdom = require('jsdom').jsdom;
      var window =jsdom(html).createWindow();
      var $ = require('jquery').create(window);
    
      $('img').map(function() { theme.data.images[this.src]=true; });
      $("link[type*=css]").map(function() { scrapeLink(this.href, theme.data.stylesheets);});
      $("script[type*=javascript]").map(function() { 
        if (this.src) {
          scrapeLink(this.src, theme.data.javascripts);
        }
      });
    };
    

    for (var x in theme.data.sources) {
      if(theme.data.sources.hasOwnProperty(x)){
        mapData(theme.data.sources[x]);
      }
    }
   
  };


  setTimeout(fetch,2000);
  var print = function() {
    Jailbreak.Pipeline.log(this,  "see this at end"); 
    for (var key in theme.data.stylesheets) {
      if(theme.data.stylesheets.hasOwnProperty(key)){
      Jailbreak.Pipeline.log(this, key); 
      }
    }
  };
  
  setTimeout(print,4000);
  // Return a status object
  return { success: true };
};
