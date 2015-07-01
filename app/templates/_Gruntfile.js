var _ = require('lodash');

var modernizrConfig = {
    // @see https://github.com/Modernizr/grunt-modernizr#config-options
    dist: {
        // [REQUIRED] Path to the build you're using for development.
        "devFile" : '<%= publicDir %>/assets/js/src/modernizr.js',
        
        // Path to save out the built file.
        "outputFile" : '<%= publicDir %>/assets/js/dist/modernizr.js',
        
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
            "src": ['<%= publicDir %>/assets/css/**', '<%= publicDir %>/assets/js/src/**']
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
    modernizr: {
        options: {
            message: 'Modernizr compliled and process complete'
        }
    }
};
    
var jamConfig = {
    // Add vendor prefixed styles
    postcss: {
        options: {
            map: false, // inline sourcemaps
            processors: [
		        require('autoprefixer-core')({browsers: 'last 2 versions'}), // add vendor prefixes
				//require('cssnano')() // minify the result
		    ]
        },
        multiple_files: {
            expand: true,
            flatten: true,
            src: '<%= publicDir %>/assets/css/*.css',
            dest: '<%= publicDir %>/assets/css/'
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
                basePath: '<%= publicDir %>/assets/',
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
                basePath: '<%= publicDir %>/assets/',
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
            files: ['<%= publicDir %>/assets/css/sass/**/*.scss'],
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
                '<%= publicDir %>/assets/js/{,*/}*.js',
                '<%= publicDir %>/assets/css/{,*/}*.css',
                '<%= publicDir %>/assets/css/{,*/}*.scss',
                '<%= publicDir %>/assets/graphics/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
            ]
        },
    },
    
    // Image minification
    imagemin: {
        dynamic: {
            files: [{
                expand: true,
                cwd: '<%= publicDir %>/assets/graphics/',
                src: ['**/*.{png,jpg,jpeg,svg}'],
                dest: '<%= publicDir %>/assets/graphics/'
            }]
        }
    },
    
    <% if(tingPngApiKey) { %>
    tinypng: {
        options: {
            apiKey: "<%= tingPngApiKey %>",
            checkSigs: true,
            sigFile: 'file_sigs.json',
            summarize: true,
            showProgress: true,
            stopOnImageError: false
        },
        compress: {
            expand: true,
            cwd: '<%= publicDir %>/assets/graphics/',
            src: ['**/*.{png,jpg,jpeg}'],
            dest: '<%= publicDir %>/assets/graphics/'
        }
    },
    <% } %>
    
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
          '<%= publicDir %>/assets/css/*.css'
        ]
    }
};

var ProjectTasks = function (grunt) {
    var npmTasks = ['grunt-modernizr', 'grunt-shell', 'grunt-notify'],
        infoTasks = [],
        devTasks = [],
        buildTasks = [],
        config = {
            pkg: grunt.file.readJSON('package.json'),
            globalConfig: {
                public_folder: '<%= publicDir %>',
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
    grunt.initConfig(_.extend(config, shellConfig, jamConfig));
    
    
    /*** Shell Task ***/
    infoTasks.push('shell:start');
    
    
    /*** Jam Packages and Tasks ***/
    var jamPkgs = [
        'grunt-contrib-watch',
        'grunt-postcss',
        'grunt-contrib-compass',
        'grunt-contrib-imagemin',<% if(tingPngApiKey) { %>
        'grunt-tinypng',<% } %>
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
        'postcss',
        'newer:imagemin',<% if(tingPngApiKey) { %>
        'tinypng',<% } %>
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