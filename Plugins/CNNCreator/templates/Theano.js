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
        _arch_: 'NeuralNet(\n'+  // active node
            'loss = multinomial_nll,\n'+
            'layers = [\n',
        _arch_sep_:'],\n'+
            'input_shape=(None, self._num_channels, self._num_pixels, self._num_pixels),\n',
        _arch_end_: 'update_learning_rate=theano.shared('+
            'float32({{=learning_rate}})),\n'+
            'update_momentum=theano.shared(float32({{=momentum}})),\n'+

            'on_epoch_finished = [ \n'+
                'AdjustVariable(\'update_learning_rate\', start=0.01, stop=0.00001, adjust_type=\'expdecay\'),\n'+
                'model_saver,\n'+
                '],\n'+

            'max_epochs=self._num_epochs,\n'+
            'batch_iterator_train=batch_iterator,\n'+
            'batch_iterator_test=batch_iterator,\n'+
            'verbose=1,\n'+
            'eval_size=0.2,\n'+
            '**self._kwargs)\n'
    };

    var layer2Name = {
        Data: 'layers.InputLayer',
        Convolution: 'Conv2DLayer',
        ReLU: 'FIXME',  // TODO ?
        Pooling: '{{pool = _.capitalize(pool)}}'+
            '{{=pool}}Pool2DLayer',
        Flatten: 'layers.FlattenLayer',
        InnerProduct: 'layers.DenseLayer', // Fully connected
        Dropout: 'layers.DropoutLayer',
        Softmax: 'FIXME' // TODO ?
    };

    for (var layer in layer2Name) {
        blockMap[layer] = '(\'{{=name}}\', '+layer2Name[layer]+'),\n';
    }

    var layer2Config = {
        Convolution: '{{=name}}_num_filters={{=num_output}}, '+
            '{{=name}}_filter_size=({{=kernel_size}},{{=kernel_size}}),'+
            ' {{=name}}_strides=({{=stride}},{{=stride}})\n'+
            '{{=name}}_pad={{=pad}},',
        Pooling: '{{=name}}_ds={{=kernel_size}}, '+  // TODO Not sure...
            '{{=name}}_strides=({{=stride}}, {{=stride}}),\n',
        InnerProduct: '{{=name}}_num_units={{=num_output}},\n',
        Dropout: '{{=name}}_p={{=dropout_ratio}},\n'
    };

    // Add layer2Config supported layers
    for (var name in layer2Name) {
        if (!layer2Config[name]) {
            layer2Config[name] = '';
        }
    }

    blockMap.configLayers = layer2Config;

    return blockMap;
});
