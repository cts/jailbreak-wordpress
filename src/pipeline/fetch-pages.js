
/*
 * Walks every URL in the contentmap and scrapes it.
 */
Jailbreak.Pipeline.FetchPages = function(theme, opts) {
  this.name = "Fetch Pages";
  this.self = this;
};

Jailbreak.Pipeline.FetchPages.prototype.run = function(theme, pipeline) {

  var domain = theme.contentMap.domain;
  var paths = [];
  var self = this;
//comment
  for (var i = 0; i < theme.contentMap.pages.length; i++) {
    var pageName = theme.contentMap.pages[i].name;
    var path = theme.contentMap.pages[i].getPath();
    paths.push(path);
    Jailbreak.Pipeline.log(self, "Scraping " + pageName + ": " + path);
  }

  var util = require('util');
  var url2 = require('url');
  var httpAgent = require('http-agent');
  var jsdom = require('jsdom').jsdom;
  var agent = httpAgent.create(domain, paths);

  var count = 0;
  agent.addListener('next', function (e, agent) {
     if (e) {
       Jailbreak.Pipeline.log(self, 'error: ' + e);
       pipeline.advance(self, theme, {success:false});
     } else {
      theme.data.sources[theme.contentMap.pages[count].name] = agent.body;
      //console.log("theme.data.sources set with length",
      //            theme.data.sources[theme.contentMap.pages[count].name].length,
      //            agent.body.length);
      count++;
      agent.next();
     }
  });
  
  agent.addListener('stop', function (err, agent) {
   Jailbreak.Pipeline.log(self, "Successfully scraped " + pageName + "(domain: " + domain + " path: " + path);
   pipeline.advance(self, theme, { success: true });
  });

  // Start the agent
  agent.start();
};
