jailbreak-wordpress
===================

Free the themes!

Running
-------

To run the pipeline, simply execute:

    ./bin/jailbreak-wordpress <WorkspaceName> <ThemeName> <ContentMapFile>

This will perform the following actions:

1. Create the directory `<WorkspaceName>/<ThemeName>` 
2. Create a theme bundle, `<ThemeName>.json`, in that directory if it doesn't already exist. This file stores all state related to scraping and converting this theme.
3. Execute each stage of the pipeline, in the order found in `src/pipeline/pipeline.js`.
   * The theme bundle is saved automatically after each stage in the pipeline
   * The pipeline aborts if a stage fails.
   * The final stage in the pipeline will output a CTS-powered Mockup theme.

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

1. **Fetch Pages**: Download the HTML content of all pages in the Content Map.
2. **Fetch Assets**: Walk through the DOM of each page downloaded and download any required assets.

Development Toolchain
---------------------

1. Node.js and NPM
2. [PhantomJS](http://phantomjs.org/) (make sure `phantomjs` binary is in your `$PATH`)
3. [PhantomJS-Node](https://github.com/sgentle/phantomjs-node) to script PhantomJS from Node


Various Steps in the Toolchain
------------------------------


