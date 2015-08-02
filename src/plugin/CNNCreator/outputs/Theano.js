/*globals _,define*/

define(['./TemplateCreator',
        '../templates/Constants',
        'underscore',
        '../templates/Theano'], function(TemplateCreator,
                                        Constants,
                                        _,
                                        Theano) {
    'use strict';

    // Caffe Constants
    var TRAINING = '_training_',
        TESTING = '_testing_',
        ARCH_SEP = '_arch_sep_',
        ARCH_END = '_arch_end_';

    // Create helpful function for use in the templates. It 
    // is attached to _ to make it accessible from within the
    // template
    _.capitalize = function(string) {
        return string.charAt(0).toUpperCase()+string.substring(1).toLowerCase();
    };

    var TheanoGenerator = function() {
        this.template = Theano;
    };

    // Inherit the 'createTemplateFromNodes' method
    _.extend(TheanoGenerator.prototype, TemplateCreator.prototype);

    /**
     * Create the output files stored in a JS Object where the 
     * key is the file name and the value is the file content.
     *
     * @param {Virtual Node} tree
     * @return {Object}
     */
    TheanoGenerator.prototype.createOutputFiles = function(tree) {
        var outputFiles = {},
            name = tree.name.replace(/ /g, '_'),
            arch_name = name+'_arch.py',
            train_name = 'neural_net.py',
            template;

        // Create the architecture file
        template = _.template(this.template[Constants.ARCH]);
        outputFiles[arch_name] = template(tree);
        outputFiles[arch_name] += this.createTemplateFromNodes(tree[Constants.CHILDREN]);

        // Add the settings
        outputFiles[arch_name] += this.template[ARCH_SEP];

        this.template = this.template.configLayers;
        outputFiles[arch_name] += this.createTemplateFromNodes(tree[Constants.CHILDREN]);
        this.template = Theano;
        outputFiles[arch_name] += this.template[ARCH_END];

        // Create the metadata file
        var metadata = {type: 'Theano',
                        trainCommand: 'python2 '+train_name,
                        testCommand: ''};  // Add test cmd FIXME 
        outputFiles.metadata = JSON.stringify(metadata);

        return outputFiles;
    };

    return TheanoGenerator;
});
