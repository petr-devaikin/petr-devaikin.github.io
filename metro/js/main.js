window.onload = initialize;
//window.onresize = fit;

var dom = {}
var state = {}

function fit() {
    var width = document.getElementById('mapContainer').offsetWidth,
        height = document.getElementById('mapContainer').offsetHeight;

    dom.metro.attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');
    d3.select('#moscow').attr('transform', 'translate(' + width/2 + ',' + height/2 + '), scale(0.54, 0.579)');
}

function inidDom() {
    dom.svg = d3.select('#mapContainer').select('svg');
    dom.metro = dom.svg.select('#metro');
}

function initialize() {
    inidDom();
    processStations();

    state.years = getPeriod();
    drawTimescale();
    //addStations();
    addWalkability();
    connectStations();
    //drawRoads();

    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([0.3, 8])
        .on("zoom", zoomHandler);

    dom.svg
        .call(zoom) // delete this line to disable free zooming
        .call(zoom.event);

    fit();
    selectYear(0);
}

function zoomHandler() {
    //console.log(d3.event.scale);
    dom.svg.select("#everything").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

//drawing
function drawTimescale() {
    var width = d3.select('#timelineContainer').node().offsetWidth;
    var margin = 10;
    var yearWidth = (width - 2 * margin) / state.years.length;
    var weight = 7;

    dom.years = d3.select('#timelineContainer svg').selectAll('.year')
            .data(state.years)
        .enter().append('g')
            .classed('year', true)
            .attr('transform', function(d, i) {
                return 'translate(' + (margin + (i) * yearWidth + weight / 2) + ',10)';
            })
            .on('click', function(d, i) { selectYear(i); });

    dom.years.append('path')        
        .style('color', function(d) {
            return getColourOfTheYear(d, state.years[0], state.years[state.years.length - 1]);
        })
        .attr('d', function(d, i) {
            if (d == state.years[0])
                return 'M'+weight+',0 L'+weight+','+weight*2+' L0,'+weight*2+', L0,0 Z';
            else
                return 'M'+weight+',0 L'+weight+','+2*weight+' L0,'+2*weight+', L0,'+weight+' ' +
                    'L'+(-yearWidth+weight)+','+weight+' L'+(-yearWidth+weight)+',0 Z';
        })
        .attr('fill', function(d) {
            return getColourOfTheYear(d, state.years[0], state.years[state.years.length - 1]);
        })
        .attr('stroke', function(d) {
            return getColourOfTheYear(d, state.years[0], state.years[state.years.length - 1]);
        });

    dom.years.append('rect')
        .attr('x', -yearWidth+weight-1)
        .attr('y', 1)
        .attr('width', 5)
        .attr('height', weight - 2);

    dom.years.append('text')
        .text(function(d) { return d; })
        .attr('y', 2*weight + 5)
        .attr('x', 2*weight + 1)
        .attr('transform', 'rotate(45)');
}

function drawRoads() {
    d3.select('#roads').select('#mkad').selectAll('road')
            .data(mkad_km)
        .enter().append('line')
            .classed('road', true)
            .attr('x1', function(d) { return toPixelPosition(d[2], d[1]).x; })
            .attr('y1', function(d) { return toPixelPosition(d[2], d[1]).y; })
            .attr('x2', function(d, i) {
                return toPixelPosition(mkad_km[(i + 1) % mkad_km.length][2], mkad_km[(i + 1) % mkad_km.length][1]).x;
            })
            .attr('y2', function(d, i) {
                return toPixelPosition(mkad_km[(i + 1) % mkad_km.length][2], mkad_km[(i + 1) % mkad_km.length][1]).y;
            });
}

function addStations() {
    dom.stations = dom.metro.select('#stationsContainer').selectAll('.station')
            .data(coords)
        .enter().append('g')
            .classed('station', true);
    
    dom.stations.append('circle')
        .attr('fill', function(d) {
            return getColourOfTheYear(d.year, state.years[0], state.years[state.years.length - 1]);
        })
        .attr('r', toPixelSize(0.1))
        .attr('cx', function(d) { return d.position.x; })
        .attr('cy', function(d) { return d.position.y; });
}

function addWalkability() {
    dom.walk5min = dom.metro.select('#walk5min').selectAll('.walkArea')
            .data(coords)
        .enter().append('g')
            .classed('walkArea', true);
    dom.walk10min = dom.metro.select('#walk10min').selectAll('.walkArea')
            .data(coords)
        .enter().append('g')
            .classed('walkArea', true);
    dom.walk15min = dom.metro.select('#walk15min').selectAll('.walkArea')
            .data(coords)
        .enter().append('g')
            .classed('walkArea', true);
    dom.walk20min = dom.metro.select('#walk20min').selectAll('.walkArea')
            .data(coords)
        .enter().append('g')
            .classed('walkArea', true);
    
    dom.walk5min.append('circle')
        .attr('fill', function(d) {
            return getColourOfTheYear(d.year, state.years[0], state.years[state.years.length - 1]);
        })
        .attr('r', toPixelSize(0.333))
        .attr('cx', function(d) { return d.position.x; })
        .attr('cy', function(d) { return d.position.y; })
        .append('svg:title')
            .text(function(d) { return d[1] + '. ' + d[2]; });
    dom.walk10min.append('circle')
        .attr('fill', function(d) {
            return getColourOfTheYear(d.year, state.years[0], state.years[state.years.length - 1]);
        })
        .attr('r', toPixelSize(0.667))
        .attr('cx', function(d) { return d.position.x; })
        .attr('cy', function(d) { return d.position.y; })
        .append('svg:title')
            .text(function(d) { return d[1] + '. ' + d[2]; });
    dom.walk15min.append('circle')
        .attr('fill', function(d) {
            return getColourOfTheYear(d.year, state.years[0], state.years[state.years.length - 1]);
        })
        .attr('r', toPixelSize(1))
        .attr('cx', function(d) { return d.position.x; })
        .attr('cy', function(d) { return d.position.y; })
        .append('svg:title')
            .text(function(d) { return d[1] + '. ' + d[2]; });
    dom.walk20min.append('circle')
        .attr('fill', function(d) {
            return getColourOfTheYear(d.year, state.years[0], state.years[state.years.length - 1]);
        })
        .attr('r', toPixelSize(1.333))
        .attr('cx', function(d) { return d.position.x; })
        .attr('cy', function(d) { return d.position.y; })
        .append('svg:title')
            .text(function(d) { return d[1] + '. ' + d[2]; });
}

function connectStations() {
    var newLines = getLines();
    dom.lines = dom.metro.select('#connectionsContainer').selectAll('.line')
            .data(newLines)
        .enter().append('g')
            .classed('line', true);

    dom.connections = dom.lines.selectAll('.connection')
            .data(function(d) { return d.connections; })
        .enter().append('line')
            .classed('connection', true)
            .attr('stroke', function(d) {
                return getColourOfTheYear(d.year, state.years[0], state.years[state.years.length - 1]);
            })
            .attr('x1', function(d) { return d.start.position.x; })
            .attr('y1', function(d) { return d.start.position.y; })
            .attr('x2', function(d) { return d.stop.position.x; })
            .attr('y2', function(d) { return d.stop.position.y; });
}


// events
function selectYear(year) {
    state.currentYear = year;

    dom.years.filter(function(d) { return d > state.years[year]; })
        .classed('selected', false);
    dom.years.filter(function(d) { return d <= state.years[year]; })
        .classed('selected', true);

    //var stationsToHide = dom.stations.filter(function(d) {return d.year > state.years[year]; });
    //var stationsToShow = dom.stations.filter(function(d) { return d.year <= state.years[year]; });

    var walksToHide = d3.selectAll('.walkArea').filter(function(d) {return d.year > state.years[year]; });
    var walksToShow = d3.selectAll('.walkArea').filter(function(d) { return d.year <= state.years[year]; });

    var connectionsToHide = dom.connections.filter(function(d) {
        return d.year > state.years[year] || (d.until < state.years[year] && d.until !== undefined);
    });
    var connectionsToShow = dom.connections.filter(function(d) {
        return d.year <= state.years[year] && (d.until >= state.years[year] || d.until === undefined);
    });

    //stationsToHide.attr('opacity', 0);
    walksToHide.attr('display', 'none');
    connectionsToHide.attr('display', 'none');
    //stationsToShow.attr('opacity', 1);
    walksToShow.attr('display', 'inline');
    connectionsToShow.attr('display', 'inline');
}

document.addEventListener("keydown", function(e) {
    if (e.keyCode === 37 && state.currentYear > 0) selectYear(state.currentYear - 1);
    else if (e.keyCode === 39 && state.currentYear < state.years.length - 1) selectYear(state.currentYear + 1);
});