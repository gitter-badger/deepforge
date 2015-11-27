/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './EasyDAG/LargeLayerDecorator.EasyDAGWidget'
], function (DecoratorBase, LayerDecoratorEasyDAGWidget) {

    'use strict';

    var LargeLayerDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'LargeLayerDecorator';

    LargeLayerDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('LargeLayerDecorator ctor');
    };

    _.extend(LargeLayerDecorator.prototype, __parent_proto__);
    LargeLayerDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    LargeLayerDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            EasyDAG: LayerDecoratorEasyDAGWidget
        };
    };

    return LargeLayerDecorator;
});
