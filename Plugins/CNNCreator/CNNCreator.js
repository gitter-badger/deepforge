/*globals define,_*/
/*
 * @author brollb
 */

define(['plugin/PluginConfig',
        'plugin/PluginBase',
        'util/assert',
        './outputs',
        './templates/Constants',
        'util/guid'],function(PluginConfig,
                              PluginBase,
                              assert,
                              Generators,
                              Constants,
                              genGuid){

    'use strict';

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

    CNNCreator.prototype._loadStartingNodes = function(callback){
        var self = this;
        this._nodeCache = {};

        this._nodeCache[this.core.getPath(this.activeNode)] = this.activeNode;
        this.core.loadSubTree(this.activeNode, function(err, nodes) {
            if (err) {
                return callback(err);
            }

            nodes.forEach(function(n) {
                this._nodeCache[this.core.getPath(n)] = n;
            }, self);

            callback(null);
        });
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

    CNNCreator.prototype.getConfigStructure = function(){
        // Set the values..
        // TODO
        return [{
            'name': 'template',
            'displayName': 'Output',
            'description': '',
            'value': 'Caffe',
            'valueType': 'string',
            'valueItems': Object.keys(Generators)
        }];
    };

    // the main entry point of plugin execution
    CNNCreator.prototype.main = function (callback) {
        var self = this,
            config = self.getCurrentConfig();

        // Set the template
        this.generator = new Generators[config.template]();

        //If activeNode is null, we won't be able to run 
        if(!self._isTypeOf(self.activeNode, self.META.Learner)) {
            self._errorMessages(self.activeNode, "Current project is an invalid type. Please run the plugin on a network.");
        }

        self.logger.info("Running CNN Creator");

        //setting up cache
        this._loadStartingNodes(function(err){
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

        // Load virtual tree
        var tree = this.loadVirtualTree(this.activeNode);

        // Retrieve & populate templates in topological order
        var output = this.generator.createOutputFiles(tree);
        //var output = this.createTemplateFromNodes(tree);

        // Save file
        var name = this.core.getAttribute(this.activeNode, 'name');

        this._saveOutput(name, output, callback);
    };

    /**
     * Load the virtual nodes into a tree rooted at 'root'.
     *
     * @param {WebGME Node} rootNode
     * @return {VirtualNode} root
     */
    CNNCreator.prototype.loadVirtualTree = function(rootNode) {
        var root = this.createVirtualNode(rootNode),
            current = [root],
            next,
            virtualNodes,
            node;

        while (current.length) {
            next = [];
            for (var i = current.length; i--;) {
                node = current[i];
                // Create node objects from attribute names
                virtualNodes = this.createChildVirtualNodes(node[Constants.NODE_PATH]);

                // Topological sort of the layers
                node[Constants.CHILDREN] = this.getTopologicalOrdering(virtualNodes);
                next = next.concat(node[Constants.CHILDREN]);
            }
            current = next;
        }

        return root;
    };

    /**
     * Create virtual nodes from WebGME nodes for use with the templates.
     *
     * @return {Dictionary<Node>}
     */
    CNNCreator.prototype.createChildVirtualNodes = function(nodeId) {
        var parentNode = this.getNode(nodeId),
            nodeIds = this.core.getChildrenPaths(parentNode),
            conns = [],
            node,
            vnode,
            base,
            virtualNodes = {},
            i;

        for (i = nodeIds.length; i--;) {
            node = this.getNode(nodeIds[i]);
            if (!this._isTypeOf(node, this.META.LayerConnector)) {
                vnode = this.createVirtualNode(node);
                base = this.core.getBase(node);
                vnode[Constants.BASE] = this.createVirtualNode(base);
                virtualNodes[nodeIds[i]] = vnode;
            } else {
                conns.push(node);
            }
        }

        // Merge connection info with src/dst nodes
        for (i = conns.length; i--;) {
            this.mergeConnectionNode(conns[i], virtualNodes);
        }

        // Copy virtual nodes into this.nodes
        _.extend(this.nodes, virtualNodes);

        return virtualNodes;
    };

    CNNCreator.prototype.createVirtualNode = function(node) {
        var id = this.core.getPath(node),
            attrNames = this.core.getAttributeNames(node),
            virtualNode = {};

        for (var i = attrNames.length; i--;) {
            virtualNode[attrNames[i]] = this.core.getAttribute(node, attrNames[i]);
        }

        // Initialize source and destination stuff
        virtualNode[Constants.NEXT] = [];
        virtualNode[Constants.PREV] = [];
        virtualNode[Constants.NODE_PATH] = id;

        return virtualNode;
    };

    CNNCreator.prototype.mergeConnectionNode = function(conn, nodes) {
        var src = this._getPointerVirtualNode(conn, 'src', nodes),  // Get the virtual nodes
            dst = this._getPointerVirtualNode(conn, 'dst', nodes);

        // Set pointers to each other
        src[Constants.NEXT].push(dst);
        dst[Constants.PREV].push(src);
    };

    CNNCreator.prototype._verifyExists = function(object, key, defaultValue) {
        if (object[key] === undefined) {
            object[key] = defaultValue;
        }
    };

    CNNCreator.prototype._getPointerVirtualNode = function(node, ptr,nodes) {
        var targetId = this.core.getPointerPath(node, ptr);

        return nodes[targetId];
    };

    /**
     * Get the topological ordering of the nodes from the node dictionary.
     *
     * @param {Dictionary} nodeMap
     * @return {Array<Node>} sortedNodes
     */
    CNNCreator.prototype.getTopologicalOrdering = function(virtualNodes) {
        var sortedNodes = [],
            edgeCounts = {},
            ids = Object.keys(virtualNodes),
            len = ids.length,
            nodeId,
            id,
            i;

        // Populate edgeCounts
        for (i = ids.length; i--;) {
            edgeCounts[ids[i]] = virtualNodes[ids[i]][Constants.PREV].length;
        }

        while (sortedNodes.length < len) {
            // Find a node with zero edges...
            i = ids.length;
            nodeId = null;
            while (i-- && !nodeId) {
                if (edgeCounts[ids[i]] === 0) {
                    nodeId = ids.splice(i,1)[0];
                }
            }

            // Add the node 
            sortedNodes.push(nodeId);

            // Update edge lists
            i = virtualNodes[nodeId][Constants.NEXT].length;
            while (i--) {
                id = virtualNodes[nodeId][Constants.NEXT][i][Constants.NODE_PATH];
                edgeCounts[id]--;
            }

        }

        return sortedNodes.map(function(e) { return virtualNodes[e]; });
    };

    // Thanks to Tamas for the next two functions
    CNNCreator.prototype._saveOutput = function(filename,filesBlob,callback){
        var self = this,
            artifact = self.blobClient.createArtifact(filename),
            files = Object.keys(filesBlob),
            fileCount = files.length,
            onFileSave = function(err) {
                if(err){
                    callback(err);
                } else {
                    if (--fileCount === 0) {
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
                }
            };

        for (var i = files.length; i--;) {
            artifact.addFile(files[i],filesBlob[files[i]],onFileSave);
        }
    };

    CNNCreator.prototype._errorMessages = function(message){
        //TODO the erroneous node should be send to the function
        var self = this;
        self.createMessage(self.activeNode,message);
    };

    return CNNCreator;
});
