define(['lib/d3'], function(d3) {
    var originalData = [];

    var mapFilter = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    }

    function setOriginalData(data) {
        originalData = data;
    }

    function updateMapFilter(x, y, width, height) {

    }

    return {
        setOriginalData: setOriginalData,
        updateMapFilter: updateMapFilter
    }
});
