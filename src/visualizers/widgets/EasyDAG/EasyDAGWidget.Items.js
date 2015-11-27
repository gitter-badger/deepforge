define(['d3'], function() {

    var EasyDAGWidgetItems = function() {
        this.items = {};
    };

    EasyDAGWidgetItems.prototype.addItem = function(desc) {
        // Change this to draw the decorator
        // TODO
        var item = this.$svg
            .append('circle')
            .attr('r', 50)
            .attr('fill', '#2196f3')
            .attr('cx', desc.x)
            .attr('cy', desc.y);

        this.items[desc.id] = item;
    };

    EasyDAGWidgetItems.prototype.updateItem = function(desc) {
        // TODO
        var item = this.items[desc.id];
    };

    EasyDAGWidgetItems.prototype.moveItem = function(desc) {
        this.items[desc.id].transition()
            .duration(200)
            .attr('cx', desc.x)
            .attr('cy', desc.y);
    };

    // Draw connections
    // TODO

    return EasyDAGWidgetItems;
});
