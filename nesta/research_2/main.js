var TOP_MARGIN = 50,
	LEFT_MARGIN = 250,
	RIGHT_MARGIN = 50,
	BOTTOM_MARGIN = 30,
	HEIGHT = 800,
	WIDTH = 800
	;

var COLOR_SCALE = d3.scaleLinear()
	.domain([0, 1])
	.range(['#f7fcfd', '#00441b']);


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

	topAxis = canvas.append('g')
		.classed('m-camvas__top-axis', true)
		.attr('transform', 'translate('+LEFT_MARGIN+','+TOP_MARGIN+')');

	bottomAxis = canvas.append('g')
		.classed('m-camvas__bottom-axis', true)
		.attr('transform', 'translate('+LEFT_MARGIN+','+(HEIGHT-BOTTOM_MARGIN)+')');
}

function addHint() {
	hint = graph.append('g')
		.classed('m-canvas__graph__hint', true)
		.attr('visibility', 'hidden');
	hint.append('text').attr('y', 30).attr('x', 5);
}

function setAxis() {
	xScale = d3.scaleLinear()
		.domain([-0.5, lads.length - 0.5])
		.range([0, WIDTH-LEFT_MARGIN-RIGHT_MARGIN]);

	yScale = d3.scaleLinear()
		.domain([-0.5, topics.length - 0.5])
		.range([0, HEIGHT-BOTTOM_MARGIN-TOP_MARGIN]);

	leftAxis.call(d3.axisLeft(yScale)
		.ticks(topics.length)
		.tickFormat(function(d, i) { return topics[i]; })
	);

	topAxis.call(d3.axisTop(xScale)
		.ticks(lads.length)
		.tickFormat(function(d, i) { return lads[i]; })
	);

	bottomAxis.call(d3.axisBottom(xScale)
		.ticks(lads.length)
		.tickFormat(function(d, i) { return lads[i]; })
	);
}

function drawData(data) {
	var cellWidth = xScale(1) - xScale(0);
	var cellHeight = yScale(1) - yScale(0);

	graph.selectAll('.data-col').data(data).enter()
		.append('g')
			.attr('transform', function(d, i) {
				return 'translate('+xScale(i - 0.5)+',0)';
			})
		.each(function(d, i) {
			d3.select(this).selectAll('.data-cell').data(function(dd, ii) { return dd.values; }).enter()
				.append('rect')
					.attr('x', 0)
					.attr('y', function(dd, ii) { return yScale(ii - 0.5); })
					.attr('width', cellWidth)
					.attr('height', cellHeight)
					.attr('fill', function(d) {
						return COLOR_SCALE(d / maxValue);
					})
					.attr('stroke', '#fff')
					.attr('stroke-width', 1)
					.on('mousemove', function(dd, ii) {
						var coords = d3.mouse(graph.node());

						hint
							.attr('visibility', 'visible')
							.attr('transform', 'translate('+coords[0]+','+coords[1]+')');
						hint.select('text').text(dd);

						topAxis.selectAll('.tick')
							.filter(function (ddd, iii) { return iii == i;})
							.classed('selected', true);
						bottomAxis.selectAll('.tick')
							.filter(function (ddd, iii) { return iii == i;})
							.classed('selected', true);
						leftAxis.selectAll('.tick')
							.filter(function (ddd, iii) { return iii == ii;})
							.classed('selected', true);
					})
					.on('mouseout', function(dd, ii) {
						hint.attr('visibility', 'hidden');
						d3.selectAll('.selected')
							.classed('selected', false);
					});
		});

	addHint();
	updateKey();
}

// KEY

function updateKey() {
	var values = new Array(maxValue);
	for (var i = 0; i < maxValue; i++)
		values[i] = i;

	d3.select('.m-key').selectAll('.val').data(values).enter()
		.append('div')
			.classed('val', true)
			.style('border-left-color', function(d) { return COLOR_SCALE(d / maxValue); })
			.text(function(d) { return d; });
}


// DATA LOADING
var topics = [];
var lads = [];

var maxValue = 0;

function processData(data) {
	for (var prop in data[0])
		if (prop != 'lad_name' && data[0].hasOwnProperty(prop)) {
			topics.push(prop);
		}

	for (var i = 0; i < data.length; i++) {
		var d = data[i];
		lads.push(d['lad_name']);
		d.values = [];
		for (var j = 0; j < topics.length; j++) {
			d.values.push(d[topics[j]]);
			maxValue = Math.max(maxValue, d[topics[j]]);
		}
	}

	setAxis();
	drawData(data);
}

function loadData() {
	d3.csv('engineering_tech_lad.csv', processData);
}


// COMMANDS

setLayout();
loadData();