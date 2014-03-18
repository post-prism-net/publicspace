module.exports = function(grunt){

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
          options: {
            separator: ';',
          },
          dist: {
            src: ['client/src/jquery.js','client/src/socket.io.min.js','client/src/publicspace-app.js'],
            dest: 'client/publicspace-client.js',
          },
        },

        less: {
          development: {
            files: {
              'client/publicspace.css': 'client/publicspace.less'
            }
          }
        },

        autoprefixer: {
            style: {
              src: 'client/publicspace.css',
              dest: 'client/publicspace.css'
            }
        },

        uglify: {
          client: {
            files: {
              'client/publicspace-client.js': ['client/src/*.js']
            }
          }
        },

        watch: {
          css: {
            files: ['client/*.less'],
            tasks: ['buildcss']
          },
          js: {
            files: ['client/src/*.js'],
            tasks: ['buildjs']
          }
        },

        ftpush: {
          production: { 
            auth: {
                  host: '192.168.1.23',
                  port: 21,
                  authKey: 'key1'
              },
              src: '',
              dest: '/usr/share/nginx/www/publicspace',
              exclusions: ['**/.DS_Store', '**/Thumbs.db', 'node_modules', '**/.ftppass'],
              keep: ['**/node_modules'],
              simple: false,
              useList: false
            }
        }


    });

  grunt.registerTask( 'default', ['build'] );

  grunt.registerTask( 'deploy',  ['ftpush:production'] );
  
  grunt.registerTask( 'buildcss', ['less', 'autoprefixer'] );
  grunt.registerTask( 'buildjs', ['concat'] );
  grunt.registerTask( 'build',  ['buildjs', 'buildcss'] );
};