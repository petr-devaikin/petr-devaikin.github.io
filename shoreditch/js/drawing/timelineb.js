define(['lib/d3', 'constants', 'interaction/events', 'constants'], function(d3, constants, events, constants) {
    var container = d3.select('.m-timeline-b svg');
    var highlighter = d3.select('.m-timeline-b__photos__highlighter');

    var zero = new Date(2015, 0, 1, 0, 0, 0, 0);

    var margin = constants.timeline.margin,
        width = constants.timeline.width,
        height = constants.timeline.height,
        squareSize = constants.timeline.squareSize;

    //Create scale functions

    var xScale = d3.time.scale()
                        .domain([zero, new Date(2016, 0, 1)])
                        .range([0, width]);

    function getScale() {
        return xScale;
    }
    //Define X axis
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(d3.time.month, 1)
                      .tickSize(5, 0)
                      .tickFormat(d3.time.format("%b"));

    //Size
    container
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var diagramContainer = container.select('.m-timeline-b__photos');
    diagramContainer
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //Create X axis
    diagramContainer.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    function prepareData(data) {
    }

    function drawData(data) {
        var days = [];

        for (var i = 0; i < 365; i++){
            days[i] = [];
        }

        //puts the data into  days[], ordered by days, each number represents a day of the year

        for (var i = 0; i < data.length; i++) {
            var timeDiff = data[i].date * 1000 - zero.getTime();
            data[i].diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
            days[data[i].diffDays].push(data[i]);
        }

        //creates the div that contains the day square (X axis)
        var dayObjs = diagramContainer.select('.m-timeline-b__photos__days')
                        .selectAll('.m-timeline-b__photos__days__day').data(days);

        dayObjs.enter()
                .append('g')
                .classed('m-timeline-b__photos__days__day', true);

        var photoSquare = dayObjs.selectAll('rect')
            .data(function(d) { return d; }, function(d) { return d.id; })

        // UPDATE VISIBLE PHOTOS
        photoSquare
            .attr("y", function(d, i) { return height -5 - i * squareSize; });

        // ADD NEW
        photoSquare.enter()
            .append('rect')
            .classed('m-timeline-b__photos__days__day__photo', true)
            .attr("x", function(d, i) {return d.diffDays * squareSize; })
            .attr("y", function(d,i) {return height -5 - i * squareSize;})
            .attr("height", squareSize )
            .attr("width", squareSize)
            .style("fill", function(d) { return d.main_color; });

        // HIDE NOT RELEVANT
        photoSquare.exit()
            .remove();
    }

    function highlightDay(date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        highlighter
            .style('opacity', 1)
            .attr('transform', 'translate(' + xScale(date) + ',0)');

        highlighter.select('text')
            .html(date.getDate() + '/' + (date.getMonth() + 1) + '/2015');
    }

    function hideHighlighter() {
        highlighter
            .style('opacity', 0);
    }

    return {
        prepareData: prepareData,
        draw: drawData,
        getScale: getScale,
        highlightDay: highlightDay,
        hideHighlighter: hideHighlighter
    }
});
