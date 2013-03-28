if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
};

Jailbreak.CtsTemplator = function(options) {

};

_.extend(Jailbreak.CtsTemplator.Prototype, Jailbreak.Templator, {

  /**
   * Args:
   *  page - a ContentPage
   *  data - a JSON blob
   *
   * Returns:
   *  raw html
   */
  render: function(page, data) {
    return "";
  }

});




