/**
 * Grunt Buildfile for Jailbreak Wordpress
 *
 * To be used with GruntJS <http://gruntjs.com/>
 */
module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: "<json:package.json>",
    meta: {
      banner: "/**\n" +
              "* <%= pkg.name %>\n" +
              " * <%= pkg.description %>\n" +
              " *\n" +
              " * @author Ted Benson and Sarah Scodel\n" +
              " * @copyright MIT CSAIL Haystack Group <%= grunt.template.today('yyyy') %>\n" +
              " * @license <%= pkg.licenses[0].type %> <<%= pkg.licenses[0].url %>>\n" +
              " * @link <%= pkg.homepage %>\n" +
              " * @module <%= pkg.name %>\n" +
              " * @version <%= pkg.version %>\n" +
              " */\n"
    },
    concat: {
      jailbreak: {
        src : [
          "<banner>",
          "src/fragments/prefix._js",
          "src/model/theme.js",
          "src/model/contentpage.js",
          "src/model/contentmap.js",
          "src/pipeline/pipeline-init.js",
          "src/pipeline/fetch-pages.js",
          "src/pipeline/fetch-assets.js",
          "src/pipeline/fix-assets.js",
          "src/pipeline/annotate-dom.js",
          "src/pipeline/output-files.js",
          "src/pipeline/pipeline.js",
          "src/fragments/postfix._js",
          "src/jailbreak-wordpress.js"
        ],
        dest : "release/jailbreak-wordpress.js"
      },
      scraper: {
        src: [
          "src/fragments/prefix._js",
          "src/scraper/wordpress.js",
          "src/fragments/postfix._js",
          "src/scrape-themes.js"
        ],
        dest: "release/scrape-themes.js"
      },
      singleurl: {
        src : [
          "<banner>",
          "src/fragments/prefix._js",
          "src/model/theme.js",
          "src/model/contentpage.js",
          "src/model/contentmap.js",
          "src/pipeline/pipeline-init.js",
          "src/pipeline/fetch-pages.js",
          "src/pipeline/fetch-assets.js",
          "src/pipeline/fix-assets.js",
          "src/pipeline/annotate-dom.js",
          "src/pipeline/output-files.js",
          "src/pipeline/pipeline.js",
          "src/fragments/postfix._js",
          "src/scrape-url.js"
        ],
        dest : "release/scrape-url.js"
      }
    },
    jshint: {
      files: ['grunt.js', 'src/**/*.js']
    },
    qunit: {
      files: [
        "test/index.html"
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['jshint', 'concat']);
};
