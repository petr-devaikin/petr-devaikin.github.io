define(['lib/d3', 'interaction/updater', 'drawing/preview', 'constants'], function(d3, updater, preview, constants) {
    var timelineContainer = d3.select('.m-timeline-b__photos');
    var inner = d3.select('.m-photos__set__inner');


    function selectPhoto(id) {
        deselectPhoto();

    }

    function deselectPhoto() {
        inner.selectAll(".m-photos__set__inner__photo.selected")
            .classed('selected', false);
    }

    return {
        selectPhoto: selectPhoto,
        deselectPhoto: deselectPhoto
    }
});
