module.exports = function (grunt) {
  grunt.initConfig({
    puglint: {
      taskName: {
        src: ['**/*.jade']
      }
    },
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 100,
          syncImport: true,
          strictImports: true
        },
        files: [{
          expand: true,     // Enable dynamic expansion.
          cwd: 'less/',      // Src matches are relative to this path.
          src: ['*.less'], // Actual pattern(s) to match.
          dest: 'css/',   // Destination path prefix.
          ext: '.min.css'   // Dest filepaths will have this extension.
        }]
      }
    },
    jade: {
      compile: {
        options: {
          pretty: false
        },
        files: [{
          expand: true,     // Enable dynamic expansion.
          cwd: 'jade/',      // Src matches are relative to this path.
          src: ['*.jade'], // Actual pattern(s) to match.
          dest: '',   // Destination path prefix.
          ext: '.html'   // Dest filepaths will have this extension.
        }]
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: [{
          expand: true,     // Enable dynamic expansion.
          cwd: 'js/',      // Src matches are relative to this path.
          src: ['*.js', '!*.min.js'], // Actual pattern(s) to match.
          dest: 'js/',   // Destination path prefix.
          ext: '.min.js',   // Dest filepaths will have this extension.
          extDot: 'first'   // Extensions in filenames begin after the first dot
        }]
      }
    },
    copy: {
      sites: {
        expand: true,
        src: ['assets/*', '*.html', '*.zip'],
        dest: '/Users/Consalvo/Sites/'
      }
    },
    watch: {
      jade: {
        files: ['jade/**/*.jade', 'css/**/*.css', 'js/**/*.min.js'], // which files to watch
        tasks: ['jade', 'copy'],
        options: {
          nospawn: true
        }
      },
      less: {
        files: ['less/**/*.less'], // which files to watch
        tasks: ['less', 'jade', 'copy'],
        options: {
          nospawn: true
        }
      },
      uglify: {
        files: ['js/**/*.js', '!js/**/*.min.js'],
        tasks: ['uglify', 'jade', 'copy'],
        options: {
          nospawn: true
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-jade')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', ['uglify', 'less', 'jade', 'copy', 'watch'])
  grunt.registerTask('build', ['uglify', 'less', 'jade', 'copy'])
}
