/**
 */
Jailbreak.Pipeline.EvaluateResults = function(opts) {
  this.name = "Evaluate Results";
  this.evaluator = new Jailbreak.Evaluator();
};

Jailbreak.Pipeline.EvaluateResults.prototype.run = function(theme, pipeline) {
  var cts = new Jailbreak.CtsTemplator(theme);
  var wordpress = new Jailbreak.WordpressTemplator(theme);

  _.each(theme.data.mockups, function(html, name) {
    Jailbreak.Pipeline.log(this, theme.name + " - " + name);
    var ctsSheet = theme.data.treesheets[name];

    var data = {};
    var options = {
      page: html,
      data: data,
      cts: ctsSheet
    };

    var ctsVersion = cts.render(options);
    var wordpressVersion = wordpress.render(options);

    this.evaluator.evaluate({
      gold: wordpressVersion,
      test: ctsVersion
    });
  });
};
