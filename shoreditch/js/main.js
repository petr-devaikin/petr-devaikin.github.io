
define(['lib/d3', 'drawing/palette', 'drawing/timelineb', 'drawing/map', 'interaction/map_selector', 'interaction/timeline_selector',  'drawing/preview', 'interaction/updater'],
        function(d3, drawingPalette, drawingTimelineB, drawingMap, mapSelector, timelineSelector, drawingPhotos, updater) {


    return function() {
        d3.json("js/photos.json?v=" + (new Date()).getTime(), function(data) {
            data.sort(function (a, b) {
                var aColor = d3.rgb(a.main_color),
                    bColor = d3.rgb(b.main_color);

                return aColor.hsl().h === NaN || bColor.hsl().h - aColor.hsl().h;
            });

            drawingTimelineB.prepareData(data);
            drawingPhotos.prepareData(data);
            drawingMap.prepareData(data, startDrawing);

            function startDrawing(newData) {
                updater.setOriginalData(newData);
                mapSelector.activate();
                timelineSelector.activate();
            }
        });
    }
})
