/*globals define,_*/
/*
 * @author brollb
 */

define(['plugin/PluginConfig',
        'plugin/PluginBase',
        'util/assert',
        './templates/caffe',
        'util/guid'],function(PluginConfig,
                              PluginBase,
                              assert,
                              CaffeTemplates,
                              genGuid){

    'use strict';

    var NEXT = '_next_',
        PREV = '_previous_',
        DEFAULT = '_default_',
        BASE = '_base_';

    var CNNCreator = function () {
        // Call base class's constructor
        PluginBase.call(this);
    };

    //basic functions and setting for plugin inheritance
    CNNCreator.prototype = Object.create(PluginBase.prototype);
    CNNCreator.prototype.constructor = CNNCreator;
    CNNCreator.prototype.getName = function () {
        return "CNN Creator";
    };

    //helper functions created by Tamas ;)
    CNNCreator.prototype._loadStartingNodes = function(callback){
        //we load the children of the active node
        var self = this;
        this._nodeCache = {};
        var load = function(node, fn){
            self.core.loadChildren(node,function(err,children){
                if (err){
                    fn(err);
                } else {
                    var j = children.length,
                        e = null; //error

                    if (j === 0){
                        fn(null);
                    }

                    for (var i=0;i<children.length;i++){
                        self._nodeCache[self.core.getPath(children[i])] = children[i];
                        load(children[i], function(err){
                            e = e || err;
                            if (--j === 0){ //callback only on last child
                                fn(e);
                            }
                        });
                    }
                }
            });
        };

        load(self.activeNode, callback);
    };

    CNNCreator.prototype._isTypeOf = function(node,type){
        //now we make the check based upon path
        if(node === undefined || node === null || type === undefined || type === null){
            return false;
        }

        while(node) {
            if(this.core.getPath(node) === this.core.getPath(type)){
                return true;
            }
            node = this.core.getBase(node);
        }
        return false;
    };

    CNNCreator.prototype.getNode = function(nodePath){
        // we check only our node cache
        return this._nodeCache[nodePath];
    };

    // the main entry point of plugin execution
    CNNCreator.prototype.main = function (callback) {
        var self = this;
        self.config = self.getCurrentConfig();

        //If activeNode is null, we won't be able to run 
        if(!self._isTypeOf(self.activeNode, self.META.network)) {
            self._errorMessages(self.activeNode, "Current project is an invalid type. Please run the plugin on a network.");
        }

        //console.log(config.preview,config.configuration);
        self.logger.info("Running Network Exporter");

        //setting up cache
        self._loadStartingNodes(function(err){
            if(err){
                //finishing
                self.result.success = false;
                callback(err,self.result);
            } else {
                //executing the plugin
                self.logger.info("Finished loading children");

                // Bad hack FIXME
                if (self.result.messages.length) {
                    self.result.messages.pop();
                }
                // REMOVE the above thing
                self._runPlugin(callback);
            }
        });
    };

    CNNCreator.prototype._runPlugin = function(callback) {
        this.nodes = {};

        // Change underscorejs tags
        _.templateSettings = {
            interpolate: /\{\{=(.+?)\}\}/g,
            evaluate: /\{\{(.+?)\}\}/g,
        };

        // Verify that the given template supports all the given layers
        // TODO

        // Create node objects from attribute names
        this.createVirtualNodes();

        // Topological sort of the layers
        var sortedNodes = this.getTopologicalOrdering(this.nodes);

        // Retrieve & populate templates in topological order
        var output = this.createTemplateFromNodes(sortedNodes);

        // Save file
        var name = this.core.getAttribute(this.activeNode, 'name');

        this._saveOutput(name, output, callback);
    };

    /**
     * Create virtual nodes from WebGME nodes for use with the templates.
     *
     * @return {Dictionary<Node>}
     */
    CNNCreator.prototype.createVirtualNodes = function() {
        var nodeIds = this.core.getChildrenPaths(this.activeNode),
            conns = [],
            node,
            i;

        for (i = nodeIds.length; i--;) {
            node = this.getNode(nodeIds[i]);
            if (!this._isTypeOf(node, this.META.LayerConnector)) {
                this.createVirtualNode(node);
            } else {
                conns.push(node);
            }
        }

        // Merge connection info with src/dst nodes
        for (i = conns.length; i--;) {
            this.mergeConnectionNode(conns[i]);
        }

        return this.nodes;
    };

    CNNCreator.prototype.createVirtualNode = function(node, stop) {
        var id = this.core.getPath(node),
            attrNames = this.core.getAttributeNames(node),
            virtualNode = {};

        for (var i = attrNames.length; i--;) {
            virtualNode[attrNames[i]] = this.core.getAttribute(node, attrNames[i]);
        }

        // Initialize source and destination stuff
        virtualNode[NEXT] = [];
        virtualNode[PREV] = [];

        // Add base node
        //if (!stop) {  // Hacking :(
            //var base = this.core.getBase(this.getNode(id));
            //if (base) {
                // Add base node to this.nodes
                //var virtualBase = this.createVirtualNode(base, true);
                //virtualNode[BASE] = virtualBase;
            //}
        //}

        // Record the given node
        this.nodes[id] = virtualNode;
        return virtualNode;
    };

    CNNCreator.prototype.mergeConnectionNode = function(conn) {
        var src = this._getPointerVirtualNode(conn, 'src'),  // Get the virtual nodes
            dst = this._getPointerVirtualNode(conn, 'dst');

        // Set pointers to each other
        src[NEXT].push(dst);
        dst[PREV].push(src);
    };

    CNNCreator.prototype._verifyExists = function(object, key, defaultValue) {
        if (object[key] === undefined) {
            object[key] = defaultValue;
        }
    };

    CNNCreator.prototype._getPointerVirtualNode = function(node, ptr) {
        var targetId = this.core.getPointerPath(node, ptr);

        return this.nodes[targetId];
    };

    /**
     * Get the topological ordering of the nodes from the node dictionary.
     *
     * @param {Dictionary} nodeMap
     * @return {Array<Node>} sortedNodes
     */
    CNNCreator.prototype.getTopologicalOrdering = function(nodeMap) {
        var sortedNodes = [];

        // This should be updated to find the topological ordering
        // TODO
        return Object.keys(nodeMap);
    };

    /**
     * Create the template from the sorted nodes
     *
     * @param {Array} nodeIds
     * @return {String} output
     */
    CNNCreator.prototype.createTemplateFromNodes = function(nodeIds) {
        var output = CaffeTemplates[DEFAULT],
            len = nodeIds.length,
            template,
            snippet,
            baseName,
            node,
            base;

        // For each node, get the snippet from the base name, populate
        // it and add it to the template
        for (var i = 0; i < len; i++) {
            base = this.core.getBase(this.getNode(nodeIds[i]));
            node = this.nodes[nodeIds[i]];
            node[BASE] = this.createVirtualNode(base);

            baseName = this.core.getAttribute(base, 'name');
            template = _.template(CaffeTemplates[baseName]);
            snippet = template(node);

            output += snippet;
        }

        return output;
    };

    // Thanks to Tamas for the next two functions
    CNNCreator.prototype._saveOutput = function(filename,stringFileContent,callback){
        var self = this,
            artifact = self.blobClient.createArtifact(filename);

        artifact.addFile(filename,stringFileContent,function(err){
            if(err){
                callback(err);
            } else {
                self.blobClient.saveAllArtifacts(function(err, hashes) {
                    if (err) {
                        callback(err);
                    } else {
                        self.logger.info('Artifacts are saved here:');
                        self.logger.info(hashes);

                        // result add hashes
                        for (var j = 0; j < hashes.length; j += 1) {
                            self.result.addArtifact(hashes[j]);
                        }

                        self.result.setSuccess(true);
                        callback(null, self.result);
                    }
                });
            }
        });
    };

    CNNCreator.prototype._errorMessages = function(message){
        //TODO the erroneous node should be send to the function
        var self = this;
        self.createMessage(self.activeNode,message);
    };

    return CNNCreator;
});
