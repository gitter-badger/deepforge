// This file contains a natural mapping from Caffe to the WebGME.
//
// It is used by both the NetworkImporter and the CNNCreator
// TODO: See if we can automate the creation of this file from 
// Caffe's docs or something
define([], function() {
    'use strict';
    
    var layers = {
        Data: {
            data_param: {
                source: 'location',
                backend: 'backend',
                batch_size: 'batch_size',
                scale: 'scale'
            }
        },
        Convolution: {
            convolution_param: {
                kernel_size: 'kernel_size',
                stride: 'stride',
                pad: 'pad',
                group: 'group',
                num_output: 'num_output',
                weight_filler: {
                    type: 'weight_filler_type',
                    value: 'weight_filler_value'
                },
                bias_filler: {
                    type: 'bias_filler_type',
                    value: 'bias_filler_value'
                }
            }
        },
        Pooling: {
            pooling_param: {
                pool: 'pool',
                kernel_size: 'kernel_size',
                stride: 'stride',
                pad: 'pad'
            }
        },

        InnerProduct: {
            inner_product_param: {
                num_output: 'num_output',
                weight_filler: {
                    type: 'weight_filler_type',
                    value: 'weight_filler_value'
                },
                bias_filler: {
                    type: 'bias_filler_type',
                    value: 'bias_filler_value'
                }
            }
        },

        Dropout: {
            dropout_param: {
                dropout_ratio: 'dropout_ratio'
            }
        },

        LRN: {
            lrn_param: {
                alpha: 'alpha',
                beta: 'beta',
                local_size: 'local_size',
                norm_region: 'norm_region'
            }
        },

        ReLU: {
            relu_param: {
                negative_slope: 'negative_slope'
            }
        },

        Flatten: {
            // Just the basics
        },

        Softmax: {
            // Just the basics
        }
    };

    // Add common info
    var commonAttributes = ['top', 'bottom', 'name', 'type'],
        addToLayers = function(attribute) {
            for (var layer in layers) {
                layers[layer][attribute] = attribute;
            }
        };

    commonAttributes.forEach(addToLayers);

    return layers;
});
