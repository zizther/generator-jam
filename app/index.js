'use strict';
var util = require('util'),
    _ = require('lodash'),
    mkdirp = require('mkdirp'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    yosay = require('yosay'),
    fs = require('fs'),
    
    IE8 = 'IE 8',
    IE9 = 'IE 9';

module.exports = yeoman.generators.Base.extend({
    initializing: function () {
        this.pkg = require('../package.json');
    },

    prompting: function () {
        var done = this.async(),
            self = this,
            appDir = this.dest._base().split('/').pop();
            
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the wonderful ' + chalk.red('Jam') + ' generator!'
        ));

        var prompts = [
            {
                type: 'input',
                name: 'appname',
                message: 'Project name',
                validate: function (val) {
                    return val !== '';
                },
                default: function () {
                    return self._.titleize(self._.humanize(appDir));
                }
            },
            {
                type: 'input',
                name: 'publicPath',
                message: 'Public directory path (".", "public", "public_html", etc)',
                validate: function (val) {
                    return val !== '';
                },
                default: 'public_html'
            },
            {
                type: 'input',
                name: 'tinyPngAPIKey',
                message: 'Tiny PNG API Key',
                default: false
            },
            {
                type: 'list',
                name: 'minIeVersionSupport',
                message: 'Minimum IE version support?',
                choices: [IE8, IE9]
            }
        ];


        this.prompt(prompts, function (props) {
            this.someOption = props.someOption;

            done();
        }.bind(this));
    },

    writing: {       
        app: function () {
            this.fs.copy(
                this.templatePath('_package.json'),
                this.destinationPath('package.json')
            );
            this.fs.copy(
                this.templatePath('_bower.json'),
                this.destinationPath('bower.json')
            );
        },
    
        projectfiles: function () {
            this.fs.copy(
                this.templatePath('editorconfig'),
                this.destinationPath('.editorconfig')
            );
        }
    },
    
    /*
    writing: {
        git: function () {
            this.copy('gitignore', '.gitignore');
        },

        bower: function () {
            this.template('_bower.json', 'bower.json', this.userOptions);
            this.template('_bowerrc', '.bowerrc', this.userOptions);
        },

        editorconfig: function () {
            this.copy('editorconfig', '.editorconfig');
        },

        gruntfile: function () {
            this.template('_Gruntfile.js', 'Gruntfile.js', this.userOptions);
        },

        readme: function () {
            this.template('readme.md', 'readme.md', this.userOptions);
        },

        packageJSON: function () {
            this.template('_package.json', 'package.json', this.userOptions);
        }
    },
    */

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
