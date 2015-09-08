// This is a mapping from caffe layers to webgme meta name

define(['../common/CaffeToWebGME', '../common/utils'], function(Layers, Utils) {
    'use strict';

    var omitAttributes = ['top', 'bottom', 'type'],  // non-attributes in webgme
        mappings = {};
    Object.keys(Layers).forEach(function(layer) {
        var completeLayer = Utils.flattenWithPrefix('',Layers[layer]);
        mappings[layer] = _.omit(completeLayer, omitAttributes);
    });
    return mappings;
});
