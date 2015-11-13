/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

/**
 * @author brollb / https://github.com/brollb
 */

define([
    'js/Constants',
    'decorators/SVGDecorator/DiagramDesigner/SVGDecorator.DiagramDesignerWidget',
    '../Core/SVGTemplateDecorator',
    'text!./SVGTemplateDecorator.DiagramDesignerWidget.html',
    'css!./SVGTemplateDecorator.DiagramDesignerWidget.css'
], function (
    CONSTANTS,
    SVGDecorator,
    SVGTemplateDecoratorCore,
    SVGTemplateDecoratorTemplate
) {

    'use strict';

    var SVGTemplateDecorator,
        DECORATOR_ID = 'SVGTemplateDecorator';

    SVGTemplateDecorator = function (options) {
        var opts = _.extend({}, options);

        SVGDecorator.apply(this, [opts]);
        SVGTemplateDecoratorCore.call(this, opts);

        this.logger.debug('SVGTemplateDecorator ctor');
    };

    _.extend(SVGTemplateDecorator.prototype, SVGDecorator.prototype,
        SVGTemplateDecoratorCore.prototype);
    SVGTemplateDecorator.prototype.DECORATORID = DECORATOR_ID;

    SVGTemplateDecorator.prototype.$DOMBase = $(SVGTemplateDecoratorTemplate);

    SVGTemplateDecorator.prototype.on_addTo = function () {
        var self = this;
        //let the parent decorator class do its job first
        SVGDecorator.prototype.on_addTo.apply(this, arguments);
        this._collectAttributeFields();
        this.update();
    };

    return SVGTemplateDecorator;
});
