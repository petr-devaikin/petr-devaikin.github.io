define(['lib/d3', 'constants', 'interaction/events'], function(d3, constants, events) {
    var container = d3.select('.m-photos__set');
    var inner = d3.select('.m-photos__set__inner');
    var data;
    var limit = 0;
    var step = 100;


    var photoSize = 170;


    container.on('scroll', function() {
        var scrollPosition = container.node().scrollTop;
        var containerHeight = container.node().getBoundingClientRect().height;
        var innerHeight = inner.node().getBoundingClientRect().height;
        if (scrollPosition + containerHeight + 200 > innerHeight) {
            limit += step;
            updateDrawings();
        }
    });

    function updateDrawings() {
        inner.selectAll(".m-photos__set__inner__photo")
            .remove();

        var photos = inner.selectAll(".m-photos__set__inner__photo")
                .data(data.slice(0, limit), function(d) { return d.id; });

        photos.enter()
            .append("div")
            .classed("m-photos__set__inner__photo", true)
            .style('background', function(d) { return 'url(' + d.thumb + ')';})
            .on('click', function(d) {
                events.selectPhoto(d);
            });

    }

    function prepareData() {

    }

    function drawData(newData) {
        var containerSize = container.node().getBoundingClientRect();
        step = Math.floor(containerSize.width / photoSize) * Math.floor(containerSize.height / photoSize) * 3;

        d3.select('.counter').html(newData.length);

        limit = step;
        data = newData;
        updateDrawings();
    }

    return {
        prepareData: prepareData,
        draw: drawData,
    }
});
