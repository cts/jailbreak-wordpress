/**
 * Grunt Buildfile for Jailbreak Wordpress
 *
 * To be used with GruntJS <http://gruntjs.com/>
 */
module.exports = function(grunt) {
  // Project configuration.
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
      dist : {
        src : [
          "<banner>",
          "src/fragments/prefix._js",
          "src/model/theme.js",
          "src/pipeline/fetch-assets.js",
          "src/pipeline/fix-assets.js",
          "src/jailbreak-wordpress.js",
          "src/fragments/postfix._js"
        ],
        dest : "release/jailbreak-wordpress.js"
      }
    },
    lint: {
      all: ['grunt.js', 'src/**/*.js']
    },
    min: {
      "release/jailbreak-wordpress.min.js": ["<banner>", "release/jailbreak-wordpress.js"]
    },
    qunit: {
      files: [
        "test/index.html"
      ]
    },
    watch: {
      scripts: {
        files: "<config:lint.files>",
        tasks: "default"
      }
    },
    jshint: {
      options: {
        browser: true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');
};
