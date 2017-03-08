var TOP_MARGIN = 20,
	LEFT_MARGIN = 150,
	RIGHT_MARGIN = 150,
	BOTTOM_MARGIN = 30,
	HEIGHT = 500,
	WIDTH = 1000,
	RATE_MIN = 1,
	RATE_MAX = 20
	;


var YEARS = [2013, 2014, 2015, 2016];

var COLOR_SCALE = d3.scaleLinear()
	.domain([-1, 0, 1])
	.range(['red', '#aaa', 'green']);


var canvas = d3.select('.m-canvas');

var graph,
	hint,
	xAxis,
	yAxis;

var xScale,
	yScale;


function setLayout() {
	graph = canvas.append('g')
		.classed('m-canvas__graph', true)
		.attr('transform', 'translate('+LEFT_MARGIN+','+TOP_MARGIN+')');

	leftAxis = canvas.append('g')
		.classed('m-camvas__left-axis', true)
		.attr('transform', 'translate('+LEFT_MARGIN+','+TOP_MARGIN+')');

	rightAxis = canvas.append('g')
		.classed('m-camvas__right-axis', true)
		.attr('transform', 'translate('+(WIDTH-RIGHT_MARGIN)+','+TOP_MARGIN+')');

	xAxis = canvas.append('g')
		.classed('m-camvas__x-axis', true)
		.attr('transform', 'translate('+LEFT_MARGIN+','+(HEIGHT-BOTTOM_MARGIN)+')');
}

function addHint() {
	hint = graph.append('g')
		.classed('m-canvas__graph__hint', true)
		.attr('visibility', 'hidden');
	hint.append('text').attr('y', -10).attr('x', 5);
}


function setAxis(data) {
	filterValues = getFilterValues();

	var yearMin = YEARS[0],
		yearMax = YEARS[YEARS.length - 1];

	xScale = d3.scaleLinear()
		.domain([yearMin, yearMax])
		.range([0, WIDTH-LEFT_MARGIN-RIGHT_MARGIN]);

	yScale = d3.scaleLinear()
		.domain([RATE_MIN, filterValues.maxRate+0.5])
		.range([0, HEIGHT-BOTTOM_MARGIN-TOP_MARGIN]);

	xAxis.html('');
	xAxis.append('rect').attr('x', 0).attr('y', 0).attr('width', xScale(yearMax)).attr('height', BOTTOM_MARGIN)
		.attr('fill', '#fff').attr('stroke', 'none');
	xAxis.call(d3.axisBottom(xScale).ticks(yearMax-yearMin+1, 'd'));

	function findDataByYearRate(year, rate) {
		return data.find(function(d) {
			return d[year + '_r'] == rate;
		})
	}

	leftAxis.call(d3.axisLeft(yScale)
		.ticks(filterValues.maxRate - RATE_MIN + 1)
		.tickFormat(function(d, i) { return findDataByYearRate(yearMin, d)['Meetup Tag'] + ' - ' + d; }));

	function colorLabel(el, d, year) {
		var line = findDataByYearRate(year, d);
		if (filterValues.color == 'trends') {
			var v = 0;
			if (maxChange != 0) {
				v = (line[YEARS[0] + '_r'] - line[YEARS[YEARS.length - 1] + '_r']) / maxChange, 0.3;
				v = Math.sign(v) * Math.sqrt(Math.abs(v));
			}

			el.select('text').attr('fill', COLOR_SCALE(v));
		}
	}

	leftAxis.selectAll('.tick').each(function(d) { colorLabel(d3.select(this), d, yearMin); });

	rightAxis.call(d3.axisRight(yScale)
		.ticks(filterValues.maxRate - RATE_MIN + 1)
		.tickFormat(function(d, i) { return d + ' - ' + findDataByYearRate(yearMax, d)['Meetup Tag']; }));

	rightAxis.selectAll('.tick').each(function(d) { colorLabel(d3.select(this), d, yearMax); });
}

function drawData(data) {
	var filterValues = getFilterValues();

	graph.html('');

	function mousemove(d) {
		var coords = d3.mouse(graph.node());

		/*var year = Math.round(xScale.invert(coords[0]));
		console.log(year);*/

		var line = graph.selectAll('.line').filter(function(d2) { return d2 != d; });
		
		line.attr('opacity', 0.2);

		d3.select(this).selectAll('.line-value')
			.attr('visibility', 'visible');

		hint
			.attr('visibility', 'visible')
			.attr('transform', 'translate('+coords[0]+','+coords[1]+')')
			.select('text').text(d['Meetup Tag']);
	}

	function mouseout(d) {
		graph.selectAll('.line')
			.attr('opacity', 1);

		graph.selectAll('.line-value')
			.attr('visibility', 'hidden');

		hint.attr('visibility', 'hidden');
	}

	var lines = graph.selectAll('.line').data(data)
		.enter()
			.append('g')
				.classed('line', true)
				.on('mousemove', mousemove)
				.on('mouseout', mouseout);

	lines.append('polyline')
		.attr('stroke-linejoin', 'round')
		.attr('stroke-width', function(d) {
			return 1 + 100 / filterValues.maxRate / filterValues.maxRate * (filterValues.maxRate - d.minRate + 1);
		})
		.attr('stroke', function(d, i) {
			if (filterValues.color == 'rainbow')
				return d3.interpolateRainbow(i / data.length);
			else if (filterValues.color == 'bw')
				return 'rgba(150,150,150,.5)';
			else {
				var v = 0;
				if (maxChange != 0) {
					v = (d[YEARS[0] + '_r'] - d[YEARS[YEARS.length - 1] + '_r']) / maxChange, 0.3;
					v = Math.sign(v) * Math.sqrt(Math.abs(v));
				}

				return COLOR_SCALE(v);
			}

		})
		.attr('points', function(d) {
			var coords = YEARS.map(function(year) {
				return xScale(year) + ' ' + yScale(d[year + '_r']);
			});
			return	coords.join(' ');
		});

	
	lines.each(function(d) {
		for (var i = 1; i < YEARS.length - 1; i++) {
			var year = YEARS[i];

			var value = d3.select(this).append('g')
				.classed('line-value', true)
				.attr('transform', 'translate('+xScale(year)+','+yScale(d[year + '_r'])+')')
				.attr('visibility', 'hidden');

			value.append('circle')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', 13)
				.attr('fill', 'rgba(255, 255, 255, .8)')
				.attr('stroke', '#000')
				.attr('stroke-width', 1);

			value.append('text')
				.attr('x', 0)
				.attr('y', 4)
				.attr('text-anchor', 'middle')
				.attr('font-size', 14)
				.text(d[year + '_r']);

			/*value.append('text')
				.attr('x', 15)
				.attr('y', 27)
				.attr('font-size', 10)
				.attr('opacity', .5)
				.text(d[year]);*/
		}
	});

	addHint();
}

// FILTERS

function getFilterValues() {
	return {
		source: d3.select('.m-filters__source').node().value,
		maxRate: parseInt(d3.select('.m-filters__top:checked').node().value),
		color: d3.select('.m-filters__color:checked').node().value
	}
}

function setupFilters() {
	var filters = d3.select('.m-filters');
	filters.selectAll('input,select').on('change', function() {
		console.log(getFilterValues());
		loadData();
	});
}

// DATA LOADING

var maxChange = 0;

function filterData(data, maxItems) {
	return data.filter(function(d) {
		var rates = YEARS.map(function(year) { return d[year + '_r']; });
		d.minRate = Math.min.apply(null, rates);
		d.maxRate = Math.max.apply(null, rates);
		if (Math.abs(d.maxRate - d.minRate) > maxChange)
			maxChange = Math.abs(d.maxRate - d.minRate);
		return d.minRate <= maxItems;
	});
}

function processData(data) {
	// rename years
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < YEARS.length; j++) {
			var index = YEARS.slice(0, j+1).join('_');
			data[i][YEARS[j]] = data[i][index];
			if (j != 0)
				delete data[i][index];
		}
	}

	// calculate rates by year
	function setRate(data, fieldName) {
		data.sort(function(a, b) {
			return b[fieldName] - a[fieldName];
		});
		for (var i=0; i<data.length; i++)
			data[i][fieldName+'_r'] = i + 1;
	}

	for (var i = YEARS.length - 1; i >= 0; i--)
		setRate(data, YEARS[i]);

	// filter data
	var filteredData = filterData(data, getFilterValues().maxRate);
	console.log(filteredData);

	setAxis(filteredData);
	drawData(filteredData);
}

function loadData() {
	d3.csv(getFilterValues().source, processData);
}


// COMMANDS

setLayout();
setupFilters();
loadData();