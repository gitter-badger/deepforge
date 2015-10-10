define([
    'js/Widgets/DiagramDesigner/SelectionManager'
], function(
    GMESelectionManager
) {
    'use strict';
    var SelectionManager = function(params) {
        params.diagramDesigner = params.widget;
        GMESelectionManager.call(this, params);
    };

    _.extend(SelectionManager.prototype, GMESelectionManager.prototype);

    return SelectionManager;
});
