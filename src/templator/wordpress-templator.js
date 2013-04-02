if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}

Jailbreak.WordpressTemplator = function(options) {

};

_.extend(Jailbreak.WordpressTemplator.prototype, Jailbreak.Templator, {

  /**
   * Options:
   *  page - a ContentPage
   *  data - a JSON blob
   *  cts  - the string contents of a CTS sheet
   *
   * Returns via callback:
   *  raw html or null if error
   */
  render: function(options, callback) {
    // Load the page into the DOM, then load the CTS library and the CTS sheet
    var page = options.page; // ContentPage
    var data = options.data;

    // TODO(eob): Make this actually get pulled from the Wordpress install live.
    return "";
  }


});




