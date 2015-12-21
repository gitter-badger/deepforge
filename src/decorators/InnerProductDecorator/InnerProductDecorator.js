/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './EasyDAG/InnerProductDecorator.EasyDAGWidget'
], function (DecoratorBase, LargeLayerDecoratorEasyDAGWidget) {

    'use strict';

    var InnerProductDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'InnerProductDecorator';

    InnerProductDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('InnerProductDecorator ctor');
    };

    _.extend(InnerProductDecorator.prototype, __parent_proto__);
    InnerProductDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    InnerProductDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            EasyDAG: LargeLayerDecoratorEasyDAGWidget
        };
    };

    return InnerProductDecorator;
});
