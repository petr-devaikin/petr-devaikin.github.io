var dayWidth = 30;
var maxColumnHeight = 250;
var maxDonateLength = 50;
var maxSumValue = 0;
var maxDonate = 0;
var donateStartAngle = 15;

window.onresize = fit;

var dom = {}

function initDom() {
    dom.container = d3.select('#container');
    dom.dataContainer = d3.select('#data');
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

    fit();
}

function fit() {
    var width = timelineData.length * dayWidth;
    var allWidth = document.getElementById('graph').offsetWidth;
    var allHeight = document.getElementById('graph').offsetHeight;
    var dX = (allWidth - width) / 2;
    var dY = allHeight - (allHeight - maxColumnHeight - maxDonateLength) / 2;
    dom.container.attr('transform', 'translate(' + dX + ', ' + dY + ')');

    dom.leftAxis.attr('x2', -dX);
    dom.rightAxis.attr('x1', width);
    dom.rightAxis.attr('x2', allWidth - dX);
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
}

function drawDays() {
    dom.dayColumns = dom.dataContainer.selectAll('.dayColumn')
            .data(timelineData)
        .enter().append('g')
            .classed('dayColumn', true);

    dom.dayColumns.append('path')
        .attr('d', function(d, i) {
            var res = 'M' + (i * dayWidth) + ',0 ';
            res += 'Q' + ((i + 0.5) * dayWidth) + ',0 ';
            res += ((i + 0.5) * dayWidth) + ',-' + getHeight(d) + ' ';
            res += 'Q' + ((i + 0.5) * dayWidth) + ',0 ';
            res += ((i + 1) * dayWidth) + ',0';
            return res;
        });

    drawDonates(dom.dayColumns.append('g')
        .classed('flower', true)
        .attr('transform', function(d, i) {
            return 'translate(' + ((i + 0.5) * dayWidth) + ',-' + getHeight(d) + ')';
        }));
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