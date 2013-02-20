/*
 * Outputs the files from the theme object at the very end
 */
Jailbreak.Pipeline.OutputFiles = function(theme, opts) {
  this.name = "Output Files";
  this.self = this;
};

Jailbreak.Pipeline.OutputFiles.prototype.run = function(theme, pipeline) {
  var self = this;

  /*
   * Source Files
   */
 pipeline.printTheme(theme);
 var sourceDirectory = path.join(theme.directory, "sources");
  if (! fs.existsSync(sourceDirectory)) {
    fs.mkdirSync(sourceDirectory);
  }
  _.each(theme.data.sources, function(html, name) {
    Jailbreak.Pipeline.log(self, "Writing sources/" + name + ".html");
    try {
      var filename = path.join(sourceDirectory, name + ".html");
      fs.writeFileSync(filename, html, "utf8");
    } catch (e) {
      console.log("Could not write file", filename, e);
    }
  });

  // TODO(eob): Write all other assets.

  pipeline.advance(self, theme, { success: true });
};
