/*globals define*/
'use strict';
define([], function() {
    // Every layer has the following:
    //
    // layer {
    //     name: "name"
    //     type: "base_name"
    //     top: "base_name"
    //     bottom: "base_name"
    // }

    // Basic block templates
    var blockMap = {
        _base_: '',
        _arch_: 'name: "{{= name }}"\n',  // active node

        _training_: 'net: "{{= arch_name }}"\n'+
            'base_lr: {{= learning_rate }}\n'+
            'momentum: {{= momentum }}\n'+
            'weight_decay: {{= weight_decay }}\n'+
            'lr_policy: {{= learning_rate_policy }}\n'+
            'gamma: {{= gamma }}\n'+
            'power: {{= power }}\n'+
            'max_iter: {{= max_iter }}\n'+
            '# ADD THE SNAPSHOT DIRECTORY TODO\n'+
            'snapshot: 1000\n'+
            'snapshot_prefix: <%= SNAPSHOT_DIR %>\n'+
            'solver_mode: GPU\n',

        _testing_: 'net: "{{= arch_name }}"\n'+
            'test_iter: {{= test_iter }}\n'+
            'test_interval: {{= test_interval }}\n'+

            'weight_decay: {{= weight_decay }}\n'+
            'lr_policy: {{= learning_rate_policy }}\n'+
            'gamma: {{= gamma }}\n'+
            'power: {{= power }}\n'+
            'max_iter: {{= max_iter }}\n'+
            '# ADD THE SNAPSHOT DIRECTORY TODO\n'+
            'snapshot: {{= snapshot }}\n'+
            'snapshot_prefix: {{= SNAPSHOT_DIR }}\n'+
            'solver_mode: GPU\n'

    };

    var layers = [
        'Data',
        'Convolution',
        'ReLU',
        'Pooling',
        'Flatten',
        'InnerProduct', // Fully connected
        'Dropout',
        'Softmax'
    ];

    // Populate the layers with the basic templates
    var i;
    for (i = layers.length; i--;) {
        blockMap[layers[i]] = 
            'layer {\n'+
            '\tname: "{{= name }}"\n'+
            '\ttype: "{{= _base_.name }}"\n'+

            // Incoming connections
            '{{ _.each(_previous_, function(layer) {}}'+
            '\tbottom: "{{= layer.name }}"\n'+
            '{{ });}}'+
            
            // Outgoing connections
            '{{ _.each(_previous_, function(layer) {}}'+
            '\ttop: "{{= layer.name }}"\n'+
            '{{ });}}';
    }

    // Add Layer Specific Parameters
    blockMap.Data += 
        '\tdata_param {\n'+
        '\t\tsource: "{{= location }}"\n'+
        '\t\tbackend: "{{= backend }}"\n'+
        '\t\tbatch_size: "{{= batch_size }}"\n'+
        '\t\tscale: "{{= scale }}"\n'+
        '\t}\n';

    blockMap.Convolution += 
        '\tconvolution_param {\n'+
        '\t\tkernel_size: {{= kernel_size }}\n'+
        '\t\tstride: {{= stride }}\n'+
        '\t\tpad: {{= pad }}\n'+
        '\t\tnum_output: {{= num_output }}\n'+
        '\t\tbias_filler {\n'+
        '\t\t\ttype: {{= bias_filler_type }}\n'+
        '\t\t\tvalue: {{= bias_filler_value }}\n'+
        '\t\t}\n'+
        '\t}\n';

        // Extra ones from the layer catalog
        //'\tblobs_lr: {{= blobs_lr }}\n'+
        //'\tblobs_lr: {{= blobs_lr }}\n'+
        //'\tweight_decay: {{= weight_decay }}\n'+
        //'\tweight_decay: {{= weight_decay }}\n'+
 
    blockMap.Pooling += 
        '\tpooling_param {\n'+
        '\t\tpool: {{= pool }}\n'+
        '\t\tkernel_size: {{= kernel_size }}\n'+
        '\t\tstride: {{= stride }}\n'+
        '\t}\n';

    blockMap.InnerProduct += 
        '\tinner_product_param {\n'+
        '\t\tnum_output: {{= num_output }}\n'+
        '\t}\n';

    blockMap.Dropout += 
        '\tdropout_param {\n'+
        '\t\tdropout_ratio: {{= dropout_ratio }}\n'+
        '\t}\n';

    // Close the layer text
    for (i = layers.length; i--;) {
        blockMap[layers[i]] += '}\n';
    }

    return blockMap;
});
