/**
 * Takes a theme object with assets already fetched and re-writes
 * the HTML so that it references local project structure.
 */

Jailbreak.Pipeline.Pipeline = function(options) {
  /*
   * TODO(jason):
   *  let user use the options variable to specify which stages to process
   */
  this.name = "Pipeline";
  this.options = options || {};
  this.stages = [
    new Jailbreak.Pipeline.FetchPages(),  // Fetches the HTML (need)
    new Jailbreak.Pipeline.FetchAssets(), // Fetches the images, javascript, css, etc (need)
    new Jailbreak.Pipeline.AnnotateDom(), // Does lightweight wrapper induction (jason: this is the one we don't need)
    new Jailbreak.Pipeline.OutputFiles()  // Writes out files (need)
  ];
};


// TODO(jason):
// You'll need to CREATE this theme object to pass in that specifies what to pull down.
Jailbreak.Pipeline.Pipeline.prototype.run = function(theme) {
  Jailbreak.Pipeline.log(this, "Running Stage: " + this.stages[0].name);
  this.stages[0].run(theme, this);
};

Jailbreak.Pipeline.Pipeline.prototype.printTheme = function(theme) {
 Jailbreak.Pipeline.log(this, "Printing keys from sources");
  for (var source in theme.data.sources) {
    if(theme.data.sources.hasOwnProperty(source)){
      Jailbreak.Pipeline.log(this, "sources file: " + source);
    }
  }
 Jailbreak.Pipeline.log(this, "Printing keys from images");
  for (var img in theme.data.images) {
    if(theme.data.images.hasOwnProperty(img)){
      Jailbreak.Pipeline.log(this, "image  file: " + img);
    }
  }
 Jailbreak.Pipeline.log(this, "Printing keys from javascripts");
  for (var j in theme.data.javascripts) {
    if(theme.data.javascripts.hasOwnProperty(j)){
      Jailbreak.Pipeline.log(this, "javascript file: " + j);
    }
  }

 Jailbreak.Pipeline.log(this, "Printing keys from stylesheets");
  for (var key in theme.data.stylesheets) {
    if(theme.data.stylesheets.hasOwnProperty(key)){
      Jailbreak.Pipeline.log(this, "stylesheet file: " + key);
    }
  }

};

Jailbreak.Pipeline.Pipeline.prototype.printData = function(data) {
 Jailbreak.Pipeline.log(this, "printing data from " + data);
 for (var key in data) {
    if (data.hasOwnProperty(key)) {
      Jailbreak.Pipeline.log(this, key);
    }
  }
};

Jailbreak.Pipeline.Pipeline.prototype.advance = function(stage, theme, result) {
  theme.data.pipelineStatus[stage.name] = result;
  theme.saveToFile();
  if (result.success) {
    var nextStage = _.indexOf(this.stages, stage) + 1;
    if (nextStage == -1) {
      Jailbreak.Pipeline.log(this, "Error: can't figure out where I am");
    } else if (nextStage < this.stages.length) {
      Jailbreak.Pipeline.log(this, "Running Stage: " + this.stages[nextStage].name);
      this.stages[nextStage].run(theme, this);
    } else {
      Jailbreak.Pipeline.log(this, "Pipeline complete");
      if (typeof this.options.onComplete == 'function') {
        this.options.onComplete();
      }
    }
  } else {
    Jailbreak.Pipeline.log(this, "Aborting pipeline because of bad result.");
  }
};
