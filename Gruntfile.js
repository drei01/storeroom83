/**
 * Created by dhayes on 3/29/14.
 */
module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-contrib-jade");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        jade: {
            build: {
                options: {
                    pretty: true
                },
                expand: true,
                cwd: "src",
                src: "**/*.jade",
                dest: "build",
                ext: ".html"
            }
        },
        less: {
            build: {
                files: {
                    "build/app.css": "src/app.less",
                    "build/dashboard.css": "src/dashboard.less",
                    "build/app-bootstrap.css": "src/app-bootstrap.less"
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    "dist/app.js": "<%= concat.build.dest %>"
                }
            }
        },
        concat: {
            build: {
                src: 'src/**/*.js',
                dest: 'build/app.js'
            }
        },
        copy: {
            build: {
                cwd: 'src/images',
                expand: true,
                src: '**/*',
                dest: 'build/images/'
            },
            dist: {
                cwd: 'build',
                expand: true,
                src: '**/*',
                dest: 'dist/'
            }
        },
        clean: {
            build: ['build'],
            dist: ['dist']
        },
        watch: {
            jade: {
                files: "<%= jade.build.src %>",
                tasks: "jade"
            },
            concat: {
                files: "<%= concat.build.src %>",
                tasks: "concat"
            },
            less: {
                files: "src/**/*.less",
                tasks: "less"
            }
        }
    });

    grunt.registerTask('build', ['clean:build', 'copy:build', 'jade','less','concat']);
    grunt.registerTask('default', ['build','watch']);
    grunt.registerTask('package', ['build', 'clean:dist', 'copy:dist', 'uglify']);

};