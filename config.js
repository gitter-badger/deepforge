/* jshint node: true */
'use strict';
var config = require('./config.webgme.js'),
    validateConfig = require('webgme/config/validator');

// Overwrite options as needed
config.server.port = 8080;
config.mongo.uri = 'mongodb://127.0.0.1:27017/cnn-creator';

// Default Project
config.client.defaultProject.name = 'cnn_creator';

// Customize Visualizers
config.visualization.visualizerDescriptors = ['./Visualizers.json'];

// Plugins
config.plugin.allowServerExecution = true;
config.seedProjects.basePaths.push("models");

validateConfig(config);
module.exports = config;
