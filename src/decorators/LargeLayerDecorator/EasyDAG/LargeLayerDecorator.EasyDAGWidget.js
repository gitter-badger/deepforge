/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

/**
 * @author brollb / https://github.com/brollb
 */

define([
    'decorators/LayerDecorator/EasyDAG/LayerDecorator.EasyDAGWidget',
    'css!./LargeLayerDecorator.EasyDAGWidget.css',
    'd3'
], function (
    LayerDecorator
) {

    'use strict';

    var LargeLayerDecorator,
        DECORATOR_ID = 'LargeLayerDecorator';

    LargeLayerDecorator = function (options) {
        this.dense = this.dense || {width: 125, height: 50};
        this.size = this.size || {width: 150, height: 150};
        this.color = this.color || '#2196f3';

        LayerDecorator.call(this, options);
        this.logger.debug('LargeLayerDecorator ctor');
    };

    _.extend(LargeLayerDecorator.prototype, LayerDecorator.prototype);

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    return LargeLayerDecorator;
});
