/**
 * Takes a theme object with assets already fetched and re-writes
 * the HTML so that it references local project structure.
 */

Jailbreak.Pipeline.FixAssets = function(theme, opts) {
  this.name = "Fix Assets";
};

Jailbreak.Pipeline.FixAssets.prototype.run = function(theme, pipeline) {
var print = function() {
   Jailbreak.Pipeline.log(self,  "see this at end");
       for (var key in theme.data.stylesheets) {
          if(theme.data.stylesheets.hasOwnProperty(key)){
           Jailbreak.Pipeline.log(self, key);
            }
           }
          };
print();
pipeline.advance(this, theme, { success: true });
};
