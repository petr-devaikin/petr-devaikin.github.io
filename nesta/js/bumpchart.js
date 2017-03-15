function Bumpchart(svg, xValues, data, p) {
	var params = {
		leftMargin: 100,
		rightMargin: 100,
		topMargin: 20,
		graphWidth: 500,
		minColor: '#d73027',
		zeroColor: '#ccc',
		maxColor: '#1a9850',
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
	var maxChange = 0;

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

		var hintsArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__hints', true);

		var xScale = d3.scaleLinear()
			.domain([0, xValues.length - 1])
			.range([0, params.graphWidth]);

		var yScale = d3.scaleLinear()
			.domain([0.5, params.showTop + 0.5])
			.range([0, graphHeight]);

		function showHints(line) {
			function setHintPosition(d, i) {
				if (d === undefined)
					return '';
				return 'translate({0},{1})'.format(xScale(i), (d.position <= params.showTop) ? yScale(d.position) : yScale(params.showTop + 0.5));
			}

			var hints = hintsArea.selectAll('.vis__hints__hint').data(line.values);
			hints
				.attr('transform', setHintPosition)
				.attr('visibility', 'visible');
			hints.select('text').text(function(d) { return d.position; });

			hints.exit().attr('visibility', 'hidden');
			var newHints = hints.enter().append('g')
				.classed('vis__hints__hint', true)
				.attr('transform', setHintPosition)
				.attr('visibility', function(d) { return d !== undefined; });
			
			newHints.append('path')
				.attr('d', 'M0 0 L-5 -5 L-20 -5 L-20 -20 L20 -20 L20 -5 L5 -5 Z');
			newHints.append('text')
				.attr('dy', -5)
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'after-edge')
				.text(function(d) { return d.position; });

			graphArea.selectAll('.vis__graph__line')
				.classed('blured', function(d) { return d != line; });

			function blurTicks(axis, names) {
				axis.selectAll('.tick')
					.classed('blured', function(d, i) { return names[d] != line; })
			}
			blurTicks(leftAxis, leftNames);
			blurTicks(rightAxis, rightNames);
		}

		function hideHints() {
			hintsArea.selectAll('.vis__hints__hint').attr('visibility', 'hidden');
			graphArea.selectAll('.vis__graph__line.blured').classed('blured', false);

			leftAxis.selectAll('.tick.blured').classed('blured', false)
			rightAxis.selectAll('.tick.blured').classed('blured', false)
		}

		var leftNames = [];
		var rightNames = [];

		// find names for the left and the right axes
		// calculate change for all lines and max change
		data.forEach(function(d) {
			if (d.values[0] !== undefined && d.values[0].position <= params.showTop)
				leftNames[d.values[0].position] = d;
			if (d.values[xValues.length - 1] !== undefined && d.values[xValues.length - 1].position <= params.showTop)
				rightNames[d.values[xValues.length - 1].position] = d;

			d.maxPosition = Math.min.apply(null, Object.keys(d.values).map(function(k) { return d.values[k].position; }));

			d.change = d.values[Object.keys(d.values)[0]].position - d.values[d.values.length - 1].position;
			if (d.maxPosition <= params.showTop)
				maxChange = Math.max(Math.abs(d.change), maxChange);
		});
		data = data.filter(function(d) { return d.maxPosition <= params.showTop; });
		
		// color scale
		var colorScale = d3.scaleLinear()
			.domain([-1, 0, 1])
			.range([params.minColor, params.zeroColor, params.maxColor]);


		function drawAxes() {
			bottomAxis.call(d3.axisBottom(xScale).ticks(xValues.length)
				.tickFormat(function(d, i) { return xValues[d]; }));
			leftAxis.call(d3.axisLeft(yScale).ticks(params.showTop)
				.tickFormat(function(d, i) { return leftNames[d].name + ' - ' + d; }));
			rightAxis.call(d3.axisRight(yScale).ticks(params.showTop)
				.tickFormat(function(d, i) { return d + ' - ' + rightNames[d].name; }));

			function setTickColor(axis, names) {
				axis.selectAll('.tick').select('text')
					.attr('fill', function(d, i) { return colorScale(names[i + 1].change / maxChange); });
			}
			setTickColor(leftAxis, leftNames);
			setTickColor(rightAxis, rightNames);
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
				.on('mouseover', showHints)
				.on('mouseout', hideHints);
		}
		drawData();


		function drawLegend() {
			var legend = svg.append('g')
				.classed('vis__legend', true)
				.attr('transform', 'translate({0},{1})'.format(params.graphWidth + params.leftMargin + params.rightMargin + 50, params.topMargin));

			var legendWidth = params.legendSteps * params.legendSampleWidth;
			legend.append('rect')
				.classed('vis__legend__bg', true)
				.attr('width', 20 + legendWidth)
				.attr('height', params.legendSampleWidth + 30);

			var steps = [];
			for (var i = 0; i < params.legendSteps; i++)
				steps.push(-maxChange + maxChange * 2 / (params.legendSteps - 1) * i);

			legend.selectAll('vis__legend__sample').data(steps).enter().append('rect')
				.classed('vis__legend__sample', true)
				.attr('fill', function(d) { return colorScale(d / maxChange); })
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

