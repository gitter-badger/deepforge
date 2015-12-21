define(['d3'], function() {
    'use strict';
    
    var MARGIN = 10,
        DOTTED_COLOR = '#0099ff',
        BUTTON_SIZE = 20,
        BUTTON_COLOR = '#aeaeae',
        BUTTON_COLOR_INACTIVE = '#333333';  // TODO: on mouse over

    var SelectionManager = function(widget) {
        this._widget = widget;  // This is used for the action callbacks
        this.$parent = widget.$svg;
        this.$el = this.$parent
            .append('g')
            .attr('class', 'selection-container');
        this.$selection = null;
        this._selectedItem = null;
        this.initActions();
    };

    SelectionManager.prototype.initActions = function() {
        this.ACTIONS = {
            add: this._widget.onAddButtonClicked.bind(this._widget),
            remove: (item) => {
                this._widget.removeItem(item);
                this.deselect();
            },
            move: this._widget.showMoves.bind(this._widget)
        };
    };

    SelectionManager.prototype.select = function(item) {
        var x,
            y;

        if (item !== this._selectedItem) {
            this.deselect();
            this._selectedItem = item;
            item.onSelect();
        }
    };

    SelectionManager.prototype.deselect = function() {
        if (this._selectedItem) {
            this._selectedItem.onDeselect();
            this._selectedItem = null;
        }
        this._deselect();
    };

    SelectionManager.prototype._deselect = function() {
        // Remove the action buttons
        if (this.$selection) {
            this.$selection.remove();
        }
    };

    // Private
    SelectionManager.prototype.redraw = function() {
        var item = this._selectedItem,
            left,
            top,
            width,
            height;

        this._deselect();
        if (item) {
            left = item.x - item.width/2 - MARGIN;
            top = item.y - (item.height/2) - MARGIN;
            width = item.width + 2*MARGIN;
            height = item.height + 2*MARGIN;

            this.$selection = this.$el
                .append('g')
                .attr('transform', `translate(${left},${top})`);

            // Selection outline
            this.$selection.append('path')
                .attr('d', `M 0 0 l ${width} 0 l 0 ${height}` +
                    ` l ${-width} 0 l 0 ${-height}`)
                .attr('class', 'selection-outline')
                .attr('stroke-dasharray', '4,4')
                .attr('stroke', DOTTED_COLOR)
                .attr('fill', 'none')
                .attr('opacity', 1)

            this._createActionButtons(width, height);
        }
    };

    SelectionManager.prototype._createActionButtons = function(width, height) {
        // Check if the selected item can have successors
        var successorNodes = this._widget.getValidSuccessorNodes(this._selectedItem.id);
        this._createActionButton('add', width/2, height, successorNodes.length === 0);

        // Remove button
        this._createActionButton('remove', width/2, 0);

        // Move button
        // TODO: Add this later
        //this._createActionButton('move', width, 0);

    };

    SelectionManager.prototype._createActionButton = function(action, cx, cy, inactive) {
        var button,
            color = inactive ? BUTTON_COLOR_INACTIVE : BUTTON_COLOR,  // FIXME: This would be better as css
            x = cx - BUTTON_SIZE/2,
            y = cy - BUTTON_SIZE/2;

        button = this.$selection
            .append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', BUTTON_SIZE)
            .attr('height', BUTTON_SIZE)
            .attr('class', 'buttons action ' + action)
            .attr('fill', color);

        if (!inactive) {
            button.on('click', this._onBtnPressed.bind(this, action))
        }

        return button;
    };

    SelectionManager.prototype._onBtnPressed = function(action) {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        this.ACTIONS[action].call(this, this._selectedItem);
    };

    return SelectionManager;
});
