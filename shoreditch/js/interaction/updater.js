define(['lib/d3', 'drawing/timelineb', 'drawing/map', 'drawing/preview'], function(d3, timeline, map, preview) {
    var originalData = [];

    var mapFilter = undefined;
    var timelineFilter = undefined;
    var tagFilter = undefined;

    d3.select('.searchField').on('keyup', function() {
        tagFilter = d3.select('.searchField').node().value.toUpperCase();
        update();
    });

    function mapFilterFunc(d) {
        return d.position.x >= mapFilter.x && d.position.x <= mapFilter.x + mapFilter.width &&
            d.position.y >= mapFilter.y && d.position.y <= mapFilter.y + mapFilter.height;
    }

    function timelineFilterFunc(d) {
        return d.date*1000 >= timelineFilter.start.getTime() && d.date*1000 <= timelineFilter.end.getTime();
    }

    function update() {
        var tagFilteredData = originalData;

        if (tagFilter !== undefined && tagFilter != "")
            tagFilteredData = originalData.filter(function(d) {
                for (var i = 0; i < d.tags.length; i++)
                    if (d.tags[i].toUpperCase().indexOf(tagFilter) != -1)
                        return true;
                return false;
            });

        var mapData = tagFilteredData;
        var timelineData = tagFilteredData;
        var photosData = tagFilteredData;


        if (mapFilter !== undefined && mapFilter.width > 0 && mapFilter.height > 0) {
            timelineData = timelineData.filter(mapFilterFunc);
            photosData = photosData.filter(mapFilterFunc);
        }

        if (timelineFilter !== undefined && timelineFilter.end > timelineFilter.start) {
            mapData = mapData.filter(timelineFilterFunc);
            photosData = photosData.filter(timelineFilterFunc);
        }

        map.draw(mapData);
        timeline.draw(timelineData);
        preview.draw(photosData);
    }

    function setOriginalData(data) {
        originalData = data;

        update();
    }

    function updateMapFilter(x, y, width, height) {
        if (x === undefined)
            mapFilter = undefined;
        else
            mapFilter = {
                x: x,
                y: y,
                width: width,
                height: height
            }

        update();
    }

    function updateTimelineFilter(startDate, endDate) {
        if (startDate === undefined)
            timelineFilter = undefined;
        else
            timelineFilter = {
                start: startDate,
                end: endDate
            }

        update();
    }

    return {
        setOriginalData: setOriginalData,
        updateMapFilter: updateMapFilter,
        updateTimelineFilter: updateTimelineFilter
    }
});
