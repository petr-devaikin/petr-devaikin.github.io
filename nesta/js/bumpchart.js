function Bumpchart(svg, xValues, data, p) {
	var params = {
		leftMargin: 100,
		topMargin: 10,
		graphWidth: 500,
		minColor: 'red',
		zeroColor: '#ccc',
		maxColor: 'green',
		rotateYAxisTips: true,
		showLegend: true,
		legendSteps: 7,
		legendSampleWidth: 20,
		legendRoundTo: 0,
		showLeftAxis: true,
		showRightAxis: true,
		showTopAxis: false,
		showBottomAxis: true,
		showTop: 10,
		positionHeight: 15,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var graphHeight = params.showTop * params.positionHeight;

	this.draw = function() {
		svg.attr('class', 'vis vis--bumpchart');

		function addClipRect() {
			svg.append('defs').append('clipPath').attr('id', 'graph-clip')
				.append('rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', params.graphWidth)
					.attr('height', graphHeight);
		}
		addClipRect();

		var leftAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		var rightAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin + params.graphWidth, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		var bottomAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin + graphHeight))
			.classed('vis__axis vis__axis--bottom', true);

		var graphArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__graph', true)
			.attr('clip-path', 'url(#graph-clip)');

		var xScale = d3.scaleLinear()
			.domain([0, xValues.length - 1])
			.range([0, params.graphWidth]);

		var yScale = d3.scaleLinear()
			.domain([0.5, params.showTop + 0.5])
			.range([0, graphHeight]);

		var hint;

		var leftNames = [];
		var rightNames = [];

		var maxChange = 0;

		// find names for the left and the right axes
		// calculate change for all lines and max change
		data.forEach(function(d) {
			if (d.values[0] !== undefined && d.values[0].position <= params.showTop)
				leftNames[d.values[0].position] = d.name;
			if (d.values[xValues.length - 1] !== undefined && d.values[xValues.length - 1].position <= params.showTop)
				rightNames[d.values[xValues.length - 1].position] = d.name;

			d.change = d.values[Object.keys(d.values)[0]].position - d.values[d.values.length - 1].position;
			maxChange = Math.max(Math.abs(d.change), maxChange);
		});
		
		var colorScale = d3.scaleLinear()
			.domain([-1, 0, 1])
			.range([params.minColor, params.zeroColor, params.maxColor]);


		function drawAxes() {
			bottomAxis.call(d3.axisBottom(xScale).ticks(xValues.length)
				.tickFormat(function(d, i) { return xValues[d]; }));
			leftAxis.call(d3.axisLeft(yScale).ticks(params.showTop)
				.tickFormat(function(d, i) { return leftNames[d] + ' - ' + d; }));
			rightAxis.call(d3.axisRight(yScale).ticks(params.showTop)
				.tickFormat(function(d, i) { return d + ' - ' + rightNames[d]; }));
		}
		drawAxes();


		function drawData() {
			graphArea.selectAll('.vis__graph__line').data(data).enter().append('polyline')
				.classed('vis__graph__line', true)
				.attr('stroke', function(d) { return colorScale(d.change / maxChange); })
				.attr('points', function(line) {
					var res = '';
					line.values.forEach(function(x, i) {
						res += ' ' + xScale(i) + ' ' + yScale(x.position);
					});
					return res;
				})
		}
		drawData();

		function drawLegend() {
			/*
			var legend = svg.append('g')
				.classed('vis__legend', true)
				.attr('transform', 'translate({0},{1})'.format(graphWidth + params.leftMargin + 50, params.topMargin));

			var legendWidth = params.legendSteps * params.legendSampleWidth;
			legend.append('rect')
				.classed('vis__legend__bg', true)
				.attr('width', 20 + legendWidth)
				.attr('height', params.legendSampleWidth + 30);

			var steps = [];
			for (var i = 0; i < params.legendSteps; i++)
				steps.push(params.minValue + (params.maxValue - params.minValue) / (params.legendSteps - 1) * i);

			legend.selectAll('vis__legend__sample').data(steps).enter().append('rect')
				.classed('vis__legend__sample', true)
				.attr('fill', function(d) { return colorScale(d); })
				.attr('width', params.legendSampleWidth)
				.attr('height', params.legendSampleWidth)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format(10 + i * params.legendSampleWidth, 10);
				});

			var multiplicator = Math.pow(10, params.legendRoundTo);

			legend.selectAll('vis__legend__tips').data(steps).enter().append('text')
				.classed('vis__legend__tips', true)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format((i + 0.5) * params.legendSampleWidth + 10, 10 + params.legendSampleWidth);
				})
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'before-edge')
				.text(function(d) { return Math.round(d * multiplicator) / multiplicator; });
			*/
		}
		if (params.showLegend)
			drawLegend();
	}
}

