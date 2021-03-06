'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var _ = require('lodash');
var _s = require('underscore.string');
var fs = require('fs');
var copy = require('recursive-copy');
var mkdirp = require('mkdirp');


var excludeJamFiles = ['.editorconfig', '.gitignore', 'LICENSE.md', 'bower.json', '.bowerrc', 'readme.md', '_.htaccess', 'gulpfile.js', 'package.json'];

// Grab a possible name for the project.
var extractModuleName = function (appname) {
  var slugged = _s.slugify(appname);

  return slugged.toLowerCase();
};

// Copy Bower files to another directory
var copyBowerFiles = function (component, to, exclude) {
    var base = this.destinationRoot(),
        publicDir = base + '/' + this.publicDir,
        publicAssetsDir = publicDir + '/assets',
        bowerComponentsDir = publicAssetsDir + '/bower_components',
        bower,
        from;

    to = (base + '/' + to || publicAssetsDir);
    from = bowerComponentsDir + '/' + component;

    var options = {
        overwrite: true,
        dot: true,
        junk: false,
        filter: function(filePath) {
            return exclude.indexOf(filePath) === -1;
        }
    };

    copy(from, to, options, function(error, results) {
        if (error) {
            console.error(component + ' copy failed: ' + error);
        }
        else {
            console.info(component + ' copy succeeded');
        }
    });
};

// Copy modernizr file to JS directory
var copyModernizrToSrc = function () {
    var base = this.destinationRoot(),
        publicDir = base + '/' + this.publicDir,
        publicAssetsDir = publicDir + '/assets',
        bowerComponentsDir = publicAssetsDir + '/bower_components',
        jsModernizrDir = publicAssetsDir + '/js/modernizr',
        from = bowerComponentsDir + '/modernizr/modernizr.js',
        to = jsModernizrDir + '/modernizr.js';

    if (!fs.existsSync(jsModernizrDir)){
        mkdirp(jsModernizrDir, function (err) {
            if (err)
                console.error(err)
            else
                console.log('Created Modernizr folder in JS directory')
        });
    }

    // Copy modernizr
    copy(from, to, function(error, results) {
        if (error) {
            console.error('Modernizr copy failed: ' + error);
        }
        else {
            console.info('Modernizr copy succeeded');
        }
    });
};

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: {
    askForModuleName: function () {
      var done = this.async(),
          self = this;;

      var moduleName = extractModuleName(this.appname);

      this.log(yosay(
        'Welcome to the ' + chalk.red('Jam') + ' generator!'
      ));

      var prompts = [{
        type: 'input',
        name: 'moduleName',
        message: 'Name of the project',
        default: moduleName,
        validate: function (val) {
          return val !== '';
        },
      }];

      this.prompt(prompts, function (props) {
        this.moduleName = props.moduleName;
        this.appname = this.moduleName;

        done();
      }.bind(this));
    },

    askPublicDir: function() {
      var done = this.async();

      var prompts = [{
        type: 'input',
        name: 'publicDir',
        message: 'Public directory name (e.g.: . | public | public_html) - Don\'t include any slashes',
        validate: function (val) {
            return val !== '';
        },
        default: 'public',
        store: true
      }];

      this.prompt(prompts, function (props) {
        this.publicDir = props.publicDir;

        done();
      }.bind(this));
    },

    askTinyPngApi: function() {
      var done = this.async();

      var prompts = [{
        type: 'confirm',
        name: 'haveTinyPngAPIKey',
        message: 'Do you have a TinyPNG API key?'
      }, {
        when: function(response) {
            return response.haveTinyPngAPIKey;
        },
        name: 'tinyPngAPIKey',
        message: 'Enter your TinyPNG API key',
        validate: function (val) {
          return val !== '';
        },
      }];

      this.prompt(prompts, function (props) {
        this.haveTinyPngAPIKey = props.haveTinyPngAPIKey;

        this.tinyPngAPIKey = props.tinyPngAPIKey;

        done();
      }.bind(this));
    },

    askMinIe: function() {
      var done = this.async();

      var prompts = [{
        type: 'list',
        name: 'minIeVersionSupport',
        message: 'Minimum IE version support?',
        choices: ['8', '9', '10', '11']
      }];

      this.prompt(prompts, function (props) {
        this.minIeVersionSupport = props.minIeVersionSupport;

        done();
      }.bind(this));
    }
  },

  writing: {
    app: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
          {
            name: this.appname,
            tinyPngApiKey: this.tinyPngAPIKey
          }
      );
    },

    projectfiles: function () {
      this.fs.copyTpl(
        this.templatePath('_bower.json'),
        this.destinationPath('bower.json'),
          {
            name: this.appname
          }
      );

      this.fs.copyTpl(
        this.templatePath('_bowerrc'),
        this.destinationPath('.bowerrc'),
          {
            publicDir: this.publicDir
          }
      );

      this.fs.copyTpl(
        this.templatePath('_gulpfile.js'),
        this.destinationPath('gulpfile.js'),
          {
            publicDir: this.publicDir,
            tinyPngApiKey: this.tinyPngAPIKey,
            minIeVersionSupport: this.minIeVersionSupport
          }
      );

      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );

      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );

      this.fs.copy(
        this.templatePath('readme.md'),
        this.destinationPath('readme.md')
      );
    }
  },

  end: function () {
    this.installDependencies({
      callback: function () {
        var base = this.destinationRoot();

        // Fetch and copy Jam to public directory
        copyBowerFiles.call(this, 'jam', this.publicDir, excludeJamFiles);

        // Fetch and copy Modernizr to JS directory
        //copyModernizrToSrc.call(this);

      }.bind(this)
    });
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});
