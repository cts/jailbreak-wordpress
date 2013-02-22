/*
 * Outputs the files from the theme object at the very end
 */
Jailbreak.Pipeline.OutputFiles = function(theme, opts) {
  this.name = "Output Files";
  this.self = this;
};

Jailbreak.Pipeline.OutputFiles.prototype.writeFiles = function(theme, files, toDir) {
 var directory = path.join(theme.directory, toDir);
  if (! fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  _.each(files, function(obj, url) {
    var data = "";
    var filename = "";

    if (typeof obj == "object") {
      filename = obj.filename;
      data = obj.date;
    } else {
      filename = url + ".html";
      data = obj;
    }

    try {
      var fullfilename = path.join(directory, filename);
      Jailbreak.Pipeline.log(this, "Writing " + fullfilename);
      fs.writeFileSync(fullfilename, data, "utf8");
    } catch (e) {
      console.log("Could not write file", fullfilename, e);
    }

  }, this);
};

Jailbreak.Pipeline.OutputFiles.prototype.run = function(theme, pipeline) {
  //pipeline.printTheme(theme);
  this.writeFiles(theme, theme.data.sources, "sources");
  this.writeFiles(theme, theme.data.fixedSources, "fixedSources");
  this.writeFiles(theme, theme.data.images, "images");
  this.writeFiles(theme, theme.data.javascripts, "javascripts");
  this.writeFiles(theme, theme.data.stylesheets, "stylesheets");
  pipeline.advance(this, theme, { success: true });
};
