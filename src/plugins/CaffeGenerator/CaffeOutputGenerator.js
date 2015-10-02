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
        this.runOptions = null;
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
        var outputFiles = {},
            name = tree.name.replace(/ /g, '_'),
            archName = name+'_network.prototxt',
            trainName = name+'_trainer.prototxt',
            testName = name+'_solver.prototxt',
            template;

        // Remove the label layer
        this._removeLabelLayer(tree);

        // Update for in-place computation
        this._addInPlaceOperations(tree);

        // Decorate the active node with the run settings
        _.extend(tree, this.runOptions);
        tree.archName = archName;

        // Add the data source and type to data nodes
        // As the children are topo sorted, data nodes should be first
        var i = 0,
            node = tree[Constants.CHILDREN][i];
        while (node[Constants.BASE].name === 'Data') {
            // Add the data attributes
            node.location = '"'+this.runOptions.inputData+'"';
            node.backend = this.runOptions.dataType;
            node = tree[Constants.CHILDREN][++i];
        }

        // Create the architecture file
        template = _.template(this.template[Constants.ARCH]);
        outputFiles[archName] = template(tree);
        outputFiles[archName] += this.createTemplateFromNodes(tree[Constants.CHILDREN]);

        // Create the training file
        template = _.template(this.template[TRAINING]);
        outputFiles[trainName] = template(tree);

        // Create the testing file
        template = _.template(this.template[TESTING]);
        outputFiles[testName] = template(tree);

        // Create the metadata file
        var metadata = {type: 'Caffe',
                        trainCommand: 'caffe --train '+trainName,
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
