/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author brollb / https://github.com/brollb
 */

define([
    'js/Decorators/DecoratorBase',
    './EasyDAG/PoolDecorator.EasyDAGWidget'
], function (DecoratorBase, LargeLayerDecoratorEasyDAGWidget) {

    'use strict';

    var PoolDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'PoolDecorator';

    PoolDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('PoolDecorator ctor');
    };

    _.extend(PoolDecorator.prototype, __parent_proto__);
    PoolDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    PoolDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            EasyDAG: LargeLayerDecoratorEasyDAGWidget
        };
    };

    return PoolDecorator;
});
