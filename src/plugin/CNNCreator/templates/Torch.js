/*globals define*/
define([], function() {
    'use strict';

    // Basic block templates
    var blockMap = {
        _arch_: 'local CNN = nn.Sequential()', // Add boilerplate
    };

    // Convolution layer
    blockMap.Convolution = 'CNN:add(nn.SpatialConvolution(3, '+
        '{{= num_output }}, {{= kernel_size }}, {{= kernel_size }}, {{= stride }}, {{= stride }}, {{= pad }}, {{= pad }})';

    for (var key in blockMap) {
        blockMap[key] += '\n';
    }
    return blockMap;
});
