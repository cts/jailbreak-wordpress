/**
 * Takes a theme object and downloads all assets (JS, CSS, IMG, etc),
 * placing them into the respective dictionary cache in the Theme
 * object.
 */

Jailbreak.Pipeline.FetchAssets = function(opts) {
  this.name = "Fetch Assets";

};

Jailbreak.Pipeline.FetchAssets.prototype.run = function(theme, pipeline) {
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

  var self = this;
  
  var scrapeLink = function(link, mapping) {
    if (link.substring(0,2)!="//") {
       var request = require('request');
       request({uri:link}, function (error, response, body) {
         if (!error && response.statusCode == 200) {
           if (body) {
             mapping[link]=body;
           }
          } else {
            Jailbreak.Pipeline.log(self, "error " + e);
            pipeline.advance(self, theme, {success:false});
        }
       });
    }
  };

  var mapData=function(html) {      
    var jsdom = require('jsdom');
    jsdom.env({
      html: html,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
        var $ = window.$;
        $('img').map(function() {theme.data.images[this.src]=true; });
        $("link[type*=css]").map(function() { 
          if (this.href) {
            scrapeLink(this.href, theme.data.stylesheets);
          }
        });
        $("script[type*=javascript]").map(function() { 
           if (this.src) {
             scrapeLink(this.src, theme.data.javascripts);
             }
        });
      }
    });
                              
  };
    
  for (var x in theme.data.sources) {
    if(theme.data.sources.hasOwnProperty(x)){
      mapData(theme.data.sources[x]);
    }
  }
  setTimeout( function() {pipeline.advance(self, theme, { success: true }); }, 8000);
};
