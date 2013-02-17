/*
 * Walks every URL in the contentmap and scrapes it.
 */
Jailbreak.Pipeline.FetchPages = function(theme, opts) {
  this.name = "Fetch Pages";
};

Jailbreak.Pipeline.FetchPages.prototype.run = function(theme) {
  var names =[];
  var index = theme.contentMap.domain.indexOf('//');
  var website;
  if (index!=-1) {
    website = theme.contentMap.domain.substring(index+2);
  } else {
    website = theme.contentMap.domain;
  }
  for (var i = 0; i < theme.contentMap.pages.length; i++) {
    var name = theme.contentMap.pages[i].name;
    var url = theme.contentMap.pages[i].url;
    names.push(name);
    Jailbreak.Pipeline.log(this, "Scraping " + name + ": " + url);
    // TODO(sscodel): scrape page HTML, put it in theme object.
  }

  // Return a status object
  // TODO(sscodel): possibly return error if the scrape fails
  // error -> false success value and a message explaining error

  var util = require('util');
  var url2 = require('url');
  var httpAgent = require('http-agent');
  var jsdom = require('jsdom').jsdom;
  var agent = httpAgent.create(website, names);
  
  var htmlSources = [];

  count = 0;
  agent.addListener('next', function (e, agent) {
     if (e) {
       Jailbreak.Pipeline.log(this, 'error: '+ e);
       return {success:false};
     }
    //Not sure what the mapping should be
    theme.data.sources[theme.contentMap.pages[count].name]=agent.body;
  
    count++;
    agent.next();
  });
  
  agent.addListener('stop', function (err, agent) {
    // Jailbreak.Pipeline.log(this, "length im middle: " + theme.data.sources.post);
    //Jailbreak.Pipeline.log(this, "length im middle: " + theme.data.sources.index);
});
  
  // Start the agent
  agent.start();
  
  return { success: true };
};