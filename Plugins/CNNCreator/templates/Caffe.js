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
        _default_: 'name: "{{= name }}"\n'  // active node
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
