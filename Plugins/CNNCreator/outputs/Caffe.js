/*globals _,define*/

define(['./TemplateCreator',
        '../templates/Constants',
        '../templates/Caffe'], function(TemplateCreator,
                                        Constants,
                                        Caffe) {
    'use strict';

    // Caffe Constants
    var TRAINING = '_training_',
        TESTING = '_testing_';
    var CaffeGenerator = function() {
        this.template = Caffe;
    };

    // Inherit the 'createTemplateFromNodes' method
    _.extend(CaffeGenerator.prototype, TemplateCreator.prototype);

    /**
     * Create the output files stored in a JS Object where the 
     * key is the file name and the value is the file content.
     *
     * @param {Virtual Node} tree
     * @return {Object}
     */
    CaffeGenerator.prototype.createOutputFiles = function(tree) {
        var outputFiles = {},
            name = tree.name.replace(/ /g, '_'),
            arch_name = name+'_network.prototxt',
            train_name = name+'_trainer.prototxt',
            template;

        // Create the architecture file
        template = _.template(this.template[Constants.ARCH]);
        outputFiles[arch_name] = template(tree);
        outputFiles[arch_name] += this.createTemplateFromNodes(tree[Constants.CHILDREN]);

        // Create the training file
        template = _.template(this.template[TRAINING]);
        tree.arch_name = arch_name;
        outputFiles[train_name] = template(tree);

        // Create the testing file
        //template = _.template(this.template[TESTING]);
        // TODO

        return outputFiles;
    };

    return CaffeGenerator;
});
