module.exports = function (grunt) {
  'use strict';

  var path = require('path');

  var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        files: {
          './public/stylesheets/default.css': './app/assets/stylesheets/default.scss',
          './public/stylesheets/ie.css': './app/assets/stylesheets/ie.scss'
        }
      },
      dev: {
        options: {
          style: 'expanded',
          lineNumbers: true
        },
        files: {
          './public/stylesheets/default.css': './app/assets/stylesheets/default.scss',
          './public/stylesheets/ie.css': './app/assets/stylesheets/ie.scss'
        }
      }
    },
    uglify: {
      options: {
        banner: '//<%= pkg.name %> : <%= pkg.version %> : <%= grunt.template.today("yyyy-mm-dd") %>' + "\n"
      },
      target: {
        files: {
          'public/javascripts/yamok.js': ['app/assets/javascripts/**/*.js']
        }
      }
    },
    watch: {
      jade: {
        files: 'views/*.jade'
      },
      html: {
        files: 'public/*.html'
      },
      script: {
        files: 'app/assets/javascripts/**/*.js',
        tasks: ['uglify']
      },
      style: {
        files: 'app/assets/stylesheets/**/*.scss',
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('run', ['watch',]);
  grunt.registerTask('precomp', ['sass', 'uglify']);

};
