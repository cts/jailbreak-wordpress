if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}

Jailbreak.WordpressTemplator = function(options) {
  var wordPressBase = options.wordPressBase; // The URL of the base Wordpress install
};

_.extend(Jailbreak.WordpressTemplator.prototype, Jailbreak.Templator, {

  /**
   * Options:
   *  page - a ContentPage (e.g., specifies is this the list of posts page, a page template, etc)
   *  data - a JSON blob
   *
   * Returns via callback:
   *  raw html or null if error
   */
  render: function(options, callback) {
    // Load the page into the DOM, then load the CTS library and the CTS sheet

    var page = options.page; // ContentPage
    var data = options.data;

    // Given the page objec, figure out the URL on the blog to hit and the
    // theme to hit.

    // DOMAIN + page.path ? theme= page.theme (look in the obj to find real paths)

    // Do a HTTP POST with the DATA to that URL and then call callback(response)

    // Think of this as the return statement 
    callback(html);
  }


});




