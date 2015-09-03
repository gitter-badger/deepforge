// This is a mapping from caffe layers to webgme meta name

define([], function() {
    'use strict';

    // Helper functions
    var addEntryToObj = function(obj, entry) {
        obj[entry] = entry;
    };

    var extend = function(obj1, obj2) {
        for (var key in obj2) {
            obj1[key] = obj2[key];
        }
        return obj1;
    };

    var addPrefixToKeys = function(prefix, obj) {
        var result = {};
        for (var key in obj) {
            result[prefix+key] = obj[key];
        }
        return result;
    };

    var createNestedMapping = function(prefix, basic, object) {
        basic.forEach(addEntryToObj.bind(null, object));

        // Add to object
        return addPrefixToKeys(prefix+nestedSeparator, object);
    };

    // Create the mapping
    var nestedSeparator = '_',
        layers,
        mappings,
        basicAttributes = ['top', 'bottom'];

    layers = [
        'Data',
        'Convolution',
        'ReLU',
        'Pooling',
        'Flatten',
        'InnerProduct', // Fully connected
        'Dropout',
        'Softmax'
    ];

    // Add common things
    mappings = {};
    layers.forEach(function(type) {
        mappings[type] = {};
        // Add basic things (same name in caffe/webgme)
        basicAttributes.forEach(function(attr) {
            mappings[type][attr] = attr;
        });
    });

    // Add specific things

    // Data
    // data_param nested attributes
    var parent,
        nestedObject,
        nestedParams,
        basic;

    parent = 'data_param';
    basic = ['backend', 'batch_size', 'scale'];
    nestedParams = {
        'source': 'location'
    };

    nestedObject = createNestedMapping(parent, basic, nestedParams);
    extend(mappings.Data, nestedObject);

    // Convolution
    nestedObject = createNestedMapping('convolution_param', 
        ['kernel_size', 'stride', 'num_output', 'pad'], {});
    extend(mappings.Convolution, nestedObject);

    // Add bias_filler stuff
    ['type', 'value'].forEach(function(attr) {
        var key = [parent,'bias_filler',attr]
            .join(nestedSeparator);
        mappings.Convolution[key] = 'bias_filler_'+attr;
    });

    // Dropout
    nestedObject = createNestedMapping('dropout_param', 
        ['dropout_ratio'], {});
    extend(mappings.Dropout, nestedObject);

    // Inner Product
    nestedObject = createNestedMapping('inner_product_param', 
        ['num_output'], {});
    extend(mappings.InnerProduct, nestedObject);

    // Pooling
    nestedObject = createNestedMapping('pooling_param', 
        ['pool', 'stride', 'kernel_size'], {});
    extend(mappings.Pooling, nestedObject);
    
    return mappings;
});
