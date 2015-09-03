/*globals define*/
define([], function() {
    'use strict';

    // Basic block templates
    var blockMap = {
        _arch_: 'local CNN = nn.Sequential()', // Add boilerplate
    };

    // Convolution layer
    blockMap.Convolution = 'CNN:add(nn.SpatialConvolution(3, '+
        '{{= num_output }}, {{= kernel_size }}, {{= kernel_size }}, {{= stride }}, {{= stride }}, {{= pad }}, {{= pad }}))';

    blockMap.Dropout = 'CNN:add(nn.Dropout('+
        '{{= dropout_ratio }}))';

    blockMap.Flatten = 'CNN:add(nn.View())';

    blockMap.Pooling = 'CNN:add(nn.SpatialMaxPooling('+
        '{{= kernel_size }}, {{= kernel_size }}, {{= stride }}, {{= stride }}))';

    // TODO Local response normalization does not exist in nn package (exists in cudnn)

    blockMap.InnerProduct = 'CNN:add(nn.Linear('+
        '{{= num_output }}, {{= num_output }}))'; // TODO need number of inputs

    blockMap.ReLU = 'CNN:add(nn.ReLU(true))';

    blockMap.Softmax = 'CNN:add(nn.Softmax())';


    for (var key in blockMap) {
        blockMap[key] += '\n';
    }
    return blockMap;
});
