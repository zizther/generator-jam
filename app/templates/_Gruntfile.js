var _ = require('lodash');

var modernizrConfig = {
    // @see https://github.com/Modernizr/grunt-modernizr#config-options
    dist: {
        // [REQUIRED] Path to the build you're using for development.
        "devFile" : '<%= jsSrcDir %>/modernizr.js',
        
        // Path to save out the built file.
        "outputFile" : '<%= jsDistDir %>/modernizr.js',
        
        // Based on default settings on http://modernizr.com/download/
        "extra" : {
            shiv : true,
            printshiv : false,
            load : true,
            mq : false,
            cssclasses : true
        },
        
        // Based on default settings on http://modernizr.com/download/
        "extensibility" : {
            addtest : false,
            prefixed : false,
            teststyles : false,
            testprops : false,
            testallprops : false,
            hasevents : false,
            prefixes : false,
            domprefixes : false
        },
        // By default, source is uglified before saving
        "uglify" : true,

        // Define any tests you want to implicitly include.
        "tests" : [],
        
        // By default, this task will crawl your project for references to Modernizr tests.
        // Set to false to disable.
        "parseFiles" : true,

        // When parseFiles = true, this task will crawl all *.js, *.css, *.scss and *.sass files,
        // except files that are in node_modules/.
        // You can override this by defining a "files" array below.
        "files" : {
            "src": ['<%= publicPath %>/assets/css/**', '<%= jsSrcDir %>/**']
        },
        
        // This handler will be passed an array of all the test names passed to the Modernizr API, and will run after the API call has returned
        // "handler": function (tests) {},

        // When parseFiles = true, matchCommunityTests = true will attempt to
        // match user-contributed tests.
        "matchCommunityTests" : false,

        // Have custom Modernizr tests? Add paths to their location here.
        "customTests" : []
    }
};

var shellConfig = {
    shell: {
        start: {
            command: [
                'echo',
                'echo --------------------------------------------------',
                'echo',
                'echo Yo!',
                'echo Here is a list of the tasks avaliable to you:',
                'echo',
                'echo 1. grunt - This will perform the watch task and deal with the files as you develop.',
                'echo 2. grunt build - This is for production. It will concatinate, optimise and do other cool stuff for you.',
                'echo 3. grunt info - This will list all the avaliable options to you',
                'echo',
                'echo --------------------------------------------------',
                'echo'
            ].join('&&')
        },
        updateCanIUse: {
            command: 'npm update caniuse-db'
        }
    }
};

var notificationConfig = {
    watch: {
        options: {
            message: 'Watch build complete'
        }
    },
    jamBuild: {
        options: {
            message: 'Front-end build process complete'
        }
    },
    requireJsBuild: {
        options: {
            message: 'Require JS build process complete'
        }
    },
    modernizr: {
        options: {
            message: 'Modernizr compliled and process complete'
        }
    }
};

var jamConfig = {<% if (useJam) { %>
    // Add vendor prefixed styles
    autoprefixer: {
        options: {
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', <%= minIeVersionSupport === 'IE 8' ? "'ie 8', 'ie 9'" : "'ie 9'" %>]
        },
        multiple_files: {
            expand: true,
            flatten: true,
            src: '<%= publicPath %>/assets/css/*.css',
            dest: '<%= publicPath %>/assets/css/'
        }
    },
 
    // Compass - required for autoprefixer
    compass: {
        options: {
            sourcemap: false,
            raw: 'Sass::Script::Number.precision = 10\n'
        },
        dist: {
            options: {
                basePath: '<%= publicPath %>/assets/',
                httpPath: '../',
                environment: 'production',
                sassDir: 'css/sass',
                imagesDir: 'graphics',
                cssDir: 'css',
                boring: true,
                noLineComments: true,
                outputStyle: 'compressed'
            }
        },
        dev: {
            options: {
                basePath: '<%= publicPath %>/assets/',
                httpPath: '../',
                sassDir: 'css/sass',
                imagesDir: 'graphics',
                cssDir: 'css',
                noLineComments: true,
                outputStyle: 'nested',
            }
        },
    },

    // Watches files and folders for us
    watch: {
        // Watch to see if we change this gruntfile
        gruntfile: {
            files: ['Gruntfile.js']
        },
 
        // Compass
        compass: {
            files: ['<%= publicPath %>/assets/css/sass/**/*.scss'],
            tasks: ['compass:dev', 'autoprefixer']
        },
 
        // Livereload
        livereload: {
            options: {
                livereload: 35729
            },
            files: [
                '{,*/}*.html',
                '{,*/}*.php',
                '<%= publicPath %>/assets/js/{,*/}*.js',
                '<%= publicPath %>/assets/css/{,*/}*.css',
                '<%= publicPath %>/assets/css/{,*/}*.scss',
                '<%= publicPath %>/assets/graphics/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
            ]
        },
    },
    
    // Image minification
    imagemin: {
        dynamic: {
            files: [{
                expand: true,
                cwd: '<%= publicPath %>/assets/graphics/',
                src: ['**/*.{png,jpg,jpeg,svg}'],
                dest: '<%= publicPath %>/assets/graphics/'
            }]
        }
    },
    <%= if(tinyPngAPIKey) %>
    tinypng: {
        options: {
            apiKey: "<%= tinyPngAPIKey %>",
            checkSigs: true,
            sigFile: 'file_sigs.json',
            summarize: true,
            showProgress: true,
            stopOnImageError: false
        },
        compress: {
            expand: true,
            cwd: '<%= publicPath %>/assets/graphics/',
            src: ['**/*.{png,jpg,jpeg}'],
            dest: '<%= publicPath %>/assets/graphics/'
        }
    },
    <%= } %>
    parker: {
        options: {
            metrics: [
                "TotalRules",
                "TotalSelectors",
                "TotalIdentifiers",
                "TotalDeclarations",
                "TotalImportantKeywords",
                "TotalUniqueColours"
            ],
            file: "report.md",
            colophon: true,
            usePackage: true
        },
        src: [
          '<%= publicPath %>/assets/css/*.css'
        ]
    }<% } %>
};

var ProjectTasks = function (grunt) {
    var npmTasks = ['grunt-modernizr', 'grunt-shell', 'grunt-notify'],
        infoTasks = [],
        devTasks = [],
        buildTasks = [],
        config = {
            pkg: grunt.file.readJSON('package.json'),
            globalConfig: {
                public_folder: '<%= publicPath %>',
            },
            modernizr: modernizrConfig,
            notify_hooks: {
                options: {
                    enabled: true
                }
            },
            notify: notificationConfig
        };
    
    // Project configuration
    grunt.initConfig(_.extend(config, shellConfig, jamConfig, requireJsConfig));
    
    
    /*** Shell Task ***/
    infoTasks.push('shell:start');
    
    
    /*** Jam Packages and Tasks ***/
    var jamPkgs = [
        'grunt-contrib-watch',
        'grunt-autoprefixer',
        'grunt-contrib-compass',
        'grunt-contrib-imagemin',
        'grunt-tinypng',
        'grunt-parker',
        'grunt-newer'
    ];

    npmTasks = npmTasks.concat(jamPkgs);
    
    devTasks.push(
        'watch',
        'compass:dev',
        'notify:watch'
    );
    
    buildTasks.push(
        'compass:dist',
        'autoprefixer',
        'newer:imagemin',
        'tinypng',
        'notify:jamBuild'
    );
    

    /***
        Modernizr task
        
        - Leave modernizr to build after the requirejs stuff and other parts are done otherwise it gets overwritten.
    ***/
    // Do the modernizr task
    buildTasks.push('modernizr', 'notify:modernizr');
    
    // Load packages
    _.each(npmTasks, grunt.loadNpmTasks, grunt);

    // grunt / grunt default
    grunt.registerTask('default', _.uniq(devTasks));

    // grunt build
    grunt.registerTask('build', _.uniq(buildTasks));

    // grunt info
    grunt.registerTask('info', _.uniq(infoTasks));

};

module.exports = ProjectTasks;