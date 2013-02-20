var phantom = require('phantom');

// ***
// *** Adapted from the render_multi_url example on the Phantom repo
// ***

/**
 * Render a given url to a given file.
 * (From render_multi_url example)
 * @param url URL to render
 * @param file File to render to
 * @param callback Callback function
 */
function renderUrlToFile(url, file, browser, callback) {
  console.log("rendering", url);
  browser.createPage(function(page) {
    page.viewportSize = { width: 1024, height : 768 };
    //page.settings.userAgent = "Phantom.js bot";
    page.open(url, function(status){
      if ( status !== "success") {
        console.log("Unable to render '"+url+"'");
      } else {
        page.render(file);
      }
      callback(url, file);
    });
  });
}

/**
 * MAIN()
 */

var arrayOfUrls;
if ( process.argv.length > 2 ) {
  arrayOfUrls = Array.prototype.slice.call(process.argv, 2);
} else {
    // Default (no args passed)
    console.log("Usage: node render_multi_url.js [url1, url2, ...]");
    arrayOfUrls = [
      'http://people.csail.mit.edu/karger',
      'http://people.csail.mit.edu/madden',
      'http://people.csail.mit.edu/rcm',
    ];
}

var rendered = 0;

phantom.create(function(browser) {
  for (var index = 0; index < arrayOfUrls.length; index++) {
    var url = arrayOfUrls[index];
    var file = url.replace(/\//g, ';') + ".pdf";
    renderUrlToFile(url, file, browser, function(url, file) {
      rendered++;
      console.log("Rendered", url, "to", file);
      if (rendered === arrayOfUrls.length-1) {
      }
    });
  }
});


// This is an interesting pattern below for how to exec js inside a page
//function randomJsFunction() {
//  return document.title;
//}
//
//phantom.create(function(browser) {
//  browser.createPage(function(page) {
//    page.open(url, function(httpStatus) {
//      console.log("Opened", url, "with status", httpStatus);
//      page.evaluate(randomJsFunction, function(result) {
//        console.log("Page title is", result);
//        browser.exit();
//      });
//    });
//  });
//});
//  
