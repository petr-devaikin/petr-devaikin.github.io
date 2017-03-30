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
		legendSteps: 3,
		legendSampleWidth: 20,
		legendRoundTo: 0,
		showLeftAxis: true,
		showRightAxis: true,
		showBottomAxis: true,
		showPositions: 20,
		positionHeight: 15,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var graphHeight = params.showPositions * params.positionHeight;
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
			.domain([0.5, params.showPositions + 0.5])
			.range([0, graphHeight]);

		// hints

		function showHints(line) {
			function setHintPosition(d, i) {
				if (d === undefined)
					return '';

				var yPosition = yScale(d.position);
				if (yPosition < 0) yPosition = 0;
				else if (yPosition > graphHeight) yPosition = graphHeight;
				return 'translate({0},{1})'.format(xScale(i), yPosition);
			}

			var hints = hintsArea.selectAll('.vis__hints__hint').data(line.values);
			hints
				.attr('transform', setHintPosition)
				.attr('visibility', function(d) { return (d !== undefined) ? 'visible' : 'hidden'; });
			hints.select('text').text(function(d) { return (d !== undefined) ? d.position : ''; });

			hints.exit().remove();
			var newHints = hints.enter().append('g')
				.classed('vis__hints__hint', true)
				.attr('transform', setHintPosition)
				.attr('visibility', function(d) { return (d !== undefined) ? 'visible' : 'hidden'; });
			
			newHints.append('path')
				.attr('d', 'M0 0 L-5 -5 L-20 -5 L-20 -20 L20 -20 L20 -5 L5 -5 Z');
			newHints.append('text')
				.attr('dy', -5)
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'after-edge')
				.text(function(d) { return (d !== undefined) ? d.position : ''; });

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
			if (d.values[0] !== undefined)
				leftNames[d.values[0].position] = d;
			if (d.values[xValues.length - 1] !== undefined)
				rightNames[d.values[xValues.length - 1].position] = d;

			d.change = d.values[Object.keys(d.values)[0]].position - d.values[d.values.length - 1].position;
			maxChange = Math.max(maxChange, Math.abs(d.change));
		});
		
		// color scale
		var colorSteps = [];
		for (var i = 0; i < params.legendSteps + 1; i++) {
			colorSteps.push(d3.interpolateRgb(params.minColor, params.zeroColor)(i / (params.legendSteps)));
		}
		for (var i = 1; i < params.legendSteps + 1; i++) {
			colorSteps.push(d3.interpolateRgb(params.zeroColor, params.maxColor)(i / (params.legendSteps)));
		}

		var colorScale = d3.scaleQuantize()
			.domain([-maxChange, maxChange])
			.range(colorSteps);


		function drawAxes() {
			bottomAxis.call(d3.axisBottom(xScale).ticks(xValues.length)
				.tickFormat(function(d, i) { return xValues[d]; }));
			leftAxis.call(d3.axisLeft(yScale).ticks(params.showPositions)
				.tickFormat(function(d, i) {
					if (leftNames[d] !== undefined)
						return leftNames[d].name + ' - ' + d;
					else
						return '';
				}));
			rightAxis.call(d3.axisRight(yScale).ticks(params.showPositions)
				.tickFormat(function(d, i) {
					if (rightNames[d] !== undefined)
						return d + ' - ' + rightNames[d].name;
					else
						return '';
				}));

			
			function setTickColorAndHover(axis, names) {
				axis.selectAll('.tick')
					.on('mouseover', function(d, i) { showHints(names[d]); })
					.on('mouseout', function(d, i) { hideHints(); })
					.select('text')
						.attr('fill', function(d, i) {
							if (names[d] !== undefined) 
								return colorScale(names[d].change);
							else
								return colorScale(0);
						});
			}
			setTickColorAndHover(leftAxis, leftNames);
			setTickColorAndHover(rightAxis, rightNames);
			
		}


		function drawData() {
			function drawLines(selection) {
				selection.attr('points', function(line) {
					var res = '';
					line.values.forEach(function(x, i) {
						res += ' ' + xScale(i) + ' ' + yScale(x.position);
					});
					return res;
				});
			}

			var points = graphArea.selectAll('.vis__graph__line').data(data)
				.call(drawLines);

			points.enter().append('polyline')
				.classed('vis__graph__line', true)
				.attr('stroke', function(d) { return colorScale(d.change); })
				.on('mouseover', showHints)
				.on('mouseout', hideHints)
				.call(drawLines);
		}


		function drawLegend() {
			var legend = svg.append('g')
				.classed('vis__legend', true)
				.attr('transform', 'translate({0},{1})'.format(params.graphWidth + params.leftMargin + params.rightMargin + 50, params.topMargin));

			var legendWidth = (2 * params.legendSteps + 1) * params.legendSampleWidth;
			legend.append('rect')
				.classed('vis__legend__bg', true)
				.attr('width', 20 + legendWidth)
				.attr('height', params.legendSampleWidth + 50);

			legend.append('text') // <-- FIX
				.attr('transform', 'translate({0},{1})'.format(10, 20))
				.text('Change in ranking');

			var steps = [];
			console.log(maxChange);
			for (var i = -params.legendSteps; i <= params.legendSteps; i++)
				steps.push(maxChange / (params.legendSteps + 0.5) * i);

			legend.selectAll('vis__legend__sample').data(steps).enter().append('rect')
				.classed('vis__legend__sample', true)
				.attr('fill', function(d) { return colorScale(d); })
				.attr('width', 20)
				.attr('height', 20)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format(10 + i * 20, 30);
				});

			legend.selectAll('vis__legend__tips').data(steps).enter().append('text')
				.classed('vis__legend__tips', true)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format((i + 0.5) * 20 + 10, 30 + 20);
				})
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'before-edge')
				.text(function(d) { return Math.round(d); });
			

				// zoom behaviour

				var t = d3.zoomIdentity.translate(0, 0).scale(1);
				var zoom = d3.zoom()
					.scaleExtent([1, 1])
					.translateExtent([[0, 0], [0, (data.length - params.showPositions) * params.positionHeight + svg.node().clientHeight]])
					.on('zoom', zoomed);

				

				function zoomed() {
					var transform = d3.zoomTransform(this);
					var shift = -transform.y / params.positionHeight;
					console.log(zoom.translateExtent());
					console.log(transform.y);
					yScale.domain([0.5 + shift, 0.5 + params.showPositions + shift]);

					drawAxes();
					drawData();
				}

				svg.call(zoom.transform, t);
				svg.call(zoom);
		}
		if (params.showLegend)
			drawLegend();
	}
}

