// This file contains a natural mapping from Caffe to the WebGME.
//
// It is used by both the NetworkImporter and the CNNCreator
// TODO: See if we can automate the creation of this file from
// Caffe's docs or something
define([], function() {
    'use strict';

    var layers = {
        /*** Vision Layers ***/
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

        LRN: {
            lrn_param: {
                alpha: 'alpha',
                beta: 'beta',
                local_size: 'local_size',
                norm_region: 'norm_region'
            }
        },

        Im2col: {
            // Just the basics
        },

        Deconvolution: {
            // TODO should require parameters - couldn't find details
        },

        /*** Loss Layers ***/
        Softmax: {
            // Just the basics
        },

        SoftmaxWithLoss: {
            // Just the basics
        },

        EuclideanLoss: {
            // Just the basics
        },

        HingeLoss: {
            hinge_loss_param: {
              norm: 'norm'
            }
        },

        SigmoidCrossEntropyLoss: {
            // Just the basics
        },

        InfogainLoss: {
            // Just the basics
        },

        Accuracy: {
            // Just the basics
        },

        Silence: {
            // Just the basics
        },

        ContrastiveLoss: {
            contrastive_loss_param: {
                margin: 'margin'
            }
        },

        /*** Activation/Neuron Layers ***/
        ReLU: {
            relu_param: {
                negative_slope: 'negative_slope'
            }
        },

        PReLU: {
            prelu_param: {
                filler: 'filler',
                channel_shared: 'channel_shared'
            }
        },

        Sigmoid: {
          // Just the basics
        },

        TanH: {
          // Just the basics
        },

        AbsVal: {
          // Just the basics
        },

        Power: {
            power_param: {
                power: 'power',
                scale: 'scale',
                shift: 'shift'
            }
        },

        BNLL: {
          // Just the basics
        },

        Exp: {
            exp_param: {
                scale: 'scale',
                shift: 'shift',
                base: 'base'
            }
        },

        Log: {
            log_param: {
                scale: 'scale',
                shift: 'shift',
                base: 'base'
            }
        },

        /*** Data Layers ***/
        Data: {
            data_param: {
                source: 'location', // TODO should this be source instead of location?
                backend: 'backend',
                batch_size: 'batch_size',
                rand_skip: 'rand_skip'
            },
            transform_param: {
                scale: 'scale',
                mean_file_size: 'mean_file_size',
                mirror: 'mirror',
                crop_size: 'crop_size'
            }
        },

        MemoryData: {
            data_param: {
                source: 'source',
                backend: 'backend',
                batch_size: 'batch_size',
                rand_skip: 'rand_skip'
            },
            transform_param: {
                scale: 'scale',
                mean_file_size: 'mean_file_size',
                mirror: 'mirror',
                crop_size: 'crop_size'
            }
        },

        HDF5Data: {
            hdf5_data_param: {
                source: 'source',
                batch_size: 'batch_size'
            }
        },

        HDF5Output: {
            hdf5_ouput_param: {
                file_name: 'file_name'
            }
        },

        ImageData: {
            image_data_param: {
                source: 'source',
                batch_size: 'batch_size',
                rand_skip: 'rand_skip',
                shuffle: 'shuffle',
                new_height: 'new_height',
                new_width: 'new_width'
            }
        },

        WindowData: {
            window_data_param: {
              source: 'source',
              batch_size: 'batch_size',
              fg_threshold: 'fg_threshold',
              bg_threshold: 'bg_threshold',
              fg_fraction: 'fg_fraction',
              context_pad: 'context_pad',
              crop_mode: 'crop_mode'
            },
            transform_param: {
                scale: 'scale',
                mean_file_size: 'mean_file_size',
                mirror: 'mirror',
                crop_size: 'crop_size'
            }
        },

        DummyData: {
            dummy_data_param: {
                shape: {
                    dim: 'dim1',
                    dim: 'dim2',
                    dim: 'dim3'
                },
                data_filler: {
                    type: 'type'
                }
            }
        },

        /*** Common Layers ***/
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
                },
                bias_term: 'bias_term'
            }
        },

        Split: {
            // Just the basics
        },

        Flatten: {
            // Just the basics
        },

        Reshape: {
            reshape_param: {
                shape: {
                    dim: 'dim1',
                    dim: 'dim2',
                    dim: 'dim3',
                    dim: 'dim4'
                },
            }
        },

        Concat: {
            concat_param: {
                axis: 'axis'
            }
        },

        Slice: {
            slice_param: {
                axis: 'axis',
                slice_point: 'slice_point1',
                slice_point: 'slice_point2'
            }
        },

        /*** Other Opperations ***/
        Eltwise: {
            // Just the basics
        },

        ArgMax: {
            // Just the basics
        },

        MVN: {
            // Just the basics
        },

        Dropout: {
            dropout_param: {
                dropout_ratio: 'dropout_ratio'
            }
        },

        Reduction: {
            reduction_param: {
                coeff: 'coeff',
                axis: 'axis'
            }
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
