/*globals define*/
'use strict';
define([], function() {
    var blockMap = {
        _default_: '',
        _base_: '',
        LRN: 'I am an LRN node',
        Convolution: 'layers {\n'+
            '\tname: {{= name }}\n'+
            '\ttype: {{= _base_.name}}\n'+
            '{{ _.each(_previous_, function(layer) {}}'+
            '\tbottom: {{= layer.name }}\n'+
            '{{ });}}'+
            '{{ _.each(_next_, function(layer) {}}'+
            '\ttop: {{=layer.name}}\n'+
            '{{ });}}'+
            '}',
        Pooling: 'layers {\n'+
            '\tname: {{= name }}\n'+
            '\ttype: POOLING\n'+
            '{{ _.each(_previous_, function(layer) {}}'+
            '\tbottom: {{= layer.name }}\n'+
            '{{ });}}'+
            '{{ _.each(_next_, function(layer) {}}'+
            '\ttop: {{=layer.name}}\n'+
            '{{ });}}'+
            '}'

    };

    return blockMap;
});
