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
    if (key==="repeats") {
       var repeatList = attr;
       for (var i = 0; i < repeatList.length; i++) {
         var repeat = repeatList[i];
         rule += "." + repeat.name + " { \n";
         rule+="  repeat: " + repeat.name + "\n";
         rule+= "  repeat-offset: " + repeat.offset + "\n";
         rule+= "  repeat-step: " + repeat.step + "\n";
         rule += "}" + "\n";
         for (var g=0; g < repeat.content.length; g++) {
            rule += "." + repeat.name + " ." + repeat.content[g] + " { \n";
            rule += "  value: " + repeat.content[g] + "\n";
            rule += "} \n";
         }
       }
    } else if (attr==="innerHTML") {
      rule = "." + key + " { \n";
      rule+= "  value: " + key + " \n";
      rule += "} \n";
    } else if (attr) {
      rule = "." + key + " { \n";
      rule += "  value(@" + attr+ "): " + key +" \n";
      rule+= "} \n";
    }
    console.log("adding rule: " + rule);
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
      _.each(obj, function(val, name) {
        data+=ctsString(name, val);
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
