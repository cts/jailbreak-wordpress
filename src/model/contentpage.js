if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
} 

Jailbreak.ContentPage = function() {

  /* The URL for this page. */
  this.url = null;

  /* The name for this page. Should be unique across the content map */
  this.name = null;
};

/*
 * Methods
 */

Jailbreak.ContentPage.prototype.getPath = function(params) {
  var ret = this.path;
  if ((typeof params != 'undefined') ||
      ( (this.data !== null) &&
        (typeof this.data.queryparams != 'undefined'))) {
    var p = _.extend({}, params, this.data.queryparams);
    var s = _.join(_.map(p, function(v, k) {
      return k + "=" + v;
    }), "&");
    ret = ret + "?" + s;
  }
  return ret;
};

Jailbreak.ContentPage.prototype.reset = function() {
  this.name = null; // "posts" or "post" or "page" or "archive"
  this.path = null; // URL on Wordpress to find an example of that archetype (name)
  this.data = null; // the structured data (from Generator) used ot render the page
  this.html = null; // the HTML representation of the data, from that the URL path
};

Jailbreak.ContentPage.prototype.loadFromJson = function(json, contentMap) {
  this.reset();
  if (typeof json.path != "undefined") {
    this.path = json.path;
  }
  if (typeof json.name != "undefined") {
    this.name = json.name;
  }
    if (typeof json.data != "undefined") {
    this.data= json;
  }
};

