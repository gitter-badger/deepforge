/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

/**
 * @author brollb / https://github.com/brollb
 */

define([
    'decorators/LayerDecorator/EasyDAG/LayerDecorator.EasyDAGWidget',
    'css!./InnerProductDecorator.EasyDAGWidget.css',
    'd3'
], function (
    LayerDecorator
) {

    'use strict';

    var InnerProductDecorator,
        DECORATOR_ID = 'InnerProductDecorator';

    InnerProductDecorator = function (options) {
        this.dense = this.dense || {width: 120, height: 40};
        this.size = this.size || {width: 150, height: 150};
        this.color = this.color || '#4caf50';

        LayerDecorator.call(this, options);

        this.logger.debug('InnerProductDecorator ctor');
    };

    _.extend(InnerProductDecorator.prototype, LayerDecorator.prototype);

    InnerProductDecorator.prototype.condense = function() {
        var path,
            rx = this.dense.width/2,
            ry = this.dense.height/2;

        path = [
            `M${-rx},0`,
            `a${rx},${ry} 0 1,0 ${this.dense.width},0`,
            `a${rx},${ry} 0 1,0 -${this.dense.width},0`
        ].join(' ');

        this.$body
            .attr('d', path);

        // Clear the attributes
        this.$attributes.remove();
        this.$attributes = this.$el.append('g')
            .attr('fill', '#222222');

        this.height = this.dense.height;
        this.width = this.dense.width;

        this.$name.attr('y', '5');

        this.$el
            .attr('transform', `translate(${this.width/2}, ${this.height/2})`);
        this.expanded = false;
        this.onResize();
    };


    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    return InnerProductDecorator;
});
