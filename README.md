jailbreak-wordpress
===================

Free the themes!

Running
-------

To run the pipeline, simply execute:

    ./bin/jailbreak-wordpress <WorkspaceName> <ThemeName> <ContentMapFile>

You may have to `chmod +x ./bin/jailbreak-wordpress`

This will perform the following actions:

1. Create the directory `<WorkspaceName>/<ThemeName>` 
2. Create a theme bundle, `<ThemeName>.json`, in that directory if it doesn't already exist. This file stores all state related to scraping and converting this theme.
3. Execute each stage of the pipeline, in the order found in `src/pipeline/pipeline.js`.
   * The theme bundle is saved automatically after each stage in the pipeline
   * The pipeline aborts if a stage fails.
   * The final stage in the pipeline will output a CTS-powered Mockup theme.

Example Run
-----------

Run this from the project root

    ./bin/jailbreak-wordpress workspace TestTheme ./content-maps/testmap.json

You should get the following output:

    [Theme] Initializing: TestTheme
    [Pipeline] Running Stage: Fetch Pages
    [Fetch Pages] Scraping index: http://blog.flickr.net/en
    [Fetch Pages] Scraping post: http://blog.flickr.net/en/2013/02/14/18-year-old-prodigy-photographer/
    [Pipeline] Running Stage: Fetch Assets

When it is done, you shold have the following directory structure:

    ./workspace
      - TestTheme
        - TestTheme.json

And `TestTheme.json` will include the results of the pipeline run.

Theme Bundle
------------

The theme bundle that stores all state related to the theme conversion process
is simply a JSON object called `data` in the Theme object defined in
`model/theme.js`. All inputs for each stage in the pipeline should be read from
this `data` field and all outputs should be written to it. This ensures that
the pipeline can be stopped and restarted when we scale up.

Pipeline
--------

The stages of the pipeline are:

1. **[Fetch Pages](https://github.com/cts/jailbreak-wordpress/blob/master/src/pipeline/fetch-pages.js)**: Download the HTML content of all pages in the Content Map.
2. **[Fetch Assets](https://github.com/cts/jailbreak-wordpress/blob/master/src/pipeline/fetch-assets.js)**: Walk through the DOM of each page downloaded and download any required assets (img, src, js) so that we may bundle them locally with the theme.
3. **[Fix Assets](https://github.com/cts/jailbreak-wordpress/blob/master/src/pipeline/fix-assets.js)**: Rewrites the source HTML so that all linked asset URLs (img, src, js) point at a local directory structure we will create.
4. **Magic Occurs**: todo
5. **Export Mockup**: In `<WorkspaceName>/<ThemeName>`, create a `mockup` folder that in turn contains `img`, `css`, `cts`, `js`, etc folders. Write all assets out to files in this folder.

Development Toolchain
---------------------

*  Node.js and NPM
*  NPM Modules
   * Optimist

