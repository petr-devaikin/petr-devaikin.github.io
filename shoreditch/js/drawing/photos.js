define(['libs/d3', 'constants', 'drawing/basics'], function(d3, constants, basics) {
    function drawPhotos(data) {
        d3.selectAll('.photos')
            .style('width', basics.scale(constants.streetLength) + 'px');


        drawAllPhotos(data);
        drawHourPhotos(data);
        drawWeekPhotos(data);
    }

    function setDayParams(selection) {
        selection
            .classed('day', true)
            .style('width', constants.stepLength / constants.streetLength * constants.streetWidth + 'px');
    }

    function setHourParams(selection) {
        selection
            .classed('hour', true);
    }

    function setWeekDayParams(selection) {
        selection
            .classed('weekDay', true);
    }

    function setSmallPhoto(selection) {
        selection
            .classed('smallPhoto', true)
            .style('background-color', function(d) { return 'rgb(' + d.color.join(',') + ')'; });
    }

    function drawAllPhotos(data) {
        var allPhotosSteps = basics.allPhotosContainer.selectAll('.day')
                .data(data)
            .enter().append('div')
                .call(setDayParams);

        allPhotosSteps.selectAll('.smallPhoto')
                .data(function(d) { return d; })
            .enter().append('div')
                .call(setSmallPhoto);
    }

    function drawHourPhotos(data) {
        var hourPhotosSteps = basics.hourPhotosContainer.selectAll('.day')
                .data(data)
            .enter().append('div')
                .call(setDayParams);

        hourPhotosSteps.each(function (d) {
            var hours = [];
            for (var i = 0; i < 12; i++) {
                hours[i] = d.filter(function(p) {
                    return Math.floor((new Date(p.date * 1000)).getHours() / 2) == i;
                });
            }
            console.log(hours);

            var hourBlocks = d3.select(this).selectAll('.hour')
                    .data(hours)
                .enter().append('div')
                    .call(setHourParams);

            hourBlocks.selectAll('.smallPhoto')
                    .data(function(d) { return d; })
                .enter().append('div')
                    .call(setSmallPhoto);
        });
    }

    function drawWeekPhotos(data) {
        var weekPhotosSteps = basics.weekPhotosContainer.selectAll('.day')
                .data(data)
            .enter().append('div')
                .call(setDayParams);

        weekPhotosSteps.each(function (d) {
            var days = [];
            for (var i = 0; i < 7; i++) {
                days[i] = d.filter(function(p) { return (new Date(p.date * 1000)).getDay() == (i + 1) % 7; });
            }

            var dayBlocks = d3.select(this).selectAll('.weekDay')
                    .data(days)
                .enter().append('div')
                    .call(setWeekDayParams);

            dayBlocks.selectAll('.smallPhoto')
                    .data(function(d) { return d; })
                .enter().append('div')
                    .call(setSmallPhoto);
        });
    }

    return {
        draw: drawPhotos,
    }
});