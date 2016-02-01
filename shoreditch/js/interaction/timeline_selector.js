define(['lib/d3', 'interaction/updater', 'drawing/timelineb', 'constants', 'interaction/events'], function(d3, updater, timeline, constants, events) {
    var timelineContainer = d3.select('.m-timeline-b__photos');
    var startPoint = undefined;

    var timelineSelection = d3.select('.m-timeline-b__selection');
    var timelineSelectionLeft = d3.select('.m-timeline-b__selection__left');
    var timelineSelectionRight = d3.select('.m-timeline-b__selection__right');
    var textLeft = d3.select('.m-timeline-b__selection__text-left');
    var textRight = d3.select('.m-timeline-b__selection__text-right');

    //timelineSelection.attr('transform', 'translate(50,0)');

    function hideSelection() {
        timelineSelection.style('display', 'none');
        updater.updateTimelineFilter(undefined);
    }

    function showSelection() {
        timelineSelection.style('display', 'block');
    }

    function updateSelection(saveFilter) {
        var endPoint = d3.mouse(timelineContainer.node());

        var x1 = Math.min(startPoint[0], endPoint[0]),
            x2 = Math.max(startPoint[0], endPoint[0]);

        if (x1 == x2 && saveFilter !== undefined ) {
            console.log('hide seleciton');
            hideSelection();
        }
        else {
            showSelection();
        }

        var startDate = timeline.getScale().invert(x1);
        var endDate = timeline.getScale().invert(x2);

        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);
        endDate.setHours(0);
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);

        timelineSelectionLeft
            .attr('transform', 'translate(0,0)');

        timelineSelectionLeft.selectAll('line')
            .attr('transform', 'translate(' + x1 + ',0)');
        timelineSelectionLeft.select('text')
            .attr('transform', 'translate(' + x1 + ',0)');
        timelineSelectionLeft.select('rect')
            .attr('width', x1);

        textLeft
            .html(startDate.getDate() + '/' + (startDate.getMonth() + 1) + '/2015');

        timelineSelectionRight
            .attr('transform', 'translate(' + x2 + ',0)')
            .attr('width', constants.timeline.width);

        textRight
            .html(endDate.getDate() + '/' + (endDate.getMonth() + 1) + '/2015');

        if (saveFilter !== undefined)
            updater.updateTimelineFilter(startDate, endDate);
    }

    function activate() {
        timelineContainer.on('mousedown', function() {
            d3.event.preventDefault();
            startPoint = d3.mouse(timelineContainer.node());
            timeline.hideHighlighter();
            events.deselectPhoto();
        });

        timelineContainer.on('mouseup', function() {
            d3.event.preventDefault();

            if (startPoint !== undefined) {
                updateSelection(true);
                startPoint = undefined;
            }
        });

        timelineContainer.on('mouseleave', function() {
            d3.event.preventDefault();
            if (startPoint !== undefined) {
                startPoint = undefined;
                hideSelection();
            }
            timeline.hideHighlighter();
        });

        timelineContainer.on('mousemove', function() {
            d3.event.preventDefault();
            if (startPoint !== undefined)
                updateSelection();
            else
                timeline.highlightDay(timeline.getScale().invert(d3.mouse(timelineContainer.node())[0]));
        });
    }

    return {
        activate: activate,
    }
});
