/*!
 *        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *                    Version 2, December 2004
 *
 * Copyright (C) 2014 Richard & Markus
 *
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 *            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 *  0. You just DO WHAT THE FUCK YOU WANT TO.
 */

/**
 * Small fun project for our “Client-Side Web Engineering” lecture at the FH Salzburg.
 *
 * @author Richard Fussenegger <rfussenegger.mmt-m2012@fh-salzburg.ac.at>
 * @author Markus Deutschl <mdeutschl.mmt-m2012@fh-salzburg.ac.at>
 * @license WTFPL-2.0
 * @copyright (c) 2014 Richard & Markus
 * @version 20140205
 */
module.exports = function (grunt) {

  grunt.initConfig({
    pkg     : grunt.file.readJSON("package.json"),

    // SVG tasks
    svgmin: {
      dist: {
        files: [{
            expand: true,
            cwd: "src/svg/",
            src: [ "*.svg" ],
            dest: "build/",
            ext: ".svg"
        }]
      }
    },

    // CSS tasks
    less    : {
      production: {
        files   : { "build/main.css": "src/main.less" }
      }
    },
    recess : {
      dist: {
        src     : [ "build/main.css" ],
        options : { noIDs: false, noOverqualifying: false }
      }
    },
    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      minify: {
        files: {
          "build/min.css": [ "vendor/normalize-css/normalize.css", "build/main.css" ]
        }
      }
    },

    // JS tasks
    jshint  : {
      all: [ "Gruntfile.js", "src/main.js" ]
    },
    yuidoc: {
      compile: {
        name        : "<%= pkg.name %>",
        description : "<%= pkg.description %>",
        version     : "<%= pkg.version %>",
        url         : "<%= pkg.repository.url %>",
        options     : {
          paths  : "src/",
          outdir : "doc/"
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          "build/min.js"       : [ "src/main.js" ],
          "build/classList.js" : [ "vendor/classList.js/classList.js" ]
        }
      }
    },

    // HTML tasks
    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes : true,
          collapseWhitespace        : true,
          removeAttributeQuotes     : true,
          removeComments            : true,
          removeEmptyAttributes     : true,
          removeOptionalTags        : true,
          removeRedundantAttributes : true,
          useShortDoctype           : true
        },
        files: { "index.html": "index.html" }
      }
    }

  });

  for (var task in grunt.config.get("pkg.devDependencies")) {
    if (task.substr(0, 6) === "grunt-") {
      grunt.loadNpmTasks(task);
    }
  }

  // Custom task that puts all together into a single HTML file.
  grunt.registerTask("build", "Combine everything in the build directory into single HTML file.", function () {
    // Helper function that returns a base64 encoded SVG string to direct inclusion.
    var base64 = function (filename) {
      return "data:image/svg+xml;base64," + fs.readFileSync("build/" + filename).toString("base64");
    };

    // Load the nodejs FileSystem module.
    var fs = require("fs");

    // Create config with base64 encoded SVGs.
    var config = grunt.file.readJSON("src/config.json");
    for (var k in config.img) {
      config.img[k] = base64(config.img[k]);
    }
    for (var i = 0; i < config.player.length; ++i) {
      config.player[i] = base64(config.player[i]);
    }
    fs.writeFileSync("build/config.json", JSON.stringify(config), { encoding: "utf-8" });

    // Create HTML file with SVGs, CSS, and JS directly embedded.
    fs.writeFileSync("index.html", fs.readFileSync("src/main.html", { encoding: "utf-8" }).replace(/####([a-z\.]*)####/gi, function (match, p1) {
      if (p1.substr(-3) === "svg") {
        return base64(p1);
      }
      return fs.readFileSync("build/" + p1, { encoding: "utf-8" });
    }), { encoding: "utf-8" });

    // Remove the complete build directory and all of its content.
    require("rimraf").sync("build");
  });

  grunt.registerTask("default", [ "svgmin", "less", "recess", "cssmin", "jshint", "yuidoc", "uglify", "build", "htmlmin" ]);

};
