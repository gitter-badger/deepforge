/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Fri Oct 30 2015 08:32:12 GMT-0500 (CDT).
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    'executor/ExecutorClient'
], function (
    PluginConfig,
    PluginBase,
    ExecutorClient
) {
    'use strict';

    /**
     * Initializes a new instance of TrainCaffe.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin TrainCaffe.
     * @constructor
     */
    var TrainCaffe = function () {
        // Call base class' constructor.
        PluginBase.call(this);
    };

    // Prototypal inheritance from PluginBase.
    TrainCaffe.prototype = Object.create(PluginBase.prototype);
    TrainCaffe.prototype.constructor = TrainCaffe;

    /**
     * Gets the name of the TrainCaffe.
     * @returns {string} The name of the plugin.
     * @public
     */
    TrainCaffe.prototype.getName = function () {
        return 'TrainCaffe';
    };

    /**
     * Gets the semantic version (semver.org) of the TrainCaffe.
     * @returns {string} The version of the plugin.
     * @public
     */
    TrainCaffe.prototype.getVersion = function () {
        return '0.1.0';
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    TrainCaffe.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            executor = new ExecutorClient({
                httpsecure: self.gmeConfig.server.https.enable,
                serverPort: self.gmeConfig.server.port
            }),
            nodeObject;

        executor.createJob({hash: hash}, function(err, jobInfo) {
            // TODO

            // TODO: Save the results in an object somewhere...
            //self.save('TrainCaffe updated model.', function (err) {
                //if (err) {
                    //callback(err, self.result);
                    //return;
                //}
                //self.result.setSuccess(true);
                //callback(null, self.result);
            //});
        });

    };

    return TrainCaffe;
});
