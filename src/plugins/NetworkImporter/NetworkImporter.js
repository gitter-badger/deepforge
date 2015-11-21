/*globals define*/
/*jshint node:true, browser:true*/

/**
* Generated by PluginGenerator from webgme on Sat Aug 01 2015 20:03:52 GMT-0500 (CDT).
*/

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    './AttributeMap',
    './../common/utils',
    '../common/CaffeInPlaceLayers'
], function (
    PluginConfig,
    PluginBase,
    AttributeMap,
    Utils,
    InPlaceLayers
) {
    'use strict';

    // Utilities
    var not = function(fn) {
        return function() {
            return !fn.apply(null, arguments);
        };
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

            var error = NetworkImporter.findCriticalErrors(layers);
            if (error) {
                self.result.setSuccess(false);
                self.result.setError(error);
                return callback(error, self.result);
            }

            // Create a model from the layers
            self.convertDataToInputLayer(layers);
            self.createCnnModel(name, layers);

            // Save
            self.result.setSuccess(true);
            self.save('Imported network: '+name, function (err) {
                callback(null, self.result);
            });
        });

    };

    // Replace any data layer with an "input" layer
    NetworkImporter.prototype.convertDataToInputLayer = function(layers) {
        var dataTypes = this.getDataTypeNames();
        layers.forEach(function(layer) {
            if (dataTypes.indexOf(layer.type.toLowerCase()) !== -1) {
                layer.type = 'Input';
            }
        });
    };

    NetworkImporter.prototype.getDataTypeNames = function() {
        var self = this,
            dataBase = this.META.DataBase;

        return Object.keys(this.META)
            .filter(function(name) {
                var node = self.META[name];
                return node !== dataBase && self.isMetaTypeOf(node, dataBase);
            })
            .map(function(name) {
                return name.toLowerCase();
            });
    };

    NetworkImporter.prototype.createCnnModel = function(name, layers) {
        var lowerToMetaName = {},
            self = this,
            cnn,
            nodeMap = {},
            nodeList = [],
            labelLayer = this.findLabelLayer(layers),
            createLayer;

        // Get a map of lowercase names to proper case
        Object.keys(this.META).forEach(function(name) {
            lowerToMetaName[name.toLowerCase()] = name;
        });

        // Create the CNN parent in the root
        cnn = this.core.createNode({parent: this.rootNode, base: this.META.CNN});
        this.core.setAttribute(cnn, 'name', name);

        // Create the nodes
        createLayer = function(layer) {
            var type = layer.type.toLowerCase(),
                name = layer.name,
                base = self.META[lowerToMetaName[type]],
                node = self.core.createNode({parent: cnn, base: base});

            // Add attributes
            self.addNodeAttributes(layer, node);
            nodeMap[name] = node;
            nodeList.push(node);

            // Check for edges to "label"
            if (labelLayer) {
                if (layer.top && layer.top.indexOf(labelLayer.name) !== -1) {
                    labelLayer.bottom.push(name);
                }

                if (layer.bottom && layer.bottom.indexOf(labelLayer.name) !== -1) {
                    labelLayer.top.push(name);
                }
            }
        };

        layers.forEach(createLayer);

        // If 'label' layer exists in the prototxt, create it
        if (labelLayer) {
            createLayer(labelLayer);
            layers.push(labelLayer);
        }

        var adjacencyList = {},
            edge;

        // Connect the nodes to each "top" node and create adjacency list
        nodeList.forEach(function(node) {
            adjacencyList[self.core.getGuid(node)] = [];
        });

        // Handle the in-place transformations
        this.resolveInPlaceComputation(layers);

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
            }); 
        });

        // Position the nodes in an intelligent way
        var nodeDict = {};
        for (var i = nodeList.length; i--;) {
            nodeDict[self.core.getGuid(nodeList[i])] = nodeList[i];
        }
        self.positionNodes(nodeDict, adjacencyList);
    };

    // Find the implied label layer, if it exists
    NetworkImporter.prototype.findLabelLayer = function (layers) {
        var name = null;
        for (var i = layers.length; i--;) {
            if (layers[i].top.length > 1 && layers[i].type.toLowerCase() === 'data') {
                name = layers[i].top[1];
            }
        }

        return !name ? null :
            {
                type: 'label',
                name: name,
                top: [],
                bottom: []
            };
    };

    NetworkImporter.prototype.resolveInPlaceComputation = function (layers) {
        // For each layer, if it is an InPlaceLayer, check if it is actually
        // using in place computation (top is the same as bottom). If so, then
        // get the previous layer's out edges (minus the current) and set them
        // to the current layer's out edges (removing them from the prev layer)

        // First, create a dictionary
        var layerMap = {},
            hasPreviousEdgeTo = {},
            prev,
            j,
            i;

        for (i = layers.length; i--;) {
            layerMap[layers[i].name] = layers[i];

            // Store this node by it's in edges
            if (layers[i].bottom) {
                for (j = layers[i].bottom.length; j--;) {
                    prev = layers[i].bottom[j];
                    if (!hasPreviousEdgeTo[prev]) {
                        hasPreviousEdgeTo[prev] = [];
                    }
                    hasPreviousEdgeTo[prev].push(layers[i]);
                }
            }
        }

        // Now, for each of the layers, find out if it is performing in-place
        // computation. If so, modify the layers info so it is better represented
        // in the WebGME (Don't worry - it will get converted back on export).
        var isInPlace,
            nextLayers,
            current,
            index,
            next;

        for (i = layers.length; i--;) {
            current = layers[i];
            if (InPlaceLayers[current.type.toLowerCase()]) {  // Supports in-place
                isInPlace = current.bottom.length === 1 &&
                    current.top.length === 1 &&
                    current.bottom[0] === current.top[0];

                if (isInPlace) {  // Is actually using in-place comp
                    // Get next layer's in-edges and change the previous layer's
                    // entry to the current edge
                    prev = current.bottom[0];
                    nextLayers = hasPreviousEdgeTo[prev].filter(function(layer) {
                        return layer.name !== current.name;
                    });

                    // Replace "prev" with "current" in the in-edges of "next"
                    for (var j = nextLayers.length; j--;) {
                        index = nextLayers[j].bottom.indexOf(prev);
                        nextLayers[j].bottom.splice(index, 1, current.name);
                    }
                }
            }
        }
    };

    NetworkImporter.prototype.addNodeAttributes = function(layer, node) {
        var self = this,
            layerToAttribute = AttributeMap[layer.type.toLowerCase()],
            layerKeys = Object.keys(layerToAttribute);

        self.core.setAttribute(node, 'name', layer.name);
        // Add the rest of the attributes
        layerKeys.forEach(function(key) {
            // Only add it if specified in the file. This could cause problems if
            // two different tools (eg, Torch and Caffe) have different defaults
            // TODO: Consider replacing this with the default Caffe value.
            if (layer[key]) {
                self.core.setAttribute(node, layerToAttribute[key], layer[key]);
            }
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
        var cleanedText,
            layerJson,
            layer,
            i;

        // Convert the caffe prototxt to a JSON
        cleanedText = text

            // Remove sub params
            .replace(/(\w+)\s*{/g, function(a,b) {
                return '"'+b+'": {';
            })

            // Put quotes around the keys and maybe the values
            .replace(/(\w+)\s*:/g, function(a,b) {
                return '"'+b+'":';
            })
            // ... and maybe the values
            .replace(/:\s*([-\w]+)/g, function(a,b) {
                try {
                    JSON.parse(b); // Check if it is valid JS
                    return a;
                } catch (e) {
                    return ': "'+b+'"';
                }
            })

            // Add commas to the end of the attributes
            .replace(/("\w+"\s*:\s*["\w\d\\\/\-\.]+)/g, function(a,b) {
                return b+',';
            })
            .replace(/}/g, '},')
            // Remove extra commas
            .replace(/,\s*}/g, '}');

        // Remove the last comma
        i = cleanedText.lastIndexOf(',');
        // Convert duplicates to an array
        layerJson = NetworkImporter.handleRouteDuplicates(cleanedText.substring(0, i));
        try {
            layer = JSON.parse(layerJson);
        } catch(e) {
            // TODO: Report the error
            console.error('Cannot parse layer:', e);
        }

        // Flatten the layer
        var flatLayer = Utils.omit(layer, ['top', 'bottom']);
        flatLayer = Utils.flattenWithPrefix('', flatLayer);
        flatLayer.top = layer.top;
        flatLayer.bottom = layer.bottom;
        return flatLayer;
    };

    /**
     * Condense duplicate top/bottom path keys to an array of values.
     *
     * @param {String} layer
     * @return {undefined}
     */
    NetworkImporter.handleRouteDuplicates = function(layer) {
        // For each key, check for duplicates and create an array
        var keys = NetworkImporter.getKeysFromLayer(layer),
            pairs;

        // toPairs
        pairs = Object.keys(keys).map(function(key) {
            return [key, keys[key]];
        });

        return pairs.reduce(function(prevLayer, pair) {
            pair.unshift(prevLayer);
            return NetworkImporter.handleDuplicates.apply(null, pair);
        }, layer);
    };

    NetworkImporter.getKeysFromLayer = function(layer) {
        return {
            '"top":': /"top"\s*:\s*(["\w\d\/\-]+)/g,
            '"bottom":': /"bottom"\s*:\s*(["\w\d\/\-]+)/g,
            '"param":': /"param"\s*:\s*({[\s\S.]+?})/g
        };
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

    NetworkImporter.findCriticalErrors = function(layers) {
        // Check for layers in AttributeMap
        for (var i = layers.length; i--;) {
            if (!AttributeMap[layers[i].type.toLowerCase()]) {
                return 'Unsupported layer type: "'+layers[i].type+'". Please check the project META and AttributeMap';
            }
        }
        return null;
    };

    return NetworkImporter;
});
