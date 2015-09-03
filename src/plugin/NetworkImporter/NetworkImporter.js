/*globals define*/
/*jshint node:true, browser:true*/

/**
* Generated by PluginGenerator from webgme on Sat Aug 01 2015 20:03:52 GMT-0500 (CDT).
*/

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    './AttributeMap',
    './../common/utils'
], function (PluginConfig, PluginBase, AttributeMap, Utils) {
    'use strict';

    // Utilities
    var not = function(fn) {
        return function() {
            return !fn.apply(null, arguments);
        };
    };

    var extend = function(base) {
        var src;
        for (var i = 1; i < arguments.length; i++) {
            src = arguments[i];
            for (var key in src) {
                base[key] = src[key];
            }
        }
    };

    var isPrimitive = function(obj) {
        return typeof obj !== 'object' || obj instanceof Array;
    };

    /**
    * Initializes a new instance of NetworkImporter.
    * @class
    * @augments {PluginBase}
    * @classdesc This class represents the plugin NetworkImporter.
    * @constructor
    */
    var NetworkImporter = function () {
        // Call base class' constructor.
        PluginBase.call(this);
    };

    // Prototypal inheritance from PluginBase.
    NetworkImporter.prototype = Object.create(PluginBase.prototype);
    NetworkImporter.prototype.constructor = NetworkImporter;

    NetworkImporter.prototype.getConfigStructure = function() {
        return [
            {
                'name': 'prototxt',
                'displayName': 'Caffe Network Prototxt',
                'description': '',
                'value': '',
                'valueType': 'asset',
                'readOnly': false
            }
        ];
    };

    /**
    * Gets the name of the NetworkImporter.
    * @returns {string} The name of the plugin.
    * @public
    */
    NetworkImporter.prototype.getName = function () {
        return 'Network Importer';
    };

    /**
    * Gets the semantic version (semver.org) of the NetworkImporter.
    * @returns {string} The version of the plugin.
    * @public
    */
    NetworkImporter.prototype.getVersion = function () {
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
    NetworkImporter.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this;
        // Get the text from the config
        var currentConfig = self.getCurrentConfig(),
            prototxtHash = currentConfig.prototxt;

        // Parse the layers from the Caffe prototxt file
        self.blobClient.getObject(prototxtHash, function(err, arrayBuffer) {
            var prototxt = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)),
                nameRegex,
                name = 'Caffe_'+new Date(),
                regexResult,
                layers;

            nameRegex = /name:\s+"(\w+)"/;
            regexResult = nameRegex.exec(prototxt);
            if (regexResult !== null) {
                name = regexResult[1];
            }

            layers = NetworkImporter.parseLayersFromPrototxt(prototxt);

            // Create a model from the layers
            self.createCnnModel(name, layers);

            // Save
            self.result.setSuccess(true);
            self.save('added obj', function (err) {
                callback(null, self.result);
            });
        });

    };

    NetworkImporter.prototype.createCnnModel = function(name, layers) {
        var lowerToMetaName = {},
            self = this,
            cnn,
            nodeMap = {},
            nodeList = [];

        // Get a map of lowercase names to proper case
        Object.keys(this.META).forEach(function(name) {
            lowerToMetaName[name.toLowerCase()] = name;
        });

        // Create the CNN parent in the root
        cnn = this.core.createNode({parent: this.rootNode, base: this.META.CNN});
        this.core.setAttribute(cnn, 'name', name);

        // Create the nodes
        layers.forEach(function(layer) {
            var type = layer.type.toLowerCase(),
                name = layer.name,
                base = self.META[lowerToMetaName[type]],
                node = self.core.createNode({parent: cnn, base: base});

            // Add attributes
            self.addNodeAttributes(layer, node);
            nodeMap[name] = node;
            nodeList.push(node);
        });

        var // FIXME: finish this for positioning
            // edges = {},  // The "bottom" names for each
            adjacencyList = {},
            edge;

        // Connect the nodes to each "top" node and create adjacency list
        nodeList.forEach(function(node) {
            adjacencyList[self.core.getGuid(node)] = [];
        });

        layers.forEach(function(layer) {
            var nextLayers = layer.top || [],
                prevLayers = layer.bottom || [];

            prevLayers
            // Ignore self connections as they represent inplace transformations
            // and are Caffe-specific
            .filter(not(Utils.equals.bind(null, layer.name)))
            .forEach(function(neighbor) {
                // Create an edge between layer and neighbor
                edge = self.core.createNode({parent: cnn, 
                    base: self.META.LayerConnector});

                self.core.setPointer(edge, 'src', nodeMap[neighbor]);
                self.core.setPointer(edge, 'dst', nodeMap[layer.name]);
                // Add to adjacency list
                var srcGuid = self.core.getGuid(nodeMap[neighbor]),
                    dstGuid = self.core.getGuid(nodeMap[layer.name]);
                adjacencyList[srcGuid].push(dstGuid);
            }); });

        // Position the nodes in an intelligent way
        var nodeDict = {};
        for (var i = nodeList.length; i--;) {
            nodeDict[self.core.getGuid(nodeList[i])] = nodeList[i];
        }
        self.positionNodes(nodeDict, adjacencyList);
    };

    NetworkImporter.prototype.addNodeAttributes = function(layer, node) {
        var self = this,
            layerToAttribute = AttributeMap[layer.type],
            layerKeys = Object.keys(layerToAttribute);

        self.core.setAttribute(node, 'name', name);
        // Add the rest of the attributes
        layerKeys.forEach(function(key) {
            self.core.setAttribute(node, layerToAttribute[key], layer[key]);
        });
    };

    /**
     * Parse Caffe's prototxt and create the CNN layers
     *
     * @param {String} prototxt
     * @return {Layers[]}
     */
    NetworkImporter.parseLayersFromPrototxt = function(prototxt) {
        var layers;

        // Convert to nodes
        layers = prototxt.split("layer");
        layers.shift();  // Remove any content before the first layer (ie, name)
        return layers.map(NetworkImporter.parseLayer);
    };

    NetworkImporter.parseLayer = function(text) {
        // Convert the caffe prototxt to a JSON
        var cleanedText = text

            // Remove sub params
            .replace(/(\w+)\s*{/g, function(a,b) {
                return '"'+b+'": {';
            })

            // Put quotes around the keys and maybe the values
            .replace(/(\w+)\s*:/g, function(a,b) {
                return '"'+b+'":';
            })
            // ... and maybe the values
            .replace(/:\s*(\w+)/g, function(a,b) {
                try {
                    JSON.parse(b); // Check if it is valid JS
                    return a;
                } catch (e) {
                    return ': "'+b+'"';
                }
            })

            // Add commas to the end of the attributes
            .replace(/("\w+"\s*:\s*["\w\d\\\/\.]+)/g, function(a,b) {
                return b+',';
            })
            .replace(/}/g, '},')
            // Remove extra commas
            .replace(/,\s*}/g, '}');

        // Remove the last comma
        var i = cleanedText.lastIndexOf(',');
        // Convert duplicates to an array
        var layerJson = NetworkImporter.handleRouteDuplicates(cleanedText.substring(0, i));
        var layer = JSON.parse(layerJson);

        // Flatten the layer
        return NetworkImporter.flattenWithPrefix('', layer);
    };

    /**
     * Condense duplicate top/bottom path keys to an array of values.
     *
     * @param {String} layer
     * @return {undefined}
     */
    NetworkImporter.handleRouteDuplicates = function(layer) {
        // For each key, check for duplicates and create an array
        var keys = {
                '"top":': /"top"\s*:\s*(["\w\d]+)/g,
                '"bottom":': /"bottom"\s*:\s*(["\w\d]+)/g
            },
            pairs;

        // toPairs
        pairs = Object.keys(keys).map(function(key) {
            return [key, keys[key]];
        });

        return pairs.reduce(function(prevLayer, pair) {
            pair.unshift(prevLayer);
            return NetworkImporter.handleDuplicates.apply(null, pair);
        }, layer);

        // Get the keys with multiple values
        // add them 
        // TODO: Finish this
    };

    NetworkImporter.handleDuplicates = function(layer, key, regex) {
        // Get all matches from the regex (first parentheses)
        var matches = [],
            match = regex.exec(layer),
            matchesList;

        while (match !== null) {
            matches.push(match[1]);
            match = regex.exec(layer);
        }

        // Combine the matches into an array
        matchesList = ' ['+matches.join(', ')+']';

        // Replace all matches in layer to the array
        return layer.replace(regex, key+matchesList);
    };

    NetworkImporter.flattenWithPrefix = function(prefix, object) {
        var ids = Object.keys(object),
            flatObject = {};

        for (var i = ids.length; i--;) {
            if (isPrimitive(object[ids[i]])) {
                flatObject[prefix+ids[i]] = object[ids[i]];
            } else {
                extend(flatObject, 
                    NetworkImporter.flattenWithPrefix(prefix+ids[i]+'_' ,object[ids[i]]));
            }
        }

        return flatObject;
    };

    // Positioning utilities
    NetworkImporter.prototype.positionNodes = function(nodes, al) {
        var positions = this.getNodePositions(nodes, al);
        // position the nodes!
        var startX = 50, 
            startY = 50,
            dx = 180,dy = 80,
            node,
            x,y;

        for (var row = 0; row < positions.length; row++) {
            y = startY+row*dy;
            for (var col = 0; col < positions[row].length; col++) {
                x = startX+col*dx;
                node = positions[row][col];
                if (node) {  // set position
                    this.core.setRegistry(node, 'position', {x:x,y:y});
                }
            }
        }
    };

    NetworkImporter.prototype.getNodePositions = function(nodes, al) {
        // Position the nodes given the edges in the adjacency list
        var sortedNodes,
            nodesToPosition = {},  // node -> (row, col)
            nodeId,
            maxNode,
            positions = [],
            nodeIds,
            getMaxPosition = function(position, ancestor) {
                if (nodesToPosition[ancestor] && nodesToPosition[ancestor][0] > position[0]) {
                    return nodesToPosition[ancestor];
                }
                return position;
            },
            incomingEdges;

        nodeIds = Object.keys(nodes);
        sortedNodes = Utils.topologicalSort(nodeIds, al);
        incomingEdges = Utils.reverseAdjacencyList(al);

        // Iterate through the sorted nodes
        var col, row,
            position;
        while (sortedNodes.length) {
            // For each node, get the nodes with outgoing connections to the node
            nodeId = sortedNodes.shift();
            // Get the node with the highest layer
            position = incomingEdges[nodeId].reduce(getMaxPosition, [-1,-1]);
            row = position[0]+1;
            col = position[1];
            // Add the node to the position matrix
            if (positions.length === row) {
                positions.push([]);
            }
            // Add columns as needed
            while (positions[row].length <= col) {
                positions[row].push(null);
            }
            // Find the first open column
            while (positions[row][col] !== null) {
                col++;
                if (positions[row].length === col) {
                    positions[row].push(null);
                }
            }
            positions[row][col] = nodes[nodeId];
            nodesToPosition[nodeId] = [row, col];
        }
        return positions;
    };

    return NetworkImporter;
});
