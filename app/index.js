'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var _ = require('lodash');
var _s = require('underscore.string');
var fs = require('fs');


var excludeJamFiles = ['.editorconfig', '.gitignore', 'LICENSE.md', 'bower.json', '.bowerrc', 'readme.md', '_.htaccess', 'gulpfile.js', 'package.json'];

// Grab a possible name for the project.
var extractModuleName = function (appname) {
  var slugged = _s.slugify(appname);

  return slugged.toLowerCase();
};

// Copy Bower files to another directory
var copyBowerFiles = function (component, to, exclude) {
  var base = this.dest._base(),
      publicDir = base + '/' + this.publicDir,
      publicAssetsDir = publicDir + '/assets',
      bowerComponentsDir = publicAssetsDir + '/bower_components',
      bower,
      from;
    
  to = (base + '/' + to || publicAssetsDir);
  from = bowerComponentsDir + '/' + component;

  //this.dest.copy(from, to);
  this.dest.recurse(from, copyDestPathPartial.call(this, to, exclude));
};

// Copy modernizr file to JS directory
var copyModernizrToSrc = function () {
  var base = this.dest._base(),
      publicDir = base + '/' + this.publicDir,
      publicAssetsDir = publicDir + '/assets',
      bowerComponentsDir = publicAssetsDir + '/bower_components',
      jsSrcDir = publicAssetsDir + '/js/src',
      from = bowerComponentsDir + '/modernizr/modernizr.js',
      to = jsSrcDir + '/modernizr.js';

    if (!fs.existsSync(jsSrcDir)) {
        mkdirp(jsSrcDir);
    }
    this.dest.removeValidationFilter('collision');
    this.dest.copy(from, to);
};

// Copy destination path partial
var copyDestPathPartial = function (to, exclude) {
  exclude = exclude || [];
  
  this.dest.removeValidationFilter('collision');
  return function (abs, root, sub, file) {
    if (!_.contains(exclude, file) && ! _.contains(exclude, sub)) {
      this.copy(abs, to + '/' + (sub || '') + '/' + file);
    }
  }.bind(this.dest);
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
        default: moduleName
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
        message: 'Enter your TinyPNG API key'
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
            tingPngApiKey: this.tinyPngAPIKey
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
            tingPngApiKey: this.tinyPngAPIKey,
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
        //var base = this.dest._base();

        // Fetch and copy Jam to public directory
        copyBowerFiles.call(this, 'jam', this.publicDir, excludeJamFiles);
        
        // Fetch and copy Modernizr to JS directory
        copyModernizrToSrc.call(this);

      }.bind(this)
    });
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});
