/**
 * Takes a theme object and downloads all assets (JS, CSS, IMG, etc),
 * placing them into the respective dictionary cache in the Theme
 * object .
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
    } else if (url.substring(0,1) == "/") {
      url = "http://" + theme.contentMap.domain + url;
    }
    if (url.substring(0,4) != "http"){
      url = theme.contentMap.domain + theme.contentMap.pages[0].path + url;
    }
    return url;
  };

  var Uri = require("jsuri");

  var filenameForUrl = function(url) {
    var uri = new Uri(url);
    var parts = uri.path().split("/");
    var filename = parts[parts.length - 1];
    if ((filename === null) || (filename.length === 0)) {
      var d = new Date();
      filename = "AutoGen_" + d.getTime() + ".js";
    }
    return filename;
  };

  var addToAssetQueue = function($, type, node, attr, newbase) {
    var e = $(node);
    var urlUnfixed = e.attr(attr);
    var url = fixUrl(urlUnfixed);
    var filename = filenameForUrl(url);
    Jailbreak.Pipeline.log(self, "Asset to download: " + url + " --> " + filename);
    self.assetQueue[url] = {
      filename: filename,
      type: type
    };
    e.attr(attr, url);
  };

  _.each(_.clone(this.pageQueue), function(html, name) {
    var jsdom = require('jsdom');
    jsdom.env({
      html: html,
      //scripts: ["http://code.jquery.com/jquery.js"],
      scripts: ["http://localhost:4000/js/jquery.js"],
      done: function (errors, window) {
        if (errors) {
          Jailbreak.Pipeline.log(self, "Error loading up page HTML with scripts: " + name);
          Jailbreak.Pipeline.log(self, errors);
        } else {
          var $ = window.$;
          _.each($('img'), function(elem) {
            addToAssetQueue($, 'img', elem, 'src', 'images/');
          });
  
          _.each($('link'), function(elem) {
            var e = $(elem);
            if (
              ((! _.isNull(e.prop('type'))) && (e.prop('type').indexOf('css') != -1)) ||
              ((! _.isUndefined(e.attr('rel'))) && (e.attr('rel') == 'stylesheets'))
            ) {
              addToAssetQueue($, 'css', elem, 'href', 'stylesheets/');
            }
          });
  
          _.each($("script[type*=javascript]"), function(elem) {
            addToAssetQueue($, 'js', elem, 'src', 'javascripts/');
          });
  
          theme.data.fixedSources[name] = window.document.documentElement.innerHTML;
  
          // Now remove this name from the object
          delete self.pageQueue[name];
  
          if (_.keys(self.pageQueue).length === 0) {
            self.fetchAssets(theme, pipeline);
          }
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
    Jailbreak.Pipeline.log(self, "SENDING REQUEST: " + url);
    request({uri:url}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body) {
          info.data = body;
        } else {
          info.data = "";
        }
        Jailbreak.Pipeline.log(self, "Fetched " + url);
        if (info.type == "js") {
          theme.data.javascripts[url] = info;
        } else if (info.type == "css") {
          theme.data.stylesheets[url] = info;
        } else if (info.type == "img") {
          theme.data.images[url] = info;
        } else {
          Jailbreak.Pipeline.log(self, "Warning: unknown content type: " + info.type);
        }
        maybeFinish(url);
      } else {
        Jailbreak.Pipeline.log(self, "Asset request error " + error);
        pipeline.advance(self, theme, {success:false});
      }
    });
  }, this);
};
