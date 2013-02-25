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

Jailbreak.ContentPage.prototype.reset = function() {
  this.name = null;
  this.path = null;
  this.data = null;
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
    this.data= json.data;
  }
};

