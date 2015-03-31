/*globals _,define*/
define(['../templates/Constants'], function(Constants) {

    'use strict';

    var TemplateCreator = function() {
    };
    /**
     * Create the template from the sorted nodes. It assumes that 
     * the template to be used is stored as this.template
     *
     * @param {Array <VirtualNode>} nodeIds
     * @return {String} output
     */
    TemplateCreator.prototype.createTemplateFromNodes = function(nodes) {
        var len = nodes.length,
            template,
            snippet,
            baseName,
            output = '',
            node,
            base;

        // For each node, get the snippet from the base name, populate
        // it and add it to the template
        for (var i = 0; i < len; i++) {
            node = nodes[i];
            baseName = node[Constants.BASE].name;
            template = _.template(this.template[baseName]);
            snippet = template(node);

            output += snippet;
        }

        return output;
    };

    return TemplateCreator;
});
