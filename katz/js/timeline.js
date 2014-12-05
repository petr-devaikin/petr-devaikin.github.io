var dayWidth = 25;
var maxColumnHeight = 250;
var maxDonateLength = 50;
var maxSumValue = 0;
var maxDonate = 0;
var donateStartAngle = 15;
var margin = 50;
var zoom;

var width,
    dX;

window.onresize = fit;

var dom = {}

function initDom() {
    dom.svg = d3.select('#graph');
    dom.container = d3.select('#container');
    dom.dataContainer = d3.select('#data');
    dom.days = d3.select('#days');
    dom.backs = d3.select('#backs');
    dom.foregs = d3.select('#foregs');
}

function calcConstants() {
    maxSumValue = d3.max(timelineData, function(d) { return d.sum; });
    maxDonate = d3.max(timelineData, function(d) {
        return d3.max(d.donates, function(d) { return d.sum; });
    });
}

function draw() {
    initDom();
    calcConstants();

    drawAxis();
    drawDays();

    zoom = d3.behavior.zoom()
        .on("zoom", zoomHandler);

    fit();

    zoom
        .scale(1)
        .translate([dX, 0]);

    dom.svg
        .call(zoom) // delete this line to disable free zooming
        .call(zoom.event);
}

function fit() {
    width = timelineData.length * dayWidth;
    var allWidth = document.getElementById('graph').offsetWidth;
    var allHeight = document.getElementById('graph').offsetHeight;
    dX = (allWidth - width) / 2;
    var dY = allHeight - (allHeight - maxColumnHeight - maxDonateLength) / 2;

    if (dX < margin)
        dX = margin;

    dom.container.attr('transform', 'translate(0, ' + dY + ')');

    dom.leftAxis.attr('x2', -dX);
    dom.rightAxis.attr('x1', width);
    dom.rightAxis.attr('x2', width + dX);

    d3.selectAll('.topBackground')
        .attr('y', -dY)
        .attr('height', dY);

    d3.selectAll('.bottomBackground')
        .attr('height', allHeight - dY);

    d3.selectAll('.leftBackground')
        .attr('x', -dX)
        .attr('width', dX);

    d3.selectAll('.rightBackground')
        .attr('x', width)
        .attr('width', dX);

    dom.foregrounds
        .attr('y', -dY)
        .attr('height', allHeight);
}

function getHeight(d) {
    return d.sum * maxColumnHeight / maxSumValue;
}

function drawAxis() {
    dom.leftAxis = d3.select('#timeAxis').append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 100)
        .attr('y2', 0);
    dom.rightAxis = d3.select('#timeAxis').append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 100)
        .attr('y2', 0);

    dom.days = dom.days.selectAll('.day')
            .data(timelineData)
        .enter().append('g')
            .classed('date', true);

    dom.days.append('text')
        .classed('day', true)
        .attr('fill', function(d, i) {
            return ((i + 1) % 7 > 4) ? '#F26666' : '#666';

        })
        .attr('x', function(d, i) {
            return (i + 0.5) * dayWidth;
        })
        .attr('y', 17)
        .text(function(d) {
            return d.day;
        });


    dom.days.filter(function(d, i) { return d.day == 1 || i == 0; }).append('text')
        .classed('month', true)
        .attr('x', function(d, i) {
            return timelineData.indexOf(d) * dayWidth + (i ? 10 : 7);
        })
        .attr('y', 35)
        .text(function(d) {
            return ['июль', 'август', 'сентябрь'][d.month - 7];
        });
}

function drawDays() {
    dom.dayColumns = dom.dataContainer.selectAll('.dayColumn')
            .data(timelineData)
        .enter().append('g')
            .classed('dayColumn', true)
            .attr('transform', function(d, i) {
                return 'translate(' + i * dayWidth + ',0)';
            });

    dom.backgrounds = dom.backs.selectAll('.background')
            .data(timelineData)
        .enter().append('g')
            .classed('background', true)
            .attr('transform', function(d, i) {
                return 'translate(' + i * dayWidth + ',0)';
            });

    dom.topBackgrounds = dom.backgrounds.append('rect')
        .classed('topBackground', true)
        .attr('y', 0)
        .attr('width', dayWidth)
        .attr('height', 100);

    dom.bottomBackgrounds = dom.backgrounds.append('rect')
        .classed('bottomBackground', true)
        .attr('y', 0)
        .attr('width', dayWidth)
        .attr('height', 100);

    dom.backs.append('rect')
        .classed('bottomBackground leftBackground', true)
        .attr('y', 0);
    dom.backs.append('rect')
        .classed('topBackground leftBackground', true)
        .attr('y', 0);
    dom.backs.append('rect')
        .classed('bottomBackground rightBackground', true)
        .attr('y', 0);
    dom.backs.append('rect')
        .classed('topBackground rightBackground', true)
        .attr('y', 0);


    dom.dayColumns.append('path')
        .attr('d', function(d, i) {
            var res = 'M0,0 ';
            res += 'Q' + 0.5 * dayWidth + ',0 ';
            res += 0.5 * dayWidth + ',-' + getHeight(d) + ' ';
            res += 'Q' + 0.5 * dayWidth + ',0 ';
            res += dayWidth + ',0';
            return res;
        });

    drawDonates(dom.dayColumns.append('g')
        .classed('flower', true)
        .attr('transform', function(d, i) {
            return 'translate(' + 0.5 * dayWidth + ',-' + getHeight(d) + ')';
        }));

    dom.foregrounds = dom.foregs.selectAll('.foreground')
            .data(timelineData)
        .enter().append('rect')
        .classed('foreground', true)
        .attr('x', function(d, i) { return i * dayWidth; })
        .attr('width', dayWidth)
        .on('mouseover', selectDay)
        .on('mouseout', deselectDay)
        .on('click', selectDay);
}

function drawDonates(p) {
    p.selectAll('.donate')
            .data(function(d) {return d.donates; })
        .enter().append('line')
            .classed('donate', true)
            .attr('stroke', function(d) {
                return d.male ? '#4BC6D6' : '#D64BA1';
            })
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', function(d) {
                return Math.pow(d.sum / maxDonate, 1 / 6) * maxDonateLength;
            })
            .attr('opacity', function(d) {
                return Math.pow(d.sum / maxDonate, 1 / 2) * 0.3 + 0.7;
            })
            .attr('transform', function(d, i) {
                var count = d3.select(this.parentNode).datum().donates.length;
                return 'rotate(' + (donateStartAngle + 360 / count * i) + ')';
            });
}


function selectDay(dToSelect) {
    d3.selectAll('.selected')
        .classed('selected', false);

    dom.dayColumns.filter(function(d) { return d == dToSelect; })
        .classed('selected', true);
    dom.backgrounds.filter(function(d) { return d == dToSelect; })
        .classed('selected', true);
    dom.days.filter(function(d) { return d == dToSelect; })
        .classed('selected', true);
}

function deselectDay(dToSelect) {
    dom.dayColumns.filter(function(d) { return d == dToSelect; })
        .classed('selected', false);
    dom.backgrounds.filter(function(d) { return d == dToSelect; })
        .classed('selected', false);
    dom.days.filter(function(d) { return d == dToSelect; })
        .classed('selected', false);
}


var oldX = 0;
function zoomHandler() {
    var newX = d3.event.translate[0];
    console.log(newX);
    if (oldX == newX)
        return;

    if (newX > dX || width + 2 * dX < document.getElementById('graph').offsetWidth) {
        newX = dX;
    }
    else if (document.getElementById('graph').offsetWidth - width - dX - newX > 0) {
        newX = document.getElementById('graph').offsetWidth - width - dX;
    }
    oldX = newX;

    dom.svg.select("#everything").attr("transform", "translate(" + newX + ",0)");
    zoom.translate([oldX, 0]);
}