// I call this "micro" as it tests individual functions within the plugin
var fs = require('fs'),
    requirejs = require('webgme').requirejs,
    assert = require('assert'),
    NetworkImporter;

describe('parseLayersFromPrototxt', function() {
    before(function(done) {
        requirejs([
            '../../../src/plugin/NetworkImporter/NetworkImporter'
        ], function(Importer) {
            NetworkImporter = Importer;
            done();
        });
    });

    it('should have top or bottom for each layer', function() {
        var cxxnet,
            layers;

        cxxnet = fs.readFileSync(__dirname+'/assets/CXXNet.prototxt','utf8');
        layers = NetworkImporter.parseLayersFromPrototxt(cxxnet);

        layers.forEach(function(layer) {
            assert(layer.top || layer.bottom || layer.type === 'Data', 
                'Layer '+layer.name+' is missing top and bottom:\n'+
                JSON.stringify(layer));
        });
    });
});
