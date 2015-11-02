// This contains the core functions for the templating functionality
define([
    'js/Constants',
], function(
    CONSTANTS
) {
    'use strict';
    
    var SVGTemplateDecorator = function() {
        this.attributes = [];
        this.attributeValues = {};
        this.attributeFields = {};
    };

    SVGTemplateDecorator.prototype._collectAttributeFields = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //render GME-ID in the DOM, for debugging
        this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});

        if (nodeObj) {
            // Find and populate the attributes
            var fields = this.$svgContent.find('tspan[data-attribute]'),
                field,
                attr,
                value;

            for (var i = fields.length; i--;) {
                field = fields[i];
                attr = field.getAttribute('data-attribute');
                // Initialize the field list if needed and add the field
                if (!this.attributeFields[attr]) {
                    this.attributeFields[attr] = [];
                }
                this.attributeFields[attr].push(field);
            }
            this.attributes = Object.keys(this.attributeFields);
        }
    };

    SVGTemplateDecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            attribute,
            field,
            value;

        // Find and populate the attributes
        for (var i = this.attributes.length; i--;) {
            attribute = this.attributes[i];
            value = nodeObj.getAttribute(attribute) || '';
            if (value !== this.attributeValues[attribute]) {
                this.attributeValues[attribute] = value;
                for (var f = this.attributeFields[attribute].length; f--;) {
                    this.attributeFields[attribute][f].innerHTML = value;
                }
            }
        }
        // FIXME: Can I re-rasterize the svg to fix the location of the text fields?
    };


    // TODO: Add inline editing for attributes
    SVGTemplateDecorator.prototype.doSearch = function (searchDesc) {
        var searchText = searchDesc.toString();
        // TODO: Add support for searching
        return false;
    };

    return SVGTemplateDecorator;
});
