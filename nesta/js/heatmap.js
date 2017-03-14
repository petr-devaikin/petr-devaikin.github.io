if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
				? args[number]
				: match
			;
		});
	};
}


function Heatmap(svg, xValues, yValues, data, p) {
	var params = {
		leftMargin: 100,
		topMargin: 10,
		cellWidth: 10,
		cellHeight: 10,
		yValuesName: '',
		minValue: 0,
		maxValue: 1,
		minColor: '#f7fcfd',
		maxColor: '#00441b',
		rotateYAxisTips: true,
		showLegend: true,
		legendSteps: 7,
		legendSampleWidth: 20,
		legendRoundTo: 0,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var colorScale = d3.scaleLinear()
		.domain([params.minValue, params.maxValue])
		.range([params.minColor, params.maxColor]);

	var graphWidth = xValues.length * params.cellWidth,
		graphHeight = yValues.length * params.cellHeight;

	this.draw = function() {
		svg.attr('class', 'vis vis--heatmap')

		var leftAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		var bottomAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin + graphHeight))
			.classed('vis__axis vis__axis--bottom', true);

		var graphArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__graph', true);

		var xScale = d3.scaleLinear()
			.domain([-0.5, xValues.length - 0.5])
			.range([0, graphWidth]);

		var yScale = d3.scaleLinear()
			.domain([-0.5, yValues.length - 0.5])
			.range([0, graphHeight]);

		var hint,
			rowHighlight,
			columnHighlight;

		function drawAxes() {
			leftAxis.selectAll('vis__axis__tip').data(yValues).enter().append('text')
				.classed('vis__axis__tip', true)
				.attr('alignment-baseline', 'middle')
				.attr('text-anchor', 'end')
				.attr('transform', function(d, i) { return 'translate({0},{1})'.format(-5, yScale(i)); })
				.text(function(d) { return d; });

			var bottomTips = bottomAxis.selectAll('vis__axis__tip').data(xValues).enter().append('text')
				.classed('vis__axis__tip', true)
				.text(function(d) { return d; });

			if (params.rotateYAxisTips)
				bottomTips
					.attr('text-anchor', 'end')
					.attr('alignment-baseline', 'middle')
					.attr('transform', function(d, i) { return 'translate({0},{1}) rotate(-90)'.format(xScale(i), 5); });
			else
				bottomTips
					.attr('text-anchor', 'middle')
					.attr('alignment-baseline', 'before-edge')
					.attr('transform', function(d, i) { return 'translate({0},{1})'.format(xScale(i), 5); });
		}
		drawAxes();

		function drawHint() {
			hint = graphArea.append('g')
				.classed('vis__graph__hint', true)
				.attr('visibility', 'visible');
			hint.append('rect');
			hint.append('text')
				.attr('dy', 10)
				.attr('alignment-baseline', 'before-edge');

			rowHighlight = graphArea.insert('rect', ':first-child')
				.classed('vis__graph__highlight', true)
				.attr('x', 0)
				.attr('height', params.cellHeight)
				.attr('visibility', 'hidden');

			columnHighlight = graphArea.insert('rect', ':first-child')
				.classed('vis__graph__highlight', true)
				.attr('width', params.cellWidth)
				.attr('visibility', 'hidden');
		}

		function showHint(d) {
			hint
				.attr('transform', 'translate({0},{1})'.format(xScale(d.x), yScale(d.y + 0.5)))
				.attr('visibility', 'visible');
			var text = hint.select('text').text(d.value);

			var bbox = text.node().getBBox();
			hint.select('rect')
				.attr('x', bbox.x - 4)
				.attr('y', bbox.y - 2)
				.attr('width', bbox.width + 8)
				.attr('height', bbox.height + 4);

			rowHighlight
				.attr('visibility', 'visible')
				.attr('width', xScale(d.x + 0.5))
				.attr('y', yScale(d.y - 0.5));

			columnHighlight
				.attr('visibility', 'visible')
				.attr('x', xScale(d.x - 0.5))
				.attr('y', yScale(d.y + 0.5))
				.attr('height', graphHeight - yScale(d.y + 0.5));

			leftAxis.selectAll('.vis__axis__tip').filter(function(dd, i) { return i == d.y; } ).classed('selected', true);
			bottomAxis.selectAll('.vis__axis__tip').filter(function(dd, i) { return i == d.x; }).classed('selected', true);
		}

		function hideHint() {
			hint.attr('visibility', 'hidden');
			leftAxis.select('.vis__axis__tip.selected').classed('selected', false);
			bottomAxis.select('.vis__axis__tip.selected').classed('selected', false);
		}

		function drawData() {
			var cells = graphArea.selectAll('.vis__graph__cell').data(data)
				.enter().append('g')
					.classed('vis__graph__cell', true)
					.attr('transform', function(d) {
						return 'translate({0},{1})'.format(xScale(d.x) - params.cellWidth / 2, yScale(d.y) - params.cellHeight / 2);
					});


			cells.append('rect')
				.classed('vis__graph__cell__bg', true)
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', params.cellWidth)
				.attr('height', params.cellHeight);

			cells.append('rect')
				.classed('vis__graph__cell__value', true)
				.attr('x', 1)
				.attr('y', 1)
				.attr('width', params.cellWidth - 2)
				.attr('height', params.cellHeight - 2)
				.attr('fill', function(d) { return colorScale(d.value); });

			cells
				.on('mouseover', showHint)
				.on('mouseout', hideHint);

		}
		drawData();
		drawHint();

		function hideHint() {
			hint.attr('visibility', 'hidden');
			leftAxis.select('.vis__axis__tip.selected').classed('selected', false);
			bottomAxis.select('.vis__axis__tip.selected').classed('selected', false);
		}

		function drawLegend() {
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
		}
		if (params.showLegend)
			drawLegend();
	}
}

