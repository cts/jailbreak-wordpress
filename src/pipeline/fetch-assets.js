/**
 * Takes a theme object and downloads all assets (JS, CSS, IMG, etc),
 * placing them into the respective dictionary cache in the Theme
 * object.
 */

Jailbreak.Pipeline.FetchAssets = function(opts) {
  this.name = "Fetch Assets";
  this.pageQueue = {};
  this.assetQueue = {};
};

Jailbreak.Pipeline.FetchAssets.prototype.run = function(theme, pipeline) {
  this.queuePages(theme, pipeline);
};

Jailbreak.Pipeline.FetchAssets.prototype.queuePages = function(theme, pipeline) {
  _.each(theme.data.sources, function(html, name) {
    Jailbreak.Pipeline.log(this, "Queueing page asset fetch for: " + name);
    this.pageQueue[name] = html;
  }, this);

  // Advance to the next stage of the pipeline
  this.queueAssets(theme, pipeline);
};

Jailbreak.Pipeline.FetchAssets.prototype.queueAssets = function(theme, pipeline) {
  var self = this;

  var fixUrl = function(url) {
    if (url.substring(0,2) == "//") {
      url = "http:" + url;
    }
    return url;
  };

  _.each(_.clone(this.pageQueue), function(html, name) {
    var jsdom = require('jsdom');
    jsdom.env({
      html: html,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
        console.log(errors);
        var $ = window.$;

        $('img').map(function() {
          Jailbreak.Pipeline.log(self, "Queueing asset fetch for: " + name + ": " + this.src);
          self.assetQueue[fixUrl(this.src)] = { type: 'img' };
        });

        $("link[type*=css]").map(function() { 
          if (this.href) {
          Jailbreak.Pipeline.log(self, "Queueing asset fetch for: " + name + ": " + this.href);
            self.assetQueue[fixUrl(this.href)] = { type: 'css' };
          }
        });

        $("script[type*=javascript]").map(function() { 
           if (this.src) {
             Jailbreak.Pipeline.log(self, "Queueing asset fetch for: " + name + ": " + this.src);
             self.assetQueue[fixUrl(this.src)] = { type: 'js' };
           }
        });

        // Now remove this name from the object
        delete self.pageQueue[name];

        if (_.keys(self.pageQueue).length === 0) {
          self.fetchAssets(theme, pipeline);
        }
      } // done
    });
  }, this);
};

Jailbreak.Pipeline.FetchAssets.prototype.fetchAssets = function(theme, pipeline) {
  var self = this;

  var maybeFinish = function(url) {
    // Now remove this name from the object
    delete self.assetQueue[url];

    if (_.keys(self.assetQueue).length === 0) {
      // Finish for real.
      Jailbreak.Pipeline.log(self, "Finished fetching assets!");
      pipeline.advance(self, theme, { success: true });
    } 
  };

  _.each(_.clone(this.assetQueue), function(info, url) {
    var request = require('request');
    request({uri:url}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body) {
          Jailbreak.Pipeline.log(self, "Fetched " + url);
          if (info.type == "js") {
            theme.data.javascripts[url] = body;
          } else if (info.type == "css") {
            theme.data.stylesheets[url] = body;
          } else if (info.type == "img") {
            theme.data.images[url] = body;
          } else {
            Jailbreak.Pipeline.log(self, "Warning: unknown content type: " + info.type);
          }
          maybeFinish(url);
        } else {
          theme.data.images[url] = "";
          maybeFinish(url);
        }
      } else {
        Jailbreak.Pipeline.log(self, "error " + e);
        pipeline.advance(self, theme, {success:false});
      }
    });
  }, this);
};
