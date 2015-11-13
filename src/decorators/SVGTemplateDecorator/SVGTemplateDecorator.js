/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author brollb / https://github.com/brollb
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/SVGTemplateDecorator.DiagramDesignerWidget',
    './PartBrowser/SVGTemplateDecorator.PartBrowserWidget'
], function (
    DecoratorBase,
    SVGTemplateDecoratorDiagramDesignerWidget,
    SVGTemplateDecoratorPartBrowserWidget
) {

    'use strict';

    var SVGTemplateDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'SVGTemplateDecorator';

    SVGTemplateDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('SVGTemplateDecorator ctor');
    };

    _.extend(SVGTemplateDecorator.prototype, __parent_proto__);
    SVGTemplateDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    SVGTemplateDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: SVGTemplateDecoratorDiagramDesignerWidget,
            PartBrowser: SVGTemplateDecoratorPartBrowserWidget
        };
    };

    return SVGTemplateDecorator;
});
