/*globals _,define*/

define(['TemplateCreator/outputs/OutputGenerator',
        'TemplateCreator/templates/Constants',
        'underscore',
        '../common/CaffeInPlaceLayers',
        './CaffeTemplate'], function(OutputGenerator,
                                     Constants,
                                     _,
                                     InPlaceLayers,
                                     CaffeTemplate) {
    'use strict';

    // Caffe Constants
    var TRAINING = '_training_',
        TESTING = '_testing_';
    var CaffeGenerator = function() {
        this.template = CaffeTemplate;
    };

    // Inherit the 'createTemplateFromNodes' method
    _.extend(CaffeGenerator.prototype, OutputGenerator.prototype);

    /**
     * Create the output files stored in a JS Object where the 
     * key is the file name and the value is the file content.
     *
     * @param {Virtual Node} tree
     * @return {Object}
     */
    CaffeGenerator.prototype.createOutputFiles = function(tree) {
        //console.log('tree is', tree);
        var outputFiles = {},
            name = tree.name.replace(/ /g, '_'),
            arch_name = name+'_network.prototxt',
            train_name = name+'_trainer.prototxt',
            template;

        // Remove the label layer
        this._removeLabelLayer(tree);

        // Update for in-place computation
        this._addInPlaceOperations(tree);

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

        // Create the metadata file
        var metadata = {type: 'Caffe',
                        trainCommand: 'caffe --train '+train_name,
                        testCommand: ''};  // Add test cmd FIXME 
        outputFiles.metadata = JSON.stringify(metadata);

        return outputFiles;
    };

    CaffeGenerator.prototype._removeLabelLayer = function(tree) {
        // Remove the label layer (don't splice any connections)
        // Also set the name to 'label'
        // Check children for the layer with base type(.toLowerCase()) of 'label'
        var children = tree[Constants.CHILDREN];
        for (var i = children.length; i--;) {
            if (children[i][Constants.BASE].name.toLowerCase() === 'label') {
                children[i].name = 'label';
                children.splice(i, 1);
                return tree;
            }
        }
    };

    CaffeGenerator.prototype._addInPlaceOperations = function(tree) {
        // Convolution layers connect into themselves and subsequent ReLU layers
        // will connect their top value back into the convolution layer
        var children = tree[Constants.CHILDREN],
            next,
            prev,
            conv,
            base,
            j;

        for (var i = children.length; i--;) {
            base = children[i][Constants.BASE].name.toLowerCase();
            if (InPlaceLayers[base]) {
                children[i][Constants.NEXT] = children[i][Constants.PREV];
            } else {
                // Keep 'label' if it exists
                children[i][Constants.NEXT] = children[i][Constants.NEXT]
                    .filter(function(node) {
                        return node.name === 'label';
                    });

                // Add self
                children[i][Constants.NEXT].push(children[i]);
            }
        }
    };

    return CaffeGenerator;
});
