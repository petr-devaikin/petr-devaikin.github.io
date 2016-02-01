define(['lib/d3', 'interaction/updater', 'interaction/events'], function(d3, updater, events) {
    var mapContainer = d3.select('.m-map');
    var startPoint = undefined;

    var mapSelection = d3.select('.m-map__selection');
    var topLayer = mapSelection;//d3.select('.m-map__photos');

    function hideSelection() {
        mapSelection.style('opacity', 0);
        updater.updateMapFilter(undefined);
        mapSelection.style('z-index', 2);
    }

    function showSelection() {
        mapSelection.style('opacity', 1);
    }

    function updateSelection(saveFilter) {
        var endPoint = d3.mouse(mapContainer.node());

        var x1 = Math.min(startPoint[0], endPoint[0]),
            y1 = Math.min(startPoint[1], endPoint[1]),
            x2 = Math.max(startPoint[0], endPoint[0]),
            y2 = Math.max(startPoint[1], endPoint[1]);

        mapSelection
            .style('left', x1 + 'px')
            .style('top', y1 + 'px')
            .style('width', (x2 - x1) + 'px')
            .style('height', (y2 - y1) + 'px');

        if (saveFilter !== undefined) {
            updater.updateMapFilter(x1, y1, x2 - x1, y2 - y1);
            mapSelection.style('z-index', 4);
        }
        else
            mapSelection.style('z-index', 2);


        if ((x1 == x2 || y1 == y2) && saveFilter !== undefined ) {
            hideSelection();
        }
        else {
            showSelection();
        }
    }

    function activate() {
        mapContainer.on('mousedown', function() {
            d3.event.preventDefault();
            startPoint = d3.mouse(mapContainer.node());
            events.deselectPhoto();
        });

        d3.select('.m-map__photos').on('mousedown', function() {
            console.log('asdasd');
            d3.event.preventDefault();
            startPoint = d3.mouse(mapContainer.node());
            events.deselectPhoto();
        });

        mapContainer.on('mouseup', function() {
            d3.event.preventDefault();

            if (startPoint !== undefined) {
                updateSelection(true);
                startPoint = undefined;
            }
        });

        /*mapContainer.on('mouseleave', function() {
            d3.event.preventDefault();
            if (startPoint !== undefined) {
                startPoint = undefined;
                hideSelection();
            }
        });*/

        mapContainer.on('mousemove', function() {
            d3.event.preventDefault();
            if (startPoint !== undefined)
                updateSelection();
        });
    }


    return {
        activate: activate
    }
});
