/* jshint node: true */
// This is the config used for development on the cnn creator
'use strict';
var config = require('./config.base.js'),
    validateConfig = require('webgme/config/validator');

// Customize Visualizers
config.visualization.visualizerDescriptors = ['./src/visualizers/Visualizers.json', './src/visualizers/Visualizers.dev.json'];

validateConfig(config);
module.exports = config;
