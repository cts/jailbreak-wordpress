if (typeof Jailbreak == "undefined") {
  Jailbreak = {};
}

Jailbreak.CtsTemplator = function(theme) {
  this.theme = theme;
};

_.extend(Jailbreak.CtsTemplator.Prototype, Jailbreak.Templator, {

  /**
   * Args:
   *  page - a ContentPage
   *  data - a JSON blob
   *  cts  - the string contents of a CTS sheet
   *
   * Returns via callback:
   *  raw html or null if error
   */
  render: function(options, callback) {
    var page = options.page;
    var data = options.data;
    var cts = options.cts;
    // Load the page into the DOM, then load the CTS library and the CTS sheet
    var jsdom = require('jsdom');
    jsdom.env({
      html: page.html,
      src: [jquery, ctsjs],
      done: function(err, window) {
        if (errors !== null) {
          console.log("Error");
          callback(null);
        } else {
          // Attach the data to the window
          _.extend(window, data);
          
          // Create a CTS engine
          var engine = new window.CTS.Engine();

          // Load up the CTS rules
          engine.ingestRules(cts);

          // Register Callback
          var cb = function() {
            var html = window.document.all[0].innerHTML;
            callback(html);
          };

          engine.on('FsmEntered:Rendered', cb);

          // Render the engine
          engine.render();
        }
      }
    });
  }
});

