/**
 * Takes a theme object with assets already fetched and re-writes
 * the HTML so that it references local project structure.
 */

Jailbreak.Pipeline.Pipeline = function() {
  this.name = "Pipeline";
  this.stages = [
    new Jailbreak.Pipeline.FetchPages(),
    new Jailbreak.Pipeline.FetchAssets()
  ];
};

Jailbreak.Pipeline.Pipeline.prototype.run = function(theme) {
  var looksGood = true;
  for (var i = 0; (looksGood && (i < this.stages.length)); i++) {
    Jailbreak.Pipeline.log(this, "Running Stage: " + this.stages[i].name);
    var result = this.stages[i].run(theme);
    looksGood = looksGood && result.success;
    theme.data.pipelineStatus[this.stages[i].name] = result;
    theme.saveToFile();
  }
};
