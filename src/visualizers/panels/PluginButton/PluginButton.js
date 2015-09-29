/*globals define, _, WebGMEGlobal*/
/*jshint browser: true*/

define([
    // TODO: Add the css for this button
    'js/PanelBase/PanelBase',
    'text!./templates/PluginButton.html',
    //'./materialize/js/materialize.min',
    'css!./PluginButton.css'
], function (
    PanelBase,
    PluginBtnHtml
) {
    'use strict';

    var PluginButton;

    PluginButton = function (layoutManager, params) {
        var options = {};

        //initialize UI
        PanelBase.call(this);
        this._initialize();

        //this.logger.debug('ctor finished');
    };

    _.extend(PluginButton.prototype, PanelBase.prototype);

    PluginButton.prototype._initialize = function () {
        // Create the html elements
        var html = $(PluginBtnHtml);

        this.$el.append(html);
        // TODO: Get the plugins dynamically
        // Convert this to taking templates and using a config file?

        // Set the onclick for the plugin buttons
        var anchors = [],
            child;

        for (var i = html[0].children.length; i--;) {
            child = html[0].children[i];
            if (child.tagName.toLowerCase() === 'a') {
                anchors.push(child);
            } else {  // ul element
                for (var k = child.children.length; k--;) {
                    anchors.push(child.children[k].children[0]);
                }
            }
        }

        // Add onclick listener
        anchors
            .forEach(anchor => {
                var name = anchor.getAttribute('data-plugin');
                anchor.onclick = this._invokePlugin.bind(this, name);
            });

        // TODO: Add results button if there are results to view
    };

    PluginButton.prototype._invokePlugin = function (name) {
        WebGMEGlobal.InterpreterManager.run(name, null, function(result) {
            // TODO: Create the toast and allow click-to-download
            console.log('result:', result);
        });
        console.log('Invoking plugin for ' + name);
    };

    return PluginButton;
});
