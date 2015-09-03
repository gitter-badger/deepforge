/*globals _,define*/

define(['./TemplateCreator',
        '../templates/Constants',
        'underscore',
        '../templates/Torch'], function(TemplateCreator,
                                        Constants,
                                        _,
                                        Torch) {
    'use strict';

    // Torch Constants
    var TRAINING = '_training_',
        TESTING = '_testing_';
    var TorchGenerator = function() {
        this.template = Torch;
    };

    // Inherit the 'createTemplateFromNodes' method
    _.extend(TorchGenerator.prototype, TemplateCreator.prototype);

    /**
     * Create the output files stored in a JS Object where the 
     * key is the file name and the value is the file content.
     *
     * @param {Virtual Node} tree
     * @return {Object}
     */
    TorchGenerator.prototype.createOutputFiles = function(tree) {
        var outputFiles = {},
            name = tree.name.replace(/ /g, '_'),
            arch_name = name+'_network.prototxt',
            template;

        // Create the architecture file
        template = _.template(this.template[Constants.ARCH]);
        outputFiles[arch_name] = template(tree);
        outputFiles[arch_name] += this.createTemplateFromNodes(tree[Constants.CHILDREN]);

        return outputFiles;
    };

    return TorchGenerator;
});
