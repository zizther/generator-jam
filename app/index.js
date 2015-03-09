'use strict';
var util = require('util'),
    _ = require('lodash'),
    mkdirp = require('mkdirp'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    yosay = require('yosay'),
    fs = require('fs'),
    
    IE8 = 'IE 8',
    IE9 = 'IE 9';

module.exports = generators.Base.extend({
    initializing: function () {
        this.pkg = require('../package.json');
    },

    prompting: function () {
        var done = this.async(),
            self = this;
            
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the wonderful ' + chalk.red('Jam') + ' generator!'
        ));

        var prompts = [
            {
                type: 'input',
                name: 'name',
                message: 'Project name',
                validate: function (val) {
                    return val !== '';
                },
                default : this.appname // Default to current folder name
            },
            {
                type: 'input',
                name: 'publicPath',
                message: 'Public directory path (e.g.: . | public | public_html) - Don\'t include any slashes',
                validate: function (val) {
                    return val !== '';
                },
                default: 'public_html',
                store: true
            },
            {
                type: 'input',
                name: 'tinyPngAPIKey',
                message: 'Tiny PNG API Key',
                default: false,
                store: true
            },
            {
                type: 'list',
                name: 'minIeVersionSupport',
                message: 'Minimum IE version support?',
                choices: [IE8, IE9]
            }
        ];


        this.prompt(prompts, function (answers) {
            var features = answers.features;
    
            function hasFeature(feat) {
                return features && features.indexOf(feat) !== -1;
            }
    
            //this.name = hasFeature('name'); // boolean
    
            this.name = answers.name;
            this.publicPath = answers.publicPath;
            this.tinyPngAPIKey = answers.tinyPngAPIKey;
            this.minIeVersionSupport = answers.minIeVersionSupport;
    
            done();
        }.bind(this));
    },

    packageJSON: function () {
        this.template('_package.json', 'package.json');
    },
    bower: function () {
        this.template('_bower.json', 'bower.json');
    },
    bowerRc: function () {
        this.template('_bowerrc', '.bowerrc');
    },
    git: function () {
        this.copy('gitignore', '.gitignore');
    },
    readMe: function () {
        this.copy('gitignore', '.gitignore');
    },
    editorConfig: function () {
        this.copy('editorconfig', '.editorconfig');
    },
    gruntfile: function () {
        this.template('Gruntfile.js');
    },

    /*
    end: function () {
        this.installDependencies({
            callback: function () {
                var opts = this.userOptions,
                    base = this.dest._base();

                // Fetch and copy Maido Js to lib folder
                if (opts.useMaidoJs)
                    copyBowerFiles.call(this, 'maidojs/src', jsLibDir);

                // Fetch and copy Jam to public
                if (opts.useJam)
                    copyBowerFiles.call(this, 'jam', publicDir, excludeJamFiles);

                if (opts.useRequireJs){
                    fs.unlinkSync(base + '/' + jsSrcDir + '/app/view/page/_view.js');

                    // Update bower component paths in main.js config
                    this.spawnCommand('grunt', ['bower-requirejs']);
                }

                copyModernizrToSrc.call(this);

                // Get php framework
                fetchPhpFramework.call(this, opts.phpFramework, opts.phpFrameworkVersion, function () {
                    // Overwrite .gitignore with our version
                    fs.rename(base + '/gitignore', base + '/.gitignore');
                });

            }.bind(this)
        });
    }
    */

    install: function () {
        this.installDependencies({
            skipInstall: this.options['skip-install']
        });
    }
});
