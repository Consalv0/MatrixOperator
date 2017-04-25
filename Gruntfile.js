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
        files: {
          'css/main.css': 'less/main.less'
        }
      }
    },
    jade: {
      compile: {
        options: {
          pretty: false
        },
        files: {
          'index.html': ['jade/index.jade']
        }
      }
    },
    jade_pages: {
      compile: {
        options: {
          pretty: false
        },
        files: {
          'index.html': ['jade/index.jade']
        }
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'js/main.min.js': ['js/main.js']
        }
      }
    },
    copy: {
      main: {
        expand: true,
        src: ['assets/*', 'index.html', 'Xx-and-Os.zip'],
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

  grunt.registerTask('default', ['uglify', 'less', 'jade', 'watch'])
  grunt.registerTask('build', ['uglify', 'less', 'jade'])
}
