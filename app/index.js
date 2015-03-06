'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

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
            'Welcome to the wonderful' + chalk.red('Jam') + ' generator!'
        ));

        var prompts = [
            {
                type: 'input',
                name: 'appName',
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
            this.fs.copy(
                this.templatePath('jshintrc'),
                this.destinationPath('.jshintrc')
            );
        }
    },

    install: function () {
        this.installDependencies({
            skipInstall: this.options['skip-install']
        });
    }
});
