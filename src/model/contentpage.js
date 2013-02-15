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
  this.url = null;
};

Jailbreak.ContentPage.prototype.loadFromJson = function(json, contentMap) {
  this.reset();
  if ((typeof json.path != "undefined") && (contentMap.domain !== null)) {
    this.url = contentMap.domain + json.path;
  }
  if (typeof json.name != "undefined") {
    this.name = json.name;
  }
};

