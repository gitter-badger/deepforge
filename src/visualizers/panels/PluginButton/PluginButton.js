/*globals define, _, WebGMEGlobal*/
/*jshint browser: true*/

define([
    // Add the css for this button
    'js/Constants',
    'js/PanelBase/PanelBase',
    'js/Dialogs/PluginResults/PluginResultsDialog',
    'text!./PluginConfig.json',
    'text!./templates/PluginButton.html.ejs',
    'text!./templates/PluginAnchor.html.ejs',
    'text!./templates/NoPlugins.html',

    // Extra js and css for the button
    './styles/js/hammer.min',
    './styles/js/velocity.min',
    './styles/js/global',
    './styles/js/buttons',
    './styles/js/toasts',
    './styles/js/tooltip',
    'css!./styles/css/materialize-fab.css',
    'css!./styles/css/icons.css',
], function (
    CONSTANTS,
    PanelBase,
    PluginResultsDialog,
    PluginIcons,
    PluginBtnTemplateText,
    PluginTemplateText,
    NoPluginHtml,
    Hammer,
    Vel
) {
    'use strict';

    // FIXME: There is a better way to give materialize access to Hammer and Vel
    // in the global scope
    window.Hammer = Hammer;
    window.Vel = Vel;
    var PluginButton,
        PluginTemplate = _.template(PluginTemplateText),
        PluginBtnTemplate = _.template(PluginBtnTemplateText),
        RESULTS_NAME = 'Results',
        TERRITORY_PATTERN = {};

    TERRITORY_PATTERN[CONSTANTS.PROJECT_ROOT_ID] = {children: 0};

    PluginButton = function (layoutManager, params) {
        var options = {};

        //initialize UI
        PanelBase.call(this);
        this.client = params.client;
        this.pluginIconLookup = JSON.parse(PluginIcons);
        this.results = [];
        this.currentPlugins = [];
        this.territoryId = null;

        this._initialize();

        //this.logger.debug('ctor finished');
    };

    _.extend(PluginButton.prototype, PanelBase.prototype);

    PluginButton.prototype._initialize = function () {
        var self = this;

        // Add listener for the root node
        this.client.addEventListener(CONSTANTS.CLIENT.PROJECT_OPENED, (c, p) => {
            if (self.territoryId) {
                self.client.removeUI(self._update.bind(self));
            }
            self.territoryId = self.client.addUI(self, self._update.bind(self));
            self.client.updateTerritory(self.territoryId, TERRITORY_PATTERN);
        });
    };

    PluginButton.prototype._getPluginNames = function () {
        return (WebGMEGlobal.gmeConfig.plugin.displayAll ? WebGMEGlobal.allPlugins :
            this.client.filterPlugins(WebGMEGlobal.allPlugins)).sort();
    };

    PluginButton.prototype._needsUpdate = function (pluginNames) {
        return !this.currentPlugins.length ||  // No plugins
            pluginNames.length !== this.currentPlugins.length ||
            _.difference(pluginNames, this.currentPlugins).length;
    };

    // TODO: Consider only updating on some events
    PluginButton.prototype._update = function () {
        var pluginNames = this._getPluginNames();
        if (this._needsUpdate(pluginNames)) {
            this._updateButton(pluginNames);
        }
    };

    PluginButton.prototype._updateButton = function (pluginNames) {
        // Create the html elements
        var html;

        this.currentPlugins = pluginNames || this._getPluginNames();
        html = this._createButtonHtml();
        this.$el.empty();
        this.$el.append(html);

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
                var name = anchor.getAttribute('data-tooltip');
                anchor.onclick = this._onButtonClicked.bind(this, name);
            });
        $('.tooltipped').tooltip({delay: 50});

        // TODO: Add results button if there are results to view
    };

    PluginButton.prototype._createButtonHtml = function () {
        var defaultIcon = 'play_arrow',
            icons,
            plugins = [],
            pluginNames = this.currentPlugins,
            colors = ['red', 'blue', 'yellow darken-1', 'green'],
            html;

        // Get the plugins
        icons = pluginNames.map(name => this.pluginIconLookup[name] || defaultIcon);

        // Create the html for each
        for (var i = 0; i < pluginNames.length; i++) {
            plugins.push(PluginTemplate({
                name: pluginNames[i],
                icon: icons[i],
                color: colors[i % colors.length]
            }));
        }

        // Add results if applicable
        if (this.results.length) {
            plugins.splice(1, 0, PluginTemplate({
                name: RESULTS_NAME,
                icon: 'list',
                color: 'grey'
            }));
        }

        html = NoPluginHtml;
        if (plugins.length > 0) {
            html = PluginBtnTemplate({plugins});
        }

        return $(html);
    };

    PluginButton.prototype._onButtonClicked = function (name) {
        if (name === RESULTS_NAME) {  // Display results
            let dialog = new PluginResultsDialog();
            dialog.show(this.client, this.results);
        } else {  // Run plugin
            this._invokePlugin(name);
        }
    };

    PluginButton.prototype._invokePlugin = function (name) {
        var self = this;
        if (name) {
            WebGMEGlobal.InterpreterManager.run(name, null, function(result) {
                // Create the toast
                Materialize.toast(result.pluginName + ' execution ' + (result.success ?
                    'successful' : 'failed') + '.', 5000);
                // TODO: allow click to view results from the toast
                self.results.push(result);
                self._updateButton();
            });
        }
    };

    return PluginButton;
});
