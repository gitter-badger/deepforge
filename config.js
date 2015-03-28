'use strict';
var config = require('webgme/config/config.default'),
    validateConfig = require('webgme/config/validator');

// Overwrite options as needed
config.server.port = 8081;
config.mongo.uri = 'mongodb://127.0.0.1:27017/cnn-creator';

// Default Project
config.client.defaultProject.name = 'cnn_creator';

// Customize Visualizers
config.visualization.visualizerDescriptors = ['./Visualizers.json'];

// Plugin paths
config.plugin.basePaths.push('Plugins');

validateConfig(config);
module.exports = config;
