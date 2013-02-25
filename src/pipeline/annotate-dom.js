/**
 * Walks through each node and attribute in the DOM of all pages in sources and, * applies the appropirate class name.
 * Saves this modified HTML (with the classes added) to this.data.mockups[name]. * in the theme object which can be used as a mockup.
 * For every class we added, keep a data structure in theme.data that records
 * we've done this and whether it was an attribute or the innerHTML. This 
*/

Jailbreak.Pipeline.AnnotateDom = function(opts) {
  this.name = "Annotate Dom";
  this.self = this;
  this.pageDataQueue = {};

};

Jailbreak.Pipeline.AnnotateDom.prototype.run = function(theme, pipeline) {
  var self = this;
  for (var i = 0; i < theme.contentMap.pages.length; i++) {
    var page = theme.contentMap.pages[i];
    var data = page.data;
    if (data) {
      for (var x=0; x < _.keys(data).length; x++ ){
        var k = _.keys(data)[x];
        theme.data.newClasses[k] = null;        
      }
     this.pageDataQueue[page.name] = data;
    }
  }
  this.queuePages(theme, pipeline);
};

Jailbreak.Pipeline.AnnotateDom.prototype.queuePages= function(theme, pipeline) {
  var self = this;

  _.each(_.clone(this.pageDataQueue), function(data, name) {
    var html = theme.data.sources[name];
    var jsdom = require('jsdom');
    jsdom.env({
      html: html,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
         console.log(errors);
        var $ = window.$;
        Jailbreak.Pipeline.log(self, "html length first: " + window.document.innerHTML.length); 

        var childNodes = $("*").filter(function(index) { 
          var isLeaf = $(this).children().length <= 1;
          return isLeaf;})
          .map(function() { 
            for (var x=0; x < _.pairs(data).length; x++ ){
              var k = _.pairs(data)[x][0];
              var v = _.pairs(data)[x][1];
               if (this.innerHTML===v) {
                 this.className = k;
                 Jailbreak.Pipeline.log(self, "found in html: " + this.innerHTML+ " className: " + this.className + ", key: " + k);
                 theme.data.newClasses[k] = "innerHTML";
               }
               for (var g=0; g <this.attributes.length; g++ ) {
                 if (this.attributes[g].value ==v) {
                 this.className =k;
                 Jailbreak.Pipeline.log(self, "found inattributes val: " + this.attributes[g].value+ " attr name: " + this.attributes[g].name + ", key: " + k + " this.className: "  + this.className);
                 theme.data.newClasses[k] = this.attributes[g].name;
                 
                 }
              } 
             }
          });

        theme.data.mockups[name] = window.document.innerHTML;

        // Now remove this name from the object
        delete self.pageDataQueue[name];

        if (_.keys(self.pageDataQueue).length === 0) {
          pipeline.advance(self, theme, {success:true});
        }
      } // done
    });
  }, this);
};