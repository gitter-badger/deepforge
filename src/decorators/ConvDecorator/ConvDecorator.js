/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './EasyDAG/ConvDecorator.EasyDAGWidget'
], function (DecoratorBase, LargeLayerDecoratorEasyDAGWidget) {

    'use strict';

    var ConvDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'ConvDecorator';

    ConvDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('ConvDecorator ctor');
    };

    _.extend(ConvDecorator.prototype, __parent_proto__);
    ConvDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    ConvDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            EasyDAG: LargeLayerDecoratorEasyDAGWidget
        };
    };

    return ConvDecorator;
});
