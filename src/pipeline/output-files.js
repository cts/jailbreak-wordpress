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
     // console.log("is object, filename: " + filename + " , data: " + data);
    } else {
      filename = url + ".html";
      data = obj;
      //console.log("is not object, url: " + filename);
     // console.log("is not object, filename: " + filename + " , data: " + data);
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

Jailbreak.Pipeline.OutputFiles.prototype.writeCTSSheets = function(theme, files, toDir) {
  var ctsString = function(key, attr) {
    var rule = "";
    if (attr==="innerHTML") {
      rule = "." + key + " { value: " + key + " }";
    } else if (attr) {
      rule = "." + key + " { value(@" + attr+ "): " + key + " }";
    }
    return rule;
 };
 var directory = path.join(theme.directory, toDir);
  if (! fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  _.each(files, function(obj, url) {
    var data = "";
    var filename = url + ".cts";
    try {
      var fullfilename = path.join(directory, filename);
      Jailbreak.Pipeline.log(this, "Writing " + fullfilename);
      _.each(obj, function(obj2, name) {
        var k = name;
        var v = obj2;
        var ctsRule = ctsString(k, v);
        console.log("adding rule: " + ctsRule);
        data+=ctsRule;
        data+="\n";
      }, this);
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
  this.writeFiles(theme, theme.data.mockups, "mockups");
  this.writeFiles(theme, theme.data.stylesheets, "stylesheets");
  this.writeCTSSheets(theme, theme.data.newClasses, "ctsSheets");
  pipeline.advance(this, theme, { success: true });
};
