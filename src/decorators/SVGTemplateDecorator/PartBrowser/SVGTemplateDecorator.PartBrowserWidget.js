/*globals define, _, DEBUG, $*/
/*jshint browser: true*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */


define([
    'decorators/SVGDecorator/PartBrowser/SVGDecorator.PartBrowserWidget',
    '../Core/SVGTemplateDecorator',
    'text!../DiagramDesigner/SVGTemplateDecorator.DiagramDesignerWidget.html',
    'css!../DiagramDesigner/SVGTemplateDecorator.DiagramDesignerWidget.css',
    'css!./SVGTemplateDecorator.PartBrowserWidget.css'
], function (
    SVGDecorator,
    SVGTemplateDecoratorCore,
    SVGTemplateDecoratorTemplate
) {

    'use strict';

    var SVGTemplateDecoratorPartBrowserWidget,
        DECORATOR_ID = 'SVGTemplateDecoratorPartBrowserWidget';

    SVGTemplateDecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        SVGDecorator.call(this, opts);
        SVGTemplateDecoratorCore.call(this, opts);

        this.logger.debug('SVGTemplateDecoratorPartBrowserWidget ctor');
    };

    _.extend(SVGTemplateDecoratorPartBrowserWidget.prototype, SVGDecorator.prototype,
        SVGTemplateDecoratorCore.prototype);

    SVGTemplateDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;
    SVGTemplateDecoratorPartBrowserWidget.$DOMBase = $(SVGTemplateDecoratorTemplate);

    
    SVGTemplateDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = SVGTemplateDecoratorPartBrowserWidget.$DOMBase.clone();
        SVGDecorator.prototype.beforeAppend.apply(this, arguments);
        this._collectAttributeFields();
        this.update();
    };

    return SVGTemplateDecoratorPartBrowserWidget;
});
